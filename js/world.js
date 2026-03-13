import { Block } from './block.js'; // Assuming you'll have a Block class

export class World {
    constructor() {
        this.chunks = new Map(); // Stores chunks: Map<chunkKey, ChunkData>
        this.blocks = {}; // A simpler flat map for individual blocks (x,y,z -> blockType) for quick lookup
        this.blockSize = 1; // Size of a single block in world units
    }

    // Generates a chunk of blocks at a specific chunk coordinate
    generateChunk(chunkX, chunkY, chunkZ) {
        const chunkSize = 16; // 16x16x16 blocks per chunk
        const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
        console.log(`Generating chunk at ${chunkKey}`);

        const newChunkBlocks = [];

        for (let x = 0; x < chunkSize; x++) {
            for (let z = 0; z < chunkSize; z++) {
                // Simple flat world generation for now
                const worldX = chunkX * chunkSize + x;
                const worldZ = chunkZ * chunkSize + z;
                const groundHeight = Math.floor(Math.sin(worldX * 0.1) * 2 + Math.cos(worldZ * 0.1) * 2) + 5; // Basic terrain

                for (let y = 0; y < chunkSize; y++) {
                    const worldY = chunkY * chunkSize + y;

                    let blockType = 'air';
                    if (worldY < groundHeight - 3) {
                        blockType = 'stone';
                    } else if (worldY < groundHeight) {
                        blockType = 'dirt';
                    } else if (worldY === groundHeight) {
                        blockType = 'grass';
                    }

                    if (blockType !== 'air') {
                        const block = new Block(worldX, worldY, worldZ, blockType);
                        newChunkBlocks.push(block);
                        this.setBlock(worldX, worldY, worldZ, block);
                    }
                }
            }
        }
        this.chunks.set(chunkKey, newChunkBlocks);
        console.log(`Chunk ${chunkKey} generated with ${newChunkBlocks.length} blocks.`);
    }

    // Sets a block at specific world coordinates
    setBlock(x, y, z, block) {
        this.blocks[`${x},${y},${z}`] = block;
    }

    // Gets a block at specific world coordinates
    getBlock(x, y, z) {
        return this.blocks[`${x},${y},${z}`] || null;
    }

    // Adds all blocks from loaded chunks to a Three.js scene (or equivalent)
    addBlocksToScene(scene) {
        console.log("Adding blocks to scene...");
        this.chunks.forEach(chunkBlocks => {
            chunkBlocks.forEach(block => {
                // In a real Three.js implementation, you'd create a Mesh for each block
                // For now, we'll just log
                // const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
                // const material = new THREE.MeshBasicMaterial({ color: block.color }); // Block should define color/texture
                // const mesh = new THREE.Mesh(geometry, material);
                // mesh.position.set(block.x, block.y, block.z);
                // scene.add(mesh);
                scene.add({ type: 'block', x: block.x, y: block.y, z: block.z, material: block.type });
            });
        });
        console.log("All blocks added (mock).");
    }

    // Raycasting for block interaction (breaking/placing)
    raycast(origin, direction, maxDistance) {
        // Implement DDA (Digital Differential Analyzer) algorithm or similar for raycasting
        // to find which block the player is looking at.
        // This is a complex topic on its own.
        console.log(`Raycasting from ${JSON.stringify(origin)} in direction ${JSON.stringify(direction)}`);
        return null; // Returns null or { block: Block, face: 'top'|'bottom'|... }
    }
}

// A simple Block class to hold block data
export class Block {
    constructor(x, y, z, type) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type; // e.g., 'grass', 'dirt', 'stone', 'air'
        this.isVisible = true; // For optimization
    }

    // You might add methods to get texture coordinates based on type
    // or calculate its bounding box.
}
