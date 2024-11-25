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
    const TOKEN_CA = "FJXC6Y5HVkNQjHzRbUDiXMEmdXZe7mP7snS5yJmUpump";

    function createTickerContent() {
        const tickerContent = document.querySelector('.ticker-content');
        if (!tickerContent) {
            console.warn('Ticker content element not found');
            return;
        }
        
        tickerContent.innerHTML = '';
        
        [...messages, ...messages].forEach(message => {
            const span = document.createElement('span');
            span.textContent = message;
            span.style.textShadow = `0 0 10px rgba(137, 207, 240, ${Math.random() * 0.3 + 0.2})`;
            tickerContent.appendChild(span);
        });

        const contentWidth = tickerContent.scrollWidth;
        const baseSpeed = 100;
        const duration = contentWidth / baseSpeed;
        
        tickerContent.style.animation = 'none';
        tickerContent.offsetHeight; // Trigger reflow
        tickerContent.style.animation = `ticker ${duration}s linear infinite`;
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
            // On error, keep existing content
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
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
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

        window.addEventListener('resize', () => {
            if (!isTickerPaused) {
                createTickerContent();
            }
        });
    }

    // Ensure styles are added immediately
    addTickerStyles();
    
    // Wait a brief moment for DOM to be fully ready
    setTimeout(initialize, 100);
});