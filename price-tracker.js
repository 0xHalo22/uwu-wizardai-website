document.addEventListener('DOMContentLoaded', () => {
    console.log('Price tracker initializing...');
    
    // Constants
    const TOKEN_CA = "FJXC6Y5HVkNQjHzRbUDiXMEmdXZe7mP7snS5yJmUpump";
    const SOLANA_ENDPOINT = 'https://api.mainnet-beta.solana.com';
    const COINGECKO_API = 'https://api.coingecko.com/api/v3';
    
    // Ticker messages
    let messages = [
        "🪙 Loading prices...", 
        "✨ DO YOU BELIEVE IN MAGIC? ✨",
        "24H VOLUME: Loading...",
        "🌟 THE WIZARDS ARE GATHERING 🌟",
        "✨ ENCHANTING THE DIGITAL REALM ✨",
        "🔮 MAGIC IS IN THE AIR 🔮",
        "⭐ JOIN THE MAGICAL REVOLUTION ⭐"
    ];

    let tickerInterval;
    let isTickerPaused = false;

    // Create and setup ticker content
    function createTickerContent() {
        const tickerContent = document.querySelector('.ticker-content');
        if (!tickerContent) {
            console.log('Ticker content element not found');
            return;
        }
        
        tickerContent.innerHTML = '';
        
        // Add messages three times for smooth infinite scroll
        [...messages, ...messages, ...messages].forEach(message => {
            const span = document.createElement('span');
            span.textContent = message;
            // Add magical glow effect
            span.style.textShadow = `0 0 10px rgba(137, 207, 240, ${Math.random() * 0.3 + 0.2})`;
            tickerContent.appendChild(span);
        });

        // Calculate animation duration based on content
        const totalWidth = tickerContent.scrollWidth;
        const duration = totalWidth / 150; // Adjust speed here
        
        // Apply animation
        tickerContent.style.animation = `none`;
        tickerContent.offsetHeight; // Trigger reflow
        tickerContent.style.animation = `ticker ${duration}s linear infinite`;
    }

    // Fetch CoinGecko prices
    async function fetchPrices() {
        try {
            console.log('Fetching CoinGecko prices...');
            const [solResponse, btcResponse] = await Promise.all([
                fetch(`${COINGECKO_API}/simple/price?ids=solana&vs_currencies=usd`),
                fetch(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`)
            ]);

            if (!solResponse.ok || !btcResponse.ok) {
                throw new Error('CoinGecko API response not ok');
            }

            const solData = await solResponse.json();
            const btcData = await btcResponse.json();

            console.log('Prices fetched successfully');
            return {
                sol: solData.solana.usd.toFixed(2),
                btc: btcData.bitcoin.usd.toFixed(0)
            };
        } catch (error) {
            console.error('Error fetching CoinGecko prices:', error);
            return {
                sol: '0.00',
                btc: '0.00'
            };
        }
    }

    // Fetch token data from Solana
    async function fetchTokenData() {
        try {
            console.log('Fetching Solana token data...');
            const connection = new solanaWeb3.Connection(SOLANA_ENDPOINT);
            console.log('Solana connection established');
            
            const tokenMint = new solanaWeb3.PublicKey(TOKEN_CA);
            console.log('Token mint created:', TOKEN_CA);
            
            // Get token supply and decimals
            const tokenInfo = await connection.getTokenSupply(tokenMint);
            console.log('Token info retrieved:', tokenInfo);
            
            // You would implement your specific DEX query logic here
            // This is a placeholder implementation
            const price = "0.000773";
            const volume = "3201.67";
            
            return { price, volume };
        } catch (error) {
            console.error('Error fetching Solana token data:', error);
            return {
                price: '0.000000',
                volume: '0.00'
            };
        }
    }

    // Update ticker with new price data
    async function updateTickerPrice() {
        try {
            console.log('Updating ticker prices...');
            const [prices, tokenData] = await Promise.all([
                fetchPrices(),
                fetchTokenData()
            ]);

            if (prices && tokenData) {
                messages[0] = `🪙 SOL: $${prices.sol} | BTC: $${prices.btc} | UWU: $${tokenData.price} | VOL: $${tokenData.volume}`;
                messages[2] = `24H VOLUME: $${tokenData.volume}`;
                console.log('Ticker messages updated:', messages[0]);
                createTickerContent();
            }
        } catch (error) {
            console.error('Error updating ticker:', error);
            messages[0] = '🪙 Price data temporarily unavailable';
            createTickerContent();
        }
    }

    // Setup ticker interaction
    function setupTickerInteraction() {
        const ticker = document.querySelector('.ticker-wrap');
        if (!ticker) {
            console.log('Ticker wrap element not found');
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

            setTimeout(() => sparkle.remove(), 1500);
        }, 2000);
    }

    // Initialize everything
    function initialize() {
        console.log('Initializing price tracker components...');
        createTickerContent();
        setupTickerInteraction();
        addTickerSparkles();
        
        // Initial price update
        updateTickerPrice();
        
        // Update prices every 30 seconds
        tickerInterval = setInterval(() => {
            if (!isTickerPaused) {
                updateTickerPrice();
            }
        }, 30000);

        // Handle window resize
        window.addEventListener('resize', () => {
            createTickerContent();
        });
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