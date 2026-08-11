import router from '@/router';
import { ElMessage } from 'element-plus';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { errorMessages, getErrorMessage, handleUnauthorizedError } from './errorCatch';

const scCode = import.meta.env.VITE_SC_CODE;

export const createInterceptors = (instance: AxiosInstance): IbaseRequestConfig => {
    return {
        requestIntercepter: (config: InternalAxiosRequestConfig<any>) => {
            if (config.url?.includes('token')) {
                config.headers.Authorization = '';
            }
            return config;
        },

        requestIntercepterCatch: (err) => {
            if (err.request) {
                ElMessage.error(err.request);
            }
            return Promise.reject(err);
        },

        responseIntercepter: (res) => {
            if (res.request.responseType == 'blob') {
                return res;
            }

            if (scCode.includes(res.data.code)) {
                // 对成功的请求做统一的消息提示
                const _config = res.config as IbaseInstanceConfig;
                if (_config.isSuccessMsg) {
                    const msg =
                        _config.successMsg || res.data.message || res.data.msg || '操作成功';
                    ElMessage.success(msg);
                }
                return res;
            }
            if (res.data.msg && res.data.msg.includes('flushToken过期')) {
                router.push('/login');
            }
            ElMessage.warning(res.data.message ?? res.data.msg ?? res.data);
            return Promise.reject(res) as any as AxiosResponse<ResponseDataType<any>>;
        },

        responseIntercepterCatch: async (err) => {
            const status: keyof typeof errorMessages = err.status;

            if (status === 401) {
                return handleUnauthorizedError(err, instance).catch((refreshError) => {
                    ElMessage.error(errorMessages[status]);
                    return Promise.reject(refreshError);
                });
            }

            // 其他状态码直接显示预定义消息或默认消息
            const message = errorMessages[status] ?? getErrorMessage(err);
            ElMessage.error(message);

            return Promise.reject(err);
        }
    };
};
