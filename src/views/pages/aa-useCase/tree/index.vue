<template>
    <el-row>
        <el-col :span="8">
            树
            <baseTree v-model="data" show-checkbox>
                <template #="{ row: { data, node } }">
                    <span>{{ data.label }}</span>
                </template>
            </baseTree>
        </el-col>
        <el-col :span="8">
            获取选中项并保持原有结构
            <baseTransfer
                type="tree"
                v-model="data"
                node-key="id"
                :filter-node="filterNode"
                :checked-keys="checkedKeys"
            />
        </el-col>
        <el-col :span="8">
            仅获取选中项自身
            <baseTransfer
                type="li"
                v-model="data"
                node-key="id"
                :filter-node="filterNode"
                :checked-keys="checkedKeys"
            />
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import baseTree from '@/components/baseTree/baseTree.vue';
import baseTransfer from '@/components/baseTransfer/baseTransfer.vue';
import type { FilterNodeMethodFunction } from 'element-plus';

const data = [
    {
        id: 1,
        label: 'Level one 1',
        children: [
            {
                id: 4,
                label: 'Level two 1-1',
                children: [
                    {
                        id: 9,
                        label: 'Level three 1-1-1'
                    },
                    {
                        id: 10,
                        label: 'Level three 1-1-2'
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        label: 'Level one 2',
        children: [
            {
                id: 5,
                label: 'Level two 2-1'
            },
            {
                id: 6,
                label: 'Level two 2-2'
            }
        ]
    },
    {
        id: 3,
        label: 'Level one 3',
        children: [
            {
                id: 7,
                label: 'Level two 3-1'
            },
            {
                id: 8,
                label: 'Level two 3-2'
            }
        ]
    }
];

const checkedKeys = [9, 8];

const filterNode: FilterNodeMethodFunction = (value, data) => {
    if (!value) return true;
    if (data.label.includes(value)) return true;
    return false;
};
</script>

<style scoped></style>
