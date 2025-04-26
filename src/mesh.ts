import * as THREE from 'three';

export class Mesh {
    private mesh: THREE.Mesh;
    private geometry: THREE.BoxGeometry;
    private material: THREE.MeshStandardMaterial;
    private rotationSpeed: number = 0.0;
    private clippingPlanes: THREE.Plane[] = [];

    constructor() {
        this.initializeGeometry();
        this.initializeMaterial();
        this.initializeClippingPlanes();
        this.createMesh();
    }

    private initializeGeometry(): void {
        // Create a cube geometry with size 1x1x1
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    private initializeMaterial(): void {
        this.material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,  // Green color
            metalness: 0.3,
            roughness: 0.4,
            wireframe: false,
            clippingPlanes: this.clippingPlanes,
            clipIntersection: true,
            side: THREE.DoubleSide
        });
    }

    private initializeClippingPlanes(): void {
        // Create three clipping planes (X, Y, Z)
        this.clippingPlanes = [
            new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),  // X plane
            new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),  // Y plane
            new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)   // Z plane
        ];
    }

    private createMesh(): void {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    public setColor(color: number): void {
        this.material.color.setHex(color);
    }

    public setWireframe(wireframe: boolean): void {
        this.material.wireframe = wireframe;
    }

    public setRotationSpeed(speed: number): void {
        this.rotationSpeed = speed;
    }

    public setClippingPlane(planeIndex: number, distance: number): void {
        if (planeIndex >= 0 && planeIndex < this.clippingPlanes.length) {
            this.clippingPlanes[planeIndex].constant = distance;
            this.material.needsUpdate = true;
            this.material.clippingPlanes = this.clippingPlanes;
        }
    }

    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    // Add rotation animation
    public animate(): void {
        this.mesh.rotation.x += this.rotationSpeed;
        this.mesh.rotation.y += this.rotationSpeed;
    }
}
