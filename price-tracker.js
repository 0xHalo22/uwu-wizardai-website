document.addEventListener('DOMContentLoaded', async () => {
    // Initialize ticker content updating
    const messages = [
        "UWU TOKEN: $0.000",
        "✨ DO YOU BELIEVE IN MAGIC? ✨",
        "24H VOLUME: $0.00",
        "🌟 THE WIZARDS ARE GATHERING 🌟",
        "✨ ENCHANTING THE DIGITAL REALM ✨"
    ];

    let tickerContent = document.querySelector('.ticker-content');
    
    // Duplicate messages to ensure smooth infinite scroll
    function updateTickerContent() {
        tickerContent.innerHTML = '';
        [...messages, ...messages].forEach(message => {
            const span = document.createElement('span');
            span.textContent = message;
            tickerContent.appendChild(span);
        });
    }

    updateTickerContent();

    // Function to connect to Solana and fetch price
    async function initializeSolanaConnection() {
        try {
            const connection = new solanaWeb3.Connection(
                'https://api.mainnet-beta.solana.com'
            );
            console.log('Connected to Solana mainnet');
            // Will add price fetching logic here when you provide token details
        } catch (error) {
            console.error('Error connecting to Solana:', error);
        }
    }

    // Initialize Solana connection
    initializeSolanaConnection();

    // Update messages every minute (you can adjust the interval)
    setInterval(updateTickerContent, 60000);
});