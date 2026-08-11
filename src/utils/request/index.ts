import type { AxiosInstance } from 'axios';
import BaseRequest from './base_request';
import { createInterceptors } from './createInterceptors';

const request = new BaseRequest({
    baseURL: import.meta.env.VITE_API_USER_URL,
    timeout: import.meta.env.VITE_TIME_OUT,
    isLoading: true,
    interceptors: (instance: AxiosInstance) => {
        return createInterceptors(instance);
    }
});

export default request;
