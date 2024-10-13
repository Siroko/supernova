export const shaderCode = /* wgsl */`

@group(0) @binding(0)
var<storage, read_write> output: array<f32>;

@compute @workgroup_size(64)
fn main(
  @builtin(global_invocation_id)
  global_id : vec3<u32>,
) {
    var value: f32 = output[global_id.x];
    value += 1.0;

    output[global_id.x] = value;
}
`;