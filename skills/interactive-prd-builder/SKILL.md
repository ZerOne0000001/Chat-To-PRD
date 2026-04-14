---
name: interactive-prd-builder
description: 自动化交互式 PRD（产品需求文档）生成工作流。该技能通过确保 PRD 文档和 HTML 原型页面之间的命名一致性，将它们组装成一个统一的交互式网页。它会在原型页面旁边注入全局的悬浮目录（TOC）导航和对应的 PRD 详细说明，支持多状态同步、暗黑模式切换和移动端/PC端响应式适配。
---

# 交互式 PRD 构建器 (Interactive PRD Builder)

该技能的核心目标是将标准的 Markdown 格式 PRD 转换为高保真、可交互的单文件 HTML 文档。它结合了现代化的 UI 布局 (Tailwind CSS)、动态图表渲染 (Mermaid.js) 以及极其稳定防错的跨文档状态同步技术 (iframe 交互机制)。

## 核心原则与规范

### 1. 100% 内容保真 (Content Fidelity)
- **绝对不要修改原始 PRD 的业务内容**：该技能的目的是“格式转换与体验升级”，而不是“内容编辑”。
- 精确提取所有标题（H1, H2, H3, H4）生成层级分明的悬浮目录（TOC）。
- 完整保留所有的表格、业务规则说明以及 Mermaid 流程图。

### 2. UI 与布局规范 (Layout Specifications)
- **单文件与现代设计 (Single-file & Modern Design)**：
  - 产出**单文件 HTML** 格式的 PRD 文档，必须包含完整的内联 CSS 样式和 JS 逻辑。
  - **强制使用 Tailwind CSS**（通过 CDN 引入），并采用现代、简洁、具有呼吸感的设计风格（避免默认 Markdown 转换那种粗糙的原始排版）。
- **自适应三栏布局**：
  - **左侧**：固定的目录导航栏 (TOC)，支持平滑滚动侦听。可以展开和收起，收起时内容区和原型区应自动变宽。
  - **中间**：可滚动的 PRD 正文内容区。
  - **右侧**：固定的 iframe 原型预览区。
- **悬浮图标控制台 (图标按钮)**：
  - **禁止使用普通的顶部控制栏区块**。
  - 必须在页面左上角（或悬浮于页面之上）横向并排放置纯图标的控制按钮（例如使用 `☰` 图标控制目录显示/隐藏，使用 `🌙/☀️` 图标控制暗黑模式），并且按钮必须设计为圆形的 icon 图标（如 `rounded-full`、`w-10 h-10`），以提升沉浸感与美观度。
  - **Tailwind 暗黑模式要求**：必须在 HTML `<head>` 注入 `<script>tailwind.config = { darkMode: 'class' }</script>`，且 JS 切换按钮逻辑必须同时作用于 `document.documentElement` 和 `document.body` 的 `classList.toggle('dark')`。同时需要检查文档目录等所有容器组件是否均包含了暗色类变体（如 `dark:bg-slate-900`）。
- **多端原型适配**：右侧的 iframe 必须智能适配不同终端的原型：
  - **移动端原型**：强制设定 iframe 的容器宽度和高度（如 `width: 375px; height: 830px;`），需包裹一层精致的 CSS 手机外壳（带圆角和刘海），并可通过 CSS `transform: scale(0.8)` 等方式进行缩放以适应屏幕。
  - **Web端/后台原型**：**绝对禁止使用 `width: 100%` 响应式自适应**（会导致内部宽表格撑破外层 Flex 布局，即 Flex Blowout）。必须使用固定宽度与缩放模式：外层容器固定宽度（如 `width: 800px; height: 100%;`），内部 iframe 设置为设计稿基准宽度（如 `1440px`）并应用 `transform: scale(calc(800 / 1440))` 且 `transform-origin: top left;`。**关键**：内部 iframe 的高度必须通过 `calc(100% * (1440 / 800))` 进行反向补偿计算，否则缩放后下方会留出大片空白。同时外层 Flex 容器必须添加 `min-w-0`（`min-width: 0`）属性彻底防撑破。
  - **通用 iframe 样式**：必须在 iframe HTML 标签级别直接绑定 `onload="hideIframeScrollbar(this)"` 拦截函数，在页面初次渲染时第一时间注入 CSS 隐藏内部原生滚动条（`::-webkit-scrollbar { display: none !important; }`），防止初次加载时短暂露出滚动条轨道。
- **PRD 内容区底部补偿**：
  - 为了彻底解决“文章末尾内容过短导致点击最后几个目录时标题无法滚动到顶部”进而导致滚动侦听失效和 iframe 联动死锁的问题，**必须在中间 PRD 内容区的最末尾追加一屏高度的视觉补偿区**（例如设置包裹容器的 `padding-bottom: 100vh` 或在文档末尾插入 `<div class="h-screen"></div>`），确保即使是最后一行内容也能被滚动到浏览器视口的最顶端。

### 3. 深度路由与 Iframe 状态同步 (防死锁模式)
为了实现点击目录联动 iframe 内部状态（如弹出弹窗、切换 Tab），必须严格遵循以下同步模式：

- **深度路由映射 (Deep Linking)**：
  - 必须建立从目录标题（甚至精确到 6.2.4 等三级、四级目录）到 iframe URL Hash 的精确映射表（例如 `url = 'Prototypes/View.html#section=6.2.4'`）。
- **原型文件注入 Hash 监听**：
  - 你必须修改对应的 Prototype HTML 文件，向其内部注入 `window.addEventListener('hashchange', ...)` 逻辑，确保原型内部能够捕获 Hash 变化并触发对应的弹窗或状态切换，确保点击目录后右侧 iframe 能够精准跳转到正确状态。
- **使用绝对定位计算滚动位置**：绝对不要使用 `offsetTop`。必须使用 `getBoundingClientRect()` 来精确判断当前哪个章节进入了视口。
- **双重防抖与强制重载**：
  - 当 Hash 和基础路径发生变化时，优先通过修改 `iframe.contentWindow.location.hash` 来实现无刷新切换；如果跨页面，则直接赋予 `iframe.src` 全新 URL 强制重载。

### 4. 跨文档 CSS 样式注入与深色模式兜底
为了让 iframe 内部的原型展示得更纯净，且完美适配暗黑模式，必须在 `iframe.onload` 时机向其内部注入 CSS：
- **隐藏原生滚动条**：注入 `::-webkit-scrollbar { display: none !important; }` 和 `scrollbar-width: none`。
- **破除冲突的焦点模式**：强制覆盖原型中自带的可能导致页面变灰死锁的样式（如 `#focus-overlay { display: none !important; }`）。
- **强制深色背景兜底**：
  - HTML/CSS 层面：必须为 iframe 的外壳容器（`.device-mockup`）添加暗黑模式背景兜底（`body.dark .device-mockup { background-color: #0f172a; }`）。
  - 跨页面注入 (JS)：在 `iframe.onload` 中判断 `document.body.classList.contains('dark')`，若为深色，则同步给 iframe 注入深色背景（`iframeDoc.body.style.backgroundColor = '#0f172a'`）。
  - 手动切换事件 (JS)：在点击切换主题的事件中，除了 `classList.toggle('dark')` 之外，必须显式操作 `iframeBody.style.backgroundColor` 以覆盖因 `scale` 缩放或页面高度不足暴露出的 iframe 底色白边。

### 5. Mermaid 图表强容错与防崩溃机制 (The Ultimate Defense)
严禁页面中出现由 Mermaid 原生抛出的红色报错区块（如 `Syntax error in textmermaid version...`），同时也严禁 Mermaid 的临时计算节点破坏 Flex 布局。为了应对极其脆弱的图表渲染机制，必须实施以下四重防御策略：

- **第一重：彻底的 HTML 实体净化**
  在将 Markdown 中的代码块提取给 Mermaid 渲染前，必须执行严格的实体解码。如果不解码，`marked.js` 转义的实体会导致 Mermaid 解析失败。必须还原以下字符：`&gt;` 转 `>`，`&lt;` 转 `<`，`&amp;` 转 `&`，`&quot;` 转 `"`，`&#39;` 转 `'`，`&#x60;` 转 `` ` ``，并清除零宽字符（`\u200B`）。

- **第二重：图表语法硬修复与引擎版本锁定**
  - **强制版本**：必须使用 Mermaid 11+（例如 `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js`）。Mermaid 10.x 版本在 ER 图中不支持未加引号的中文实体名称，会直接引发致命的语法错误。
  - **语法补丁**：针对 ER 图，强制替换关系符号确保前后有空格（如 `code.split('||--o{').join(' ||--o{ ')`）。针对 Flowchart，必须将 `<br>` 替换为严格闭合的 `<br/>`，并且在 `mermaid.initialize` 时开启 `htmlLabels: true`，否则会导致 XML 解析错误。

- **第三重：强制串行渲染 (消除并发冲突)**
  由于 `mermaid.render()` 是异步操作，**绝对禁止使用 `forEach` 循环遍历渲染图表**。并发渲染会导致 Mermaid 同时在 `body` 中插入多个临时节点，极易引发不可预知的资源竞争。必须使用 `for...of` 或传统的 `for(let i=0;...)` 循环，并在内部使用 `await mermaid.render()`，让图表严格地**逐个排队渲染**。

- **第四重：幽灵节点的精准清理与异常隔离**
  Mermaid 渲染时会自动向 `document.body` 插入临时计算节点（如 `div[id^="dmermaid"]`），如果不加处理，会被外层的 Flex 布局当作新列，强行撑破右侧空间。
  - **CSS 隔离**：必须预先注入 `div[id^="dmermaid"] { position: absolute !important; top: -9999px !important; visibility: hidden !important; }`，使其脱离文档流。
  - **JS 精准销毁 (防误杀)**：不论是在 `await` 成功的下一行，还是在 `catch` 异常捕获块中，**只能使用精确匹配**（`document.getElementById('d' + id + '-svg')?.remove()`）来清理当前报错或完成的图表节点。**严禁使用 `querySelectorAll` 全局清理**，否则一个图表的报错误清了其他正在渲染图表的临时节点，将导致“连环崩溃”（TypeError: Cannot read properties of null）。
  - **错误 UI 替换**：仅在出错的图表原位置，替换为一个柔和的自定义错误提示框（如淡红色背景，内联显示出错的原始代码和 `e.message` 错误信息），绝对不能影响其他图表的正常展示。

## 进阶代码模式与核心资源 (Advanced Patterns & References)

为了实现上述极其复杂的 iframe 状态同步与防死锁机制，**你绝对不能仅凭直觉从零编写 JavaScript 逻辑**。

👉 **CRITICAL (强制动作)**：在生成或修改 `Interactive_PRD.html` 的联动 JS 代码之前，你**必须**使用文件读取工具查看以下资源文档，并严格套用其中的代码模式：
- **同步模式参考**：[references/sync-patterns.md](references/sync-patterns.md)（包含基于 `getBoundingClientRect()` 的滚动侦听方案、防死锁的“双重防抖”逻辑、以及安全的 iframe 强制重载模式）

## 执行工作流 (Execution Workflow)

1. **读取输入**：读取用户的 Markdown PRD 内容以及对应的 HTML 原型文件目录。
2. **搭建骨架与生成文件**：在当前需求根目录下（即与原 PRD 文档同级的目录），创建 `Interactive_PRD.html` 文件。为其构建包含 Tailwind CDN、Mermaid CDN 的基础 HTML 外壳和三栏布局。添加左上角悬浮的 Icon 控制按钮。
3. **内容转换与图表净化**：将 Markdown 转换为 HTML，注入 Mermaid 容错隔离渲染代码。
4. **构建导航与侦听**：生成左侧 TOC 目录，并植入基于 `getBoundingClientRect` 的滚动侦听 JS 代码。
5. **实现深度路由与联动同步**：**(警告：在编写此步 JS 代码前，必须先读取 [references/sync-patterns.md](references/sync-patterns.md) 提取标准代码模式)** 实现右侧 iframe 的 Hash 触发联动逻辑，并确保修改对应的 Prototype 文件支持 `hashchange`。在设计 `routingMap` 映射表时，**必须使用可靠的锚点规则（例如仅提取章节序号 `611`），绝对禁止硬编码包含中文字符的完整标题**，以防 PRD 中文标题修改后导致路由解析失败。
6. **强制自测验证 (Mandatory Validation)**：
    - **逻辑走查**：检查路由数组的 ID 与生成的 TOC 锚点是否完全匹配。
    - **互斥检查**：检查所有弹窗/抽屉的开启是否做了排他性关闭处理（`classList.remove('open')`）。
    - **环境沙盘**：脑内推演：“如果跨页面跳转，iframe 的 onload 延迟是否足够？如果是同页跳转，状态同步函数是否正确执行？”
    - **禁止早产交付**：在以上所有的逻辑自检未通过、并未在实际环境中（如果可以）确认点击无死角之前，**严禁向用户汇报“生成完成”或要求验收**。如果发现 BUG，必须在当前回合内自行修复直到跑通。