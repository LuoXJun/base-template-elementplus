<template>
    <div class="confirmDialog">
        <el-dialog
            v-model="dialogVisible"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :title="title"
            :width="width"
            :style="{ height: height + 'px' }"
            @closed="handleClosed"
        >
            <div class="confirmDialog-title">
                <div>
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
                <img src="./images/close.svg" @click="handleCancel" />
            </div>
            <div class="confirmDialog-content">
                <slot name="content">
                    {{ message }}
                </slot>
            </div>
            <div class="footer">
                <slot>
                    <el-button v-if="showCancelButton" class="cancelBtn" @click="handleCancel">
                        {{ cancelButtonText }}
                    </el-button>
                    <el-button class="confirmBtn" @click="handleConfirm">
                        {{ confirmButtonText }}
                    </el-button>
                </slot>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import type { ConfirmBoxProps } from './messageBox.type';

const {
    title = '提示',
    message = '是否确定执行操作',
    type = 'normal',
    width = 416,
    height = 158,
    confirmButtonText = '确认',
    cancelButtonText = '取消',
    showCancelButton = true
} = defineProps<ConfirmBoxProps>();

const dialogVisible = defineModel<boolean>({ default: false });
const emits = defineEmits(['confirm', 'cancel', 'closed']);

let pendingAction: 'confirm' | 'cancel' = 'cancel';

function handleConfirm() {
    pendingAction = 'confirm';
    dialogVisible.value = false;
}

function handleCancel() {
    pendingAction = 'cancel';
    dialogVisible.value = false;
}

function handleClosed() {
    if (pendingAction === 'confirm') {
        emits('confirm');
    } else {
        emits('cancel');
    }
    emits('closed');
}
</script>

<style lang="scss">
.confirmDialog {
    .el-overlay {
        background-color: rgba(0, 0, 0, 0.4);
        .el-dialog {
            padding: 32px;
            margin: 0;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-sizing: content-box;

            .el-dialog__header {
                display: none;
            }
            .el-dialog__body {
                display: flex;
                flex-direction: column;
                height: 100%;
                .confirmDialog-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    img {
                        cursor: pointer;
                    }
                    > div {
                        display: flex;
                        align-items: center;
                        > span {
                            margin-left: 8px;

                            overflow: hidden;
                            color: var(--text-icon-font-gy-190-primary, rgba(0, 0, 0, 0.9));
                            text-overflow: ellipsis;
                            white-space: nowrap;

                            /* Title/Medium */
                            font-family: 'PingFang SC';
                            font-size: 16px;
                            font-style: normal;
                            font-weight: 600;
                            line-height: 24px; /* 150% */
                        }
                    }
                }
                .confirmDialog-content {
                    font-family: 'PingFang SC';
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: normal;
                    margin-top: 16px;
                    line-height: 22px;
                    color: rgba(0, 0, 0, 0.6);
                }
                .footer {
                    flex: 1;
                    display: flex;
                    justify-content: end;
                    align-items: end;
                    gap: 12px;
                    .el-button {
                        height: 22px;
                        padding: 5px 16px;
                        box-sizing: content-box;
                    }
                    .confirmBtn {
                        background-color: #0052d9;
                        color: #fff;
                    }
                    .cancelBtn {
                        background-color: #fff;
                        border: 1px solid #dcdfe6;
                        color: #606266;
                    }
                }
            }
        }
    }
}
</style>
