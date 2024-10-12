import { IBindable } from "../buffers/IBindable";

export class BindGroupDescriptor {
    binding?: number;
    visibility?: GPUFlagsConstant;
    value?: IBindable;
}

class Material {

    public shaderRenderModule?: GPUShaderModule;
    public pipeline?: GPURenderPipeline;
    public bindGroupLayout?: GPUBindGroupLayout;
    public bindGroup?: GPUBindGroup;
    public initialized: boolean = false;

    constructor(
        private shaderCode: string,
        public uniforms: BindGroupDescriptor[]
    ) {
    }

    private createShaderModule(gpuDevice: GPUDevice) {
        this.shaderRenderModule = gpuDevice.createShaderModule({
            code: this.shaderCode
        });
    }

    private createBindGroupLayout(gpuDevice: GPUDevice) {
        // const entries = [
        //     {
        //         binding: 0,
        //         visibility: GPUShaderStage.FRAGMENT,
        //         type: 'external-texture'
        //     },
        //     {
        //         binding: 1,
        //         visibility: GPUShaderStage.FRAGMENT,
        //         type: 'texture-2d-array'
        //     },
        //     {
        //         binding: 2,
        //         visibility: GPUShaderStage.FRAGMENT,
        //         type: 'sampler'
        //     },
        //     {
        //         binding: 3,
        //         visibility: GPUShaderStage.FRAGMENT,
        //         type: 'uniform-buffer'
        //     }
        // ]
        const entries = [];
        for (const uniform of this.uniforms) {
            if (uniform.value!.type) {
                entries.push({
                    binding: uniform.binding!,
                    visibility: uniform.visibility!,
                    type: uniform.value!.type!
                });
            } else {
                entries.push({
                    binding: uniform.binding!,
                    visibility: uniform.visibility!,
                });
            }
        }

        this.bindGroupLayout = gpuDevice.createBindGroupLayout({
            entries
        });
    }

    public initialize(gpuDevice: GPUDevice, vertexBuffersDescriptors: Iterable<GPUVertexBufferLayout | null>, presentationFormat: GPUTextureFormat) {
        if (!this.shaderRenderModule) {
            this.createShaderModule(gpuDevice);
        }

        if (!this.bindGroupLayout) {
            this.createBindGroupLayout(gpuDevice);
        }

        const renderPipelineDescriptor: GPURenderPipelineDescriptor = {
            vertex: {
                module: this.shaderRenderModule,
                entryPoint: 'vertex_main',
                buffers: vertexBuffersDescriptors
            } as GPUVertexState,
            fragment: {
                module: this.shaderRenderModule,
                entryPoint: 'fragment_main',
                targets: [
                    {
                        format: presentationFormat,
                    },
                ],
            } as GPUFragmentState,
            primitive: {
                topology: 'triangle-list',
            } as GPUPrimitiveState,
            layout: "auto"
        }
        this.pipeline = gpuDevice.createRenderPipeline(renderPipelineDescriptor);

        this.initialized = true;
    }

    public async getBindGroup(gpuDevice: GPUDevice, bindingGroupLayoutPosition: number) {
        const entries: GPUBindGroupEntry[] = [];

        for (const uniform of this.uniforms) {
            if (!uniform.value?.initialized) {
                await uniform.value?.initialize(gpuDevice);
            }

            entries.push({
                binding: uniform.binding ?? 0,
                resource: uniform.value!.resource!,
            });
        }

        this.bindGroup = gpuDevice.createBindGroup({
            layout: this.pipeline!.getBindGroupLayout(bindingGroupLayoutPosition),
            entries: entries
        });
        return this.bindGroup;
    }
}

export { Material }