import { reactive, ref, onMounted } from 'vue';

/** fetchFn 需要返回的结果结构 */
export interface FetchResult<T> {
    /** 当前页的记录列表 */
    records: T[];
    /** 数据总数（用于分页组件展示） */
    total: number;
}

/** usePageTable 的配置选项 */
export interface UsePageTableOptions {
    /** 初始分页配置，默认 { pageNum: 1, pageSize: 10 } */
    initialPageInfo?: Partial<Omit<PageInfo, 'total'>>;
    /** 是否在 onMounted 时自动请求首页，默认 true */
    immediate?: boolean;
}

/**
 * 表格 + 分页的组合函数
 *
 * 封装了分页列表页面中反复出现的 pageInfo、tableData、getPage 样板代码。
 * 调用方只需提供一个返回 {@link FetchResult} 的异步函数，通过闭包访问 pageInfo 即可获得完整的翻页能力。
 *
 */
export function usePageTable<T>(
    fetchFn: () => Promise<FetchResult<T>>,
    options: UsePageTableOptions = {}
) {
    const pageInfo = reactive<PageInfo>({
        pageNum: options.initialPageInfo?.pageNum ?? 1,
        pageSize: options.initialPageInfo?.pageSize ?? 10,
        total: 0
    });

    const tableData = ref<T[]>([]);

    const getPage = async () => {
        const { records, total } = await fetchFn();
        tableData.value = records;
        pageInfo.total = total;
    };

    /** 回到首页并重新请求 */
    const resetPage = () => {
        pageInfo.pageNum = 1;
        return getPage();
    };

    if (options.immediate !== false) {
        onMounted(() => {
            getPage();
        });
    }

    return { pageInfo, tableData, getPage, resetPage };
}
