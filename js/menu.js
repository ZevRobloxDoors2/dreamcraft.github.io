export class Menu {
    constructor(menuContainerElement) {
        this.container = menuContainerElement;
        this.initMenuContent();
    }

    initMenuContent() {
        this.container.innerHTML = `
            <h2>Mycraft</h2>
            <p>Click to start!</p>
            <button id="resumeButton" style="display:none;">Resume Game</button>
            <button id="optionsButton">Options</button>
            <button id="quitButton">Quit</button>
        `;

        const resumeButton = this.container.querySelector('#resumeButton');
        if (resumeButton) {
            resumeButton.addEventListener('click', () => {
                // Request pointer lock to resume game
                document.getElementById('gameCanvas').requestPointerLock();
            });
        }
        // Add more event listeners for other buttons
    }

    show() {
        this.container.style.display = 'flex';
        const resumeButton = this.container.querySelector('#resumeButton');
        if (resumeButton) {
            resumeButton.style.display = document.pointerLockElement ? 'inline-block' : 'none';
        }
    }

    hide() {
        this.container.style.display = 'none';
    }
}
