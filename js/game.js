import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { World } from './world.js';
import { Player } from './player.js';

export class Game {
    constructor() {
        // Add this inside your Game constructor:
this.selectedSlot = 0; 

// Replace your mousedown event listener inside game.init() with this:
document.addEventListener('mousedown', (event) => {
    if (this.gameState !== 'playing') return;

    this.raycaster.setFromCamera(this.centerCoords, this.camera);
    const intersects = this.raycaster.intersectObjects(this.world.blocks);

    // REACH LIMIT: Only allow interaction if the block is within 5 units
    if (intersects.length > 0 && intersects[0].distance <= 5.0) {
        const intersect = intersects[0];
        if (event.button === 0) { 
            this.world.breakBlock(intersect.object);
        } else if (event.button === 2) { 
            // In the future, this 'dirt' will be whatever is in this.selectedSlot
            const pos = intersect.object.position.clone().add(intersect.face.normal);
            this.world.placeBlock(pos.x, pos.y, pos.z, 'dirt'); 
        }
    }
});

// Add this hotbar selector logic inside game.init():
document.addEventListener('keydown', (e) => {
    if (this.gameState !== 'playing') return;
    
    // Check if key is a number between 1 and 9
    if (e.key >= '1' && e.key <= '9') {
        this.selectedSlot = parseInt(e.key) - 1;
        
        // Update UI visuals
        const slots = document.querySelectorAll('#hotbar .inv-slot');
        slots.forEach(slot => slot.classList.remove('active'));
        slots[this.selectedSlot].classList.add('active');
    }
});
        this.gameState = 'menu';
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.centerCoords = new THREE.Vector2(0, 0); 
        this.inventory = []; // Player's collected items
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xFF7E47); 
        this.scene.fog = new THREE.FogExp2(0xFF7E47, 0.015); 

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const ambientLight = new THREE.AmbientLight(0xffbfa5, 0.6);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xff8c00, 1.0);
        directionalLight.position.set(20, 10, -20);
        this.scene.add(directionalLight);

        this.controls = new PointerLockControls(this.camera, document.body);
        
        this.world = new World(this.scene);
        this.world.generate();

        // Pass the world to the player for collision detection!
        this.player = new Player(this.controls, this.camera, this.world);

        // Click to Break / Place
        document.addEventListener('mousedown', (event) => {
            if (this.gameState !== 'playing') return;

            this.raycaster.setFromCamera(this.centerCoords, this.camera);
            const intersects = this.raycaster.intersectObjects(this.world.blocks);

            if (intersects.length > 0) {
                const intersect = intersects[0];
                if (event.button === 0) { 
                    // Trigger the new break block effect!
                    this.world.breakBlock(intersect.object);
                } else if (event.button === 2) { 
                    const pos = intersect.object.position.clone().add(intersect.face.normal);
                    this.world.placeBlock(pos.x, pos.y, pos.z, 'dirt');
                }
            }
        });

        this.clock.start();
        this.animate(); 
    }

    startGame() {
        this.gameState = 'playing';
        this.camera.position.set(0, 10, 0); 
        this.controls.lock(); 
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.02);
    }

    pauseGame() {
        this.gameState = 'paused';
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        const time = Date.now() * 0.002;

        if (this.gameState === 'menu') {
            this.camera.position.x = Math.sin(time * 0.1) * 30;
            this.camera.position.z = Math.cos(time * 0.1) * 30;
            this.camera.position.y = 15; 
            this.camera.lookAt(0, 5, 0); 
        } 
        else if (this.gameState === 'playing') {
            this.player.update(delta);

            // --- 1. Animate Breaking Particles ---
            for (let i = this.world.particles.length - 1; i >= 0; i--) {
                const p = this.world.particles[i];
                p.userData.velocity.y -= 15.0 * delta; // Gravity on particles
                p.position.addScaledVector(p.userData.velocity, delta);
                p.scale.subScalar(delta * 0.5); // Shrink over time

                if (p.scale.x <= 0) {
                    this.scene.remove(p);
                    this.world.particles.splice(i, 1);
                }
            }

            // --- 2. Animate and Collect Dropped Items ---
            for (let i = this.world.droppedItems.length - 1; i >= 0; i--) {
                const item = this.world.droppedItems[i];
                
                // Spin 360 and Bob up and down
                item.rotation.y += delta * 2;
                item.position.y = item.userData.startY + Math.sin(time * 2) * 0.2;

                // Check distance to player for collection
                const dist = this.camera.position.distanceTo(item.position);
                if (dist < 2.0) {
                    // Collect it!
                    this.inventory.push(item.userData.type);
                    console.log("Collected: " + item.userData.type); // Check your browser console!
                    
                    this.scene.remove(item);
                    this.world.droppedItems.splice(i, 1);
                }
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}
