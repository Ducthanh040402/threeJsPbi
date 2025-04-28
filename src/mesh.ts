import * as THREE from 'three';

export class Mesh {
    private mesh: THREE.Mesh;
    private geometry: THREE.BufferGeometry;
    private material: THREE.MeshStandardMaterial;
    private clippingPlanes: THREE.Plane[] = [];
    private rotationSpeed = 0.01;
    constructor() {
        this.initializeMaterial();
        this.initializeClippingPlanes();
        // Khởi tạo geometry rỗng
        this.geometry = new THREE.BufferGeometry();
        this.createMesh();
    }

    private initializeMaterial(): void {
        this.material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            metalness: 0.3,
            roughness: 0.4,
            wireframe: false,
            clippingPlanes: this.clippingPlanes,
            clipIntersection: true,
            side: THREE.DoubleSide
        });
    }

    private initializeClippingPlanes(): void {
        this.clippingPlanes = [
            new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),  // X plane
            new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),  // Y plane
            new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)   // Z plane
        ];
    }

    private createMesh(): void {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    public updateGeometry(positions: any, indices: any,field_values:any): void {
        // Xóa geometry cũ
        if (this.geometry) {
            this.geometry.dispose();
        }

        // Tạo geometry mới
        this.geometry = new THREE.BufferGeometry();

        // Lấy positions và indices
        var new_pos = positions;
        var new_ele = indices;
        var colors = field_values
        debugger
        // Lấy positions từ Float32Array


        // Cập nhật geometry với dữ liệu mới
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(new_pos), 3));
        this.geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(new_ele), 1));
        this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        // Cập nhật geometry cho mesh
        this.mesh.geometry = this.geometry;

        // Tính toán normal vectors
        this.geometry.computeVertexNormals();

        // Cập nhật bounding box
        this.geometry.computeBoundingBox();
        this.geometry.computeBoundingSphere();
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

    public dispose(): void {
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
    }
}
