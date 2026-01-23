<script>
  import { CONFIG, calculateTax } from "./lib/calculator.js";
  import BandPanel from "./components/BandPanel.svelte";
  import InfoTip from "./components/InfoTip.svelte";

  const formatGBP = (value) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0
    }).format(value);
  const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;

  let form = {
    employmentIncome: 60000,
    selfEmploymentIncome: 0,
    otherIncome: 0,
    dividends: 5000,
    capitalGains: 10000,
    capitalGainsResidential: 0,
    pensionContributions: 0,
    scottishResident: false,
    eisInvestment: 0,
    seisInvestment: 0,
    vctInvestment: 0
  };
  let view = "home";
  const goTo = (next) => {
    view = next;
  };

  const bandNote =
    "Band classification is simplified (standard allowances, no savings interest). It is deterministic and updates as inputs change.";

  const fieldList = [
    "employmentIncome",
    "selfEmploymentIncome",
    "otherIncome",
    "dividends",
    "capitalGains",
    "capitalGainsResidential",
    "pensionContributions",
    "eisInvestment",
    "seisInvestment",
    "vctInvestment"
  ];

  $: results = calculateTax(form);

  $: fieldErrors = fieldList.reduce((errors, key) => {
    if (form[key] < 0) {
      errors[key] = "Enter a non-negative amount.";
    }
    return errors;
  }, {});

  $: taxYearError = !CONFIG.taxYear ? "Tax year required to classify bands." : "";

  const applyBand = (amount, bandAvailable) => {
    const used = Math.min(amount, bandAvailable);
    return {
      used,
      remaining: Math.max(0, amount - used),
      bandRemaining: Math.max(0, bandAvailable - used)
    };
  };

  const buildIncomeBands = (currentResults) => {
    const taxableIncome = currentResults.totals.taxableNonSavings;
    const pension = Number(form.pensionContributions) || 0;
    if (taxableIncome <= 0) {
      return {
        title: "Income tax band",
        empty: "No taxable income entered yet."
      };
    }

    if (form.scottishResident) {
      const scottishMeta = [
        { name: "Starter rate", rate: 0.19, lower: 12571, upper: 15397 },
        { name: "Basic rate", rate: 0.2, lower: 15398, upper: 27491 },
        { name: "Intermediate rate", rate: 0.21, lower: 27492, upper: 43662 },
        { name: "Higher rate", rate: 0.42, lower: 43663, upper: 75000 },
        { name: "Advanced rate", rate: 0.45, lower: 75001, upper: 125140 },
        { name: "Top rate", rate: 0.48, lower: 125141, upper: null }
      ];
      let remaining = taxableIncome;
      let lowerLimit = 0;
      const entries = CONFIG.scotlandBands.reduce((acc, band, index) => {
        if (remaining <= 0) {
          return acc;
        }
        const bandSize =
          band.limit === Number.POSITIVE_INFINITY ? remaining : band.limit - lowerLimit;
        const used = Math.min(remaining, bandSize);
        if (used > 0) {
          const meta = scottishMeta[index];
          acc.push({
            label: meta.name,
            rate: formatPercent(meta.rate),
            amount: formatGBP(used),
            range: meta.upper
              ? `GBP ${meta.lower.toLocaleString("en-GB")} to GBP ${meta.upper.toLocaleString("en-GB")}`
              : `Over GBP ${meta.lower.toLocaleString("en-GB")}`
          });
        }
        remaining -= used;
        lowerLimit = band.limit;
        return acc;
      }, []);
      return {
        title: "Income tax bands (Scotland)",
        entries,
        effectiveRate: formatPercent(
          taxableIncome > 0 ? currentResults.totals.incomeTax / taxableIncome : 0
        ),
        why: `Your taxable income after allowances is ${formatGBP(
          taxableIncome
        )}, so it spans the bands listed above.`,
        changes: [
          "Pension contributions (reduce taxable income).",
          "Additional earnings or self-employment income.",
          "Changing Scottish residency status."
        ]
      };
    }

    const basicBand = CONFIG.basicRateBand + pension;
    const higherBandLimit = CONFIG.higherRateThreshold - basicBand;
    const basicUsed = Math.min(taxableIncome, basicBand);
    const higherUsed = Math.min(
      Math.max(0, taxableIncome - basicBand),
      Math.max(0, higherBandLimit)
    );
    const additionalUsed = Math.max(0, taxableIncome - basicBand - higherBandLimit);

    const entries = [];
    if (basicUsed > 0) {
      entries.push({
        label: "Basic rate",
        rate: "20%",
        amount: formatGBP(basicUsed),
        range: `GBP 12,571 to GBP ${(CONFIG.personalAllowance + basicBand).toLocaleString("en-GB")}`
      });
    }
    if (higherUsed > 0) {
      entries.push({
        label: "Higher rate",
        rate: "40%",
        amount: formatGBP(higherUsed),
        range: `GBP ${(CONFIG.personalAllowance + basicBand + 1).toLocaleString("en-GB")} to GBP ${CONFIG.higherRateThreshold.toLocaleString("en-GB")}`
      });
    }
    if (additionalUsed > 0) {
      entries.push({
        label: "Additional rate",
        rate: "45%",
        amount: formatGBP(additionalUsed),
        range: `Over GBP ${CONFIG.higherRateThreshold.toLocaleString("en-GB")}`
      });
    }

    return {
      title: "Income tax bands (UK)",
      entries,
      effectiveRate: formatPercent(
      taxableIncome > 0 ? currentResults.totals.incomeTax / taxableIncome : 0
      ),
      why: `Your taxable income after allowances is ${formatGBP(
        taxableIncome
      )}, so it spans the bands listed above.`,
      changes: [
        "Pension contributions (reduce taxable income).",
        "Additional earnings or self-employment income.",
        "Changing Scottish residency status."
      ]
    };
  };

  const buildDividendBands = (currentResults) => {
    const taxableDividends = currentResults.totals.taxableDividends;
    const pension = Number(form.pensionContributions) || 0;
    if (taxableDividends <= 0) {
      return {
        title: "Dividend tax bands",
        empty: "No taxable dividends entered yet."
      };
    }

    const basicBand = CONFIG.basicRateBand + pension;
    const higherBandLimit = CONFIG.higherRateThreshold - basicBand;
    const basicUsedByIncome = Math.min(currentResults.totals.taxableNonSavings, basicBand);
    const higherUsedByIncome = Math.min(
      Math.max(0, currentResults.totals.taxableNonSavings - basicBand),
      Math.max(0, higherBandLimit)
    );
    let basicRemaining = Math.max(0, basicBand - basicUsedByIncome);
    let higherRemaining = Math.max(0, higherBandLimit - higherUsedByIncome);

    let remaining = taxableDividends;
    const entries = [];
    const basicUsed = Math.min(remaining, basicRemaining);
    if (basicUsed > 0) {
      entries.push({
        label: "Basic dividend rate",
        rate: "8.75%",
        amount: formatGBP(basicUsed),
        range: "Within basic rate band"
      });
    }
    remaining -= basicUsed;
    const higherUsed = Math.min(remaining, higherRemaining);
    if (higherUsed > 0) {
      entries.push({
        label: "Higher dividend rate",
        rate: "33.75%",
        amount: formatGBP(higherUsed),
        range: "Within higher rate band"
      });
    }
    remaining -= higherUsed;
    if (remaining > 0) {
      entries.push({
        label: "Additional dividend rate",
        rate: "39.35%",
        amount: formatGBP(remaining),
        range: "Above higher rate band"
      });
    }

    return {
      title: "Dividend tax bands",
      entries,
      effectiveRate: formatPercent(
        taxableDividends > 0 ? currentResults.totals.dividendTax / taxableDividends : 0
      ),
      why: `Your taxable dividends are ${formatGBP(
        taxableDividends
      )}, so they fall into the bands listed above.`,
      changes: [
        "Changes in taxable income (affects available basic rate band).",
        "Dividend allowance changes.",
        "Additional dividend income."
      ]
    };
  };

  const buildCgtBands = (currentResults) => {
    const pension = Number(form.pensionContributions) || 0;
    const gains = Number(form.capitalGains) || 0;
    const residentialGains = Number(form.capitalGainsResidential) || 0;
    const aeaRemaining = Math.max(0, CONFIG.cgtAnnualExempt - gains);
    const nonResAfter = Math.max(0, gains - CONFIG.cgtAnnualExempt);
    const resAfter = Math.max(0, residentialGains - aeaRemaining);
    const taxableGains = nonResAfter + resAfter;

    if (taxableGains <= 0) {
      return {
        title: "Capital gains tax bands",
        empty: "No taxable capital gains entered yet."
      };
    }

    const basicBand = CONFIG.basicRateBand + pension;
    const taxableIncomeForCgt =
      currentResults.totals.taxableNonSavings + currentResults.totals.taxableDividends;
    let basicRemaining = Math.max(0, basicBand - taxableIncomeForCgt);

    const nonResBand = applyBand(nonResAfter, basicRemaining);
    basicRemaining = nonResBand.bandRemaining;
    const resBand = applyBand(resAfter, basicRemaining);

    const basicTotal = nonResBand.used + resBand.used;
    const higherTotal = nonResBand.remaining + resBand.remaining;

    const entries = [];
    if (basicTotal > 0) {
      entries.push({
        label: "Lower CGT rate",
        rate: "18%",
        amount: formatGBP(basicTotal),
        range: "Within basic rate band"
      });
    }
    if (higherTotal > 0) {
      entries.push({
        label: "Higher CGT rate",
        rate: "24%",
        amount: formatGBP(higherTotal),
        range: "Above basic rate band"
      });
    }

    return {
      title: "Capital gains tax bands",
      entries,
      effectiveRate: formatPercent(
        taxableGains > 0 ? currentResults.totals.capitalGainsTax / taxableGains : 0
      ),
      why: `Your taxable gains are ${formatGBP(
        taxableGains
      )}, so they span the CGT bands listed above.`,
      changes: [
        "Changes in taxable income (affects available basic rate band).",
        "Annual exempt amount usage.",
        "Additional gains."
      ]
    };
  };

  $: bandPanels = results
    ? [buildIncomeBands(results), buildDividendBands(results), buildCgtBands(results)]
    : [];

  const assumptions = [
    `Tax year modeled: ${CONFIG.taxYear}. Rates are for England/Wales/NI unless Scottish resident is selected.`,
    "Personal allowance is tapered above GBP 100,000 and fully removed at GBP 125,140.",
    "Gross personal pension contributions reduce adjusted net income and extend the basic rate band.",
    "Dividend allowance is GBP 500 and applied after personal allowance offsets dividends.",
    "Capital gains annual exempt amount is GBP 3,000 and is applied to non-residential gains first.",
    "From 6 April 2025, CGT rates assumed at 18% (basic) and 24% (higher) for residential and other assets.",
    "EIS/SEIS/VCT reliefs are applied only against income tax liability; unused relief is shown but not carried back here.",
    "VCT relief rate assumed at 20% for 2025/26; confirm with current HMRC rules.",
    "Scottish Income Tax bands are applied only to non-savings income; dividends and CGT still use UK bands in this model."
  ];

  const sources = [
    {
      label: "Income Tax rates and Personal Allowance",
      href: "https://www.gov.uk/income-tax-rates"
    },
    {
      label: "Scottish Income Tax rates 2025/26",
      href: "https://www.gov.uk/scottish-rate-income-tax"
    },
    {
      label: "Dividend allowance and rates",
      href: "https://www.gov.uk/tax-on-dividends"
    },
    {
      label: "CGT annual exempt amount",
      href: "https://www.gov.uk/capital-gains-tax/allowances"
    },
    {
      label: "CGT rates from 6 April 2025",
      href: "https://www.gov.uk/capital-gains-tax/rates"
    }
  ];

  const ukBands = [
    {
      band: "Personal allowance",
      income: `Up to GBP ${CONFIG.personalAllowance.toLocaleString("en-GB")}`,
      rate: "0%"
    },
    {
      band: "Basic rate",
      income: `GBP ${CONFIG.personalAllowance.toLocaleString("en-GB")} to GBP ${(CONFIG.personalAllowance + CONFIG.basicRateBand).toLocaleString("en-GB")}`,
      rate: "20%"
    },
    {
      band: "Higher rate",
      income: `GBP ${(CONFIG.personalAllowance + CONFIG.basicRateBand + 1).toLocaleString("en-GB")} to GBP ${CONFIG.higherRateThreshold.toLocaleString("en-GB")}`,
      rate: "40%"
    },
    {
      band: "Additional rate",
      income: `Over GBP ${CONFIG.higherRateThreshold.toLocaleString("en-GB")}`,
      rate: "45%"
    }
  ];

  const scotlandBands = [
    { band: "Personal allowance", income: "Up to GBP 12,570", rate: "0%" },
    { band: "Starter rate", income: "GBP 12,571 to GBP 15,397", rate: "19%" },
    { band: "Basic rate", income: "GBP 15,398 to GBP 27,491", rate: "20%" },
    { band: "Intermediate rate", income: "GBP 27,492 to GBP 43,662", rate: "21%" },
    { band: "Higher rate", income: "GBP 43,663 to GBP 75,000", rate: "42%" },
    { band: "Advanced rate", income: "GBP 75,001 to GBP 125,140", rate: "45%" },
    { band: "Top rate", income: "Over GBP 125,140", rate: "48%" }
  ];

  const ratesUpdated = "2026-01-22";
</script>

<header class="site-header">
  <div class="container">
    <nav class="top-nav">
      <div class="brand">Tax Liability Explorer</div>
      <div class="nav-links">
        <button class={`nav-button ${view === "home" ? "active" : ""}`} on:click={() => goTo("home")}>
          Home
        </button>
        <button
          class={`nav-button ${view === "explorer" ? "active" : ""}`}
          on:click={() => goTo("explorer")}
        >
          Tax explorer
        </button>
      </div>
    </nav>
    <div class="trust-row">
      <span class="pill">Tax year {CONFIG.taxYear || "Not set"}</span>
      <span class="pill">Sources: GOV.UK</span>
      <span class="pill warning">Educational only — not tax advice</span>
    </div>
    <h1>See your UK tax clearly — and how EIS, SEIS, and VCT reliefs change it</h1>
    <p class="lede">
      A calm, transparent view of income tax, dividend tax, and capital gains tax with reliefs
      explained in plain English. Simple inputs first, detail on demand.
    </p>
  </div>
</header>

<main class="container">
  {#if view === "home"}
    <section class="card home-card">
      <h2>Start with a simple tax snapshot</h2>
      <p>
        Enter your income, dividends, and gains to see which tax bands apply and how reliefs reduce
        your income tax liability. The model is deterministic and based on stated assumptions.
      </p>
      <ul class="notes">
        <li>Shows income tax, dividend tax, and capital gains tax bands as you type.</li>
        <li>Explains marginal vs. effective rates in plain English.</li>
        <li>Highlights which part of your income tax can be relieved.</li>
      </ul>
      <button class="primary" type="button" on:click={() => goTo("explorer")}>
        Open tax explorer
      </button>
    </section>
  {:else}
    <div class="layout">
      <section class="flow">
        {#if taxYearError}
          <div class="error-banner">{taxYearError}</div>
        {/if}
        <section class="card step" aria-labelledby="step-1">
          <div class="step-header">
            <div class="step-number">1</div>
            <div>
              <h2 id="step-1">Income snapshot</h2>
              <p class="step-subtitle">Start with the basics. We use this to place you in the right bands.</p>
            </div>
          </div>
          <div class="grid">
            <div class="field">
            <label for="employmentIncome">
              Employment income
              <InfoTip label="Employment income guidance">
                <p><strong>Enter:</strong> your gross taxable pay from employment (before tax), for the tax year.</p>
                <p><strong>Do not enter:</strong> dividends, self-employed profits, or limited company profits.</p>
                <p><strong>Example:</strong> You were paid GBP 42,000 in salary/PAYE this year → enter 42,000.</p>
              </InfoTip>
            </label>
              <input
                id="employmentIncome"
                type="number"
                min="0"
                step="100"
                bind:value={form.employmentIncome}
              />
              {#if fieldErrors.employmentIncome}
                <p class="error">{fieldErrors.employmentIncome}</p>
              {/if}
            </div>
            <div class="field">
            <label for="selfEmploymentIncome">
              Self-employment income
              <InfoTip label="Self-employment income guidance">
                <p><strong>Enter:</strong> your taxable profit as a sole trader or partner (after allowable expenses).</p>
                <p><strong>Do not enter:</strong> limited company salary or dividends. Those go in Employment or Dividends.</p>
                <p><strong>Example:</strong> Sole trader profit GBP 18,500 after expenses → enter 18,500.</p>
              </InfoTip>
            </label>
              <input
                id="selfEmploymentIncome"
                type="number"
                min="0"
                step="100"
                bind:value={form.selfEmploymentIncome}
              />
              {#if fieldErrors.selfEmploymentIncome}
                <p class="error">{fieldErrors.selfEmploymentIncome}</p>
              {/if}
            </div>
            <div class="field">
              <label for="otherIncome">Other taxable income</label>
              <input
                id="otherIncome"
                type="number"
                min="0"
                step="100"
                bind:value={form.otherIncome}
              />
              {#if fieldErrors.otherIncome}
                <p class="error">{fieldErrors.otherIncome}</p>
              {/if}
            </div>
            <div class="field">
            <label for="dividends">
              Dividends
              <InfoTip label="Dividend income guidance">
                <p><strong>Enter:</strong> dividends received from UK companies, including your own limited company.</p>
                <p><strong>Do not enter:</strong> salary, interest, or capital gains. Do not enter share sale proceeds.</p>
                <p><strong>Example:</strong> You took GBP 8,000 in dividends from your Ltd → enter 8,000.</p>
              </InfoTip>
            </label>
              <input id="dividends" type="number" min="0" step="100" bind:value={form.dividends} />
              {#if fieldErrors.dividends}
                <p class="error">{fieldErrors.dividends}</p>
              {/if}
            </div>
            <div class="field">
            <label for="capitalGains">
              Capital gains (non-residential assets)
              <InfoTip label="Capital gains guidance">
                <p><strong>Enter:</strong> taxable gain (sale price minus costs and allowable losses).</p>
                <p><strong>Do not enter:</strong> the full sale price or gross proceeds.</p>
                <p><strong>Example:</strong> Shares sold for GBP 30,000, cost GBP 20,000 → gain GBP 10,000.</p>
              </InfoTip>
            </label>
              <input
                id="capitalGains"
                type="number"
                min="0"
                step="100"
                bind:value={form.capitalGains}
              />
              {#if fieldErrors.capitalGains}
                <p class="error">{fieldErrors.capitalGains}</p>
              {/if}
            </div>
            <div class="field">
              <label for="capitalGainsResidential">Capital gains (residential property)</label>
              <input
                id="capitalGainsResidential"
                type="number"
                min="0"
                step="100"
                bind:value={form.capitalGainsResidential}
              />
              {#if fieldErrors.capitalGainsResidential}
                <p class="error">{fieldErrors.capitalGainsResidential}</p>
              {/if}
            </div>
            <div class="field">
            <label for="pensionContributions">
              Gross personal pension contributions
              <InfoTip label="Pension contributions guidance">
                <p><strong>Enter:</strong> gross personal contributions (relief at source) for the year.</p>
                <p><strong>Do not enter:</strong> employer contributions or contributions already deducted via salary sacrifice.</p>
                <p><strong>Example:</strong> You paid GBP 8,000 net and provider added GBP 2,000 → enter 10,000.</p>
              </InfoTip>
            </label>
              <input
                id="pensionContributions"
                type="number"
                min="0"
                step="100"
                bind:value={form.pensionContributions}
              />
              <p class="helper">Relief at source only; extends basic rate band.</p>
              {#if fieldErrors.pensionContributions}
                <p class="error">{fieldErrors.pensionContributions}</p>
              {/if}
            </div>
            <div class="field checkbox">
              <label for="scottishResident">Scottish resident (income tax bands only)</label>
              <div class="checkbox-row">
                <input
                  id="scottishResident"
                  type="checkbox"
                  bind:checked={form.scottishResident}
                />
              </div>
            </div>
          </div>
          <div class="band-panel-slot">
            <BandPanel title="Band classification panel" panels={bandPanels} note={bandNote} />
          </div>
        </section>

        <section class="card step" aria-labelledby="step-2">
          <div class="step-header">
            <div class="step-number">2</div>
            <div>
              <h2 id="step-2">Relief options</h2>
              <p class="step-subtitle">Add qualifying investments and see how much income tax relief they unlock.</p>
            </div>
          </div>
          <div class="grid">
            <div class="field">
              <label for="eisInvestment">EIS amount</label>
              <input id="eisInvestment" type="number" min="0" step="100" bind:value={form.eisInvestment} />
              <p class="helper">30% relief up to GBP 1,000,000.</p>
              {#if fieldErrors.eisInvestment}
                <p class="error">{fieldErrors.eisInvestment}</p>
              {/if}
            </div>
            <div class="field">
              <label for="seisInvestment">SEIS amount</label>
              <input id="seisInvestment" type="number" min="0" step="100" bind:value={form.seisInvestment} />
              <p class="helper">50% relief up to GBP 200,000.</p>
              {#if fieldErrors.seisInvestment}
                <p class="error">{fieldErrors.seisInvestment}</p>
              {/if}
            </div>
            <div class="field">
              <label for="vctInvestment">VCT amount</label>
              <input id="vctInvestment" type="number" min="0" step="100" bind:value={form.vctInvestment} />
              <p class="helper">20% relief up to GBP 200,000.</p>
              {#if fieldErrors.vctInvestment}
                <p class="error">{fieldErrors.vctInvestment}</p>
              {/if}
            </div>
          </div>
          <div class="note-strip">
            <strong>Remember:</strong> Reliefs offset income tax only. CGT stays payable in this model.
          </div>
        </section>

        <section class="card step" aria-labelledby="step-3">
          <div class="step-header">
            <div class="step-number">3</div>
            <div>
              <h2 id="step-3">Understand the calculation</h2>
              <p class="step-subtitle">Expand the pieces you care about. Start simple, then go deeper.</p>
            </div>
          </div>
          <details>
            <summary>How we calculated your income tax</summary>
            <div class="detail-grid">
              <div>
                <p class="detail-label">Adjusted net income</p>
                <p class="detail-value">{formatGBP(results.totals.adjustedNetIncome)}</p>
              </div>
              <div>
                <p class="detail-label">Personal allowance used</p>
                <p class="detail-value">{formatGBP(results.totals.personalAllowance)}</p>
              </div>
              <div>
                <p class="detail-label">Taxable non-savings income</p>
                <p class="detail-value">{formatGBP(results.totals.taxableNonSavings)}</p>
              </div>
              <div>
                <p class="detail-label">Taxable dividends</p>
                <p class="detail-value">{formatGBP(results.totals.taxableDividends)}</p>
              </div>
            </div>
            <p class="detail-note">
              Scottish bands apply to non-savings income only. Dividend tax and CGT use UK bands in this model.
            </p>
          </details>
          <details>
            <summary>Relief mechanics (EIS / SEIS / VCT)</summary>
            <ul class="notes">
              <li>Reliefs offset your income tax liability in the tax year (EIS/SEIS can be carried back).</li>
              <li>Qualifying shares must be held for 3 years (EIS/SEIS) or 5 years (VCT) to avoid clawback.</li>
              <li>Additional CGT reliefs exist for EIS/SEIS but are not modelled here.</li>
            </ul>
          </details>
          <details>
            <summary>Rates snapshot</summary>
            <div class="rates-grid">
              <div>
                <h3>England/Wales/NI income tax bands</h3>
                <table class="rates-table">
                  <thead>
                    <tr>
                      <th>Band</th>
                      <th>Taxable income</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each ukBands as band}
                      <tr>
                        <td>{band.band}</td>
                        <td>{band.income}</td>
                        <td>{band.rate}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
              <div>
                <h3>Scottish income tax bands</h3>
                <table class="rates-table">
                  <thead>
                    <tr>
                      <th>Band</th>
                      <th>Taxable income</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each scotlandBands as band}
                      <tr>
                        <td>{band.band}</td>
                        <td>{band.income}</td>
                        <td>{band.rate}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
          <details>
            <summary>Assumptions & sources</summary>
            <ul class="notes">
              {#each assumptions as item}
                <li>{item}</li>
              {/each}
            </ul>
            <p class="meta">Rates updated on {ratesUpdated}.</p>
            <ul class="notes">
              {#each sources as source}
                <li><a href={source.href} target="_blank" rel="noopener">{source.label}</a></li>
              {/each}
            </ul>
          </details>
        </section>
      </section>

      <aside class="summary">
        <div class="summary-card">
          <p class="summary-title">Your tax summary</p>
          <div class="summary-row">
            <span>Baseline tax</span>
            <strong>{formatGBP(results.totals.baselineTax)}</strong>
          </div>
          <div class="summary-row">
            <span>Relief used</span>
            <strong>{formatGBP(results.totals.reliefUsed)}</strong>
          </div>
          <div class="summary-row total">
            <span>Residual tax after reliefs</span>
            <strong>{formatGBP(results.totals.residualTax)}</strong>
          </div>

          <div class="summary-block">
            <p class="summary-label">Relief context</p>
            <p class="helper">Reliefs reduce income tax only; dividend tax and CGT bands stay the same.</p>
          </div>

          <BandPanel title="Band classification panel" panels={bandPanels} note={bandNote} compact />
        </div>
      </aside>
    </div>
  {/if}
</main>

<footer class="site-footer">
  <div class="container">
    <p>High-level model only. Always confirm with HMRC guidance or a qualified adviser.</p>
  </div>
</footer>
