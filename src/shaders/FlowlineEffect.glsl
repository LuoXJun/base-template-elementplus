uniform vec4 color;
uniform float speed;
uniform float glowPower;
uniform float lineCount;

czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;

    // 将整个线条分成多个小段
    float segment = st.s * lineCount;
    float segmentFraction = fract(segment);
    int segmentIndex = int(floor(segment));

    // 每个小段有独立的流动时间
    float segmentTime = fract(czm_frameNumber / 120.0 * speed + float(segmentIndex) * 0.3);

    // 每个小段内的流动效果
    float flow = fract(segmentFraction + (1.0 - segmentTime));

    // 计算辉光效果
    float glow = 0.0;

    // 方式B：脉冲式流动效果（可选）
    glow = exp(-10.0 * abs(flow - 0.5)) * 1.5;

    material.diffuse = color.rgb;
    material.alpha = color.a * (0.2 + glow * glowPower);
    material.emission = color.rgb * glow * glowPower;

    return material;
}