<template>
    <el-popover popper-class="base-popover-contaianr" :placement="placement" :visible="visible">
        <div class="base-popover">
            <div class="base-popover-header">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    v-if="type === 'normal'"
                >
                    <path
                        d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM10.996 8.50002V6.49611H12.9999V8.50002H10.996ZM12.9999 10L12.9999 17.5H10.9999V10L12.9999 10Z"
                        fill="#0052D9"
                    />
                </svg>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    v-else-if="type === 'warning'"
                >
                    <path
                        d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM11.0001 14H13.0001V6.49998H11.0001V14ZM13.004 15.5H11.0001V17.5039H13.004V15.5Z"
                        fill="#E37318"
                    />
                </svg>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    v-else
                >
                    <path
                        d="M10 18.75C14.8325 18.75 18.75 14.8325 18.75 10C18.75 5.16751 14.8325 1.25 10 1.25C5.16751 1.25 1.25 5.16751 1.25 10C1.25 14.8325 5.16751 18.75 10 18.75ZM9.24988 5H10.7498V6.49994H9.24988V5ZM9.38202 8.125H10.632V14.9997H9.38202V8.125Z"
                        fill="#D54941"
                    />
                </svg>
                <span>{{ title }}</span>
            </div>
            <div class="base-popover-content">{{ content }}</div>
            <div class="base-popover-footer">
                <el-button class="cancelBtn" @click="visible = false">取消</el-button>
                <el-button class="confirmBtn" @click="submit">确认</el-button>
            </div>
        </div>
        <template #reference>
            <slot></slot>
        </template>
    </el-popover>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
const emits = defineEmits(['onConfirm']);
const visible = defineModel({ default: false });

defineProps({
    content: {
        type: String,
        default: () => '12'
    },
    title: {
        type: String,
        default: () => '提示'
    },
    type: {
        type: String as PropType<TconfirmType>,
        default: 'normal'
    },
    placement: {
        type: String as PropType<TPlacement>,
        default: () => 'bottom-end'
    }
});

const submit = () => {
    emits('onConfirm');
};
</script>

<style lang="scss">
.base-popover-contaianr {
    width: 352px !important;
    height: 124px !important;
    padding: 16px;
    box-sizing: border-box;
    .base-popover {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        .base-popover-header {
            display: flex;
            align-items: center;
            padding-bottom: 8px;

            color: rgba(0, 0, 0, 0.9);

            /* --td-font-title-small */
            font-family: 'PingFang SC';
            font-size: 14px;
            font-style: normal;
            font-weight: 600;
            line-height: 22px; /* 157.143% */
            > span {
                margin-left: 8px;
            }
        }
        .base-popover-content {
            flex: 1 0 0;
            padding-left: 20px;
            color: rgba(0, 0, 0, 0.6);

            /* --td-font-body-medium */
            font-family: 'PingFang SC';
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
        }
        .base-popover-footer {
            display: flex;
            justify-content: flex-end;
            width: 100%;
            text-align: right;
            height: 24px;
            // margin-bottom: 16px;
            .el-button {
                font-size: 12px;
                height: 20px !important;
                width: 24px !important;
                padding: 4px 8px !important;
                box-sizing: content-box !important;
            }
        }
    }
}
</style>
