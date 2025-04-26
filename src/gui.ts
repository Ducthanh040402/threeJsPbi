import * as dat from 'dat.gui';
import { Mesh } from './mesh';
import { Scene } from './scene';

export class GUI {
    private gui: dat.GUI;
    private mesh: Mesh;
    private scene: Scene;
    private params = {
        color: '#00ff00',
        wireframe: false,
        rotationSpeed: 0,
        clipping: {
            x: 0,
            y: 0,
            z: 0
        },
        axes: {
            visible: true,
            size: 2
        },
        view: {
            fitView: () => {
                this.scene.getCamera().fitView();
            }
        }
    };

    constructor(mesh: Mesh, scene: Scene) {
        this.mesh = mesh;
        this.scene = scene;
        this.gui = new dat.GUI();
        this.initializeControls();
    }

    private initializeControls(): void {
        // Color control
        this.gui.addColor(this.params, 'color')
            .name('Color')
            .onChange((value: string) => {
                this.mesh.setColor(parseInt(value.replace('#', '0x')));
            });

        // Wireframe control
        this.gui.add(this.params, 'wireframe')
            .name('Wireframe')
            .onChange((value: boolean) => {
                this.mesh.setWireframe(value);
            });

        // Rotation speed control
        this.gui.add(this.params, 'rotationSpeed', 0, 0.1, 0.001)
            .name('Rotation Speed')
            .onChange((value: number) => {
                this.mesh.setRotationSpeed(value);
            });

        // Clipping planes folder
        const clippingFolder = this.gui.addFolder('Clipping Planes');
        clippingFolder.open();

        // X plane control
        clippingFolder.add(this.params.clipping, 'x', -1, 1, 0.01)
            .name('X Plane')
            .onChange((value: number) => {
                this.mesh.setClippingPlane(0, value);
            });

        // Y plane control
        clippingFolder.add(this.params.clipping, 'y', -1, 1, 0.01)
            .name('Y Plane')
            .onChange((value: number) => {
                this.mesh.setClippingPlane(1, value);
            });

        // Z plane control
        clippingFolder.add(this.params.clipping, 'z', -1, 1, 0.01)
            .name('Z Plane')
            .onChange((value: number) => {
                this.mesh.setClippingPlane(2, value);
            });

        // Axes helper folder
        const axesFolder = this.gui.addFolder('Axes Helper');
        axesFolder.open();

        // Axes visibility control
        axesFolder.add(this.params.axes, 'visible')
            .name('Show Axes')
            .onChange((value: boolean) => {
                const axesHelper = this.scene.getScene().getObjectByName('axesHelper');
                if (axesHelper) {
                    axesHelper.visible = value;
                }
            });

        // Axes size control
        axesFolder.add(this.params.axes, 'size', 0.1, 5, 0.1)
            .name('Axes Size')
            .onChange((value: number) => {
                const axesHelper = this.scene.getScene().getObjectByName('axesHelper');
                if (axesHelper) {
                    (axesHelper as THREE.AxesHelper).scale.set(value, value, value);
                }
            });

        // View controls
        const viewFolder = this.gui.addFolder('View');
        viewFolder.open();

        // Fit view button
        viewFolder.add(this.params.view, 'fitView')
            .name('Fit View');
    }

    public destroy(): void {
        this.gui.destroy();
    }
} 