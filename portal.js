function setupFloatingIslands() {
    // Create more complex crystal geometries
    const crystalGeometries = [
        new THREE.IcosahedronGeometry(4, 0),  // Sharp crystal
        new THREE.OctahedronGeometry(5, 2),   // Smooth crystal
        new THREE.TetrahedronGeometry(6, 1),  // Pyramid crystal
        // Custom crystal combining geometries
        (() => {
            const combined = new THREE.Geometry();
            const crystal1 = new THREE.IcosahedronGeometry(4, 0);
            const crystal2 = new THREE.IcosahedronGeometry(3, 0);
            crystal2.scale(1.5, 1.5, 1.5);
            combined.merge(crystal1);
            combined.merge(crystal2);
            return combined;
        })()
    ];

    // Create materials with different properties
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

    // Create crystals
    for(let i = 0; i < 12; i++) {
        const geometry = crystalGeometries[Math.floor(Math.random() * crystalGeometries.length)];
        const material = crystalMaterials[Math.floor(Math.random() * crystalMaterials.length)].clone();
        
        const crystal = new THREE.Mesh(geometry, material);
        
        // Position crystals in a more interesting pattern
        const radius = 30 + Math.random() * 40;
        const theta = (i / 12) * Math.PI * 2;
        crystal.position.set(
            Math.cos(theta) * radius,
            (Math.random() - 0.5) * 40,
            Math.sin(theta) * radius
        );
        
        // Random rotation and scale
        crystal.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        const scale = Math.random() * 1 + 0.5;
        crystal.scale.set(scale, scale * 1.2, scale);
        
        // Add unique animation properties
        crystal.userData = {
            rotationSpeed: (Math.random() - 0.5) * 0.002,
            floatSpeed: 0.001 + Math.random() * 0.002,
            floatOffset: Math.random() * Math.PI * 2,
            pulseSpeed: 0.001 + Math.random() * 0.002,
            originalScale: scale
        };
        
        islands.push(crystal);
        scene.add(crystal);
        
        // Add particle system around each crystal
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
        
        // Match crystal color but with variation
        colors[i] = 0.5 + Math.random() * 0.5;     // More blue
        colors[i + 1] = 0.3 + Math.random() * 0.4; // Some green
        colors[i + 2] = 0.8 + Math.random() * 0.2; // Full blue
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
}

// Update the animate function to include these new effects
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = Date.now() * 0.001;

    // ... existing movement controls ...

    // Enhanced crystal animations
    islands.forEach((crystal) => {
        // Rotation
        crystal.rotation.x += crystal.userData.rotationSpeed;
        crystal.rotation.y += crystal.userData.rotationSpeed * 1.5;
        
        // Floating motion
        crystal.position.y += Math.sin(time * crystal.userData.floatSpeed + crystal.userData.floatOffset) * 0.02;
        
        // Pulse effect
        const pulse = Math.sin(time * crystal.userData.pulseSpeed) * 0.1 + 1;
        crystal.scale.set(
            crystal.userData.originalScale * pulse,
            crystal.userData.originalScale * pulse * 1.2,
            crystal.userData.originalScale * pulse
        );
        
        // Update crystal material
        if (crystal.material) {
            crystal.material.emissiveIntensity = 0.4 + Math.sin(time * 2) * 0.1;
            crystal.material.opacity = 0.6 + Math.sin(time * 3) * 0.1;
        }
    });

    // Enhanced particle animations
    particles.forEach((particle) => {
        if (particle.userData.parentCrystal) {
            // Orbit around crystal
            particle.rotation.y += particle.userData.rotationSpeed;
            particle.rotation.z += particle.userData.rotationSpeed * 0.5;
        } else {
            // Free-floating particles
            particle.rotation.y += 0.0005;
        }
    });

    renderer.render(scene, camera);
}