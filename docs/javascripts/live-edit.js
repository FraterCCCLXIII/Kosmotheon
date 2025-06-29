// Live Edit Plugin for Kosmotheon
// Makes content editable on localhost with auto-save functionality

(function() {
    'use strict';
    
    // Only activate on localhost
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return;
    }
    
    console.log('Live Edit Plugin: Active on localhost');
    
    // Global state
    let isLiveEditEnabled = localStorage.getItem('liveEditEnabled') === 'true';
    let toggleButton = null;
    let saveButton = null;
    let statusIndicator = null;
    let originalContent = {};
    let autoSaveTimer = null;
    
    // Create toggle button
    function createToggleButton() {
        // Create toggle button
        toggleButton = document.createElement('button');
        toggleButton.id = 'live-edit-toggle';
        toggleButton.innerHTML = isLiveEditEnabled ? '✏️ Live Edit ON' : '✏️ Live Edit OFF';
        toggleButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: ${isLiveEditEnabled ? '#4CAF50' : '#f44336'};
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        `;
        
        // Create save button
        saveButton = document.createElement('button');
        saveButton.id = 'live-edit-save';
        saveButton.innerHTML = '💾 Save All';
        saveButton.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            z-index: 1000;
            background: #2196F3;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            display: ${isLiveEditEnabled ? 'block' : 'none'};
        `;
        
        // Create status indicator
        statusIndicator = document.createElement('div');
        statusIndicator.id = 'live-edit-status';
        statusIndicator.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1000;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            display: none;
            max-width: 200px;
            word-wrap: break-word;
        `;
        
        // Add event listeners
        toggleButton.addEventListener('click', toggleLiveEdit);
        saveButton.addEventListener('click', saveAllChanges);
        
        // Add to page
        document.body.appendChild(toggleButton);
        document.body.appendChild(saveButton);
        document.body.appendChild(statusIndicator);
        
        // Initialize based on current state
        if (isLiveEditEnabled) {
            enableLiveEdit();
        }
    }
    
    // Toggle live edit functionality
    function toggleLiveEdit() {
        isLiveEditEnabled = !isLiveEditEnabled;
        localStorage.setItem('liveEditEnabled', isLiveEditEnabled);
        
        if (isLiveEditEnabled) {
            enableLiveEdit();
            toggleButton.innerHTML = '✏️ Live Edit ON';
            toggleButton.style.background = '#4CAF50';
            saveButton.style.display = 'block';
            showStatus('Live Edit enabled', 'success');
        } else {
            disableLiveEdit();
            toggleButton.innerHTML = '✏️ Live Edit OFF';
            toggleButton.style.background = '#f44336';
            saveButton.style.display = 'none';
            showStatus('Live Edit disabled', 'info');
        }
    }
    
    // Enable live edit functionality
    function enableLiveEdit() {
        makeContentEditable();
        addKeyboardShortcuts();
        showStatus('Live Edit enabled - Click any text to edit', 'success');
    }
    
    // Disable live edit functionality
    function disableLiveEdit() {
        makeContentReadOnly();
        showStatus('Live Edit disabled', 'info');
    }
    
    // Make content editable
    function makeContentEditable() {
        const contentElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, blockquote');
        
        contentElements.forEach(element => {
            if (!element.hasAttribute('data-live-edit-initialized')) {
                element.setAttribute('data-live-edit-initialized', 'true');
                element.setAttribute('contenteditable', 'true');
                element.style.outline = 'none';
                element.style.transition = 'background-color 0.3s ease';
                
                // Store original content
                const elementId = getElementPath(element);
                originalContent[elementId] = element.innerHTML;
                element.setAttribute('data-original-content', element.innerHTML);
                
                // Add hover effect
                element.addEventListener('mouseenter', function() {
                    if (isLiveEditEnabled) {
                        this.style.backgroundColor = 'rgba(255, 255, 0, 0.1)';
                        this.style.cursor = 'text';
                    }
                });
                
                element.addEventListener('mouseleave', function() {
                    if (isLiveEditEnabled) {
                        this.style.backgroundColor = '';
                    }
                });
                
                // Add focus/blur effects
                element.addEventListener('focus', function() {
                    if (isLiveEditEnabled) {
                        this.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
                        this.style.border = '2px solid #4CAF50';
                        this.style.borderRadius = '4px';
                        this.style.padding = '4px';
                    }
                });
                
                element.addEventListener('blur', function() {
                    if (isLiveEditEnabled) {
                        this.style.backgroundColor = '';
                        this.style.border = '';
                        this.style.borderRadius = '';
                        this.style.padding = '';
                        
                        // Auto-save on blur
                        setTimeout(() => saveContent(this), 100);
                    }
                });
                
                // Add input event for real-time saving
                element.addEventListener('input', function() {
                    if (isLiveEditEnabled) {
                        clearTimeout(this.saveTimeout);
                        this.saveTimeout = setTimeout(() => saveContent(this), 1000);
                    }
                });
            }
        });
    }
    
    // Make content read-only
    function makeContentReadOnly() {
        const contentElements = document.querySelectorAll('[contenteditable="true"]');
        
        contentElements.forEach(element => {
            element.setAttribute('contenteditable', 'false');
            element.style.backgroundColor = '';
            element.style.border = '';
            element.style.borderRadius = '';
            element.style.padding = '';
            element.style.cursor = '';
        });
    }
    
    // Add keyboard shortcuts
    function addKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if (!isLiveEditEnabled) return;
            
            // Ctrl+S or Cmd+S to save all
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveAllChanges();
            }
            
            // Escape to blur current element
            if (e.key === 'Escape') {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.hasAttribute('contenteditable')) {
                    activeElement.blur();
                }
            }
        });
    }
    
    // Save content to server
    function saveContent(element) {
        if (!isLiveEditEnabled) return;
        
        const content = element.innerHTML;
        const elementId = getElementPath(element);
        const filePath = getCurrentFilePath();
        
        if (!filePath) {
            showStatus('Could not determine file path', 'error');
            return;
        }
        
        const data = {
            filePath: filePath,
            elementId: elementId,
            content: content
        };
        
        fetch('http://localhost:8002/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                showStatus('Saved successfully', 'success');
            } else {
                showStatus('Save failed: ' + result.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error saving to server:', error);
            showStatus('Save failed: ' + error.message, 'error');
        });
    }
    
    // Save all changes
    function saveAllChanges() {
        if (!isLiveEditEnabled) return;
        
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        let savedCount = 0;
        
        editableElements.forEach(element => {
            if (element.innerHTML !== element.getAttribute('data-original-content')) {
                saveContent(element);
                savedCount++;
            }
        });
        
        if (savedCount > 0) {
            showStatus(`Saved ${savedCount} changes`, 'success');
        } else {
            showStatus('No changes to save', 'info');
        }
    }
    
    // Get element path for identification
    function getElementPath(element) {
        const path = [];
        let current = element;
        
        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            if (current.id) {
                selector += '#' + current.id;
            } else if (current.className) {
                selector += '.' + current.className.split(' ').join('.');
            }
            path.unshift(selector);
            current = current.parentElement;
        }
        
        return path.join(' > ');
    }
    
    // Get current file path
    function getCurrentFilePath() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') {
            return 'index.md';
        }
        
        // Remove leading slash and .html extension
        let filePath = path.substring(1);
        if (filePath.endsWith('.html')) {
            filePath = filePath.substring(0, filePath.length - 5);
        }
        
        // Convert to markdown
        if (!filePath.endsWith('.md')) {
            filePath += '.md';
        }
        
        return filePath;
    }
    
    // Show status message
    function showStatus(message, type = 'info') {
        if (!statusIndicator) return;
        
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3',
            warning: '#ff9800'
        };
        
        statusIndicator.style.background = colors[type] || colors.info;
        statusIndicator.textContent = message;
        statusIndicator.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusIndicator.style.display = 'none';
        }, 3000);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createToggleButton);
    } else {
        createToggleButton();
    }
    
    // Re-initialize on navigation (for SPA-like behavior)
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            setTimeout(() => {
                if (isLiveEditEnabled) {
                    makeContentEditable();
                }
            }, 500);
        }
    }, 100);
    
})(); 