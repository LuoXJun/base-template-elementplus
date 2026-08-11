<template>
    <el-form
        ref="baseFormRef"
        :model="modelValue"
        :label-width="labelWidth"
        :rules="rules"
        class="lxj-base-form-class"
        :label-position="labelPosition"
    >
        <el-row>
            <template v-for="item in formItemList" :key="item.type">
                <baseFormItem
                    v-if="item.isShow !== false"
                    v-model="modelValue"
                    :form-item-data="item"
                    @on-change="onChange"
                >
                    <template #[item.filed]>
                        <slot :name="item.filed" :scope="item" />
                    </template>
                </baseFormItem>
            </template>
            <div style="flex: 1; text-align: right">
                <slot name="footer" :data="{ modelValue, validate }" />
            </div>
        </el-row>
    </el-form>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { type PropType } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import baseFormItem from './baseFormItem.vue';

const modelValue = defineModel<T>('modelValue', {
    default: () => ({}) as T
});

const emits = defineEmits<{
    onChange: [{ filed: keyof T; value: any }];
}>();

defineProps({
    rules: {
        type: Object as PropType<FormRules>,
        default: () => ({})
    },
    labelWidth: {
        type: String,
        default: () => '80px'
    },
    labelPosition: {
        type: String as PropType<'left' | 'top' | 'right'>,
        default: () => 'left'
    },
    formItemList: {
        type: Array as PropType<IformItem<{ filed: Extract<keyof T, string>; data?: any[] }>[]>,
        default: () => []
    },
    layout: {
        type: Object as PropType<any>,
        default: () => ({
            xl: 6,
            lg: 6,
            md: 8,
            sm: 12,
            xs: 24
        })
    }
});

const baseFormRef = ref<FormInstance>();

// 验证
const validate = () => {
    return new Promise((res) => {
        baseFormRef.value?.validate((valid) => {
            if (valid) {
                return res(true);
            }
            ElMessage.warning('请完成填写表单项');
        });
    });
};

const onChange = (filed: keyof T, val: any) => {
    emits('onChange', { filed, value: val });
};

defineExpose({ validate });
</script>

<style lang="scss">
.lxj-base-form-class {
    .el-input,
    .el-form-item__content,
    .el-select__wrapper,
    .el-input__wrapper {
        width: 200px !important;
    }
    .el-col {
        padding: 0 5px;
    }

    .el-tooltip__trigger.el-tooltip__trigger {
        display: flex;
        align-items: center;
    }
    .el-form-item__label {
        display: flex !important;
    }
}
.base-form-tooltip {
    width: 244px;
    white-space: wrap;
    padding: 4px 8px;
    border-radius: 6px;
}
</style>
