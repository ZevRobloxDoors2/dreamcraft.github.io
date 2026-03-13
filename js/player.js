import * as THREE from 'three';

export class Player {
    constructor(controls, camera, world) {
        this.controls = controls;
        this.camera = camera;
        this.world = world; // Needs access to the world blocks for collision
        
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        this.speed = 8.0;
        this.jumpForce = 7.0;
        this.gravity = 25.0;
        this.canJump = false;
        
        this.playerHeight = 1.62;
        this.camera.position.set(0, 10, 0); // Drop in from the sky!

        this.raycaster = new THREE.Raycaster();
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
                    if (this.canJump) {
                        this.velocity.y = this.jumpForce;
                        this.canJump = false;
                    }
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
        // 1. Horizontal Movement Logic
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize(); 

        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.speed * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.speed * delta;

        // 2. Horizontal Collision (Stop phasing through walls)
        const currentPos = this.camera.position.clone();
        let moveX = -this.velocity.x * delta;
        let moveZ = -this.velocity.z * delta;

        // 3. Gravity & Floor Collision
        this.velocity.y -= this.gravity * delta;
        let nextY = this.camera.position.y + (this.velocity.y * delta);
        
        // Raycast straight down from the camera
        this.raycaster.set(this.camera.position, new THREE.Vector3(0, -1, 0));
        const floorIntersects = this.raycaster.intersectObjects(this.world.blocks);

        if (floorIntersects.length > 0) {
            const distToFloor = floorIntersects[0].distance;
            // If we are falling and about to hit the floor
            if (this.velocity.y <= 0 && distToFloor <= this.playerHeight) {
                this.velocity.y = 0;
                nextY = floorIntersects[0].point.y + this.playerHeight;
                this.canJump = true;
            } else if (distToFloor > this.playerHeight) {
                // If the distance to the floor is greater than player height, we are over a hole!
                this.canJump = false; 
            }
        } else {
            // Nothing under us (void)
            this.canJump = false;
        }

        // Apply all movements safely
        this.controls.moveRight(moveX);
        this.controls.moveForward(moveZ);
        this.camera.position.y = nextY;
    }
}
