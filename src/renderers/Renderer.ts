import { Camera } from "../cameras/Camera";
import { Compute } from "../materials/Compute";
import { Mesh } from "../objects/Mesh";
import { Object3D } from "../objects/Object3D";
import { Scene } from "../objects/Scene";

export interface RendererOptions {
    antialias?: boolean;
    premultipliedAlpha?: boolean;
    alphaMode?: GPUCanvasAlphaMode;
}

class Renderer {
    public domElement: HTMLCanvasElement;
    public context: GPUCanvasContext | null;
    private device?: GPUDevice;
    private presentationFormat?: GPUTextureFormat;

    constructor(
        private options: RendererOptions
    ) {
        this.domElement = document.createElement('canvas');
        this.context = this.domElement.getContext('webgpu');
        if (!this.context || navigator.gpu == null) {
            throw new Error('WebGPU is not supported');
        }
    }

    private async getDevice(): Promise<GPUDevice | void> {
        const adapter = await navigator.gpu.requestAdapter()
        if (adapter == null) {
            console.error("No adapter found");
            return
        }

        const device = await adapter!.requestDevice();
        return new Promise<GPUDevice>(resolve => resolve(device));
    }

    public async initialize(): Promise<void> {
        if (!this.device) {
            const device = await this.getDevice();
            if (!this.device) {
                this.device = (device as GPUDevice);
                this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();
                this.context?.configure({
                    device: this.device,
                    format: this.presentationFormat,
                    alphaMode: this.options?.alphaMode || "opaque",
                });
            }
        }
        return Promise.resolve();
    }

    public setSize(width: number, height: number) {
        this.domElement.width = width;
        this.domElement.height = height;
    }

    public render(scene: Scene, camera: Camera) {
        for (const child of scene.children) {
            this.renderObject(child, camera);
        }
    }

    private async renderObject(object: Object3D, camera: Camera) {
        camera.isMesh = false;
        if (object.isMesh) {
            const commandRenderEncoder = this.device!.createCommandEncoder();
            const textureView = this.context!.getCurrentTexture().createView();

            const renderPassDescriptor = {
                colorAttachments: [
                    {
                        view: textureView,
                        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                        loadOp: 'clear',
                        storeOp: 'store',
                    },
                ],
            };

            const mesh = object as Mesh;
            if (!mesh.geometry.initialized) {
                mesh.geometry.createVertexBuffer(this.device!);
            }
            if (!mesh.material.initialized) {
                await mesh.material.initialize(this.device!, mesh.geometry.vertexBuffersDescriptors, this.presentationFormat!);
            }

            const bindGroup = await mesh.material.getBindGroup(this.device!, 0);

            const passRenderEncoder = commandRenderEncoder!.beginRenderPass(renderPassDescriptor as GPURenderPassDescriptor);
            passRenderEncoder.setPipeline(mesh.material.pipeline!);
            passRenderEncoder.setVertexBuffer(0, mesh.geometry.vertexBuffer!);

            passRenderEncoder!.setBindGroup(0, bindGroup);
            passRenderEncoder!.draw(3);
            passRenderEncoder!.end();

            this.device!.queue.submit([commandRenderEncoder!.finish()]);
        }

        // Render children
        if (object.children.length > 0) {
            for (const child of object.children) {
                this.renderObject(child, camera);
            }
        }
    }

    public async compute(compute: Compute, workgroupsX: number = 64, workgroupsY: number = 1, workgroupsZ: number = 1): Promise<void> {
        const commandEncoder = this.device!.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        if (!compute.initialized) await compute.initialize(this.device!);
        const bindGroup = await compute.getBindGroup(this.device!, 0);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.setPipeline(compute.pipeline!);
        passEncoder.dispatchWorkgroups(workgroupsX, workgroupsY, workgroupsZ);
        passEncoder.end();
        const commands = commandEncoder.finish();
        this.device!.queue.submit([commands]);

        return Promise.resolve();
    }
}

export { Renderer };
