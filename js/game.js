import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { World } from './world.js';
import { Player } from './player.js';

export class Game {
    constructor() {
        this.isRunning = false;
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.centerCoords = new THREE.Vector2(0, 0); // Center of screen
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(20, 40, 20);
        this.scene.add(directionalLight);

        this.controls = new PointerLockControls(this.camera, document.body);
        this.world = new World(this.scene);
        this.world.generate();

        this.player = new Player(this.controls, this.camera);

        // Click to Break / Place Blocks
        document.addEventListener('mousedown', (event) => {
            if (!this.isRunning) return;

            this.raycaster.setFromCamera(this.centerCoords, this.camera);
            // Only interact with blocks (which we put in world.blocks array)
            const intersects = this.raycaster.intersectObjects(this.world.blocks);

            if (intersects.length > 0) {
                const intersect = intersects[0];
                
                // Left Click (0) to Break
                if (event.button === 0) {
                    this.scene.remove(intersect.object);
                    // Remove from our array so we can't click it anymore
                    this.world.blocks = this.world.blocks.filter(b => b !== intersect.object);
                } 
                // Right Click (2) to Place
                else if (event.button === 2) {
                    const placePosition = intersect.object.position.clone().add(intersect.face.normal);
                    this.world.placeBlock(placePosition.x, placePosition.y, placePosition.z, 'dirt');
                }
            }
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    start() {
        this.controls.lock();
        this.isRunning = true;
        this.clock.start();
        this.animate();
    }

    pause() { this.isRunning = false; }

    animate() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        this.player.update(delta);
        this.renderer.render(this.scene, this.camera);
    }
}
