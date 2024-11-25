// Add these at the top of ticker.js
const UWU_TOKEN_ADDRESS = 'FJXC6Y5HVkNQjHzRbUDiXMEmdXZe7mP7snS5yJmUpump';
const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com');

async function getUwuPrice() {
    try {
        const response = await fetch(`https://public-api.birdeye.so/public/price?address=${UWU_TOKEN_ADDRESS}`);
        const data = await response.json();
        return data.data.value;
    } catch (error) {
        console.error('Error fetching UWU price:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let messages = [
        "🪙 SOL: $0.00 | BTC: $0.00 | UWU: $0.000773 | VOL: $3201.67",
        "✨ DO YOU BELIEVE IN MAGIC? ✨",
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
        
        [...messages, ...messages].forEach(message => {
            const span = document.createElement('span');
            span.textContent = message;
            span.style.textShadow = `0 0 10px rgba(137, 207, 240, ${Math.random() * 0.3 + 0.2})`;
            tickerContent.appendChild(span);
        });

        // Standardize animation speed
        const contentWidth = tickerContent.scrollWidth;
        const baseSpeed = 100; // Adjust this value to fine-tune speed
        const duration = contentWidth / baseSpeed;
        
        // Remove any existing animation
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

    async function updatePriceData() {
        try {
            // Fetch SOL price
            const solResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const solData = await solResponse.json();
            const solPrice = solData.solana.usd.toFixed(2);

            // Fetch BTC price
            const btcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
            const btcData = await btcResponse.json();
            const btcPrice = btcData.bitcoin.usd.toFixed(0);

            // Get UWU price
            const uwuPrice = await getUwuPrice();
            const uwuPriceFormatted = uwuPrice ? uwuPrice.toFixed(6) : '0.000773';

            // Update messages array
            messages[0] = `SOL: $${solPrice} | BTC: $${btcPrice} | $🧙: $${uwuPriceFormatted} | VOL: $3201.67`;
            
            // Refresh ticker content
            createTickerContent();
        } catch (error) {
            console.error('Error fetching price data:', error);
        }
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

        // Update prices every 30 seconds
        updatePriceData();
        setInterval(updatePriceData, 30000);

        // Handle window resize
        window.addEventListener('resize', () => {
            createTickerContent();
        });
    }

    initialize();
});
