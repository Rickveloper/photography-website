/**
 * Accessibility Menu Functionality
 * Provides font size adjustment, high contrast mode, dyslexia-friendly fonts, and skip links
 */

(function() {
    'use strict';

    // Initialize accessibility menu when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initAccessibilityMenu();
    });

    function initAccessibilityMenu() {
        // Create accessibility toggle button
        createAccessibilityToggle();
        
        // Create accessibility panel
        createAccessibilityPanel();
        
        // Load saved preferences
        loadAccessibilityPreferences();
        
        // Set up keyboard shortcuts
        setupKeyboardShortcuts();
    }

    function createAccessibilityToggle() {
        // Check if toggle already exists
        if (document.getElementById('accessibility-toggle')) return;

        const toggle = document.createElement('button');
        toggle.id = 'accessibility-toggle';
        toggle.setAttribute('aria-label', 'Accessibility Options');
        toggle.innerHTML = '<i data-feather="settings" class="w-5 h-5"></i>';
        
        // Add click event
        toggle.addEventListener('click', function() {
            toggleAccessibilityPanel();
        });

        document.body.appendChild(toggle);
        
        // Re-render feather icons
        if (window.feather) {
            feather.replace();
        }
    }

    function createAccessibilityPanel() {
        // Check if panel already exists
        if (document.getElementById('accessibility-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'hidden';
        panel.innerHTML = `
            <h3>Accessibility Options</h3>
            
            <div class="accessibility-group">
                <label>Font Size</label>
                <div class="button-group">
                    <button class="font-size-btn" data-size="small">A</button>
                    <button class="font-size-btn active" data-size="medium">A</button>
                    <button class="font-size-btn" data-size="large">A</button>
                    <button class="font-size-btn" data-size="extra-large">A</button>
                </div>
            </div>
            
            <div class="accessibility-group">
                <label>
                    <input type="checkbox" id="high-contrast-toggle">
                    High Contrast Mode
                </label>
            </div>
            
            <div class="accessibility-group">
                <label>
                    <input type="checkbox" id="dyslexia-font-toggle">
                    Dyslexia-Friendly Font
                </label>
            </div>
            
            <div class="accessibility-group">
                <label>Quick Navigation</label>
                <div class="skip-links">
                    <a href="#main-content">Skip to Content</a>
                    <a href="#portfolio">Portfolio</a>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                    <a href="#blog">Journal</a>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        
        // Add event listeners
        setupPanelEventListeners(panel);
    }

    function setupPanelEventListeners(panel) {
        // Font size buttons
        const fontSizeButtons = panel.querySelectorAll('.font-size-btn');
        fontSizeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const size = this.getAttribute('data-size');
                setFontSize(size);
                
                // Update active state
                fontSizeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // High contrast toggle
        const highContrastToggle = panel.querySelector('#high-contrast-toggle');
        highContrastToggle.addEventListener('change', function() {
            toggleHighContrast(this.checked);
        });

        // Dyslexia font toggle
        const dyslexiaToggle = panel.querySelector('#dyslexia-font-toggle');
        dyslexiaToggle.addEventListener('change', function() {
            toggleDyslexiaFont(this.checked);
        });

        // Skip links
        const skipLinks = panel.querySelectorAll('.skip-links a');
        skipLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    target.focus();
                }
                // Close panel after navigation
                hideAccessibilityPanel();
            });
        });
    }

    function toggleAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        if (panel) {
            panel.classList.toggle('hidden');
        }
    }

    function hideAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    function setFontSize(size) {
        // Remove existing font size classes
        document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
        
        // Add new font size class
        if (size !== 'medium') {
            document.body.classList.add(`font-${size}`);
        }
        
        // Save preference
        localStorage.setItem('accessibility-font-size', size);
    }

    function toggleHighContrast(enabled) {
        if (enabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        // Save preference
        localStorage.setItem('accessibility-high-contrast', enabled);
    }

    function toggleDyslexiaFont(enabled) {
        if (enabled) {
            document.body.classList.add('dyslexia-font');
        } else {
            document.body.classList.remove('dyslexia-font');
        }
        
        // Save preference
        localStorage.setItem('accessibility-dyslexia-font', enabled);
    }

    function loadAccessibilityPreferences() {
        // Load font size
        const savedFontSize = localStorage.getItem('accessibility-font-size');
        if (savedFontSize && savedFontSize !== 'medium') {
            setFontSize(savedFontSize);
            
            // Update button state
            const activeButton = document.querySelector(`[data-size="${savedFontSize}"]`);
            if (activeButton) {
                document.querySelectorAll('.font-size-btn').forEach(btn => btn.classList.remove('active'));
                activeButton.classList.add('active');
            }
        }

        // Load high contrast
        const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
        if (savedHighContrast) {
            document.getElementById('high-contrast-toggle').checked = true;
            toggleHighContrast(true);
        }

        // Load dyslexia font
        const savedDyslexiaFont = localStorage.getItem('accessibility-dyslexia-font') === 'true';
        if (savedDyslexiaFont) {
            document.getElementById('dyslexia-font-toggle').checked = true;
            toggleDyslexiaFont(true);
        }
    }

    function setupKeyboardShortcuts() {
        // Alt + A to toggle accessibility menu
        document.addEventListener('keydown', function(e) {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                toggleAccessibilityPanel();
            }
        });

        // Escape to close accessibility panel
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hideAccessibilityPanel();
            }
        });
    }

    // Close panel when clicking outside
    document.addEventListener('click', function(e) {
        const panel = document.getElementById('accessibility-panel');
        const toggle = document.getElementById('accessibility-toggle');
        
        if (panel && !panel.classList.contains('hidden') && 
            !panel.contains(e.target) && 
            !toggle.contains(e.target)) {
            hideAccessibilityPanel();
        }
    });

    // Expose functions globally for external use
    window.AccessibilityMenu = {
        toggle: toggleAccessibilityPanel,
        setFontSize: setFontSize,
        toggleHighContrast: toggleHighContrast,
        toggleDyslexiaFont: toggleDyslexiaFont
    };

})();
