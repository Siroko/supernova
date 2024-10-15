import { vec3 } from "gl-matrix";
import { BufferBase } from "./BufferBase";

class Vector3 extends BufferBase {
    public type: string = BufferBase.BUFFER_TYPE_UNIFORM;
    private internalVec3: vec3;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        super();
        this.internalVec3 = vec3.create();
        vec3.set(this.internalVec3, x, y, z);
        this.buffer = new Float32Array(this.internalVec3);
    }

    get x() {
        return this.internalVec3[0];
    }

    get y() {
        return this.internalVec3[1];
    }

    get z() {
        return this.internalVec3[2];
    }

    private updateBuffer() {
        this.buffer!.set(this.internalVec3);
        this.needsUpdate = true;
    }

    set x(value: number) {
        this.internalVec3[0] = value;
        this.updateBuffer();
    }

    set y(value: number) {
        this.internalVec3[1] = value;
        this.updateBuffer();
    }

    set z(value: number) {
        this.internalVec3[2] = value;
        this.updateBuffer();
    }

    public setComponent(component: number, value: number) {
        this.internalVec3[component] = value;
        this.updateBuffer();
    }

    public toVec3(): vec3 {
        return this.internalVec3;
    }
}

export { Vector3 }
