import { DataType, DataTypeHelper } from './data_type'
import { Component } from '../component';
import * as mdu from './model_data_utils'
import { isNull } from "lodash";
const UPPER_BOUND_INT: number = 2147483647;

export class ProcessBase64Data {
    private canvas: HTMLCanvasElement;
    static FLOAT_SCALE: number;
    static DEFAULT_SCALE: number = 1E3; // default scale for coordinates.




    private decodeRGBToInteger(r: number, g: number, b: number, a: number): number {
        return (r << 24) | (g << 16) | (b << 8) | a;
    }


    public async processModelData(
        preferredDataTypes: DataType[],
        modelDatas: any[], meshDataTypeByIndex: any
    ): Promise<Component[]> {
        let components: Component[] = [];
        const tagRowIndex = mdu.getTagToRowIndices(modelDatas, meshDataTypeByIndex);
        for (let [tag, rowIndices] of tagRowIndex) {
            let componentArgs = {};
            for (const [dataType, index] of meshDataTypeByIndex) {
                let rawData: string[] = modelDatas[index].values;
                let isVisible: boolean = true;
                const highlights: any[] = modelDatas[index].highlights;
                let slice: Set<number> = rowIndices;
                if (preferredDataTypes.includes(dataType)) {
                    if (highlights) {
                        const visibles: any[] = highlights.filter(
                            (_: string, index: number) => rowIndices.has(index));
                        if (visibles.includes(null)) {
                            isVisible = false;
                        }
                    }
                    if (DataTypeHelper.UseBase64DataTypes.includes(dataType)) {
                        const base64Datas: string[] = rawData.filter(
                            (_: string, index: number) => rowIndices.has(index));
                        const concatBase64String: string = base64Datas.reduce(
                            (accum, current) => isNull(current) ? accum : accum + current, "");
                        if (concatBase64String.length === 0) continue;

                        componentArgs[dataType] = await this.processRawData(base64Datas, dataType);
                    }
                    else {
                        componentArgs[dataType] = DataTypeHelper.processRawDrawData(
                            dataType, rawData, slice);
                    }
                    componentArgs['visible'] = isVisible;
                    componentArgs['componentName'] = tag;
                }
            }
            components.push(Component.createFromJson(componentArgs));
            componentArgs = null;
        }
        return components;
    }

    private async processRawData(base64Datas: string[], dataType: DataType) {
        let result: any;
        const deScaling: boolean = DataTypeHelper.NeedDivideDataTypes.includes(dataType);
        const indices: number[] = await this.processBase64Datas(base64Datas);
        if (DataTypeHelper.ThreeComponentDataTypes.includes(dataType)) {
            result = this.transformIndices(indices, 3, deScaling);
        }
        else if (DataTypeHelper.TwoComponentDataTypes.includes(dataType)) {
            result = this.transformIndices(indices, 2, deScaling);
        }
        else {
            result = indices;
            if (deScaling) {
                result = indices.map(value => value / ProcessBase64Data.FLOAT_SCALE);
            }
        }
        return result;
    }

    private transformIndices = (flattenedIndices: number[], numNode: number = 2, deScaling: boolean = false): number[][] => {
        let indices: number[][] = [];
        let indiceGroup: number[] = [];
        for (let idx of flattenedIndices) {
            if (deScaling) {
                idx = idx / ProcessBase64Data.DEFAULT_SCALE;
            }
            indiceGroup.push(idx);
            if (indiceGroup.length === numNode) {
                indices.push(indiceGroup);
                indiceGroup = null;
                indiceGroup = [];
            }
        }
        return indices;
    }

    private async processBase64Datas(base64Datas: string[]): Promise<number[]> {
        const base64String: string = base64Datas
            .map(item => isNull(item) ? "" : item.trim())
            .reduce((accum, current) => accum + current, "data:image/png;base64,");

        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get 2D context from canvas'));
                return;
            }

            img.onload = () => {
                try {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const pixels = imageData.data;
                    const indices: number[] = [];

                    for (let i = 0; i < pixels.length; i += 4) {
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];
                        const a = pixels[i + 3];
                        const value = this.decodeRGBToInteger(r, g, b, a);
                        if (value === UPPER_BOUND_INT) continue;
                        indices.push(value);
                    }

                    resolve(indices);
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = (error) => {
                reject(new Error('Failed to load image from base64 string'));
            };

            img.src = base64String;
        });
    }

}