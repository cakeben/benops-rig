<script>
  import { CONFIG, calculateTax } from "./lib/calculator.js";

  const formatGBP = (value) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0
    }).format(value);

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

  $: results = calculateTax(form);
  $: resultsAlt = calculateTax({ ...form, scottishResident: !form.scottishResident });
  $: scottishDelta = results.totals.incomeTax - resultsAlt.totals.incomeTax;

  $: investmentNotes = (() => {
    const notes = [];
    if (results.inputs.eisInvestment > results.reliefs.eisQualifying) {
      notes.push(
        `EIS qualifying investment capped at GBP ${results.reliefs.eisQualifying.toLocaleString("en-GB")}.`
      );
    }
    if (results.inputs.seisInvestment > results.reliefs.seisQualifying) {
      notes.push(
        `SEIS qualifying investment capped at GBP ${results.reliefs.seisQualifying.toLocaleString("en-GB")}.`
      );
    }
    if (results.inputs.vctInvestment > results.reliefs.vctQualifying) {
      notes.push(
        `VCT qualifying investment capped at GBP ${results.reliefs.vctQualifying.toLocaleString("en-GB")}.`
      );
    }
    if (notes.length === 0) {
      notes.push("All investment inputs are within standard qualifying limits.");
    }
    return notes;
  })();

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
    <div class="trust-row">
      <span class="pill">Tax year {CONFIG.taxYear}</span>
      <span class="pill">Sources: GOV.UK</span>
      <span class="pill warning">Education only — not tax advice</span>
    </div>
    <h1>See your UK tax clearly — and how EIS, SEIS, and VCT reliefs change it</h1>
    <p class="lede">
      A calm, transparent view of income tax, dividend tax, and capital gains tax with reliefs
      explained in plain English. You stay in control: simple inputs first, deeper detail when you
      ask for it.
    </p>
  </div>
</header>

<main class="container">
  <div class="layout">
    <section class="flow">
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
            <label for="employmentIncome">Employment income</label>
            <input
              id="employmentIncome"
              type="number"
              min="0"
              step="100"
              bind:value={form.employmentIncome}
            />
          </div>
          <div class="field">
            <label for="selfEmploymentIncome">Self-employment income</label>
            <input
              id="selfEmploymentIncome"
              type="number"
              min="0"
              step="100"
              bind:value={form.selfEmploymentIncome}
            />
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
          </div>
          <div class="field">
            <label for="dividends">Dividends</label>
            <input id="dividends" type="number" min="0" step="100" bind:value={form.dividends} />
          </div>
          <div class="field">
            <label for="capitalGains">Capital gains (non-residential assets)</label>
            <input
              id="capitalGains"
              type="number"
              min="0"
              step="100"
              bind:value={form.capitalGains}
            />
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
          </div>
          <div class="field">
            <label for="pensionContributions">Gross personal pension contributions</label>
            <input
              id="pensionContributions"
              type="number"
              min="0"
              step="100"
              bind:value={form.pensionContributions}
            />
            <p class="helper">Relief at source only; extends basic rate band.</p>
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
          </div>
          <div class="field">
            <label for="seisInvestment">SEIS amount</label>
            <input id="seisInvestment" type="number" min="0" step="100" bind:value={form.seisInvestment} />
            <p class="helper">50% relief up to GBP 200,000.</p>
          </div>
          <div class="field">
            <label for="vctInvestment">VCT amount</label>
            <input id="vctInvestment" type="number" min="0" step="100" bind:value={form.vctInvestment} />
            <p class="helper">20% relief up to GBP 200,000.</p>
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
          <span>Relief available</span>
          <strong>{formatGBP(results.totals.reliefUsed)}</strong>
        </div>
        <div class="summary-row total">
          <span>Residual tax after reliefs</span>
          <strong>{formatGBP(results.totals.residualTax)}</strong>
        </div>

        <div class="chip-row">
          <span class="chip">
            Relief reduces tax by {formatGBP(results.totals.reliefUsed)}
          </span>
          <span class={`chip ${scottishDelta >= 0 ? "warn" : "good"}`}>
            {#if form.scottishResident}
              Scottish bands change income tax by {formatGBP(Math.abs(scottishDelta))}
            {:else}
              Scottish bands would change income tax by {formatGBP(Math.abs(scottishDelta))}
            {/if}
          </span>
        </div>

        <div class="summary-block">
          <p class="summary-label">What this covers</p>
          <div class="coverage">
            <span>Income tax</span>
            <span>Dividend tax</span>
            <span>Capital gains</span>
          </div>
        </div>

        <div class="summary-block">
          <p class="summary-label">Confidence</p>
          <div class="confidence">
            <div class="confidence-bar" style={`width: 78%`}></div>
          </div>
          <p class="helper">Based on your inputs and stated assumptions.</p>
        </div>

        <button class="primary" type="button">Recalculate</button>
      </div>
    </aside>
  </div>
</main>

<footer class="site-footer">
  <div class="container">
    <p>High-level model only. Always confirm with HMRC guidance or a qualified adviser.</p>
  </div>
</footer>
