interface ITableList {
    label?: any;
    value?: string | number;
    single?: boolean;
    // 为了支持自定义label,value键值对
    [key: string]: any;
    span?: number;
    prop?: string;
}
