(() => {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const elements = Array.from(document.querySelectorAll('.fade-in'));
    if (!('IntersectionObserver' in window) || elements.length === 0) {
        elements.forEach(el => el.classList.add('loaded'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                io.unobserve(entry.target);
            }
        });
    }, { rootMargin: '100px 0px', threshold: 0.01 });

    elements.forEach(el => io.observe(el));
})();


