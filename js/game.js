import { World } from './world.js';
import { Player } from './player.js';

export class Game {
    constructor(canvas, debugInfoElement) {
        this.canvas = canvas;
        this.debugInfoElement = debugInfoElement;
        this.renderer = null; // e.g., Three.js WebGLRenderer
        this.scene = null;   // e.g., Three.js Scene
        this.camera = null;  // e.g., Three.js PerspectiveCamera

        this.world = null;
        this.player = null;

        this.isGamePaused = true; // Start paused, waiting for pointer lock
    }

    init() {
        // --- Setup Renderer, Scene, Camera (e.g., using Three.js) ---
        // For a simple demo, let's assume a basic setup.
        // In a real scenario, you'd integrate Three.js here.
        // Example:
        // this.scene = new THREE.Scene();
        // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        // this.renderer.setSize(window.innerWidth, window.innerHeight);
        // document.body.appendChild(this.renderer.domElement);
        // this.camera.position.set(0, 10, 0); // Player starting position

        // For now, let's mock these for structure
        console.log("Game initialized with Canvas:", this.canvas);
        this.scene = { add: (obj) => console.log("Adding to scene:", obj) };
        this.camera = { position: { x: 0, y: 10, z: 0 } };
        this.renderer = { render: (scene, camera) => { /* Mock render */ } };


        this.world = new World();
        this.world.generateChunk(0, 0, 0); // Generate a starting chunk
        this.world.addBlocksToScene(this.scene); // Add generated blocks to the scene

        this.player = new Player(this.camera); // Player controls the camera
        this.player.setPosition(0, 10, 0); // Initial player position

        // Event listeners for window resize (important for camera aspect ratio)
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    onWindowResize() {
        // if (this.camera && this.renderer) {
        //     this.camera.aspect = window.innerWidth / window.innerHeight;
        //     this.camera.updateProjectionMatrix();
        //     this.renderer.setSize(window.innerWidth, window.innerHeight);
        // }
    }

    update(deltaTime) {
        if (this.isGamePaused) return;

        this.player.update(deltaTime);
        // Potentially update world (e.g., load new chunks, physics)

        this.updateDebugInfo();
    }

    render() {
        // This is where your rendering library (e.g., Three.js) would draw the scene
        // For Three.js: this.renderer.render(this.scene, this.camera);
    }

    setPaused(paused) {
        this.isGamePaused = paused;
        if (paused) {
            // Potentially show a pause screen or menu
        } else {
            // Resume game elements
        }
    }

    isPaused() {
        return this.isGamePaused;
    }

    updateDebugInfo() {
        if (this.debugInfoElement && this.player) {
            const pos = this.player.getPosition();
            this.debugInfoElement.innerHTML = `
                FPS: ${Math.round(1 / Game.deltaTime)}<br>
                X: ${pos.x.toFixed(2)}<br>
                Y: ${pos.y.toFixed(2)}<br>
                Z: ${pos.z.toFixed(2)}
            `;
        }
    }

    static deltaTime = 0; // Static property to easily access delta time for debug
}
