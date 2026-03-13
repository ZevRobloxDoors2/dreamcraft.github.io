import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        
        // Texture Loader setup
        const textureLoader = new THREE.TextureLoader();
        
        // Load textures from your folders.
        // NearestFilter makes them look pixelated and blocky like Minecraft!
        const loadTex = (path) => {
            const tex = textureLoader.load(path);
            tex.magFilter = THREE.NearestFilter; 
            tex.minFilter = THREE.NearestFilter;
            return tex;
        }

        const grassTop = loadTex('textures/grass.png');
        const grassSide = loadTex('textures/grass_side.png');
        const dirt = loadTex('textures/dirt.png');

        // Create an array of materials for the Box Geometry
        // Order: right, left, top, bottom, front, back
        this.grassMaterial = [
            new THREE.MeshLambertMaterial({ map: grassSide }), // Right
            new THREE.MeshLambertMaterial({ map: grassSide }), // Left
            new THREE.MeshLambertMaterial({ map: grassTop }),  // Top
            new THREE.MeshLambertMaterial({ map: dirt }),      // Bottom
            new THREE.MeshLambertMaterial({ map: grassSide }), // Front
            new THREE.MeshLambertMaterial({ map: grassSide })  // Back
        ];

        this.dirtMaterial = new THREE.MeshLambertMaterial({ map: dirt });
        this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    }

    generate() {
        const chunkSize = 16;
        
        // Generate a simple flat 16x16 platform of grass with dirt underneath
        for (let x = -chunkSize/2; x < chunkSize/2; x++) {
            for (let z = -chunkSize/2; z < chunkSize/2; z++) {
                
                // Top Grass Block
                const grassBlock = new THREE.Mesh(this.blockGeometry, this.grassMaterial);
                grassBlock.position.set(x, 0, z);
                this.scene.add(grassBlock);

                // Dirt Block underneath
                const dirtBlock = new THREE.Mesh(this.blockGeometry, this.dirtMaterial);
                dirtBlock.position.set(x, -1, z);
                this.scene.add(dirtBlock);
            }
        }
    }
}
