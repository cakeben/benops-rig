# UI Concept: Tax Liability Explorer

## Purpose
Provide a calm, trustworthy interface that helps non-experts understand their UK tax position and how EIS, SEIS, and VCT reliefs can reduce income tax. The UI prioritizes clarity and transparent assumptions over persuasion.

## Primary User Journey (Landing → Input → Results)
1. Landing: A short, plain-English statement of scope, tax year, and regulatory disclaimer.
2. Input: A minimal, grouped form for income, dividends, gains, and pension contributions. Relief inputs appear after baseline income is provided.
3. Results: A summary panel showing baseline tax, reliefs applied, and residual tax. A “Show how we calculated” section reveals detail on demand.

## Key Screens and Roles
- Landing header
  - Role: Establish trust, set scope, and reassure users this is educational (not advice).
- Input hub
  - Role: Collect essential data in a predictable order with simple labels and short helper text.
  - Grouping: Income (employment/self/other), dividends, capital gains (non-residential + residential), pension contributions.
- Reliefs section
  - Role: Allow what-if scenario input for EIS/SEIS/VCT; display qualifying limits beside each field.
- Results summary
  - Role: Present three headline numbers: baseline tax, total relief used, residual tax.
  - Include “what this covers” (income/dividend/CGT) and “what it does not” (CGT deferral relief, VCT dividend exemption).
- Detail drawers (progressive disclosure)
  - Role: Explain calculation steps and assumptions without overwhelming the primary screen.
  - Sections: Income tax bands, dividend tax, CGT, relief mechanics, sources.

## Interaction Patterns (Static)
- Single-page, linear flow: inputs on the left/top, results fixed in a summary panel or card.
- Progressive disclosure via collapsible sections, not hidden behind navigation.
- Inline helper text for every input, with short examples or thresholds where useful.
- “What changes if…” callouts are displayed as static comparison notes (e.g., Scottish resident toggle effects) without animation.

## Visual Language Principles
- Calm, high-contrast typography; serif for headings, clean sans for labels and data.
- Soft, paper-like background with clear card boundaries to separate concepts.
- Large numerals for headline results; muted secondary lines for breakdowns.
- Conservative color palette to signal regulated context; color used sparingly for emphasis only.

## Trade-offs
- Single-page disclosure favors comprehension, but can feel long for expert users.
- Static layout emphasizes trust and predictability, but reduces perceived interactivity.
- Simplified summary avoids over-detail; advanced users must open drawers for full breakdown.

## Open Questions
- Should we include a dedicated “Assumptions” panel above results, or keep it in a drawer?
- Do we need a separate “Scenario compare” view (baseline vs. EIS/SEIS/VCT) or keep it inline?
- Is a Scottish resident toggle sufficient, or should we support Scotland-specific detail views?
