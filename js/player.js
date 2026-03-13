import * as THREE from 'three';

export class Player {
    constructor(controls, camera) {
        this.controls = controls;
        this.camera = camera;
        
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Movement settings
        this.speed = 10.0;
        this.jumpForce = 8.0;
        this.gravity = 20.0;
        
        this.canJump = false;

        // Start player slightly above the ground
        this.camera.position.set(0, 2, 0);

        this.setupInputs();
    }

    setupInputs() {
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'Space': 
                    if (this.canJump === true) this.velocity.y += this.jumpForce;
                    this.canJump = false;
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyD': this.moveRight = false; break;
            }
        });
    }

    update(delta) {
        // Apply Gravity
        this.velocity.y -= this.gravity * delta;

        // Handle WASD friction/velocity
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize(); // Ensure consistent speed in all directions

        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.speed * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.speed * delta;

        // Apply movement to the controls/camera
        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);
        
        this.camera.position.y += (this.velocity.y * delta);

        // Simple Ground Collision (The ground is at Y = 0, camera is at Y = 2)
        if (this.camera.position.y < 2) {
            this.velocity.y = 0;
            this.camera.position.y = 2;
            this.canJump = true;
        }
    }
}
