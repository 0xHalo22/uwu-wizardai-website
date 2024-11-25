// Create a new file called 'ticker.js' in your project root
document.addEventListener('DOMContentLoaded', () => {
    const messages = [
        "UWU TOKEN: $0.000",
        "✨ DO YOU BELIEVE IN MAGIC? ✨",
        "24H VOLUME: $0.00",
        "🌟 THE WIZARDS ARE GATHERING 🌟",
        "✨ ENCHANTING THE DIGITAL REALM ✨",
        "🔮 MAGIC IS IN THE AIR 🔮",
        "⭐ JOIN THE MAGICAL REVOLUTION ⭐"
    ];

    let isTickerPaused = false;

    function createTickerContent() {
        const tickerContent = document.querySelector('.ticker-content');
        if (!tickerContent) return;
        
        tickerContent.innerHTML = '';
        
        // Add messages twice to ensure smooth infinite scroll
        [...messages, ...messages].forEach(message => {
            const span = document.createElement('span');
            span.textContent = message;
            span.style.textShadow = `0 0 10px rgba(137, 207, 240, ${Math.random() * 0.3 + 0.2})`;
            tickerContent.appendChild(span);
        });

        // Calculate appropriate animation duration based on content
        const contentWidth = tickerContent.scrollWidth;
        const duration = contentWidth / 50; // Standardized speed ratio
        tickerContent.style.animation = `ticker ${duration}s linear infinite`;
    }

    function setupTickerInteraction() {
        const ticker = document.querySelector('.ticker-wrap');
        if (!ticker) return;

        ticker.addEventListener('mouseenter', () => {
            const content = ticker.querySelector('.ticker-content');
            if (content) {
                isTickerPaused = true;
                content.style.animationPlayState = 'paused';
            }
        });

        ticker.addEventListener('mouseleave', () => {
            const content = ticker.querySelector('.ticker-content');
            if (content) {
                isTickerPaused = false;
                content.style.animationPlayState = 'running';
            }
        });
    }

    function addTickerStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ticker-wrap {
                width: 100%;
                height: 40px;
                background: rgba(0, 0, 0, 0.8);
                border-bottom: 1px solid rgba(137, 207, 240, 0.2);
                overflow: hidden;
                position: fixed;
                top: 0;
                z-index: 10;
                display: flex;
                align-items: center;
            }

            .ticker {
                display: inline-flex;
                align-items: center;
                height: 100%;
                width: fit-content;
                padding-left: 100%;
            }

            .ticker-content {
                display: inline-flex;
                white-space: nowrap;
                font-family: 'VT323', monospace;
                font-size: 1.5em;
                color: #89CFF0;
                text-shadow: 0 0 10px rgba(137, 207, 240, 0.5);
                padding: 0 20px;
            }

            .ticker-content span {
                padding: 0 50px;
            }

            @keyframes ticker {
                0% {
                    transform: translateX(0);
                }
                100% {
                    transform: translateX(-100%);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize everything
    function initialize() {
        addTickerStyles();
        createTickerContent();
        setupTickerInteraction();

        // Handle window resize
        window.addEventListener('resize', () => {
            createTickerContent(); // Recalculate duration based on new width
        });
    }

    initialize();
});