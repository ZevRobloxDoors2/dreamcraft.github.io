import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menuContainer');
    const playButton = document.getElementById('playButton');
    
    // Initialize the game engine
    const game = new Game();
    game.init();

    // Handle the "Play" button click
    playButton.addEventListener('click', () => {
        game.start();
        menuContainer.style.display = 'none'; // Hide menu
    });

    // Listen for when the player hits ESC to unlock the mouse
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement !== document.body) {
            game.pause();
            menuContainer.style.display = 'flex'; // Show menu again
            playButton.innerText = "Resume Game";
        }
    });
});
