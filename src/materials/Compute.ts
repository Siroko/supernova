import { IBindable } from "../buffers/IBindable";

export class BindGroupDescriptor {
    binding?: number;
    visibility?: GPUFlagsConstant;
    value?: IBindable;
}

class Compute {

    public shaderComputeModule?: GPUShaderModule;
    public pipeline?: GPUComputePipeline;
    public bindGroupLayout?: GPUBindGroupLayout;
    public bindGroup?: GPUBindGroup;
    public initialized: boolean = false;

    constructor(
        private shaderCode: string,
        public uniforms: BindGroupDescriptor[]
    ) {
    }

    private createShaderModule(gpuDevice: GPUDevice) {
        this.shaderComputeModule = gpuDevice.createShaderModule({
            code: this.shaderCode
        });
    }

    private createBindGroupLayout(gpuDevice: GPUDevice) {
        const entries = [];
        for (const uniform of this.uniforms) {
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

        this.bindGroupLayout = gpuDevice.createBindGroupLayout({
            entries
        });
    }

    public initialize(gpuDevice: GPUDevice) {
        if (!this.shaderComputeModule) {
            this.createShaderModule(gpuDevice);
        }

        if (!this.bindGroupLayout) {
            this.createBindGroupLayout(gpuDevice);
        }

        const computePipelineDescriptor: GPUComputePipelineDescriptor = {
            layout: "auto",
            label: "Compute Pipeline",
            compute: {
                module: this.shaderComputeModule!,
                entryPoint: 'main'
            }
        }
        this.pipeline = gpuDevice.createComputePipeline(computePipelineDescriptor);
        console.log(this.pipeline);
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

export { Compute }