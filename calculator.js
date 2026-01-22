const CONFIG = {
  taxYear: "2024/25",
  personalAllowance: 12570,
  personalAllowanceTaperStart: 100000,
  personalAllowanceZeroAt: 125140,
  basicRateBand: 37700,
  higherRateThreshold: 125140,
  dividendAllowance: 500,
  cgtAnnualExempt: 3000,
  rates: {
    income: {
      basic: 0.2,
      higher: 0.4,
      additional: 0.45,
    },
    dividends: {
      basic: 0.0875,
      higher: 0.3375,
      additional: 0.3935,
    },
    cgt: {
      nonResidential: {
        basic: 0.1,
        higher: 0.2,
      },
      residential: {
        basic: 0.18,
        higher: 0.28,
      },
    },
  },
  reliefLimits: {
    eis: 1_000_000,
    seis: 200_000,
    vct: 200_000,
  },
  reliefRates: {
    eis: 0.3,
    seis: 0.5,
    vct: 0.3,
  },
};

const clamp = (value) => Math.max(0, Number(value) || 0);

const personalAllowance = (adjustedNetIncome) => {
  if (adjustedNetIncome <= CONFIG.personalAllowanceTaperStart) {
    return CONFIG.personalAllowance;
  }
  if (adjustedNetIncome >= CONFIG.personalAllowanceZeroAt) {
    return 0;
  }
  const reduction = (adjustedNetIncome - CONFIG.personalAllowanceTaperStart) / 2;
  return Math.max(0, CONFIG.personalAllowance - reduction);
};

const applyBand = (amount, bandAvailable) => {
  const used = Math.min(amount, bandAvailable);
  return {
    used,
    remaining: Math.max(0, amount - used),
    bandRemaining: Math.max(0, bandAvailable - used),
  };
};

const calculateTax = (inputs) => {
  const employmentIncome = clamp(inputs.employmentIncome);
  const selfEmploymentIncome = clamp(inputs.selfEmploymentIncome);
  const otherIncome = clamp(inputs.otherIncome);
  const dividends = clamp(inputs.dividends);
  const capitalGains = clamp(inputs.capitalGains);
  const capitalGainsResidential = clamp(inputs.capitalGainsResidential);
  const pensionContributions = clamp(inputs.pensionContributions);

  const totalNonSavingsIncome = employmentIncome + selfEmploymentIncome + otherIncome;
  const totalIncome = totalNonSavingsIncome + dividends;
  const adjustedNetIncome = Math.max(0, totalIncome - pensionContributions);

  const allowance = personalAllowance(adjustedNetIncome);
  const allowanceAgainstNonSavings = Math.min(allowance, totalNonSavingsIncome);
  const remainingAllowance = Math.max(0, allowance - allowanceAgainstNonSavings);

  const taxableNonSavings = Math.max(0, totalNonSavingsIncome - allowanceAgainstNonSavings);
  const dividendsAfterAllowance = Math.max(0, dividends - remainingAllowance);
  const taxableDividends = Math.max(0, dividendsAfterAllowance - CONFIG.dividendAllowance);

  const basicRateBand = CONFIG.basicRateBand + pensionContributions;
  const higherBandLimit = CONFIG.higherRateThreshold - basicRateBand;

  const nonSavingsInBasic = Math.min(taxableNonSavings, basicRateBand);
  const nonSavingsInHigher = Math.min(
    Math.max(0, taxableNonSavings - basicRateBand),
    Math.max(0, higherBandLimit)
  );
  const nonSavingsInAdditional = Math.max(
    0,
    taxableNonSavings - basicRateBand - higherBandLimit
  );

  const incomeTax =
    nonSavingsInBasic * CONFIG.rates.income.basic +
    nonSavingsInHigher * CONFIG.rates.income.higher +
    nonSavingsInAdditional * CONFIG.rates.income.additional;

  let basicRemaining = Math.max(0, basicRateBand - nonSavingsInBasic);
  let higherRemaining = Math.max(0, higherBandLimit - nonSavingsInHigher);

  const dividendBasic = Math.min(taxableDividends, basicRemaining);
  basicRemaining = Math.max(0, basicRemaining - dividendBasic);

  const dividendHigher = Math.min(taxableDividends - dividendBasic, higherRemaining);
  higherRemaining = Math.max(0, higherRemaining - dividendHigher);

  const dividendAdditional = Math.max(0, taxableDividends - dividendBasic - dividendHigher);

  const dividendTax =
    dividendBasic * CONFIG.rates.dividends.basic +
    dividendHigher * CONFIG.rates.dividends.higher +
    dividendAdditional * CONFIG.rates.dividends.additional;

  const totalIncomeTax = incomeTax + dividendTax;

  let aeaRemaining = CONFIG.cgtAnnualExempt;
  const nonResidentialAfterAea = Math.max(0, capitalGains - aeaRemaining);
  aeaRemaining = Math.max(0, aeaRemaining - capitalGains);
  const residentialAfterAea = Math.max(0, capitalGainsResidential - aeaRemaining);

  const taxableIncomeForCgt = taxableNonSavings + taxableDividends;
  let cgtBasicRemaining = Math.max(0, basicRateBand - taxableIncomeForCgt);

  const nonResBand = applyBand(nonResidentialAfterAea, cgtBasicRemaining);
  cgtBasicRemaining = nonResBand.bandRemaining;
  const resBand = applyBand(residentialAfterAea, cgtBasicRemaining);

  const cgtNonRes =
    nonResBand.used * CONFIG.rates.cgt.nonResidential.basic +
    nonResBand.remaining * CONFIG.rates.cgt.nonResidential.higher;
  const cgtRes =
    resBand.used * CONFIG.rates.cgt.residential.basic +
    resBand.remaining * CONFIG.rates.cgt.residential.higher;

  const totalCgt = cgtNonRes + cgtRes;

  const eisQualifying = Math.min(clamp(inputs.eisInvestment), CONFIG.reliefLimits.eis);
  const seisQualifying = Math.min(clamp(inputs.seisInvestment), CONFIG.reliefLimits.seis);
  const vctQualifying = Math.min(clamp(inputs.vctInvestment), CONFIG.reliefLimits.vct);

  const eisRelief = eisQualifying * CONFIG.reliefRates.eis;
  const seisRelief = seisQualifying * CONFIG.reliefRates.seis;
  const vctRelief = vctQualifying * CONFIG.reliefRates.vct;

  const totalReliefPotential = eisRelief + seisRelief + vctRelief;
  const reliefUsed = Math.min(totalIncomeTax, totalReliefPotential);
  const reliefUnused = Math.max(0, totalReliefPotential - reliefUsed);

  const residualTax = Math.max(0, totalIncomeTax + totalCgt - reliefUsed);

  return {
    config: CONFIG,
    inputs: {
      employmentIncome,
      selfEmploymentIncome,
      otherIncome,
      dividends,
      capitalGains,
      capitalGainsResidential,
      pensionContributions,
      eisInvestment: clamp(inputs.eisInvestment),
      seisInvestment: clamp(inputs.seisInvestment),
      vctInvestment: clamp(inputs.vctInvestment),
    },
    totals: {
      adjustedNetIncome,
      personalAllowance: allowance,
      taxableNonSavings,
      taxableDividends,
      incomeTax,
      dividendTax,
      totalIncomeTax,
      capitalGainsTax: totalCgt,
      baselineTax: totalIncomeTax + totalCgt,
      reliefUsed,
      reliefUnused,
      residualTax,
    },
    reliefs: {
      eisQualifying,
      seisQualifying,
      vctQualifying,
      eisRelief,
      seisRelief,
      vctRelief,
      totalReliefPotential,
    },
  };
};

export { CONFIG, calculateTax };
