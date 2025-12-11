import { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

declare global {
    interface ResponseDataTypeBase {
        current?: number;
        pageIndex?: number;
        size?: number;
        pageSize?: number;
        total?: number;
        pages?: number;
    }
    interface ResponseDataTypeRows extends ResponseDataTypeBase {
        rows: Record<string, any>[];
    }
    interface ResponseDataTypeRecords extends ResponseDataTypeBase {
        records: Record<string, any>[];
    }
    type ResponseDataTypeString = string;
    type ResponseDataTypeArray = any[];
    type ResponseDataTypeRecord = Record<string, any>;

    interface ResponseDataType {
        code: string | number;
        message?: string;
        msg?: string;
        data?:
            | ResponseDataTypeRows
            | ResponseDataTypeRecords
            | ResponseDataTypeString
            | ResponseDataTypeArray
            | ResponseDataTypeRecord;
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
