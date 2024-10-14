import { IBindable } from "./IBindable";

class Sampler implements IBindable {
    sampler?: GPUBindingResource | undefined;
    type: string = 'sampler';
    initialized: boolean = false;
    needsUpdate: boolean = false;
    uuid: string;

    constructor(
        private magFilter: GPUFilterMode,
        private minFilter: GPUFilterMode,
        private repeatMode: GPUAddressMode = 'repeat'
    ) {
        this.uuid = crypto.randomUUID();
    }

    public update(gpuDevice: GPUDevice): void {
        console.log('updating Sampler', gpuDevice);
    }

    public initialize(gpuDevice: GPUDevice): void {
        const sampler = gpuDevice.createSampler({
            magFilter: this.magFilter,
            minFilter: this.minFilter,
            addressModeU: this.repeatMode,
            addressModeV: this.repeatMode,
        });

        this.sampler = sampler;
        this.initialized = true;
    }

    get resource(): GPUBindingResource {
        return this.sampler!;
    }
}

export { Sampler };