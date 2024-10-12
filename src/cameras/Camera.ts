import { mat4 } from "gl-matrix";
import { Object3D } from "../objects/Object3D";

class Camera extends Object3D {
    public viewMatrix: mat4;
    public projectionMatrix: mat4;

    constructor(
        public fov: number = 75,
        public near: number = 0.1,
        public far: number = 100,
        public aspect: number = 1
    ) {
        super();
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.perspective(mat4.create(), this.fov, this.aspect, this.near, this.far);
    }
}

export { Camera }