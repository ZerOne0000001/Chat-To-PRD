---
name: pm-prototype
description: 生成高保真 HTML 原型
---

# PM Prototype Skill

Use this skill to generate HTML prototypes based on the page structure.

## Workflow

1.  **Preparation**:
    *   Read `Page_Structure.md`.
    *   Ask user for:
        *   **Device Resolution** (e.g., Mobile, Desktop).
        *   **UI Style** (e.g., Minimalist, Business Blue).
    *   **Analysis & Hypothesis (CRITICAL)**:
        *   **Self-Check**: Do I know the interaction details (e.g., popup triggers, error states)?
        *   **Hypothesis**: Describe the proposed UI layout and interaction flow for key pages.
        *   **Action**: Ask user: "I plan to build the [Home Page] with [Layout X] and [Interaction Y]. Is this what you expect?"
        *   **Iterate**: Gather feedback until user confirms.

2.  **Generation**:
    *   Create `Prototypes/` folder.
    *   Generate HTML files for each page defined in IA.
    *   Include CSS/JS (can be inline or separate).
    *   **Requirement**: Prototypes must be interactive (links working, buttons clickable).
    *   **Correction**: If user points out UI issues, fix them immediately.

3.  **Verification**:
    *   Ask user to open HTML files and verify.
