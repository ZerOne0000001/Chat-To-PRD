# Mermaid 图表强容错与防崩溃机制 (The Ultimate Defense)

由于 Mermaid 的渲染机制在 DOM 操作上极易引发 Flex 布局破坏和异步并发冲突，你**必须**在转换 Markdown 到 HTML 的过程中，严格植入以下四重防御策略的代码逻辑：

## 1. 彻底的 HTML 实体净化
在将代码块传递给 `mermaid.render()` 之前，**必须**执行严格的实体解码。如果不解码，`marked.js` 等解析器转义的实体将导致 Mermaid 发生致命的语法解析错误。

必须还原以下字符：
- `&gt;` 还原为 `>`
- `&lt;` 还原为 `<`
- `&amp;` 还原为 `&`
- `&quot;` 还原为 `"`
- `&#39;` 还原为 `'`
- `&#x60;` 还原为 `` ` ``
- **清除所有零宽字符**（`\u200B`）。

## 2. 图表语法硬修复与引擎版本锁定
- **强制版本**：必须引入 Mermaid 11+ 的 CDN（例如 `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js`）。（10.x 版本在 ER 图中不支持未加引号的中文实体名称）。
- **语法补丁 (Patch)**：
  - **ER 图 (`erDiagram`)**：强制替换关系符号，确保前后必须有空格（例如使用 `code.split('||--o{').join(' ||--o{ ')` 等替换逻辑）。
  - **流程图 (`flowchart`)**：必须将所有 `<br>` 标签替换为严格闭合的 `<br/>`。
  - **初始化配置**：在调用 `mermaid.initialize` 时，必须显式开启 `htmlLabels: true`，否则会导致底层 XML 解析器报错。

## 3. 强制串行渲染 (消除并发冲突)
由于 `mermaid.render()` 是完全异步的 DOM 操作，**绝对禁止**使用 `forEach` 等并行迭代方法去渲染页面上的所有图表。并发渲染会导致 Mermaid 同时在 `body` 中挂载多个临时计算节点，引发不可预知的资源竞争。

你**必须**使用 `for...of` 或传统的 `for(let i=0;...)` 循环，并在循环体内部使用 `await mermaid.render(id, code)`，确保图表严格地**逐个排队渲染**。

## 4. 幽灵节点的精准清理与异常隔离
Mermaid 渲染时会自动向 `document.body` 插入临时计算节点（通常 ID 以 `dmermaid` 开头）。如果不处理，这些节点会被外层的 Flex 布局强制识别为新列，直接撑破或挤压页面的主体布局。

- **CSS 防御隔离**：在全局 `<style>` 中预先注入以下样式，使其脱离文档流：
  ```css
  div[id^="dmermaid"] { 
      position: absolute !important; 
      top: -9999px !important; 
      visibility: hidden !important; 
  }
  ```

- **JS 精准销毁 (防误杀)**：
  不论是在 `await` 成功的下一行，还是在 `catch` 异常捕获块中，你**只能使用精确匹配**来清理当前正在处理的那个图表的临时节点（例如 `document.getElementById('d' + id + '-svg')?.remove()`）。
  **严禁使用** `querySelectorAll('div[id^="dmermaid"]').forEach(el => el.remove())` 进行全局清理！这会误杀其他正在队列中或初始化中的节点，导致后续图表遭遇连环崩溃（`TypeError: Cannot read properties of null`）。

- **错误 UI 降级替换**：
  如果某个图表渲染抛出异常（进入 `catch` 块），你仅需在发生错误的该图表原容器位置，替换为一个友好的错误提示框（如淡红色背景，内联显示出错的原始 Mermaid 代码和 `e.message`），**绝对不能**因为一个图表的错误而中断整个文档的渲染流程，更不能让错误溢出影响其他布局。