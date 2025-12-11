declare interface Window {
    BASE_URL: {
        devUrl: string;
        testUrl: string;
        prodUrl: string;
        wutanUrl: string;
    };
    scCode: string[];
    TIME_OUT: number;
    luckysheet: luckysheet.StaticMethods;
    // onlyoffice
    DocsAPI: {
        DocEditor: typeof DocEditor;
    };
    Asc: any;
    docEditor: any;
    connector: IconnectorDoc;
    callbackUrl: string;
}
