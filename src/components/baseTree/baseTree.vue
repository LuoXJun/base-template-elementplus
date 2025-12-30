<template>
    <div class="base-tree">
        <el-tree
            ref="treeRef"
            highlight-current
            :data="treeData"
            :node-key="nodeKey"
            :props="defaultProps"
            :default-expand-all="defaultExpandAll"
            :default-checked-keys="defaultCheckedKeys"
            :current-node-key="currentNodeKey"
            :show-checkbox="showCheckbox"
            :expand-on-click-node="expandOnClick"
            :filter-node-method="filterNodeMethod"
            @node-click="handleNodeClick"
            @check="handleNodeCheck"
        >
            <template #="{ node, data }">
                <slot :row="{ node, data }">
                    <span>{{ node.label }}</span>
                </slot>
            </template>
        </el-tree>
    </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { checkKeysExist } from '@/utils/common';
import type { CheckedInfo, FilterNodeMethodFunction, TreeNodeData, TreeNode } from 'element-plus';
import { type PropType } from 'vue';

const treeData = defineModel<T[]>({ default: [] });

defineSlots<{
    [key: string]: (props: { row: { data: T; node: TreeNodeAuto<T> } }) => any;
}>();

const emits = defineEmits<{
    handleClickTree: [params: { data: T; node: TreeNode }];
    check: [data: T, nodes: CheckedInfo];
}>();

defineProps({
    defaultProps: {
        type: Object as PropType<IbaseTree>,
        default: () => ({ label: 'label', children: 'children' })
    },
    nodeKey: {
        type: String,
        default: () => ''
    },
    showCheckbox: {
        type: Boolean,
        default: () => false
    },
    defaultExpandAll: {
        type: Boolean,
        default: () => true
    },
    defaultCheckedKeys: {
        type: Array as PropType<string[]>,
        default: () => []
    },
    currentNodeKey: {
        type: String,
        default: () => ''
    },
    expandOnClick: {
        type: Boolean,
        default: () => false
    },
    filterNodeMethod: {
        type: Function as PropType<FilterNodeMethodFunction>,
        default: () => {}
    }
});

const treeRef = useTemplateRef('treeRef');

const handleNodeClick = (data: T, node: TreeNode) => {
    emits('handleClickTree', { data, node });
};

const handleNodeCheck = (data: T, nodes: CheckedInfo) => {
    emits('check', data, nodes);
};

const getNodeDetail = (type: TTreeMethods, params?: TTreeMethodsParams) => {
    let data;
    switch (type) {
        case 'append':
            if (checkKeysExist(params, ['data', 'parentNode']))
                data = treeRef.value!.append(params!.data!, params!.parentNode!);
            break;
        case 'filter':
            if (checkKeysExist(params, ['filterValue']))
                data = treeRef.value!.filter(params!.filterValue);
            break;
        case 'updateKeyChildren':
            if (checkKeysExist(params, ['key', 'data']))
                data = treeRef.value!.updateKeyChildren(params!.key!, params!.data!);
            break;
        case 'getCheckedNodes':
            if (checkKeysExist(params, ['leafOnly', 'includeHalfChecked']))
                data = treeRef.value!.getCheckedNodes(params!.leafOnly, params!.includeHalfChecked);
            break;
        case 'setCheckedNodes':
            if (checkKeysExist(params, ['nodes', 'leafOnly']))
                data = treeRef.value!.setCheckedNodes(params!.nodes!, params!.leafOnly);
            break;
        case 'getCheckedKeys':
            if (checkKeysExist(params, ['leafOnly']))
                data = treeRef.value!.getCheckedKeys(params!.leafOnly);
            break;
        case 'setCheckedKeys':
            if (checkKeysExist(params, ['keys', 'leafOnly']))
                data = treeRef.value!.setCheckedKeys(params!.keys!, params!.leafOnly);
            break;
        case 'setChecked':
            if (checkKeysExist(params, ['key', 'checked']))
                data = treeRef.value!.setChecked(params!.key!, params!.checked!, true);

            break;
        case 'getHalfCheckedNodes':
            data = treeRef.value!.getHalfCheckedNodes();
            break;
        case 'getHalfCheckedKeys':
            data = treeRef.value!.getHalfCheckedKeys();
            break;
        case 'getCurrentKey':
            data = treeRef.value!.getCurrentKey();
            break;
        case 'getCurrentNode':
            data = treeRef.value!.getCurrentNode();
            break;
        case 'setCurrentKey':
            if (checkKeysExist(params, ['key'])) data = treeRef.value!.setCurrentKey(params!.key);
            break;
        case 'setCurrentNode':
            if (checkKeysExist(params, ['node']))
                data = treeRef.value!.setCurrentNode(params!.node!);
            break;
        case 'getNode':
            if (checkKeysExist(params, ['key'])) data = treeRef.value!.getNode(params!.key!);
            break;
        case 'insertBefore':
            if (checkKeysExist(params, ['data', 'refNode']))
                data = treeRef.value!.insertBefore(params!.data!, params!.key!);
            break;
        case 'insertAfter':
            if (checkKeysExist(params, ['data', 'refNode']))
                data = treeRef.value!.insertAfter(params!.data!, params!.key!);
            break;
        case 'remove':
            if (checkKeysExist(params, ['data', 'refNode']))
                data = treeRef.value!.remove(params!.node!);
            break;
        default:
            break;
    }

    return data;
};

defineExpose({ getNodeDetail });
</script>

<style lang="scss" scoped>
.base-tree {
    :deep(.el-tree) {
        background: unset;
        .el-tree-node__content {
            height: 32px;
            color: rgba(0, 0, 0, 0.9);
            font-family: 'PingFang SC';
            font-size: 16px;
        }
    }
}
</style>
