class World {
    constructor() {
        this.chunkSize = 16;
        this.worldHeight = 128;
        this.renderDistance = 8;
        this.chunks = new Map();
        this.blocks = new Map();
        this.textureLoader = new THREE.TextureLoader();
        this.materials = {};
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        
        this.blockTypes = {
            grass: { 
                id: 1, 
                textures: {
                    top: 'textures/grass.png',
                    side: 'textures/grass_side.png',
                    bottom: 'textures/dirt.png'
                },
                color: 0x567d46 
            },
            dirt: { 
                id: 2, 
                textures: { all: 'textures/dirt.png' },
                color: 0x8b4513 
            },
            stone: { 
                id: 3, 
                textures: { all: 'textures/stone.png' },
                color: 0x808080 
            },
            wood: { 
                id: 4, 
                textures: { all: 'textures/wood.png' },
                color: 0x8b4513 
            },
            leaves: { 
                id: 5, 
                textures: { all: 'textures/leaves.png' },
                color: 0x228b22,
                transparent: true 
            },
            sand: { 
                id: 6, 
                textures: { all: 'textures/sand.png' },
                color: 0xf4a460 
            },
            water: { 
                id: 7, 
                textures: { all: 'textures/water.png' },
                color: 0x4682b4,
                transparent: true,
                opacity: 0.7
            },
            bedrock: { 
                id: 8, 
                textures: { all: 'textures/bedrock.png' },
                color: 0x2f2f2f 
            }
        };
        
        this.initMaterials();
    }
    
    initMaterials() {
        // Create materials for each block type
        for (const [name, data] of Object.entries(this.blockTypes)) {
            if (data.textures.all) {
                // Single texture for all sides
                const texture = this.textureLoader.load(data.textures.all);
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;
                
                this.materials[name] = new THREE.MeshLambertMaterial({
                    map: texture,
                    transparent: data.transparent || false,
                    opacity: data.opacity || 1
                });
            } else {
                // Different textures for different sides
                const materials = [
                    new THREE.MeshLambertMaterial({ map: this.loadTexture(data.textures.side) }), // right
                    new THREE.MeshLambertMaterial({ map: this.loadTexture(data.textures.side) }), // left
                    new THREE.MeshLambertMaterial({ map: this.loadTexture(data.textures.top) }),  // top
                    new THREE.MeshLambertMaterial({ map: this.loadTexture(data.textures.bottom) }), // bottom
                    new THREE.MeshLambertMaterial({ map: this.loadTexture(data.textures.side) }), // front
                    new THREE.MeshLambertMaterial({ map: this.loadTexture(data.textures.side) })  // back
                ];
                this.materials[name] = materials;
            }
        }
    }
    
    loadTexture(path) {
        const texture = this.textureLoader.load(path);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    generateChunk(cx, cz) {
        const chunkKey = `${cx},${cz}`;
        if (this.chunks.has(chunkKey)) return;
        
        const chunk = new THREE.Group();
        const blocks = [];
        
        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const worldX = cx * this.chunkSize + x;
                const worldZ = cz * this.chunkSize + z;
                
                // Generate terrain height using simplex noise-like function
                const height = this.getTerrainHeight(worldX, worldZ);
                
                for (let y = 0; y <= height; y++) {
                    let blockType = 'stone';
                    
                    if (y === height) {
                        blockType = height > 62 ? 'grass' : 'sand';
                    } else if (y > height - 3) {
                        blockType = height > 62 ? 'dirt' : 'sand';
                    } else if (y < 5) {
                        blockType = 'bedrock';
                    }
                    
                    // Add water
                    if (height < 62 && y > height && y <= 62) {
                        this.addBlock(worldX, y, worldZ, 'water', chunk);
                    }
                    
                    if (y <= height) {
                        this.addBlock(worldX, y, worldZ, blockType, chunk);
                    }
                }
                
                // Generate trees
                if (Math.random() < 0.02 && height > 62 && height < 100) {
                    this.generateTree(worldX, height + 1, worldZ, chunk);
                }
            }
        }
        
        this.chunks.set(chunkKey, chunk);
        return chunk;
    }
    
    getTerrainHeight(x, z) {
        // Simple noise function
        let height = 64;
        height += Math.sin(x * 0.05) * 10;
        height += Math.sin(z * 0.05) * 10;
        height += Math.sin(x * 0.1 + z * 0.1) * 5;
        height += Math.sin(x * 0.02) * Math.cos(z * 0.02) * 15;
        return Math.floor(Math.max(5, Math.min(100, height)));
    }
    
    addBlock(x, y, z, type, chunk) {
        const material = this.materials[type];
        const mesh = new THREE.Mesh(this.geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { type, x, y, z };
        
        chunk.add(mesh);
        this.blocks.set(`${x},${y},${z}`, { type, mesh });
    }
    
    generateTree(x, y, z, chunk) {
        const height = 4 + Math.floor(Math.random() * 3);
        
        // Trunk
        for (let i = 0; i < height; i++) {
            this.addBlock(x, y + i, z, 'wood', chunk);
        }
        
        // Leaves
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = height - 2; dy <= height + 1; dy++) {
                    if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy - height) < 4) {
                        if (dx !== 0 || dz !== 0 || dy < height) {
                            this.addBlock(x + dx, y + dy, z + dz, 'leaves', chunk);
                        }
                    }
                }
            }
        }
    }
    
    getBlock(x, y, z) {
        return this.blocks.get(`${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`);
    }
    
    setBlock(x, y, z, type) {
        const key = `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
        const existing = this.blocks.get(key);
        
        if (existing) {
            existing.mesh.parent.remove(existing.mesh);
            this.blocks.delete(key);
        }
        
        if (type) {
            const cx = Math.floor(x / this.chunkSize);
            const cz = Math.floor(z / this.chunkSize);
            const chunkKey = `${cx},${cz}`;
            const chunk = this.chunks.get(chunkKey);
            
            if (chunk) {
                this.addBlock(Math.floor(x), Math.floor(y), Math.floor(z), type, chunk);
            }
        }
    }
    
    update(playerX, playerZ) {
        const pcx = Math.floor(playerX / this.chunkSize);
        const pcz = Math.floor(playerZ / this.chunkSize);
        
        // Generate chunks around player
        for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
            for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
                const cx = pcx + dx;
                const cz = pcz + dz;
                this.generateChunk(cx, cz);
            }
        }
        
        // Remove distant chunks
        for (const [key, chunk] of this.chunks) {
            const [cx, cz] = key.split(',').map(Number);
            if (Math.abs(cx - pcx) > this.renderDistance + 2 || 
                Math.abs(cz - pcz) > this.renderDistance + 2) {
                // Remove chunk meshes
                // In a full implementation, we'd pool these
            }
        }
    }
}
