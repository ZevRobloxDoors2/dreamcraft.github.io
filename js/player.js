import * as THREE from 'three';

export class Player {
    constructor(controls, camera, world) {
        this.controls = controls;
        this.camera = camera;
        this.world = world; 
        
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        this.baseSpeed = 8.0;
        this.sprintSpeed = 14.0;
        this.currentSpeed = this.baseSpeed;
        
        this.jumpForce = 8.0;
        this.gravity = 25.0;
        this.canJump = false;
        
        this.playerHeight = 1.62;
        this.camera.position.set(0, 10, 0); 

        // Health & Fall Damage tracking
        this.maxHealth = 20; // 20 HP = 10 Hearts
        this.health = 20;
        this.previousYVelocity = 0; // Tracks how fast we were falling right before hitting the ground
        
        // Sprinting logic variables
        this.lastWPressTime = 0;
        this.isSprinting = false;

        this.raycaster = new THREE.Raycaster();
        this.setupInputs();
        this.initHealthUI();
    }

    initHealthUI() {
        this.healthBar = document.getElementById('healthBar');
        this.updateHealthUI();
    }

    updateHealthUI() {
        this.healthBar.innerHTML = '';
        const heartsToDraw = 10;
        const currentHearts = Math.ceil(this.health / 2);

        // Add bobbing effect if health is 4 (2 hearts) or lower
        if (this.health <= 4) {
            this.healthBar.classList.add('low-health');
        } else {
            this.healthBar.classList.remove('low-health');
        }

        for (let i = 0; i < heartsToDraw; i++) {
            const heartDiv = document.createElement('div');
            heartDiv.className = 'heart';
            if (i >= currentHearts) heartDiv.classList.add('empty');
            this.healthBar.appendChild(heartDiv);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        this.updateHealthUI();
        
        // Flash screen red (optional visual feedback)
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0'; flash.style.left = '0'; flash.style.width = '100%'; flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(255, 0, 0, 0.4)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '999';
        document.body.appendChild(flash);
        setTimeout(() => document.body.removeChild(flash), 200);

        if (this.health === 0) {
            console.log("Player Died!"); // We can add respawn logic later
        }
    }

    setupInputs() {
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW': 
                    this.moveForward = true; 
                    // Double tap W to sprint
                    const currentTime = Date.now();
                    if (currentTime - this.lastWPressTime < 300) {
                        this.isSprinting = true;
                    }
                    this.lastWPressTime = currentTime;
                    break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'KeyR': this.isSprinting = true; break; // R to sprint
                case 'Space': 
                    if (this.canJump) {
                        this.velocity.y = this.jumpForce;
                        this.canJump = false;
                    }
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW': 
                    this.moveForward = false; 
                    this.isSprinting = false; // Stop sprinting when W is released
                    break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyD': this.moveRight = false; break;
                case 'KeyR': this.isSprinting = false; break;
            }
        });
    }

    update(delta) {
        // Set speed based on sprint state
        this.currentSpeed = (this.isSprinting && this.moveForward) ? this.sprintSpeed : this.baseSpeed;

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize(); 

        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.currentSpeed * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.currentSpeed * delta;

        const moveX = -this.velocity.x * delta;
        const moveZ = -this.velocity.z * delta;

        // Save velocity before gravity updates it to calculate fall damage
        this.previousYVelocity = this.velocity.y;

        this.velocity.y -= this.gravity * delta;
        let nextY = this.camera.position.y + (this.velocity.y * delta);
        
        this.raycaster.set(this.camera.position, new THREE.Vector3(0, -1, 0));
        const floorIntersects = this.raycaster.intersectObjects(this.world.blocks);

        if (floorIntersects.length > 0) {
            const distToFloor = floorIntersects[0].distance;
            if (this.velocity.y <= 0 && distToFloor <= this.playerHeight) {
                
                // FALL DAMAGE LOGIC
                // If we hit the ground and were falling faster than -12 units/sec
                if (!this.canJump && this.previousYVelocity < -12) {
                    // Calculate damage based on how fast we were falling
                    let fallDamage = Math.floor(Math.abs(this.previousYVelocity) - 10);
                    if (fallDamage > 0) this.takeDamage(fallDamage);
                }

                this.velocity.y = 0;
                nextY = floorIntersects[0].point.y + this.playerHeight;
                this.canJump = true;
            } else if (distToFloor > this.playerHeight) {
                this.canJump = false; 
            }
        } else {
            this.canJump = false;
        }

        this.controls.moveRight(moveX);
        this.controls.moveForward(moveZ);
        this.camera.position.y = nextY;
    }
}
