import { mat4 } from "gl-matrix";

class Object3D {
    public modelMatrix: mat4;
    public children: Object3D[] = [];
    public isMesh: boolean = false;
    public parent?: Object3D;
    constructor() {
        this.modelMatrix = mat4.create();
    }

    public add(object: Object3D) {
        this.children.push(object);
    }
}

export { Object3D }