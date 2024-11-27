// nebulaAuroraShaders.js

const nebulaVertexShader = `
varying vec3 vPosition;

void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const nebulaFragmentShader = `
uniform float time;
uniform vec3 nebulaColor;

varying vec3 vPosition;

void main() {
    // Further reduce the base glow for a subtle nebula effect
    float glow = sin(time * 0.5 + length(vPosition) * 0.1) * 0.1 + 0.1; // Reduced to be subtler
    vec3 color = nebulaColor * (0.1 + glow * 0.2); // Slightly lower glow intensity to make it blend more

    gl_FragColor = vec4(color, 0.3); // Lowered alpha to make the nebula even less dominant
}`;


