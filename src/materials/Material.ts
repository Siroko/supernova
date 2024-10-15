import { IBindable } from "../buffers/IBindable";

export class BindGroupDescriptor {
    binding?: number;
    visibility?: GPUFlagsConstant;
    value?: IBindable;
}

class Material {

    public shaderRenderModule?: GPUShaderModule;
    public pipeline?: GPURenderPipeline;
    public bindGroupLayouts: Array<GPUBindGroupLayout> = [];
    public bindGroups: Array<GPUBindGroup> = [];
    public initialized: boolean = false;
    public uniformGroups: BindGroupDescriptor[][];

    constructor(
        private shaderCode: string,
        uniforms: BindGroupDescriptor[]
    ) {
        this.uniformGroups = [uniforms];
    }

    private createShaderModule(gpuDevice: GPUDevice) {
        this.shaderRenderModule = gpuDevice.createShaderModule({
            code: this.shaderCode
        });
    }

    private createBindGroupLayout(gpuDevice: GPUDevice) {
        for (const uniformGroup of this.uniformGroups) {
            const entries = [];
            for (const uniform of uniformGroup) {
                const entry: GPUBindGroupLayoutEntry = {
                    binding: uniform.binding!,
                    visibility: uniform.visibility!
                };
                switch (uniform.value!.type) {
                    case 'storage':
                    case 'read-only-storage':
                    case 'uniform':
                        entry.buffer = {
                            type: uniform.value!.type as GPUBufferBindingType
                        };
                        break;
                    case 'sampler':
                        entry.sampler = { type: 'filtering' };
                        break;
                    case 'texture':
                        entry.texture = { sampleType: 'float' };
                        break;
                    case 'storage-texture':
                        entry.storageTexture = {
                            access: 'write-only',
                            format: 'rgba8unorm'
                        };
                        break;
                    case 'external-texture':
                        entry.externalTexture = {};
                        break;
                    default:
                        console.error(`Unknown binding type: ${uniform.value!.type}`);
                        continue;
                }
                entries.push(entry);
            }

            this.bindGroupLayouts.push(gpuDevice.createBindGroupLayout({
                entries
            }));
        }
    }

    public initialize(gpuDevice: GPUDevice, vertexBuffersDescriptors: Iterable<GPUVertexBufferLayout | null>, presentationFormat: GPUTextureFormat) {
        if (!this.shaderRenderModule) {
            this.createShaderModule(gpuDevice);
        }

        if (this.bindGroupLayouts.length !== this.uniformGroups.length) {
            this.createBindGroupLayout(gpuDevice);
        }

        const renderPipelineDescriptor: GPURenderPipelineDescriptor = {
            layout: "auto",
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
                cullMode: 'back',
            } as GPUPrimitiveState,

            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
        }
        this.pipeline = gpuDevice.createRenderPipeline(renderPipelineDescriptor);

        this.initialized = true;
    }

    public async getBindGroups(gpuDevice: GPUDevice): Promise<Array<GPUBindGroup>> {
        const entries: GPUBindGroupEntry[] = [];
        let bindingGroupLayoutPosition = 0;
        for (const uniformGroup of this.uniformGroups) {
            for (const uniform of uniformGroup) {
                if (!uniform.value?.initialized) {
                    await uniform.value?.initialize(gpuDevice);
                }

                if (uniform.value?.needsUpdate) {
                    await uniform.value?.update(gpuDevice);
                }

                entries.push({
                    binding: uniform.binding ?? 0,
                    resource: uniform.value!.resource!,
                });
            }

            this.bindGroups[bindingGroupLayoutPosition] = gpuDevice.createBindGroup({
                layout: this.pipeline!.getBindGroupLayout(bindingGroupLayoutPosition),
                entries: entries
            });
            bindingGroupLayoutPosition++;
        }

        return new Promise((resolve) => {
            resolve(this.bindGroups);
        });
    }
}

export { Material }