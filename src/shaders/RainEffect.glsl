uniform sampler2D colorTexture;
in vec2 v_textureCoordinates;
uniform float tiltAngle;
uniform float rainSize;
uniform float rainSpeed;
uniform float rainDensity;

float hash(float x) {
    return fract(sin(x * 133.3) * 13.13);
}
void main(void) {
    float iTime = czm_frameNumber / 120. * rainSpeed;
    float _density = 30. - clamp(rainDensity * 0.8, 0.09, 0.8) * 28.;
    vec2 uv = gl_FragCoord.xy * 0.99;
    float col = .6 - _density * fract((uv.x * .2 + uv.y * rainSize / 100.) * fract(uv.x * .91) + iTime) * 1.5;
    vec4 o = vec4(col, col, col, 1.0);
    if(col < 0.01) {
        o = vec4(0, 0, 0, 1.0);
    }
    out_FragColor = mix(texture(colorTexture, v_textureCoordinates), o, 0.5);
}