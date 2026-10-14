import * as THREE from 'three';

export class World {
    scene: THREE.Scene;
    blocks: THREE.Mesh[];
    droppedItems: THREE.Mesh[];
    particles: THREE.Mesh[];
    materials: { [key: string]: THREE.MeshLambertMaterial };
    blockGeometry: THREE.BoxGeometry;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.blocks = [];
        this.droppedItems = [];
        this.particles = [];

        this.materials = {
            grass: new THREE.MeshLambertMaterial({ color: 0x41980a }),
            dirt: new THREE.MeshLambertMaterial({ color: 0x5c4033 }),
            stone: new THREE.MeshLambertMaterial({ color: 0x7d7d7d }),
            coal_ore: new THREE.MeshLambertMaterial({ color: 0x222222 }),
            iron_ore: new THREE.MeshLambertMaterial({ color: 0xd8af93 }),
            wood: new THREE.MeshLambertMaterial({ color: 0x6e4726 }),
            leaves: new THREE.MeshLambertMaterial({ color: 0x2e8b57 })
        };

        this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    }

    placeBlock(x: number, y: number, z: number, type: string) {
        // Prevent duplicate blocks at same coordinates
        if (this.blocks.some(b => Math.abs(b.position.x - x) < 0.1 && Math.abs(b.position.y - y) < 0.1 && Math.abs(b.position.z - z) < 0.1)) {
            return;
        }
        const material = this.materials[type] || this.materials.dirt;
        const block = new THREE.Mesh(this.blockGeometry, material);
        block.position.set(x, y, z);
        block.userData = { type: type };
        this.scene.add(block);
        this.blocks.push(block);
    }

    breakBlock(blockMesh: THREE.Mesh): string {
        for (let i = 0; i < 8; i++) {
            const particle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), blockMesh.material);
            particle.position.copy(blockMesh.position);
            particle.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 5, (Math.random() - 0.5) * 5);
            this.scene.add(particle);
            this.particles.push(particle);
        }

        let droppedType = blockMesh.userData.type || 'dirt';
        if (droppedType === 'grass') droppedType = 'dirt';

        const item = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), this.materials[droppedType] || this.materials.dirt);
        item.position.copy(blockMesh.position);
        item.userData = { type: droppedType, startY: blockMesh.position.y };
        this.scene.add(item);
        this.droppedItems.push(item);

        this.scene.remove(blockMesh);
        this.blocks = this.blocks.filter(b => b !== blockMesh);
        return droppedType;
    }

    generate() {
        const chunkSize = 40;

        for (let x = -chunkSize / 2; x < chunkSize / 2; x++) {
            for (let z = -chunkSize / 2; z < chunkSize / 2; z++) {
                const surfaceY = Math.floor(Math.sin(x / 4) * 2 + Math.cos(z / 4) * 2);

                this.placeBlock(x, surfaceY, z, 'grass');

                for (let depth = 1; depth <= 8; depth++) {
                    let currentY = surfaceY - depth;
                    if (depth <= 2) {
                        this.placeBlock(x, currentY, z, 'dirt');
                    } else {
                        let blockType = 'stone';
                        let rand = Math.random();
                        if (rand > 0.95) blockType = 'coal_ore';
                        else if (rand > 0.90) blockType = 'iron_ore';
                        this.placeBlock(x, currentY, z, blockType);
                    }
                }

                // Scatter some trees
                if (Math.abs(x) % 8 === 0 && Math.abs(z) % 8 === 0 && Math.random() > 0.4) {
                    const treeHeight = 4;
                    for (let h = 1; h <= treeHeight; h++) {
                        this.placeBlock(x, surfaceY + h, z, 'wood');
                    }
                    // Leaves canopy
                    for (let lx = -1; lx <= 1; lx++) {
                        for (let lz = -1; lz <= 1; lz++) {
                            for (let ly = treeHeight - 1; ly <= treeHeight + 1; ly++) {
                                if (lx === 0 && lz === 0 && ly < treeHeight + 1) continue;
                                this.placeBlock(x + lx, surfaceY + ly, z + lz, 'leaves');
                            }
                        }
                    }
                }
            }
        }
    }
}
