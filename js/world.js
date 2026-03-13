import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = []; 
        this.droppedItems = []; // Array for floating blocks
        this.particles = []; // Array for breaking effects
        
        const textureLoader = new THREE.TextureLoader();
        const loadTex = (path) => {
            const tex = textureLoader.load(path);
            tex.magFilter = THREE.NearestFilter; 
            tex.minFilter = THREE.NearestFilter;
            return tex;
        }

        const grassTop = loadTex('textures/grass.png');
        const grassSide = loadTex('textures/grass_side.png');
        const dirt = loadTex('textures/dirt.png');

        this.grassMat = [
            new THREE.MeshLambertMaterial({ map: grassSide }), new THREE.MeshLambertMaterial({ map: grassSide }),
            new THREE.MeshLambertMaterial({ map: grassTop }), new THREE.MeshLambertMaterial({ map: dirt }),
            new THREE.MeshLambertMaterial({ map: grassSide }), new THREE.MeshLambertMaterial({ map: grassSide })
        ];
        this.dirtMat = new THREE.MeshLambertMaterial({ map: dirt });

        this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
        
        // Render distance settings (14 default, up to 35)
        this.renderDistance = 14; 
    }

    placeBlock(x, y, z, type) {
        let material = type === 'grass' ? this.grassMat : this.dirtMat;
        const block = new THREE.Mesh(this.blockGeometry, material);
        block.position.set(x, y, z);
        block.userData = { type: type }; // Remember what block this is
        this.scene.add(block);
        this.blocks.push(block); 
    }

    // --- NEW: Break Effects & Drops ---
    breakBlock(blockMesh) {
        // ... (Keep your existing particle logic here) ...

        // GRASS TO DIRT LOGIC
        let droppedType = blockMesh.userData.type;
        if (droppedType === 'grass') {
            droppedType = 'dirt'; // Grass blocks drop dirt items
        }

        const item = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.25, 0.25),
            // Re-use the dirt material for the drop if it was grass
            droppedType === 'dirt' ? this.dirtMat : blockMesh.material 
        );
        item.position.copy(blockMesh.position);
        item.userData = { type: droppedType, startY: blockMesh.position.y };
        this.scene.add(item);
        this.droppedItems.push(item);

        this.scene.remove(blockMesh);
        this.blocks = this.blocks.filter(b => b !== blockMesh);
    }
        // 1. Create Particles (Cookie breaking effect)
        for (let i = 0; i < 8; i++) {
            const particle = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.2, 0.2),
                blockMesh.material
            );
            particle.position.copy(blockMesh.position);
            // Random explosion direction
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 5,
                (Math.random() - 0.5) * 5
            );
            this.scene.add(particle);
            this.particles.push(particle);
        }

        // 2. Spawn Floating Dropped Item
        const item = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.25, 0.25),
            blockMesh.material
        );
        item.position.copy(blockMesh.position);
        item.userData = { type: blockMesh.userData.type, startY: blockMesh.position.y };
        this.scene.add(item);
        this.droppedItems.push(item);

        // 3. Remove original block
        this.scene.remove(blockMesh);
        this.blocks = this.blocks.filter(b => b !== blockMesh);
    }

    generate() {
        // Expanded to 64 so the menu background void is hidden!
        const chunkSize = 64; 
        
        for (let x = -chunkSize/2; x < chunkSize/2; x++) {
            for (let z = -chunkSize/2; z < chunkSize/2; z++) {
                const yOffset = Math.floor(Math.sin(x / 4) * 2 + Math.cos(z / 4) * 2);
                this.placeBlock(x, yOffset, z, 'grass');
                this.placeBlock(x, yOffset - 1, z, 'dirt');
            }
        }
    }
}
