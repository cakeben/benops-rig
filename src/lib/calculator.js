const clamp = (value) => Math.max(0, Number(value) || 0);

const personalAllowance = (adjustedNetIncome, rules) => {
  if (adjustedNetIncome <= rules.personalAllowanceTaperStart) {
    return rules.personalAllowance;
  }
  if (adjustedNetIncome >= rules.personalAllowanceZeroAt) {
    return 0;
  }
  const reduction = (adjustedNetIncome - rules.personalAllowanceTaperStart) * rules.taperRate;
  return Math.max(0, rules.personalAllowance - reduction);
};

const applyBand = (amount, bandAvailable) => {
  const used = Math.min(amount, bandAvailable);
  return {
    used,
    remaining: Math.max(0, amount - used),
    bandRemaining: Math.max(0, bandAvailable - used)
  };
};

const calculateScottishIncomeTax = (taxableNonSavings, rules) => {
  let remaining = taxableNonSavings;
  let tax = 0;
  let lowerLimit = 0;
  rules.scotlandBands.forEach((band) => {
    if (remaining <= 0) {
      return;
    }
    const bandSize =
      band.limit === Number.POSITIVE_INFINITY ? remaining : band.limit - lowerLimit;
    const taxableAtBand = Math.min(remaining, bandSize);
    tax += taxableAtBand * band.rate;
    remaining -= taxableAtBand;
    lowerLimit = band.limit;
  });
  return tax;
};

export const calculateTax = (inputs, rules) => {
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

  const allowance = personalAllowance(adjustedNetIncome, rules);
  const allowanceAgainstNonSavings = Math.min(allowance, totalNonSavingsIncome);
  const remainingAllowance = Math.max(0, allowance - allowanceAgainstNonSavings);

  const taxableNonSavings = Math.max(0, totalNonSavingsIncome - allowanceAgainstNonSavings);
  const dividendsAfterAllowance = Math.max(0, dividends - remainingAllowance);
  const taxableDividends = Math.max(0, dividendsAfterAllowance - rules.dividendAllowance);

  const basicRateBand = rules.basicRateBand + pensionContributions;
  const higherBandLimit = rules.higherRateThreshold - basicRateBand;

  const nonSavingsInBasic = Math.min(taxableNonSavings, basicRateBand);
  const nonSavingsInHigher = Math.min(
    Math.max(0, taxableNonSavings - basicRateBand),
    Math.max(0, higherBandLimit)
  );
  const nonSavingsInAdditional = Math.max(
    0,
    taxableNonSavings - basicRateBand - higherBandLimit
  );

  const isScottish = Boolean(inputs.scottishResident);
  const incomeTax = isScottish
    ? calculateScottishIncomeTax(taxableNonSavings, rules)
    : nonSavingsInBasic * rules.rates.income.basic +
      nonSavingsInHigher * rules.rates.income.higher +
      nonSavingsInAdditional * rules.rates.income.additional;

  let basicRemaining = Math.max(0, basicRateBand - nonSavingsInBasic);
  let higherRemaining = Math.max(0, higherBandLimit - nonSavingsInHigher);

  const dividendBasic = Math.min(taxableDividends, basicRemaining);
  basicRemaining = Math.max(0, basicRemaining - dividendBasic);

  const dividendHigher = Math.min(taxableDividends - dividendBasic, higherRemaining);
  higherRemaining = Math.max(0, higherRemaining - dividendHigher);

  const dividendAdditional = Math.max(0, taxableDividends - dividendBasic - dividendHigher);

  const dividendTax =
    dividendBasic * rules.rates.dividends.basic +
    dividendHigher * rules.rates.dividends.higher +
    dividendAdditional * rules.rates.dividends.additional;

  const totalIncomeTax = incomeTax + dividendTax;

  let aeaRemaining = rules.cgtAnnualExempt;
  const nonResidentialAfterAea = Math.max(0, capitalGains - aeaRemaining);
  aeaRemaining = Math.max(0, aeaRemaining - capitalGains);
  const residentialAfterAea = Math.max(0, capitalGainsResidential - aeaRemaining);

  const taxableIncomeForCgt = taxableNonSavings + taxableDividends;
  let cgtBasicRemaining = Math.max(0, basicRateBand - taxableIncomeForCgt);

  const nonResBand = applyBand(nonResidentialAfterAea, cgtBasicRemaining);
  cgtBasicRemaining = nonResBand.bandRemaining;
  const resBand = applyBand(residentialAfterAea, cgtBasicRemaining);

  const cgtNonRes =
    nonResBand.used * rules.rates.cgt.nonResidential.basic +
    nonResBand.remaining * rules.rates.cgt.nonResidential.higher;
  const cgtRes =
    resBand.used * rules.rates.cgt.residential.basic +
    resBand.remaining * rules.rates.cgt.residential.higher;

  const totalCgt = cgtNonRes + cgtRes;

  const eisQualifying = Math.min(clamp(inputs.eisInvestment), rules.reliefLimits.eis);
  const seisQualifying = Math.min(clamp(inputs.seisInvestment), rules.reliefLimits.seis);
  const vctQualifying = Math.min(clamp(inputs.vctInvestment), rules.reliefLimits.vct);

  const eisRelief = eisQualifying * rules.reliefRates.eis;
  const seisRelief = seisQualifying * rules.reliefRates.seis;
  const vctRelief = vctQualifying * rules.reliefRates.vct;

  const totalReliefPotential = eisRelief + seisRelief + vctRelief;
  const reliefUsed = Math.min(totalIncomeTax, totalReliefPotential);
  const reliefUnused = Math.max(0, totalReliefPotential - reliefUsed);

  const residualTax = Math.max(0, totalIncomeTax + totalCgt - reliefUsed);

  return {
    inputs: {
      employmentIncome,
      selfEmploymentIncome,
      otherIncome,
      dividends,
      capitalGains,
      capitalGainsResidential,
      pensionContributions,
      scottishResident: Boolean(inputs.scottishResident),
      eisInvestment: clamp(inputs.eisInvestment),
      seisInvestment: clamp(inputs.seisInvestment),
      vctInvestment: clamp(inputs.vctInvestment)
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
      residualTax
    },
    reliefs: {
      eisQualifying,
      seisQualifying,
      vctQualifying,
      eisRelief,
      seisRelief,
      vctRelief,
      totalReliefPotential
    }
  };
};
