document.addEventListener('DOMContentLoaded', () => {
    let messages = [
        "🪙 SOL: $0.00 | BTC: $0.00 | $🧙: $0.000773 | VOL: $3201.67",
        "✨ DO YOU BELIEVE IN MAGIC? ✨",
        "🌟 THE WIZARDS ARE GATHERING 🌟",
        "✨ ENCHANTING THE DIGITAL REALM ✨",
        "🔮 MAGIC IS IN THE AIR 🔮",
        "⭐ JOIN THE MAGICAL REVOLUTION ⭐"
    ];

    let isTickerPaused = false;

    function createTickerContent() {
        const tickerContent = document.querySelector('.ticker-content');
        if (!tickerContent) {
            console.warn('Ticker content element not found');
            return;
        }
        
        tickerContent.innerHTML = '';

        // Create multiple copies for seamless loop
        const copies = 4;
        for (let i = 0; i < copies; i++) {
            messages.forEach(message => {
                const span = document.createElement('span');
                span.textContent = message;
                span.style.textShadow = `0 0 10px rgba(137, 207, 240, ${Math.random() * 0.3 + 0.2})`;
                tickerContent.appendChild(span);
            });
        }

        const contentWidth = tickerContent.scrollWidth;
        const duration = contentWidth / 50;

        tickerContent.style.animation = 'none';
        tickerContent.offsetHeight; // Trigger reflow
        tickerContent.style.animation = `ticker ${duration}s linear infinite`;

        console.log("Ticker initialized with duration:", duration, "seconds");
    }

    function setupTickerInteraction() {
        const ticker = document.querySelector('.ticker-wrap');
        if (!ticker) return;

        ticker.addEventListener('mouseenter', () => {
            const content = ticker.querySelector('.ticker-content');
            if (content) {
                isTickerPaused = true;
                content.style.animationPlayState = 'paused';
                console.log("Ticker paused");
            }
        });

        ticker.addEventListener('mouseleave', () => {
            const content = ticker.querySelector('.ticker-content');
            if (content) {
                isTickerPaused = false;
                content.style.animationPlayState = 'running';
                console.log("Ticker resumed");
            }
        });
    }

    async function updatePriceData() {
        try {
            const [solResponse, btcResponse] = await Promise.all([
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'),
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
            ]);

            const [solData, btcData] = await Promise.all([
                solResponse.json(),
                btcResponse.json()
            ]);

            const solPrice = solData.solana.usd.toFixed(2);
            const btcPrice = btcData.bitcoin.usd.toFixed(0);

            messages[0] = `🪙 SOL: $${solPrice} | BTC: $${btcPrice} | $🧙: $0.000773 | VOL: $3201.67`;

            if (!isTickerPaused) {
                createTickerContent();
            }
        } catch (error) {
            console.error('Error fetching price data:', error);
            createTickerContent();
        }
    }

    function initialize() {
        createTickerContent();
        setupTickerInteraction();
        updatePriceData();

        // Update prices every 30 seconds
        setInterval(updatePriceData, 30000);

        // Force ticker restart to address potential initial delay
        setTimeout(() => {
            const tickerContent = document.querySelector('.ticker-content');
            if (tickerContent) {
                const contentWidth = tickerContent.scrollWidth;
                const duration = contentWidth / 50;
                tickerContent.style.animation = `ticker ${duration}s linear infinite`;
                console.log("Forced ticker restart with duration:", duration, "seconds");
            }
        }, 1000); // Adjust delay if needed

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (!isTickerPaused) {
                    createTickerContent();
                }
            }, 250);
        });
    }

    // Initialize after a brief moment
    setTimeout(initialize, 100);
});
