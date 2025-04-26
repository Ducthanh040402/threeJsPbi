import * as THREE from 'three';
import { Camera } from './camera';
import { Mesh } from './mesh';
import { GUI } from './gui';
import { ContextMenu } from './contextMenu';

export class Scene {
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: Camera;
    private mesh: Mesh;
    private gui: GUI;
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private axesHelper: THREE.AxesHelper;
    private contextMenu: ContextMenu;

    constructor(container: HTMLElement) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.initializeScene();
        this.initializeRenderer();
        this.camera = new Camera(this.container);
        this.mesh = new Mesh();
        this.addAxesHelper();
        this.gui = new GUI(this.mesh, this);
        this.scene.add(this.mesh.getMesh());
        this.contextMenu = new ContextMenu(this);
    }

    private addAxesHelper(): void {
        // Create axes helper with size 2
        this.axesHelper = new THREE.AxesHelper(2);
        this.axesHelper.name = 'axesHelper';
        this.scene.add(this.axesHelper);
    }

    private initializeScene(): void {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Enable clipping planes in the scene
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const material = object.material as THREE.MeshStandardMaterial;
                if (material) {
                    material.clippingPlanes = (this.mesh.getMesh().material as THREE.MeshStandardMaterial).clippingPlanes;
                }
            }
        });
    }

    private initializeRenderer(): void {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            canvas: this.canvas
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Enable clipping planes in the renderer
        this.renderer.localClippingEnabled = true;
    }

    public update(): void {
        this.mesh.animate();
        this.renderer.render(this.scene, this.camera.getCamera());
    }

    public resize(width: number, height: number): void {
        this.camera.resize(width, height);
        this.renderer.setSize(width, height);
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }

    public getRenderer(): THREE.WebGLRenderer {
        return this.renderer;
    }

    public getCamera(): Camera {
        return this.camera;
    }

    public destroy(): void {
        this.gui.destroy();
        this.contextMenu.destroy();
    }
}
