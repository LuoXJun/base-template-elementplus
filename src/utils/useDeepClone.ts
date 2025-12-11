// 监测传入数据类型
const checkType = (data: any) => {
    return Object.prototype.toString.call(data).slice(8, -1);
};

const useDeepClone = (target: any) => {
    const targetType = checkType(target);
    let result: any;
    if (targetType === 'Object') {
        result = {};
    } else if (targetType === 'Array') {
        result = [];
    } else {
        return target;
    }
    for (const key in target) {
        const value = target[key];
        const valueType = checkType(value);
        if (valueType === 'Object' || valueType === 'Array') {
            result[key] = useDeepClone(value);
        } else {
            result[key] = value;
        }
    }
    return result;
};

export { useDeepClone };
