import { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

declare global {
    interface ResponseDataRecoeds<T> {
        total: number;
        records: T[];
    }
    interface ResponseDataType<T> {
        code: string | number;
        message?: string;
        data: T;
        msg?: string;
    }

    interface IbaseRequestConfig {
        requestIntercepter?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;

        responseIntercepter?: (
            res: AxiosResponse<ResponseDataType>
        ) => AxiosResponse<ResponseDataType>;

        requestIntercepterCatch?: (err: any) => any;

        responseIntercepterCatch?: (err: any) => any;
    }

    interface IbaseInstanceConfig extends AxiosRequestConfig {
        interceptors?: IbaseRequestConfig;
        /**是否显示全局加载框*/
        isLoading?: boolean;
        /**显示加载框时的文字*/
        loadingText?: string;
    }
}
