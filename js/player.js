import { InputManager } from './input.js'; // You'll need an input manager

export class Player {
    constructor(camera) {
        this.camera = camera; // The camera is essentially the player's view
        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0 }; // x for up/down, y for left/right

        this.moveSpeed = 8; // Blocks per second
        this.jumpStrength = 15;
        this.gravity = -30;
        this.onGround = false;
        this.height = 1.8; // Player height in blocks

        this.input = new InputManager(); // Initialize input handling

        this.setupPointerLockControls();
    }

    setPosition(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.camera.position.set(x, y + this.height, z); // Camera is at eye level
    }

    getPosition() {
        return { x: this.position.x, y: this.position.y, z: this.position.z };
    }

    setupPointerLockControls() {
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement) {
                const movementX = event.movementX || 0;
                const movementY = event.movementY || 0;

                const sensitivity = 0.002; // Adjust sensitivity as needed
                this.rotation.y -= movementX * sensitivity; // Yaw (left/right)
                this.rotation.x -= movementY * sensitivity; // Pitch (up/down)

                // Clamp pitch to prevent flipping
                this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

                // Update camera rotation (example for Three.js)
                // this.camera.rotation.y = this.rotation.y;
                // this.camera.rotation.x = this.rotation.x;
            }
        });
    }

    update(deltaTime) {
        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;

        // Reset X and Z velocity for movement each frame
        this.velocity.x = 0;
        this.velocity.z = 0;

        // Player movement based on input (e.g., WASD)
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.camera.rotation);
        const right = new THREE.Vector3(1, 0, 0).applyEuler(this.camera.rotation);

        if (this.input.isKeyDown('KeyW')) {
            this.velocity.x += forward.x * this.moveSpeed;
            this.velocity.z += forward.z * this.moveSpeed;
        }
        if (this.input.isKeyDown('KeyS')) {
            this.velocity.x -= forward.x * this.moveSpeed;
            this.velocity.z -= forward.z * this.moveSpeed;
        }
        if (this.input.isKeyDown('KeyA')) {
            this.velocity.x -= right.x * this.moveSpeed;
            this.velocity.z -= right.z * this.moveSpeed;
        }
        if (this.input.isKeyDown('KeyD')) {
            this.velocity.x += right.x * this.moveSpeed;
            this.velocity.z += right.z * this.moveSpeed;
        }

        if (this.input.isKeyDown('Space') && this.onGround) {
            this.velocity.y = this.jumpStrength;
            this.onGround = false;
        }

        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        // Simple ground collision (replace with proper physics later)
        if (this.position.y < 0) { // Assuming ground is at y=0
            this.position.y = 0;
            this.velocity.y = 0;
            this.onGround = true;
        } else {
            this.onGround = false; // More sophisticated check needed
        }

        // Update camera position
        this.camera.position.set(this.position.x, this.position.y + this.height, this.position.z);
    }
}

// A simple InputManager to track key states
// This would ideally be in its own file, e.g., `js/input.js`
export class InputManager {
    constructor() {
        this.keys = {};
        document.addEventListener('keydown', (e) => this.keys[e.code] = true);
        document.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    isKeyDown(keyCode) {
        return this.keys[keyCode];
    }
}
