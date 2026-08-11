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
        interceptors?: (instance: AxiosInstance) => IbaseRequestConfig;
        /**是否显示全局加载框*/
        isLoading?: boolean;
        /**显示加载框时的文字*/
        loadingText?: string;
        /**是否显示成功提示，默认 false*/
        isSuccessMsg?: boolean;
        /**成功提示文字，不传则取接口返回的 message/msg，都无则用默认文案*/
        successMsg?: string;
    }
}
