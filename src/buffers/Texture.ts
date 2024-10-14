import { IBindable } from "./IBindable";

class Texture implements IBindable {
    public initialized: boolean = false;
    public magFilter: GPUFilterMode = 'linear';
    public minFilter: GPUFilterMode = 'linear';
    public uuid: string;
    type: string = 'texture';
    public needsUpdate: boolean = false;
    private texture?: GPUTexture;

    constructor(
        private imageBitmap: ImageBitmap
    ) {
        this.uuid = crypto.randomUUID();
    }

    public update(gpuDevice: GPUDevice): void {
        console.log('updating Texture', gpuDevice);
    }

    public initialize(gpuDevice: GPUDevice): Promise<void> {
        this.texture = this.webGPUTextureFromImageBitmapOrCanvas(gpuDevice, this.imageBitmap);
        this.initialized = true;

        return Promise.resolve();
    }

    get resource(): GPUBindingResource {
        return this.texture!.createView();
    }

    private webGPUTextureFromImageBitmapOrCanvas(gpuDevice: GPUDevice, source: ImageBitmap | HTMLCanvasElement) {
        const textureDescriptor: GPUTextureDescriptor = {
            size: { width: source.width, height: source.height },
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        };
        const texture = gpuDevice.createTexture(textureDescriptor);

        gpuDevice.queue.copyExternalImageToTexture({ source }, { texture }, textureDescriptor.size);

        return texture;
    }
}

export { Texture }