// 合并范围区间
export const mergeIntervals = (intervals: [number, number][]) => {
    if (!intervals || intervals.length < 2) return [];

    // 按起始值排序
    intervals.sort((a, b) => a[0] - b[0]);

    const merged: [number, number][] = [];
    let current = intervals[0];

    for (let i = 1; i < intervals.length; i++) {
        const interval = intervals[i];

        // 如果当前区间与下一个区间重叠或连续，则合并
        if (interval[0] <= current[1]) {
            current[1] = Math.max(current[1], interval[1]);
        } else {
            merged.push(current);
            current = interval;
        }
    }

    merged.push(current);
    return merged;
};

// 检查是否覆盖[min,max]
export const covers0to100 = (mergedIntervals: number[][], min = 0, max = 100) => {
    let covered = min;

    for (const interval of mergedIntervals) {
        if (interval[0] <= covered) {
            covered = Math.max(covered, interval[1]);
        } else {
            break;
        }
    }

    return covered >= max;
};
