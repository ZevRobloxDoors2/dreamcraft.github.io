import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const uiContainer = document.getElementById('uiContainer');
    const mainMenu = document.getElementById('mainMenu');
    const worldScreen = document.getElementById('worldScreen');
    const inventoryUI = document.getElementById('inventoryUI');
    const hud = document.getElementById('hud'); // Grab the whole HUD now
    const crosshair = document.getElementById('crosshair');
    
    const playMenuButton = document.getElementById('playMenuButton');
    const createWorldButton = document.getElementById('createWorldButton');
    const backButton = document.getElementById('backButton');
    
    const game = new Game();
    game.init();

    playMenuButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        worldScreen.style.display = 'flex';
    });

    backButton.addEventListener('click', () => {
        worldScreen.style.display = 'none';
        mainMenu.style.display = 'flex';
    });

    createWorldButton.addEventListener('click', () => {
        game.startGame();
        uiContainer.style.display = 'none';
        worldScreen.style.display = 'none';
        hud.style.display = 'flex'; // Show Health + Hotbar
        crosshair.style.display = 'block';
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyE' && game.gameState === 'playing') {
            document.exitPointerLock(); 
            uiContainer.style.display = 'flex';
            inventoryUI.style.display = 'flex';
            hud.style.display = 'none'; // Hide HUD while in inventory
            crosshair.style.display = 'none';
        }
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement !== document.body) {
            if (game.gameState === 'playing') {
                game.pauseGame();
                uiContainer.style.display = 'flex';
                if(inventoryUI.style.display !== 'flex') {
                    mainMenu.style.display = 'flex';
                    playMenuButton.innerText = "Resume Game"; 
                }
                crosshair.style.display = 'none';
            }
        } else {
            game.gameState = 'playing';
            uiContainer.style.display = 'none';
            inventoryUI.style.display = 'none';
            hud.style.display = 'flex';
            crosshair.style.display = 'block';
        }
    });
});
