// https://iquilezles.org/articles/boxfunctions
vec2 ray_marching_intersectBox(in vec3 ro, in vec3 rd, in vec3 rad) {
    vec3 m = 1.0 / rd;
    vec3 n = m * ro;
    vec3 k = abs(m) * rad;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    return vec2(max(max(t1.x, t1.y), t1.z), min(min(t2.x, t2.y), t2.z));
}

bool ray_marching_intersectBox(in vec3 ro, in vec3 rd, in vec3 rad, out vec3 target) {
    vec2 t = ray_marching_intersectBox(ro, rd, rad);
    if(t.y >= 0. && t.x >= 0.) {
        target = rd * t.x + ro;
        return true;
    }
    return false;
}

//射线与球体相交, x 到球体最近的距离， y 穿过球体的距离
//原理是将射线方程(x = o + dl)带入球面方程求解(|x - c|^2 = r^2)
vec2 raySphereDst(vec3 sphereCenter, float sphereRadius, vec3 rayOrigin, vec3 rayDir) {
    vec3 oc = rayOrigin - sphereCenter;
    float b = dot(rayDir, oc);
    float c = dot(oc, oc) - sphereRadius * sphereRadius;
    float t = b * b - c; // t > 0有两个交点, = 0 相切， < 0 不相交

    float delta = sqrt(max(t, 0.0));
    float dstToSphere = max(-b - delta, 0.0);
    float dstInSphere = max(-b + delta - dstToSphere, 0.0);
    return vec2(dstToSphere, dstInSphere);
}

	/*
		计算相机发出的射线与云层范围的相交情况
		返回值：
			dstToCloudLayer  到云层的最近距离
			dstInCloudLayer  在云层中穿过的距离
	*/
vec2 rayCloudLayerDst(vec3 earthCenter,vec3 rayOrigin, vec3 rayDir,  float earthRadius, vec2 cloudRange) {

    vec2 cloudDstMin = raySphereDst(earthCenter, cloudRange.x + earthRadius, rayOrigin, rayDir);
    vec2 cloudDstMax = raySphereDst(earthCenter, cloudRange.y + earthRadius, rayOrigin, rayDir);

		// 射线到云层的最近距离
    float dstToCloudLayer = 0.0;
		// 射线穿过云层的距离
    float dstInCloudLayer = 0.0;
    float d = distance(rayOrigin, earthCenter);
    // 在地表上
    if(d <= cloudRange.x + earthRadius) {
        vec3 startPos = rayOrigin + rayDir * cloudDstMin.y;
        if(wgs84_getHeight(startPos) >= 0.) {
            dstToCloudLayer = cloudDstMin.y;
            dstInCloudLayer = cloudDstMax.y - cloudDstMin.y;
        }
        return vec2(dstToCloudLayer, dstInCloudLayer);
    }

		// 在云层内
    else if(d > cloudRange.x + earthRadius && d <= cloudRange.y + earthRadius) {
        dstToCloudLayer = 0.;
        dstInCloudLayer = cloudDstMin.y > 0. ? cloudDstMin.x : cloudDstMax.y;
        return vec2(dstToCloudLayer, dstInCloudLayer);
    }

		// 在云层外
    else {
        dstToCloudLayer = cloudDstMax.x;
        dstInCloudLayer = cloudDstMin.y > 0. ? cloudDstMin.x - dstToCloudLayer : cloudDstMax.y;
    }
    return vec2(dstToCloudLayer, dstInCloudLayer);
}