import { DataType, DataTypeHelper } from './data_type';
// import { Component } from '../model/component';

export var filterModelData = (modelDatas: any[], dataTypes: DataType[]): void => {
    for (let i = 0; i < modelDatas.length; i++) {
        if (!modelDatas[i]) continue;
        const dataType: DataType = DataTypeHelper.create(modelDatas[i].source.roles);
        if (!dataTypes.includes(dataType)) {
            modelDatas.splice(i, 1);
            modelDatas.splice(i, 0, undefined);
        }
    }
}


export var getTagToRowIndices = (
    modelDatas: any[],
    meshDataTypeToIndex: any
): Map<string, Set<number>> => {
    const tags: string[] = modelDatas[meshDataTypeToIndex.get(DataType.ComponentTags)].values;
    let tagToRowIndices = new Map<string, Set<number>>();
    for (let i: number = 0; i < tags.length; i++) {
        const tag: string = tags[i];
        if (!tagToRowIndices.has(tag)) {
            tagToRowIndices.set(tag, new Set<number>());
        }
        // let indices: Set<number> = tagToRowIndices.get(tag);
        let indices: Set<number> = tagToRowIndices.get(tag)!;
        indices.add(i);
    }
    return tagToRowIndices;
}
// 

// export var getPreferredModelData = (
//     preferredDataTypes: DataType[], 
//     modelDatas: any[], 
//     meshDataTypeToIndex: any): Component[] => {
//     let components: Component[] = [];
//     const tagToRowIndices: Map<string, Set<number>> = getTagToRowIndices(modelDatas, meshDataTypeToIndex);
//     for (const [ tag, rowIndices ] of tagToRowIndices) {
//         let componentArgs = {};
//         for (const [dataType, index] of meshDataTypeToIndex) {
//             if (preferredDataTypes.includes(dataType)) {
//                 componentArgs[dataType] = DataTypeHelper.processRawDrawData(
//                     dataType, modelDatas[index].values, rowIndices);
//                 componentArgs['componentName'] = tag;
//             }
//         }
//         components.push(Component.createFromJson(componentArgs));
//         componentArgs = null;
//     }
//     return components;
// };


export var getAvailableFieldNames = (solutionDataTypeToFieldToIndex: any) => {
    const nodalFieldNames: Set<string> = new Set<string>();
    const elementalFieldNames: Set<string> = new Set<string>();
    for (const [dataType, fieldToIndex] of solutionDataTypeToFieldToIndex) {
        for (const [fieldName, _] of fieldToIndex) {
            if (dataType === DataType.NodalFieldValues) {
                nodalFieldNames.add(fieldName);
            }
            else if (dataType === DataType.ElementalFieldValues) {
                elementalFieldNames.add(fieldName);
            }
        }
    }
    return [nodalFieldNames, elementalFieldNames];
};


export var getDataTypeToIndex = (modelDatas: any[]) => {
    let meshDataTypeToIndex = new Map<DataType, number>();
    let solutionDataTypeToFieldToIndex = new Map<DataType, Map<string, number>>();
    for (let i = 0; i < modelDatas.length; i++) {
        if (modelDatas[i] === undefined) continue;
        const dataType: DataType = DataTypeHelper.create(modelDatas[i].source.roles);
        if (DataTypeHelper.isSolutionFieldDataType(dataType)) {
            if (!solutionDataTypeToFieldToIndex.has(dataType)) {
                solutionDataTypeToFieldToIndex.set(dataType, new Map<string, number>());
            }
            const fieldName: string = modelDatas[i].source.expr.arg.ref;
            // const fieldToIndex: Map<string, number> = solutionDataTypeToFieldToIndex.get(dataType);
            const fieldToIndex: Map<string, number> = solutionDataTypeToFieldToIndex.get(dataType)!;

            fieldToIndex.set(fieldName, i);
        }
        else {
            meshDataTypeToIndex.set(dataType, i);
        }
    }
    return [meshDataTypeToIndex, solutionDataTypeToFieldToIndex]
}
