---
name: interactive-prd-builder
description: 自动化交互式 PRD（产品需求文档）生成工作流。该技能通过确保 PRD 文档和 HTML 原型页面之间的命名一致性，将它们组装成一个统一的交互式网页。它会在原型页面旁边注入全局的悬浮目录（TOC）导航和对应的 PRD 详细说明，支持多状态同步、暗黑模式切换和移动端/PC端响应式适配。
---

# 交互式 PRD 构建器 (Interactive PRD Builder)

将标准的 Markdown 格式 PRD 转换为高保真、可交互的单文件 HTML 文档，并与原型页面（iframe）进行联动。

## ⚠️ 核心红线 (CRITICAL RULES)

在编写任何代码之前，你**必须**遵守以下红线：

1. **单文件交付**：你**必须**产出一个完整的**单文件 HTML**（包含所有 CSS/JS），禁止分离资源。
2. **纯内容转换**：你**绝对不能**修改或精简原始 Markdown PRD 中的任何业务逻辑、规则或表格内容。
3. **禁止响应式撑破**：在处理 Web 端原型（iframe）时，你**绝对不能**使用 `width: 100%`。必须使用固定宽度并通过 CSS `transform: scale()` 进行缩放适配。
4. **图表隔离与渲染**：你**绝对不能**使用并行循环渲染图表，必须执行严格的防崩溃隔离。你**必须**读取并套用 [references/mermaid-defense-patterns.md](references/mermaid-defense-patterns.md) 中的所有逻辑。
5. **深度联动机制**：你**绝对不能**仅凭直觉编写状态同步 JS。你**必须**读取并套用 [references/sync-patterns.md](references/sync-patterns.md) 中的代码模式（基于 `getBoundingClientRect()` 的滚动侦听方案和双重防抖重载逻辑）。

## UI 与布局规范

- **现代设计风格**：**必须**使用 Tailwind CSS（CDN），并采用现代、简洁、具有呼吸感的排版。
- **三栏布局**：
  - **左侧**：固定的目录导航栏 (TOC)，支持平滑滚动侦听。必须可展开/收起。
  - **中间**：PRD 正文内容区（可滚动）。
  - **右侧**：固定的 iframe 原型预览区。
    - **原型独立预览控制台**：**必须**在右侧 iframe 原型预览区的右上角，绝对定位悬浮一个“新标签页打开 (Open in New Tab)”的图标按钮。当 iframe src 切换时，该按钮的 `href` 必须同步更新，点击后能在新标签页（`target="_blank"`）直接打开当前原型 HTML 页面。
- **悬浮控制台 (Icon Buttons)**：
  - **必须**在页面左上角（或悬浮）**横向并排**放置纯图标的控制按钮（如 `☰` 控制目录，`🌙/☀️` 控制暗黑模式）。
  - 按钮**必须**设计为圆形的 icon 图标（如 `rounded-full`, `w-10 h-10`）。
- **暗黑模式**：**必须**在 `<head>` 注入 `<script>tailwind.config = { darkMode: 'class' }</script>`，且切换逻辑必须同时操作 `document.documentElement` 和 `document.body` 的 `class`。
- **PRD 内容区底部补偿**：
  - **必须**在中间 PRD 内容区的最末尾追加至少一屏高度的视觉补偿区（如 `padding-bottom: 100vh` 或 `<div class="h-screen"></div>`），确保短章节标题能滚动到屏幕顶部以触发侦听。

## 多端原型适配要求

- **移动端原型**：强制设定 iframe 容器尺寸（如 `375x830`），包裹 CSS 手机外壳（带圆角和刘海），并使用 `transform: scale()` 缩放。
- **Web 端/后台原型**：
  - 必须使用外层容器固定宽度（如 `width: 800px; height: 100%;`）。
  - 内部 iframe 设置为设计稿基准宽度（如 `1440px`），并应用 `transform: scale(calc(800 / 1440))` 且 `transform-origin: top left;`。
  - 内部 iframe 高度必须通过 `calc(100% * (1440 / 800))` 进行反向补偿。
  - 外层 Flex 容器必须添加 `min-w-0`（`min-width: 0`）属性彻底防撑破。
- **隐藏原生滚动条**：必须在 iframe 标签绑定 `onload="hideIframeScrollbar(this)"` 拦截函数，并在其中注入 `::-webkit-scrollbar { display: none !important; }`。
- **深色模式兜底**：必须在 iframe 外部容器和内部 `body`（通过 JS 在 `onload` 时注入）同时添加深色背景（如 `#0f172a`），覆盖原型白边。

## 执行工作流 (Execution Workflow)

1. **读取输入**：读取用户的 Markdown PRD 内容及对应的 HTML 原型目录。
2. **强制读取参考 (CRITICAL)**：使用文件读取工具查看 [references/mermaid-defense-patterns.md](references/mermaid-defense-patterns.md) 和 [references/sync-patterns.md](references/sync-patterns.md) 提取核心代码模式。
3. **搭建骨架与生成文件**：在当前需求根目录（与原 PRD 同级），创建 `Interactive_PRD.html` 文件，构建 Tailwind + Mermaid 的基础 HTML 三栏外壳和悬浮控制按钮。
4. **内容转换与防御植入**：将 Markdown 转为 HTML，并植入基于参考文件的 Mermaid 实体净化与容错隔离渲染代码。
5. **构建导航与侦听**：生成左侧 TOC 目录，并植入基于 `getBoundingClientRect()` 的滚动侦听 JS 代码。
6. **实现深度路由与联动同步**：
    - 建立目录标题到 iframe URL Hash 的精确映射表（**必须**使用可靠锚点规则，如仅提取序号 `611`，禁止硬编码中文标题）。
    - 修改对应的 Prototype HTML 文件，注入 `window.addEventListener('hashchange', ...)` 逻辑，支持弹窗或状态切换。
7. **强制自测验证 (Mandatory Validation)**：
    - [ ] 检查路由数组的 ID 与生成的 TOC 锚点是否完全匹配。
    - [ ] 检查所有弹窗/抽屉的开启是否做了排他性关闭处理。
    - 脑内推演：“同页状态同步函数是否正确执行？跨页跳转 iframe 重载逻辑是否防抖？”
    - **禁止早产交付**：在自检未通过前，**严禁向用户汇报“生成完成”**。如有 BUG，必须在当前回合内自行修复直到跑通。