class Geometry {
    public vertexBuffer?: GPUBuffer;
    public vertexBuffersDescriptors: Iterable<GPUVertexBufferLayout | null> = [];
    public initialized: boolean = false;

    private vertices: Float32Array = new Float32Array([
        -3.0, -3.0, 0, 1, 1, 0, 0, 1,
        -0.0, 3.0, 0, 1, 0, 1, 0, 1,
        3.0, -3.0, 0, 1, 0, 0, 1, 1
    ]);

    //TODO: Add vertices manually from outside
    constructor() {
    }

    public createVertexBuffer(gpuDevice: GPUDevice) {
        this.vertexBuffer = gpuDevice.createBuffer({
            size: this.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Float32Array(this.vertexBuffer.getMappedRange()).set(this.vertices);
        this.vertexBuffer.unmap();

        this.vertexBuffersDescriptors = [{
            attributes: [
                {
                    shaderLocation: 0 as GPUIndex32,
                    offset: 0 as GPUSize64,
                    format: "float32x4" as GPUVertexFormat
                },
                {
                    shaderLocation: 1 as GPUIndex32,
                    offset: 16 as GPUSize64,
                    format: "float32x4" as GPUVertexFormat
                }
            ] as Iterable<GPUVertexAttribute>,
            arrayStride: 32 as GPUSize64,
            stepMode: "vertex" as GPUVertexStepMode
        }] as Iterable<GPUVertexBufferLayout | null>;

        this.initialized = true;
    }
}

export { Geometry }