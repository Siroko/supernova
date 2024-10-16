import { mat4, vec3 } from "gl-matrix";
import { BufferBase } from "./BufferBase";
import { Vector3 } from "../math/Vector3";

class Matrix4 extends BufferBase {
    public type: string = BufferBase.BUFFER_TYPE_UNIFORM;

    public readonly internalMat4: mat4;

    constructor() {
        super();
        this.internalMat4 = mat4.create();
        this.buffer = new Float32Array(this.internalMat4);
    }

    private updateBuffer() {
        this.buffer!.set(this.internalMat4);
        this.needsUpdate = true;
    }

    multiply(a: Matrix4, b: Matrix4): Matrix4 {
        mat4.multiply(this.internalMat4, a.internalMat4, b.internalMat4);
        this.updateBuffer();
        return this;
    }

    fromTranslation(v: vec3): Matrix4 {
        mat4.fromTranslation(this.internalMat4, v);
        this.updateBuffer();
        return this;
    }

    rotateX(angle: number): Matrix4 {
        mat4.rotateX(this.internalMat4, this.internalMat4, angle);
        this.updateBuffer();
        return this;
    }

    rotateY(angle: number): Matrix4 {
        mat4.rotateY(this.internalMat4, this.internalMat4, angle);
        this.updateBuffer();
        return this;
    }

    rotateZ(angle: number): Matrix4 {
        mat4.rotateZ(this.internalMat4, this.internalMat4, angle);
        this.updateBuffer();
        return this;
    }

    scale(v: Vector3): Matrix4 {
        mat4.scale(this.internalMat4, this.internalMat4, v.internalVec3);
        this.updateBuffer();
        return this;
    }

    copy(a: Matrix4): Matrix4 {
        mat4.copy(this.internalMat4, a.internalMat4);
        this.updateBuffer();
        return this;
    }
}

export { Matrix4 }
