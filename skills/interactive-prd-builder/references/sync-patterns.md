# Iframe 状态同步与滚动侦听模式 (Iframe Synchronization & Scroll-Spy Patterns)

本参考文档提供了构建高保真交互式 PRD 所需的经过实战检验的 JavaScript 模式。这些模式彻底解决了在复杂页面布局中常见的滚动判定漂移、iframe 状态死锁以及跨文档样式冲突等核心痛点。

## 1. 极其稳健的滚动侦听 (Robust Scroll-Spy)

**核心痛点:** 在现代 CSS 布局（如 Flex, Grid, 相对定位）中，使用传统的 `offsetTop` 计算元素位置经常会返回相对父级容器的偏移量，导致目录高亮错乱。

**终极解决方案:** 抛弃 `offsetTop`，统一使用浏览器底层的 `getBoundingClientRect()` 来计算元素相对于当前视口的绝对坐标。

```javascript
// --- 滚动侦听与目录高亮逻辑 ---
const mainScroll = document.getElementById('main-scroll');
const sections = Array.from(document.querySelectorAll('section[id], h3[id], h4[id]')).filter(el => el.id !== 'toc');
const navItems = document.querySelectorAll('.toc-item');

let scrollDebounceTimer;

mainScroll.addEventListener('scroll', () => {
    let current = '';
    const mainRect = mainScroll.getBoundingClientRect();

    // 逆向遍历：从最底部开始寻找当前处于视口顶部的章节
    // 必须使用 getBoundingClientRect 避免相对定位带来的偏移量错误
    for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();

        // 判定条件：该章节的顶部已经滑动到了外层滚动容器顶部以下（包含 150px 的视觉缓冲区域）
        if (rect.top <= mainRect.top + 150) {
            current = section.getAttribute('id');
            break;
        }
    }
    
    // 边界兜底：如果滑到了绝对的最顶部，强制高亮第一个章节
    if (!current && sections.length > 0) {
        current = sections[0].getAttribute('id');
    }

    // 更新左侧导航栏的 Active 状态
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-target') === current) {
            item.classList.add('active');
            
            // ... 接下来进入 iframe 同步更新逻辑 ...
        }
    });
});
```

## 2. 防死锁的 Iframe 状态管理 (Anti-Deadlock Iframe State Management)

**核心痛点:** 当用户在长文档中快速滑动时，会瞬间经过多个章节，从而向 iframe 发送大量冲突的状态切换指令（如连续打开不同层级的弹窗），最终导致 UI 冻结或弹窗重叠。

**终极解决方案:** 实施“双重防抖”与“单向数据流强制重载”机制。

```javascript
// 接在上述的 navItems 遍历逻辑内...

// 1. 滚动全局防抖 (Scroll Debounce)：防止用户滑动过程中的连续高频触发
clearTimeout(scrollDebounceTimer);
scrollDebounceTimer = setTimeout(() => {
    
    const prototypeFile = item.getAttribute('data-prototype');
    const iframe = document.getElementById('prototype-iframe');
    
    if (prototypeFile && iframe) {
        const baseUrl = window.location.href;
        const currentUrl = new URL(iframe.src, baseUrl);
        const newSrcRaw = `./Prototypes/${prototypeFile}`; // 根据实际情况调整相对路径
        const newUrl = new URL(newSrcRaw, baseUrl);
        
        // C. 同步更新右上角“新标签页打开”按钮的链接
        const openTabBtn = document.getElementById('open-prototype-btn');
        if (openTabBtn) {
            openTabBtn.href = newUrl.href;
        }

        const triggerActions = (iframeWin, hash) => {
            // A. 暴力清场：强制清除原型自带的焦点模式或暗色遮罩残留
            const iframeDoc = iframeWin.document;
            if (iframeDoc) {
                iframeDoc.body.classList.remove('focus-mode');
                iframeDoc.querySelectorAll('.focus-target').forEach(el => el.classList.remove('focus-target'));
                const overlay = iframeDoc.getElementById('focus-overlay');
                if (overlay) overlay.style.display = 'none';
            }

            // B. 状态分发：根据 Hash 触发对应的交互
            if (hash === '#actionDrawer' && typeof iframeWin.openDrawer === 'function') {
                iframeWin.openDrawer();
            } else if (hash === '#myModal' && typeof iframeWin.openModal === 'function') {
                iframeWin.openModal();
            } else if (hash && hash !== '#') {
                // 通用的滚动定位逻辑
                const targetId = hash.replace('#', '');
                const targetElement = iframeDoc ? iframeDoc.getElementById(targetId) : null;
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        };
        
        const isSamePath = currentUrl.pathname === newUrl.pathname;
        
        // 如果路径和 Hash 完全没变，直接拦截，不做任何无用功
        if (isSamePath && currentUrl.hash === newUrl.hash) return;

        // 清理可能遗留的加载计时器
        if (window.iframeUpdateTimeout) clearTimeout(window.iframeUpdateTimeout);
        
        // 2. 加载防抖 (Load Debounce) 与 强制重载
        window.iframeUpdateTimeout = setTimeout(() => {
            // A. 过渡动画：先让当前画面渐隐
            iframe.style.opacity = '0'; 
            
            setTimeout(() => {
                // B. 最关键的一步：无论参数怎么变，永远使用干净的 URL 进行强制重载，从根本上杜绝状态残留
                iframe.src = newUrl.pathname + newUrl.search;
                
                // 解除旧的 onload 绑定，防止事件重复执行
                iframe.onload = null; 
                
                // C. 页面加载完成后的后置处理
                iframe.onload = () => {
                    iframe.style.opacity = '1'; // 画面渐显
                    
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const iframeWin = iframe.contentWindow;
                        
                        // D. 跨域样式注入：隐藏内部滚动条，并使用 !important 彻底封杀导致变灰的样式
                        const style = iframeDoc.createElement('style');
                        style.textContent = `
                            body::-webkit-scrollbar, html::-webkit-scrollbar, *::-webkit-scrollbar {
                                display: none !important; width: 0 !important; background: transparent !important;
                            }
                            body, html, * {
                                -ms-overflow-style: none !important; scrollbar-width: none !important;
                            }
                            #focus-overlay { display: none !important; }
                            .focus-mode { overflow: auto !important; }
                            .focus-mode > *:not(.focus-target):not(#focus-overlay) {
                                pointer-events: auto !important; opacity: 1 !important; filter: none !important;
                            }
                        `;
                        iframeDoc.head.appendChild(style);
                        
                        // E. 最终触发：在绝对干净的环境下，执行唯一的一次状态切换
                        iframeWin.location.hash = newUrl.hash;
                        setTimeout(() => triggerActions(iframeWin, newUrl.hash), 200);
                        
                    } catch(e) {
                        console.warn("跨域拦截或样式注入失败:", e);
                    }
                };
            }, 150); // 等待 opacity: 0 动画完成的时间
        }, 150); // 防抖延迟
    }
}, 300); // 必须等待用户停止滚动 300ms 后，才开始执行全套逻辑
```
