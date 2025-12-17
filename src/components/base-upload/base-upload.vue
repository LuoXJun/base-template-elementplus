<template>
    <div class="base-upload">
        <el-upload
            ref="upload"
            class="upload-demo"
            action="#"
            v-model:file-list="list"
            :auto-upload="false"
            :list-type="listType"
            :multiple="limit === 1 ? false : true"
            :show-file-list="showFileList"
            :on-change="onChange"
            :before-remove="beforeRemove"
            :on-preview="preview"
            :on-remove="onRemove"
            :accept="fileType.map((v) => '.' + v).join(',')"
            :drag="drag"
        >
            <slot>
                <el-button type="primary">选择文件</el-button>
            </slot>
            <template #file>
                <slot name="file"></slot>
            </template>
            <template v-if="tips && (!list || list.length === 0)" #tip>
                <div class="el-upload__tip">
                    <span class="file-tips">{{ tips }}</span>
                </div>
            </template>
        </el-upload>
    </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { TlistType } from './config';
const list = defineModel<UploadFile[]>({ default: [] });

const emits = defineEmits<{
    (e: 'remove', file: UploadFile): void;
    (e: 'change', fileList: UploadFile[], file: UploadFile): void;
    (e: 'preview', file: UploadFile): void;
}>();

const props = defineProps({
    // 单个文件大小限制 M
    size: {
        type: Number,
        default: () => 50
    },
    // 文件数量限制
    limit: {
        type: Number,
        default: () => 100
    },
    // 文件列表的展示形式
    listType: {
        type: String as PropType<TlistType>,
        default: () => 'text'
    },
    // 支持上传的文件类型数组
    fileType: {
        type: Array<String>,
        default: () => []
    },
    // 是否显示已上传的文件列表
    showFileList: {
        type: Boolean,
        default: () => true
    },
    tips: {
        type: String,
        default: () => ''
    },
    drag: {
        type: Boolean,
        default: () => false
    }
});

// formData.append('file', new File([item.raw], item.name.replace(/\s*/g, "").replace(/\(|\)/g, '')))

// 删除或者添加文件完成后父组件获取到的列表是变化前的，使用异步可以解决这个问题
const onChange = (file: UploadFile, fileList: UploadFile[]) => {
    const index = fileList.indexOf(file);
    fileList.splice(index, 1);

    // 限制上传大小
    if (file.size! / 1024 / 2024 > props.size) {
        ElMessage.warning(`上传文件大小不能超过${props.size}M`);
        return false;
    }

    //   限制上传数量
    if (fileList.length >= props.limit) {
        if (props.limit === 1) {
            // 直接替换
            return (fileList[0] = file);
        }
        ElMessage.warning(`文件上传数量不能超过${props.limit}`);
        return false;
    }

    // 限制上传类型
    if (props.fileType.length > 0) {
        let type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        if (props.fileType.indexOf(type) == -1) {
            ElMessage.warning(`请上传${props.fileType.join(',')}格式的文件`);
            return false;
        }
    }

    fileList.splice(index, 0, file);

    setTimeout(() => {
        emits('change', fileList, file);
    }, 100);
};

const beforeRemove = (): Promise<boolean> => {
    return new Promise((res) => {
        ElMessageBox.confirm('是否确定删除当前文件', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
            .then(() => {
                res(true);
            })
            .catch(() => {
                ElMessage.info('取消删除');
            });
    });
};

// 预览
const preview = (file: UploadFile) => {
    emits('preview', file);
};

const onRemove = (file: UploadFile) => {
    setTimeout(() => {
        emits('remove', file);
    }, 100);
};
</script>

<style lang="scss">
.base-upload {
    position: relative;
    // max-width: 400px;
    :deep(.el-upload-list__item-file-name) {
        cursor: pointer;
    }
    .file-tips {
        color: #757f96;

        /* Body/Small */
        font-family: 'PingFang SC';
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 20px; /* 166.667% */
    }
    .el-upload__tip {
        margin: 0;
    }
    .el-upload-list,
    .el-upload-list__item {
        margin-top: 0;
        margin-bottom: 0;
    }
    .el-form-item__content {
        line-height: unset;
    }
    .el-icon.el-icon--document {
        display: none;
    }
    .el-upload-list__item-file-name {
        color: #0266f0;

        /* Body/Small */
        font-family: 'PingFang SC';
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 20px; /* 166.667% */
    }
}
</style>
