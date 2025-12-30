interface Condition<T extends Record<string, string>> {
    /**字段名*/
    column: keyof T;
    /**查询方式--精确查询-模糊查询*/
    type: string; //'like' | 'in';
    value: any;
}

interface PaginationParams {
    pageNum: number;
    pageSize: number;
    conditions: Condition[];

    orderBy?: string[];
    asc?: boolean;
}
