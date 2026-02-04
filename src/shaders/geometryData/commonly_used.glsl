uniform sampler2D iChannel2;
float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(in vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    vec2 uv = (p.xy + vec2(37.0, 17.0) * p.z) + f.xy;
    vec2 rg = textureLod(iChannel2, (uv + 0.5) / 256.0, 0.0).yx;
    return mix(rg.x, rg.y, f.z);
}

float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return -1.0 + 2.0 * mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fnoise(vec3 p, in float t) {
    p *= .25;
    float f;

    f = 0.5000 * noise(p);
    p = p * 3.02;
    p.y -= t * .1; //t*.05 speed cloud changes
    f += 0.2500 * noise(p);
    p = p * 3.03;
    p.y += t * .06;
    f += 0.1250 * noise(p);
    p = p * 3.01;
    f += 0.0625 * noise(p);
    p = p * 3.03;
    f += 0.03125 * noise(p);
    p = p * 3.02;
    f += 0.015625 * noise(p);
    return f;
}

float fbm(vec3 p) {
    mat3 m = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
    float f;
    f = 0.5000 * noise(p);
    p = m * p * 2.02;
    f += 0.2500 * noise(p);
    p = m * p * 2.03;
    f += 0.1250 * noise(p);
    return f;
}