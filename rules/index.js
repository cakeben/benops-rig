import rules2025 from "./2025-26.js";
import rules2026 from "./2026-27.js";

const RULES_BY_YEAR = {
  "2025/26": rules2025,
  "2026/27": rules2026
};

const TAX_YEARS = Object.keys(RULES_BY_YEAR);

const getRules = (taxYear) => RULES_BY_YEAR[taxYear] || rules2025;

export { RULES_BY_YEAR, TAX_YEARS, getRules };
