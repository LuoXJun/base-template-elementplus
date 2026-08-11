import { refreshTokenApi } from '@/api/auth';
import type { AxiosInstance } from 'axios';
const scCode = import.meta.env.VITE_SC_CODE;

export const errorMessages = {
    201: 'Createe',
    401: '登录过期，请重新登录',
    403: 'Forbidden',
    404: '404 notFound'
};

// 默认获取错误消息的工具函数
export const getErrorMessage = (err: any) => {
    return err?.response?.data?.message ?? err?.message ?? err;
};

let isRefreshing = false;
const requestList: Array<() => Promise<unknown>> = [];

export const handleUnauthorizedError = async (err: any, instance: AxiosInstance) => {
    if (location.hash.includes('login')) {
        return;
    }
    const { config } = err;

    if (isRefreshing) {
        return new Promise((resolve) => {
            requestList.push(() => {
                return instance.request(config).then(resolve);
            });
        });
    }

    isRefreshing = true;
    try {
        const { data } = await refreshTokenApi({
            token: sessionStorage.getItem('token'),
            refreshToken: sessionStorage.getItem('refreshToken')
        });

        if (!scCode.includes(data.code) || !data.data) {
            // 刷新失败（token 或 refreshToken 均无效），清除队列，驱逐到登录页
            requestList.length = 0;
            return Promise.reject(err);
        }

        sessionStorage.setItem('token', data.data.token);
        sessionStorage.setItem('refreshToken', data.data.refreshToken);

        requestList.forEach((req) => {
            req();
        });
        requestList.length = 0;

        return instance.request(config);
    } catch (refreshError) {
        requestList.length = 0;
        return Promise.reject(refreshError);
    } finally {
        isRefreshing = false;
    }
};
