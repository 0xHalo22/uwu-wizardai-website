let scene, camera, renderer, clock;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let particles = [];
let islands = [];
let isControlsEnabled = false;

function init() {
    console.log('Initializing portal...');
    
    // Remove loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.remove();
                showStartPrompt();
            }, 500);
        }, 2000);
    }
    
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);
    
    clock = new THREE.Clock();

    setupRenderer();
    setupStarfield();
    setupFloatingIslands();
    setupParticles();
    setupLighting();
    setupControls();

    animate();
}

function showStartPrompt() {
    // Remove any existing overlay
    const existingOverlay = document.querySelector('.overlay');
    if (existingOverlay) existingOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    const content = document.createElement('div');
    content.className = 'overlay-content';
    content.innerHTML = `
        <h2>Click to Enter the Magical Realm</h2>
        <p>ESC to exit | WASD to move | Trackpad to look around</p>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Add click listener to the overlay
    overlay.addEventListener('click', () => {
        console.log('Overlay clicked');
        const canvas = document.querySelector('#portal-canvas');
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
            overlay.remove();
            isControlsEnabled = true;
        }
    });
}

function setupRenderer() {
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#portal-canvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000);
}

function setupStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starColors = [];
    
    for(let i = 0; i < 15000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
        
        // Add variety to star colors
        const blueHue = Math.random() * 0.2 + 0.8;
        starColors.push(blueHue, blueHue, 1);
    }
    
    starGeometry.setAttribute('position', 
        new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color',
        new THREE.Float32BufferAttribute(starColors, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        size: Math.random() * 2 + 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

function setupFloatingIslands() {
    const islandGeometries = [
        new THREE.IcosahedronGeometry(5, 1),
        new THREE.OctahedronGeometry(4, 2),
        new THREE.TetrahedronGeometry(6, 1)
    ];

    const crystalMaterial = new THREE.MeshPhongMaterial({
        color: 0x3366ff,
        shininess: 200,
        transparent: true,
        opacity: 0.6,
        emissive: 0x112244,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide
    });

    for(let i = 0; i < 7; i++) {
        const geometry = islandGeometries[Math.floor(Math.random() * islandGeometries.length)];
        const island = new THREE.Mesh(geometry, crystalMaterial);
        
        island.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
        );
        
        island.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        island.scale.setScalar(Math.random() * 1.5 + 0.5);
        islands.push(island);
        scene.add(island);
    }
}

function setupParticles() {
    const particleCount = 1500; // Increased count
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const geometry = new THREE.BufferGeometry();
    
    for(let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;
        
        // More varied colors
        colors[i] = Math.random() * 0.5 + 0.5; // More blue
        colors[i + 1] = Math.random() * 0.5 + 0.5; // Some green
        colors[i + 2] = 1; // Full blue
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(geometry, material);
    particles.push(particleSystem);
    scene.add(particleSystem);
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xCCDDFF, 1);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    const colors = [0x3366ff, 0x00aaff, 0x4422ff];
    colors.forEach((color, index) => {
        const light = new THREE.PointLight(color, 1, 50);
        light.position.set(
            Math.cos(index * Math.PI * 2 / 3) * 30,
            Math.sin(index * Math.PI * 2 / 3) * 30,
            0
        );
        scene.add(light);
    });
}

function setupControls() {
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === null) {
            isControlsEnabled = false;
            showStartPrompt();
        }
    });

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
}

function onKeyDown(event) {
    if (!isControlsEnabled) return;
    
    switch(event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space': moveUp = true; break;
        case 'ShiftLeft': moveDown = true; break;
    }
}

function onKeyUp(event) {
    if (!isControlsEnabled) return;
    
    switch(event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
        case 'Space': moveUp = false; break;
        case 'ShiftLeft': moveDown = false; break;
    }
}

function onMouseMove(event) {
    if (!isControlsEnabled) return;
    
    if (document.pointerLockElement === document.querySelector('#portal-canvas')) {
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        
        camera.rotation.y -= movementX * 0.002;
        camera.rotation.x -= movementY * 0.002;
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    }
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (isControlsEnabled) {
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.y = Number(moveUp) - Number(moveDown);
        direction.normalize();

        if (moveForward || moveBackward) camera.translateZ(-direction.z * 30 * delta);
        if (moveLeft || moveRight) camera.translateX(-direction.x * 30 * delta);
        if (moveUp || moveDown) camera.translateY(direction.y * 30 * delta);
    }

    // Animate islands with more varied movement
    islands.forEach((island, i) => {
        island.rotation.x += 0.001 * (1 + i * 0.1);
        island.rotation.y += 0.002 * (1 + i * 0.1);
        island.position.y += Math.sin(Date.now() * 0.001 + i) * 0.02;
        // Add slight wobble
        island.position.x += Math.sin(Date.now() * 0.0005 + i) * 0.01;
    });

    // Animate particles with more dynamic movement
    particles.forEach(particle => {
        particle.rotation.y += 0.0005;
        particle.rotation.x += 0.0002;
    });

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('load', () => {
    setTimeout(init, 100);
});