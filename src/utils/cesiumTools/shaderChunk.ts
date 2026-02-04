import post_getGeometryData from '@/shaders/geometryData/post_getGeometryData.js';
import wgs84_cartesian3 from '@/shaders/geometryData/wgs84_cartesian3.js';
import commonly_used from '@/shaders/geometryData/commonly_used.js';
import ray_marching_intersect from '@/shaders/geometryData/ray_marching_intersect.js';

const ShaderChunk = {
    post_getGeometryData,
    wgs84_cartesian3,
    commonly_used,
    ray_marching_intersect
};

const includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;

function resolveIncludes(string: string) {
    return string.replace(includePattern, includeReplacer);
}

function includeReplacer(match: any, include: keyof typeof ShaderChunk) {
    console.log(match, include);

    let string;
    string = ShaderChunk[include];
    if (string === undefined) {
        throw new Error('Can not resolve #include <' + include + '>');
    }
    string = `
//#include <${include}> start
${string}
//#include <${include}> end
    `;
    return resolveIncludes(string);
}

export { resolveIncludes };
