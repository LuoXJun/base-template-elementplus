// 允许的表单元素
type itemType =
    | 'input'
    | 'select'
    | 'treeSelect'
    | 'password'
    | 'textarea'
    | 'radio'
    | 'radio-group'
    | 'checkbox'
    | 'slot'
    | 'date'
    | 'daterange';

type FormOption = {
    label: string;
    value: string | number | boolean;
    border?: boolean;
};

type RulesRequired = {
    required: boolean;
    message: string;
    trigger: 'blur' | 'change';
};
type RulesAuto = {
    pattern: RegExp;
    message: string;
    trigger: 'blur' | 'change';
};
type RulesMinx = {
    min: number;
    max: number;
    message: string;
    trigger: 'blur' | 'change';
};

type RulesCustom = {
    validator?: (rule: any, value: any, callback: () => void) => void;
    required: boolean;
    trigger: 'blur' | 'change';
};

type Ttooltip =
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end';

type TtooltipTrigger = 'click' | 'contextmenu' | 'focus' | 'hover';

/**
 * 自定义验证规则时,如有需要比较两个变量的值
 * 可以在引入配置文件的地方遍历拿到想要的两个对象进行比较
 * eg
 * */
type Rules = (RulesRequired | RulesAuto | RulesMinx | RulesCustom)[];

type TSelectTreeType = { label: string; value: string | number; children?: TSelectTreeType[] };

// 单个表单元素属性
interface IformItem {
    /**prop、元素绑定的key、插槽名字*/
    filed: string;
    label: string;
    type: itemType;
    labelWidth?: string;
    labelPosition?: 'left' | 'right' | 'top';
    rules?: Rules;
    // 控制显隐
    isShow?: boolean;
    /**是否使用layout布局*/
    useLayout?: boolean;
    /**默认一行四列布局，可先layout传空再传入span控制每行占的列数*/
    span?: number;
    placeholder?: string;
    disabled?: boolean;
    // 出现？标识，悬浮显示描述文本
    description?: {
        content: string;
        // description出现的位置
        placement?: Ttooltip;
        trigger?: TtooltipTrigger;
    };

    input?: {
        maxlength?: string | number;
        /**是否显示切换密码图标*/
        showPassword?: boolean;
    };
    textarea?: {
        maxlength?: string | number;
        /**textarea { minRows: 2, maxRows: 6 }*/
        autosize?: boolean | object;
        showWordLimit?: boolean;
    };
    /**select、radio、checkbox*/
    radio?: {
        options: FormOption[];
    };
    checkbox?: {
        options: FormOption[];
    };
    select?: {
        config?: {
            // 是否可以多选
            multiple?: boolean;
            // 是否可筛选
            filterable?: boolean;
            //是否允许用户创建新条目， 只有当 filterable 设置为 true 时才会生效。
            allowCreate?: boolean;
        };
        options: FormOption[];
    };
    treeSelect?: {
        config?: {
            // 是否可以多选
            multiple?: boolean;
            // 是否可筛选
            filterable?: boolean;
            //是否允许用户创建新条目， 只有当 filterable 设置为 true 时才会生效。
            allowCreate?: boolean;
        };
        data?: TSelectTreeType[];
        props?: Record<string, string>;
    };
    date?: {
        valueFormat: string;
        /**开始时间和结束时间之间的连接符*/
        rangeSeparator?: string;
        startPlaceholder?: string;
        endPlaceholder?: string;
        /**文本框可输入*/
        editable?: boolean;
    };
}
