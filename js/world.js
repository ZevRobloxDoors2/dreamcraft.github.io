import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = []; // Array to store blocks so the raycaster can find them
        
        const textureLoader = new THREE.TextureLoader();
        const loadTex = (path) => {
            const tex = textureLoader.load(path);
            tex.magFilter = THREE.NearestFilter; 
            tex.minFilter = THREE.NearestFilter;
            return tex;
        }

        // Assuming you have these textures. If missing, it will just be black/white.
        const grassTop = loadTex('textures/grass.png');
        const grassSide = loadTex('textures/grass_side.png');
        const dirt = loadTex('textures/dirt.png');
        const logTop = loadTex('textures/log_top.png'); // Fallback to dirt if you don't have this
        const logSide = loadTex('textures/log_side.png');
        const leaves = loadTex('textures/leaves.png');

        this.grassMat = [
            new THREE.MeshLambertMaterial({ map: grassSide }), new THREE.MeshLambertMaterial({ map: grassSide }),
            new THREE.MeshLambertMaterial({ map: grassTop }), new THREE.MeshLambertMaterial({ map: dirt }),
            new THREE.MeshLambertMaterial({ map: grassSide }), new THREE.MeshLambertMaterial({ map: grassSide })
        ];
        this.dirtMat = new THREE.MeshLambertMaterial({ map: dirt });
        
        this.logMat = [
            new THREE.MeshLambertMaterial({ map: logSide }), new THREE.MeshLambertMaterial({ map: logSide }),
            new THREE.MeshLambertMaterial({ map: logTop }), new THREE.MeshLambertMaterial({ map: logTop }),
            new THREE.MeshLambertMaterial({ map: logSide }), new THREE.MeshLambertMaterial({ map: logSide })
        ];
        this.leafMat = new THREE.MeshLambertMaterial({ map: leaves, transparent: true, opacity: 0.9 });

        this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    }

    placeBlock(x, y, z, type) {
        let material = this.dirtMat;
        if (type === 'grass') material = this.grassMat;
        if (type === 'log') material = this.logMat;
        if (type === 'leaves') material = this.leafMat;

        const block = new THREE.Mesh(this.blockGeometry, material);
        block.position.set(x, y, z);
        this.scene.add(block);
        this.blocks.push(block); // Add to interactable array
    }

    generate() {
        const chunkSize = 32;
        
        for (let x = -chunkSize/2; x < chunkSize/2; x++) {
            for (let z = -chunkSize/2; z < chunkSize/2; z++) {
                
                // Procedural generation: Use sine waves to make rolling hills
                const yOffset = Math.floor(Math.sin(x / 4) * 2 + Math.cos(z / 4) * 2);
                
                // Place Grass
                this.placeBlock(x, yOffset, z, 'grass');
                // Place Dirt underneath
                this.placeBlock(x, yOffset - 1, z, 'dirt');
                this.placeBlock(x, yOffset - 2, z, 'dirt');

                // Tree Generation (5% chance per grass block)
                if (Math.random() > 0.95) {
                    this.generateTree(x, yOffset + 1, z);
                }
            }
        }
    }

    generateTree(x, baseY, z) {
        const height = Math.floor(Math.random() * 2) + 4; // Tree height 4 or 5
        
        // Wood Pillar
        for(let i = 0; i < height; i++) {
            this.placeBlock(x, baseY + i, z, 'log');
        }

        // Leaves Crown
        for(let lx = x - 2; lx <= x + 2; lx++) {
            for(let ly = baseY + height - 2; ly <= baseY + height + 1; ly++) {
                for(let lz = z - 2; lz <= z + 2; lz++) {
                    // Make it a bit rounded by cutting corners
                    if (Math.abs(lx - x) === 2 && Math.abs(lz - z) === 2) continue;
                    // Don't overwrite the log
                    if (lx === x && lz === z && ly < baseY + height) continue;
                    
                    this.placeBlock(lx, ly, lz, 'leaves');
                }
            }
        }
    }
}
