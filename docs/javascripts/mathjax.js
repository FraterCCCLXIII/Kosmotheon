// MathJax Configuration for Kosmotheon
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
    packages: ['base', 'ams', 'noerrors', 'noundefined']
  },
  options: {
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process'
  },
  startup: {
    pageReady: () => {
      console.log('MathJax is loaded and ready');
    }
  }
};

// Kosmotheon-specific JavaScript enhancements
document.addEventListener('DOMContentLoaded', function() {
  
  // Add smooth scrolling to internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add copy functionality to code blocks
  document.querySelectorAll('pre code').forEach(block => {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.style.cssText = `
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: var(--kosmic-primary);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    
    const pre = block.parentElement;
    pre.style.position = 'relative';
    pre.appendChild(button);
    
    pre.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
    });
    
    pre.addEventListener('mouseleave', () => {
      button.style.opacity = '0';
    });
    
    button.addEventListener('click', () => {
      navigator.clipboard.writeText(block.textContent).then(() => {
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      });
    });
  });

  // Add search highlighting
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q');
  if (searchTerm) {
    const content = document.querySelector('.md-content');
    if (content) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      content.innerHTML = content.innerHTML.replace(regex, '<mark>$1</mark>');
    }
  }

  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchButton = document.querySelector('[data-md-component="search"] button');
      if (searchButton) {
        searchButton.click();
      }
    }
    
    // Escape to close search
    if (e.key === 'Escape') {
      const searchOverlay = document.querySelector('.md-search__overlay');
      if (searchOverlay && searchOverlay.classList.contains('md-search__overlay--active')) {
        const searchButton = document.querySelector('[data-md-component="search"] button');
        if (searchButton) {
          searchButton.click();
        }
      }
    }
  });

  // Add progress indicator for long pages
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, var(--kosmic-primary), var(--kosmic-secondary));
    z-index: 1000;
    transition: width 0.1s ease;
  `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
  });

  // Add table of contents highlighting
  const tocLinks = document.querySelectorAll('.md-nav__link[href^="#"]');
  const sections = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
  
  const observerOptions = {
    rootMargin: '-20% 0px -80% 0px',
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const tocLink = document.querySelector(`.md-nav__link[href="#${id}"]`);
      
      if (entry.isIntersecting) {
        tocLinks.forEach(link => link.classList.remove('active'));
        if (tocLink) {
          tocLink.classList.add('active');
        }
      }
    });
  }, observerOptions);
  
  sections.forEach(section => observer.observe(section));

  // Add dark mode toggle enhancement
  const darkModeToggle = document.querySelector('[data-md-color-scheme]');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      setTimeout(() => {
        // Recalculate any dynamic styles after theme change
        document.documentElement.style.setProperty('--kosmic-bg', 
          getComputedStyle(document.documentElement).getPropertyValue('--md-default-bg-color'));
      }, 100);
    });
  }

  // Add lazy loading for images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));

  // Add tooltip functionality
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  tooltipElements.forEach(element => {
    element.addEventListener('mouseenter', (e) => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = e.target.dataset.tooltip;
      tooltip.style.cssText = `
        position: absolute;
        background: var(--kosmic-text);
        color: var(--kosmic-bg);
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 1000;
        pointer-events: none;
        white-space: nowrap;
      `;
      
      document.body.appendChild(tooltip);
      
      const rect = e.target.getBoundingClientRect();
      tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
      tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    });
    
    element.addEventListener('mouseleave', () => {
      const tooltip = document.querySelector('.tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });
  });

  console.log('Kosmotheon JavaScript enhancements loaded');
}); 