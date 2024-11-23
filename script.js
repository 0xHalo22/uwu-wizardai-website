body {
    margin: 0;
    padding: 0;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(to bottom, #1a1a2e, #16213e);
    color: #fff;
    overflow: hidden;
    min-height: 100vh;
}

nav#menu {
    position: fixed;
    top: 20px;
    width: 100%;
    text-align: center;
    z-index: 10;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    padding: 10px 0;
}

nav#menu ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

nav#menu ul li {
    display: inline;
    margin: 0 15px;
}

nav#menu ul li a {
    text-decoration: none;
    font-weight: bold;
    color: #fff;
    font-size: 1.2em;
    transition: all 0.3s;
    padding: 5px 10px;
    border-radius: 15px;
}

nav#menu ul li a:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
}

main#content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 5;
}

.description h1 {
    font-size: 3.5em;
    font-weight: 300;
    margin-bottom: 20px;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    animation: glow 2s ease-in-out infinite;
}

.description p {
    font-size: 1.5em;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
    color: rgba(255, 255, 255, 0.9);
}

#emoji-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
}

.emoji {
    position: absolute;
    user-select: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
}

.sparkle {
    position: absolute;
    pointer-events: none;
    animation: sparkle-fade 1s ease-in-out forwards;
    z-index: 2;
}

@keyframes float {
    0%, 100% {
        transform: translate(0, -10px) rotate(0deg);
    }
    25% {
        transform: translate(5px, 0) rotate(3deg);
    }
    50% {
        transform: translate(0, 10px) rotate(0deg);
    }
    75% {
        transform: translate(-5px, 0) rotate(-3deg);
    }
}

@keyframes glow {
    0%, 100% {
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
    50% {
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.8),
                     0 0 30px rgba(255, 255, 255, 0.6);
    }
}

@keyframes sparkle-fade {
    0% {
        transform: scale(0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: scale(1) rotate(180deg);
        opacity: 0;
    }
}
