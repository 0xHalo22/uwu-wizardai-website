document.addEventListener('DOMContentLoaded', () => {
    let messages = [
        "🪙 SOL: $0.00 | BTC: $0.00 | $🧙: Loading... | VOL: Loading...",
        "✨ DO YOU BELIEVE IN MAGIC? ✨",
        "🌟 THE WIZARDS ARE GATHERING 🌟",
        "✨ ENCHANTING THE DIGITAL REALM ✨",
        "🔮 MAGIC IS IN THE AIR 🔮",
        "⭐ JOIN THE MAGICAL REVOLUTION ⭐"
    ];

    let isTickerPaused = false;
    const TOKEN_CA = "FJXC6Y5HVkNQjHzRbUDiXMEmdXZe7mP7snS5yJmUpump";

    function createTickerContent() {
        const tickerContent = document.querySelector('.ticker-content');
        if (!tickerContent) {
            console.warn('Ticker content element not found');
            return;
        }
        
        tickerContent.innerHTML = '';
        
        // Create multiple copies for seamless loop
        const copies = 4; // Increase this number for longer loops
        for (let i = 0; i < copies; i++) {
            messages.forEach(message => {
                const span = document.createElement('span');
                span.textContent = message;
                span.style.textShadow = `0 0 10px rgba(137, 207, 240, ${Math.random() * 0.3 + 0.2})`;
                tickerContent.appendChild(span);
            });
        }

        const contentWidth = tickerContent.scrollWidth;
        const viewportWidth = window.innerWidth;
        const duration = contentWidth / 50; // Adjust speed here
        
        tickerContent.style.animation = 'none';
        tickerContent.offsetHeight; // Trigger reflow
        tickerContent.style.animation = `ticker ${duration}s linear infinite`;

        // Add infinite loop handling
        tickerContent.addEventListener('animationend', () => {
            tickerContent.style.animation = 'none';
            tickerContent.offsetHeight;
            tickerContent.style.animation = `ticker ${duration}s linear infinite`;
        });
    }

    function setupTickerInteraction() {
        const ticker = document.querySelector('.ticker-wrap');
        if (!ticker) {
            console.warn('Ticker wrap element not found');
            return;
        }

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

    async function updatePriceData() {
        try {
            // Fetch prices from CoinGecko and DexScreener
            const [solResponse, btcResponse, dexResponse] = await Promise.all([
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'),
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'),
                fetch('https://api.dexscreener.com/latest/dex/pairs/solana/3nqjfncizp9gsyjk2aqdch6gywceufcqz4l49efk2e78')
            ]);

            const [solData, btcData, dexData] = await Promise.all([
                solResponse.json(),
                btcResponse.json(),
                dexResponse.json()
            ]);

            const solPrice = solData.solana.usd.toFixed(2);
            const btcPrice = btcData.bitcoin.usd.toFixed(0);
            const uwuPrice = dexData.pair.priceUsd.toFixed(6);
            const volume = dexData.pair.volume.h24.toFixed(2);

            // Update ticker messages
            messages[0] = `🪙 SOL: $${solPrice} | BTC: $${btcPrice} | $🧙: $${uwuPrice} | VOL: $${volume}`;
            
            if (!isTickerPaused) {
                createTickerContent();
            }
        } catch (error) {
            console.error('Error fetching price data:', error);
            createTickerContent();
        }
    }

    function addTickerStyles() {
        const existingStyle = document.getElementById('ticker-styles');
        if (existingStyle) return;

        const style = document.createElement('style');
        style.id = 'ticker-styles';
        style.textContent = `
            .ticker-wrap {
                width: 100%;
                height: 40px;
                background: rgba(0, 0, 0, 0.8);
                border-bottom: 1px solid rgba(137, 207, 240, 0.2);
                overflow: hidden;
                position: fixed;
                top: 0;
                z-index: 2000;
                display: flex;
                align-items: center;
            }

            .ticker {
                display: inline-flex;
                align-items: center;
                height: 100%;
                width: 100%;
                overflow: hidden;
            }

            .ticker-content {
                display: inline-flex;
                white-space: nowrap;
                font-family: 'VT323', monospace;
                font-size: 1.5em;
                color: #89CFF0;
                text-shadow: 0 0 10px rgba(137, 207, 240, 0.5);
                padding: 0 20px;
                transform: translateX(0);
            }

            .ticker-content span {
                padding: 0 50px;
                display: inline-block;
            }

            @keyframes ticker {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
        `;
        document.head.appendChild(style);
    }

    function initialize() {
        console.log('Initializing ticker...');
        addTickerStyles();
        createTickerContent();
        setupTickerInteraction();
        updatePriceData();
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

    // Ensure styles are added immediately
    addTickerStyles();
    
    // Wait a brief moment for DOM to be fully ready
    setTimeout(initialize, 100);
});
