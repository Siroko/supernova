import { BufferBase } from "./BufferBase";

class ComputeBuffer extends BufferBase {

    public type?: string = ComputeBuffer.BUFFER_TYPE_STORAGE;

    constructor() {
        super();
    }

    public setBuffer(buffer: Float32Array, usage: GPUFlagsConstant = GPUBufferUsage.STORAGE) {
        this.buffer = buffer;
        this.usage = usage;
    }

}

export { ComputeBuffer };