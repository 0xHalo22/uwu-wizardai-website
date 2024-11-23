document.addEventListener('DOMContentLoaded', () => {
    const emojiContainer = document.getElementById('emoji-container');
    const emojis = ['🧙‍♂️', '🔮', '🌙', '✨', '⭐', '🌟', '💫'];
    const emojiElements = [];
    const numberOfEmojis = 200;
    let mouseX = 0;
    let mouseY = 0;
    let frame;

    // Create and add emoji elements
    for (let i = 0; i < numberOfEmojis; i++) {
        const emojiElement = document.createElement('div');
        emojiElement.className = 'emoji';
        emojiElement.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        // Random initial positions and properties
        const initialX = Math.random() * window.innerWidth;
        const initialY = Math.random() * window.innerHeight;
        const scale = 0.5 + Math.random() * 1.5;
        const duration = 4 + Math.random() * 4;
        const delay = Math.random() * -duration;
        
        Object.assign(emojiElement.style, {
            left: `${initialX}px`,
            top: `${initialY}px`,
            fontSize: `${scale}em`,
            animation: `float ${duration}s ease-in-out infinite`,
            animationDelay: `${delay}s`
        });
        
        emojiContainer.appendChild(emojiElement);
        emojiElements.push({
            element: emojiElement,
            x: initialX,
            y: initialY,
            speedX: 0,
            speedY: 0
        });
    }

    // Smooth mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        createSparkle(mouseX, mouseY);
    });

    // Create sparkle effect
    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = '✨';
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1000);
    }

    // Smooth animation function
    function animate() {
        emojiElements.forEach(item => {
            const rect = item.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = centerX - mouseX;
            const deltaY = centerY - mouseY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance < 200) {
                const angle = Math.atan2(deltaY, deltaX);
                const force = (200 - distance) / 200;
                const targetSpeedX = Math.cos(angle) * force * 15;
                const targetSpeedY = Math.sin(angle) * force * 15;
                
                item.speedX += (targetSpeedX - item.speedX) * 0.2;
                item.speedY += (targetSpeedY - item.speedY) * 0.2;
            } else {
                item.speedX *= 0.9;
                item.speedY *= 0.9;
            }
            
            item.x += item.speedX;
            item.y += item.speedY;
            
            item.element.style.transform = `translate(${item.speedX * 10}px, ${item.speedY * 10}px)`;
        });
        
        frame = requestAnimationFrame(animate);
    }

    animate();
});