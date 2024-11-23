let scene, camera, renderer, clock;
let loadingScreen, controlsHint;
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

function init() {
    console.log('Initializing enhanced portal...');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);
    
    clock = new THREE.Clock();

    // Renderer setup
    setupRenderer();
    setupStarfield();
    setupFloatingIslands();
    setupParticles();
    setupLighting();
    setupControls();

    // Start animation
    animate();
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
    
    for(let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', 
        new THREE.Float32BufferAttribute(starVertices, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.5,
        transparent: true
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
        shininess: 100,
        transparent: true,
        opacity: 0.8,
        emissive: 0x112244
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
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const geometry = new THREE.BufferGeometry();
    
    for(let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;
        
        // Blue-ish colors
        colors[i] = Math.random() * 0.5;
        colors[i + 1] = Math.random() * 0.5 + 0.5;
        colors[i + 2] = 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.5,
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
    const ambientLight = new THREE.AmbientLight(0x222244);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xCCDDFF, 1);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    // Add some colored point lights
    const colors = [0x3366ff, 0xff6633, 0x33ff66];
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
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    
    // Lock pointer on click
    document.addEventListener('click', () => {
        document.body.requestPointerLock();
    });
}

function onKeyDown(event) {
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
    if (document.pointerLockElement === document.body) {
        camera.rotation.y -= event.movementX * 0.002;
        camera.rotation.x -= event.movementY * 0.002;
        camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
    }
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Update movement
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.y = Number(moveUp) - Number(moveDown);
    direction.normalize();

    // Move camera
    if (moveForward || moveBackward) camera.translateZ(-direction.z * 30 * delta);
    if (moveLeft || moveRight) camera.translateX(-direction.x * 30 * delta);
    if (moveUp || moveDown) camera.translateY(direction.y * 30 * delta);

    // Animate islands
    islands.forEach((island, i) => {
        island.rotation.x += 0.001;
        island.rotation.y += 0.002;
        island.position.y += Math.sin(Date.now() * 0.001 + i) * 0.02;
    });

    // Animate particles
    particles.forEach(particle => {
        particle.rotation.y += 0.0005;
    });

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('load', init);