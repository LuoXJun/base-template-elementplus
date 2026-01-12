precision highp float;
const float EPSILON12 = .000000000001;

#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
in vec2 v_textureCoordinates;
uniform sampler2D colorTexture;
uniform sampler2D depthTexture;
uniform float splitX;
uniform float snowThickness;
uniform float snowSpeed;
uniform vec2 uvBias;
uniform float maxDistance;
uniform bool showParticles;
uniform bool showCover;
uniform bool coverSky;
uniform float snowDensity;
uniform float skyCoverage;
uniform float snowSize;
uniform float styleType;

const float f_Snow_Coverage_Max_Rate = 5.0;

float WIDTH = 0.5;

float vmax(vec3 a) {
    return max(max(a.x, a.y), a.z);
}
float vmin(vec3 a) {
    return min(min(a.x, a.y), a.z);
}

vec3 rgb2hsv(vec3 rgb) //convert rgb to hsv color space
{
    float c_max = vmax(rgb);
    float c_min = vmin(rgb);
    vec3 hsv = vec3(0, c_max > 0. ? 1. - c_min / c_max : 0.0, c_max);

    if(c_max == c_min) {
        hsv.x = 6.0;
    } else if(c_max == rgb.r) {
        hsv.x = 0.0 + (rgb.g - rgb.b) / (c_max - c_min);
    } else if(c_max == rgb.g) {
        hsv.x = 2.0 + (rgb.b - rgb.r) / (c_max - c_min);
    } else if(c_max == rgb.b) {
        hsv.x = 4.0 + (rgb.r - rgb.g) / (c_max - c_min);
    }
    hsv.x = fract(hsv.x / 6.0);
    hsv = clamp(hsv, 0.0, 1.0);
    return hsv;
}

vec3 iMouse3 = vec3(0.44375, 0.3778, -0.15625);
float wdistance(vec3 p) {
    return length(fract(p + iMouse3) - 0.5);
}

vec3 ToWhite(vec3 color, float fCoverage_Rate, float radio) {
    vec3 hsv = rgb2hsv(color);
    return mix(vec3(0.9, 0.9, 0.95) * radio, color, smoothstep(0.0, fCoverage_Rate, length(vec3(0.0, 0.933, 0.933) * wdistance(hsv))));
}

const float cHashM = 43758.54;

vec2 Hashv2v2(vec2 p) {
    vec2 cHashVA2 = vec2(37., 39.);
    return fract(sin(vec2(dot(p, cHashVA2), dot(p + vec2(1., 0.), cHashVA2))) * cHashM);
}

float Noisefv2(vec2 p) {
    vec2 t, ip, fp;
    ip = floor(p);
    fp = fract(p);
    fp = fp * fp * (3. - 2. * fp);
    t = mix(Hashv2v2(ip), Hashv2v2(ip + vec2(0., 1.)), fp.y);
    return mix(t.x, t.y, fp.x);
}

float Fbmn(vec3 p, vec3 n) {
    vec3 s;
    float a;
    s = vec3(0.);
    a = 1.;
    for(int j = 0; j < 5; j++) {
        s += a * vec3(Noisefv2(p.yz), Noisefv2(p.zx), Noisefv2(p.xy));
        a *= 0.5;
        p *= 2.;
    }
    return dot(s, abs(n));
}

vec3 VaryNf(vec3 p, vec3 n, float f) {
    vec3 g;
    vec2 e = vec2(0.1, 0.);
    g = vec3(Fbmn(p + e.xyy, n), Fbmn(p + e.yxy, n), Fbmn(p + e.yyx, n)) - Fbmn(p, n);
    return normalize(n + f * (g - n * dot(n, g)));
}

float VaryFaction(in vec3 positionWC, in vec3 normalWC) {
    // vec3 vn = VaryNf(40.0 * vec3(uv.x, 1.0, uv.y), vec3(0.0, 1.0, 0.0), 4.0);
    vec3 vn = normalWC;//VaryNf(40.0 * positionWC, normalWC, 4.0);
    vec3 sunDir = czm_sunDirectionWC;
    return (0.2 + 0.2 * max(dot(normalize(-sunDir.xz), vn.xz), 0.0) + 0.1 * max(vn.y, 0.0) + 0.8 * max(dot(vn, sunDir), 0.0));
}

vec3 getSnowCoverColor(in vec3 baseColor, in float snowCoverage, in vec3 positionWC, in vec3 normalWC) {
    float radio = VaryFaction(positionWC, normalWC);
    vec3 snowColor = ToWhite(baseColor.rgb, f_Snow_Coverage_Max_Rate * snowCoverage, 1.);
    return snowColor;
}

/* 雪花 */
// Point to polar coord
vec2 p_to_pc(vec2 p) {
    return vec2(atan(p.y, p.x), length(p));
}

// Polar coord to point
vec2 pc_to_p(vec2 pc) {
    return vec2(pc.y * cos(pc.x), pc.y * sin(pc.x));
}

// I use these fields to create and tweak the snowflakes
vec2 fieldA(vec2 pc) {
    // Modify angle and distance
    pc.y += 0.02 * floor(cos(pc.x * 6.0) * 5.0);
    pc.y += 0.01 * floor(10.0 * cos(pc.x * 30.0));
    pc.y += 0.5 * cos(pc.y * 10.0);

    // Take back to position
    return pc;
}
// Different values of f happen to give quite different
// snowflake shapes. Interesting...
vec2 fieldB(vec2 pc, float f) {
    // Modify angle and distance
    pc.y += 0.1 * cos(pc.y * 100.0 + 10.0);
    pc.y += 0.1 * cos(pc.y * 20.0 + f);
    pc.y += 0.04 * cos(pc.y * 10.0 + 10.0);

    return pc;
}
float snow_flake(vec2 p, float f) {

    vec2 pc = p_to_pc(p * 16.0);

    pc = fieldA(fieldB(pc, f));

    p = pc_to_p(pc);

    float d = length(p);

    return step(0.3, d);
}

vec3 getSnowColor(in vec3 color, in float iTime, in float snowDensity, in float snowOpacity) {

    vec2 fragCoord = gl_FragCoord.xy;
    vec2 iResolution = czm_viewport.zw;

    vec2 uv = fragCoord / iResolution.xy;
    vec3 baseColor = color;
    float LAYERS = snowDensity * 100.0;

    // snowy 
    const mat3 p = mat3(13.323122, 23.5112, 21.71123, 21.1212, 28.7312, 11.9312, 21.8112, 14.7212, 61.3934);
    uv = vec2(uv.x * 2. + iTime * 0.01, uv.y);
    vec3 acc = vec3(0.0);
    float d;

    for(float i = 0.; i < 100.; i += 1.0) {
        if(i >= LAYERS)
            break;
        if(uv.y < i / LAYERS)
            continue;
        float fi = float(i + 5.0);
        vec2 q = uv * (1.0 + fi * snowSize);
        q += vec2(q.y * (WIDTH * mod(fi * 7.238917, 1.) - WIDTH * .5), iTime / (1. + fi * snowSize * .03));
        vec3 n = vec3(floor(q), 31.189 + fi);
        vec3 m = floor(n) * .00001 + fract(n);
        vec3 mp = (31415.9 + m) / fract(p * m);
        vec3 r = fract(mp);
        vec2 s = abs(mod(q, 1.) - .5 + .9 * r.xy - .45);
        s += .01 * abs(2. * fract(10. * q.yx) - 1.);
        if(styleType == 0.) {
            d = .1 * max(s.x - s.y, s.x + s.y) + max(s.x, s.y) - .01;
        } else {
            d = snow_flake(s, i);
        }
        float edge = 0.005 + 0.05 * min(.5 * abs(fi - 5. - sin(iTime * 0.01)), 1.);
        acc += vec3(smoothstep(edge, -edge, d) * (r.x / (1. + .02 * fi * snowSize)));

    }
    baseColor.rgb = mix(baseColor.rgb, vec3(1.0), acc.x * 4.0 * snowOpacity);

    // Output to screen
    return baseColor;
}////

const highp float longR = 6378137.;
const highp float shortR = 6356752.3142451793;
const highp vec3 wgs84RadiiSquared = vec3(longR * longR, longR * longR, shortR * shortR);
const highp float radiansPerDegree = .017453292519943295;
const highp vec3 oneOverRadii = vec3(1.0 / longR, 1.0 / longR, 1.0 / shortR);
const highp vec3 oneOverRadiiSquared = vec3(1.0 / (longR * longR), 1.0 / (longR * longR), 1.0 / (shortR * shortR));
const highp float centerToleranceSquared = 0.1;

vec3 wgs84_scaleToGeodeticSurface(
    highp vec3 cartesian,
    highp vec3 oneOverRadii,
    highp vec3 oneOverRadiiSquared,
    highp float centerToleranceSquared
) {

    float positionX = cartesian.x;
    float positionY = cartesian.y;
    float positionZ = cartesian.z;

    float oneOverRadiiX = oneOverRadii.x;
    float oneOverRadiiY = oneOverRadii.y;
    float oneOverRadiiZ = oneOverRadii.z;

    float x2 = positionX * positionX * oneOverRadiiX * oneOverRadiiX;
    float y2 = positionY * positionY * oneOverRadiiY * oneOverRadiiY;
    float z2 = positionZ * positionZ * oneOverRadiiZ * oneOverRadiiZ;

    // Compute the squared ellipsoid norm.
    float squaredNorm = x2 + y2 + z2;
    float ratio = sqrt(1. / squaredNorm);

    // As an initial approximation, assume that the radial intersection is the projection point.
    vec3 intersection = cartesian * ratio;

    // If the position is near the center, the iteration will not converge.
    if(squaredNorm < centerToleranceSquared) {
        //if(isfinite(ratio)){
        //  return intersection;
        //}
        return intersection;
    }

    float oneOverRadiiSquaredX = oneOverRadiiSquared.x;
    float oneOverRadiiSquaredY = oneOverRadiiSquared.y;
    float oneOverRadiiSquaredZ = oneOverRadiiSquared.z;

    // Use the gradient at the intersection point in place of the true unit normal.
    // The difference in magnitude will be absorbed in the multiplier.
    vec3 gradient;
    gradient.x = intersection.x * oneOverRadiiSquaredX * 2.;
    gradient.y = intersection.y * oneOverRadiiSquaredY * 2.;
    gradient.z = intersection.z * oneOverRadiiSquaredZ * 2.;

    // Compute the initial guess at the normal vector multiplier, lambda.
    float lambda = (1. - ratio) * length(cartesian) / (.5 * length(gradient));
    float correction = 0.;

    float func = EPSILON12 * 10.;
    float denominator;
    float xMultiplier;
    float yMultiplier;
    float zMultiplier;
    float xMultiplier2;
    float yMultiplier2;
    float zMultiplier2;
    float xMultiplier3;
    float yMultiplier3;
    float zMultiplier3;
    const int max_loop = 60;
    for(int i = 0; i < max_loop; i++) {
        if(abs(func) > EPSILON12) {
            lambda -= correction;

            xMultiplier = 1. / (1. + lambda * oneOverRadiiSquaredX);
            yMultiplier = 1. / (1. + lambda * oneOverRadiiSquaredY);
            zMultiplier = 1. / (1. + lambda * oneOverRadiiSquaredZ);

            xMultiplier2 = xMultiplier * xMultiplier;
            yMultiplier2 = yMultiplier * yMultiplier;
            zMultiplier2 = zMultiplier * zMultiplier;

            xMultiplier3 = xMultiplier2 * xMultiplier;
            yMultiplier3 = yMultiplier2 * yMultiplier;
            zMultiplier3 = zMultiplier2 * zMultiplier;

            func = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2 - 1.;

            // "denominator" here refers to the use of this expression in the velocity and acceleration
            // computations in the sections to follow.
            denominator = x2 * xMultiplier3 * oneOverRadiiSquaredX + y2 * yMultiplier3 * oneOverRadiiSquaredY + z2 * zMultiplier3 * oneOverRadiiSquaredZ;

            float derivative = -2. * denominator;

            correction = func / derivative;
        } else {
            break;
        }
    }

    return vec3(positionX * xMultiplier, positionY * yMultiplier, positionZ * zMultiplier);
}

vec3 wgs84_scaleToGeodeticSurface(in highp vec3 cartesian) {
    return wgs84_scaleToGeodeticSurface(cartesian, oneOverRadii, oneOverRadiiSquared, centerToleranceSquared);
}

/**
 * 获取大地表面法线
 */
vec3 wgs84_geodeticSurfaceNormal(vec3 cartesian) {
    return normalize(cartesian * oneOverRadiiSquared);
}

vec3 computeNormal(in vec3 a, in vec3 b, in vec3 c) {
    vec3 v0 = c - b;
    vec3 v1 = a - b;
    vec3 n = cross(v0, v1);
    float l = n.x * n.x + n.y * n.y + n.z * n.z;
    if(l > 0.) {
        return n * (1. / sqrt(l));
    }
    return vec3(0.);
}
vec3 getPositionEC(in vec2 fragCoord) {
    vec2 textureCoords = fragCoord.xy / czm_viewport.zw;
    vec4 depth4 = texture(depthTexture, textureCoords);
    float logDepthOrDepth = czm_unpackDepth(depth4);
    vec4 eyeCoordinate = czm_windowToEyeCoordinates(fragCoord, logDepthOrDepth);
    return eyeCoordinate.xyz / eyeCoordinate.w;
}
void getNormalEC(in vec2 fragCoord, out vec3 normalWC) {
    float delta = 1.;
    vec3 a = getPositionEC(fragCoord);//(0,0)
    vec3 b = getPositionEC(fragCoord + vec2(0., delta));//(0,1)
    vec3 c = getPositionEC(fragCoord + delta);//(1,1)
    vec3 d = getPositionEC(fragCoord + vec2(delta, 0.));//(1,0)
    vec3 n0 = computeNormal(c, b, a);
    vec3 n1 = computeNormal(d, c, a);
    normalWC = (n0 + n1) * 0.5;
}
vec3 getNormalEC(in vec2 fragCoord, in bool sample9) {
    float count = 0.;
    vec3 sum, n;
    if(sample9 == false) {
        getNormalEC(fragCoord, sum);
        count = 1.;
    } else {
        for(int i = -1; i <= 1; i++) {
            for(int j = -1; j <= 1; j++) {
                getNormalEC(fragCoord + vec2(i, j), n);
                sum += n;
                count += 1.;
            }
        }
    }
    return sum / count;
}
float wgs84_getHeight(in vec3 cartesian) {
    vec3 p = wgs84_scaleToGeodeticSurface(cartesian, oneOverRadii, oneOverRadiiSquared, centerToleranceSquared);
    vec3 h = cartesian - p;
    float height = sign(dot(h, cartesian)) * length(h);
    return height;
}

struct PostGeometryData {
    vec3 positionWC;//位置坐标（世界空间）
    vec3 positionEC;//位置坐标（相机空间）
    vec3 positionGC;//投影到椭球表面的位置坐标（世界空间）
    vec3 normalWC;//法线坐标（世界空间）
    vec3 normalEC;//法线坐标（相机空间）
    vec3 normalGC;//投影到椭球表面的法线坐标（世界空间）
    vec2 uv;//投影到椭球表面的纹理坐标
    float height;//海拔高度
    float depth;//深度
    bool isSky;//天空标记，true表示当前点为天空背景
};

PostGeometryData getGeometryData(in bool sample9) {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 textureCoords = v_textureCoordinates;
    PostGeometryData geometry;
    vec4 depth4 = texture(depthTexture, textureCoords);
    float depth = czm_unpackDepth(depth4);
    vec4 eyeCoordinate = czm_windowToEyeCoordinates(fragCoord, depth);
    vec4 worldCoordinate4 = czm_inverseView * eyeCoordinate;
    vec3 normalEC = getNormalEC(fragCoord, sample9);
    geometry.positionWC = worldCoordinate4.xyz / worldCoordinate4.w;
    geometry.positionEC = eyeCoordinate.xyz / eyeCoordinate.w;
    geometry.normalEC = normalEC;
    geometry.normalWC = czm_inverseNormal * normalEC;
    geometry.positionGC = wgs84_scaleToGeodeticSurface(geometry.positionWC);
    geometry.normalGC = wgs84_geodeticSurfaceNormal(geometry.positionGC);
    geometry.uv = czm_ellipsoidTextureCoordinates(geometry.normalGC);
    geometry.depth = depth;
    geometry.isSky = depth >= 1.;
    vec3 h = geometry.positionWC - geometry.positionGC;
    geometry.height = sign(dot(h, geometry.positionWC)) * length(h);
    return geometry;
}
PostGeometryData getGeometryData() {
    return getGeometryData(true);
}
PostGeometryData geometry;

vec2 computeAspectSlope(in vec3 positionWC, in vec3 normalWC, in vec3 ellipsoidNormal) {
    float northPoleZ = czm_ellipsoidRadii.z;
    vec3 northPolePositionWC = vec3(0.0, 0.0, northPoleZ);
    vec3 vectorEastWC = normalize(cross(northPolePositionWC - positionWC, ellipsoidNormal));
    float dotProd = abs(dot(ellipsoidNormal, normalWC));
    float slope = acos(dotProd);
    vec3 normalRejected = ellipsoidNormal * dotProd;
    vec3 normalProjected = normalWC - normalRejected;
    vec3 aspectVector = normalize(normalProjected);
    float aspect = acos(dot(aspectVector, vectorEastWC));
    float determ = dot(cross(vectorEastWC, aspectVector), ellipsoidNormal);
    aspect = czm_branchFreeTernary(determ < 0.0, 2.0 * czm_pi - aspect, aspect);
    return vec2(aspect, slope);
}

/**
计算坡向、坡度，返回值x为坡向、y为坡度，坡度范围0~pi/2。如果传入的position和normal是相机空间的坐标，则指定toEye为true。
*/
vec2 computeAspectSlope(in vec3 positionEC, in vec3 normalEC, in vec3 normalGC, in bool toEye) {
    if(toEye == false) {
        return computeAspectSlope(positionEC, normalEC, normalGC);
    }
    vec3 ellipsoidNormalEC = czm_normal * normalGC;
    float northPoleZ = czm_ellipsoidRadii.z;
    vec3 northPolePositionEC = czm_normal * vec3(0.0, 0.0, northPoleZ);
    vec3 vectorEastEC = normalize(cross(northPolePositionEC - positionEC, ellipsoidNormalEC));
    float dotProd = abs(dot(ellipsoidNormalEC, normalEC));
    float slope = acos(dotProd);
    vec3 normalRejected = ellipsoidNormalEC * dotProd;
    vec3 normalProjected = normalEC - normalRejected;
    vec3 aspectVector = normalize(normalProjected);
    float aspect = acos(dot(aspectVector, vectorEastEC));
    float determ = dot(cross(vectorEastEC, aspectVector), ellipsoidNormalEC);
    aspect = czm_branchFreeTernary(determ < 0.0, 2.0 * czm_pi - aspect, aspect);
    return vec2(aspect, slope);
}
vec2 computeAspectSlope(in PostGeometryData geometry, in bool toEye) {
    if(toEye == true) {
        return computeAspectSlope(geometry.positionEC, geometry.normalEC, geometry.normalGC, true);
    }
    return computeAspectSlope(geometry.positionWC, geometry.normalWC, geometry.normalGC);
}
/**
计算坡向、坡度，返回值x为坡向、y为坡度，坡度范围0~pi/2
*/
vec2 computeAspectSlope(in PostGeometryData geometry) {
    return computeAspectSlope(geometry.positionWC, geometry.normalWC, geometry.normalGC);
}

void main() {
    vec2 screenUV = v_textureCoordinates;//屏幕空间纹理坐标，左上角为(0.,0.)，右下角为(1.,1.)
    vec4 color = texture(colorTexture, screenUV);//获取上一个处理节点传入颜色
    geometry = getGeometryData();

    float x = splitX < 0. ? 1. - screenUV.x : screenUV.x;
    float maxX = abs(splitX);
    if(x <= maxX) {
        vec3 positionWC = geometry.positionWC;
        vec3 normalWC = geometry.normalWC;
        vec3 positionEC = geometry.positionEC;
        vec2 uv = geometry.uv + uvBias;
        bool isSky = geometry.isSky;

        float distanceToEye = length(positionEC);
        float fogScale = 1. - clamp(0.1 * distanceToEye / maxDistance, 0., 1.);
        float cameraHeight = wgs84_getHeight(czm_viewerPositionWC);
        float snowOpacity = 1. - abs(cameraHeight) / maxDistance;
        float time = snowSpeed * czm_frameNumber / 60.;

        if(showCover && isSky == false && snowThickness > 0.) {

            float slope = computeAspectSlope(geometry).y;
            slope = clamp(slope, 0.001, 1.);
            float snowScale = (1. - slope) * snowThickness;
            snowScale = clamp(snowScale, 0.1, 1.);
            float snowCoverage = snowScale * fogScale;
            if(snowCoverage > 0.) {
                color.rgb = getSnowCoverColor(color.rgb, snowCoverage, positionWC, normalWC);
            }
        } else if(isSky == true && coverSky == true && snowOpacity > 0.45) {
            color.rgb = getSnowCoverColor(color.rgb, snowOpacity * skyCoverage, positionWC, normalWC);
        }
        // if(snowOpacity > 0. && showParticles == true) {
        //     color.rgb = getSnowColor(color.rgb, time, snowDensity, snowOpacity);
        // }
        if(showParticles == true) {
            color.rgb = getSnowColor(color.rgb, time, snowDensity, 1.);
        }
    }
    out_FragColor = color;

}
