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
            @row-click="rowCilck"
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
                        <!-- 非操作列：保持原有插槽 / 原始值渲染 -->
                        <template v-if="item.filed !== 'operation'">
                            <slot
                                :name="item.filed"
                                :scope="{
                                    row: scope.row,
                                    $index: scope.$index,
                                    column: item.filed
                                }"
                            >
                                {{ scope.row[item.filed] ?? '/' }}
                            </slot>
                        </template>

                        <template v-else>
                            <template v-if="item.operations?.length">
                                <!-- 常规按钮（isDropdown 为 false 或未设置的） -->
                                <template
                                    v-for="op in getPrimaryOps(item.operations)"
                                    :key="op.type"
                                >
                                    <template v-if="isVisible(op, scope.row)">
                                        <base-popover
                                            v-if="op.confirm?.mode === 'popover'"
                                            v-model="scope.row[op.type + 'basePopoverVisible']"
                                            :content="op.confirm.content"
                                            :title="op.confirm.title ?? '提示'"
                                            :type="op.confirm.confirmType ?? 'warning'"
                                            @on-confirm="emits('operation', op.type, scope.row)"
                                        >
                                            <el-button
                                                :class="[op.className]"
                                                :type="op.btnType ?? 'primary'"
                                                :link="op.link ?? false"
                                                :disabled="isDisabled(op, scope.row)"
                                                @click="
                                                    scope.row[op.type + 'basePopoverVisible'] = true
                                                "
                                            >
                                                {{ op.label }}
                                            </el-button>
                                        </base-popover>

                                        <!-- 普通按钮 / messageBox 确认模式 -->
                                        <el-button
                                            v-else
                                            :type="op.btnType ?? 'primary'"
                                            :link="op.link ?? false"
                                            :class="[op.className]"
                                            :disabled="isDisabled(op, scope.row)"
                                            @click="onOperationClick(op, scope.row)"
                                        >
                                            {{ op.label }}
                                        </el-button>
                                    </template>
                                </template>

                                <!-- 下拉菜单 -->
                                <el-dropdown
                                    v-if="getDropdownOps(item.operations).length"
                                    :hide-on-click="false"
                                    placement="bottom-start"
                                    style="height: 30px"
                                >
                                    <el-button link>
                                        &emsp;
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="3"
                                            viewBox="0 0 14 3"
                                            fill="none"
                                        >
                                            <path
                                                d="M2.10526 0C2.29138 4.36211e-09 2.46987 0.0739349 2.60148 0.205539C2.73308 0.337144 2.80702 0.515638 2.80702 0.701755V2.10526C2.80702 2.29138 2.73308 2.46987 2.60148 2.60148C2.46987 2.73308 2.29138 2.80702 2.10526 2.80702H0.701754C0.515638 2.80702 0.337144 2.73308 0.205539 2.60148C0.0739347 2.46987 4.36211e-09 2.29138 0 2.10526V0.701755C4.36211e-09 0.515638 0.0739347 0.337144 0.205539 0.205539C0.337144 0.0739349 0.515638 4.36211e-09 0.701754 0H2.10526ZM7.36842 0C7.55454 4.36211e-09 7.73303 0.0739349 7.86464 0.205539C7.99624 0.337144 8.07018 0.515638 8.07018 0.701755V2.10526C8.07018 2.29138 7.99624 2.46987 7.86464 2.60148C7.73303 2.73308 7.55454 2.80702 7.36842 2.80702H5.96491C5.7788 2.80702 5.6003 2.73308 5.4687 2.60148C5.33709 2.46987 5.26316 2.29138 5.26316 2.10526V0.701755C5.26316 0.515638 5.33709 0.337144 5.4687 0.205539C5.6003 0.0739349 5.7788 4.36211e-09 5.96491 0H7.36842ZM12.6316 0C12.8177 4.36211e-09 12.9962 0.0739349 13.1278 0.205539C13.2594 0.337144 13.3333 0.515638 13.3333 0.701755V2.10526C13.3333 2.29138 13.2594 2.46987 13.1278 2.60148C12.9962 2.73308 12.8177 2.80702 12.6316 2.80702H11.2281C11.042 2.80702 10.8635 2.73308 10.7319 2.60148C10.6003 2.46987 10.5263 2.29138 10.5263 2.10526V0.701755C10.5263 0.515638 10.6003 0.337144 10.7319 0.205539C10.8635 0.0739349 11.042 4.36211e-09 11.2281 0H12.6316Z"
                                                fill="#0266F0"
                                            />
                                        </svg>
                                    </el-button>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item
                                                v-for="op in getDropdownOps(item.operations)"
                                                :key="op.type"
                                            >
                                                <template v-if="isVisible(op, scope.row)">
                                                    <el-button
                                                        :type="op.btnType ?? 'primary'"
                                                        :link="op.link ?? false"
                                                        :class="[op.className]"
                                                        :disabled="isDisabled(op, scope.row)"
                                                        @click="onOperationClick(op, scope.row)"
                                                    >
                                                        {{ op.label }}
                                                    </el-button>
                                                </template>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </template>
                        </template>
                    </template>
                </el-table-column>
            </template>
        </el-table>
    </div>
</template>

<script setup lang="ts" generic="T extends DefaultRow">
import type { TableInstance } from 'element-plus';
import { type PropType } from 'vue';
import { messageBox } from '@/components/baseMessageBox';
import type { DefaultRow } from 'element-plus/es/components/table/src/table/defaults.mjs';
import basePopover from '@/components/basePopover/basePopover.vue';

const emits = defineEmits<{
    selected: [data: { value: T[]; row?: T; type: 'change' | 'select' | 'selectAll' }];
    currentChange: [row: T | null];
    rowClick: [row: T];
    operation: [type: operationType, row: T];
}>();

defineSlots<{
    [key: string]: (props: { scope: { row: T; $index: number; column: string } }) => any;
}>();

const tableData = defineModel<T[]>({ default: () => [] });

defineProps({
    tableColumn: {
        type: Array as PropType<ITableColumn[]>,
        default: () => {
            return [];
        }
    },
    index: {
        type: Boolean,
        default: false
    },
    selection: {
        type: Boolean,
        default: false
    },
    options: {
        type: Object as PropType<ITable>,
        default: () => {
            return {
                border: false
            };
        }
    },
    rowKey: {
        type: String,
        default: ''
    },
    pageInfo: {
        type: Object as PropType<PageInfo>,
        default: () => {
            return {
                pageSize: 10,
                pageNum: 1
            };
        }
    },
    highlightCurrentRow: {
        type: Boolean,
        default: false
    }
});

const multipleTableRef = ref<TableInstance>();

/** 获取不在下拉菜单中的操作按钮 */
function getPrimaryOps(operations: ITableOperation[]): ITableOperation[] {
    return operations.filter((op) => {
        return !op.isDropdown;
    });
}

/** 获取需放入下拉菜单的操作按钮 */
function getDropdownOps(operations: ITableOperation[]): ITableOperation[] {
    return operations.filter((op) => {
        return op.isDropdown;
    });
}

const isVisible = (op: ITableOperation, data?: any) => {
    if (op.visible === true || op.visible === false) return op.visible;
    else if (op.visibility) return op.visibility(data);
    return true;
};

const isDisabled = (op: ITableOperation, data?: any) => {
    if (op.disabled === true || op.disabled === false) return op.disabled;
    else if (op.disabledFoo) return op.disabledFoo(data);
    return false;
};

/** 处理普通操作按钮点击（含 messageBox 确认模式） */
async function onOperationClick(op: ITableOperation, row: T): Promise<void> {
    if (op.confirm?.mode === 'messageBox') {
        await messageBox({
            type: op.confirm.confirmType ?? 'warning',
            title: op.confirm.title ?? '提示',
            message: op.confirm.content
        });
        emits('operation', op.type, row);

        return;
    }
    emits('operation', op.type, row);
}

const handleSelectionChange = (value: T[]) => {
    emits('selected', { value, type: 'change' });
};
const select = (value: T[], row: T) => {
    emits('selected', { value, row, type: 'select' });
};
const selectAll = (value: T[]) => {
    emits('selected', { value, type: 'selectAll' });
};

const toggleRowSelection = (row: T) => {
    multipleTableRef.value!.toggleRowSelection(row, true);
};

const currentChange = (row: T | null) => {
    emits('currentChange', row);
};

const rowCilck = (row: T) => {
    emits('rowClick', row);
};

const callBackInstance = (callback: (tableInstance: typeof multipleTableRef) => void) => {
    callback(multipleTableRef);
};

defineExpose({ toggleRowSelection, callBackInstance });
</script>

<style lang="scss" scoped>
.base-table {
    width: 100%;
    max-height: 100%;
    // .checkAll {
    //     position: relative;
    //     text-align: left !important;
    // }

    // .checkAll .cell::after {
    //     color: #909399;
    //     font-size: 13px;
    //     font-weight: bold;
    //     content: '全选';
    //     display: block;
    //     position: absolute;
    //     z-index: 1;
    //     left: 35px;
    // }
    :deep(.el-table) {
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
            color: #141313;
        }
    }
}
</style>
