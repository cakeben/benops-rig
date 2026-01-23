# UI Concept: Tax Liability Explorer (Band Clarity)

## Purpose
Give non-experts a calm, regulated view of their UK tax position and how EIS, SEIS, and VCT reliefs reduce income tax. The UI prioritizes clear language, visible assumptions, and explicit band classification that updates as inputs change.

## Primary User Journey (Landing → Input → Results)
1. Landing
   - Statement of scope: “This tool estimates UK income, dividend, and capital gains tax for 2025/26.”
   - Disclaimer: “Educational only — not personal tax advice.”
   - Trust cues: sources list, last-updated date, and coverage summary (what is included and excluded).
2. Input (Baseline)
   - Grouped inputs with short helper text: income, dividends, gains, pension contributions.
   - A live tax summary shows band placement and effective tax rate as the user types.
3. Relief Scenarios
   - EIS/SEIS/VCT inputs with caps shown inline (e.g., “EIS: up to GBP 1,000,000”).
   - Relief impact row: “Relief used” and “Unused relief (carry-back may apply).”
4. Results
   - Headline totals: baseline tax, reliefs used, residual tax.
   - “Why this result” box listing the key thresholds and allowances that affected bands.

## Key Screens and Roles
- Landing header
  - Role: establish trust, clarify tax year and scope.
- Baseline inputs
  - Role: capture taxable income components in a predictable order.
- Tax summary (always visible)
  - Role: show baseline tax, relief capacity, and band classifications in one place as users type.
  - Includes effective tax rates for income, dividends, and CGT (clearly defined).
- Reliefs section
  - Role: let users explore EIS/SEIS/VCT effects on income tax liability.
- Results summary
  - Role: show baseline vs. relief-adjusted tax outcomes with short explanations.
- Detail drawers (progressive disclosure)
  - Role: deeper explanations of bands, relief rules, and assumptions without cluttering the main flow.

## Band Classification Panel
- What is shown: income tax band(s), dividend tax band(s), capital gains tax band(s).
- Where it appears: next to the baseline input step and repeated in the results summary.
- How it updates: text and numbers update on field change; no animations or transitions.

## How Band Classification Is Surfaced and Explained
- Band classification appears within the tax summary and mirrors the baseline inputs.
- Three dedicated band panels (always visible) within the summary:
  1) Income Tax Bands
  2) Dividend Tax Bands
  3) Capital Gains Tax Bands

Each panel shows:
- Marginal bands listed in order with amounts (e.g., “20% on GBP 37,700; 40% on GBP 14,300”).
- Plain-English threshold ranges (e.g., “Your taxable income after allowances is GBP 52,000, spanning GBP 12,571 to GBP 50,270 and GBP 50,271 to GBP 52,000.”).
- A “Why this band” sentence that cites the relevant allowance and threshold.
- A “What moves this band” list (pension contributions, additional income, Scottish residence).
- Definitions (static, inline):
  - Marginal rate: the rate applied to the last GBP earned.
  - Effective rate: total tax divided by total taxable amount.

Reliefs context:
- Each band panel includes: “Reliefs reduce income tax only; dividend tax and CGT bands do not change in this model.”
- Income tax panel highlights the income tax liability available for relief.

## Mixed Band Cases
When income spans bands:
- Example microcopy: “Your taxable income is GBP 58,000. This spans the basic rate (20% on GBP 37,700) and higher rate (40% on GBP 7,730).”

When dividends span bands:
- Example microcopy: “Your taxable dividends are GBP 6,000. They span the basic rate dividend band (8.75% on GBP 3,500) and higher rate dividend band (33.75% on GBP 2,500).”

When CGT spans bands:
- Example microcopy: “Your taxable gains are GBP 40,000. GBP 17,700 is taxed at 18% and GBP 22,300 is taxed at 24%.”

## Assumptions & Scope (UI-Level)
- Classification reflects the tax year shown at the top of the page.
- Scottish resident toggle applies to income tax bands only.
- Dividend and CGT bands follow UK-wide rates in this model.
- Reliefs reduce income tax liability only; they do not change dividend or CGT bands.
- Does not model CGT deferral relief, VCT dividend exemption, or loss offsets.

## Error and Edge States
- Empty inputs: show “GBP 0” and “No taxable amount entered yet.”
- Nonsensical values (negative numbers): prevent entry and show “Enter a non‑negative amount.”
- Missing tax year: block calculations and show “Tax year required to classify bands.”

## Interaction Patterns (Static)
- Single-page flow with a sticky summary (desktop) and stacked summary (mobile).
- Progressive disclosure through collapsible sections labeled “Show how we calculated.”
- Band panels remain visible and update alongside inputs to reinforce understanding.
- No animations or transitions; changes are reflected by updated text and numbers only.

## Visual Language Principles
- Calm, high-contrast typography with strong hierarchy:
  - Serif for headings, clean sans for labels and values.
- Neutral palette with restrained emphasis:
  - Primary values in dark ink, secondary explanations in muted tone.
- Clear card boundaries to separate input, band classification, and results.
- Avoid visual flourish; convey trust and regulatory clarity.

## Trade-offs
- Persistently visible band panels improve comprehension but increase vertical space.
- Static explanations reduce dynamism but increase auditability and confidence.
- Single-page layout is approachable but may feel long for expert users.

## Open Questions
- Should effective tax rate be shown per tax type (income/dividend/CGT) or as a combined effective rate?
- Should relief eligibility checks sit inline with inputs or in a dedicated “Eligibility” drawer?
- Do we need a dedicated comparison row (baseline vs. with reliefs) or keep it in the summary?

## Acceptance Criteria
- Landing clearly states scope, tax year, and “educational only” disclaimer.
- Baseline input step groups income, dividends, gains, and pension contributions with helper text.
- Band classification panel shows income, dividend, and CGT bands in both input and results views.
- Band classifications update on field change with no motion or transitions.
- Mixed band cases display multiple marginal bands with exact amounts.
- Each band panel includes marginal and effective rate definitions.
- Income tax panel shows relief-eligible income tax liability.
- Assumptions & scope are visible and specific to band classification.
- Error states handle empty inputs, negative values, and missing tax year.
- Summary shows baseline tax, relief used, and residual tax in one place.
