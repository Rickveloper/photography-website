/**
 * Performance optimization utilities
 * Handles image lazy loading, intersection observer optimizations,
 * and other performance enhancements for smooth animations
 */

(() => {
  'use strict';

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Performance configuration
  const config = {
    // Image loading
    imageLoadDelay: 100,
    intersectionThreshold: 0.1,
    intersectionRootMargin: '50px 0px',
    
    // Animation performance
    maxConcurrentAnimations: 5,
    animationStaggerDelay: 50,
    
    // Parallax performance
    parallaxThrottleDelay: 16, // ~60fps
    parallaxSpeed: 0.5
  };

  // Throttle function for performance
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Debounce function for performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Optimized image lazy loading
  function initImageLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images immediately
      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.loading = 'eager';
      });
      return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Add loading class for visual feedback
          img.classList.add('loading');
          
          // Load image with slight delay to prevent overwhelming the browser
          setTimeout(() => {
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            
            // Remove loading class and add loaded class
            img.classList.remove('loading');
            img.classList.add('loaded');
            
            // Unobserve after loading
            imageObserver.unobserve(img);
          }, config.imageLoadDelay);
        }
      });
    }, {
      rootMargin: config.intersectionRootMargin,
      threshold: config.intersectionThreshold
    });

    // Observe all lazy-loaded images
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Optimized parallax scrolling
  function initParallaxScrolling() {
    if (prefersReducedMotion) return;

    const parallaxElements = document.querySelectorAll('.parallax-bg, .hero-image');
    if (parallaxElements.length === 0) return;

    let ticking = false;

    function updateParallax() {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach((element, index) => {
        // Stagger parallax speeds for depth effect
        const speed = config.parallaxSpeed * (1 + index * 0.1);
        const yPos = -(scrolled * speed);
        
        // Use transform3d for hardware acceleration
        element.style.transform = `translate3d(0, ${yPos}px, 0) scale(1.05)`;
      });
      
      ticking = false;
    }

    const throttledParallax = throttle(updateParallax, config.parallaxThrottleDelay);

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', throttledParallax, { passive: true });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('scroll', throttledParallax);
    });
  }

  // Optimize animations for performance
  function optimizeAnimations() {
    // Add will-change property to animated elements
    const animatedElements = document.querySelectorAll(
      '.fade-in, .slide-in, .scale-in, .portfolio-item, .blog-card, .image-hover'
    );

    animatedElements.forEach(element => {
      // Only add will-change if element is visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.willChange = 'opacity, transform';
          } else {
            // Remove will-change when not visible to save resources
            entry.target.style.willChange = 'auto';
          }
        });
      });

      observer.observe(element);
    });
  }

  // Preload critical resources
  function preloadCriticalResources() {
    // Preload next likely navigation pages
    const criticalPages = ['about.html', 'blog.html', 'contact.html'];
    
    criticalPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });

    // Preload critical images
    const criticalImages = [
      'public/images/hero/hero-960.webp',
      'public/images/hero/hero-1440.webp'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  // Optimize scroll performance
  function optimizeScrollPerformance() {
    // Use passive event listeners for better performance
    const passiveEvents = ['scroll', 'touchstart', 'touchmove'];
    
    passiveEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {}, { passive: true });
    });

    // Optimize scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  // Initialize all performance optimizations
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize optimizations
    initImageLazyLoading();
    initParallaxScrolling();
    optimizeAnimations();
    preloadCriticalResources();
    optimizeScrollPerformance();

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance optimizations initialized');
    }
  }

  // Start initialization
  init();

  // Export for potential external use
  window.PerformanceOptimizer = {
    init,
    throttle,
    debounce,
    config
  };

})();
