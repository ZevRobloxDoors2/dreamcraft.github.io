import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menuContainer');
    const mainScreen = document.getElementById('mainScreen');
    const worldScreen = document.getElementById('worldScreen');
    
    const playMenuButton = document.getElementById('playMenuButton');
    const createWorldButton = document.getElementById('createWorldButton');
    const backButton = document.getElementById('backButton');
    
    const game = new Game();
    game.init();

    // 1. Click Play -> Go to World Selection
    playMenuButton.addEventListener('click', () => {
        mainScreen.style.display = 'none';
        worldScreen.style.display = 'block';
    });

    // 2. Click Cancel -> Go back to Main Menu
    backButton.addEventListener('click', () => {
        worldScreen.style.display = 'none';
        mainScreen.style.display = 'block';
    });

    // 3. Click Play World -> Start the game!
    createWorldButton.addEventListener('click', () => {
        game.start();
        menuContainer.style.display = 'none';
        
        // Reset the menu back to the main screen for when you pause
        worldScreen.style.display = 'none';
        mainScreen.style.display = 'block';
        playMenuButton.innerText = "Resume Game"; 
    });

    // Handle pressing ESC to pause
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement !== document.body) {
            game.pause();
            menuContainer.style.display = 'flex';
        }
    });
});
