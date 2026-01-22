<script>
  import { tick } from "svelte";
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

  let pulse = false;
  let bagpipePulse = 0;
  const triggerAnimation = async () => {
    pulse = false;
    await tick();
    pulse = true;
    bagpipePulse += 1;
    setTimeout(() => {
      pulse = false;
    }, 450);
  };

  $: results = calculateTax(form);

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

<svelte:window on:click={triggerAnimation} />

<header class="site-header">
  <div class="container">
    <p class="eyebrow">UK tax year 2025/26 (England/Wales/NI rates)</p>
    <h1>Understand your UK tax and how EIS, SEIS, and VCT reliefs reduce it</h1>
    <p class="lede">
      This calculator models UK income tax, dividend tax, and capital gains tax at a high level.
      It explains relief mechanics in plain English and shows how much of your income tax can be
      offset by EIS, SEIS, and VCT investments.
    </p>
    <p class="disclaimer">
      This tool is for education only. It is not personalised tax advice. Results rely on
      assumptions listed below.
    </p>
  </div>
</header>

<main class="container">
  <section class={`card ${pulse ? "pulse" : ""}`} aria-labelledby="inputs-title">
    <h2 id="inputs-title">Your inputs</h2>
    <form class="form-grid">
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
          <label for="pensionContributions">Gross personal pension contributions (relief at source)</label>
          <input
            id="pensionContributions"
            type="number"
            min="0"
            step="100"
            bind:value={form.pensionContributions}
          />
        </div>
        <div class="field checkbox">
          <label for="scottishResident">Scottish resident (income tax bands only)</label>
          <div class="checkbox-row">
            <input
              id="scottishResident"
              type="checkbox"
              bind:checked={form.scottishResident}
              on:change={triggerAnimation}
            />
            {#if form.scottishResident}
              {#key bagpipePulse}
                <div class="bagpipes" aria-hidden="true">
                  <svg viewBox="0 0 120 120" role="presentation">
                    <circle cx="42" cy="60" r="22" />
                    <circle cx="78" cy="60" r="16" />
                    <rect x="36" y="20" width="8" height="28" rx="4" />
                    <rect x="70" y="18" width="8" height="30" rx="4" />
                    <rect x="86" y="24" width="8" height="28" rx="4" />
                    <path d="M24 70 C24 96 46 100 60 100" />
                  </svg>
                </div>
              {/key}
            {/if}
          </div>
        </div>
      </div>

      <h3 class="subheading">EIS / SEIS / VCT investments</h3>
      <div class="grid">
        <div class="field">
          <label for="eisInvestment">EIS amount</label>
          <input id="eisInvestment" type="number" min="0" step="100" bind:value={form.eisInvestment} />
        </div>
        <div class="field">
          <label for="seisInvestment">SEIS amount</label>
          <input id="seisInvestment" type="number" min="0" step="100" bind:value={form.seisInvestment} />
        </div>
        <div class="field">
          <label for="vctInvestment">VCT amount</label>
          <input id="vctInvestment" type="number" min="0" step="100" bind:value={form.vctInvestment} />
        </div>
      </div>

      <button class="primary" type="button" on:click={triggerAnimation}>Recalculate</button>
    </form>
  </section>

  <section class={`card ${pulse ? "pulse" : ""}`} aria-labelledby="results-title">
    <h2 id="results-title">Results</h2>
    <div class="results-grid">
      <div class="result-block">
        <h3>Baseline tax (before reliefs)</h3>
        <dl>
          <div>
            <dt>Income tax (non-savings)</dt>
            <dd>{formatGBP(results.totals.incomeTax)}</dd>
          </div>
          <div>
            <dt>Dividend tax</dt>
            <dd>{formatGBP(results.totals.dividendTax)}</dd>
          </div>
          <div>
            <dt>Capital gains tax</dt>
            <dd>{formatGBP(results.totals.capitalGainsTax)}</dd>
          </div>
          <div class="total">
            <dt>Total baseline tax</dt>
            <dd>{formatGBP(results.totals.baselineTax)}</dd>
          </div>
        </dl>
      </div>
      <div class="result-block">
        <h3>EIS/SEIS/VCT relief impact</h3>
        <dl>
          <div>
            <dt>Income tax liability available for relief</dt>
            <dd>{formatGBP(results.totals.totalIncomeTax)}</dd>
          </div>
          <div>
            <dt>Total relief claimed</dt>
            <dd>{formatGBP(results.totals.reliefUsed)}</dd>
          </div>
          <div>
            <dt>Unused relief (carry-back may apply)</dt>
            <dd>{formatGBP(results.totals.reliefUnused)}</dd>
          </div>
          <div class="total">
            <dt>Residual tax after reliefs</dt>
            <dd>{formatGBP(results.totals.residualTax)}</dd>
          </div>
        </dl>
      </div>
    </div>
    <div class="result-block">
      <h3>Qualifying investment summary</h3>
      <ul class="notes">
        {#each investmentNotes as note}
          <li>{note}</li>
        {/each}
      </ul>
    </div>
  </section>

  <section class={`card ${pulse ? "pulse" : ""}`} aria-labelledby="explain-title">
    <h2 id="explain-title">How the reliefs work (plain English)</h2>
    <div class="explain">
      <div>
        <h3>EIS (Enterprise Investment Scheme)</h3>
        <ul>
          <li>30% income tax relief on qualifying investments up to GBP 1,000,000 per tax year.</li>
          <li>You must hold the shares for at least 3 years or relief can be clawed back.</li>
          <li>Relief can be carried back to the previous tax year if you have unused income tax.</li>
          <li>CGT deferral relief may be available, but is not calculated here.</li>
        </ul>
      </div>
      <div>
        <h3>SEIS (Seed Enterprise Investment Scheme)</h3>
        <ul>
          <li>50% income tax relief on qualifying investments up to GBP 200,000 per tax year.</li>
          <li>Shares must be held for at least 3 years or relief can be clawed back.</li>
          <li>Relief can be carried back to the previous tax year if you have unused income tax.</li>
          <li>Additional CGT reliefs may be available; not calculated here.</li>
        </ul>
      </div>
      <div>
        <h3>VCT (Venture Capital Trust)</h3>
        <ul>
          <li>20% income tax relief on qualifying investments up to GBP 200,000 per tax year.</li>
          <li>Relief is only for the current tax year and cannot be carried back.</li>
          <li>Shares must be held for at least 5 years or relief can be clawed back.</li>
          <li>Dividends from VCTs are tax-free, but this is not modelled here.</li>
        </ul>
      </div>
    </div>
  </section>

  <section class={`card ${pulse ? "pulse" : ""}`} aria-labelledby="assumptions-title">
    <h2 id="assumptions-title">Assumptions & regulatory notes</h2>
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
  </section>

  <section class={`card ${pulse ? "pulse" : ""}`} aria-labelledby="rates-title">
    <h2 id="rates-title">Rates snapshot</h2>
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
  </section>
</main>

<footer class="site-footer">
  <div class="container">
    <p>High-level model only. Always confirm with HMRC guidance or a qualified adviser.</p>
  </div>
</footer>
