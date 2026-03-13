import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { World } from './world.js';
import { Player } from './player.js';

export class Game {
    constructor() {
        this.isRunning = false;
        this.clock = new THREE.Clock();
    }

    init() {
        // 1. Create the Scene and Camera
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky color
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 50); // Add some fog

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        // 2. Create the Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // 3. Add Lighting (Sunlight)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);

        // 4. Setup Controls (First Person)
        this.controls = new PointerLockControls(this.camera, document.body);

        // 5. Initialize World and Player
        this.world = new World(this.scene);
        this.world.generate();

        this.player = new Player(this.controls, this.camera);

        // Handle window resizing
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    start() {
        this.controls.lock(); // Locks the mouse to the game
        this.isRunning = true;
        this.clock.start();
        this.animate();
    }

    pause() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        this.player.update(delta);
        this.renderer.render(this.scene, this.camera);
    }
}
