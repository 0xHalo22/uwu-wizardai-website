document.addEventListener('DOMContentLoaded', () => {
    let messages = [
        "🪙 Loading prices...", 
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
        tickerContent.offsetHeight;
        tickerContent.style.animation = `ticker ${duration}s linear infinite`;

        tickerContent.addEventListener('animationend', () => {
            tickerContent.style.animation = 'none';
            tickerContent.offsetHeight;
            tickerContent.style.animation = `ticker ${duration}s linear infinite`;
        });
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

    async function fetchPrices() {
        try {
            const [solResponse, btcResponse] = await Promise.all([
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'),
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
            ]);

            if (!solResponse.ok || !btcResponse.ok) throw new Error('CoinGecko API response not ok');

            const [solData, btcData] = await Promise.all([
                solResponse.json(),
                btcResponse.json()
            ]);

            return {
                sol: solData.solana.usd.toFixed(2),
                btc: btcData.bitcoin.usd.toFixed(0)
            };
        } catch (error) {
            console.error('Error fetching CoinGecko prices:', error);
            return { sol: '0.00', btc: '0.00' };
        }
    }

    async function fetchTokenData() {
        try {
            const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_CA}`);
            
            if (!response.ok) throw new Error('DexScreener API response not ok');
            
            const data = await response.json();
            const pair = data.pairs?.[0];
            
            if (!pair) throw new Error('No pair data found');
            
            return {
                price: pair.priceUsd || '0.000000',
                volume: pair.volume?.h24 || '0.00'
            };
        } catch (error) {
            console.error('Error fetching DexScreener data:', error);
            return { price: '0.000000', volume: '0.00' };
        }
    }

    async function updateTickerPrice() {
        try {
            const [priceResults, tokenResults] = await Promise.allSettled([
                fetchPrices(),
                fetchTokenData()
            ]);

            let solPrice = '0.00';
            let btcPrice = '0.00';
            let tokenPrice = '0.000000';
            let volume = '0.00';

            if (priceResults.status === 'fulfilled' && priceResults.value) {
                solPrice = priceResults.value.sol;
                btcPrice = priceResults.value.btc;
            }

            if (tokenResults.status === 'fulfilled' && tokenResults.value) {
                tokenPrice = tokenResults.value.price;
                volume = tokenResults.value.volume;
            }

            messages[0] = `🪙 SOL: $${solPrice} | BTC: $${btcPrice} | $🧙: $${tokenPrice} | VOL: $${volume}`;
            
            if (!isTickerPaused) {
                createTickerContent();
            }
        } catch (error) {
            console.error('Error updating ticker:', error);
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
        updateTickerPrice();
        setInterval(updateTickerPrice, 30000);

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

    addTickerStyles();
    setTimeout(initialize, 100);
});