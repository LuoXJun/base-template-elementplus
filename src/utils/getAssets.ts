/**
 * 正式环境只有动态传入文件名时才能解析
 * 测试环境可以动态传入路径
 */
export const getImageWidthName = (name: string) => {
    return new URL(`../assets/images/${name}`, import.meta.url).href;
};

export const getImageWidthName2noise = (name: string) => {
    return new URL(`../assets/noise/${name}`, import.meta.url).href;
};

/**通过名字获取法线贴图*/
export const getImageWidthName2normals = (name: string) => {
    return new URL(`../assets/normals/${name}`, import.meta.url).href;
};
