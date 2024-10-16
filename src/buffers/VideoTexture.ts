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

    async update(): Promise<void> {
    }

    get resource(): GPUBindingResource {
        const res = this.gpuDevice!.importExternalTexture({ source: this.videoElement! });
        res.label = 'VideoTexture ' + this.uuid;
        return res;
    }
    async initialize(gpuDevice: GPUDevice): Promise<void> {
        this.gpuDevice = gpuDevice;
        this.initialized = true;
    }

}

export { VideoTexture };