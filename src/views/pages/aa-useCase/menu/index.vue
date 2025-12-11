<template>
    <div>
        <el-button @click="isHorizontalMenu = true">
            水平菜单布局
            <el-icon v-if="isHorizontalMenu">
                <Check />
            </el-icon>
        </el-button>
        <br />
        <br />
        <el-button @click="isHorizontalMenu = false">
            垂直菜单布局
            <el-icon v-if="!isHorizontalMenu">
                <Check />
            </el-icon>
        </el-button>
    </div>
</template>

<script setup lang="ts">
import { isHorizontalMenu } from '@/views/config';
import { Check } from '@element-plus/icons-vue';
</script>

<style scoped></style>
