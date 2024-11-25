document.addEventListener('DOMContentLoaded', () => {
    // Normal scrolling effect for bot cards without affecting emojis
    const handleScroll = () => {
        const cards = document.querySelectorAll('.bot-card');
        
        cards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight * 0.8) {
                card.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
});
