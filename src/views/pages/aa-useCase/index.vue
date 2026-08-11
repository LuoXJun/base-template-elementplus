<template>
    <div>
        <baseTabs v-model="activeName" :labels="labels">
            <br />
            <Form v-if="activeName === labels[0]" />
            <Menu v-else-if="activeName === labels[1]" />
            <Panel v-else-if="activeName === labels[2]" />
            <Table v-else-if="activeName === labels[3]" />
            <Tree v-else />
        </baseTabs>
    </div>
</template>

<script setup lang="ts">
import baseTabs from '@/components/baseTabs/baseTabs.vue';
import Form from './form/index.vue';
import Menu from './menu/index.vue';
import Panel from './panel/index.vue';
import Table from './table/index.vue';
import Tree from './tree/index.vue';

const labels = ['表单', '菜单', '弹出框', '表格', '树', '其他'];
const activeName = ref(labels[0]);
</script>

<style scoped></style>
