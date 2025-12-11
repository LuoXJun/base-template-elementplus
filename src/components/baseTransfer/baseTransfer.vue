<template>
    <div class="transfer-tree">
        <div>
            <div class="transfer-tree-header">
                <div>
                    <el-checkbox
                        class="label"
                        v-model="isAllSelected"
                        :indeterminate="indeterminate"
                        @change="allSelected"
                        :label="label[0]"
                        size="large"
                    />
                    <span>({{ getNodeKeys(treeData).length }})</span>
                </div>
                <el-input
                    v-model="filterText"
                    style="max-width: 600px"
                    placeholder="请输入内容"
                    class="input-with-select"
                    @input="treeRef!.getNodeDetail('filter', { filterValue: filterText })"
                >
                    <template #append>
                        <el-button link>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </el-button>
                    </template>
                </el-input>
            </div>
            <div class="transfer-tree-content">
                <baseTree
                    ref="treeRef"
                    :tree-data="treeData"
                    show-checkbox
                    expand-on-click
                    :node-key="nodeKey ? nodeKey : autoProps.label"
                    :filter-node-method="filterNode"
                    @check="getCheckedData"
                >
                    <template #="{ row: { node, data } }">
                        <span :class="{ 'transfer-tree-is-disabled': data.disabled }">
                            {{ data[autoProps.label] }}
                        </span>
                    </template>
                </baseTree>
            </div>
        </div>
        <div></div>
        <div>
            <div class="transfer-tree-header">
                <div style="line-height: 40px">
                    <span class="label">{{ label[1] }}</span>
                    <span>({{ checkedLength }})</span>
                </div>
                <el-input
                    v-model="filterText1"
                    style="max-width: 600px"
                    placeholder="请输入内容"
                    class="input-with-select"
                    @input="treeRef1?.getNodeDetail('filter', { filterValue: filterText1 })"
                >
                    <template #append>
                        <el-button link>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </el-button>
                    </template>
                </el-input>
            </div>
            <div class="transfer-tree-content">
                <baseTree
                    ref="treeRef1"
                    :tree-data="checkedDataSet"
                    :default-expand-all="true"
                    expand-on-click
                    :filter-node-method="filterNode"
                >
                    <template #="{ row: { node, data } }">
                        <div class="transfer-tree-content-label">
                            <span :class="{ 'transfer-tree-is-disabled': data.disabled }">
                                {{ data[autoProps.label] }}
                            </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="10"
                                height="10"
                                viewBox="0 0 12 12"
                                fill="none"
                                @click="removeItem(data)"
                            >
                                <path
                                    d="M6.92852 5.99974L11.8147 1.11351C12.0617 0.86651 12.0617 0.461049 11.8147 0.21405L11.788 0.187297C11.541 -0.0596896 11.1355 -0.0596896 10.8885 0.187297L6.00231 5.07971L1.11608 0.18524C0.869093 -0.0617466 0.46362 -0.0617466 0.216633 0.18524L0.189868 0.211993C-0.0632894 0.45898 -0.0632894 0.864453 0.189868 1.11144L5.07612 5.99974L0.189868 10.886C-0.0571183 11.133 -0.0571183 11.5384 0.189868 11.7854L0.216633 11.8122C0.46362 12.0592 0.869093 12.0592 1.11608 11.8122L6.00231 6.92593L10.8886 11.8122C11.1355 12.0592 11.541 12.0592 11.788 11.8122L11.8148 11.7854C12.0617 11.5384 12.0617 11.133 11.8148 10.886L6.92852 5.99974Z"
                                    fill="#353A63"
                                />
                            </svg>
                        </div>
                    </template>
                </baseTree>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import baseTree from '../baseTree/base-tree.vue';
import type {
    CheckboxValueType,
    FilterNodeMethodFunction,
    FilterValue,
    TreeKey,
    TreeNodeData
} from 'element-plus';
import type { PropType } from 'vue';
import { useDeepClone } from '@/utils/useDeepClone';
import { filterTree } from '@/utils/getTreeNodes';
import { Search } from '@element-plus/icons-vue';
const emits = defineEmits(['onCheck']);

const props = defineProps({
    treeData: {
        type: Array as PropType<Array<Record<string, any>>>,
        default: () => {
            return [];
        }
    },
    autoProps: {
        type: Object as PropType<{ label: string }>,
        default: () => {
            return { label: 'label' };
        }
    },
    nodeKey: {
        type: String,
        default: () => ''
    },
    type: {
        type: String as PropType<'tree' | 'li'>,
        default: () => 'tree'
    },
    label: {
        type: Array as PropType<string[]>,
        default: () => {
            return ['所有', '已选'];
        }
    },
    checkedKeys: {
        type: Array as PropType<string[] | number[]>,
        default: () => []
    },
    filterNode: {
        type: Function as PropType<FilterNodeMethodFunction>,
        default: () => {}
    }
});

const isAllSelected = ref();
const treeRef = useTemplateRef('treeRef');
const treeRef1 = useTemplateRef('treeRef1');
const filterText = ref<FilterValue>();
const filterText1 = ref<FilterValue>();
const checkedDataSet = ref<TreeNodeData[]>([]);
const indeterminate = ref(false);
const checkedLength = ref(0);

watch(
    () => props.treeData,
    () => {
        checkedDataSet.value = [];
    }
);

watch(
    () => props.checkedKeys,
    () => {
        nextTick(() => {
            if (treeRef.value) {
                treeRef.value.getNodeDetail('setCheckedKeys', {
                    keys: props.checkedKeys,
                    leafOnly: false
                });
                getCheckedData();
            }
        });
    },
    { deep: true, immediate: true }
);

/**
 * 获取叶子节点数量
 * */
const getNodeKeys = (data: any[]) => {
    if (!data) data = props.treeData;
    const key = props.nodeKey ?? props.autoProps.label;
    const keys: string[] = [];
    data.forEach((v) => {
        if (v.children && v.children.length > 0) {
            keys.push(...getNodeKeys(v.children));
        } else {
            keys.push(v[key]);
        }
    });

    return Array.from(new Set(keys));
};

// 获取当前选中对象
const getCheckedData = () => {
    const key = props.nodeKey || props.autoProps.label;
    const checkedKeys: TreeKey[] = treeRef.value?.getNodeDetail('getCheckedKeys', {
        leafOnly: true
    }) as TreeKey[];
    checkedLength.value = checkedKeys.length;
    checkedDataSet.value = [];

    if (props.type === 'tree') {
        // 树形结构保持原样
        checkedDataSet.value = filterTree(useDeepClone(props.treeData), checkedKeys, key);
    } else {
        checkedDataSet.value = treeRef.value!.getNodeDetail('getCheckedNodes', {
            leafOnly: true,
            includeHalfChecked: false
        }) as TreeNodeData[];
    }

    //设置半选状态
    if (checkedKeys.length !== getNodeKeys(props.treeData).length && checkedKeys.length !== 0) {
        indeterminate.value = true;
    } else indeterminate.value = false;

    //设置全选状态
    if (checkedKeys.length === getNodeKeys(props.treeData).length) {
        isAllSelected.value = true;
    } else isAllSelected.value = false;

    emits('onCheck', checkedDataSet.value);
};

const removeItem = (data: TreeNodeData) => {
    const key = props.nodeKey ?? props.autoProps.label;
    treeRef.value?.getNodeDetail('setChecked', {
        key: data[key],
        checked: false
    });

    getCheckedData();
};

// 全选
const allSelected = (check: CheckboxValueType) => {
    indeterminate.value = false;

    const keys = getNodeKeys(props.treeData);
    if (check) {
        treeRef.value?.getNodeDetail('setCheckedKeys', { keys, leafOnly: true });
    } else {
        keys.forEach((key) => {
            treeRef.value?.getNodeDetail('setChecked', {
                key,
                checked: false
            });
        });
    }
    getCheckedData();
};
</script>

<style lang="scss">
.transfer-tree {
    display: flex;
    align-items: center;
    > div:nth-of-type(2) {
        display: flex;
        align-items: center;
        justify-items: center;
        padding: 0 12px;
        box-sizing: border-box;
        height: 352px;
        > div {
            display: flex;
            flex-direction: column;
            .el-button {
                margin: 0;
                margin-top: 16px;
                width: 24px;
                height: 24px;
                padding: 0;
                box-sizing: border-box;
            }
        }
    }
    > div:not(:nth-of-type(2)) {
        width: 332px;
        height: 352px;
        overflow: auto;
        box-sizing: border-box;
        padding: 16px;
        border-radius: 6px;
        border: 1px solid #d8dce2;
        .transfer-tree-header {
            > div:first-child {
                display: flex;
                align-items: center;
                .label {
                    color: #1e2945;
                    /* Body/Medium */
                    font-family: 'PingFang SC';
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 22px;
                }
                .el-input-group__append {
                    background: unset;
                    border: unset;
                }
            }
        }
        .transfer-tree-content {
            height: 245px;
            padding-right: 5px;
            overflow: auto;
            .el-tree-node.is-checked {
                .el-tree-node__content {
                    background: #f2f3ff;
                    color: #0052d9 !important;
                }
            }
            .el-tree-node {
                padding: 4px 0;

                .el-tree-node__content {
                    /* Body/Medium */
                    font-family: 'PingFang SC';
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 22px; /* 157.143% */
                    &:hover {
                        background: #f2f3ff;
                    }
                    .transfer-tree-is-disabled {
                        color: #757f96;
                        cursor: not-allowed;
                    }

                    .tree-item-label {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                        > div {
                            flex: 40px 0 0;
                            text-align: right;
                        }
                    }
                }
            }
            .transfer-tree-content-label {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                svg {
                    cursor: pointer;
                }
            }
        }
        .transfer-tree-content-right {
            color: #1e2945;

            /* --td-font-body-small */
            font-family: 'PingFang SC';
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: 20px; /* 166.667% */
            height: 245px;
            overflow: auto;
            padding-right: 5px;
            > div {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 10px 0;
                svg {
                    cursor: pointer;
                }
                .transfer-tree-content-right-item {
                    .el-button {
                        border-radius: 3px;
                        border: 1px solid #d8dce2;
                        background: #f1f3f5;
                        margin: 0 0 0 10px;
                        height: 20px;
                        padding: 2px;
                        color: rgba(0, 0, 0, 0.9);

                        /* --td-font-body-small */
                        font-family: 'PingFang SC';
                        font-size: 12px;
                        font-style: normal;
                        font-weight: 400;
                        line-height: 20px; /* 166.667% */
                        max-width: 218px;
                        overflow: hidden;
                    }
                }
            }
        }
    }
}
</style>
