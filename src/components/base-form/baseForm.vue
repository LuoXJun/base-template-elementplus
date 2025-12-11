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
                <el-col
                    v-bind="item.useLayout == false ? undefined : layout"
                    :span="item.span"
                    v-if="item.isShow !== false"
                >
                    <el-form-item
                        :label="item.label"
                        :label-width="item.labelWidth"
                        :prop="item.filed"
                        :rules="item.rules"
                        :label-position="item.labelPosition"
                    >
                        <template #label="{ label }">
                            <div class="base-form-label">
                                <span>{{ label }}</span>
                                <el-tooltip
                                    v-if="item.description"
                                    popper-class="base-form-tooltip"
                                    :trigger="item.description.trigger"
                                    :content="item.description.content"
                                    :placement="item.description.placement ?? 'bottom-start'"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                        style="margin-left: 2px; cursor: pointer"
                                        v-if="item.description"
                                    >
                                        <path
                                            d="M7.33317 13.6663C3.65139 13.6663 0.666504 10.6815 0.666504 6.99967C0.666504 3.3179 3.65139 0.333008 7.33317 0.333008C11.0149 0.333008 13.9998 3.3179 13.9998 6.99967C13.9998 10.6815 11.0149 13.6663 7.33317 13.6663ZM7.33317 12.7775C10.5243 12.7775 13.1109 10.1908 13.1109 6.99967C13.1109 3.80856 10.5243 1.2219 7.33317 1.2219C4.14206 1.2219 1.55539 3.80856 1.55539 6.99967C1.55539 10.1908 4.14206 12.7775 7.33317 12.7775Z"
                                            fill="#757F96"
                                        />
                                        <path
                                            d="M7.88911 8.24632V8.55788H6.77799V8.24632C6.77799 7.53388 7.11399 6.8601 7.59488 6.34765C7.96244 5.95565 7.95222 5.96676 8.05711 5.84232C8.33444 5.5121 8.44466 5.2761 8.44466 5.00054C8.44466 4.70586 8.3276 4.42324 8.11922 4.21487C7.91085 4.00649 7.62824 3.88943 7.33355 3.88943C7.03887 3.88943 6.75625 4.00649 6.54788 4.21487C6.3395 4.42324 6.22244 4.70586 6.22244 5.00054H5.11133C5.11133 4.41117 5.34545 3.84594 5.7622 3.42919C6.17895 3.01245 6.74418 2.77832 7.33355 2.77832C7.92292 2.77832 8.48815 3.01245 8.9049 3.42919C9.32165 3.84594 9.55577 4.41117 9.55577 5.00054C9.55577 5.57921 9.33799 6.04499 8.90777 6.55699C8.83533 6.64321 8.75666 6.73165 8.65977 6.8361C8.62244 6.8761 8.58422 6.91788 8.53266 6.9721L8.40555 7.10765C8.10066 7.4321 7.88911 7.85654 7.88911 8.24632ZM7.80377 9.86143C7.93488 9.99077 8.00022 10.1485 8.00022 10.3339C8.00022 10.5228 7.93488 10.681 7.80377 10.809C7.74227 10.8708 7.66893 10.9197 7.58815 10.9526C7.50736 10.9855 7.42077 11.0018 7.33355 11.0005C7.15133 11.0005 6.99399 10.9365 6.86333 10.809C6.79936 10.7478 6.74886 10.6739 6.71503 10.5921C6.68121 10.5103 6.66481 10.4224 6.66688 10.3339C6.66688 10.1485 6.73222 9.99077 6.86333 9.86143C6.92446 9.79888 6.99766 9.74941 7.07849 9.71603C7.15933 9.68264 7.2461 9.66603 7.33355 9.66721C7.51577 9.66721 7.67311 9.7321 7.80377 9.86143Z"
                                            fill="#757F96"
                                        />
                                    </svg>
                                </el-tooltip>
                            </div>
                        </template>
                        <template v-if="item.type == 'input' || item.type == 'password'">
                            <el-input
                                v-model="modelValue[item.filed]"
                                clearable
                                :disabled="item.disabled"
                                :type="item.type"
                                :placeholder="item.placeholder || '请输入'"
                                v-bind="item.input"
                                @change="(val: string | number) => onChange(item.filed, val)"
                            />
                        </template>
                        <template v-else-if="item.type == 'select'">
                            <el-select
                                v-model="modelValue[item.filed]"
                                clearable
                                :placeholder="item.placeholder || '请选择'"
                                :disabled="item.disabled"
                                v-bind="item.select?.config"
                                @change="(val: string | number) => onChange(item.filed, val)"
                            >
                                <el-option
                                    v-for="(option, index) in item.select?.options"
                                    :key="index"
                                    :label="option.label"
                                    :value="option.value"
                                />
                            </el-select>
                        </template>
                        <template v-else-if="item.type == 'treeSelect'">
                            <el-tree-select
                                v-model="modelValue[item.filed]"
                                :data="item.treeSelect?.data"
                                :props="item.treeSelect?.props"
                                clearable
                                :placeholder="item.placeholder || '请选择'"
                                :disabled="item.disabled"
                                v-bind="item.treeSelect?.config"
                                @change="(val: string | number) => onChange(item.filed, val)"
                            ></el-tree-select>
                        </template>
                        <template v-else-if="item.type == 'textarea'">
                            <el-input
                                type="textarea"
                                v-model="modelValue[item.filed]"
                                clearable
                                :placeholder="item.placeholder || '请输入'"
                                :disabled="item.disabled"
                                v-bind="item.textarea"
                                @change="(val: string | number) => onChange(item.filed, val)"
                            />
                        </template>
                        <template v-else-if="item.type == 'date'">
                            <el-date-picker
                                v-model="modelValue[item.filed]"
                                clearable
                                :disabled="item.disabled"
                                type="date"
                                :placeholder="item.placeholder ?? '请选择时间'"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                v-bind="item.date"
                                @change="(val: string) => onChange(item.filed, val)"
                            />
                        </template>
                        <template v-else-if="item.type == 'daterange'">
                            <el-date-picker
                                v-model="modelValue[item.filed]"
                                clearable
                                :disabled="item.disabled"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                type="daterange"
                                v-bind="item.date"
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                @change="(val: string | string[]) => onChange(item.filed, val)"
                            />
                        </template>
                        <template v-else-if="item.type == 'radio'">
                            <el-radio-group
                                v-model="modelValue[item.filed]"
                                :disabled="item.disabled"
                                @change="(val) => onChange(item.filed, val)"
                            >
                                <el-radio
                                    v-for="(option, index) in item.radio?.options"
                                    :key="index"
                                    :label="option.label"
                                    :value="option.value"
                                    :border="option.border"
                                >
                                    {{ option.label }}
                                </el-radio>
                            </el-radio-group>
                        </template>
                        <template v-else-if="item.type == 'radio-group'">
                            <el-radio-group
                                v-model="modelValue[item.filed]"
                                :disabled="item.disabled"
                                @change="(val) => onChange(item.filed, val)"
                            >
                                <el-radio-button
                                    v-for="(option, index) in item.radio?.options"
                                    :key="index"
                                    :label="option.label"
                                    :value="option.value"
                                    :border="option.border"
                                >
                                    {{ option.label }}
                                </el-radio-button>
                            </el-radio-group>
                        </template>
                        <template v-else-if="item.type == 'checkbox'">
                            <el-checkbox-group
                                v-model="modelValue[item.filed]"
                                @change="(val) => onChange(item.filed, val)"
                            >
                                <el-checkbox
                                    v-for="(option, index) in item.checkbox?.options"
                                    :key="index"
                                    :label="option.label"
                                    :value="option.value"
                                    :border="option.border"
                                />
                            </el-checkbox-group>
                        </template>
                        <template v-else-if="item.type == 'slot'">
                            <slot :name="item.filed" :scope="item"></slot>
                        </template>
                    </el-form-item>
                </el-col>
            </template>
            <div style="flex: 1; text-align: right">
                <slot name="footer" :data="{ modelValue, validate }">
                    <el-button @click="submit" type="primary">查询</el-button>
                    <el-button @click="emits('reset')">重置</el-button>
                </slot>
            </div>
        </el-row>
    </el-form>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';

const modelValue = defineModel<Record<string, any>>({
    default: {}
});

const emits = defineEmits<{
    onChange: [{ filed: string; value: any }];
    submit: [];
    reset: [];
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
        type: Array as PropType<IformItem[]>,
        default: () => [],
        required: true
    },
    layout: {
        type: Object as PropType<any>,
        default: () => ({
            xl: 8,
            lg: 8,
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
            if (valid) return res(true);
            ElMessage.warning('请完成填写表单项');
        });
    });
};

const onChange = (filed: string, val: any) => {
    emits('onChange', { filed, value: val });
};

const submit = () => {
    validate().then((v) => {
        emits('submit');
    });
};

defineExpose({ validate });
</script>

<style lang="scss" scoped>
.lxj-base-form-class {
    width: 100%;
    max-height: 100%;
    :deep(.el-form-item__content) {
        flex: 220px 0 0;
    }
    .el-col {
        padding: 0 5px;
        box-sizing: border-box;
    }

    :deep(.el-tooltip__trigger.el-tooltip__trigger) {
        display: flex;
        align-items: center;
    }
    :deep(.el-form-item__label) {
        display: flex !important;
        .base-form-label {
            display: flex;
        }
    }
}
</style>

<style lang="scss">
.base-form-tooltip {
    max-width: 244px;
    white-space: wrap;
    padding: 4px 8px;
    border-radius: 6px;
}
</style>
