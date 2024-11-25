let scene, camera, renderer, clock;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
let velocity = new THREE.Vector3(), direction = new THREE.Vector3();
let particles = [], islands = [], sparkles = [];
let isControlsEnabled = false;
let magicTrail;

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

    const handleOverlayClick = () => {
        const canvas = document.querySelector('#portal-canvas');
        if (canvas && canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    };

    overlay.addEventListener('click', handleOverlayClick);
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
    const crystalGeometries = [
        new THREE.IcosahedronGeometry(4, 1),
        new THREE.OctahedronGeometry(5, 2),
        new THREE.TetrahedronGeometry(6, 1)
    ];

    const crystalMaterials = [
        new THREE.MeshPhongMaterial({
            color: 0x3366ff,
            shininess: 100,
            transparent: true,
            opacity: 0.6,
            emissive: 0x112244,
            emissiveIntensity: 0.5,
            side: THREE.DoubleSide,
            flatShading: true
        }),
        new THREE.MeshPhongMaterial({
            color: 0x00aaff,
            shininess: 90,
            transparent: true,
            opacity: 0.7,
            emissive: 0x001133,
            emissiveIntensity: 0.6,
            side: THREE.DoubleSide,
            flatShading: true
        }),
        new THREE.MeshPhongMaterial({
            color: 0x4422ff,
            shininess: 80,
            transparent: true,
            opacity: 0.5,
            emissive: 0x221133,
            emissiveIntensity: 0.4,
            side: THREE.DoubleSide,
            flatShading: true
        })
    ];

    for(let i = 0; i < 12; i++) {
        const geometry = crystalGeometries[Math.floor(Math.random() * crystalGeometries.length)];
        const material = crystalMaterials[Math.floor(Math.random() * crystalMaterials.length)].clone();
        
        const crystal = new THREE.Mesh(geometry, material);
        
        const radius = 30 + Math.random() * 40;
        const theta = (i / 12) * Math.PI * 2;
        crystal.position.set(
            Math.cos(theta) * radius,
            (Math.random() - 0.5) * 40,
            Math.sin(theta) * radius
        );
        
        crystal.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        const scale = Math.random() * 1 + 0.5;
        crystal.scale.set(scale, scale * 1.2, scale);
        
        crystal.userData = {
            rotationSpeed: (Math.random() - 0.5) * 0.002,
            floatSpeed: 0.001 + Math.random() * 0.002,
            floatOffset: Math.random() * Math.PI * 2,
            pulseSpeed: 0.001 + Math.random() * 0.002,
            originalScale: scale
        };
        
        islands.push(crystal);
        scene.add(crystal);
        
        addCrystalParticles(crystal);
    }
}

function addCrystalParticles(crystal) {
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount * 3; i += 3) {
        const radius = 2 + Math.random() * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        
        positions[i] = Math.cos(theta) * Math.cos(phi) * radius;
        positions[i + 1] = Math.sin(phi) * radius;
        positions[i + 2] = Math.sin(theta) * Math.cos(phi) * radius;
        
        colors[i] = 0.5 + Math.random() * 0.5;
        colors[i + 1] = 0.3 + Math.random() * 0.4;
        colors[i + 2] = 0.8 + Math.random() * 0.2;
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.002,
        parentCrystal: crystal
    };
    
    particles.push(particleSystem);
    crystal.add(particleSystem);
}function setupEnvironment() {
    setupStarfield();
    setupFloatingIslands();
    setupLighting();
    magicTrail = addMagicalTrail();
}

function addMagicalTrail() {
    const trailLength = 20;
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(trailLength * 3);
    const trailColors = new Float32Array(trailLength * 3);

    for(let i = 0; i < trailLength * 3; i += 3) {
        trailPositions[i] = camera.position.x;
        trailPositions[i + 1] = camera.position.y;
        trailPositions[i + 2] = camera.position.z;
        
        const alpha = i / (trailLength * 3);
        trailColors[i] = 0.5 + alpha * 0.5;
        trailColors[i + 1] = 0.7 + alpha * 0.3;
        trailColors[i + 2] = 1.0;
    }

    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 3));

    const trailMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const trail = new THREE.Points(trailGeometry, trailMaterial);
    scene.add(trail);
    return trail;
}

function updateMagicalTrail(trail) {
    const positions = trail.geometry.attributes.position.array;
    
    for(let i = positions.length - 1; i >= 3; i--) {
        positions[i] = positions[i - 3];
    }
    
    positions[0] = camera.position.x;
    positions[1] = camera.position.y;
    positions[2] = camera.position.z;

    trail.geometry.attributes.position.needsUpdate = true;
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
        const canvas = document.querySelector('#portal-canvas');
        if (document.pointerLockElement === canvas) {
            isControlsEnabled = true;
            const overlay = document.querySelector('.overlay');
            if (overlay) overlay.remove();
        } else {
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
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x - movementY * 0.002));
    }
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = Date.now() * 0.001;

    if (isControlsEnabled) {
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.y = Number(moveUp) - Number(moveDown);
        direction.normalize();

        if (moveForward || moveBackward) camera.translateZ(-direction.z * 30 * delta);
        if (moveLeft || moveRight) camera.translateX(-direction.x * 30 * delta);
        if (moveUp || moveDown) camera.translateY(direction.y * 30 * delta);

        updateMagicalTrail(magicTrail);
    }

    // Enhanced crystal animations
    islands.forEach((crystal) => {
        crystal.rotation.x += crystal.userData.rotationSpeed;
        crystal.rotation.y += crystal.userData.rotationSpeed * 1.5;
        
        crystal.position.y += Math.sin(time * crystal.userData.floatSpeed + crystal.userData.floatOffset) * 0.02;
        
        const pulse = Math.sin(time * crystal.userData.pulseSpeed) * 0.1 + 1;
        crystal.scale.set(
            crystal.userData.originalScale * pulse,
            crystal.userData.originalScale * pulse * 1.2,
            crystal.userData.originalScale * pulse
        );
        
        if (crystal.material) {
            crystal.material.emissiveIntensity = 0.4 + Math.sin(time * 2) * 0.1;
            crystal.material.opacity = 0.6 + Math.sin(time * 3) * 0.1;
        }
    });

    // Enhanced particle animations
    particles.forEach((particle) => {
        if (particle.userData.parentCrystal) {
            particle.rotation.y += particle.userData.rotationSpeed;
            particle.rotation.z += particle.userData.rotationSpeed * 0.5;
        } else {
            particle.rotation.y += 0.0005;
        }
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