document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const TOKEN_CA = "FJXC6Y5HVkNQjHzRbUDiXMEmdXZe7mP7snS5yJmUpump";
    const SOLANA_ENDPOINT = 'https://api.mainnet-beta.solana.com';
    
    // Messages configuration with placeholder for prices
    const messages = [
        "🪙 Loading prices...", // Will be updated with real data
        "✨ DO YOU BELIEVE IN MAGIC? ✨",
        "24H VOLUME: Loading...", // Will be updated with real data
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
        
        tickerContent.innerHTML = '';
        
        // Create three sets of messages for smooth infinite scroll
        [...messages, ...messages, ...messages].forEach(message => {
            const span = document.createElement('span');
            span.textContent = message;
            span.style.textShadow = `0 0 10px rgba(137, 207, 240, ${Math.random() * 0.3 + 0.2})`;
            tickerContent.appendChild(span);
        });

        // Calculate animation duration based on content width
        const contentWidth = tickerContent.scrollWidth / 3; // Divide by 3 since we tripled the content
        const duration = contentWidth / 50; // Adjust speed as needed

        // Apply the animation
        tickerContent.style.animation = `none`;
        tickerContent.offsetHeight; // Trigger reflow
        tickerContent.style.animation = `ticker ${duration}s linear infinite`;
    }

    // Fetch price data from CoinGecko
    async function fetchPrices() {
        try {
            const [solResponse, btcResponse] = await Promise.all([
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'),
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
            ]);

            const solData = await solResponse.json();
            const btcData = await btcResponse.json();

            return {
                sol: solData.solana.usd.toFixed(2),
                btc: btcData.bitcoin.usd.toFixed(0)
            };
        } catch (error) {
            console.error('Error fetching CoinGecko prices:', error);
            return null;
        }
    }

    // Fetch token data from Solana
    async function fetchTokenData() {
        try {
            const connection = new solanaWeb3.Connection(SOLANA_ENDPOINT);
            const tokenMint = new solanaWeb3.PublicKey(TOKEN_CA);
            
            // Get token supply and decimals
            const tokenInfo = await connection.getTokenSupply(tokenMint);
            
            // You would need to implement specific logic here to get the actual price and volume
            // This is a placeholder - replace with actual DEX query logic
            const price = "0.000773"; // Placeholder
            const volume = "3201.67"; // Placeholder

            return { price, volume };
        } catch (error) {
            console.error('Error fetching Solana token data:', error);
            return null;
        }
    }

    // Update ticker with new price data
    async function updateTickerPrice() {
        try {
            const [prices, tokenData] = await Promise.all([
                fetchPrices(),
                fetchTokenData()
            ]);

            if (prices && tokenData) {
                messages[0] = `🪙 SOL: $${prices.sol} | BTC: $${prices.btc} | UWU: $${tokenData.price} | VOL: $${tokenData.volume}`;
                createTickerContent();
            }
        } catch (error) {
            console.error('Error updating ticker:', error);
        }
    }

    // Setup ticker interaction
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

    // Initialize everything
    function initialize() {
        createTickerContent();
        setupTickerInteraction();
        
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

    // Cleanup
    window.addEventListener('unload', () => {
        if (tickerInterval) {
            clearInterval(tickerInterval);
        }
    });
});