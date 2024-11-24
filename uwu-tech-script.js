document.addEventListener('DOMContentLoaded', () => {
    // Initialize parallax and animation system
    const cards = document.querySelectorAll('.bot-card');
    let lastScrollPosition = window.scrollY;
    let ticking = false;

    // Intersection Observer for card animations
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Add dynamic parallax data if not present
                if (!entry.target.dataset.speed) {
                    entry.target.dataset.speed = (Math.random() * 0.1 + 0.05).toFixed(3);
                }
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '50px'
    });

    // Observe each card
    cards.forEach(card => cardObserver.observe(card));

    // Optimized scroll handler with requestAnimationFrame
    const handleScroll = () => {
        lastScrollPosition = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax(lastScrollPosition);
                ticking = false;
            });
            ticking = true;
        }
    };

    // Parallax effect function
    const updateParallax = (scrollPos) => {
        cards.forEach(card => {
            const speed = parseFloat(card.dataset.speed) || 0.1;
            const rect = card.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Only animate if card is in viewport
            if (rect.top < viewportHeight && rect.bottom > 0) {
                const yPos = (rect.top - viewportHeight) * speed;
                card.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });
    };

    // Add magic sparkles on hover
    const addSparkleEffect = (element) => {
        element.addEventListener('mousemove', (e) => {
            if (Math.random() > 0.8) { // Throttle sparkle creation
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                createSparkle(x, y, element);
            }
        });
    };

    // Create sparkle elements
    const createSparkle = (x, y, parent) => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = '✨';
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.fontSize = Math.random() * 10 + 10 + 'px';
        parent.appendChild(sparkle);

        // Remove sparkle after animation
        sparkle.addEventListener('animationend', () => sparkle.remove());
    };

    // Add sparkle effect to cards and wizard emoji
    cards.forEach(card => addSparkleEffect(card));
    addSparkleEffect(document.querySelector('.main-wizard-emoji'));

    // Enhanced hover animations for magic emojis
    const magicEmojis = document.querySelectorAll('.magic-emoji');
    magicEmojis.forEach(emoji => {
        emoji.addEventListener('mouseenter', () => {
            emoji.style.transform = 'scale(1.2) rotate(15deg)';
            createSparkle(
                emoji.offsetWidth / 2,
                emoji.offsetHeight / 2,
                emoji
            );
        });
        
        emoji.addEventListener('mouseleave', () => {
            emoji.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
        updateParallax(window.scrollY);
    });

    // Initial parallax update
    updateParallax(window.scrollY);
});