import request from '@/utils/request/index';

/**登录*/
export const loginApi = (data = {}) => {
    return request.post(`/auth/login`, data);
};

/**注销登录*/
export const logoutApi = (data = {}) => {
    return request.post(`/auth/logout`, data);
};

/**刷新token*/
export const refreshTokenApi = (data = {}) => {
    return request.post(`/auth/flushtoken`, data);
};

/**获取用户信息*/
export const userinfoApi = (data = {}) => {
    return request.post(`/auth/userinfo`, data);
};
