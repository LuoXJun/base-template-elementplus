<template>
    <div>
        <baseTable
            ref="baseTableRef"
            v-model="tableData"
            v-model:page-info="pageInfo"
            :table-column="tableColumnConfig"
            @on-page-change="onPageChange"
        >
            <template #operation="{ scope }">
                <el-button type="primary" link @click="edit(scope)">编辑</el-button>
            </template>
        </baseTable>
        <br />
    </div>
    <div style="width: 100%">
        <baseList v-model="list" :column="3">
            <template #test3="{ row }">
                <el-button>{{ row.value }}</el-button>
            </template>
        </baseList>
    </div>
</template>

<script setup lang="ts">
import baseTable from '@/components/baseTable/baseTable.vue';
import baseList from '@/components/baseList/baseList.vue';

import { tableColumnConfig } from './config';

const baseTableRef = useTemplateRef('baseTableRef');

const pageInfo = reactive<PageInfo>({
    pageNum: 1,
    pageSize: 10,
    total: 100
});
const tableData = ref([
    {
        num1: '测试1',
        num2: '测试2',
        num3: '测试3'
    },
    {
        num1: '测试1',
        num2: '测试2',
        num3: '测试3',
        num4: '测试4',
    }
]);

// 设置默认选中状态
onMounted(() => {
    baseTableRef.value!.toggleRowSelection(tableData.value[0]);
});

const onPageChange = () => {
    console.log(pageInfo);
};

const edit = (scope: any) => {
    console.log(scope.row);
};

// 行列式表格
const list = ref<ITableList[]>([
    { label: 'label', value: '一行三列', prop: 'test1' },
    { label: 'label', value: '内容2', prop: 'test2' },
    { label: 'label', value: '自定义插槽', prop: 'test3' },
    { label: 'label', value: '独占一行', prop: 'test4', single: true }
]);
</script>

<style scoped></style>
