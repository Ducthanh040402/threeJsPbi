import { Scene } from './scene';

export class ContextMenu {
    private menu: HTMLElement;
    private scene: Scene;
    private canvas: HTMLCanvasElement;

    constructor(scene: Scene) {
        this.scene = scene;
        this.canvas = scene.getRenderer().domElement;
        this.initializeMenu();
        this.initializeEventListeners();
    }

    private initializeMenu(): void {
        this.menu = document.createElement('div');
        this.menu.style.cssText = `
            position: fixed;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 5px;
            display: none;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        const fitViewButton = document.createElement('button');
        fitViewButton.textContent = 'Fit View';
        fitViewButton.style.cssText = `
            display: block;
            width: 100%;
            padding: 5px 10px;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
        `;
        fitViewButton.onclick = () => {
            this.scene.getCamera().fitView();
            this.hideMenu();
        };

        this.menu.appendChild(fitViewButton);
        document.body.appendChild(this.menu);
    }

    private initializeEventListeners(): void {
        // Disable default context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Show custom context menu only when right-clicking on canvas
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right mouse button
                e.preventDefault();
                e.stopPropagation();
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.showMenu(x + rect.left, y + rect.top);
            }
        });

        // Hide menu when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target !== this.menu && !this.menu.contains(e.target as Node)) {
                this.hideMenu();
            }
        });

        // Prevent default right-click behavior on the entire document
        document.addEventListener('contextmenu', (e) => {
            if (e.target === this.canvas || this.canvas.contains(e.target as Node)) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    private showMenu(x: number, y: number): void {
        this.menu.style.display = 'block';
        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;
    }

    private hideMenu(): void {
        this.menu.style.display = 'none';
    }

    public destroy(): void {
        document.body.removeChild(this.menu);
    }
} 