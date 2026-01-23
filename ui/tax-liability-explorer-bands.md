# UI Concept: Tax Liability Explorer (Band Clarity)

## Purpose
Deliver a calm, regulated UI that helps non-experts understand their UK tax position and how EIS, SEIS, and VCT reliefs reduce income tax. The interface prioritizes clarity, transparent assumptions, and explicit tax band classification.

## Primary User Journey (Landing → Input → Results)
1. Landing
   - Clear scope statement, tax year, and “educational only” disclaimer.
   - Trust signals: sources, last-updated date, what is and is not covered.
2. Input (Baseline)
   - Minimal grouped inputs for income, dividends, gains, and pension contributions.
   - Tax summary updates as the user enters data, including band placement and effective tax rate.
3. Relief Scenarios
   - EIS/SEIS/VCT inputs with limits and plain-English eligibility notes.
   - “Relief impact” summary showing relief applied vs. unused relief.
4. Results
   - Headline totals: baseline tax, reliefs used, residual tax.
   - Static “why this result” explanation with key thresholds.

## Key Screens and Roles
- Landing header
  - Role: establish trust, clarify tax year and scope.
- Baseline inputs
  - Role: capture taxable income components and show band placement.
- Tax summary (always visible)
  - Role: show baseline tax, relief capacity, and band classifications in one place as users type.
  - Includes an effective tax rate for income, dividends, and CGT (clearly defined).
- Reliefs section
  - Role: let users explore EIS/SEIS/VCT effects on income tax liability.
- Results summary
  - Role: show baseline vs. relief-adjusted tax outcomes.
- Detail drawers (progressive disclosure)
  - Role: deeper explanations of bands, relief rules, and assumptions without cluttering the main flow.

## How Band Classification Is Surfaced and Explained
- Band classification appears within the tax summary and mirrors the baseline inputs.
- Three dedicated band panels (always visible) within the summary:
  1) Income Tax Bands
  2) Dividend Tax Bands
  3) Capital Gains Tax Bands

Each panel shows:
- All marginal bands that apply, listed in order (e.g., “20% on GBP 37,700, 40% on GBP 14,300”).
- Threshold ranges in plain English (e.g., “Your taxable income after allowances is GBP 52,000, spanning GBP 12,571 to GBP 50,270 and GBP 50,271 to GBP 52,000”).
- Marginal vs. effective rate explanation:
  - Marginal rate: rate applied to the last GBP earned.
  - Effective rate: total tax divided by total taxable amount, shown as a single percentage in the summary.
- A short “why this band” sentence with the relevant threshold and allowance.
- A simple “what changes this band” list (e.g., pension contributions, additional income, Scottish residence).

Reliefs context:
- Each band panel includes a line stating “Reliefs reduce income tax only; dividend tax and CGT bands remain unchanged in this model.”
- Income tax band panel highlights the income tax liability available for relief.

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
- Do we need a separate “headline rate” summary, or is listing all marginal bands enough?
- Should effective tax rate be shown per tax type (income/dividend/CGT) or as a combined effective rate?
- Should relief eligibility checks be placed inline or in a dedicated “Eligibility” drawer?
