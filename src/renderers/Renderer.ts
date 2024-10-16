import { ComputeBuffer } from "../buffers/ComputeBuffer";
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
    private depthTexture?: GPUTexture;

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

                this.depthTexture = this.device.createTexture({
                    size: [this.domElement.width, this.domElement.height],
                    format: 'depth24plus',
                    usage: GPUTextureUsage.RENDER_ATTACHMENT,
                });
            }
        }
        return Promise.resolve();
    }

    public setSize(width: number, height: number) {
        this.domElement.width = width;
        this.domElement.height = height;

        this.depthTexture?.destroy();
        this.depthTexture = this.device!.createTexture({
            size: [this.domElement.width, this.domElement.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }

    public async render(scene: Scene, camera: Camera) {
        camera.updateViewMatrix();

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
            depthStencilAttachment: {
                view: this.depthTexture!.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        } as GPURenderPassDescriptor;
        const passRenderEncoder = commandRenderEncoder!.beginRenderPass(renderPassDescriptor);

        for (const child of scene.children) {
            this.renderObject(child, camera, passRenderEncoder);
        }
        passRenderEncoder!.end();
        this.device!.queue.submit([commandRenderEncoder!.finish()]);
    }

    private renderObject(object: Object3D, camera: Camera, passRenderEncoder: GPURenderPassEncoder) {

        if (object.isMesh) {
            const mesh = object as Mesh;
            if (!mesh.geometry.initialized) {
                mesh.geometry.initialize(this.device!);
            }
            if (!mesh.material.initialized) {
                mesh.material.initialize(this.device!, mesh.geometry.vertexBuffersDescriptors, this.presentationFormat!);
            }

            passRenderEncoder.setPipeline(mesh.material.pipeline!);
            passRenderEncoder.setVertexBuffer(0, mesh.geometry.vertexBuffer!);
            passRenderEncoder.setIndexBuffer(mesh.geometry.indexBuffer!, 'uint16');

            mesh.updateModelMatrix();
            // The bind group will always be 0 because the material is the first thing to be initialized
            const materialBindGroup = mesh.material.getBindGroup(this.device!);
            // The bind group will always be 1 because the mesh is the second thing to be initialized
            const meshBindGroup = mesh.getBindGroup(this.device!, mesh.material.pipeline!, 1);
            // The bind group will always be 2 because the camera is the third thing to be initialized
            const cameraBindGroup = camera.getBindGroup(this.device!, mesh.material.pipeline!, 2);

            passRenderEncoder!.setBindGroup(0, materialBindGroup);
            passRenderEncoder!.setBindGroup(1, meshBindGroup);
            passRenderEncoder!.setBindGroup(2, cameraBindGroup);

            passRenderEncoder!.drawIndexed(mesh.geometry.vertexCount);
        }

        // Render children
        if (object.children.length > 0) {
            for (const child of object.children) {
                this.renderObject(child, camera, passRenderEncoder);
            }
        }

        // return Promise.resolve();
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

    public async readBackBuffer<T extends Float32Array | Uint32Array | Int32Array>(
        buffer: ComputeBuffer,
        ArrayType: new (buffer: ArrayBuffer) => T
    ): Promise<T> {
        const stagingBuffer = this.device!.createBuffer({
            size: buffer.resource.buffer!.size,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });

        const commandEncoder = this.device!.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(
            buffer.resource.buffer,
            0, // Source offset
            stagingBuffer,
            0, // Destination offset
            buffer.resource.buffer!.size
        );

        this.device!.queue.submit([commandEncoder.finish()]);

        await stagingBuffer.mapAsync(
            GPUMapMode.READ,
            0, // Offset
            buffer.resource.buffer!.size // Length
        );
        const copyArrayBuffer = stagingBuffer.getMappedRange(0, buffer.resource.buffer!.size);
        const data = new ArrayType(copyArrayBuffer.slice(0));
        stagingBuffer.unmap();

        return data;
    }
}

export { Renderer };
