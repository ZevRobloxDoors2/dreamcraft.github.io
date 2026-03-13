import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const uiContainer = document.getElementById('uiContainer');
    const mainMenu = document.getElementById('mainMenu');
    const worldScreen = document.getElementById('worldScreen');
    const inventoryUI = document.getElementById('inventoryUI');
    const hotbar = document.getElementById('hotbar');
    const crosshair = document.getElementById('crosshair');
    
    // Buttons
    const playMenuButton = document.getElementById('playMenuButton');
    const createWorldButton = document.getElementById('createWorldButton');
    const backButton = document.getElementById('backButton');
    
    // Initialize the engine (World generates, menu starts spinning)
    const game = new Game();
    game.init();

    // 1. Click "Play" on main menu
    playMenuButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        worldScreen.style.display = 'flex';
    });

    // 2. Click "Cancel" on world select
    backButton.addEventListener('click', () => {
        worldScreen.style.display = 'none';
        mainMenu.style.display = 'flex';
    });

    // 3. Click "Play Selected World"
    createWorldButton.addEventListener('click', () => {
        game.startGame();
        uiContainer.style.display = 'none';
        worldScreen.style.display = 'none';
        hotbar.style.display = 'flex';
        crosshair.style.display = 'block';
    });

    // Press E to toggle inventory
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyE' && game.gameState === 'playing') {
            document.exitPointerLock(); 
            uiContainer.style.display = 'flex';
            inventoryUI.style.display = 'flex';
        }
    });

    // Handle pausing when hitting ESC
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement !== document.body) {
            // Mouse unlocked
            if (game.gameState === 'playing') {
                game.pauseGame();
                uiContainer.style.display = 'flex';
                // Only show main menu if we didn't open inventory
                if(inventoryUI.style.display !== 'flex') {
                    mainMenu.style.display = 'flex';
                    playMenuButton.innerText = "Resume Game"; 
                }
                crosshair.style.display = 'none';
            }
        } else {
            // Mouse locked (unpausing)
            game.gameState = 'playing';
            uiContainer.style.display = 'none';
            inventoryUI.style.display = 'none';
            hotbar.style.display = 'flex';
            crosshair.style.display = 'block';
        }
    });
});
