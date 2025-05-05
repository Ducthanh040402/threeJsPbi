import * as THREE from 'three';
import powerbi from 'powerbi-visuals-api';
import DataView = powerbi.DataView;
import { isNull } from "lodash";
import * as mdu from './model_data_utils'
import { ProcessBase64Data } from './handle_base64_data'


import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IViewport = powerbi.IViewport;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import { VisualFormattingSettingsModel } from "../settings";
import { DataTypeHelper } from './data_type';
import { Component } from '../component';

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
    private processData: ProcessBase64Data = new ProcessBase64Data;


    public getNode() {
        return this.nodes;
    }
    public getElement() {
        return this.elements;
    }
    public getField() {
        return this.field_values;
    }
    public async transfromDataToNodeAndElements(dataView: DataView): Promise<Component[]> {
        let ver: [] = [];
        let element_model: [] = [];
        var coordinates = dataView.categorical?.values[0].values;
        var elements = dataView.categorical.values[1].values;
        var node_field = dataView.categorical.values[2].values;

        const [
            meshDataTypeToIndex,
            solutionDataTypeToFieldToIndex
        ] = mdu.getDataTypeToIndex(dataView.categorical.values);
        const components = await this.processData.processModelData(DataTypeHelper.ComponentDataTypes, dataView.categorical.values, meshDataTypeToIndex);

        console.log("processData----------")
        return components
    }
}



export var transformCoordsData = (nodeCoords: any[], slice: Set<number>) => {
    let vertices: number[][] = [];
    for (let i = 0; i < nodeCoords.length; i++) {
        if (slice && !slice.has(i)) continue;
        const coords = nodeCoords[i];
        if (isNull(coords)) continue;
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

export var transformIndices = (line_indices: any[], numNode: number = 2, slice: Set<number>) => {
    let indices: number[][] = [];
    for (let i = 0; i < line_indices.length; i++) {
        if (slice && !slice.has(i)) continue;
        const line_indice = line_indices[i];
        if (isNull(line_indice)) continue;
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

export var transformScalarValues = (scalarValues: any[], slice: Set<number>) => {
    let ret: number[] = [];
    for (let i = 0; i < scalarValues.length; i++) {
        if (slice && !slice.has(i)) continue;
        const values = scalarValues[i];
        if (isNull(values)) continue;
        if (values.length === 0) continue;
        for (const v of values.split(' ')) {
            if (v.length === 0) continue;
            ret.push(parseFloat(v));
        }
    }
    return ret;
}

export var transformLocationValues = (locationValues: any[], slice: Set<number>) => {
    let ret: any[] = [];
    for (let i = 0; i < locationValues.length; i++) {
        if (slice && !slice.has(i)) continue;
        const values = locationValues[i];
        if (isNull(values)) continue;
        if (values.length === 0) continue;
        const parts: string[] = values.trim().split(';');
        const x: number = parseFloat(parts[0]);
        const y: number = parseFloat(parts[1]);
        const z: number = parseFloat(parts[2]);
        const label: string = parts[3];
        const r: number = parseFloat(parts[4]);
        const g: number = parseFloat(parts[5]);
        const b: number = parseFloat(parts[6]);
        const a: number = parseFloat(parts[7]);
        ret.push([[x, y, z], label, [r, g, b, a]])
    }
    return ret;
}