class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this.player = null;
        this.clock = new THREE.Clock();
        this.running = false;
        this.paused = false;
        
        this.frameCount = 0;
        this.lastFpsTime = 0;
        this.fps = 60;
    }
    
    init(worldName) {
        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('gameCanvas'),
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Setup lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Create world
        this.world = new World();
        
        // Create player
        this.player = new Player(this.camera);
        this.player.position.set(0, 70, 0);
        
        // Generate initial chunks
        this.world.update(0, 0);
        
        // Add chunks to scene
        for (const [key, chunk] of this.world.chunks) {
            this.scene.add(chunk);
        }
        
        // Setup hotbar UI
        this.setupHotbar();
        
        // Start game loop
        this.running = true;
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onResize());
        
        // Lock pointer
        setTimeout(() => this.player.lockPointer(), 100);
    }
    
    setupHotbar() {
        const hotbar = document.getElementById('hotbar');
        hotbar.innerHTML = '';
        
        const blockIcons = {
            grass: '#567d46',
            dirt: '#8b4513',
            stone: '#808080',
            wood: '#8b4513',
            leaves: '#228b22',
            sand: '#f4a460',
            water: '#4682b4',
            bedrock: '#2f2f2f'
        };
        
        this.player.hotbar.forEach((block, i) => {
            const slot = document.createElement('div');
            slot.className = `hotbar-slot ${i === 0 ? 'active' : ''}`;
            slot.innerHTML = `
                <span class="slot-number">${i + 1}</span>
                <div class="block-preview" style="background: ${blockIcons[block]}; width: 32px; height: 32px;"></div>
            `;
            hotbar.appendChild(slot);
        });
    }
    
    animate() {
        if (!this.running) return;
        
        requestAnimationFrame(() => this.animate());
        
        if (this.paused) return;
        
        const delta = this.clock.getDelta();
        
        // Update player
        this.player.update(this.world);
        
        // Update world chunks
        this.world.update(this.player.position.x, this.player.position.z);
        
        // Add new chunks to scene
        for (const [key, chunk] of this.world.chunks) {
            if (!chunk.parent) {
                this.scene.add(chunk);
            }
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
        
        // Update FPS
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = now;
            document.getElementById('fps').textContent = `${this.fps} FPS`;
        }
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    pause() {
        this.paused = true;
        this.player.unlockPointer();
    }
    
    resume() {
        this.paused = false;
        this.player.lockPointer();
    }
    
    save() {
        // Save world data to localStorage
        const worldData = {
            player: {
                x: this.player.position.x,
                y: this.player.position.y,
                z: this.player.position.z
            },
            timestamp: Date.now()
        };
        localStorage.setItem('lastWorld', JSON.stringify(worldData));
    }
}

// Create global game instance
window.game = new Game();
