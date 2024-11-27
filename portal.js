let scene, camera, renderer, clock;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
let velocity = new THREE.Vector3(), direction = new THREE.Vector3();
let particles = [], islands = [], sparkles = [];
let isControlsEnabled = false;
let magicTrail;

// Crystal Shader Definitions + poptart
const crystalVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const crystalFragmentShader = `
uniform float time;
uniform vec3 color;
uniform float pulseIntensity;
uniform float glowIntensity;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vec3 baseColor = color;

    // Enhanced pulse effect for a dynamic "alive" feeling
    float pulse = sin(time * 3.0) * 0.5 + 0.5; // Increased speed for pulse effect
    pulse = pulse * pulseIntensity * 1.8; // Increased overall brightness for pulse effect

    // Stronger fresnel effect for sharper glows
    float fresnelEdge = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 8.0);
    float fresnelSoft = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 3.0);

    // Glow color for edges, giving sharper and more magical highlights
    vec3 edgeGlowColor = vec3(0.7, 1.0, 1.3) * fresnelEdge * glowIntensity;
    vec3 softGlowColor = vec3(0.5, 0.8, 1.1) * fresnelSoft * glowIntensity * 0.9;

    // Combine all effects
    vec3 finalColor = baseColor + (edgeGlowColor * pulse) + softGlowColor;

    float alpha = 0.5 + fresnelEdge * 0.4 + fresnelSoft * 0.2;

    gl_FragColor = vec4(finalColor, alpha);
}`;



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

    for (let i = 0; i < 30000; i++) {
        const x = (Math.random() - 0.5) * 4000; // Increased size for more coverage
        const y = (Math.random() - 0.5) * 4000;
        const z = (Math.random() - 0.5) * 4000;
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
        opacity: 0.9, // Slightly boosted opacity to ensure visibility
        depthWrite: false // Ensures stars are always drawn, even behind other objects
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    starField.renderOrder = -1; // Always render in the background
    scene.add(starField);
}

function setupFloatingIslands() {
    const runeGeometry = new THREE.PlaneGeometry(1, 1);
    const runeTextures = [
        '✧', '⚝', '✦', '⚘', '❈', '✴', '❋', '✺'
    ].map(createRuneTexture);

    const crystalGeometries = [
        new THREE.IcosahedronGeometry(4, 0),
        new THREE.OctahedronGeometry(5, 0),
        new THREE.TetrahedronGeometry(6, 0),
        createCustomCrystal(4, 12, 4),
        createCustomCrystal(3, 9, 3),
        createCustomCrystal(5, 15, 5)
    ];

    const crystalMaterials = crystalGeometries.map(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(
                    Math.random() * 0.1 + 0.4,
                    Math.random() * 0.1 + 0.9,  // Slight boost to green hue
                    1.0
                )},
                pulseIntensity: { value: Math.random() * 0.4 + 1.6 }, // Increased pulse for more brightness
                glowIntensity: { value: Math.random() * 0.7 + 1.8 } // Increased glow for brighter effect
            },
            vertexShader: crystalVertexShader,
            fragmentShader: crystalFragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending // Adds a glowing effect to make the crystals shimmer
        });
    });

    for (let i = 0; i < 12; i++) {
        const crystalGroup = new THREE.Group();

        const geometryIndex = Math.floor(Math.random() * crystalGeometries.length);
        const crystal = new THREE.Mesh(
            crystalGeometries[geometryIndex],
            crystalMaterials[geometryIndex].clone()
        );

        const radius = 30 + Math.random() * 40;
        const theta = (i / 12) * Math.PI * 2;
        crystalGroup.position.set(
            Math.cos(theta) * radius,
            (Math.random() - 0.5) * 40,
            Math.sin(theta) * radius
        );

        crystalGroup.add(crystal);

        const runeCount = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < runeCount; j++) {
            const rune = createOrbitalRune(runeGeometry, runeTextures);
            crystalGroup.add(rune);
        }

        addEnergyStreams(crystalGroup);

        crystalGroup.userData = {
            rotationSpeed: (Math.random() - 0.5) * 0.002,
            floatSpeed: 0.001 + Math.random() * 0.002,
            floatOffset: Math.random() * Math.PI * 2,
            pulseSpeed: 0.001 + Math.random() * 0.002,
            runeSpeed: 0.001 + Math.random() * 0.001
        };

        islands.push(crystalGroup);
        scene.add(crystalGroup);
    }

    // Add proximity-based interaction in the animation loop
    document.addEventListener('mousemove', handleHoverEffect); // Retain mouse hover for traditional use case
}

function handleHoverEffect(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(islands.map(group => group.children[0]));

    if (intersects.length > 0) {
        intersects[0].object.userData.hoverEffect.call(intersects[0].object);
    }
}

// Updated animate function to add proximity detection
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

    updateCrystals(delta, time);
    updateProximityEffects();

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

// New function to handle camera proximity detection
function updateProximityEffects() {
    islands.forEach(crystalGroup => {
        const crystal = crystalGroup.children[0]; // Access the crystal in the group
        const distance = camera.position.distanceTo(crystalGroup.position);

        if (distance < 25) { // If camera is within proximity radius
            crystal.userData.hoverEffect.call(crystal);
        }
    });
}


function createCustomCrystal(radius, height, segments) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    vertices.push(0, height/2, 0);
    vertices.push(0, -height/2, 0);

    for(let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        vertices.push(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
    }

    for(let i = 0; i < segments; i++) {
        indices.push(0, 2 + i, 2 + ((i + 1) % segments));
        indices.push(1, 2 + ((i + 1) % segments), 2 + i);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

function createRuneTexture(rune) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#00000000';
    ctx.fillRect(0, 0, 64, 64);

    ctx.fillStyle = '#89CFF0';
    ctx.font = '40px "VT323"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rune, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createOrbitalRune(geometry, textures) {
    const material = new THREE.MeshBasicMaterial({
        map: textures[Math.floor(Math.random() * textures.length)],
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const rune = new THREE.Mesh(geometry, material);

    rune.userData = {
        orbitRadius: 2 + Math.random() * 2,
        orbitSpeed: Math.random() * 0.5 + 0.5,
        orbitOffset: Math.random() * Math.PI * 2,
        verticalOffset: (Math.random() - 0.5) * 2
    };

    return rune;
}

function addEnergyStreams(crystalGroup) {
    const streamCount = Math.floor(Math.random() * 3) + 2;
    const streamMaterial = new THREE.LineBasicMaterial({
        color: 0x89CFF0,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    for(let i = 0; i < streamCount; i++) {
        const points = [];
        const curvePoints = 20;

        for(let j = 0; j < curvePoints; j++) {
            const t = j / (curvePoints - 1);
            points.push(
                new THREE.Vector3(
                    Math.cos(t * Math.PI * 2) * (1 + Math.random() * 0.5),
                    t * 4 - 2,
                    Math.sin(t * Math.PI * 2) * (1 + Math.random() * 0.5)
                )
            );
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const streamPoints = curve.getPoints(50);
        const streamGeometry = new THREE.BufferGeometry().setFromPoints(streamPoints);

        const stream = new THREE.Line(streamGeometry, streamMaterial);
        crystalGroup.add(stream);
    }
}

function setupEnvironment() {
    setupStarfield();
    setupFloatingIslands();
    setupLighting();

    setupNebula();
    
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
// In your main script
function setupNebula() {
    const nebulaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            nebulaColor: { value: new THREE.Color(0.5, 0.7, 1.0) }
        },
        vertexShader: nebulaVertexShader,
        fragmentShader: nebulaFragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
    });

    const nebulaGeometry = new THREE.SphereGeometry(300, 32, 32);
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x222244, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xCCDDFF, 1.8);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    const colors = [0x3366ff, 0x00aaff, 0x4422ff];
    const pointLights = [];

    colors.forEach((color, index) => {
        const light = new THREE.PointLight(color, 1.5, 70);
        light.position.set(
            Math.cos(index * Math.PI * 2 / 3) * 40,
            Math.sin(index * Math.PI * 2 / 3) * 40,
            0
        );
        pointLights.push(light);
        scene.add(light);
    });

    // Add pulsing effect to lights
    setInterval(() => {
        const pulseValue = Math.sin(Date.now() * 0.003) * 0.3;
        mainLight.intensity = 1.6 + pulseValue;

        // Slight color shift with pulse
        mainLight.color.setHSL(0.6 + pulseValue * 0.1, 1, 0.6);

        pointLights.forEach((light, i) => {
            const pointPulse = Math.sin(Date.now() * 0.003 + i) * 0.2;
            light.intensity = 1.4 + pointPulse;

            // Slight color shift for variety
            light.color.setHSL(0.5 + pointPulse * 0.1, 1, 0.5);
        });
    }, 50);

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

function updateCrystals(delta, time) {
    islands.forEach((crystalGroup) => {
        const crystal = crystalGroup.children[0];
        if (crystal.material.uniforms) {
            crystal.material.uniforms.time.value = time;
        }

        crystalGroup.rotation.y += crystalGroup.userData.rotationSpeed;
        crystalGroup.position.y += Math.sin(time * crystalGroup.userData.floatSpeed +
            crystalGroup.userData.floatOffset) * 0.02;

        crystalGroup.children.forEach((child) => {
            if (child.userData.orbitRadius) {
                const orbitAngle = time * child.userData.orbitSpeed + child.userData.orbitOffset;
                child.position.set(
                    Math.cos(orbitAngle) * child.userData.orbitRadius,
                    child.userData.verticalOffset + Math.sin(time * 0.5) * 0.5,
                    Math.sin(orbitAngle) * child.userData.orbitRadius
                );
                child.rotation.z = time * 0.5;
                child.material.opacity = 0.7 + Math.sin(time * 2) * 0.3; // Adjusted opacity to create a pulsing glow
            }
        });
    });
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

    updateCrystals(delta, time);

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
