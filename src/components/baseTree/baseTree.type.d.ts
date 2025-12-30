import type {
    FilterNodeMethodFunction,
    FilterValue,
    RenderContentContext,
    TreeInstance,
    TreeKey,
    TreeData,
    TreeNodeData
} from 'element-plus';
declare global {
    interface IbaseTree {
        label: string;
        children?: string;
    }

    type TTreeMethods =
        | 'filter'
        | 'updateKeyChildren'
        | 'getCheckedNodes'
        | 'setCheckedNodes'
        | 'getCheckedKeys'
        | 'setCheckedKeys'
        | 'setChecked'
        | 'getHalfCheckedNodes'
        | 'getHalfCheckedKeys'
        | 'getCurrentKey'
        | 'getCurrentNode'
        | 'setCurrentKey'
        | 'setCurrentNode'
        | 'getNode'
        | 'append'
        | 'insertBefore'
        | 'insertAfter'
        | 'remove';

    interface TTreeMethodsParams {
        key?: TreeKey;
        keys?: TreeKey[];
        // 节点data对象
        data?: TreeData;
        //true 仅返回选中节点的子节点
        leafOnly?: boolean;
        // true返回半选节点
        includeHalfChecked?: boolean;
        // 需要选中的对象数组
        nodes?: RenderContentContext['node'][];
        node?: RenderContentContext['node'];
        // 设置对象的选中状态
        checked?: boolean;
        // 父节点对象
        parentNode?: RenderContentContext['node'];
        //filter时需要传入的参数
        filterValue?: FilterValue;
    }
}
