<template>
    <div
        v-if="dialogVisible"
        ref="basePanelRef"
        class="base-panel"
        :style="{ height, width }"
        :title="title"
    >
        <div
            ref="triggerRef"
            class="base-panel-header"
            :style="{ cursor: draggable ? 'move' : 'unset' }"
        >
            <p>{{ title }}</p>
            <el-icon @click="onCancel"><Close /></el-icon>
        </div>
        <div class="base-panel-content">
            <slot></slot>
        </div>
        <div class="base-panel-footer">
            <slot name="footer">
                <el-button style="background: #e5e7eb" @click="dialogVisible = false">
                    取消
                </el-button>
                <el-button class="confirmBtn" @click="emits('onConfirm')">保存</el-button>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue';
const dialogVisible = defineModel({ default: false });
import { useDraggable } from 'element-plus';

const emits = defineEmits(['onConfirm', 'onCancel', 'onClose']);

const props = defineProps({
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

// 需要移动的目标
const basePanelRef = useTemplateRef('basePanelRef');
// 触发移动事件的目标
const triggerRef = useTemplateRef('triggerRef');
const drag = computed(() => {
    return props.draggable;
});
useDraggable(basePanelRef as Ref<HTMLElement>, triggerRef as Ref<HTMLElement>, drag);

const onCancel = () => {
    dialogVisible.value = false;
    emits('onCancel');
};
</script>

<style lang="scss" scoped>
.base-panel {
    position: fixed;
    padding: 0;
    margin: 0;
    right: 100px;
    top: 100px;
    user-select: none;
    box-sizing: border-box;
    border-radius: 8px;
    overflow: hidden;
    background-color: #fff;

    .base-panel-header {
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
    .base-panel-content {
        height: calc(100% - #{$base-panel-header-height} - #{$base-panel-footer-height});
        border-bottom: 1px solid #e5e7eb;
        padding: 40px 32px;
        box-sizing: border-box;
        overflow: auto;
    }
    .base-panel-footer {
        height: $base-panel-footer-height;
        line-height: $base-panel-footer-height;
        padding: 0 32px;
        width: 100%;
        text-align: right;
        box-sizing: border-box;
    }
}
</style>
