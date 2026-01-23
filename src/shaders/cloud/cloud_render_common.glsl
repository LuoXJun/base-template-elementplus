float cloudMap0(vec3 posMeter, float normalizeHeight)  // Meter
{
    // vec3 rayHitInRender = convertToCameraUnit(posMeter * 0.001 - vec3(0.0, frameData.atmosphere.bottomRadius, 0.0), frameData);
    // float dis2Cam = distance(rayHitInRender, frameData.camWorldPos.xyz) * 0.001; // to km

    float scale = 1.0;//exp(-max(0.0, (dis2Cam - 100.0) * 0.05));
    float scaleUv = 1.0;//exp(-max(0.0, (dis2Cam - 100.0) * 0.05));

    const float kCoverage = 0.5;// frameData.cloud.cloudCoverage;
    const float kDensity = frameData.cloud.cloudDensity * 2.0;

    const vec3 windDirection = frameData.cloud.cloudDirection;
    const float cloudSpeed = frameData.cloud.cloudSpeed;

    posMeter += windDirection * normalizeHeight * 500.0;
    vec3 posKm = posMeter * 0.001;

    vec3 curl = texture(sampler2D(inCurl, linearRepeatSampler), (frameData.appTime.x * cloudSpeed * 50.0 + posMeter.xz) * 0.0000008 + 0.7).xyz;
    curl = curl * 2.0 - 1.0;

    posKm += curl * 2.0;

    vec3 windOffset = (windDirection + vec3(0.0, 0.1, 0.0)) * frameData.appTime.x * cloudSpeed;

    vec2 sampleUv = posKm.xz * frameData.cloud.cloudWeatherUVScale * scaleUv;
    vec4 weatherValue = texture(sampler2D(inWeatherTexture, linearRepeatSampler), sampleUv);

    float localCoverage = texture(sampler2D(inCloudCurlNoise, linearRepeatSampler), (frameData.appTime.x * cloudSpeed * 50.0 + posMeter.xz) * 0.000001 + 0.5).x;
    localCoverage = saturate(localCoverage * 3.0 - 0.75) * 0.2;

    float coverage = saturate(kCoverage * (localCoverage + weatherValue.x));
    float gradienShape = remap(normalizeHeight, 0.10, 0.80, frameData.cloud.cloudCoverage * scale * 1.9, 0.2) * remap(normalizeHeight, 0.00, 0.1, 0.5, 1.0); //   * 

    float basicNoise = texture(sampler3D(inBasicNoise, linearRepeatSampler), (posKm + windOffset) * vec3(frameData.cloud.cloudBasicNoiseScale)).r;

    float basicCloudNoise = gradienShape * basicNoise;
    float basicCloudWithCoverage = coverage * remap(basicCloudNoise, 1.0 - coverage, 1, 0, 1);

    vec3 sampleDetailNoise = posKm - windOffset * 0.15;
    float detailNoiseComposite = texture(sampler3D(inDetailNoise, linearRepeatSampler), sampleDetailNoise * frameData.cloud.cloudDetailNoiseScale).r;
    float detailNoiseMixByHeight = 0.2 * mix(detailNoiseComposite, 1 - detailNoiseComposite, saturate(normalizeHeight * 10.0));

    float densityShape = saturate(0.01 + (1.0 - normalizeHeight) * 0.5) * 0.25 *
        remap(normalizeHeight, 0.0, 0.3, 0.0, 1.0) *
        remap(normalizeHeight, 0.7, 1.0, 1.0, 0.0);

    float cloudDensity = densityShape * remap(basicCloudWithCoverage, detailNoiseMixByHeight, 1.0, 0.0, 1.0);
    cloudDensity = pow(cloudDensity, saturate((1.0 - normalizeHeight)) * 0.4 + 0.1) * kDensity * 0.1;

    return saturate(cloudDensity);
}

float cloudMap1(vec3 posMeter, float normalizeHeight)  // Meter
{
    const float kCoverage = saturate(frameData.cloud.cloudCoverage);
    const float kDensity = frameData.cloud.cloudDensity * 0.35;

    const vec3 windDirection = frameData.cloud.cloudDirection;
    const float cloudSpeed = frameData.cloud.cloudSpeed;

    posMeter += windDirection * normalizeHeight * 500.0;
    vec3 posKm = posMeter * 0.001;

    vec3 curl = texture(sampler2D(inCurl, linearRepeatSampler), (frameData.appTime.x * cloudSpeed * 50.0 + posMeter.xz) * 0.000001 - 0.3).xyz;
    curl = curl * 2.0 - 1.0;

    posKm += curl * 5.0;

    vec3 windOffset = (windDirection + vec3(0.0, 0.1, 0.0)) * frameData.appTime.x * cloudSpeed;

    vec2 sampleUv = posKm.xz * frameData.cloud.cloudWeatherUVScale * 0.5 + 0.39;
    sampleUv.y *= 2.0;

    vec4 weatherValue = texture(sampler2D(inWeatherTexture, linearRepeatSampler), sampleUv);

    float localCoverage = texture(sampler2D(inCloudCurlNoise, linearRepeatSampler), (frameData.appTime.x * cloudSpeed * 50.0 + posMeter.xz) * 0.000001 - 0.11).x;
    localCoverage = saturate(localCoverage * 4.0 - 2.0) * 0.5;

    float coverage = saturate(kCoverage * (localCoverage + weatherValue.x));
    float gradienShape = remap(normalizeHeight, 0.00, 0.01, 0.1, 1.0) * remap(normalizeHeight, 0.10, 0.80, 0.7, 0.2);

    float basicNoise = texture(sampler3D(inBasicNoise, linearRepeatSampler), 2.0 * (posKm + windOffset) * vec3(frameData.cloud.cloudBasicNoiseScale)).r;
    float basicCloudNoise = gradienShape * basicNoise;

    float basicCloudWithCoverage = coverage * remap(basicCloudNoise, 1.0 - coverage, 1, 0, 1);

    vec3 sampleDetailNoise = posKm - windOffset * 0.15;
    float detailNoiseComposite = texture(sampler3D(inDetailNoise, linearRepeatSampler), 2.0 * sampleDetailNoise * frameData.cloud.cloudDetailNoiseScale).r;
    float detailNoiseMixByHeight = 0.2 * mix(detailNoiseComposite, 1 - detailNoiseComposite, saturate(normalizeHeight * 10.0));

    float densityShape = saturate(0.01 + (1.0 - normalizeHeight) * 0.5) * 0.1 *
        remap(normalizeHeight, 0.0, 0.3, 0.0, 1.0) *
        remap(normalizeHeight, 0.7, 1.0, 1.0, 0.0);

    float cloudDensity = densityShape * remap(basicCloudWithCoverage, detailNoiseMixByHeight, 1.0, 0.0, 1.0);
    cloudDensity = pow(cloudDensity, saturate((1.0 - normalizeHeight)) * 0.4 + 0.1) * kDensity * 0.1;

    return saturate(cloudDensity);
}

float cloudMap2(vec3 posMeter, float normalizeHeight)  // Meter
{
    const float kCoverage = frameData.cloud.cloudCoverage * 0.75;
    const float kDensity = frameData.cloud.cloudDensity * 0.20;

    const vec3 windDirection = frameData.cloud.cloudDirection;
    const float cloudSpeed = frameData.cloud.cloudSpeed;

    posMeter += windDirection * normalizeHeight * 500.0;
    vec3 posKm = posMeter * 0.001;

    vec3 curl = texture(sampler2D(inCurl, linearRepeatSampler), (frameData.appTime.x * cloudSpeed * 50.0 + posMeter.xz) * 0.00000125 + 0.7).xyz;
    curl = curl * 2.0 - 1.0;
    posKm += curl * 10.0;

    vec3 windOffset = (windDirection + vec3(0.0, 0.1, 0.0)) * frameData.appTime.x * cloudSpeed;

    vec2 sampleUv = posKm.xz * frameData.cloud.cloudWeatherUVScale * 0.6 + 0.739;
    vec2 samplS = vec2(1.0);

    sampleUv.y *= 6.0;

    vec4 weatherValue = texture(sampler2D(inWeatherTexture, linearRepeatSampler), sampleUv);

    float localCoverage = texture(sampler2D(inCloudCurlNoise, linearRepeatSampler), (frameData.appTime.x * cloudSpeed * 50.0 + posMeter.xz) * 0.000001 - 0.39).x;
    localCoverage = saturate(1.0 - pow(localCoverage, 8.0));

    float coverage = saturate(kCoverage * (localCoverage + weatherValue.x));
    float gradienShape = remap(normalizeHeight, 0.00, 0.01, 0.1, 1.0) * remap(normalizeHeight, 0.10, 0.20, 0.8, 0.5);

    vec3 posS = 3.0 * (posKm + windOffset + 0.39) * vec3(frameData.cloud.cloudBasicNoiseScale);

    float basicNoise = texture(sampler3D(inBasicNoise, linearRepeatSampler), posS).r;
    float basicCloudNoise = gradienShape * basicNoise;

    float basicCloudWithCoverage = coverage * remap(basicCloudNoise, 1.0 - coverage, 1, 0, 1);

    float densityShape = saturate(0.01 + (1.0 - normalizeHeight) * 0.5) * 0.1 *
        remap(normalizeHeight, 0.0, 0.3, 0.0, 1.0) *
        remap(normalizeHeight, 0.7, 1.0, 1.0, 0.0);

    float cloudDensity = densityShape * basicCloudWithCoverage;
    cloudDensity = cloudDensity * kDensity;

    return saturate(cloudDensity);
}

float cloudMap(vec3 posMeter, float normalizeHeight, in const AtmosphereParameters atmosphere, inout float actualH01, bool shadowDepth)  // Meter
{

    if(normalizeHeight < 0.4) {
        actualH01 = normalizeHeight / 0.4;
        return cloudMap0(posMeter, actualH01);
    }

    if(!shadowDepth) {
        if(normalizeHeight < 0.8) {
            actualH01 = (normalizeHeight - 0.4) / 0.4;
            return cloudMap1(posMeter, actualH01);
        } else {
            actualH01 = (normalizeHeight - 0.8) / 0.2;
            return cloudMap2(posMeter, actualH01);
        }
    }

    return 0.0;
}

vec4 cloudColorCompute(
    in const AtmosphereParameters atmosphere,
    vec2 uv,
    float blueNoise,
    inout float cloudZ,
    ivec2 workPos,
    vec3 worldDir
) {
    float safeDepthZ = textureLod(sampler2D(inDepth, pointClampEdgeSampler), uv, kMipLevelSafeReturn).r;
    if(safeDepthZ > 0.0) {
        return vec4(0.0, 0.0, 0.0, 1.0);
    }

    // Get camera in atmosphere unit position, it will treat as ray start position.
    vec3 worldPos = convertToAtmosphereUnit(frameData.camWorldPos.xyz, frameData) + vec3(0.0, atmosphere.bottomRadius, 0.0);

    float earthRadius = atmosphere.bottomRadius;
    float radiusCloudStart = atmosphere.cloudAreaStartHeight;
    float radiusCloudEnd = radiusCloudStart + atmosphere.cloudAreaThickness;

    // Unit is atmosphere unit. km.
    float viewHeight = computeHeight(worldPos);

    // Find intersect position so we can do some ray marching.
    float tMin;
    float tMax;
    bool bEarlyOutCloud = false;
    if(viewHeight < radiusCloudStart) {
        float tEarth = raySphereIntersectNearest(worldPos, worldDir, vec3(0.0), earthRadius);
        if(tEarth > 0.0) {
            // Intersect with earth, pre-return.
            bEarlyOutCloud = true;
        }

        tMin = raySphereIntersectInside(worldPos, worldDir, vec3(0.0), radiusCloudStart);
        tMax = raySphereIntersectInside(worldPos, worldDir, vec3(0.0), radiusCloudEnd);
    } else if(viewHeight > radiusCloudEnd) {
        // Eye out of cloud area.

        vec2 t0t1 = vec2(0.0);
        const bool bIntersectionEnd = raySphereIntersectOutSide(worldPos, worldDir, vec3(0.0), radiusCloudEnd, t0t1);
        if(!bIntersectionEnd) {
            // No intersection.
            bEarlyOutCloud = true;
        }

        vec2 t2t3 = vec2(0.0);
        const bool bIntersectionStart = raySphereIntersectOutSide(worldPos, worldDir, vec3(0.0), radiusCloudStart, t2t3);
        if(bIntersectionStart) {
            tMin = t0t1.x;
            tMax = t2t3.x;
        } else {
            tMin = t0t1.x;
            tMax = t0t1.y;
        }
    } else {
        // Eye inside cloud area.
        float tStart = raySphereIntersectNearest(worldPos, worldDir, vec3(0.0), radiusCloudStart);
        if(tStart > 0.0) {
            tMax = tStart;
        } else {
            tMax = raySphereIntersectInside(worldPos, worldDir, vec3(0.0), radiusCloudEnd);
        }

        tMin = 0.0; // From camera.
    }

    tMin = max(tMin, 0.0);
    tMax = max(tMax, 0.0);

    // Pre-return if too far.
    if(tMax <= tMin || tMin > frameData.cloud.cloudTracingStartMaxDistance) {
        bEarlyOutCloud = true;
    }

    // Clamp marching distance by setting.    
    const float marchingDistance = min(frameData.cloud.cloudMaxTraceingDistance, tMax - tMin);
    tMax = tMin + marchingDistance;

    const uint stepCountUnit = frameData.cloud.cloudMarchingStepNum;
    const float stepCount = float(stepCountUnit);
    const float stepT = (tMax - tMin) / stepCount; // Per step lenght.

    float sampleT = tMin + 0.001 * stepT; // slightly delta avoid self intersect.

    // Jitter by blue noise.
    sampleT += stepT * blueNoise;

    vec3 sunColor = frameData.sunLightInfo.color * frameData.sunLightInfo.intensity;
    vec3 sunDirection = -normalize(frameData.sunLightInfo.direction);

    float VoL = dot(worldDir, sunDirection);

    float transmittance = 1.0;
    vec3 scatteredLight = vec3(0.0, 0.0, 0.0);

    vec3 rayHitPos = vec3(0.0);
    if(!bEarlyOutCloud) {
        // Combine backward and forward scattering to have details in all directions.
        float phase = dualLobPhase(frameData.cloud.cloudPhaseForward, frameData.cloud.cloudPhaseBackward, frameData.cloud.cloudPhaseMixFactor, -VoL);

        ParticipatingMediaPhase participatingMediaPhase = getParticipatingMediaPhase(phase, 0.5);

        // Average ray hit pos to evaluate air perspective and height fog.
        float rayHitPosWeight = 0.0;

        // Second evaluate transmittance due to participating media
        vec3 atmosphereTransmittance0;
        {
            vec3 samplePos = sampleT * worldDir + worldPos;
            float sampleHeight = computeHeight(samplePos);

            const vec3 upVector = samplePos / sampleHeight;
            float viewZenithCosAngle = dot(sunDirection, upVector);
            vec2 sampleUv;
            lutTransmittanceParamsToUv(atmosphere, viewHeight, viewZenithCosAngle, sampleUv);
            atmosphereTransmittance0 = texture(sampler2D(inTransmittanceLut, linearClampEdgeSampler), sampleUv).rgb;
        }
        vec3 atmosphereTransmittance1;
        {
            vec3 samplePos = tMax * worldDir + worldPos;
            float sampleHeight = computeHeight(samplePos);

            const vec3 upVector = samplePos / sampleHeight;
            float viewZenithCosAngle = dot(sunDirection, upVector);
            vec2 sampleUv;
            lutTransmittanceParamsToUv(atmosphere, viewHeight, viewZenithCosAngle, sampleUv);
            atmosphereTransmittance1 = texture(sampler2D(inTransmittanceLut, linearClampEdgeSampler), sampleUv).rgb;
        }

        vec3 distantLit0;
        {
            vec3 samplePos = sampleT * worldDir + worldPos;

            samplePos = convertToCameraUnit(samplePos, frameData);

            float tDepth = 0.001 * length(samplePos - frameData.camWorldPos.xyz);
            float slice = distantGridDepthToSlice(tDepth);

            float weight = 1.0;
            if(slice < 0.5) {
                // We multiply by weight to fade to 0 at depth 0. That works for luminance and opacity.
                weight = saturate(slice * 2.0);
                slice = 0.5;
            }
            ivec3 sliceLutSize = textureSize(inDistantLitGrid, 0);
            float w = sqrt(slice / float(sliceLutSize.z));	// squared distribution

            distantLit0 = weight * texture(sampler3D(inDistantLitGrid, linearClampEdgeSampler), vec3(uv, w)).xyz;
        }

        vec3 distantLit1;
        {
            vec3 samplePos = tMax * worldDir + worldPos;
            samplePos = convertToCameraUnit(samplePos, frameData);

            float tDepth = 0.001 * length(samplePos - frameData.camWorldPos.xyz); // meter -> kilometers.
            float slice = distantGridDepthToSlice(tDepth);

            float weight = 1.0;
            if(slice < 0.5) {
                // We multiply by weight to fade to 0 at depth 0. That works for luminance and opacity.
                weight = saturate(slice * 2.0);
                slice = 0.5;
            }
            ivec3 sliceLutSize = textureSize(inDistantLitGrid, 0);
            float w = sqrt(slice / float(sliceLutSize.z));	// squared distribution

            distantLit1 = weight * texture(sampler3D(inDistantLitGrid, linearClampEdgeSampler), vec3(uv, w)).xyz;
        }

        vec3 upScaleColor = texture(samplerCube(inSkyIrradiance, linearClampEdgeSampler), vec3(0, 1, 0)).rgb;

        // When sunset, light transport will pass longer distance to the eye, meaning multi-scatter should be stronger.
        float sunSetScale = 1.0 + saturate(1.0 - sunDirection.y * 2.0);

        for(uint i = 0; i < stepCountUnit; i++) {
            // World space sample pos, in km unit.
            vec3 samplePos = sampleT * worldDir + worldPos;

            float sampleHeight = computeHeight(samplePos);

            vec3 atmosphereTransmittance = mix(atmosphereTransmittance0, atmosphereTransmittance1, saturate(sampleT / marchingDistance));
            vec3 distantLit = mix(distantLit0, distantLit1, saturate(sampleT / marchingDistance));

            // Get sample normalize height [0.0, 1.0]
            float normalizeHeight = (sampleHeight - atmosphere.cloudAreaStartHeight) / atmosphere.cloudAreaThickness;

            // Convert to meter.
            vec3 samplePosMeter = samplePos * 1000.0;
            float actualH01 = 0.0;
            float stepCloudDensity = cloudMap(samplePosMeter, normalizeHeight, atmosphere, actualH01, false);

            // Add ray march pos, so we can do some average fading or atmosphere sample effect.
            rayHitPos += samplePos * transmittance;
            rayHitPosWeight += transmittance;

            if(stepCloudDensity > 0.) {
                float opticalDepth = stepCloudDensity * stepT * 1000.0; // to meter unit.
                // beer's lambert.
                // Siggraph 2017's new step transmittance formula.
                float stepTransmittance = max(exp(-opticalDepth), exp(-opticalDepth * 0.25) * 0.7);

                ParticipatingMedia participatingMedia = volumetricShadow(samplePos, sunDirection, atmosphere, frameData.cloud.cloudMultiScatterExtinction, 1.0);

                // Additional ambient trace.
                ParticipatingMedia participatingMediaAmbient;
                if(frameData.cloud.cloudEnableGroundContribution != 0) {
                    participatingMediaAmbient = volumetricShadow(samplePos, vec3(0, 1, 0), atmosphere, kSkyMsExition, 1.0);
                }

                // Compute powder term.
                float powderEffect;
                {
                    float depthProbability = pow(clamp(stepCloudDensity * 8.0 * frameData.cloud.cloudPowderPow, 0.0, frameData.cloud.cloudPowderScale), remap(actualH01, 0.3, 0.85, 0.5, 2.0));
                    depthProbability += 0.05;
                    float verticalProbability = pow(remap(actualH01, 0.07, 0.22, 0.1, 1.0), 0.8);
                    powderEffect = powderEffectNew(depthProbability, verticalProbability, VoL);
                }

                // Amount of sunlight that reaches the sample point through the cloud 
                // is the combination of ambient light and attenuated direct light.
                vec3 sunlightTerm = atmosphereTransmittance * frameData.cloud.cloudShadingSunLightScale * sunColor;

                vec3 samplePosInRender = convertToCameraUnit(samplePos - vec3(0.0, atmosphere.bottomRadius, 0.0), frameData);
                vec3 groundToCloudTransfertIsoScatter = texture(sampler2D(inCloudDistantLit, linearClampEdgeSampler), getSkySampleDistantLitUv(computeHeight(samplePosInRender))).rgb;

                vec3 ambientLit = groundToCloudTransfertIsoScatter * powderEffect * (1.0 - sunDirection.y * sunDirection.y) * mix(atmosphereTransmittance, vec3(1.0), saturate(1.0 - transmittance));// ;

                float sigmaS = stepCloudDensity;
                float sigmaE = max(sigmaS, 1e-8);

                vec3 scatteringCoefficients[kMsCount];
                float extinctionCoefficients[kMsCount];

                vec3 albedo = frameData.cloud.cloudAlbedo;

                scatteringCoefficients[0] = sigmaS * albedo;
                extinctionCoefficients[0] = sigmaE;

                float MsExtinctionFactor = frameData.cloud.cloudMultiScatterExtinction / sunSetScale;
                float MsScatterFactor = frameData.cloud.cloudMultiScatterScatter;
                int ms;
                for(ms = 1; ms < kMsCount; ms++) {
                    extinctionCoefficients[ms] = extinctionCoefficients[ms - 1] * MsExtinctionFactor;
                    scatteringCoefficients[ms] = scatteringCoefficients[ms - 1] * MsScatterFactor;

                    MsExtinctionFactor *= MsExtinctionFactor;
                    MsScatterFactor *= MsScatterFactor;
                }

                for(ms = kMsCount - 1; ms >= 0; ms--) // Should terminate at 0
                {
                    float sunVisibilityTerm = participatingMedia.transmittanceToLight[ms];
                    vec3 sunSkyLuminance = sunVisibilityTerm * sunlightTerm * participatingMediaPhase.phase[ms] * powderEffect;

                    if(frameData.cloud.cloudEnableGroundContribution != 0) {
                        float skyVisibilityTerm = participatingMediaAmbient.transmittanceToLight[ms];
                        sunSkyLuminance += skyVisibilityTerm * ambientLit;
                    }

                    if(ms == 0) {
                        sunSkyLuminance += distantLit * frameData.cloud.cloudAmbientScale;
                    }

                    vec3 sactterLitStep = sunSkyLuminance * scatteringCoefficients[ms];

                #if 0
                    scatteredLight += transmittance * sactterLitStep * stepT * 1000.0;
                #else
                    // See slide 28 at http://www.frostbite.com/2015/08/physically-based-unified-volumetric-rendering-in-frostbite/
                    vec3 stepScatter = transmittance * (sactterLitStep - sactterLitStep * stepTransmittance) / max(1e-4, extinctionCoefficients[ms]);
                    scatteredLight += stepScatter;
                #endif

                    if(ms == 0) {
                        // Beer's law.
                        transmittance *= stepTransmittance;
                    }
                }
            }

            if(transmittance <= 0.001) {
                break;
            }
            sampleT += stepT;
        }

        // Apply some additional effect.
        if(rayHitPosWeight > 0.0) {
            // Get average hit pos.
            rayHitPos /= rayHitPosWeight;

            vec3 rayHitInRender = convertToCameraUnit(rayHitPos - vec3(0.0, atmosphere.bottomRadius, 0.0), frameData);
            vec4 rayInH = frameData.camViewProj * vec4(rayHitInRender, 1.0);
            cloudZ = rayInH.z / rayInH.w;

            rayHitPos -= worldPos;
            float rayHitHeight = computeHeight(rayHitPos);

            // Apply air perspective.
            {
                float slice = aerialPerspectiveDepthToSlice(rayHitHeight);
                float weight = 1.0;
                if(slice < 0.5) {
                    // We multiply by weight to fade to 0 at depth 0. That works for luminance and opacity.
                    weight = saturate(slice * 2.0);
                    slice = 0.5;
                }
                ivec3 sliceLutSize = textureSize(inFroxelScatter, 0);
                float w = sqrt(slice / float(sliceLutSize.z));	// squared distribution

                vec4 airPerspective = weight * texture(sampler3D(inFroxelScatter, linearClampEdgeSampler), vec3(uv, w));
                scatteredLight = scatteredLight * (1.0 - airPerspective.a) + airPerspective.rgb * (1.0 - transmittance);
            }
        }

    }

    // Dual mix transmittance.
    vec4 result = vec4(scatteredLight, transmittance);

    // Data safe check.
    if(any(isnan(result)) || any(isinf(result))) {
        result = vec4(0.0, 0.0, 0.0, 1.0);
    }

    // Final return.
    return result;
}