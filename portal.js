let scene, camera, renderer, clock;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
let velocity = new THREE.Vector3(), direction = new THREE.Vector3();
let particles = [], islands = [], sparkles = [];
let isControlsEnabled = false;
let magicTrail;

// Crystal Shader Definitions
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
    // Base crystal color with transparency
    vec3 baseColor = color;
    
    // Pulsing effect
    float pulse = sin(time * 2.0) * 0.5 + 0.5;
    pulse = pulse * pulseIntensity;
    
    // Edge glow effect
    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    vec3 glowColor = vec3(0.5, 0.8, 1.0) * fresnel * glowIntensity;
    
    // Energy flow effect
    float energy = sin(vUv.y * 20.0 + time * 3.0) * 0.5 + 0.5;
    energy *= sin(vUv.x * 15.0 - time * 2.0) * 0.5 + 0.5;
    
    // Combine effects
    vec3 finalColor = baseColor + (glowColor * pulse) + (vec3(0.3, 0.6, 1.0) * energy * 0.3);
    
    gl_FragColor = vec4(finalColor, 0.7 + fresnel * 0.3);
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
        new THREE.IcosahedronGeometry(4, 2),
        new THREE.OctahedronGeometry(5, 3),
        new THREE.TetrahedronGeometry(6, 2)
    ];

    const crystalMaterials = crystalGeometries.map(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(Math.random() * 0.2 + 0.4, Math.random() * 0.2 + 0.6, 1.0) },
                pulseIntensity: { value: Math.random() * 0.5 + 0.5 },
                glowIntensity: { value: Math.random() * 0.5 + 0.5 }
            },
            vertexShader: crystalVertexShader,
            fragmentShader: crystalFragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
    });

    const runeGeometry = new THREE.PlaneGeometry(1, 1);
    const runeTextures = [
        '✧', '⚝', '✦', '⚘', '❈', '✴', '❋', '✺'
    ].map(createRuneTexture);

    for(let i = 0; i < 12; i++) {
        const crystalGroup = new THREE.Group();
        
        // Create main crystal
        const geometryIndex = Math.floor(Math.random() * crystalGeometries.length);
        const crystal = new THREE.Mesh(
            crystalGeometries[geometryIndex],
            crystalMaterials[geometryIndex].clone()
        );
        
        // Position the crystal group
        const radius = 30 + Math.random() * 40;
        const theta = (i / 12) * Math.PI * 2;
        crystalGroup.position.set(
            Math.cos(theta) * radius,
            (Math.random() - 0.5) * 40,
            Math.sin(theta) * radius
        );
        
        // Add the main crystal to the group
        crystalGroup.add(crystal);
        
        // Add orbital runes
        const runeCount = Math.floor(Math.random() * 3) + 2;
        for(let j = 0; j < runeCount; j++) {
            const rune = createOrbitalRune(runeGeometry, runeTextures);
            crystalGroup.add(rune);
        }
        
        // Add energy streams
        addEnergyStreams(crystalGroup);
        
        // Store animation parameters
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
    
    // Set up orbital parameters
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
    const streamGeometry = new THREE.BufferGeometry();
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
        streamGeometry.setFromPoints(streamPoints);
        
        const stream = new THREE.Line(streamGeometry, streamMaterial);
        crystalGroup.add(stream);
    }
}

function setupEnvironment() {
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
        }});

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
            // Update crystal shader uniforms
            const crystal = crystalGroup.children[0];
            if (crystal.material.uniforms) {
                crystal.material.uniforms.time.value = time;
            }
            
            // Rotate and float the entire group
            crystalGroup.rotation.y += crystalGroup.userData.rotationSpeed;
            crystalGroup.position.y += Math.sin(time * crystalGroup.userData.floatSpeed + 
                                              crystalGroup.userData.floatOffset) * 0.02;
            
            // Update orbital runes
            crystalGroup.children.forEach((child, index) => {
                if (child.userData.orbitRadius) {
                    const orbitAngle = time * child.userData.orbitSpeed + child.userData.orbitOffset;
                    child.position.set(
                        Math.cos(orbitAngle) * child.userData.orbitRadius,
                        child.userData.verticalOffset + Math.sin(time * 0.5) * 0.5,
                        Math.sin(orbitAngle) * child.userData.orbitRadius
                    );
                    child.rotation.z = time * 0.5;
                    child.material.opacity = 0.6 + Math.sin(time * 2) * 0.4;
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
    
        // Update crystal animations
        updateCrystals(delta, time);
    
        // Update particle animations
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