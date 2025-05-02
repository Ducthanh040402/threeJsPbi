import * as THREE from 'three';
import powerbi from 'powerbi-visuals-api';
import DataView = powerbi.DataView;

import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IViewport = powerbi.IViewport;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import { VisualFormattingSettingsModel } from "../settings";
export interface Node {
    index: number;
    position: THREE.Vector3;
    value: number;
}

export interface Element {
    nodes: Node[];
}

export class ProcessDataView {
    private nodes: number[][];
    private elements: number[][];
    private field_values: number[];
    private dataView: DataView;

    constructor(dataView: DataView) {
        [this.nodes, this.elements, this.field_values] = this.transfromDataToNodeAndElements(dataView)

    }

    public getNode() {
        return this.nodes;
    }
    public getElement() {
        return this.elements;
    }
    public getField() {
        return this.field_values;
    }
    public transfromDataToNodeAndElements(dataView: DataView): [number[][], number[][], number[]] {
        let ver: [] = [];
        let element_model: [] = [];
        var coordinates = dataView.categorical?.values[0].values;
        var elements = dataView.categorical.values[1].values;
        var node_field = dataView.categorical.values[2].values;
        var vertices = transformCoordsData(coordinates);
        var field_node = transformScalarValues(node_field);
        var ele = transformIndices(elements, 3);
        console.log("vertices-------", vertices);
        console.log("elements-------", ele);
        console.log("field-------", field_node);

        // for (let i = 0; i < vertices.length; i++) {
        //     let vert = vertices[i];
        //     ver[i] = {
        //         index: i,
        //         position: new THREE.Vector3(vert[0], vert[1], vert[2]),
        //         value: field_node[i]
        //     }
        // }
        // for (let i = 0; i < ele.length; i++) {
        //     let e = ele[i];
        //     element_model[i] = {
        //         nodes: [ver[e[0]], ver[e[1]], ver[e[2]]],
        //     }
        // }

        console.log("node-ver-----", ver);
        return [vertices, ele, field_node];

    }

    public async update(options: VisualUpdateOptions, applicationSettings: VisualFormattingSettingsModel) {
        const viewport: IViewport = options.viewport;
    }
}



export var transformCoordsData = (nodeCoords: any[]) => {
    let vertices: number[][] = [];
    for (let i = 0; i < nodeCoords.length; i++) {
        // if (slice && !slice.has(i)) continue;
        const coords = nodeCoords[i];
        if (coords === null) continue;
        if (coords.length === 0) continue;
        let each_node_coords: number[] = [];
        for (const coords_str of coords.split(' ')) {
            if (coords_str.length === 0) continue;
            each_node_coords.push(parseFloat(coords_str));
            if (each_node_coords.length === 3) {
                vertices.push(each_node_coords);
                each_node_coords = null;
                each_node_coords = [];
            }
        }
    }
    return vertices;
}

export var transformIndices = (line_indices: any[], numNode: number = 2) => {
    let indices: number[][] = [];
    for (let i = 0; i < line_indices.length; i++) {
        // if (slice && !slice.has(i)) continue;
        const line_indice = line_indices[i];
        if (line_indice === null) continue;
        if (line_indice.length === 0) continue;
        let each_line_indices: number[] = [];
        for (const index_str of line_indice.split(' ')) {
            if (index_str.length === 0) continue;
            each_line_indices.push(parseInt(index_str));
            if (each_line_indices.length === numNode) {
                indices.push(each_line_indices);
                each_line_indices = null;
                each_line_indices = [];
            }
        }
    }
    return indices;
}
export var transformScalarValues = (scalarValues: any[]) => {
    let ret: number[] = [];
    for (let i = 0; i < scalarValues.length; i++) {
        // if (slice && !slice.has(i)) continue;
        const values = scalarValues[i];
        if (values === null) continue;
        if (values.length === 0) continue;
        for (const v of values.split(' ')) {
            if (v.length === 0) continue;
            ret.push(parseFloat(v));
        }
    }
    return ret;
}