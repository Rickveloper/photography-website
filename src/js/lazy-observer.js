/**
 * Enhanced scroll-triggered animations using IntersectionObserver
 * Provides smooth fade/slide animations for elements entering viewport
 * Optimized for performance with will-change and GPU acceleration
 */
(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
  // Exit early if user prefers reduced motion
  if (prefersReduced) {
    // Still add loaded class for basic functionality
    document.querySelectorAll(".fade-in, .slide-in, .scale-in").forEach((el) => {
      el.classList.add("loaded", "animate-in");
    });
    return;
  }

  // Check for IntersectionObserver support
  if (!("IntersectionObserver" in window)) {
    // Fallback: add loaded class immediately
    document.querySelectorAll(".fade-in, .slide-in, .scale-in").forEach((el) => {
      el.classList.add("loaded", "animate-in");
    });
    return;
  }

  // Throttle function for performance optimization
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

  // Animation configuration
  const animationConfig = {
    rootMargin: "50px 0px",
    threshold: 0.1,
    // Stagger delay for multiple elements
    staggerDelay: 100
  };

  // Create intersection observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Add stagger delay for multiple elements
          setTimeout(() => {
            element.classList.add("loaded", "animate-in");
            
            // Trigger custom animation events
            element.dispatchEvent(new CustomEvent('animateIn', {
              detail: { element, entry }
            }));
          }, index * animationConfig.staggerDelay);

          // Unobserve after animation
          observer.unobserve(element);
        }
      });
    },
    animationConfig
  );

  // Observe all animation elements
  const animationElements = document.querySelectorAll(
    ".fade-in, .slide-in, .scale-in, .slide-in-left, .slide-in-right, .fade-in-up, .product-card, [data-aos], .portfolio-item, .blog-card"
  );
  
  animationElements.forEach((el, index) => {
    // Add initial state classes
    if (el.classList.contains("fade-in")) {
      el.classList.add("opacity-0");
    }
    if (el.classList.contains("slide-in")) {
      el.classList.add("opacity-0", "translate-y-8");
    }
    if (el.classList.contains("scale-in")) {
      el.classList.add("opacity-0", "scale-95");
    }
    if (el.classList.contains("slide-in-left")) {
      el.classList.add("opacity-0", "-translate-x-8");
    }
    if (el.classList.contains("slide-in-right")) {
      el.classList.add("opacity-0", "translate-x-8");
    }
    if (el.classList.contains("fade-in-up")) {
      el.classList.add("opacity-0", "translate-y-6");
    }
    if (el.classList.contains("product-card")) {
      el.classList.add("opacity-0", "translate-y-4", "scale-98");
    }
    
    // Add staggered animation delay for grid items
    if (el.closest('.grid') || el.closest('.blog-grid') || el.closest('#product-grid')) {
      const staggerDelay = (index % 6) * 0.1; // Stagger every 6 items
      el.style.transitionDelay = `${staggerDelay}s`;
    }
    
    // Add will-change for GPU acceleration
    el.style.willChange = "opacity, transform";
    
    observer.observe(el);
  });

  // Enhanced parallax scroll effect for hero section
  let ticking = false;
  let lastScrollY = 0;
  
  function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero-section');
    
    // Only apply parallax if hero section is in view
    if (heroSection) {
      const heroRect = heroSection.getBoundingClientRect();
      const heroHeight = heroSection.offsetHeight;
      
      // Check if hero section is visible
      if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
        // Enhanced parallax background layer
        const parallaxBg = document.querySelector('.parallax-bg');
        if (parallaxBg) {
          const bgSpeed = 0.3; // Slower background movement
          const bgYPos = -(scrolled * bgSpeed);
          parallaxBg.style.setProperty('--scroll-offset', `${bgYPos}px`);
          parallaxBg.style.transform = `translateY(${bgYPos}px) scale(1.1)`;
        }
        
        // Hero image parallax effect
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
          const imageSpeed = 0.5; // Faster image movement for depth
          const imageYPos = -(scrolled * imageSpeed);
          heroImage.style.setProperty('--scroll-offset', `${imageYPos}px`);
          heroImage.style.transform = `translateY(${imageYPos}px) scale(1.1) translateZ(0)`;
        }
      }
    }
    
    lastScrollY = scrolled;
    ticking = false;
  }

  function requestParallaxUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  // Add parallax scroll listener with throttling
  window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  
  // Initialize parallax on page load
  requestParallaxUpdate();

  // Cleanup function for performance
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
    window.removeEventListener('scroll', requestParallaxUpdate);
  });

})();
