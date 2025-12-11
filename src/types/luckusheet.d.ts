declare namespace luckysheet {
    // 单元格值类型
    type CellValue = string | number | boolean | null | { v: string | number | boolean | null };

    type TAlgorithm =
        | 'MD2'
        | 'MD4'
        | 'MD5'
        | 'RIPEMD-128'
        | 'RIPEMD-160'
        | 'SHA-1'
        | 'SHA-256'
        | 'SHA-384'
        | 'SHA-512'
        | 'WHIRLPOOL'
        | 'None';

    // 单元格格式
    interface CellFormat {
        fa?: string; // 格式代码 (如 "0.00%")
        t?: 'n' | 's' | 'b' | 'd' | 'e'; // 数据类型: n=数字, s=字符串, b=布尔, d=日期, e=错误
        s?: Record<string, string>[];
    }

    // 单元格样式
    interface CellStyle {
        bg?: string; // 背景色
        fc?: string; // 字体颜色
        ff?: string; // 字体
        fs?: number; // 字号
        bl?: 0 | 1; // 粗体
        it?: 0 | 1; // 斜体
        un?: 0 | 1; // 下划线
        cl?: 0 | 1; // 删除线
        ht?: 0 | 1 | 2; // 水平对齐: 0居中,1左,2右
        vt?: 0 | 1 | 2; // 垂直对齐: 0居中,1上,2下
        tb?: 0 | 1 | 2; // 文本换行: 0截断,1换行,2不换行
        pd?: string; // 内边距
        tr?: {
            a?: number; // 旋转角度
            v?: 0 | 1; // 垂直文本
        };
    }

    // 单元格对象
    interface CellObject {
        v?: CellValue; // 原始值
        m?: string; // 显示值
        ct?: CellFormat; // 格式
        f?: string; // 公式
        r?: RichText[]; // 富文本
        s?: CellStyle | number; // 样式或样式索引
        v_en?: string; // 英文显示值 (用于多语言)
        v_es?: string; // 西班牙文显示值
        bg?: string;
        ff?: string;
        fc?: string;
        bl?: 0 | 1;
        it?: 0 | 1;
        fs?: number;
        cl?: 0 | 1;
        un?: 0 | 1;
        vt?: 0 | 1 | 2;
        ht?: 0 | 1 | 2; //水平对齐:中-左-右
        mc?: { r: number; c: number; rs?: number; cs?: number };
        tr?: 3; //竖排文字
        rt?: number; //旋转角度
    }

    // 富文本片段
    interface RichText {
        v: string; // 文本内容
        ff?: string; // 字体
        fc?: string; // 颜色
        fs?: number; // 字号
        bl?: 0 | 1; // 粗体
        it?: 0 | 1; // 斜体
        un?: 0 | 1; // 下划线
        cl?: 0 | 1; // 删除线
        // ... 其他可能的属性
    }

    // 合并单元格
    interface MergeCell {
        r: number; // 起始行
        c: number; // 起始列
        rs: number; // 合并行数
        cs: number; // 合并列数
    }

    // 边框定义
    interface BorderInfo {
        rangeType: 'cell' | 'range';
        value: BorderRange[];
    }

    interface BorderRange {
        row_index: number;
        col_index: number;
        border: {
            top?: BorderStyle;
            bottom?: BorderStyle;
            left?: BorderStyle;
            right?: BorderStyle;
        };
    }

    interface BorderStyle {
        style: 'thin' | 'medium' | 'dashed' | 'dotted' | 'double';
        color: string;
    }

    // 工作表配置
    interface SheetConfig {
        name?: string; // 工作表名称 (兼容旧版)
        title?: string; // 工作表名称
        index: string | number; // 唯一索引
        status: 0 | 1; // 0=显示, 1=隐藏
        order: number; // 排序
        celldata?: CellData[]; // 单元格数据
        defaultColWidth: number;
        defaultRowHeight: number;
        config: {
            merge?: { [key: string]: MergeCell }; // 合并单元格
            rowlen: { [key: number]: number }; // 行高
            columnlen: { [key: number]: number }; // 列宽
            rowhidden?: { [key: number]: number }; // 行隐藏
            colhidden?: { [key: number]: number }; // 列隐藏
            borderInfo?: BorderInfo[]; // 边框
            authority: {
                allowImageList: any[];
                selectLockedCells: 0 | 1; //选定锁定单元格
                selectunLockedCells: 0 | 1; //选定解除锁定的单元格
                formatCells: 0 | 1; //设置单元格格式
                formatColumns: 0 | 1; //设置列格式
                formatRows: 0 | 1; //设置行格式
                insertColumns: 0 | 1; //插入列
                insertRows: 0 | 1; //插入行
                insertHyperlinks: 0 | 1; //插入超链接
                deleteColumns: 0 | 1; //删除列
                deleteRows: 0 | 1; //删除行
                sort: 0 | 1; //排序
                filter: 0 | 1; //使用自动筛选
                usePivotTablereports: 0 | 1; //使用数据透视表和报表
                editObjects: 0 | 1; //编辑对象
                editScenarios: 0 | 1; //编辑方案
                sheet: 0 | 1; //如果为1或true，则该工作表受到保护；如果为0或false，则该工作表不受保护。
                hintText: string; //弹窗提示的文字
                algorithmName: TAlgorithm;
                //加密方案：MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
                saltValue: null; //密码解密的盐参数，为一个自己定的随机数值

                allowRangeList: [
                    {
                        //区域保护
                        name: string; //名称
                        password: string; //密码
                        hintText: string; //提示文字
                        algorithmName: TAlgorithm; //加密方案：MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
                        saltValue: null; //密码解密的盐参数，为一个自己定的随机数值
                        sqref: string; //区域范围
                    }
                ];
            };
        };
        // 新版数据结构
        cellData?: { [key: string]: { [key: string]: CellObject } };
        row?: number; // 总行数
        column?: number; // 总列数
        scrollLeft?: number; // 水平滚动位置
        scrollTop?: number; // 垂直滚动位置
        images: Record<string, any>;
        data: CellObject[][];
    }

    // 单元格位置数据
    interface CellData {
        r: number; // 行索引
        c: number; // 列索引
        v: CellObject; // 单元格值
    }

    // 钩子函数
    interface HookMethods {
        cellDragStop?: (cell, postion, sheetFile, ctx, event) => void;
        rowTitleCellRenderBefore?: (rowNum, postion, ctx) => void;
        rowTitleCellRenderAfter?: (rowNum, postion, ctx) => void;
        columnTitleCellRenderBefore?: (columnAbc, postion, ctx) => void;
        columnTitleCellRenderAfter?: (columnAbc, postion, ctx) => void;
        cellRenderBefore?: (cell, postion, sheetFile, ctx) => void;
        cellRenderAfter?: (cell, postion, sheetFile, ctx) => void;
        cellMousedownBefore?: (cell, postion, sheetFile, ctx) => void;
        cellMousedown?: (cell, postion, sheetFile, ctx) => void;
        sheetMousemove?: (cell, postion, sheetFile, moveState, ctx) => void;
        sheetMouseup?: (cell, postion, sheetFile, moveState, ctx) => void;
        cellAllRenderBefore?: (data, sheetFile, ctx) => void;
        updated?: (operate) => void;
        cellUpdateBefore?: (r, c, value, isRefresh) => void;
        cellUpdated?: (r, c, oldValue, newValue, isRefresh) => void;
        sheetActivate?: (index, isPivotInitial, isNewSheet) => void;
        rangeSelect?: (index, sheet) => void;
        commentInsertBefore?: (r, c) => void;
        commentInsertAfter?: (r, c, cell) => void;
        commentDeleteBefore?: (r, c, cell) => void;
        commentDeleteAfter?: (r, c, cell) => void;
        commentUpdateBefore?: (r, c, value) => void;
        commentUpdateAfter?: (r, c, oldCell, newCell) => void;
        cellEditBefore?: (range) => void;
        workbookCreateAfter?: (json) => void;
        rangePasteBefore?: (range, data) => void;
        rangeDeleteBefore?: (range, data) => void;
        imageInsertAfter?: (range, data) => void;
    }

    // 初始化选项
    interface Options {
        container: string; // 容器ID
        title?: string; // 工作簿名称
        lang?: string; // 语言 ('en' | 'zh' | 'es')
        data?: SheetConfig[]; // 工作表数据
        plugins?: string[]; // 插件列表
        showinfobar?: boolean; // 显示顶部信息栏
        showsheetbar?: boolean; // 显示底部标签栏
        showtoolbar?: boolean; // 显示工具栏
        showstatisticBar?: boolean; // 显示状态栏
        allowEdit?: boolean; // 允许编辑
        enableAddRow?: boolean; // 允许添加行
        enableAddCol?: boolean; // 允许添加列
        row?: number; // 默认行数
        column?: number; // 默认列数
        autoFormatw?: boolean; // 自动格式化
        hook?: HookMethods; // 钩子函数
        loadUrl?: string; // 数据加载URL
        updateUrl?: string; // 数据更新URL
        loadSheetUrl?: string; // 工作表加载URL
        userInfo?: String | Boolean | Object;
    }

    // 全局方法
    interface StaticMethods {
        create(options: Options): void;
        destroy(): void;
        getCellValue(
            r: number,
            c: number,
            config?: {
                type: string;
                order: number;
            }
        ): CellObject | null;
        setCellValue(
            r: number,
            c: number,
            value: CellObject | string | number,
            config?: {
                isRefresh?: boolean; //是否刷新界面，默认为true，用于多个单元格赋值时控制节流，前面设置为false，最后一个单元格设置为true
                order?: number; //工作表下标
                success?(): void; //结束回调
            }
        ): void;
        getSheet(sheetIndex?: number): SheetConfig;
        getAllSheets(): SheetConfig[];
        setSheetActive(index: number | string): void;
        getConfig(): Options;
        refreshFormula(): void;
        toJson(): SheetConfig[];
        resize(): void;
        exitEditMode(): void;
        setRangeShow(data: { row: any[]; column: any[] }): void;
        updataSheet(data: { data: SheetConfig[]; success?: () => void }): void;
    }
}
