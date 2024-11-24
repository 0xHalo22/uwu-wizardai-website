document.addEventListener('DOMContentLoaded', () => {
    // Messages configuration
    const messages = [
        "UWU TOKEN: $0.000",
        "✨ DO YOU BELIEVE IN MAGIC? ✨",
        "24H VOLUME: $0.00",
        "🌟 THE WIZARDS ARE GATHERING 🌟",
        "✨ ENCHANTING THE DIGITAL REALM ✨",
        "🔮 MAGIC IS IN THE AIR 🔮",
        "⭐ JOIN THE MAGICAL REVOLUTION ⭐"
    ];

    let tickerInterval;
    let isTickerPaused = false;

    // Enhanced ticker content creation
    function createTickerContent() {
        const tickerContent = document.querySelector('.ticker-content');
        if (!tickerContent) return;
        
        // Clear existing content
        tickerContent.innerHTML = '';
        
        // Add messages twice to ensure smooth infinite scroll
        [...messages, ...messages].forEach(message => {
            const span = document.createElement('span');
            span.textContent = message;
            // Add magical glow effect
            span.style.textShadow = `0 0 10px rgba(137, 207, 240, ${Math.random() * 0.3 + 0.2})`;
            tickerContent.appendChild(span);
        });
    }

    // Smooth animation reset
    function resetAnimation() {
        const ticker = document.querySelector('.ticker-content');
        if (!ticker) return;

        ticker.style.animation = 'none';
        ticker.offsetHeight; // Trigger reflow
        ticker.style.animation = null;
        startTickerAnimation();
    }

    // Start ticker animation with dynamic speed
    function startTickerAnimation() {
        const ticker = document.querySelector('.ticker-content');
        if (!ticker) return;

        const totalWidth = ticker.scrollWidth;
        const duration = totalWidth / 50; // Adjust speed based on content width
        ticker.style.animation = `ticker ${duration}s linear infinite`;
    }

    // Pause ticker on hover
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

    // Add magical sparkles to ticker
    function addTickerSparkles() {
        const ticker = document.querySelector('.ticker-wrap');
        if (!ticker) return;

        setInterval(() => {
            if (isTickerPaused) return;

            const sparkle = document.createElement('div');
            sparkle.className = 'ticker-sparkle';
            sparkle.innerHTML = '✨';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
            ticker.appendChild(sparkle);

            // Remove sparkle after animation
            setTimeout(() => sparkle.remove(), 1500);
        }, 2000);
    }

    // Initialize Solana price tracking
    async function initializePriceTracking() {
        const SOLANA_ENDPOINT = 'https://api.mainnet-beta.solana.com';
        
        try {
            console.log('Initializing price tracking...');
            // Price fetching logic will be implemented here
            // For now, we'll update the ticker with placeholder data
            updateTickerPrice();
        } catch (error) {
            console.error('Error initializing price tracking:', error);
        }
    }

    // Update ticker with new price data
    function updateTickerPrice() {
        // Placeholder for price updates
        // Will be replaced with real data when available
        messages[0] = `UWU TOKEN: $${(Math.random() * 0.001).toFixed(6)}`;
        messages[2] = `24H VOLUME: $${(Math.random() * 10000).toFixed(2)}`;
        createTickerContent();
    }

    // Add styles for ticker sparkles
    function addTickerStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ticker-sparkle {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                font-size: 12px;
                pointer-events: none;
                animation: sparkleFloat ease-out forwards;
                z-index: 11;
            }

            @keyframes sparkleFloat {
                0% {
                    opacity: 0;
                    transform: translateY(0) scale(0);
                }
                50% {
                    opacity: 1;
                    transform: translateY(-10px) scale(1.2);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-20px) scale(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize everything
    function initialize() {
        createTickerContent();
        setupTickerInteraction();
        addTickerStyles();
        addTickerSparkles();
        initializePriceTracking();

        // Reset animation when it completes
        const ticker = document.querySelector('.ticker-content');
        if (ticker) {
            ticker.addEventListener('animationend', resetAnimation);
        }

        // Update ticker content periodically
        tickerInterval = setInterval(() => {
            if (!isTickerPaused) {
                updateTickerPrice();
            }
        }, 30000);
    }

    // Start initialization
    initialize();

    // Cleanup on page unload
    window.addEventListener('unload', () => {
        if (tickerInterval) {
            clearInterval(tickerInterval);
        }
    });
});