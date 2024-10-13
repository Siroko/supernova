import { IBindable } from "./IBindable";

class BufferBase implements IBindable {
    public static BUFFER_TYPE_STORAGE: string = 'storage';
    public static BUFFER_TYPE_UNIFORM: string = 'uniform-buffer';
    public static BUFFER_TYPE_READ_ONLY_STORAGE: string = 'read-only-storage';

    public usage: GPUFlagsConstant = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
    public type?: string | undefined;
    public initialized: boolean = false;
    get resource(): GPUBindingResource {
        return { buffer: this._resource! };
    }
    protected _resource?: GPUBuffer;
    protected buffer?: Float32Array;

    public initialize(gpuDevice: GPUDevice): void {
        console.log("initializing compute buffer", this.buffer);
        this._resource = gpuDevice.createBuffer({
            mappedAtCreation: true,
            size: this.buffer!.byteLength,
            usage: this.usage
        });
        new Float32Array(this._resource.getMappedRange()).set(this.buffer!);

        this._resource.unmap();
    }
}

export { BufferBase };