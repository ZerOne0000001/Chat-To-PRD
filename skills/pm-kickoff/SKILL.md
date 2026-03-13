---
name: pm-kickoff
description: 启动新需求迭代，进行需求调研与文件夹初始化
---

# PM Kickoff Skill

Use this skill to initiate a new product requirement iteration and gather initial requirements.

## Workflow

1.  **Check Iteration Log**:
    *   Read `ITERATION_LOG.md` in project root.
    *   If not exists, create it.
    *   Identify latest iteration (YYMM_N).
    *   Ask user: "Append to current iteration or start new?"

2.  **Create Iteration Structure**:
    *   Create folder `YYMM_N` (e.g., `2603_1`).
    *   Create `Requirement_List.md` inside iteration folder.
    *   Ask for Requirement Name/ID (e.g., F1).
    *   Create requirement folder `YYMM_N/F1_Name`.
    *   Create subfolders: `Background`, `Flow`.

3.  **Requirement Analysis & Hypothesis (CRITICAL)**:
    *   **Self-Check**: Do I have enough info about Persona, Scenario, and Goals?
    *   **Hypothesis**: Before asking questions, ALWAYS propose a preliminary **Core Flow** or **Business Logic** based on the requirement name.
    *   **Action**: Present the hypothesis to the user: "Here is my understanding/hypothesis of the requirement... Is this correct?"
    *   **Iterate**: If user corrects, update hypothesis and ask follow-up questions until info is sufficient.

4.  **Conduct Requirement Interview**:
    *   Ask user if they need analysis assistance.
    *   If yes, conduct multi-round interview covering:
        *   **Target User (Persona)**: Who is this for?
        *   **Usage Scenario**: When/Where is it used?
        *   **Core Flow**: What is the main action?
        *   **Goals**: What is the success metric?
    *   Propose hypotheses and ask for confirmation.
    *   **CRITICAL**: Do not proceed to solution design until requirements are clear.

4.  **Output**:
    *   Update `Requirement_List.md`.
    *   **Reference**: See `references/Example_Background.md` for format.
