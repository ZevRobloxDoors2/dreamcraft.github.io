<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voxel World</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Main Menu (Bedrock Style) -->
    <div id="mainMenu" class="menu-screen active">
        <div class="menu-background">
            <div class="panorama"></div>
            <div class="menu-content">
                <h1 class="game-title">VOXEL WORLD</h1>
                <div class="splash-text" id="splashText">Welcome!</div>
                
                <div class="menu-buttons">
                    <button class="menu-btn primary" onclick="menu.play()">
                        <span class="btn-icon">▶</span>
                        <span class="btn-text">Play</span>
                    </button>
                    <button class="menu-btn" onclick="menu.settings()">
                        <span class="btn-icon">⚙</span>
                        <span class="btn-text">Settings</span>
                    </button>
                    <button class="menu-btn" onclick="menu.marketplace()">
                        <span class="btn-icon">🏪</span>
                        <span class="btn-text">Marketplace</span>
                    </button>
                    <button class="menu-btn" onclick="menu.quit()">
                        <span class="btn-icon">✕</span>
                        <span class="btn-text">Quit</span>
                    </button>
                </div>
                
                <div class="menu-footer">
                    <div class="version">v1.0.0</div>
                    <div class="copyright">© 2024 Voxel World</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Play Menu -->
    <div id="playMenu" class="menu-screen">
        <div class="menu-header">
            <h2>Play</h2>
            <button class="back-btn" onclick="menu.back()">← Back</button>
        </div>
        <div class="tabs">
            <button class="tab active" onclick="menu.switchTab('worlds')">Worlds</button>
            <button class="tab" onclick="menu.switchTab('realms')">Realms</button>
            <button class="tab" onclick="menu.switchTab('servers')">Servers</button>
        </div>
        <div class="tab-content" id="worldsTab">
            <div class="world-list" id="worldList">
                <!-- Worlds will be populated here -->
            </div>
            <button class="create-world-btn" onclick="menu.createWorld()">
                <span>+</span>
                Create New World
            </button>
        </div>
    </div>

    <!-- Create World Menu -->
    <div id="createWorldMenu" class="menu-screen">
        <div class="menu-header">
            <h2>Create New World</h2>
            <button class="back-btn" onclick="menu.back()">← Back</button>
        </div>
        <div class="settings-list">
            <div class="setting-item">
                <label>World Name</label>
                <input type="text" id="worldName" value="New World" maxlength="32">
            </div>
            <div class="setting-item">
                <label>Game Mode</label>
                <div class="toggle-group">
                    <button class="toggle-btn active" onclick="menu.setGameMode('survival')">Survival</button>
                    <button class="toggle-btn" onclick="menu.setGameMode('creative')">Creative</button>
                </div>
            </div>
            <div class="setting-item">
                <label>Difficulty</label>
                <div class="toggle-group">
                    <button class="toggle-btn" onclick="menu.setDifficulty('peaceful')">Peaceful</button>
                    <button class="toggle-btn active" onclick="menu.setDifficulty('easy')">Easy</button>
                    <button class="toggle-btn" onclick="menu.setDifficulty('normal')">Normal</button>
                    <button class="toggle-btn" onclick="menu.setDifficulty('hard')">Hard</button>
                </div>
            </div>
            <div class="setting-item">
                <label>World Type</label>
                <select id="worldType">
                    <option value="infinite">Infinite</option>
                    <option value="flat">Flat</option>
                    <option value="old">Old</option>
                </select>
            </div>
        </div>
        <button class="create-btn" onclick="menu.startWorld()">Create World</button>
    </div>

    <!-- Settings Menu -->
    <div id="settingsMenu" class="menu-screen">
        <div class="menu-header">
            <h2>Settings</h2>
            <button class="back-btn" onclick="menu.back()">← Back</button>
        </div>
        <div class="settings-categories">
            <button class="category-btn active" onclick="menu.showSettings('video')">Video</button>
            <button class="category-btn" onclick="menu.showSettings('audio')">Audio</button>
            <button class="category-btn" onclick="menu.showSettings('controls')">Controls</button>
            <button class="category-btn" onclick="menu.showSettings('game')">Game</button>
        </div>
        <div class="settings-content" id="videoSettings">
            <div class="setting-item">
                <label>Render Distance</label>
                <input type="range" min="4" max="32" value="12" id="renderDistance">
                <span class="value">12 chunks</span>
            </div>
            <div class="setting-item">
                <label>Graphics Mode</label>
                <select id="graphicsMode">
                    <option value="fancy">Fancy</option>
                    <option value="fast">Fast</option>
                </select>
            </div>
            <div class="setting-item">
                <label>FOV</label>
                <input type="range" min="30" max="110" value="70" id="fov">
                <span class="value">70°</span>
            </div>
            <div class="setting-item">
                <label>Fullscreen</label>
                <button class="toggle-switch" onclick="menu.toggleFullscreen()">OFF</button>
            </div>
        </div>
    </div>

    <!-- Loading Screen -->
    <div id="loadingScreen" class="menu-screen">
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <h2 id="loadingText">Generating World...</h2>
            <div class="loading-bar">
                <div class="loading-progress" id="loadingProgress"></div>
            </div>
            <p class="loading-tip" id="loadingTip">Tip: Press E to open inventory!</p>
        </div>
    </div>

    <!-- Pause Menu -->
    <div id="pauseMenu" class="menu-screen">
        <div class="pause-content">
            <h2>Game Menu</h2>
            <button class="menu-btn" onclick="menu.resume()">Resume Game</button>
            <button class="menu-btn" onclick="menu.settings()">Settings</button>
            <button class="menu-btn" onclick="menu.saveAndQuit()">Save and Quit</button>
        </div>
    </div>

    <!-- Game Canvas -->
    <canvas id="gameCanvas"></canvas>

    <!-- HUD -->
    <div id="hud" class="hud">
        <div class="crosshair"></div>
        <div class="hotbar" id="hotbar">
            <!-- Hotbar slots generated by JS -->
        </div>
        <div class="debug-info" id="debugInfo">
            <span id="fps">60 FPS</span>
            <span id="coords">0, 0, 0</span>
            <span id="biome">Plains</span>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="js/menu.js"></script>
    <script src="js/world.js"></script>
    <script src="js/player.js"></script>
    <script src="js/game.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
