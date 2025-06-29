// Hide Left Navigation Plugin for Material for MkDocs
// This plugin hides the left navigation sidebar but keeps the right TOC with toggle functionality

(function() {
    'use strict';

    // Wait for the page to load
    document.addEventListener('DOMContentLoaded', function() {
        // Function to hide the left navigation only
        function hideLeftNavigation() {
            // Hide the main navigation container (left nav)
            const nav = document.querySelector('.md-nav--primary');
            if (nav) {
                nav.style.display = 'none';
            }

            // Hide the navigation toggle button (left nav toggle)
            const navToggle = document.querySelector('[data-md-toggle="drawer"]');
            if (navToggle) {
                navToggle.style.display = 'none';
            }

            // Adjust the main content area to use full width from left
            const main = document.querySelector('.md-main');
            if (main) {
                main.style.marginLeft = '0';
            }

            // Adjust the main content inner container
            const mainInner = document.querySelector('.md-main__inner');
            if (mainInner) {
                mainInner.style.marginLeft = '0';
                mainInner.style.paddingLeft = '0';
            }

            // Hide the left drawer overlay
            const drawer = document.querySelector('.md-drawer--primary');
            if (drawer) {
                drawer.style.display = 'none';
            }

            // Remove any left drawer-related classes from body
            document.body.classList.remove('md-nav--open');
        }

        // Function to create and add the TOC toggle button
        function createTocToggle() {
            // Check if toggle already exists
            if (document.getElementById('toc-toggle')) {
                return;
            }

            // Create the toggle button
            const toggleButton = document.createElement('button');
            toggleButton.id = 'toc-toggle';
            toggleButton.className = 'md-header__button toc-toggle';
            toggleButton.setAttribute('aria-label', 'Toggle table of contents');
            toggleButton.setAttribute('data-md-toggle', 'toc');
            
            // Create the hamburger icon
            const icon = document.createElement('span');
            icon.className = 'toc-toggle-icon';
            icon.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
            `;
            
            toggleButton.appendChild(icon);
            
            // Add click event
            toggleButton.addEventListener('click', function() {
                toggleToc();
            });
            
            // Insert the button into the header
            const header = document.querySelector('.md-header');
            if (header) {
                const headerInner = header.querySelector('.md-header__inner');
                if (headerInner) {
                    // Insert before the search button or at the end
                    const searchButton = headerInner.querySelector('.md-header__button[data-md-toggle="search"]');
                    if (searchButton) {
                        headerInner.insertBefore(toggleButton, searchButton);
                    } else {
                        headerInner.appendChild(toggleButton);
                    }
                }
            }
        }

        // Function to toggle the TOC
        function toggleToc() {
            const toc = document.querySelector('.md-nav--secondary');
            const toggleButton = document.getElementById('toc-toggle');
            
            if (toc && toggleButton) {
                const isVisible = !toc.classList.contains('toc-hidden');
                
                if (isVisible) {
                    // Hide TOC
                    toc.classList.add('toc-hidden');
                    toggleButton.classList.add('toc-hidden');
                } else {
                    // Show TOC
                    toc.classList.remove('toc-hidden');
                    toggleButton.classList.remove('toc-hidden');
                }
            }
        }

        // Function to initialize TOC state
        function initializeToc() {
            const toc = document.querySelector('.md-nav--secondary');
            if (toc) {
                // Add transition class for smooth animations
                toc.classList.add('toc-transition');
                
                // Check if we should start with TOC hidden (mobile view)
                if (window.innerWidth < 1220) {
                    toc.classList.add('toc-hidden');
                    const toggleButton = document.getElementById('toc-toggle');
                    if (toggleButton) {
                        toggleButton.classList.add('toc-hidden');
                    }
                }
            }
        }

        // Hide left navigation immediately
        hideLeftNavigation();

        // Create TOC toggle button
        createTocToggle();

        // Initialize TOC state
        setTimeout(initializeToc, 100);

        // Handle window resize
        window.addEventListener('resize', function() {
            hideLeftNavigation();
            createTocToggle();
        });
        
        // Use MutationObserver to handle dynamic content changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    hideLeftNavigation();
                    createTocToggle();
                }
            });
        });

        // Observe changes to the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });

    // Also run on page load events
    window.addEventListener('load', function() {
        setTimeout(function() {
            const nav = document.querySelector('.md-nav--primary');
            if (nav) {
                nav.style.display = 'none';
            }
            
            const navToggle = document.querySelector('[data-md-toggle="drawer"]');
            if (navToggle) {
                navToggle.style.display = 'none';
            }
        }, 200);
    });

})(); 