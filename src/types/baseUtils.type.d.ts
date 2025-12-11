// 将数字字面量转换为字符串数字字面量
type toString<T extends string | number> = `${T}`;
