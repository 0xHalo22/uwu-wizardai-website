let scene, camera, renderer, clock;
let loadingScreen, controlsHint;
let islands = [];
let particles = [];
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#portal-canvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Create skybox
    const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const skyboxMaterials = [
        new THREE.MeshBasicMaterial({ 
            map: createStarField(),
            side: THREE.BackSide 
        })
    ];
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials[0]);
    scene.add(skybox);

    setupEnvironment();
    setupLighting();
    setupControls();
    createFloatingIslands();
    createParticleSystem();

    loadingScreen = document.getElementById('loading-screen');
    controlsHint = document.getElementById('controls-hint');
    
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

    animate();
}

function createStarField() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create stars
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 2;
        const hue = Math.random() * 60 + 200;
        const sat = Math.random() * 50 + 50;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, ${sat}%, 80%)`;
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createFloatingIslands() {
    const islandGeometry = new THREE.IcosahedronGeometry(5, 1);
    const islandMaterial = new THREE.MeshPhongMaterial({
        color: 0x3366ff,
        shininess: 100,
        transparent: true,
        opacity: 0.8,
    });

    for (let i = 0; i < 7; i++) {
        const island = new THREE.Mesh(islandGeometry, islandMaterial);
        island.position.set(
            Math.random() * 100 - 50,
            Math.random() * 40 - 20,
            Math.random() * 100 - 50
        );
        island.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        island.scale.setScalar(Math.random() * 2 + 1);
        islands.push(island);
        scene.add(island);
    }
}

function createParticleSystem() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.2,
        color: 0x89CFF0,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particles.push(particleSystem);
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add point lights near islands
    const pointLight1 = new THREE.PointLight(0x3366ff, 1, 100);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6633, 1, 100);
    pointLight2.position.set(-20, -20, -20);
    scene.add(pointLight2);
}

function setupControls() {
    camera.position.set(0, 0, 30);
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
}

function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'Space':
            if (canJump === true) velocity.y += 350;
            canJump = false;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
}

function onMouseMove(event) {
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    camera.rotation.y -= movementX * 0.002;
    camera.rotation.x -= movementY * 0.002;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // Add gravity

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    // Update camera position
    camera.position.x += velocity.x * delta;
    camera.position.y += velocity.y * delta;
    camera.position.z += velocity.z * delta;

    // Animate islands
    islands.forEach((island, index) => {
        island.rotation.x += 0.001;
        island.rotation.y += 0.002;
        island.position.y += Math.sin(time * 0.001 + index) * 0.02;
    });

    // Animate particles
    particles.forEach(particle => {
        particle.rotation.y += 0.001;
    });

    prevTime = time;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('load', init);