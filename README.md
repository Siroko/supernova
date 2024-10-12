# Supernova

An open-source 3D engine for WebGPU.

## Features

- WebGPU-based rendering
- Modular architecture
- 3D primitives and custom geometries
- Material system with shader customization
- Texture and video texture support
- Scene graph management
- Camera controls

## Installation

```bash
npm install @siroko/supernova
```

## Basic Usage

```javascript
import {
  Renderer,
  Scene,
  Camera,
  Mesh,
  Geometry,
  Material,
} from '@siroko/supernova';

const renderer = new Renderer();
await renderer.initialize();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new Scene();
const camera = new Camera();

const geometry = new Geometry();
const material = new Material(shaderCode);
const mesh = new Mesh(geometry, material);
scene.add(mesh);

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
```

## Core Components

- **Renderer**: Handles WebGPU rendering
- **Scene**: Manages the 3D scene graph
- **Camera**: Defines view and projection
- **Mesh**: Combines geometry and material
- **Geometry**: Defines vertex data
- **Material**: Manages shaders and uniforms
- **Texture**: Handles 2D textures
- **VideoTexture**: Supports video textures
- **Vector4**: Represents 4D vectors
- **TextureLoader**: Loads textures from URLs

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run build`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License
