import { vec4 } from "gl-matrix";
import { IBindable } from "./IBindable";

class Vector4 implements IBindable {
    public type: string = "uniform-buffer";
    public initialized: boolean = false;

    private internalVec4: vec4;
    private _resource?: GPUBuffer;
    constructor(x: number, y: number, z: number, w: number) {
        this.internalVec4 = vec4.create();
        vec4.set(this.internalVec4, x, y, z, w);
    }

    get resource(): GPUBindingResource {
        return { buffer: this._resource! };
    }

    initialize(gpuDevice: GPUDevice): void {
        const resolution = new Float32Array([
            this.internalVec4[0], this.internalVec4[1], this.internalVec4[2], this.internalVec4[3]
        ])

        this._resource = gpuDevice.createBuffer({
            mappedAtCreation: true,
            size: resolution.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        new Float32Array(this._resource.getMappedRange()).set(resolution);

        this._resource.unmap();
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