let scene, camera, renderer, clock;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
let velocity = new THREE.Vector3(), direction = new THREE.Vector3();
let particles = [], islands = [], isControlsEnabled = false, magicTrail;

function init() {
    console.log('Initializing portal...');
    removeLoadingScreen();
    setupScene();
    setupCamera();
    setupRenderer();
    setupEnvironment();
    setupControls();
    animate();
}

function removeLoadingScreen() {
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
}

function showStartPrompt() {
    const existingOverlay = document.querySelector('.overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
        <div class="overlay-content">
            <h2>Click to Enter the Magical Realm</h2>
            <p>ESC to exit | WASD to move | Trackpad to look around</p>
        </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
        const canvas = document.querySelector('#portal-canvas');
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
            overlay.remove();
            isControlsEnabled = true;
        }
    });
}

function setupScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);
}

function setupCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);
    clock = new THREE.Clock();
}

function setupRenderer() {
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#portal-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000);
}

function setupEnvironment() {
    setupStarfield();
    setupFloatingIslands();
    setupLighting();
    magicTrail = addMagicalTrail();
}

function setupStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starColors = [];

    for (let i = 0; i < 15000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
        const blueHue = Math.random() * 0.2 + 0.8;
        starColors.push(blueHue, blueHue, 1);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

function setupFloatingIslands() {
    const geometries = [
        new THREE.IcosahedronGeometry(4, 1),
        new THREE.OctahedronGeometry(5, 2),
        new THREE.TetrahedronGeometry(6, 1),
    ];
    const materials = [
        new THREE.MeshPhongMaterial({ color: 0x3366ff, emissive: 0x112244, transparent: true, opacity: 0.6 }),
        new THREE.MeshPhongMaterial({ color: 0x00aaff, emissive: 0x001133, transparent: true, opacity: 0.7 }),
        new THREE.MeshPhongMaterial({ color: 0x4422ff, emissive: 0x221133, transparent: true, opacity: 0.5 }),
    ];

    for (let i = 0; i < 12; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = materials[Math.floor(Math.random() * materials.length)].clone();
        const crystal = new THREE.Mesh(geometry, material);
        crystal.position.set(
            Math.cos((i / 12) * Math.PI * 2) * (30 + Math.random() * 40),
            (Math.random() - 0.5) * 40,
            Math.sin((i / 12) * Math.PI * 2) * (30 + Math.random() * 40)
        );
        crystal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        const scale = Math.random() * 1 + 0.5;
        crystal.scale.set(scale, scale * 1.2, scale);
        islands.push(crystal);
        scene.add(crystal);
    }
}

function addMagicalTrail() {
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(60);
    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
    const trailMaterial = new THREE.PointsMaterial({ size: 0.2, vertexColors: true, transparent: true, opacity: 0.6 });
    const trail = new THREE.Points(trailGeometry, trailMaterial);
    scene.add(trail);
    return trail;
}

function setupLighting() {
    scene.add(new THREE.AmbientLight(0x222244, 0.5));
    const mainLight = new THREE.DirectionalLight(0xCCDDFF, 1);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);
}

function setupControls() {
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === null) isControlsEnabled = false;
    });
    document.addEventListener('keydown', (e) => handleKey(e, true));
    document.addEventListener('keyup', (e) => handleKey(e, false));
    document.addEventListener('mousemove', handleMouseMove);
}

function handleKey(event, isPressed) {
    if (!isControlsEnabled) return;
    const map = { KeyW: 'moveForward', KeyS: 'moveBackward', KeyA: 'moveLeft', KeyD: 'moveRight', Space: 'moveUp', ShiftLeft: 'moveDown' };
    if (map[event.code] !== undefined) this[map[event.code]] = isPressed;
}

function handleMouseMove(event) {
    if (!isControlsEnabled) return;
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;
    camera.rotation.y -= movementX * 0.002;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x - movementY * 0.002));
}

function animate() {
    requestAnimationFrame(animate);
    if (isControlsEnabled) {
        direction.set(Number(moveRight) - Number(moveLeft), Number(moveUp) - Number(moveDown), Number(moveBackward) - Number(moveForward)).normalize();
        camera.translateX(direction.x * 0.1);
        camera.translateY(direction.y * 0.1);
        camera.translateZ(direction.z * 0.1);
    }
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('load', init);
