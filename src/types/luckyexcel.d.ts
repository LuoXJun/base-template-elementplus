declare module 'luckyexcel' {
    export interface TransformResult {
        workbook?: any;
        sheets?: any[];
        [key: string]: any;
    }

    export interface TransformOptions {
        [key: string]: any;
    }

    // 根据实际使用的方法来声明
    export function transformExcelToLucky(
        file: File | ArrayBuffer | string | UploadRawFile,
        callback: (result: TransformResult) => void,
        options?: TransformOptions
    ): void;

    // 如果有其他方法，继续添加
    export function transformLuckyToExcel(data: any, callback: (result: ArrayBuffer) => void): void;

    const LuckyExcel: {
        transformExcelToLucky: typeof transformExcelToLucky;
        transformLuckyToExcel: typeof transformLuckyToExcel;
    };

    export default LuckyExcel;
}
