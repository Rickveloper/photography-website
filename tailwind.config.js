// tailwind.config.js
export default {
  content: [
    "./index.html", 
    "./gallery.html",
    "./about.html",
    "./blog.html", 
    "./blog-post.html",
    "./contact.html",
    "./shop.html",
    "./src/**/*.{js,ts,jsx,tsx,html}"
  ],
  // Enable CSS purging for production builds
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      "./index.html", 
      "./gallery.html",
      "./about.html",
      "./blog.html", 
      "./blog-post.html",
      "./contact.html",
      "./shop.html",
      "./src/**/*.{js,ts,jsx,tsx,html}"
    ],
    // Safelist classes that might be dynamically added
    safelist: [
      'loaded',
      'animate-in',
      'opacity-0',
      'translate-y-8',
      'scale-95',
      'portfolio-item',
      'blog-card'
    ]
  },
  theme: { 
    extend: {
      // Add custom animations for better performance
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(2rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      // Optimize transitions for better performance
      transitionProperty: {
        'opacity-transform': 'opacity, transform',
      },
      transitionDuration: {
        '600': '600ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    } 
  },
  plugins: [],
  // Performance optimizations
  corePlugins: {
    // Disable unused features to reduce CSS size
    preflight: true,
    container: false, // We use custom container classes
  },
  // Optimize for production
  future: {
    hoverOnlyWhenSupported: true,
  }
};
