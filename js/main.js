import { Game } from './game.js';
import { Menu } from './menu.js';

let game;
let menu;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const debugInfo = document.getElementById('debugInfo');
    const menuContainer = document.getElementById('menuContainer');

    // Initialize the game
    game = new Game(canvas, debugInfo);
    game.init();

    // Initialize the menu
    menu = new Menu(menuContainer);

    // Lock pointer for first-person controls
    canvas.addEventListener('click', () => {
        if (!document.pointerLockElement) {
            canvas.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            console.log('Pointer locked!');
            game.setPaused(false); // Unpause game when pointer is locked
            menu.hide();
        } else {
            console.log('Pointer unlocked!');
            game.setPaused(true); // Pause game when pointer is unlocked
            menu.show();
        }
    });

    // Main game loop
    let lastTime = 0;
    function animate(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
        lastTime = currentTime;

        if (!game.isPaused()) {
            game.update(deltaTime);
            game.render();
        } else {
            // Render menu or static pause screen
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    console.log("Mycraft loaded!");
});
