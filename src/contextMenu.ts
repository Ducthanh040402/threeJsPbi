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

        // Add view direction buttons
        const viewButtons = [
            { text: 'View X', axis: 'x', color: '#ff4444' },
            { text: 'View Y', axis: 'y', color: '#44ff44' },
            { text: 'View Z', axis: 'z', color: '#4444ff' },
            { text: 'Fit View', action: 'fit' }
        ];

        viewButtons.forEach(button => {
            const menuItem = document.createElement('button');
            menuItem.textContent = button.text;
            menuItem.style.cssText = `
                display: block;
                width: 100%;
                padding: 5px 10px;
                margin: 2px 0;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
                color: ${button.color || 'black'};
                font-weight: ${button.color ? 'bold' : 'normal'};
            `;
            menuItem.onmouseover = () => {
                menuItem.style.backgroundColor = '#f0f0f0';
            };
            menuItem.onmouseout = () => {
                menuItem.style.backgroundColor = 'transparent';
            };
            menuItem.onclick = () => {
                if (button.axis) {
                    this.scene.getCamera().setViewFromAxis(button.axis as 'x' | 'y' | 'z');
                } else if (button.action === 'fit') {
                    this.scene.getCamera().fitView();
                }
                this.hideMenu();
            };
            this.menu.appendChild(menuItem);
        });

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