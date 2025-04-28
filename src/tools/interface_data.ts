import * as THREE from 'three';
import powerbi from 'powerbi-visuals-api';
import DataView = powerbi.DataView;

export interface Node {
    index: number;
    position: THREE.Vector3;
    field_values: number;
}

export interface Element {
    nodes: number[];
    topology: string;
}

