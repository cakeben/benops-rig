const RULES_2026_27 = {
  taxYear: "2026/27",
  personalAllowance: 12570,
  personalAllowanceTaperStart: 100000,
  personalAllowanceZeroAt: 125140,
  taperRate: 0.5,
  basicRateBand: 37700,
  higherRateThreshold: 125140,
  dividendAllowance: 500,
  cgtAnnualExempt: 3000,
  scotlandBands: [
    { limit: 2827, rate: 0.19 },
    { limit: 14921, rate: 0.2 },
    { limit: 31092, rate: 0.21 },
    { limit: 62430, rate: 0.42 },
    { limit: 112570, rate: 0.45 },
    { limit: Number.POSITIVE_INFINITY, rate: 0.48 }
  ],
  scotlandDisplayBands: [
    { band: "Personal allowance", income: "Up to GBP 12,570", rate: "0%" },
    { band: "Starter rate", income: "GBP 12,571 to GBP 15,397", rate: "19%" },
    { band: "Basic rate", income: "GBP 15,398 to GBP 27,491", rate: "20%" },
    { band: "Intermediate rate", income: "GBP 27,492 to GBP 43,662", rate: "21%" },
    { band: "Higher rate", income: "GBP 43,663 to GBP 75,000", rate: "42%" },
    { band: "Advanced rate", income: "GBP 75,001 to GBP 125,140", rate: "45%" },
    { band: "Top rate", income: "Over GBP 125,140", rate: "48%" }
  ],
  rates: {
    income: {
      basic: 0.2,
      higher: 0.4,
      additional: 0.45
    },
    dividends: {
      basic: 0.0875,
      higher: 0.3375,
      additional: 0.3935
    },
    cgt: {
      nonResidential: {
        basic: 0.18,
        higher: 0.24
      },
      residential: {
        basic: 0.18,
        higher: 0.24
      }
    }
  },
  reliefLimits: {
    eis: 1_000_000,
    seis: 200_000,
    vct: 200_000
  },
  reliefRates: {
    eis: 0.3,
    seis: 0.5,
    vct: 0.2
  }
};

export default RULES_2026_27;
