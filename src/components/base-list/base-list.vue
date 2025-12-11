<template>
    <div class="base-list-class">
        <div class="base-list-container">
            <el-row>
                <el-row
                    v-for="item in list"
                    :key="item.label"
                    class="base-list-box"
                    :style="{
                        width: item.single ? 100 + '%' : 100 / column + '%'
                    }"
                >
                    <el-col
                        :span="getWidth(item.single, item.span ?? defaultSpan)"
                        :class="{ resetFlex: defaultWidth > 0 }"
                    >
                        <span>
                            {{ item[label] }}
                        </span>
                    </el-col>
                    <el-col
                        :span="24 - getWidth(item.single, item.span ?? defaultSpan)"
                        :style="{ flex: 1, maxWidth: 'unset' }"
                    >
                        <span v-if="item.prop">
                            <slot :name="item.prop" :row="item">
                                {{ item[value] }}
                            </slot>
                        </span>
                        <span v-else>
                            {{ item[value] || '/' }}
                        </span>
                    </el-col>
                </el-row>
            </el-row>
        </div>
    </div>
</template>

<script setup lang="ts">
const list = defineModel<ITableList[]>({ default: [{ label: 'label', value: 'value' }] });

const props = defineProps({
    /**默认一行展示两列*/
    column: {
        type: Number,
        default: () => {
            return 2;
        }
    },
    /**使用新的键值对代替label，value*/
    label: {
        type: String,
        default: () => {
            return 'label';
        }
    },
    value: {
        type: String,
        default: () => {
            return 'value';
        }
    },
    // 默认的label宽度,通过span控制
    defaultSpan: {
        type: Number,
        default: () => 8
    },
    // 默认宽度,当传入大于0的值时,label宽度会被设置为固定值,而不是使用span的值
    defaultWidth: {
        type: Number,
        default: () => 0
    }
});

const getWidth = computed(() => (single = false, span: number) => {
    if (single) return Math.round(span / props.column);
    else return Math.round(span / props.column) * props.column;
});
</script>

<style lang="scss" scoped>
.base-list-class {
    width: 100%;
    .base-list-container {
        border-left: 1px solid #caced1;
        box-sizing: border-box;
        width: 100%;
        .base-list-box {
            display: inline-flex;
            border: 1px solid #caced1;
            box-sizing: border-box;
            margin-bottom: -1px;
            border-left: 0;
            border-right: 0;
            .resetFlex {
                flex: unset;
                width: v-bind("defaultWidth+'px'");
                max-width: v-bind("defaultWidth+' px '");
            }
            > .el-col {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px;
                word-break: break-all;
                box-sizing: border-box;
                overflow: hidden;

                > span {
                    line-height: 26px;
                }
            }

            > .el-col:first-child {
                border-right: 1px solid #caced1;
                background-color: #f3f7fd;
                text-align: center;
            }
            > .el-col:last-child {
                border-right: 1px solid #caced1;
            }
        }
    }
}
</style>
