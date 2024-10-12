import { IBindable } from "./IBindable";

class VideoTexture implements IBindable {
    type: string = 'external-texture';
    private gpuDevice?: GPUDevice;
    public initialized: boolean = false;


    constructor(
        private videoElement: HTMLVideoElement
    ) { }

    get resource(): GPUBindingResource {
        return this.gpuDevice!.importExternalTexture({ source: this.videoElement! });
    }
    async initialize(gpuDevice: GPUDevice): Promise<void> {
        this.gpuDevice = gpuDevice;
        this.initialized = true;
    }

}

export { VideoTexture };