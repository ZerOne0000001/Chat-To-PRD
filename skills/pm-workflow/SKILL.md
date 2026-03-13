---
name: pm-workflow
description: 全流程产品设计向导，按顺序调用 pm-kickoff, pm-design, pm-prototype, pm-prd
---

# PM Workflow Skill

Use this skill to guide the user through the complete end-to-end product design process. It acts as a master controller, invoking specialized sub-skills in the correct order.

## Workflow

1.  **Phase 1: Kickoff & Requirements**
    *   **Goal**: Define the problem and scope.
    *   **Action**: Invoke `pm-kickoff`.
    *   **Wait Condition**: Wait for user confirmation that requirements are gathered and `Requirement_Background.md` is created.
    *   **Transition**: Ask "Requirements gathered. Proceed to design phase?"

2.  **Phase 2: Design & Architecture**
    *   **Goal**: Define the solution structure.
    *   **Action**: Invoke `pm-design`.
    *   **Wait Condition**: Wait for user confirmation of `User_Stories.md`, `Business_Flow.md`, and `Page_Structure.md`.
    *   **Transition**: Ask "Design confirmed. Proceed to build prototypes?"

3.  **Phase 3: Prototyping**
    *   **Goal**: Visual verification.
    *   **Action**: Invoke `pm-prototype`.
    *   **Wait Condition**: Wait for user to verify HTML files in browser.
    *   **Transition**: Ask "Prototypes verified. Generate final PRD?"

4.  **Phase 4: Documentation**
    *   **Goal**: Final delivery.
    *   **Action**: Invoke `pm-prd`.
    *   **Completion**: Congratulate user on finishing the iteration.

## Usage Rules

*   **Sequential Execution**: Do not skip phases unless explicitly requested by the user (e.g., "Skip to prototyping").
*   **Context Passing**: Remind the user that outputs from previous phases (e.g., `Page_Structure.md`) are required for subsequent phases.
*   **Error Handling**: If a sub-skill fails or needs iteration, allow the user to stay in that phase before moving on.
