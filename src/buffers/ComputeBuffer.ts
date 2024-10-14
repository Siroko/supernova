import { BufferBase } from "./BufferBase";

interface IComputeBufferOptions {
    type?: string;
    usage: GPUFlagsConstant;
    buffer?: Float32Array;
}

class ComputeBuffer extends BufferBase {

    public type?: string = ComputeBuffer.BUFFER_TYPE_STORAGE;

    constructor(options: IComputeBufferOptions) {
        super();
        this.type = options.type;
        this.usage = options.usage;
        this.buffer = options.buffer;
    }

    public setBuffer(buffer: Float32Array, usage: GPUFlagsConstant = GPUBufferUsage.STORAGE) {
        this.buffer = buffer;
        this.usage = usage;
    }
}

export { ComputeBuffer };