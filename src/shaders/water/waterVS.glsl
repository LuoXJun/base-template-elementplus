in vec4 position;
in vec2 st;
out vec2 v_st;

const float PI = 3.141592653589793;
const float earthRadius = 6378137.0; // WGS84 椭球体的平均半径
const float angularVelocity = 180.0 / PI;

const float RADII_X = 6378137.0;
const float RADII_Y = 6378137.0;
const float RADII_Z = 6356752.314245;

vec3 worldToGeographic(vec3 worldPosition) {
            // 步骤1: 世界坐标到ECEF坐标
    vec3 ecef = worldPosition;  // 假设世界坐标已经是ECEF

            // 步骤2: ECEF到地理坐标
    float l = length(ecef.xy);
    float e2 = 1.0 - (RADII_Z * RADII_Z) / (RADII_X * RADII_X);
    float u = atan(ecef.z * RADII_X / (l * RADII_Z));
    float lat = atan((ecef.z + e2 * RADII_Z * pow(sin(u), 3.0)) /
        (l - e2 * RADII_X * pow(cos(u), 3.0)));
    float lon = atan(ecef.y, ecef.x);
    float N = RADII_X / sqrt(1.0 - e2 * sin(lat) * sin(lat));
    float alt = l / cos(lat) - N;

            // 将弧度转换为度
    lat = degrees(lat);
    lon = degrees(lon);

    return vec3(lon, lat, alt);
}

vec3 geo2cartesian(vec3 geo) {
    float cosLat = cos(geo.y);
    float snX = cosLat * cos(geo.x);
    float snY = cosLat * sin(geo.x);
    float snZ = sin(geo.y);
    vec3 sn = normalize(vec3(snX, snY, snZ));
    vec3 radiiSquared = vec3(40680631.59076899 * 1000000., 40680631.59076899 * 1000000., 40408299.98466144 * 1000000.);
    vec3 sk = radiiSquared * sn;
    float gamma = sqrt(dot(sn, sk));
    sk = sk / gamma;
    sn = sn * geo.z;
    return sk + sn;
}

vec3 deg2cartesian(vec3 deg) {
    vec2 radGeo = radians(deg.xy);
    vec3 geo = vec3(radGeo.xy, deg.z);
    return geo2cartesian(geo);
}

void main() {
    float normalizedHeight = 0.0;

    vec2 uv = st;
    float deepwater_fadedepth = 0.5 + coast2water_fadedepth;

    float height = height_map(uv);
    vec3 col;

    float waveheight = clamp(WATER_LEVEL * 3. - 1.5, 0., 1.);
    float level = WATER_LEVEL + .2 * water_map(uv * 15. + vec2(iTime * .1), waveheight);

    if(height <= level) {
        normalizedHeight = level;
    } else {
        normalizedHeight = height; // 减少边缘拉伸的割裂感
    }

    float heightOffset = (maxElevation - minElevation) * normalizedHeight;

            // 将顶点位置从模型空间转换到世界空间
    vec4 worldPosition = czm_model * position;

            // 将世界坐标转换为经纬度和高度
    vec3 llh = worldToGeographic(worldPosition.xyz);

            // 将调整后的经纬度和高度转换回笛卡尔坐标
    vec3 adjustedCartesian = deg2cartesian(vec3(llh.xy, minElevation + heightOffset));

    gl_Position = czm_projection * czm_view * vec4(adjustedCartesian, 1.0);
    v_st = st;
}