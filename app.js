import { CONFIG, calculateTax } from "./calculator.js";

const formatGBP = (value) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

const inputs = [
  "employmentIncome",
  "selfEmploymentIncome",
  "otherIncome",
  "dividends",
  "capitalGains",
  "capitalGainsResidential",
  "pensionContributions",
  "scottishResident",
  "eisInvestment",
  "seisInvestment",
  "vctInvestment",
];

const getValues = () => {
  const values = {};
  inputs.forEach((id) => {
    const element = document.getElementById(id);
    if (element.type === "checkbox") {
      values[id] = element.checked;
    } else {
      values[id] = Number(element.value) || 0;
    }
  });
  return values;
};

const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
};

const renderAssumptions = () => {
  const list = document.getElementById("assumptionsList");
  const items = [
    `Tax year modeled: ${CONFIG.taxYear}. Rates are for England/Wales/NI unless Scottish resident is selected.`,
    "Personal allowance is tapered above GBP 100,000 and fully removed at GBP 125,140.",
    "Gross personal pension contributions reduce adjusted net income and extend the basic rate band.",
    "Dividend allowance is GBP 500 and applied after personal allowance offsets dividends.",
    "Capital gains annual exempt amount is GBP 3,000 and is applied to non-residential gains first.",
    "From 6 April 2025, CGT rates assumed at 18% (basic) and 24% (higher) for residential and other assets.",
    "EIS/SEIS/VCT reliefs are applied only against income tax liability; unused relief is shown but not carried back here.",
    "VCT relief rate assumed at 20% for 2025/26; confirm with current HMRC rules.",
    "Scottish Income Tax bands are applied only to non-savings income; dividends and CGT still use UK bands in this model.",
  ];
  list.innerHTML = items.map((item) => `<li>${item}</li>`).join("");

  const sources = document.getElementById("sourcesList");
  const sourceItems = [
    "<a href=\"https://www.gov.uk/income-tax-rates\" target=\"_blank\" rel=\"noopener\">Income Tax rates and Personal Allowance</a>",
    "<a href=\"https://www.gov.uk/scottish-rate-income-tax\" target=\"_blank\" rel=\"noopener\">Scottish Income Tax rates 2025/26</a>",
    "<a href=\"https://www.gov.uk/tax-on-dividends\" target=\"_blank\" rel=\"noopener\">Dividend allowance and rates</a>",
    "<a href=\"https://www.gov.uk/capital-gains-tax/allowances\" target=\"_blank\" rel=\"noopener\">CGT annual exempt amount</a>",
    "<a href=\"https://www.gov.uk/capital-gains-tax/rates\" target=\"_blank\" rel=\"noopener\">CGT rates from 6 April 2025</a>",
  ];
  sources.innerHTML = sourceItems.map((item) => `<li>${item}</li>`).join("");

  const updated = document.getElementById("ratesUpdated");
  updated.textContent = "Rates updated on 2026-01-22.";
};

const renderInvestmentNotes = (results) => {
  const notes = [];
  if (results.inputs.eisInvestment > results.reliefs.eisQualifying) {
    notes.push(`EIS qualifying investment capped at GBP ${results.reliefs.eisQualifying.toLocaleString("en-GB")}.`);
  }
  if (results.inputs.seisInvestment > results.reliefs.seisQualifying) {
    notes.push(`SEIS qualifying investment capped at GBP ${results.reliefs.seisQualifying.toLocaleString("en-GB")}.`);
  }
  if (results.inputs.vctInvestment > results.reliefs.vctQualifying) {
    notes.push(`VCT qualifying investment capped at GBP ${results.reliefs.vctQualifying.toLocaleString("en-GB")}.`);
  }
  if (notes.length === 0) {
    notes.push("All investment inputs are within standard qualifying limits.");
  }
  const list = document.getElementById("investmentNotes");
  list.innerHTML = notes.map((note) => `<li>${note}</li>`).join("");
};

const render = () => {
  const results = calculateTax(getValues());

  setText("incomeTax", formatGBP(results.totals.incomeTax));
  setText("dividendTax", formatGBP(results.totals.dividendTax));
  setText("cgt", formatGBP(results.totals.capitalGainsTax));
  setText("baselineTax", formatGBP(results.totals.baselineTax));
  setText("incomeTaxBeforeRelief", formatGBP(results.totals.totalIncomeTax));
  setText("reliefClaimed", formatGBP(results.totals.reliefUsed));
  setText("unusedRelief", formatGBP(results.totals.reliefUnused));
  setText("residualTax", formatGBP(results.totals.residualTax));

  renderInvestmentNotes(results);
};

const bindEvents = () => {
  const button = document.getElementById("calculateBtn");
  button.addEventListener("click", render);
  inputs.forEach((id) => {
    const element = document.getElementById(id);
    element.addEventListener("input", render);
  });
};

renderAssumptions();
render();
bindEvents();
