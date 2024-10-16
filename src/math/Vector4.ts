import { vec4 } from "gl-matrix";
import { BufferBase } from "../buffers/BufferBase";

class Vector4 extends BufferBase {
    public type: string = BufferBase.BUFFER_TYPE_UNIFORM;
    public initialized: boolean = false;

    private internalVec4: vec4;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        super();
        this.internalVec4 = vec4.create();
        vec4.set(this.internalVec4, x, y, z, w);
        this.buffer = new Float32Array(this.internalVec4);
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

    private updateBuffer() {
        this.buffer!.set(this.internalVec4);
        this.needsUpdate = true;
    }

    set x(value: number) {
        vec4.set(this.internalVec4, value, this.y, this.z, this.w);
        this.updateBuffer();
    }

    set y(value: number) {
        vec4.set(this.internalVec4, this.x, value, this.z, this.w);
        this.updateBuffer();
    }

    set z(value: number) {
        vec4.set(this.internalVec4, this.x, this.y, value, this.w);
        this.updateBuffer();
    }

    set w(value: number) {
        vec4.set(this.internalVec4, this.x, this.y, this.z, value);
        this.updateBuffer();
    }

    setComponent(component: number, value: number) {
        this.internalVec4[component] = value;
        this.updateBuffer();
    }
}

export { Vector4 }
