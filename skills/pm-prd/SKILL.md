---
name: pm-prd
description: 生成标准 PRD 文档
---

# PM PRD Skill

Use this skill to generate the final Product Requirement Document.

## Workflow

1.  **Preparation**:
    *   Read all previous artifacts: `Requirement_Background.md`, `User_Stories.md`, `Business_Flow*.md`, `Page_Structure.md`.
    *   Read `Prototypes/` file list (to link them).

2.  **Drafting**:
    *   **Analysis & Hypothesis**:
        *   **Self-Check**: Are there any logic gaps between the design and prototypes?
        *   **Hypothesis**: Propose the PRD Directory Structure and Key Logic Points (especially Data Dictionary definitions).
        *   **Action**: Ask user: "I plan to structure the PRD as follows... and define [Field X] as [Definition Y]. Any changes?"
    *   Create `PRD_ProjectName_v1.0.md`.
    *   **Structure**:
        1.  Document Info (Revision History).
        2.  Project Overview (Background, Goals, Scope).
        3.  User Roles & Stories (Link to files).
        4.  Business Process (Link to files).
        5.  Page Structure & Flow (Link to files, Mermaid diagram).
        6.  **Data Dictionary** (Glossary).
        7.  **Functional Specifications** (Detailed logic per page).
        8.  Non-functional Requirements.

3.  **Style Guidelines**:
    *   Use "Product Manager" language (e.g., "Source: Admin Config", not "API: GET /config").
    *   Include relative links to all artifacts.
    *   **Reference**: See `references/PRD_Example.md` for the expected format and tone.

4.  **Review**:
    *   Present the PRD to the user for final review.
