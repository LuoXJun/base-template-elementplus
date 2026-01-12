const float EPSILON12 = .000000000001;
/**
* Scales the provided Cartesian position along the geodetic surface normal
* so that it is on the surface of this ellipsoid.  If the position is
* at the center of the ellipsoid, this function returns undefined.
*
* @param {Vector3} cartesian The Cartesian position to scale.
* @param {Vector3} oneOverRadii One over radii of the ellipsoid.
* @param {Vector3} oneOverRadiiSquared One over radii squared of the ellipsoid.
* @param {Number} centerToleranceSquared Tolerance for closeness to the center.
* @param {Vector3} [result] The object onto which to store the result.
* @returns {Vector3} The modified result parameter, a new Cartesian3 instance if none was provided, or undefined if the position is at the center.
*
* @exports wgs84_scaleToGeodeticSurface
*
* @private
*/
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

//

/**
*经纬度与椭球世界坐标之间转换
*/
const highp float longR = 6378137.;
const highp float shortR = 6356752.3142451793;
const highp vec3 wgs84RadiiSquared = vec3(longR * longR, longR * longR, shortR * shortR);
const highp float radiansPerDegree = .017453292519943295;
const highp vec3 oneOverRadii = vec3(1.0 / longR, 1.0 / longR, 1.0 / shortR);
const highp vec3 oneOverRadiiSquared = vec3(1.0 / (longR * longR), 1.0 / (longR * longR), 1.0 / (shortR * shortR));
const highp float centerToleranceSquared = 0.1;

/**
 * 获取大地表面法线
 */
vec3 wgs84_geodeticSurfaceNormal(vec3 cartesian) {
    return normalize(cartesian * oneOverRadiiSquared);
}

vec3 wgs84_radToCart3(highp float longitude, highp float latitude, highp float height) {

    vec3 radiiSquared = wgs84RadiiSquared;

    float cosLatitude = cos(latitude);
    vec3 scratchN;
    scratchN.x = cosLatitude * cos(longitude);
    scratchN.y = cosLatitude * sin(longitude);
    scratchN.z = sin(latitude);
    scratchN = normalize(scratchN);

    vec3 scratchK = radiiSquared * scratchN;
    float gamma = sqrt(dot(scratchN, scratchK));
    scratchK = scratchK / gamma;
    scratchN = scratchN * height;

    return scratchK + scratchN;
}

vec3 wgs84_degToCart3(highp float longitude, highp float latitude, highp float height) {
    return wgs84_radToCart3(longitude * radiansPerDegree, latitude * radiansPerDegree, height);
}

vec3 wgs84_degToCart3(highp vec3 lngLatAlti) {
    return wgs84_radToCart3(lngLatAlti.x * radiansPerDegree, lngLatAlti.y * radiansPerDegree, lngLatAlti.z);
}

/**
* @param {Vector3}cartesian
* @param {Vector3}[result]
* @returns {Vector3}
*/
vec3 wgs84_cart3ToRad(highp vec3 cartesian) {

    //得到cartesian贴椭球表面点的坐标
    vec3 p = wgs84_scaleToGeodeticSurface(cartesian, oneOverRadii, oneOverRadiiSquared, centerToleranceSquared);

    if(p.x == cartesian.x && p.y == cartesian.y && p.z == cartesian.z) {
        return cartesian;
    }

    vec3 n = p * oneOverRadiiSquared;
    n = normalize(n);

    vec3 h = cartesian - p;
    float longitude = atan(n.y, n.x);
    float latitude = asin(n.z);
    float height = sign(dot(h, cartesian)) * length(h);

    return vec3(longitude, latitude, height);
}

vec3 wgs84_cart3ToDeg(highp vec3 cartesian) {
    vec3 result = wgs84_cart3ToRad(cartesian);
    result.x /= radiansPerDegree;
    result.y /= radiansPerDegree;
    return result;
}

float wgs84_getHeight(in vec3 cartesian) {
    vec3 p = wgs84_scaleToGeodeticSurface(cartesian, oneOverRadii, oneOverRadiiSquared, centerToleranceSquared);
    vec3 h = cartesian - p;
    float height = sign(dot(h, cartesian)) * length(h);
    return height;
}

vec3 wgs84_scaleToGeodeticSurface(in highp vec3 cartesian) {
    return wgs84_scaleToGeodeticSurface(cartesian, oneOverRadii, oneOverRadiiSquared, centerToleranceSquared);
}