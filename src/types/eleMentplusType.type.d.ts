import { TreeNode, UploadUserFile } from 'element-plus';

declare global {
    // 重定义tree 的node数据结构
    interface TreeNodeAuto<T = any> extends TreeNode {
        id: string | number;
        level: number;
        label: string; // 兼容 Element Plus 的默认字段
        childNodes: TreeNodeAuto<T>[];
        parent: TreeNodeAuto<T>;
        data: T;

        disabled?: boolean;
        isLeaf?: boolean;
    }

    //
    interface UploadFile<T extends Record<string, any> = {}> extends UploadUserFile, T {}
}
