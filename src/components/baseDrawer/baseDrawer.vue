<template>
    <el-drawer
        class="base-drawer"
        v-model="dialogVisible"
        :close-on-click-modal="true"
        destroy-on-close
        :title="title"
        :append-to-body="append2Body"
        :with-header="false"
        :size="width"
        direction="rtl"
        :draggable="true"
        resizable
    >
        <div class="base-drawer-header">
            <p>{{ title }}</p>
            <el-icon @click="onCancel">
                <Close />
            </el-icon>
        </div>
        <div class="base-drawer-content">
            <slot></slot>
        </div>
        <div class="base-drawer-footer">
            <slot name="footer">
                <el-button style="background: #e5e7eb" @click="dialogVisible = false">
                    取消
                </el-button>
                <el-button class="confirmBtn" @click="emits('onConfirm')">保存</el-button>
            </slot>
        </div>
    </el-drawer>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue';
const dialogVisible = defineModel({ default: false });

const emits = defineEmits(['onConfirm', 'onCancel']);

const props = defineProps({
    title: {
        type: String,
        default: () => '标题'
    },
    width: {
        type: String,
        default: () => '80%'
    },
    append2Body: {
        type: Boolean,
        default: false
    }
});

const onCancel = () => {
    dialogVisible.value = false;
    emits('onCancel');
};
</script>

<style lang="scss">
.el-overlay {
    background-color: rgba(0, 0, 0, 0.4);
    .base-drawer {
        box-sizing: border-box;
        overflow: hidden;

        .el-drawer__body {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 0;
        }
    }
}
.base-drawer {
    .base-drawer-header {
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
        > img {
            cursor: pointer;
        }
    }
    .base-drawer-content {
        height: calc(100% - #{$base-panel-header-height} - #{$base-panel-footer-height});
        border-bottom: 1px solid #e5e7eb;
        padding: 16px;
        box-sizing: border-box;
    }
    .base-drawer-footer {
        height: $base-panel-footer-height;
        line-height: $base-panel-footer-height;
        padding: 0 32px;
        width: 100%;
        text-align: right;
        box-sizing: border-box;
    }
}
</style>
