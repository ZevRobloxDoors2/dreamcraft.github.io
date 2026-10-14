import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = []; 
        this.droppedItems = []; 
        this.particles = []; 
        
        // Basic Materials (You can replace colors with texture loaders later)
        this.materials = {
            grass: new THREE.MeshLambertMaterial({ color: 0x41980a }),
            dirt: new THREE.MeshLambertMaterial({ color: 0x5c4033 }),
            stone: new THREE.MeshLambertMaterial({ color: 0x7d7d7d }),
            coal_ore: new THREE.MeshLambertMaterial({ color: 0x222222 }),
            iron_ore: new THREE.MeshLambertMaterial({ color: 0xd8af93 })
        };

        this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    }

    placeBlock(x, y, z, type) {
        const material = this.materials[type] || this.materials.dirt;
        const block = new THREE.Mesh(this.blockGeometry, material);
        block.position.set(x, y, z);
        block.userData = { type: type }; 
        this.scene.add(block);
        this.blocks.push(block); 
    }

    breakBlock(blockMesh) {
        // Particles
        for (let i = 0; i < 8; i++) {
            const particle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), blockMesh.material);
            particle.position.copy(blockMesh.position);
            particle.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 5, (Math.random() - 0.5) * 5);
            this.scene.add(particle);
            this.particles.push(particle);
        }

        // Drops (Grass turns to dirt)
        let droppedType = blockMesh.userData.type;
        if (droppedType === 'grass') droppedType = 'dirt';

        const item = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), this.materials[droppedType]);
        item.position.copy(blockMesh.position);
        item.userData = { type: droppedType, startY: blockMesh.position.y };
        this.scene.add(item);
        this.droppedItems.push(item);

        this.scene.remove(blockMesh);
        this.blocks = this.blocks.filter(b => b !== blockMesh);
    }

    generate() {
        const chunkSize = 64; 
        
        for (let x = -chunkSize/2; x < chunkSize/2; x++) {
            for (let z = -chunkSize/2; z < chunkSize/2; z++) {
                // Surface height variance
                const surfaceY = Math.floor(Math.sin(x / 4) * 2 + Math.cos(z / 4) * 2);
                
                // Top layer
                this.placeBlock(x, surfaceY, z, 'grass');
                
                // Dig down 10 layers for caves/ores
                for (let depth = 1; depth <= 10; depth++) {
                    let currentY = surfaceY - depth;
                    
                    if (depth <= 2) {
                        this.placeBlock(x, currentY, z, 'dirt');
                    } else {
                        // Stone layer with random ores
                        let blockType = 'stone';
                        let rand = Math.random();
                        if (rand > 0.95) blockType = 'coal_ore';
                        else if (rand > 0.90) blockType = 'iron_ore';
                        
                        this.placeBlock(x, currentY, z, blockType);
                    }
                }
            }
        }
    }
}
