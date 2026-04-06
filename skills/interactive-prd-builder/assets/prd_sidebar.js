(function() {
    // PRD Sidebar Component
    const PRD_DATA = window.PRD_DATA || [];
    const STATE_KEY = 'prd_sidebar_state';

    // Helper: Highlight Keywords
    function highlightKeywords(text) {
        // Regex for keywords like [Button] or "Field"
        return text.replace(/(\[.*?\]|“.*?”|【.*?】)/g, '<span class="prd-keyword">$1</span>');
    }

    function init() {
        // Load State
        let state = { collapsed: false, width: 320 };
        try {
            const s = localStorage.getItem(STATE_KEY);
            if (s) state = JSON.parse(s);
        } catch(e) {}

        // Create Container
        const sidebar = document.createElement('div');
        sidebar.id = 'prd-sidebar';
        if (state.collapsed) sidebar.classList.add('collapsed');
        sidebar.style.width = state.collapsed ? '32px' : state.width + 'px';

        // HTML Structure
        sidebar.innerHTML = `
            <div id="prd-resize-handle"></div>
            <div class="prd-header">PRD 说明</div>
            <div class="prd-vertical-label" title="点击展开">PRD</div>
            <div class="prd-content"></div>
        `;

        // Render Content
        const contentArea = sidebar.querySelector('.prd-content');
        if (PRD_DATA.length === 0) {
            contentArea.innerHTML = '<div style="color:#999; text-align:center; padding-top:20px;">暂无说明</div>';
        } else {
            PRD_DATA.forEach((section, index) => {
                const div = document.createElement('div');
                div.className = 'prd-section';
                
                const title = document.createElement('div');
                title.className = 'prd-section-title';
                title.textContent = section.title;
                div.appendChild(title);

                const text = document.createElement('div');
                text.className = 'prd-text collapsed-text'; // Default collapsed
                text.innerHTML = highlightKeywords(section.content);
                
                // Toggle text expansion
                text.onclick = () => {
                    text.classList.toggle('collapsed-text');
                };

                div.appendChild(text);
                contentArea.appendChild(div);
            });
        }

        // Toggle Logic (Vertical Label click)
        sidebar.querySelector('.prd-vertical-label').onclick = () => {
            sidebar.classList.remove('collapsed');
            sidebar.style.width = state.width + 'px';
            state.collapsed = false;
            saveState();
        };

        // Header click to collapse? Or add a close btn
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '✕';
        closeBtn.style.marginLeft = 'auto';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            sidebar.classList.add('collapsed');
            sidebar.style.width = '32px';
            state.collapsed = true;
            saveState();
        };
        sidebar.querySelector('.prd-header').appendChild(closeBtn);

        // Resize Logic
        const handle = sidebar.querySelector('#prd-resize-handle');
        let isResizing = false;
        
        handle.onmousedown = (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            e.preventDefault();
        };

        document.onmousemove = (e) => {
            if (!isResizing) return;
            const newWidth = document.body.clientWidth - e.clientX;
            if (newWidth > 200 && newWidth < 600) {
                sidebar.style.width = newWidth + 'px';
                state.width = newWidth;
            }
        };

        document.onmouseup = () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = 'default';
                saveState();
            }
        };

        function saveState() {
            localStorage.setItem(STATE_KEY, JSON.stringify(state));
        }

        document.body.appendChild(sidebar);

        // Inject into Modals (Recursive check)
        // If modals exist in DOM, we might want to ensure sidebar is visible on top?
        // Z-index 9999 should handle it.
        // Requirement: "Ensure sidebar automatically visible when modal pops up"
        // Since sidebar is fixed to viewport, it is always visible unless modal z-index > 9999.
        // I will check CSS. Usually modals are 100-1000.
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
