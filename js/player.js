class Player {
    constructor(camera) {
        this.camera = camera;
        this.position = new THREE.Vector3(0, 70, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        
        this.height = 1.8;
        this.radius = 0.3;
        this.speed = 0.1;
        this.sprintSpeed = 0.2;
        this.jumpForce = 0.3;
        this.gravity = 0.02;
        this.friction = 0.9;
        
        this.onGround = false;
        this.sprinting = false;
        this.flying = false;
        
        this.keys = {};
        this.mouseLocked = false;
        
        this.selectedSlot = 0;
        this.hotbar = ['grass', 'dirt', 'stone', 'wood', 'leaves', 'sand', 'water', 'bedrock'];
        
        this.setupControls();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space' && this.onGround) {
                this.velocity.y = this.jumpForce;
                this.onGround = false;
            }
            
            if (e.code.startsWith('Digit')) {
                const num = parseInt(e.code.replace('Digit', '')) - 1;
                if (num >= 0 && num < 9) {
                    this.selectedSlot = num;
                    this.updateHotbar();
                }
            }
            
            if (e.code === 'KeyE') {
                // Open inventory (not implemented)
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.mouseLocked) return;
            
            this.rotation.y -= e.movementX * 0.002;
            this.rotation.x -= e.movementY * 0.002;
            this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
            
            this.camera.rotation.copy(this.rotation);
        });
        
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.breakBlock();
            } else if (e.button === 2) {
                this.placeBlock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.mouseLocked = document.pointerLockElement === document.getElementById('gameCanvas');
        });
    }
    
    update(world) {
        // Calculate movement
        const speed = this.keys['ShiftLeft'] ? this.sprintSpeed : this.speed;
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);
        const right = new THREE.Vector3(1, 0, 0).applyEuler(this.rotation);
        
        forward.y = 0;
        right.y = 0;
        forward.normalize();
        right.normalize();
        
        let moveX = 0;
        let moveZ = 0;
        
        if (this.keys['KeyW']) {
            moveX += forward.x * speed;
            moveZ += forward.z * speed;
        }
        if (this.keys['KeyS']) {
            moveX -= forward.x * speed;
            moveZ -= forward.z * speed;
        }
        if (this.keys['KeyA']) {
            moveX -= right.x * speed;
            moveZ -= right.z * speed;
        }
        if (this.keys['KeyD']) {
            moveX += right.x * speed;
            moveZ += right.z * speed;
        }
        
        // Apply gravity
        if (!this.flying) {
            this.velocity.y -= this.gravity;
        }
        
        // Apply movement with collision
        this.tryMove(moveX, 0, 0, world);
        this.tryMove(0, 0, moveZ, world);
        this.tryMove(0, this.velocity.y, 0, world);
        
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.z *= this.friction;
        
        // Update camera position
        this.camera.position.copy(this.position);
        this.camera.position.y += this.height;
        
        // Update HUD
        this.updateHUD();
    }
    
    tryMove(dx, dy, dz, world) {
        const newPos = this.position.clone().add(new THREE.Vector3(dx, dy, dz));
        
        // Check collision with blocks
        const minX = Math.floor(newPos.x - this.radius);
        const maxX = Math.floor(newPos.x + this.radius);
        const minY = Math.floor(newPos.y);
        const maxY = Math.floor(newPos.y + this.height);
        const minZ = Math.floor(newPos.z - this.radius);
        const maxZ = Math.floor(newPos.z + this.radius);
        
        let collided = false;
        
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const block = world.getBlock(x, y, z);
                    if (block && block.type !== 'water') {
                        collided = true;
                        if (dy < 0) {
                            this.onGround = true;
                            this.velocity.y = 0;
                        }
                        return;
                    }
                }
            }
        }
        
        this.position.copy(newPos);
        if (dy < 0) this.onGround = false;
    }
    
    getTargetBlock(world) {
        const reach = 5;
        const step = 0.1;
        const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);
        
        for (let d = 0; d < reach; d += step) {
            const pos = this.camera.position.clone().add(direction.clone().multiplyScalar(d));
            const block = world.getBlock(pos.x, pos.y, pos.z);
            
            if (block) {
                return {
                    block,
                    x: Math.floor(pos.x),
                    y: Math.floor(pos.y),
                    z: Math.floor(pos.z),
                    prevX: Math.floor(this.camera.position.x + direction.x * (d - step)),
                    prevY: Math.floor(this.camera.position.y + direction.y * (d - step)),
                    prevZ: Math.floor(this.camera.position.z + direction.z * (d - step))
                };
            }
        }
        
        return null;
    }
    
    breakBlock() {
        if (!window.game || !window.game.world) return;
        const target = this.getTargetBlock(window.game.world);
        if (target) {
            window.game.world.setBlock(target.x, target.y, target.z, null);
        }
    }
    
    placeBlock() {
        if (!window.game || !window.game.world) return;
        const target = this.getTargetBlock(window.game.world);
        if (target) {
            const blockType = this.hotbar[this.selectedSlot];
            window.game.world.setBlock(target.prevX, target.prevY, target.prevZ, blockType);
        }
    }
    
    updateHotbar() {
        document.querySelectorAll('.hotbar-slot').forEach((slot, i) => {
            slot.classList.toggle('active', i === this.selectedSlot);
        });
    }
    
    updateHUD() {
        document.getElementById('coords').textContent = 
            `${Math.floor(this.position.x)}, ${Math.floor(this.position.y)}, ${Math.floor(this.position.z)}`;
    }
    
    lockPointer() {
        document.getElementById('gameCanvas').requestPointerLock();
    }
    
    unlockPointer() {
        document.exitPointerLock();
    }
}
