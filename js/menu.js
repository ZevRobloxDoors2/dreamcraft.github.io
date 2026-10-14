import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('mainMenu');
    const worldScreen = document.getElementById('worldScreen');
    const uiContainer = document.getElementById('uiContainer');
    const craftingUI = document.getElementById('craftingUI');
    
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
        game.start();
        uiContainer.style.display = 'none';
        worldScreen.style.display = 'none';
        mainMenu.style.display = 'flex';
        playMenuButton.innerText = "Resume Game"; 
    });

    // Press E to open crafting
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyE' && game.isRunning) {
            document.exitPointerLock(); // Pause game, show UI
            uiContainer.style.display = 'flex';
            mainMenu.style.display = 'none';
            craftingUI.style.display = 'flex';
        }
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement !== document.body) {
            game.pause();
            uiContainer.style.display = 'flex';
            // If they didn't press E to open crafting, show the main menu
            if(craftingUI.style.display !== 'flex') {
                mainMenu.style.display = 'flex';
            }
        } else {
            // Unpausing
            uiContainer.style.display = 'none';
            craftingUI.style.display = 'none';
        }
    });
});
