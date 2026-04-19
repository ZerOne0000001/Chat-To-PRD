# 业务流程图 (Business Flow)

## 1. 流程描述与场景分支分析

作为一份动态的大纲演示工具，该页面的核心业务流程主要围绕“用户（演示者或观众）的浏览与跳转行为”展开。

基于前期的梳理，`pm-workflow` 技能存在两个核心场景分支：**标准工作流** 与 **快速通道**。因此，演示大纲的流程也必须支撑这两种分支的切换和展示。

**核心流程逻辑：**
1. **初始化**：用户进入大纲页面，默认展示全局的“技能简介”与“触发条件”。
2. **场景分支选择**：用户（演示者）在大纲的“场景选择”区域，点击选择要演示的分支。
   - **分支 A (标准工作流)**：页面导航器动态加载 0~6 个完整阶段。
   - **分支 B (快速通道)**：页面导航器动态加载 0、4、5 阶段（跳过设计与原型阶段）。
3. **阶段串讲与跳转**：
   - 演示者通过顶部的“全局进度导航器”点击某个具体阶段。
   - 页面主体内容区平滑切换/滑入该阶段的卡片（展示该阶段的动作和生成的文档列表）。
4. **循环演示**：演示者在 IDE 和本大纲页面之间不断切屏，重复第 3 步，直到演示结束。

## 2. Mermaid 业务流程图

```mermaid
flowchart TD
    %% 样式定义
    classDef startEnd fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef action fill:#e1f5fe,stroke:#4fc3f7,stroke-width:2px;
    classDef decision fill:#fff9c4,stroke:#29b6f6,stroke-width:2px;
    classDef output fill:#f1f8e9,stroke:#81c784,stroke-width:2px;

    %% 节点定义
    Start([进入技能大纲页面]) ::: startEnd
    ViewIntro[查看技能简介与触发条件] ::: action
    SelectScenario{选择演示场景分支} ::: decision

    %% 分支 A：标准工作流
    LoadStandard[加载标准工作流导航结构 包含阶段0至6] ::: action
    Step1_Standard[进入某个阶段讲解 例如阶段1] ::: action
    ShowDocs_Standard[展示该阶段生成的中间产物] ::: output

    %% 分支 B：快速通道
    LoadFast[加载快速通道导航结构 包含阶段0和4和5] ::: action
    Step1_Fast[进入某个阶段讲解 例如阶段4] ::: action
    ShowDocs_Fast[展示该阶段生成的中间产物] ::: output

    %% 循环与结束
    SwitchIDE[切屏至 IDE 进行 AI 对话] ::: action
    SwitchBack[切回大纲页面并点击进度条 快速跳转至下一阶段] ::: action
    End([结束演示]) ::: startEnd

    %% 流程连线
    Start --> ViewIntro
    ViewIntro --> SelectScenario

    SelectScenario -->|选择标准工作流| LoadStandard
    LoadStandard --> Step1_Standard
    Step1_Standard --> ShowDocs_Standard

    SelectScenario -->|选择快速通道| LoadFast
    LoadFast --> Step1_Fast
    Step1_Fast --> ShowDocs_Fast

    ShowDocs_Standard --> SwitchIDE
    ShowDocs_Fast --> SwitchIDE

    SwitchIDE --> SwitchBack
    SwitchBack -->|跳转新阶段| Step1_Standard
    SwitchBack -->|跳转新阶段| Step1_Fast

    SwitchBack -->|演示完毕| End
```