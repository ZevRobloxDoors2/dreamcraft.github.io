import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { World } from './world.js';
import { Player } from './player.js';

export class Game {
    constructor() {
        this.gameState = 'menu';
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.centerCoords = new THREE.Vector2(0, 0); 
        this.inventory = []; 
        this.selectedSlot = 0; 

        // Swing animation variables
        this.isSwinging = false;
        this.swingProgress = 0;
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
        this.player = new Player(this.controls, this.camera, this.world);

        // --- NEW: 3D Held Item (Attached to Camera) ---
        this.handGroup = new THREE.Group();
        this.handGroup.position.set(0.6, -0.5, -0.8); // Position bottom right of screen
        this.camera.add(this.handGroup);
        this.scene.add(this.camera);

        const handMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.4, 0.4),
            this.world.materials.dirt // Default holding dirt
        );
        this.handGroup.add(handMesh);

        // Click to Break / Place / Swing
        document.addEventListener('mousedown', (event) => {
            if (this.gameState !== 'playing') return;

            // Trigger Swing Animation
            this.isSwinging = true;
            this.swingProgress = 0;

            this.raycaster.setFromCamera(this.centerCoords, this.camera);
            const intersects = this.raycaster.intersectObjects(this.world.blocks);

            if (intersects.length > 0 && intersects[0].distance <= 5.0) {
                const intersect = intersects[0];
                if (event.button === 0) { 
                    this.world.breakBlock(intersect.object);
                } else if (event.button === 2) { 
                    const pos = intersect.object.position.clone().add(intersect.face.normal);
                    this.world.placeBlock(pos.x, pos.y, pos.z, 'dirt');
                }
            }
        });

        // Hotbar selection
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            if (e.key >= '1' && e.key <= '9') {
                this.selectedSlot = parseInt(e.key) - 1;
                const slots = document.querySelectorAll('#hotbar .inv-slot');
                slots.forEach(slot => slot.classList.remove('active'));
                if(slots[this.selectedSlot]) slots[this.selectedSlot].classList.add('active');
            }
        });

        this.clock.start();
        this.animate(); 
    }

    startGame() {
        this.gameState = 'playing';
        this.camera.position.set(0, 15, 0); // Drop in from high up!
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

            // Animate Swinging Hand
            if (this.isSwinging) {
                this.swingProgress += delta * 15; // Swing speed
                // Simple math to make it dip down and come back up
                this.handGroup.rotation.x = Math.sin(this.swingProgress) * -1.0; 
                
                if (this.swingProgress > Math.PI) {
                    this.isSwinging = false;
                    this.handGroup.rotation.x = 0; // Reset
                }
            } else {
                // Idle breathing bobbing for the hand
                this.handGroup.position.y = -0.5 + Math.sin(time) * 0.05;
            }

            for (let i = this.world.particles.length - 1; i >= 0; i--) {
                const p = this.world.particles[i];
                p.userData.velocity.y -= 15.0 * delta; 
                p.position.addScaledVector(p.userData.velocity, delta);
                p.scale.subScalar(delta * 0.5); 
                if (p.scale.x <= 0) { this.scene.remove(p); this.world.particles.splice(i, 1); }
            }

            for (let i = this.world.droppedItems.length - 1; i >= 0; i--) {
                const item = this.world.droppedItems[i];
                item.rotation.y += delta * 2;
                item.position.y = item.userData.startY + Math.sin(time * 2) * 0.2;

                if (this.camera.position.distanceTo(item.position) < 2.0) {
                    this.inventory.push(item.userData.type);
                    this.scene.remove(item);
                    this.world.droppedItems.splice(i, 1);
                }
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}
