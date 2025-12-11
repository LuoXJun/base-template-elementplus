<template>
    <div class="base-dialog">
        <el-dialog
            v-model="dialogVisible"
            align-center
            :close-on-click-modal="true"
            destroy-on-close
            :title="title"
            :style="{ height, width }"
            @close="emits('onClose')"
            :show-close="false"
            :draggable="draggable"
        >
            <template #header>
                <div class="base-dialog-header">
                    <p>{{ title }}</p>
                    <el-icon @click="onCancel">
                        <Close />
                    </el-icon>
                </div>
            </template>
            <div class="base-dialog-content">
                <slot></slot>
            </div>
            <div class="base-dialog-footer">
                <slot name="footer">
                    <el-button style="background: #e5e7eb" @click="dialogVisible = false">
                        取消
                    </el-button>
                    <el-button class="confirmBtn" @click="emits('onConfirm')">保存</el-button>
                </slot>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue';
const dialogVisible = defineModel({ default: false });

const emits = defineEmits(['onConfirm', 'onCancel', 'onClose']);

defineProps({
    title: {
        type: String,
        default: () => '标题'
    },
    width: {
        type: String,
        default: () => '1104px'
    },
    height: {
        type: String,
        default: () => '650px'
    },
    draggable: {
        type: true,
        default: () => true
    }
});

const onCancel = () => {
    dialogVisible.value = false;
    emits('onCancel');
};
</script>

<style lang="scss">
.base-dialog {
    .el-overlay {
        background-color: rgba(0, 0, 0, 0.4);
        .el-dialog {
            padding: 0;
            box-sizing: border-box;
            border-radius: 8px;
            overflow: hidden;

            .el-dialog__header {
                padding-bottom: 0;
            }
            .el-dialog__body {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
        }
    }
    .base-dialog-header {
        height: $base-panel-header-height;
        background: $primary;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        box-sizing: border-box;

        color: #fff;

        font-family: 'PingFang SC';
        font-size: 18px;
        font-style: normal;
        font-weight: 600;
        line-height: 26px; /* 144.444% */
        > .el-icon {
            cursor: pointer;
        }
    }
    .base-dialog-content {
        height: calc(100% - #{$base-panel-header-height} - #{$base-panel-footer-height});
        border-bottom: 1px solid #e5e7eb;
        padding: 40px 32px;
        box-sizing: border-box;
        overflow: auto;
    }
    .base-dialog-footer {
        height: $base-panel-footer-height;
        line-height: $base-panel-footer-height;
        padding: 0 32px;
        width: 100%;
        text-align: right;
        box-sizing: border-box;
    }
}
</style>
