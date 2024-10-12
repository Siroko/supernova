export interface IBindable {
    type?: string;
    initialized: boolean;

    get resource(): GPUBindingResource;
    initialize(gpuDevice: GPUDevice): void;

}