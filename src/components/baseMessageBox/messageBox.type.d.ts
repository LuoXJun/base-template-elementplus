export type ConfirmType = 'normal' | 'warning' | 'error';

/** 与 confirmBox.vue 中 defineProps 类型保持一致的 props 类型 */
export interface ConfirmBoxProps {
    title?: string;
    message?: string;
    type?: ConfirmType;
    width?: number;
    height?: number;
    confirmButtonText?: string;
    cancelButtonText?: string;
    showCancelButton?: boolean;
}

/** 命令式调用的 options 类型 */
export type ConfirmOptions = ConfirmBoxProps;
