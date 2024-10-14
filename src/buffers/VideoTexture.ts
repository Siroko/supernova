import { IBindable } from "./IBindable";

class VideoTexture implements IBindable {
    type: string = 'external-texture';
    private gpuDevice?: GPUDevice;
    public initialized: boolean = false;
    public needsUpdate: boolean = false;
    public uuid: string;

    constructor(
        private videoElement: HTMLVideoElement
    ) {
        this.uuid = crypto.randomUUID();
    }

    public update(gpuDevice: GPUDevice): void {
        console.log('updating VideoTexture', gpuDevice);
    }

    get resource(): GPUBindingResource {
        return this.gpuDevice!.importExternalTexture({ source: this.videoElement! });
    }
    async initialize(gpuDevice: GPUDevice): Promise<void> {
        this.gpuDevice = gpuDevice;
        this.initialized = true;
    }

}

export { VideoTexture };