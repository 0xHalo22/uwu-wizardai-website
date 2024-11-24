document.addEventListener('DOMContentLoaded', () => {
    const emojiContainer = document.getElementById('emoji-container');
    const emojis = ['🧙‍♂️', '🔮', '🌙', '✨', '⭐', '🌟', '💫'];
    const sparkleTypes = ['✨', '⭐', '🌟', '💫'];
    const burstEmojis = ['✨', '💫', '⭐', '🌟'];
    const emojiElements = [];
    const numberOfEmojis = 150; // Optimized number for better performance
    let mouseX = 0;
    let mouseY = 0;
    let lastSparkleTime = 0;
    let isRunning = true;
    const sparkleInterval = 50;

    // Create and add emoji elements with optimized initial positioning
    function initializeEmojis() {
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < numberOfEmojis; i++) {
            const emojiElement = document.createElement('div');
            emojiElement.className = 'emoji';
            emojiElement.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            
            const initialX = Math.random() * window.innerWidth;
            const initialY = Math.random() * window.innerHeight;
            const scale = 0.5 + Math.random() * 1.5;
            const duration = 4 + Math.random() * 4;
            const delay = Math.random() * -duration;
            const rotation = Math.random() * 360;
            
            Object.assign(emojiElement.style, {
                left: `${initialX}px`,
                top: `${initialY}px`,
                fontSize: `${scale}em`,
                transform: `rotate(${rotation}deg)`
            });
            
            fragment.appendChild(emojiElement);
            
            emojiElements.push({
                element: emojiElement,
                x: initialX,
                y: initialY,
                rotation: rotation,
                speedX: 0,
                speedY: 0,
                rotationSpeed: (Math.random() - 0.5) * 2,
                baseScale: scale
            });
        }
        
        emojiContainer.appendChild(fragment);
    }

    // Optimized sparkle creation
    function createEnhancedSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = sparkleTypes[Math.floor(Math.random() * sparkleTypes.length)];
        
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        Object.assign(sparkle.style, {
            left: `${x + offsetX}px`,
            top: `${y + offsetY}px`,
            fontSize: `${0.5 + Math.random()}em`,
            opacity: Math.random() * 0.5 + 0.5,
            transform: `rotate(${Math.random() * 360}deg)`
        });

        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1500);
    }

    // Enhanced magic burst effect
    function createMagicBurst(x, y) {
        for (let i = 0; i < 8; i++) {
            const burst = document.createElement('div');
            burst.className = 'magic-burst';
            burst.textContent = burstEmojis[Math.floor(Math.random() * burstEmojis.length)];
            
            Object.assign(burst.style, {
                left: `${x}px`,
                top: `${y}px`,
                transform: `rotate(${i * 45}deg)`,
                animationDelay: `${i * 0.1}s`
            });
            
            document.body.appendChild(burst);
            setTimeout(() => burst.remove(), 1000);
        }
    }

    // Optimized animation loop using requestAnimationFrame
    function animate() {
        if (!isRunning) return;

        emojiElements.forEach(item => {
            const rect = item.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = centerX - mouseX;
            const deltaY = centerY - mouseY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance < 300) {
                const angle = Math.atan2(deltaY, deltaX);
                const force = (300 - distance) / 300;
                const targetSpeedX = Math.cos(angle) * force * 20;
                const targetSpeedY = Math.sin(angle) * force * 20;
                
                item.speedX += (targetSpeedX - item.speedX) * 0.2;
                item.speedY += (targetSpeedY - item.speedY) * 0.2;
                item.rotation += item.rotationSpeed;
            } else {
                item.speedX *= 0.95;
                item.speedY *= 0.95;
            }
            
            item.x += item.speedX;
            item.y += item.speedY;
            
            item.element.style.transform = `translate3d(${item.speedX * 10}px, ${item.speedY * 10}px, 0) rotate(${item.rotation}deg) scale(${item.baseScale})`;
        });
        
        requestAnimationFrame(animate);
    }

    // Event listeners with throttling
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const currentTime = Date.now();
        if (currentTime - lastSparkleTime > sparkleInterval) {
            createEnhancedSparkle(mouseX, mouseY);
            lastSparkleTime = currentTime;
        }
    });

    document.addEventListener('click', (e) => {
        createMagicBurst(e.clientX, e.clientY);
    });

    // Handle visibility changes for performance
    document.addEventListener('visibilitychange', () => {
        isRunning = !document.hidden;
        if (isRunning) {
            animate();
        }
    });

    // Initialize and start animation
    initializeEmojis();
    animate();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            emojiElements.forEach(item => {
                if (item.x > width) item.x = width - 20;
                if (item.y > height) item.y = height - 20;
            });
        }, 250);
    });
});