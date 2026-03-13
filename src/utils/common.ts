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
    obj && typeof obj === 'object' && keys.every((key) => key in obj);

/**
 * 为 arr 中的每个值在有序列表 list 中找到最近的索引，且索引不重复
 * @param {number[]} list - 严格递增的数值数组（如题中提供的长列表）
 * @param {number[]} arr - 待查找的近似值数组（长度为40，值域与 list 一致）
 * @returns {number[]} - 长度为 arr.length 的索引数组，按 arr 原始顺序排列
 */
export function findUniqueNearestIndices(list: number[], arr: number[]): number[] {
    const n = arr.length;
    // 将 arr 的值与原始索引绑定，并按值升序排序
    const arrWithIndex = arr.map((value, idx) => ({ value, idx }));
    arrWithIndex.sort((a, b) => a.value - b.value);

    const result = new Array(n).fill(-1); // 存储最终索引
    let j = 0; // 指向 list 的当前候选位置

    for (let i = 0; i < n; i++) {
        const { value, idx } = arrWithIndex[i];

        // 如果 j 已指向 list 最后一个元素，后续所有 arr 元素只能匹配该索引
        if (j >= list.length - 1) {
            result[idx] = list.length - 1;
            continue;
        }

        // 计算到 list[j] 和 list[j+1] 的距离
        const distLeft = Math.abs(value - list[j]);
        const distRight = Math.abs(value - list[j + 1]);

        if (distLeft <= distRight) {
            // 左边更近或相等，选择当前 j，并标记为已使用
            result[idx] = j;
            j++; // 移动到下一个可用索引
        } else {
            // 右边更近，当前 j 不适合，尝试下一个 list 元素
            j++;
            i--; // 回退 i，重新处理当前 arr 元素
        }
    }

    return result;
}
