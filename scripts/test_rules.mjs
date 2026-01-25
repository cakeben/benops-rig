import assert from "node:assert/strict";
import { calculateTax } from "../src/lib/calculator.js";
import { getRules } from "../rules/index.js";

const rules2025 = getRules("2025/26");
const rules2026 = getRules("2026/27");

{
  const result = calculateTax(
    {
      employmentIncome: 90000,
      selfEmploymentIncome: 0,
      otherIncome: 0,
      dividends: 0,
      capitalGains: 0,
      capitalGainsResidential: 0,
      pensionContributions: 0,
      scottishResident: false,
      eisInvestment: 0,
      seisInvestment: 0,
      vctInvestment: 0
    },
    rules2025
  );
  assert.equal(result.totals.personalAllowance, 12570);
}

{
  const result = calculateTax(
    {
      employmentIncome: 110000,
      selfEmploymentIncome: 0,
      otherIncome: 0,
      dividends: 0,
      capitalGains: 0,
      capitalGainsResidential: 0,
      pensionContributions: 0,
      scottishResident: false,
      eisInvestment: 0,
      seisInvestment: 0,
      vctInvestment: 0
    },
    rules2025
  );
  assert.equal(result.totals.personalAllowance, 7570);
}

{
  const result = calculateTax(
    {
      employmentIncome: 130000,
      selfEmploymentIncome: 0,
      otherIncome: 0,
      dividends: 0,
      capitalGains: 0,
      capitalGainsResidential: 0,
      pensionContributions: 0,
      scottishResident: false,
      eisInvestment: 0,
      seisInvestment: 0,
      vctInvestment: 0
    },
    rules2025
  );
  assert.equal(result.totals.personalAllowance, 0);
}

{
  const baseInputs = {
    employmentIncome: 60000,
    selfEmploymentIncome: 0,
    otherIncome: 0,
    dividends: 0,
    capitalGains: 0,
    capitalGainsResidential: 0,
    pensionContributions: 0,
    scottishResident: false,
    eisInvestment: 0,
    seisInvestment: 0,
    vctInvestment: 10000
  };

  const result2025 = calculateTax(baseInputs, rules2025);
  const result2026 = calculateTax(baseInputs, rules2026);
  assert.equal(result2025.reliefs.vctRelief, 3000);
  assert.equal(result2026.reliefs.vctRelief, 2000);
}

console.log("rules tests passed");
