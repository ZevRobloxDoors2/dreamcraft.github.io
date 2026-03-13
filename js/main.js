const menu = {
    currentScreen: 'mainMenu',
    screenHistory: [],
    gameMode: 'survival',
    difficulty: 'easy',
    worlds: [],
    
    init() {
        this.loadWorlds();
        this.generateSplashText();
        this.setupEventListeners();
    },
    
    generateSplashText() {
        const splashes = [
            "Welcome to Voxel World!",
            "Now with 100% more cubes!",
            "Better than reality!",
            "Try the creative mode!",
            "Don't dig straight down!",
            "Creeper? Aw man!",
            "Infinite worlds await!",
            "Build your dreams!",
            "Survive the night!",
            "Crafting since 2024!"
        ];
        const splash = splashes[Math.floor(Math.random() * splashes.length)];
        document.getElementById('splashText').textContent = splash;
    },
    
    loadWorlds() {
        // Load saved worlds from localStorage
        const saved = localStorage.getItem('voxelWorlds');
        if (saved) {
            this.worlds = JSON.parse(saved);
        } else {
            // Default worlds
            this.worlds = [
                { name: 'My World', mode: 'Survival', date: 'Today', size: '12 MB' },
                { name: 'Creative Build', mode: 'Creative', date: 'Yesterday', size: '45 MB' }
            ];
        }
        this.renderWorldList();
    },
    
    renderWorldList() {
        const container = document.getElementById('worldList');
        container.innerHTML = this.worlds.map((world, index) => `
            <div class="world-card" onclick="menu.selectWorld(${index})">
                <h3>${world.name}</h3>
                <div class="world-info">Mode: ${world.mode}</div>
                <div class="world-info">Last played: ${world.date}</div>
                <div class="world-info">Size: ${world.size}</div>
            </div>
        `).join('');
    },
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentScreen === 'game') {
                this.pause();
            }
        });
    },
    
    showScreen(screenId) {
        document.querySelectorAll('.menu-screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.screenHistory.push(this.currentScreen);
        this.currentScreen = screenId;
    },
    
    back() {
        if (this.screenHistory.length > 0) {
            const prev = this.screenHistory.pop();
            document.querySelectorAll('.menu-screen').forEach(s => s.classList.remove('active'));
            document.getElementById(prev).classList.add('active');
            this.currentScreen = prev;
        }
    },
    
    play() {
        this.showScreen('playMenu');
    },
    
    settings() {
        this.showScreen('settingsMenu');
    },
    
    marketplace() {
        alert('Marketplace coming soon!');
    },
    
    quit() {
        if (confirm('Are you sure you want to quit?')) {
            window.close();
            // Fallback
            document.body.innerHTML = '<h1 style="color:white;text-align:center;margin-top:20%">You can close this tab now.</h1>';
        }
    },
    
    createWorld() {
        this.showScreen('createWorldMenu');
    },
    
    setGameMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('#createWorldMenu .toggle-group:first-of-type .toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    },
    
    setDifficulty(diff) {
        this.difficulty = diff;
        document.querySelectorAll('#createWorldMenu .toggle-group:last-of-type .toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    },
    
    startWorld() {
        const name = document.getElementById('worldName').value || 'New World';
        this.showScreen('loadingScreen');
        
        // Simulate loading
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => this.startGame(name), 500);
            }
            document.getElementById('loadingProgress').style.width = progress + '%';
        }, 200);
    },
    
    selectWorld(index) {
        this.showScreen('loadingScreen');
        setTimeout(() => this.startGame(this.worlds[index].name), 1000);
    },
    
    startGame(worldName) {
        document.getElementById('loadingScreen').classList.remove('active');
        document.getElementById('gameCanvas').classList.add('active');
        document.getElementById('hud').classList.add('active');
        this.currentScreen = 'game';
        
        // Initialize game
        if (window.game) {
            game.init(worldName);
        }
    },
    
    pause() {
        if (window.game) game.pause();
        this.showScreen('pauseMenu');
    },
    
    resume() {
        document.getElementById('pauseMenu').classList.remove('active');
        document.getElementById('gameCanvas').classList.add('active');
        document.getElementById('hud').classList.add('active');
        this.currentScreen = 'game';
        if (window.game) game.resume();
    },
    
    saveAndQuit() {
        if (window.game) game.save();
        document.getElementById('pauseMenu').classList.remove('active');
        document.getElementById('gameCanvas').classList.remove('active');
        document.getElementById('hud').classList.remove('active');
        this.showScreen('mainMenu');
    },
    
    switchTab(tab) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');
        // Tab switching logic would go here
    },
    
    showSettings(category) {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        // Settings category switching logic
    },
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
};

// Initialize menu on load
document.addEventListener('DOMContentLoaded', () => menu.init());
