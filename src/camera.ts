import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Camera {
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
        this.initializeCamera();
        this.initializeControls();
    }

    private initializeCamera(): void {
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            1,
            1000
        );
        this.camera.position.set(3, 3, 3);
        this.camera.lookAt(0, 0, 0);
    }

    private initializeControls(): void {
        this.controls = new OrbitControls(this.camera, this.container);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Disable right-click events
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: null // Disable right-click
        };
    }

    public setViewFromAxis(axis: 'x' | 'y' | 'z'): void {
        const distance = 5;
        switch (axis) {
            case 'x':
                this.camera.position.set(distance, 0, 0);
                break;
            case 'y':
                this.camera.position.set(0, distance, 0);
                break;
            case 'z':
                this.camera.position.set(0, 0, distance);
                break;
        }
        this.camera.lookAt(0, 0, 0);
        if (this.controls) {
            this.controls.update();
        }
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public getControls(): OrbitControls {
        return this.controls;
    }

    public resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    public fitView(): void {
        this.camera.position.set(3, 3, 3);
        this.camera.lookAt(0, 0, 0);
        if (this.controls) {
            this.controls.reset();
        }
    }

    public update(): void {
        if (this.controls) {
            this.controls.update();
        }
    }
}
