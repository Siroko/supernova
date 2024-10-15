import { mat4 } from "gl-matrix";
import { Vector3 } from "../buffers/Vector3";

class Object3D {
    public modelMatrix: mat4;
    public worldMatrix: mat4;
    public children: Object3D[] = [];
    public isMesh: boolean = false;
    public parent?: Object3D;
    public position: Vector3 = new Vector3();
    public rotation: Vector3 = new Vector3();
    public scale: Vector3 = new Vector3(1, 1, 1);

    constructor() {
        this.modelMatrix = mat4.create();
        this.worldMatrix = mat4.create();
    }

    public add(object: Object3D) {
        this.children.push(object);
        object.parent = this;
    }

    public updateModelMatrix() {
        mat4.fromTranslation(this.modelMatrix, this.position.toVec());
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation.x);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation.y);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation.z);
        mat4.scale(this.modelMatrix, this.modelMatrix, this.scale.toVec());
    }

    public updateWorldMatrix() {
        if (this.parent) {
            mat4.mul(this.worldMatrix, this.parent.worldMatrix, this.modelMatrix);
        } else {
            mat4.copy(this.worldMatrix, this.modelMatrix);
        }
    }
}

export { Object3D }