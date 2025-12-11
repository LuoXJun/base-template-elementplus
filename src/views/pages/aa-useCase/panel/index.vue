<template>
    <div>
        <el-button-group>
            <el-button @click="basePanelVisible = !basePanelVisible">basePanel</el-button>
            <basePopover
                v-model="basePopoverVisible"
                content="这是一个err-popover"
                placement="bottom-end"
                type="error"
            >
                <el-button @click="basePopoverVisible = !basePopoverVisible">basePopover</el-button>
            </basePopover>
            <el-button @click="baseDialogVisible = !baseDialogVisible">baseDialog</el-button>
            <el-button @click="baseDrawerVisible = !baseDrawerVisible">baseDrawer</el-button>
        </el-button-group>
        <basePanel v-model="basePanelVisible">content...</basePanel>
        <!-- 比起panel 功能更丰富 -->
        <baseDialog v-model="baseDialogVisible">content...</baseDialog>
        <baseDrawer v-model="baseDrawerVisible">content...</baseDrawer>
    </div>
</template>

<script setup lang="ts">
import basePanel from '@/components/base-panel/base-panel.vue';
import basePopover from '@/components/basePopover/basePopover.vue';
import baseDialog from '@/components/baseDialog/baseDialog.vue';
import baseDrawer from '@/components/baseDrawer/baseDrawer.vue';

const basePanelVisible = ref(false);
const basePopoverVisible = ref(false);
const baseDialogVisible = ref(false);
const baseDrawerVisible = ref(false);
</script>

<style scoped></style>
