<template>
    <el-popover popper-class="base-popover-contaianr" :placement="placement" :visible="visible">
        <div class="base-popover">
            <div class="base-popover-header">
                <svg
                    v-if="type === 'normal'"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM10.996 8.50002V6.49611H12.9999V8.50002H10.996ZM12.9999 10L12.9999 17.5H10.9999V10L12.9999 10Z"
                        fill="#0052D9"
                    />
                </svg>
                <svg
                    v-else-if="type === 'warning'"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM11.0001 14H13.0001V6.49998H11.0001V14ZM13.004 15.5H11.0001V17.5039H13.004V15.5Z"
                        fill="#E37318"
                    />
                </svg>
                <img v-else src="./images/error-icon.svg" style="width: 24px" />
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
const visible = defineModel<boolean>({ default: false });

defineProps({
    content: {
        type: String,
        default: '12'
    },
    title: {
        type: String,
        default: '提示'
    },
    type: {
        type: String as PropType<TconfirmType>,
        default: 'normal'
    },
    placement: {
        type: String as PropType<TPlacement>,
        default: 'bottom-end'
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
