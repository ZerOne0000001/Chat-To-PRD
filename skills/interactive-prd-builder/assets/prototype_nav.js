
(function() {
    // 1. Configuration & State
    const CONFIG = {
        structureUrl: 'structure.json',
        containerId: 'prototype-nav',
        toggleId: 'prototype-nav-toggle',
        contentId: 'prototype-nav-content',
        storageKey: 'prototype_nav_state_v2'
    };

    let structureData = null;
    let appState = {
        sidebarOpen: false, // Default closed (sidebar container)
        nodeStates: {}      // Default empty (will imply expanded for tree nodes)
    };

    // 2. Helper Functions
    function createEl(tag, className, text) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text) el.innerText = text;
        return el;
    }

    function loadState() {
        try {
            const s = localStorage.getItem(CONFIG.storageKey);
            if (s) {
                appState = JSON.parse(s);
            }
        } catch (e) {
            console.warn('Failed to load prototype nav state', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(appState));
        } catch (e) {
            console.warn('Failed to save prototype nav state', e);
        }
    }

    // 3. Core Logic
    const PrototypeNav = {
        init: async function() {
            // Load persisted state first
            loadState();

            // Load CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'prototype_nav.css';
            document.head.appendChild(link);

            // Fetch Structure
            try {
                const response = await fetch(CONFIG.structureUrl);
                structureData = await response.json();
                this.render();
                this.setupHashListener();
                this.hookPageLogic();
                
                // Check initial hash
                if (window.location.hash) {
                    const trigger = window.location.hash.substring(1); // remove #
                    // Delay slightly to ensure page is ready
                    setTimeout(() => this.handleTrigger(trigger), 300);
                } else {
                     // Default state if no hash
                     this.highlightCurrentPageOnly();
                }

            } catch (e) {
                console.error('Failed to load prototype structure:', e);
            }
        },

        render: function() {
            // Container
            const container = createEl('div', '', '');
            container.id = CONFIG.containerId;
            
            // Restore Sidebar State
            if (appState.sidebarOpen) {
                container.classList.add('expanded');
            }
            
            // Header
            const header = createEl('div', '', '原型目录');
            header.id = 'prototype-nav-header';
            
            const closeBtn = createEl('span', 'nav-icon', '✕');
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => {
                container.classList.remove('expanded');
                appState.sidebarOpen = false;
                saveState();
            };
            header.appendChild(closeBtn);
            container.appendChild(header);

            // Content
            const content = createEl('div', '', '');
            content.id = CONFIG.contentId;
            const treeRoot = createEl('ul', 'nav-tree', '');
            
            structureData.forEach(node => {
                treeRoot.appendChild(this.createTreeNode(node));
            });
            content.appendChild(treeRoot);
            container.appendChild(content);

            // Toggle Button
            const toggle = createEl('div', '', '☰');
            toggle.id = CONFIG.toggleId;
            toggle.onclick = () => {
                const isExpanded = container.classList.toggle('expanded');
                appState.sidebarOpen = isExpanded;
                saveState();
            };
            container.appendChild(toggle);

            document.body.appendChild(container);
        },

        createTreeNode: function(node) {
            const li = createEl('li', 'nav-item');
            if (!node.children || node.children.length === 0) li.classList.add('leaf');

            const content = createEl('div', 'nav-item-content');
            content.dataset.id = node.id;
            if (node.trigger) content.dataset.trigger = node.trigger;
            if (node.url) content.dataset.url = node.url;

            // Determine Expansion State
            // Default: Expanded (true) unless explicitly set to false in state
            let isExpanded = true;
            if (appState.nodeStates[node.id] !== undefined) {
                isExpanded = appState.nodeStates[node.id];
            }

            // Icon/Toggle
            if (node.children && node.children.length > 0) {
                const toggle = createEl('span', 'nav-toggle', isExpanded ? '▼' : '▶');
                toggle.style.fontSize = '10px';
                content.appendChild(toggle);
                
                // Toggle Logic
                content.onclick = (e) => {
                    e.stopPropagation();
                    const childrenContainer = li.querySelector('.nav-children');
                    const currentlyExpanded = childrenContainer.classList.contains('expanded');
                    
                    if (currentlyExpanded) {
                        childrenContainer.classList.remove('expanded');
                        toggle.innerText = '▶';
                        appState.nodeStates[node.id] = false;
                    } else {
                        childrenContainer.classList.add('expanded');
                        toggle.innerText = '▼';
                        appState.nodeStates[node.id] = true;
                    }
                    saveState();
                    
                    // If it's a page node, also navigate
                    if (node.url) this.navigateTo(node);
                };
            } else {
                const icon = createEl('span', 'nav-icon', '•');
                content.appendChild(icon);
                content.onclick = (e) => {
                    e.stopPropagation();
                    this.navigateTo(node);
                };
            }

            const title = createEl('span', '', node.title);
            content.appendChild(title);
            
            li.appendChild(content);

            // Children
            if (node.children && node.children.length > 0) {
                const ul = createEl('ul', 'nav-children');
                // Apply expansion state
                if (isExpanded) {
                    ul.classList.add('expanded');
                }
                
                node.children.forEach(child => {
                    ul.appendChild(this.createTreeNode(child));
                });
                li.appendChild(ul);
            }

            return li;
        },

        navigateTo: function(node) {
            const currentPath = window.location.pathname.split('/').pop();
            const targetPath = node.url ? node.url.split('#')[0] : null;

            if (targetPath && targetPath !== currentPath) {
                // Different page
                let url = node.url;
                if (node.trigger) {
                    url += '#' + node.trigger;
                }
                window.location.href = url;
            } else {
                // Same page or no URL (just folder)
                if (node.trigger) {
                    this.handleTrigger(node.trigger);
                    // Update Hash without scrolling
                    history.pushState(null, null, '#' + node.trigger);
                }
            }
        },

        handleTrigger: function(trigger) {
            console.log('Handling trigger:', trigger);
            currentTrigger = trigger;
            this.highlightActiveNode(trigger);

            const [type, value] = trigger.split(':');
            
            // Universal Modal Logic (if page has openModal)
            if (type === 'modal' && typeof window.openModal === 'function') {
                // Close all existing modals first (optional, but cleaner)
                if (typeof window.closeModal === 'function') {
                    document.querySelectorAll('.modal-overlay.active').forEach(el => {
                        window.closeModal(el.id);
                    });
                }
                
                let modalId = value + 'Modal';
                if (value === 'confirmation') modalId = 'dangerModal';
                if (value === 'identifying') modalId = 'faceModal';
                if (value === 'payment') modalId = 'paymentModal'; // standard
                
                if (document.getElementById(modalId)) {
                    window.openModal(modalId);
                    // Special case for danger modal
                    if (modalId === 'dangerModal') {
                         document.getElementById('dangerModal').classList.add('danger-active');
                    }
                }
            }

            // Page Specific Logic
            const page = window.location.pathname.split('/').pop();
            
            if (page === 'terminal_login.html') {
                if (type === 'state') {
                    // Logic for login page
                    const isFace = (value === 'face');
                    const accountBox = document.getElementById('accountLoginBox');
                    const faceBox = document.getElementById('faceLoginBox');
                    const switchBtn = document.getElementById('switchBtn');
                    
                    if (isFace) {
                        if (accountBox) accountBox.style.display = 'none';
                        if (faceBox) faceBox.classList.add('active');
                        if (switchBtn) switchBtn.innerText = '切换账号密码登录';
                    } else {
                        if (accountBox) accountBox.style.display = 'flex';
                        if (faceBox) faceBox.classList.remove('active');
                        if (switchBtn) switchBtn.innerText = '切换刷脸登录';
                    }
                }
            }
            
            if (page === 'terminal_home.html') {
                 if (type === 'state' && value === 'default') {
                     // Close all modals
                     document.querySelectorAll('.modal-overlay.active').forEach(el => {
                        el.classList.remove('active');
                        el.classList.remove('danger-active'); // specific for danger
                     });
                 }
            }

            if (page === 'terminal_result.html') {
                if (type === 'state') {
                    const success = document.getElementById('successState');
                    const fail = document.getElementById('failState');
                    if (value === 'success') {
                        success.style.display = 'block';
                        fail.style.display = 'none';
                    } else if (value === 'failure') {
                        success.style.display = 'none';
                        fail.style.display = 'block';
                    }
                }
            }
        },

        setupHashListener: function() {
            window.addEventListener('hashchange', () => {
                const trigger = window.location.hash.substring(1);
                this.handleTrigger(trigger);
            });
        },

        highlightActiveNode: function(trigger) {
            // Remove all active
            document.querySelectorAll('.nav-item-content.active').forEach(el => el.classList.remove('active'));
            
            // Find node
            const target = document.querySelector(`.nav-item-content[data-trigger="${trigger}"]`);
            if (target) {
                target.classList.add('active');
                // We no longer strictly enforce auto-expand here because state is manual now
                // But we can ensure the path to the active node is visible
                let parent = target.closest('.nav-children');
                while (parent) {
                    if (!parent.classList.contains('expanded')) {
                        parent.classList.add('expanded');
                        // Also update state to keep it open?
                        // Yes, if it was closed, we should probably open it to show the active item
                        // But let's check if we have an ID for the parent node
                        const parentItem = parent.parentElement.querySelector('.nav-item-content');
                        if (parentItem && parentItem.dataset.id) {
                            appState.nodeStates[parentItem.dataset.id] = true;
                        }
                        const toggle = parent.previousElementSibling.querySelector('.nav-toggle');
                        if (toggle) toggle.innerText = '▼';
                    }
                    parent = parent.parentElement.closest('.nav-children');
                }
                saveState();
            }
        },
        
        highlightCurrentPageOnly: function() {
            const page = window.location.pathname.split('/').pop();
            const target = document.querySelector(`.nav-item-content[data-url^="${page}"]`); // simple match
             if (target) {
                 target.classList.add('current-page');
                 // Ensure visibility
                 let parent = target.closest('.nav-children');
                 while (parent) {
                     if (!parent.classList.contains('expanded')) {
                         parent.classList.add('expanded');
                         const parentItem = parent.parentElement.querySelector('.nav-item-content');
                         if (parentItem && parentItem.dataset.id) {
                            appState.nodeStates[parentItem.dataset.id] = true;
                         }
                         const toggle = parent.previousElementSibling.querySelector('.nav-toggle');
                         if (toggle) toggle.innerText = '▼';
                     }
                     parent = parent.parentElement.closest('.nav-children');
                 }
                 saveState();
             }
        },

        hookPageLogic: function() {
            // Bi-directional interaction: Page -> Nav
            const originalOpenModal = window.openModal;
            if (originalOpenModal) {
                window.openModal = (id) => {
                    originalOpenModal(id);
                    let trigger = '';
                    if (id === 'faceModal') trigger = 'modal:identifying';
                    else if (id === 'dangerModal') trigger = 'modal:confirmation';
                    else if (id === 'passwordModal') trigger = 'modal:password';
                    else if (id === 'paymentModal') trigger = 'modal:payment';
                    else if (id === 'accountModal') trigger = 'modal:account';
                    else if (id === 'visitorModal') trigger = 'modal:visitor';
                    else trigger = 'modal:' + id.replace('Modal', '').toLowerCase();

                    if (trigger) {
                        this.highlightActiveNode(trigger);
                    }
                };
            }

            const originalCloseModal = window.closeModal;
            if (originalCloseModal) {
                window.closeModal = (id) => {
                    originalCloseModal(id);
                    const activeModals = document.querySelectorAll('.modal-overlay.active');
                    if (activeModals.length === 0) {
                        this.highlightActiveNode('state:default');
                    }
                };
            }
            
            const originalToggleLogin = window.toggleLoginMode;
            if (originalToggleLogin) {
                window.toggleLoginMode = () => {
                    originalToggleLogin();
                    const faceBox = document.getElementById('faceLoginBox');
                    if (faceBox && faceBox.classList.contains('active')) {
                        this.highlightActiveNode('state:face');
                    } else {
                        this.highlightActiveNode('state:account');
                    }
                }
            }

            const originalToggleState = window.toggleState;
            if (originalToggleState) {
                window.toggleState = () => {
                    originalToggleState();
                    const success = document.getElementById('successState');
                    if (success && success.style.display !== 'none') {
                        this.highlightActiveNode('state:success');
                    } else {
                        this.highlightActiveNode('state:failure');
                    }
                }
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PrototypeNav.init());
    } else {
        PrototypeNav.init();
    }

})();
