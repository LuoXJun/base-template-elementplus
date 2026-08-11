interface ITable {
    maxHeight?: number | string;
    height?: string | number;
    border?: boolean;
    hasPage?: boolean;
    'row-key'?: string;
}

/** 确认按钮模式弹窗模式 */
type TOperationConfirmMode = 'popover' | 'messageBox';

/** 单个操作按钮的配置 */
interface ITableOperation {
    /** 操作标识，emit 事件时回传，页面据此路由业务逻辑 */
    type: operationType;
    /** 按钮文本 */
    label: string;
    /** el-button type，默认 'primary' */
    btnType?: ElBtnType;
    /** 确认配置：有则包裹确认组件，无则为普通按钮 */
    confirm?: {
        mode: TOperationConfirmMode;
        content: string;
        title?: string;
        confirmType?: TconfirmType;
    };
    /** 是否显示按钮，通过响应式 config切换，优先级高于visibility */
    visible?: boolean;
    /** 通过行内元素控制显隐 */
    visibility?: (data: any) => boolean;
    /** 是否禁用按钮，默认 false。父组件可通过响应式 config 运行时切换 */
    disabled?: boolean;
    disabledFoo?: (data: any) => boolean;
    /** 是否放入"更多"下拉菜单 */
    isDropdown?: boolean;
    /** 按钮的类名 */
    className?: string;
    /** 是否显示文字 */
    link?: boolean;
}

type SelectedType = 'select' | 'selectAll' | 'change';
interface ISelect<T = any> {
    value: T[];
    type: SelectedType;
    row?: T;
}

interface ITableColumn {
    // 同时是使用的slot插槽名称
    filed: string;
    label: string;
    isShowColumn?: boolean;
    /** 按钮的类名 */
    className?: string;
    options?: {
        sortable?: boolean;
        align?: 'center' | 'left' | 'right';
        minWidth?: number | string;
        width?: number | string;
        height?: number;
        fixed?: 'left' | 'right';
        showOverflowTooltip?: boolean;
    };
    operations?: ITableOperation[];
}
