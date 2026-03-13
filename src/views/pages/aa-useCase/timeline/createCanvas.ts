export const createCanvas = (
    station: number[],
    data: Array<{ time: string; data: Array<number> }>
) => {
    const stationCount = station.length;
    const xMin = 0;
    const xMax = 31300;

    const timeSeriesData = data;

    // ----- canvas 元素与上下文 -----
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    const ctx = canvas.getContext('2d')!;

    // 用于存储当前帧所有点的画布坐标 (点击检测)
    let currentPoints = [];

    // ----- 核心绘图 (无轴无背景) -----
    function drawChart(timeIdx: number) {
        // 从新数据格式中获取当前时刻所有站点的值
        const currentValues = timeSeriesData[timeIdx].data; // 长度为 stationCount 的数组

        // 计算Y范围
        let minVal = Math.min(...currentValues);
        let maxVal = Math.max(...currentValues);
        if (Math.abs(maxVal - minVal) < 0.001) {
            minVal -= 5;
            maxVal += 5;
        }
        const padding = (maxVal - minVal) * 0.08;
        const yMin = minVal - padding;
        const yMax = maxVal + padding;

        // 映射函数
        const mapX = (x: number) => ((x - xMin) / (xMax - xMin)) * canvas.width;
        const mapY = (val: number) =>
            canvas.height - ((val - yMin) / (yMax - yMin)) * canvas.height;

        // 清空画布 (完全透明)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 构建点集 (保存到 currentPoints)
        const points = [];
        for (let i = 0; i < stationCount; i++) {
            const x = mapX(station[i]);
            const y = mapY(currentValues[i]);
            points.push({
                x,
                y,
                index: i,
                value: currentValues[i],
                station: station[i]
            });
        }
        currentPoints = points;

        // 绘制折线填充 (半透明蓝)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        const bottomY = canvas.height;
        ctx.lineTo(points[points.length - 1].x, bottomY);
        ctx.lineTo(points[0].x, bottomY);
        ctx.closePath();

        const fillGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        fillGrad.addColorStop(0, '#3b9eff40');
        fillGrad.addColorStop(0.7, '#1a4f8f20');
        fillGrad.addColorStop(1, '#0d284a10');
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // 绘制主折线 (光晕)
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = '#5bb4ff';
        ctx.lineWidth = 3.2;
        ctx.shadowColor = '#3f9eff';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#c0e2ff';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // 绘制数据点
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#5bb4ff';
        ctx.fillStyle = '#ffffff';
        ctx.shadowOffsetX = 0;
        for (let i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 4.2, 0, 2 * Math.PI);
            ctx.fillStyle = '#e6f0ff';
            ctx.fill();
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 2, 0, 2 * Math.PI);
            ctx.fillStyle = '#aad0ff';
            ctx.fill();
        }
        ctx.restore();

        // 极简半透明时间水印
        ctx.save();
        ctx.font = 'bold 18px "Segoe UI", monospace';
        ctx.fillStyle = '#173b66';
        ctx.globalAlpha = 0.2;
        ctx.textAlign = 'right';
        ctx.fillText(timeSeriesData[timeIdx].time, canvas.width - 30, canvas.height - 18);
        ctx.restore();
    }

    function resizeCanvas() {
        const container = canvas.parentElement; // 或其他参考容器
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // 更新绘图表面
        canvas.width = containerWidth;
        canvas.height = containerHeight;

        // 更新 CSS 尺寸（通常无需额外设置，因为 Canvas 元素本身宽度会跟随父容器）

        // 重绘图形
        drawChart(0);
    }

    window.addEventListener('resize', resizeCanvas);

    return { canvas, resizeCanvas };
};
