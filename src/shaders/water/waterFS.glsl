in vec2 v_st;

void main() {
    light = vec3(-0., .0, 2.8); // position of the sun
    vec2 uv = v_st;

    float deepwater_fadedepth = 0.5 + coast2water_fadedepth;

    float height = height_map(uv);
    vec3 col;

    float waveheight = clamp(WATER_LEVEL * 3. - 1.5, 0., 1.);
    float level = WATER_LEVEL + .2 * water_map(uv * 15. + vec2(iTime * .1), waveheight);
    if(height <= level) {
        vec2 dif = vec2(.0, .01);
        vec2 pos = uv * 15. + vec2(iTime * .01);
        float h1 = water_map(pos - dif, waveheight);
        float h2 = water_map(pos + dif, waveheight);
        float h3 = water_map(pos - dif.yx, waveheight);
        float h4 = water_map(pos + dif.yx, waveheight);
        vec3 normwater = normalize(vec3(h3 - h4, h1 - h2, .125)); // norm-vector of the 'bumpy' water-plane
        uv += normwater.xy * .002 * (level - height);

        col = vec3(1.0);

        float coastfade = clamp((level - height) / coast2water_fadedepth, 0., 1.);
        float coastfade2 = clamp((level - height) / deepwater_fadedepth, 0., 1.);
        float intensity = col.r * .2126 + col.g * .7152 + col.b * .0722;
        watercolor = mix(watercolor * intensity, watercolor2, smoothstep(0., 1., coastfade2));

        vec3 r0 = vec3(uv, WATER_LEVEL);
        vec3 rd = normalize(light - r0); // ray-direction to the light from water-position
        float grad = dot(normwater, rd); // dot-product of norm-vector and light-direction
        float specular = pow(grad, water_softlight_fact);  // used for soft highlights                          
        float specular2 = pow(grad, water_glossylight_fact); // used for glossy highlights
        float gradpos = dot(vec3(0., 0., 1.), rd);
        float specular1 = smoothstep(0., 1., pow(gradpos, 5.));  // used for diffusity (some darker corona around light's specular reflections...)                          
        float watershade = test_shadow(uv, level);
        watercolor *= 2.2 + watershade;
        watercolor += (.2 + .8 * watershade) * ((grad - 1.0) * .5 + specular) * .25;
        watercolor /= (1. + specular1 * 1.25);
        watercolor += watershade * specular2 * water_specularcolor;
        watercolor += watershade * coastfade * (1. - coastfade2) * (vec3(.5, .6, .7) * nautic(uv) + vec3(1., 1., 1.) * particles(uv));

        col = mix(col, watercolor, coastfade);

        float alpha = clamp(coastfade, 0.1, 0.6);
        out_FragColor = vec4(col, 1.0);
        return;
    }
}