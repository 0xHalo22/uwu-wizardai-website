document.addEventListener('DOMContentLoaded', () => {
    const emojiContainer = document.getElementById('emoji-container');
    const emojis = ['🧙‍♂️', '🔮', '🌙', '✨']; // Wizard, crystal ball, crescent moon, sparkles
    const emojiElements = [];
    const numberOfEmojis = 50;

    // Create and add emoji elements to the container
    for (let i = 0; i < numberOfEmojis; i++) {
        const emojiElement = document.createElement('div');
        emojiElement.className = 'emoji';
        emojiElement.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emojiElement.style.top = `${Math.random() * 100}vh`;
        emojiElement.style.left = `${Math.random() * 100}vw`;
        emojiElement.style.animation = `float ${4 + Math.random() * 4}s ease-in-out infinite`;
        emojiContainer.appendChild(emojiElement);
        emojiElements.push(emojiElement);
    }

    // Add mousemove event listener to make emojis move away from the cursor
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        emojiElements.forEach((emoji) => {
            const emojiRect = emoji.getBoundingClientRect();
            const emojiX = emojiRect.left + emojiRect.width / 2;
            const emojiY = emojiRect.top + emojiRect.height / 2;

            const deltaX = emojiX - mouseX;
            const deltaY = emojiY - mouseY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < 150) {
                const angle = Math.atan2(deltaY, deltaX);
                const moveX = Math.cos(angle) * 100;
                const moveY = Math.sin(angle) * 100;
                emoji.style.transform = `translate(${moveX}px, ${moveY}px)`;
            } else {
                emoji.style.transform = 'translate(0, 0)';
            }
        });
    });
});
