# Specification

## Summary
**Goal:** Add a hidden admin entry point on the Terms & Conditions page using the word "Sia" as the last word of the last condition.

**Planned changes:**
- In `TermsPage.tsx`, append the word "Sia" as the very last word of the last condition/paragraph, styled to blend into surrounding body text (same font size, color, and weight, no underline)
- Make "Sia" a clickable link that navigates to `/admin`
- Ensure the hidden link works correctly in both light mode and dark mode

**User-visible outcome:** The Terms & Conditions page looks completely unchanged to regular visitors, but clicking the word "Sia" at the end of the last condition navigates directly to the admin panel.
