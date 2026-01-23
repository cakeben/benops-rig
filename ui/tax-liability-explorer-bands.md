# UI Concept: Tax Liability Explorer (Band Clarity)

## Purpose
Deliver a calm, regulated UI that helps non-experts understand their UK tax position and how EIS, SEIS, and VCT reliefs reduce income tax. The interface prioritizes clarity, transparent assumptions, and explicit tax band classification.

## Primary User Journey (Landing → Input → Results)
1. Landing
   - Clear scope statement, tax year, and “educational only” disclaimer.
   - Trust signals: sources, last-updated date, what is and is not covered.
2. Input (Baseline)
   - Minimal grouped inputs for income, dividends, gains, and pension contributions.
   - Immediate band classification panels for income tax, dividend tax, and CGT.
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
- Band classification panel (always visible)
  - Role: explain which bands apply and why, with thresholds and marginal vs. effective rate context.
- Reliefs section
  - Role: let users explore EIS/SEIS/VCT effects on income tax liability.
- Results summary
  - Role: show baseline vs. relief-adjusted tax outcomes.
- Detail drawers (progressive disclosure)
  - Role: deeper explanations of bands, relief rules, and assumptions without cluttering the main flow.

## How Band Classification Is Surfaced and Explained
- Three dedicated band panels directly below the baseline inputs:
  1) Income Tax Band
  2) Dividend Tax Band
  3) Capital Gains Tax Band

Each panel shows:
- Current band name (e.g., “Higher rate”) and rate.
- Threshold range in plain English (e.g., “Your taxable income after allowances is GBP 52,000, which falls between GBP 50,271 and GBP 125,140”).
- Marginal vs. effective rate note:
  - Marginal rate: rate applied to the last GBP earned.
  - Effective rate: total tax divided by total taxable amount (shown as a single, static explanation, not animated).
- A short “why this band” sentence with the relevant threshold and allowance.
- A simple “what changes this band” list (e.g., pension contributions, additional income, Scottish residence).

Reliefs context:
- Each band panel includes a line stating “Reliefs reduce income tax only; dividend tax and CGT bands remain unchanged in this model.”
- Income tax band panel highlights the income tax liability available for relief.

## Interaction Patterns (Static)
- Single-page flow with a sticky summary (desktop) and stacked summary (mobile).
- Progressive disclosure through collapsible sections labeled “Show how we calculated.”
- Band panels remain visible while editing inputs to reinforce understanding.
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
- Should band panels show both band name and a simplified “headline rate,” or always display all marginal bands that apply?
- Do users need an explicit “effective tax rate” number, or is the explanation sufficient?
- Should relief eligibility checks be placed inline or in a dedicated “Eligibility” drawer?
