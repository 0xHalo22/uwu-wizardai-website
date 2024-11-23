document.addEventListener('DOMContentLoaded', () => {
    const messages = [
        "UWU TOKEN: $0.000",
        "✨ DO YOU BELIEVE IN MAGIC? ✨",
        "24H VOLUME: $0.00",
        "🌟 THE WIZARDS ARE GATHERING 🌟",
        "✨ ENCHANTING THE DIGITAL REALM ✨"
    ];

    function createTickerContent() {
        const tickerContent = document.querySelector('.ticker-content');
        
        // Clear existing content
        tickerContent.innerHTML = '';
        
        // Add messages twice to ensure smooth infinite scroll
        [...messages, ...messages].forEach(message => {
            const span = document.createElement('span');
            span.textContent = message;
            tickerContent.appendChild(span);
        });
    }

    function resetAnimation() {
        const ticker = document.querySelector('.ticker-content');
        ticker.style.animation = 'none';
        ticker.offsetHeight; // Trigger reflow
        ticker.style.animation = 'ticker 30s linear infinite';
    }

    // Initial setup
    createTickerContent();

    // Reset animation when it completes
    document.querySelector('.ticker-content').addEventListener('animationend', () => {
        resetAnimation();
    });

    // Recreate ticker content every minute to ensure smooth running
    setInterval(createTickerContent, 60000);

    // Initialize Solana connection
    async function initializeSolanaConnection() {
        try {
            const connection = new solanaWeb3.Connection(
                'https://api.mainnet-beta.solana.com'
            );
            console.log('Connected to Solana mainnet');
            // Price fetching logic will be added here
        } catch (error) {
            console.error('Error connecting to Solana:', error);
        }
    }

    // Initialize Solana connection
    initializeSolanaConnection();
});