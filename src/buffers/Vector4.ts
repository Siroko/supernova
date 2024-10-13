import { vec4 } from "gl-matrix";
import { BufferBase } from "./BufferBase";

class Vector4 extends BufferBase {
    public type: string = BufferBase.BUFFER_TYPE_UNIFORM;
    public initialized: boolean = false;

    private internalVec4: vec4;

    constructor(x: number, y: number, z: number, w: number) {
        super();
        this.internalVec4 = vec4.create();
        vec4.set(this.internalVec4, x, y, z, w);
        this.buffer = new Float32Array([x, y, z, w]);
    }

    get x() {
        return this.internalVec4[0];
    }

    get y() {
        return this.internalVec4[1];
    }

    get z() {
        return this.internalVec4[2];
    }

    get w() {
        return this.internalVec4[3];
    }

    set x(value: number) {
        vec4.set(this.internalVec4, value, this.y, this.z, this.w);
    }

    set y(value: number) {
        vec4.set(this.internalVec4, this.x, value, this.z, this.w);
    }

    set z(value: number) {
        vec4.set(this.internalVec4, this.x, this.y, value, this.w);
    }

    set w(value: number) {
        vec4.set(this.internalVec4, this.x, this.y, this.z, value);
    }
}

export { Vector4 }