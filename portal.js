// Debug flag
const DEBUG = true;

// Global variables
let scene, camera, renderer, clock;
let loadingScreen, controlsHint;
let islands = [];
let particles = [];

// Initialize Three.js scene
function init() {
    try {
        console.log('Initializing portal...');
        
        // Create scene
        scene = new THREE.Scene();
        if (DEBUG) console.log('Scene created');

        // Set up camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;
        if (DEBUG) console.log('Camera set up');

        // Initialize clock
        clock = new THREE.Clock();

        // Set up renderer
        setupRenderer();
        if (DEBUG) console.log('Renderer initialized');

        // Set up initial scene
        setupScene();
        if (DEBUG) console.log('Scene setup complete');

        // Start animation
        animate();
        if (DEBUG) console.log('Animation started');

    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

function setupRenderer() {
    try {
        renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#portal-canvas'),
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Check if renderer was created successfully
        if (!renderer) throw new Error('Failed to create renderer');
        
    } catch (error) {
        console.error('Error setting up renderer:', error);
        throw error;
    }
}

function setupScene() {
    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add a simple test cube to verify scene is working
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add some basic particles
    createParticles();

    // Handle loading screen
    loadingScreen = document.getElementById('loading-screen');
    controlsHint = document.getElementById('controls-hint');

    if (loadingScreen && controlsHint) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                controlsHint.classList.remove('hidden');
                setTimeout(() => {
                    controlsHint.classList.add('hidden');
                }, 5000);
            }, 1000);
        }, 2000);
    }
}

function createParticles() {
    try {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1000;

        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 100;
            positions[i + 2] = (Math.random() - 0.5) * 100;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0x89CFF0,
            transparent: true,
            opacity: 0.8
        });

        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);
        particles.push(particleSystem);

    } catch (error) {
        console.error('Error creating particles:', error);
    }
}

function animate() {
    try {
        requestAnimationFrame(animate);

        // Rotate particles
        particles.forEach(particle => {
            particle.rotation.y += 0.001;
        });

        renderer.render(scene, camera);

    } catch (error) {
        console.error('Error in animation loop:', error);
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    try {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    } catch (error) {
        console.error('Error handling resize:', error);
    }
});

// Initialize everything when the window loads
window.addEventListener('load', () => {
    try {
        init();
    } catch (error) {
        console.error('Error during load:', error);
    }
});