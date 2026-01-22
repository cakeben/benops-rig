import assert from "node:assert/strict";
import { calculateTax } from "../calculator.js";

const near = (actual, expected, tolerance = 1) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} not within ${tolerance} of ${expected}`);
};

{
  const result = calculateTax({
    employmentIncome: 50000,
    selfEmploymentIncome: 0,
    otherIncome: 0,
    dividends: 0,
    capitalGains: 0,
    capitalGainsResidential: 0,
    pensionContributions: 0,
    eisInvestment: 0,
    seisInvestment: 0,
    vctInvestment: 0,
  });

  // Taxable income = 50000 - 12570 = 37430, all basic rate at 20%.
  near(result.totals.incomeTax, 7486, 1);
  near(result.totals.baselineTax, 7486, 1);
}

{
  const result = calculateTax({
    employmentIncome: 60000,
    selfEmploymentIncome: 0,
    otherIncome: 0,
    dividends: 5000,
    capitalGains: 0,
    capitalGainsResidential: 0,
    pensionContributions: 0,
    eisInvestment: 10000,
    seisInvestment: 0,
    vctInvestment: 0,
  });

  // EIS relief at 30% of 10k = 3k, capped by income tax.
  assert.ok(result.totals.reliefUsed >= 3000 - 1);
}

{
  const result = calculateTax({
    employmentIncome: 0,
    selfEmploymentIncome: 0,
    otherIncome: 0,
    dividends: 0,
    capitalGains: 20000,
    capitalGainsResidential: 0,
    pensionContributions: 0,
    eisInvestment: 0,
    seisInvestment: 0,
    vctInvestment: 0,
  });

  // CGT: gains 20k - 3k allowance = 17k at 18% (basic band unused) => 3.06k.
  near(result.totals.capitalGainsTax, 3060, 1);
}

console.log("calculator tests passed");
