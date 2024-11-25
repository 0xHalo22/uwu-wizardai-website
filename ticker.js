document.addEventListener('DOMContentLoaded', () => {
    let messages = [
        "🪙 SOL: $0.00 | BTC: $0.00 | $🧙: $0.000000 | VOL: $0.00",
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

    async function fetchUwUTokenPrice() {
        try {
            const response = await fetch('https://api.dexscreener.io/latest/dex/pairs/solana/FJXC6Y5HVkNQjHzRbUDiXMEmdXZe7mP7snS5yJmUpump');
            if (!response.ok) {
                throw new Error('Failed to fetch UwU token data from DexScreener');
            }
            const data = await response.json();
            const uwuPrice = parseFloat(data.pair.priceUsd).toFixed(6);
            const uwuVolume = parseFloat(data.pair.volumeUsd24h).toFixed(2);
            return { price: uwuPrice, volume: uwuVolume };
        } catch (error) {
            console.error('Error fetching UwU token price:', error);
            return { price: '0.000000', volume: '0.00' };
        }
    }

    async function updatePriceData() {
        try {
            const [solResponse, btcResponse, uwuData] = await Promise.all([
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'),
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'),
                fetchUwUTokenPrice()
            ]);

            const [solData, btcData] = await Promise.all([
                solResponse.json(),
                btcResponse.json()
            ]);

            const solPrice = solData.solana.usd.toFixed(2);
            const btcPrice = btcData.bitcoin.usd.toFixed(0);
            const uwuPrice = uwuData.price;
            const uwuVolume = uwuData.volume;

            messages[0] = `🪙 SOL: $${solPrice} | BTC: $${btcPrice} | $🧙: $${uwuPrice} | VOL: $${uwuVolume}`;

            if (!isTickerPaused) {
                createTickerContent();
            }
        } catch (error) {
            console.error('Error updating price data:', error);
            createTickerContent();
        }
    }

    function initialize() {
        createTickerContent();
        setupTickerInteraction();
        updatePriceData();
        
        // Update prices every 30 seconds
        setInterval(updatePriceData, 30000);

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
