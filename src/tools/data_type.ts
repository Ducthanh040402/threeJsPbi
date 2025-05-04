import * as utils from "./utils_process_data";



export enum DataType {
    Coordinates = "coordinates",
    ElementalCoordinates = "elementalCoordinates",
    TriangleIndices = "topology3d",
    LineIndices = "topology1d",
    SharpEdgeIndices = "topologySharpEdge",
    NodalFieldValues = "nodalFieldValue",
    ElementalFieldValues = "elementalFieldValue",
    ComponentColors = "componentColor",
    ComponentTags = "componentTag",
    HighlightLocations = "highlightLocation"
}

export class DataTypeHelper {
    static ComponentDataTypes: DataType[] = [
        DataType.Coordinates,
        DataType.TriangleIndices,
        DataType.LineIndices,
        DataType.SharpEdgeIndices,
        DataType.ComponentColors
    ];
    static UseBase64DataTypes: DataType[] = [
        DataType.TriangleIndices,
        DataType.LineIndices,
        DataType.SharpEdgeIndices,
        DataType.Coordinates,
        DataType.NodalFieldValues
    ];
    static ThreeComponentDataTypes: DataType[] = [
        DataType.TriangleIndices,
        DataType.Coordinates,
    ];
    static TwoComponentDataTypes: DataType[] = [
        DataType.SharpEdgeIndices,
        DataType.LineIndices,
    ];
    static NeedDivideDataTypes: DataType[] = [
        DataType.Coordinates,
        DataType.NodalFieldValues
    ];
    static NodalSolutionDataTypes: DataType[] = [
        DataType.NodalFieldValues,
    ];
    static ElementalSolutionDataTypes: DataType[] = [
        DataType.ElementalCoordinates,
        DataType.ElementalFieldValues
    ];

    public static create(roles: any): DataType {
        if (roles.coordinates) return DataType.Coordinates;
        else if (roles.elementalCoordinates) return DataType.ElementalCoordinates;
        else if (roles.topology3d) return DataType.TriangleIndices;
        else if (roles.topology1d) return DataType.LineIndices;
        else if (roles.topologySharpEdge) return DataType.SharpEdgeIndices;
        else if (roles.nodalFieldValue) return DataType.NodalFieldValues;
        else if (roles.elementalFieldValue) return DataType.ElementalFieldValues;
        else if (roles.componentColor) return DataType.ComponentColors;
        else if (roles.componentTag) return DataType.ComponentTags;
        else if (roles.highlightLocation) return DataType.HighlightLocations;
        throw new Error("Undefined DrawInfoTypes");
    }

    public static hasBasicDataTypes(dataTypes: Set<DataType>): boolean {
        return dataTypes.has(DataType.Coordinates) &&
            ((dataTypes.has(DataType.TriangleIndices)
                && dataTypes.has(DataType.SharpEdgeIndices)) ||
                dataTypes.has(DataType.LineIndices));
    }

    public static isBasicComponentInfoType(dataType: DataType): boolean {
        return dataType in DataTypeHelper.ComponentDataTypes;
    }

    public static isSolutionFieldDataType(dataType: DataType): boolean {
        return dataType === DataType.NodalFieldValues ||
            dataType === DataType.ElementalFieldValues;
    }

    // public static getPreferredDataTypes(
    //     currentSelectionMode: SelectionMode,
    //     isNodalField: boolean
    // ): DataType[]
    // {
    //     if (currentSelectionMode === SelectionMode.SOLUTION) {
    //         if (isNodalField) {
    //             return DataTypeHelper.NodalSolutionDataTypes;
    //         }
    //         else {
    //             return DataTypeHelper.ElementalSolutionDataTypes;
    //         }
    //     }
    //     return [];

    // }

    public static processRawDrawData(drawInfoType: DataType, rawData: any[], slice: Set<number>) {
        switch (drawInfoType) {
            case DataType.Coordinates:
                return utils.transformCoordsData(rawData, slice);
            case DataType.ElementalCoordinates:
                return utils.transformCoordsData(rawData, slice);
            case DataType.TriangleIndices:
                return utils.transformIndices(rawData, 3, slice);
            case DataType.LineIndices:
                return utils.transformIndices(rawData, 2, slice);
            case DataType.SharpEdgeIndices:
                return utils.transformIndices(rawData, 2, slice);
            case DataType.NodalFieldValues:
                return utils.transformScalarValues(rawData, slice);
            case DataType.ElementalFieldValues:
                return utils.transformScalarValues(rawData, slice);
            case DataType.ElementalFieldValues:
                return utils.transformScalarValues(rawData, slice);
            case DataType.ComponentColors:
                return utils.transformScalarValues(rawData, slice);
            case DataType.HighlightLocations:
                return utils.transformLocationValues(rawData, slice);
            default:
                console.error(`Undefined ${drawInfoType}`);
                break;
        }
    }
}