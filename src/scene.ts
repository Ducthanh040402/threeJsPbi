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

    // For corner axes
    private cornerAxesScene: THREE.Scene;
    private cornerAxesCamera: THREE.OrthographicCamera;
    private cornerAxesRenderer: THREE.WebGLRenderer;
    private cornerAxes: THREE.Group;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

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
        this.initializeCornerAxes();
    }

    private createAxisLine(color: THREE.Color, direction: THREE.Vector3): THREE.Line {
        const material = new THREE.LineBasicMaterial({ color });
        const points = [
            new THREE.Vector3(0, 0, 0),
            direction
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return new THREE.Line(geometry, material);
    }

    private createAxisLabel(text: string, position: THREE.Vector3, color: THREE.Color): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;

        if (context) {
            context.fillStyle = `#${color.getHexString()}`;
            context.font = 'bold 48px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, 32, 32);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(position);
        sprite.scale.set(0.3, 0.3, 0.3);
        return sprite;
    }
    // Create Corner Axis
    private initializeCornerAxes(): void {
        // Create a new scene for corner axes
        this.cornerAxesScene = new THREE.Scene();
        this.cornerAxes = new THREE.Group();

        // Create orthographic camera for corner axes
        this.cornerAxesCamera = new THREE.OrthographicCamera(-1.2, 1.2, 1.2, -1.2, 0.1, 1000);
        this.cornerAxesCamera.position.set(3, 3, 3);
        this.cornerAxesCamera.lookAt(0, 0, 0);

        // Create axes with labels
        const xAxis = this.createAxisLine(new THREE.Color(0xff0000), new THREE.Vector3(1, 0, 0));
        const yAxis = this.createAxisLine(new THREE.Color(0x00ff00), new THREE.Vector3(0, 1, 0));
        const zAxis = this.createAxisLine(new THREE.Color(0x0000ff), new THREE.Vector3(0, 0, 1));

        // Add labels
        const xLabel = this.createAxisLabel('X', new THREE.Vector3(1.2, 0, 0), new THREE.Color(0xff0000));
        const yLabel = this.createAxisLabel('Y', new THREE.Vector3(0, 1.2, 0), new THREE.Color(0x00ff00));
        const zLabel = this.createAxisLabel('Z', new THREE.Vector3(0, 0, 1.2), new THREE.Color(0x0000ff));

        // Add names for raycasting
        xAxis.name = 'x-axis';
        yAxis.name = 'y-axis';
        zAxis.name = 'z-axis';

        this.cornerAxes.add(xAxis, yAxis, zAxis, xLabel, yLabel, zLabel);
        this.cornerAxesScene.add(this.cornerAxes);

        // Create renderer for corner axes
        this.cornerAxesRenderer = new THREE.WebGLRenderer({ alpha: true });
        this.cornerAxesRenderer.setSize(120, 120);
        const rendererElement = this.cornerAxesRenderer.domElement;
        rendererElement.style.position = 'absolute';
        rendererElement.style.bottom = '20px';
        rendererElement.style.left = '20px';
        rendererElement.style.background = 'rgba(192, 189, 189, 0.3)';
        rendererElement.style.borderRadius = '50%';
        rendererElement.style.cursor = 'pointer';
        rendererElement.style.zIndex = '1000';

        // Create a container div for the renderer
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.bottom = '20px';
        container.style.left = '20px';
        container.style.width = '120px';
        container.style.height = '120px';
        container.style.zIndex = '1000';
        container.appendChild(rendererElement);
        this.container.appendChild(container);

        // Initialize raycaster and mouse
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Track if mouse is down
        let isMouseDown = false;
        let mouseDownTime = 0;

        // Add event listeners
        container.addEventListener('mousedown', (event: MouseEvent) => {
            console.log('mousedown on corner axes');
            isMouseDown = true;
            mouseDownTime = Date.now();
            event.preventDefault();
            event.stopPropagation();
        });

        container.addEventListener('mousemove', this.onCornerAxesMouseMove.bind(this));

        // Prevent context menu
        container.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
    }



    private onCornerAxesMouseMove(event: MouseEvent): void {
        // console.log('onCornerAxesMouseMove');
        event.preventDefault();
        event.stopPropagation();

        const rect = this.cornerAxesRenderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
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

    public updateData(data: any): void {
        if (!data) return;
        debugger
        // Lấy dữ liệu positions và indices từ data đã xử lý
        const positions = data.nodes;
        const indices = data.elements;
        const field_values = data.field_values
        var new_pos = [];
        var new_ele = [];
        var new_field = [];
        const colors = [];
        // const minValue = Math.min(...field_values);
        // const maxValue = Math.max(...field_values);

        for (let i = 0; i < positions.length; i++) {
            var [x, y, z] = positions[i]
            // var [f] = field_values[i]
            new_pos.push(x, y, z)
            // new_field.push(f)
            // const normalizedValue = normalize(field_values[i], minValue, maxValue);
            // const color = jetColorMap(normalizedValue);
            // colors.push(color.r, color.g, color.b);
        }
        for (let i = 0; i < indices.length; i++) {
            var [a, b, c] = indices[i]
            new_ele.push(a, b, c)
        }
        if (!positions || !indices) {
            console.error('Invalid mesh data');
            return;
        }

        // Cập nhật geometry cho mesh
        this.mesh.updateGeometry(new_pos, new_ele, colors);

        // Cập nhật camera để fit với mesh mới
        this.fitCameraToMesh();
    }

    private fitCameraToMesh(): void {
        const mesh = this.mesh.getMesh();
        if (!mesh) return;

        // Tính toán bounding box của mesh
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        // Tính toán khoảng cách camera
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.getCamera().fov * (Math.PI / 180);
        const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2) / 1.5);

        // Đặt vị trí camera
        const direction = new THREE.Vector3(1, 1, 1).normalize();
        this.camera.getCamera().position.copy(center.clone().add(direction.multiplyScalar(cameraDistance)));
        this.camera.getCamera().lookAt(center);
        this.camera.getCamera().updateProjectionMatrix();

        // Cập nhật controls
        if (this.camera.getControls()) {
            this.camera.getControls().target.copy(center);
            this.camera.getControls().update();
        }
    }

    public update(): void {
        // Cập nhật controls
        this.camera.update();

        // Render scene chính
        this.renderer.render(this.scene, this.camera.getCamera());

        // Update corner axes rotation to match main camera
        this.cornerAxesCamera.position.copy(this.camera.getCamera().position).normalize().multiplyScalar(3);
        this.cornerAxesCamera.lookAt(0, 0, 0);

        // Render corner axes
        this.cornerAxesRenderer.render(this.cornerAxesScene, this.cornerAxesCamera);
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
        if (this.mesh) {
            this.mesh.dispose();
        }
        this.gui.destroy();
        this.contextMenu.destroy();
        // Clean up corner axes
        if (this.cornerAxesRenderer && this.cornerAxesRenderer.domElement) {
            this.container.removeChild(this.cornerAxesRenderer.domElement);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}
function normalize(value, min, max) {
    return (value - min) / (max - min);
}

function jetColorMap(t) {
    const c = new THREE.Color();
    if (t < 0.25) {
        c.setRGB(0, 4 * t, 1);
    } else if (t < 0.5) {
        c.setRGB(0, 1, 1 + 4 * (0.25 - t));
    } else if (t < 0.75) {
        c.setRGB(4 * (t - 0.5), 1, 0);
    } else {
        c.setRGB(1, 1 + 4 * (0.75 - t), 0);
    }
    return c;
}