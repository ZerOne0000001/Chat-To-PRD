---
name: pm-design
description: 设计业务流程、用户故事与页面结构
---

# PM Design Skill

Use this skill to translate requirements into detailed product designs.

## Workflow

1.  **User Stories & Journey Map**:
    *   Based on `Requirement_Background.md`, generate:
        *   `Background/User_Stories.md`: 3-5 key user stories. (Ref: `references/Example_Stories.md`)
        *   `Flow/User_Journey_Map.md`: Table format. (Ref: `references/Example_Journey.md`)
    *   Confirm with user.

2.  **Business Process Design**:
    *   **Analysis & Hypothesis**: Before drawing, describe the proposed flow logic in text. Ask: "I plan to design the flow as follows... Any edge cases to add?"
    *   Create `Flow/Business_Flow.md`: High-level flowchart (Mermaid).
    *   Create `Flow/Business_Flow_Detailed.md`: Detailed Swimlane diagram. (Ref: `references/Example_Flow.md`)
    *   **Rule**: Ensure logic covers happy path and edge cases (errors, timeouts).
    *   Confirm with user.

3.  **Information Architecture (IA)**:
    *   **Analysis & Hypothesis**: Before creating the file, list the proposed page hierarchy and key fields. Ask: "Here is the draft page structure... Does this cover all data points?"
    *   Create `Page_Structure.md`. (Ref: `references/Example_PageStructure.md`)
    *   Define page hierarchy (e.g., Home -> Detail -> Result).
    *   List fields, actions, and logic for each page.
    *   **Rule**: Use "Product Manager" terminology (not database schema).
    *   Confirm with user.
