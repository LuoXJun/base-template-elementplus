interface ITable {
    maxHeight?: number | string;
    height?: string | number;
    border?: boolean;
    hasPage?: boolean;
    'row-key'?: string;
}
interface ISelect {
    value: any;
    type: 'select' | 'selectAll' | 'change';
    row?: any;
}
interface ITableColumn {
    // 同时是使用的slot插槽名称
    filed: string;
    label: string;
    isShowColumn?: boolean;
    options?: {
        sortable?: boolean;
        align?: 'center' | 'left' | 'right';
        minWidth?: number | string;
        width?: number | string;
        height?: number;
        fixed?: 'left' | 'right';
        showOverflowTooltip?: boolean;
    };
}
