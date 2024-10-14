import { Geometry } from "../buffers/Geometry";
import { Vector4 } from "../buffers/Vector4";

class BoxGeometry extends Geometry {
    // buffers

    private _indices: number[] = [];
    private _vertices: number[] = [];
    private _normals: number[] = [];
    private _uvs: number[] = [];

    // helper variables

    private numberOfVertices: number = 0;

    public vertexCount: number = 0;

    constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {

        super();

        // segments

        widthSegments = Math.floor(widthSegments);
        heightSegments = Math.floor(heightSegments);
        depthSegments = Math.floor(depthSegments);



        // build each side of the box geometry

        this.buildPlane(2, 1, 0, - 1, - 1, depth, height, width, depthSegments, heightSegments); // px
        this.buildPlane(2, 1, 0, 1, - 1, depth, height, - width, depthSegments, heightSegments); // nx
        this.buildPlane(0, 2, 1, 1, 1, width, depth, height, widthSegments, depthSegments); // py
        this.buildPlane(0, 2, 1, 1, - 1, width, depth, - height, widthSegments, depthSegments); // ny
        this.buildPlane(0, 1, 2, 1, - 1, width, height, depth, widthSegments, heightSegments); // pz
        this.buildPlane(0, 1, 2, - 1, - 1, width, height, - depth, widthSegments, heightSegments); // nz

        this.vertexCount = this._indices.length;

        this.vertices = new Float32Array(this._vertices);
        this.normals = new Float32Array(this._normals);
        this.uvs = new Float32Array(this._uvs);
        this.indices = new Uint16Array(this._indices);

        console.log(this.indices.length);
        console.log(this.vertices.length / 4);
        console.log(this.vertexCount);
    }

    private buildPlane(u: number, v: number, w: number, udir: number, vdir: number, width: number, height: number, depth: number, gridX: number, gridY: number) {

        const segmentWidth = width / gridX;
        const segmentHeight = height / gridY;

        const widthHalf = width / 2;
        const heightHalf = height / 2;
        const depthHalf = depth / 2;

        const gridX1 = gridX + 1;
        const gridY1 = gridY + 1;

        let vertexCounter = 0;

        const vector = new Vector4();

        // generate vertices, normals and uvs

        for (let iy = 0; iy < gridY1; iy++) {

            const y = iy * segmentHeight - heightHalf;

            for (let ix = 0; ix < gridX1; ix++) {

                const x = ix * segmentWidth - widthHalf;

                // Use type assertions to avoid errors
                vector.setComponent(u, x * udir);
                vector.setComponent(v, y * vdir);
                vector.setComponent(w, depthHalf);

                // now apply vector to vertex buffer

                this._vertices.push(vector.x, vector.y, vector.z, 1);

                // set values to correct vector component
                vector.setComponent(u, 0);
                vector.setComponent(v, 0);
                vector.setComponent(w, depth > 0 ? 1 : -1);

                // now apply vector to normal buffer
                this._normals.push(vector.x, vector.y, vector.z);

                // uvs

                this._uvs.push(ix / gridX);
                this._uvs.push(1 - (iy / gridY));

                // counters

                vertexCounter += 1;

            }

        }

        // indices

        // 1. you need three indices to draw a single face
        // 2. a single segment consists of two faces
        // 3. so we need to generate six (2*3) indices per segment

        for (let iy = 0; iy < gridY; iy++) {

            for (let ix = 0; ix < gridX; ix++) {

                const a = this.numberOfVertices + ix + gridX1 * iy;
                const b = this.numberOfVertices + ix + gridX1 * (iy + 1);
                const c = this.numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                const d = this.numberOfVertices + (ix + 1) + gridX1 * iy;

                // faces

                this._indices.push(a, b, d);
                this._indices.push(b, c, d);
            }

        }

        this.numberOfVertices += vertexCounter;
    }
}

export { BoxGeometry };
