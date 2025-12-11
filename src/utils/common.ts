export function getType(val: any) {
    return Object.prototype.toString.call(val).slice(8, -1);
}

export function isFunction(val: any) {
    return getType(val) === 'Function';
}

export function isString(val: any) {
    return getType(val) === 'String';
}

export function isNumber(val: any) {
    return getType(val) === 'Number';
}

export function isUndefined(val: any) {
    return getType(val) === 'Undefined';
}

export function isArray(val: any) {
    return getType(val) === 'Array';
}

export function isObject(val: any) {
    return getType(val) === 'Object';
}

export function isNull(val: any) {
    return getType(val) === 'Null';
}

// 判断传入数据是否为空（包含空数组、undefined、null、空Object、空字符串、空map、空set）
export const isEmpty = (val: any): boolean => {
    if (!val) {
        return true;
    }
    if (isArray(val) || isString(val)) {
        return val.length === 0;
    }

    if (val instanceof Map || val instanceof Set) {
        return val.size === 0;
    }

    if (isObject(val)) {
        return Object.keys(val).length === 0;
    }

    return false;
};

// 判断给定的key集合，是否在对象中均存在
export const checkKeysExist = (obj: Record<string, any> | null | undefined, keys: string[]) =>
    obj && typeof obj === 'object' && keys.every((key) => key in obj && obj[key]);
