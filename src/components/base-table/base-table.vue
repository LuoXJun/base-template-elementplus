<template>
    <div class="base-table">
        <el-table
            ref="multipleTableRef"
            :data="tableData"
            v-bind="options"
            :row-key="rowKey"
            :highlight-current-row="highlightCurrentRow"
            @selection-change="handleSelectionChange"
            @select="select"
            @select-all="selectAll"
            @current-change="currentChange"
        >
            <el-table-column
                v-if="selection"
                type="selection"
                width="80"
                align="center"
                label-class-name="checkAll"
            />
            <el-table-column v-if="index" type="index" width="70" label="序号" align="center">
                <template #default="scope">
                    {{ (pageInfo.pageNum - 1) * pageInfo.pageSize + (scope.$index + 1) }}
                </template>
            </el-table-column>

            <template v-for="item in tableColumn" :key="item.filed">
                <el-table-column
                    v-if="item.isShowColumn ?? true"
                    :label="item.label"
                    :property="item.filed"
                    align="center"
                    v-bind="item.options"
                >
                    <template #default="scope">
                        <slot :name="item.filed" :scope="scope">
                            {{ scope.row[item.filed] ?? '/' }}
                        </slot>
                    </template>
                </el-table-column>
            </template>
        </el-table>
        <basePagination
            v-if="pageInfo.total"
            v-model="pageInfo"
            @handle-change="emits('onPageChange')"
        />
    </div>
</template>

<script setup lang="ts">
import type { ElTable } from 'element-plus';
import { type PropType } from 'vue';
import basePagination from '../base-pagination/base-pagination.vue';
const emits = defineEmits(['selected', 'currentChange', 'onPageChange']);

const tableData = defineModel<Record<string, any>[]>({ default: [] });
const pageInfo = defineModel<PageInfo>('pageInfo', {
    default: {
        pageSize: 10,
        pageNum: 1,
        total: 0
    }
});

const props = defineProps({
    tableColumn: {
        type: Array as PropType<ITableColumn[]>,
        default: () => []
    },
    index: {
        type: Boolean,
        default: () => true
    },
    selection: {
        type: Boolean,
        default: () => true
    },
    options: {
        type: Object as PropType<ITable>,
        default: () => ({
            border: false
        })
    },
    rowKey: {
        type: String,
        default: () => ''
    },
    highlightCurrentRow: {
        type: Boolean,
        default: () => true
    }
});
const multipleTableRef = ref<InstanceType<typeof ElTable>>();

const handleSelectionChange = (value: any) => {
    emits('selected', { value, type: 'change' });
};
const select = (value: any, row: any) => {
    emits('selected', { value, row, type: 'select' });
};
const selectAll = (value: any) => {
    emits('selected', { value, type: 'selectAll' });
};

const toggleRowSelection = (row: Record<string, any>) => {
    multipleTableRef.value!.toggleRowSelection(row, true);
};

// 高亮行改变时
const currentChange = (row: Record<string, any>) => {
    emits('currentChange', row);
};

defineExpose({ toggleRowSelection });
</script>

<style lang="scss">
.base-table {
    width: 100%;
    max-height: 100%;
    .checkAll {
        position: relative;
        text-align: left !important;
    }

    .checkAll .cell::after {
        color: #909399;
        font-size: 13px;
        font-weight: bold;
        content: '全选';
        display: block;
        position: absolute;
        z-index: 1;
        left: 35px;
    }

    .cell,
    .el-button {
        font-family: 'PingFang SC';
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 24px; /* 171.429% */
    }

    thead .cell {
        color: #757f96;
    }
    tbody .cell {
        color: #131414;
    }
}
</style>
