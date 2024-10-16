import { BindGroupDescriptor } from "./Material";

class UniformGroup {
    public bindGroupLayout?: GPUBindGroupLayout;
    public bindGroup?: GPUBindGroup;
    public initialized: boolean = false;
    private pipelineBindGroupLayout?: GPUBindGroupLayout;

    constructor(
        public uniforms: BindGroupDescriptor[]
    ) {
    }

    public getBindGroup(gpuDevice: GPUDevice, pipeline: GPURenderPipeline, bindingGroupLayoutPosition: number = 0): GPUBindGroup {
        const entries: GPUBindGroupEntry[] = [];
        let needsRebind = false;

        for (const uniform of this.uniforms) {
            if (!uniform.value?.initialized) {
                uniform.value?.initialize(gpuDevice);
            }

            if (uniform.value?.needsUpdate) {
                uniform.value?.update(gpuDevice);
                needsRebind = true;
            }

            if (!this.pipelineBindGroupLayout) {
                this.pipelineBindGroupLayout = pipeline.getBindGroupLayout(bindingGroupLayoutPosition);
            }

            entries.push({
                binding: uniform.binding ?? 0,
                resource: uniform.value!.resource!,
            });
        }

        if (this.bindGroup && !needsRebind) return this.bindGroup!;

        this.bindGroup = gpuDevice.createBindGroup({
            label: 'UniformGroup ' + bindingGroupLayoutPosition,
            layout: this.pipelineBindGroupLayout!,
            entries: entries
        });

        return this.bindGroup!;
    }
}

export { UniformGroup };