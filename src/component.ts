export class Component {
    public componentName: string;
    public coordinates: number[][];
    public topology3d: number[][];
    public topology1d: number[][];
    public fieldValues: number[];
    public color: number[];
    public shapeEdge: number[][];
    public boundingBox: number[];
    public visible: boolean;

    constructor(
        componentName: string,
        coordinates: number[][],
        topology3d: number[][],
        topology1d: number[][],
        shapeEdge: number[][],
        fieldValues: number[],
        color: number[],
        visible: boolean
    ) {
        this.componentName = componentName;
        this.coordinates = coordinates;
        this.topology3d = topology3d;
        this.topology1d = topology1d;
        this.fieldValues = fieldValues;
        this.color = color;
        this.shapeEdge = shapeEdge;
        this.visible = visible;
        if (coordinates != undefined) {
            this.boundingBox = this.computeBoundingBox();
        }
        else {
            this.boundingBox = undefined;
        }
    }

    public computeBoundingBox(): number[] {
        const minX = Math.min(...this.coordinates.map(coord => coord[0]));
        const minY = Math.min(...this.coordinates.map(coord => coord[1]));
        const minZ = Math.min(...this.coordinates.map(coord => coord[2]));
        const maxX = Math.max(...this.coordinates.map(coord => coord[0]));
        const maxY = Math.max(...this.coordinates.map(coord => coord[1]));
        const maxZ = Math.max(...this.coordinates.map(coord => coord[2]));

        return [minX, minY, minZ, maxX, maxY, maxZ];
    }

    public getBoundingBox(): number[] {
        return this.boundingBox;
    }

    public getComponentName(): string {
        return this.componentName;
    }

    public static createFromJson(json: any) {
        const coordinates: any = json.coordinates || json.elementalCoordinates;
        const scalarValues: any = json.nodalFieldValue || json.elementalFieldValue;
        return new Component(
            json.componentName,
            coordinates,
            json.topology3d,
            json.topology1d,
            json.topologySharpEdge,
            scalarValues,
            json.componentColor,
            json.visible);
    }



}