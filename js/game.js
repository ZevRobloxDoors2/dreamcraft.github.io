import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { World } from './world.js';
import { Player } from './player.js';

export class Game {
    constructor() {
        this.gameState = 'menu'; // Starts in the menu
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.centerCoords = new THREE.Vector2(0, 0); 
    }

    init() {
        this.scene = new THREE.Scene();
        // Sunset Background Color (Orange/Pinkish)
        this.scene.background = new THREE.Color(0xFF7E47); 
        this.scene.fog = new THREE.FogExp2(0xFF7E47, 0.02); // Sunset fog

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Sunset Lighting
        const ambientLight = new THREE.AmbientLight(0xffbfa5, 0.6); // Warm ambient
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xff8c00, 1.0); // Orange sun
        directionalLight.position.set(20, 10, -20);
        this.scene.add(directionalLight);

        this.controls = new PointerLockControls(this.camera, document.body);
        
        // Generate the world immediately so it shows up on the menu
        this.world = new World(this.scene);
        this.world.generate();

        this.player = new Player(this.controls, this.camera);

        // Break/Place block logic
        document.addEventListener('mousedown', (event) => {
            if (this.gameState !== 'playing') return;

            this.raycaster.setFromCamera(this.centerCoords, this.camera);
            const intersects = this.raycaster.intersectObjects(this.world.blocks);

            if (intersects.length > 0) {
                const intersect = intersects[0];
                if (event.button === 0) { // Left Click Break
                    this.scene.remove(intersect.object);
                    this.world.blocks = this.world.blocks.filter(b => b !== intersect.object);
                } else if (event.button === 2) { // Right Click Place
                    const pos = intersect.object.position.clone().add(intersect.face.normal);
                    this.world.placeBlock(pos.x, pos.y, pos.z, 'dirt');
                }
            }
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Start animating immediately for the background
        this.clock.start();
        this.animate(); 
    }

    startGame() {
        this.gameState = 'playing';
        // Reset camera to player height and unlock from spinning
        this.camera.position.set(0, 10, 0); 
        this.controls.lock(); // Lock mouse
        
        // Change back to daytime lighting (optional, remove if you want permanent sunset)
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.02);
    }

    pauseGame() {
        this.gameState = 'paused';
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();

        if (this.gameState === 'menu') {
            // Spin the camera in a circle over the world
            const time = Date.now() * 0.0002;
            this.camera.position.x = Math.sin(time) * 30;
            this.camera.position.z = Math.cos(time) * 30;
            this.camera.position.y = 15; // Height of the camera
            this.camera.lookAt(0, 5, 0); // Look at the center of the world
        } 
        else if (this.gameState === 'playing') {
            // Player movement
            this.player.update(delta);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}
