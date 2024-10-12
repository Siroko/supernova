import { Geometry } from "../buffers/Geometry";
import { Material } from "../materials/Material";
import { Object3D } from "./Object3D";

class Mesh extends Object3D {
    public isMesh: boolean = true;
    constructor(
        public geometry: Geometry,
        public material: Material
    ) {
        super();
    }
}

export { Mesh }