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

// ... [keep all your existing setup functions the same until setupControls] ...

function setupControls() {
    console.log('Setting up controls...');
    
    // Create prompt overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    overlay.style.cursor = 'pointer';

    const prompt = document.createElement('div');
    prompt.style.color = '#89CFF0';
    prompt.style.fontFamily = 'VT323, monospace';
    prompt.style.textAlign = 'center';
    prompt.style.padding = '2rem';
    prompt.style.background = 'rgba(0, 0, 0, 0.7)';
    prompt.style.borderRadius = '10px';
    prompt.style.border = '1px solid rgba(137, 207, 240, 0.3)';
    prompt.innerHTML = `
        <h2 style="font-size: 2em; margin-bottom: 1rem;">Click to Enter the Magical Realm</h2>
        <p style="font-size: 1.2em;">ESC to exit | WASD to move | Trackpad to look around</p>
    `;

    overlay.appendChild(prompt);
    document.body.appendChild(overlay);

    // Handle click to start
    overlay.addEventListener('click', function() {
        console.log('Overlay clicked');
        const canvas = document.querySelector('#portal-canvas');
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
            this.style.display = 'none';
            isControlsEnabled = true;
            console.log('Controls enabled');
        }
    });

    // Handle pointer lock change
    document.addEventListener('pointerlockchange', function() {
        if (document.pointerLockElement === null) {
            console.log('Pointer lock released');
            overlay.style.display = 'flex';
            isControlsEnabled = false;
        }
    });

    // Add escape handler
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            console.log('Escape pressed');
            if (document.exitPointerLock) {
                document.exitPointerLock();
            }
        }
    });

    // Movement controls
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

window.addEventListener('load', () => {
    setTimeout(init, 100);
});