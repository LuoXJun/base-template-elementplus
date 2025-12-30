<template>
    <div>
        <baseForm v-model="form" :form-item-list="formConfig" label-width="120px">
            <template #slot>
                <el-row>
                    <el-col :span="20">
                        <baseVerifyCode
                            ref="refreshCodeRef"
                            v-model="verifyCode"
                            :content-width="165"
                            :content-height="44"
                        />
                    </el-col>
                    <el-col :span="4">
                        <el-button @click="refreshCodeRef?.refreshCode()">
                            点击按钮/图片刷新验证码
                        </el-button>
                    </el-col>
                </el-row>
            </template>
        </baseForm>
    </div>
</template>

<script setup lang="ts">
import baseForm from '@/components/baseForm/baseForm.vue';
import baseVerifyCode from '@/components/baseVerifyCode/baseVerifyCode.vue';
import { formConfig } from './config';

const form = ref<Partial<Record<ItemType, any>>>({});

const verifyCode = ref();
const refreshCodeRef = useTemplateRef('refreshCodeRef');
</script>

<style scoped></style>
