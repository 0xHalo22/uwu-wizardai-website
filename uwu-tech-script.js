document.addEventListener('DOMContentLoaded', () => {
    // Parallax scrolling effect
    const handleScroll = () => {
        const cards = document.querySelectorAll('.bot-card');
        
        cards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const speed = parseFloat(card.getAttribute('data-speed')) || 0.1;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight * 0.8) {
                card.classList.add('visible');
                const yPos = (cardTop - windowHeight) * speed;
                card.style.transform = `translateY(${yPos}px)`;
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
});