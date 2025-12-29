import { type AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import BaseRequest from './base_request';
import { TIME_OUT } from './config/index';
import router from '@/router';

const request = new BaseRequest({
    baseURL: window.BASE_URL.wutanUrl,
    timeout: TIME_OUT,
    isLoading: true,
    interceptors: {
        requestIntercepter: (config) => {
            return config;
        },

        requestIntercepterCatch: (err) => {
            if (err.request) {
                ElMessage.error(err.request);
            }
            return Promise.reject(err);
        },

        responseIntercepter: (res) => {
            if (res.request.responseType == 'blob') return res;

            if (window.scCode.includes(String(res.data.code))) {
                return res;
            } else {
                if (res.data.msg && res.data.msg.includes('flushToken过期')) router.push('/login');
                ElMessage.warning(res.data.message ?? res.data.msg ?? res.data);
                return Promise.reject(res) as any as AxiosResponse<ResponseDataType<any>>;
            }
        },

        responseIntercepterCatch: async (err) => {
            switch (err.status) {
                case 201:
                    ElMessage.error('Createe');
                    break;
                case 401:
                    ElMessage.error('Unauthorized -未认证');
                    break;
                case 403:
                    ElMessage.error('Forbidden');
                    break;
                case 404:
                    ElMessage.error('404 notFound');
                    break;

                default:
                    ElMessage.error(err?.response?.data?.message ?? err?.message ?? err);
            }
            return Promise.reject(err);
        }
    }
});

export default request;
