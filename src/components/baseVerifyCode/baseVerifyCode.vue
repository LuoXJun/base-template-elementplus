<template>
    <div class="s-canvas">
        <canvas id="s-canvas" :width="contentWidth" :height="contentHeight" @click="refreshCode" />
    </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';

//验证码
const verifyCode = defineModel<string>({ default: '2048' });

// 定义props类型
interface CodeProps {
    /** 容器宽度 */
    contentWidth?: number;
    /** 容器高度 */
    contentHeight?: number;
    /** 最大干扰线，0时无干扰线 */
    maxLine?: number;
    /** 最大干扰点，0时无干扰点 */
    maxDot?: number;
    /** 字体最小值 */
    fontSizeMin?: number;
    /** 字体最大值 */
    fontSizeMax?: number;
}
// props默认值
const props = withDefaults(defineProps<CodeProps>(), {
    contentWidth: 90,
    contentHeight: 30,
    fontSizeMin: 25,
    fontSizeMax: 30,
    maxLine: 4,
    maxDot: 10
});

// 生成校验码
const makeCode = (len = 4) => {
    let code = '';
    //验证码的长度
    const codeLength = len;
    // 定义生成验证码的字符集,去除易混淆的字符集1il0oO
    const identifyCodes = '123456789abcdefjhijkinpqrsduvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    for (let i = 0; i < codeLength; i++) {
        // 获取随机字符
        code += identifyCodes[randomNum(identifyCodes.length, 0)];
    }
    return code;
};

// 重置验证码
const refreshCode = () => {
    verifyCode.value = makeCode();
    nextTick(() => {
        drawPic(verifyCode.value);
    });
};

//随机数生成：根据角标拿字符串的值
const randomNum = (max: number, min = 0) => Math.floor(Math.random() * (max - min)) + min;

// 生成一个随机的颜色
function randomColor(min: number, max: number) {
    const r = randomNum(max, min);
    const g = randomNum(max, min);
    const b = randomNum(max, min);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}
/** 绘制文字 */
function drawPic(text: string) {
    const canvas = document.getElementById('s-canvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('找不到 canvas 元素');
        return;
    }
    //创建一个2D对象作为上下文。
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.textBaseline = 'bottom';
    // 绘制背景
    ctx.fillStyle = '#e6ecfd';
    ctx.fillRect(0, 0, props.contentWidth, props.contentHeight);
    // 绘制文字
    for (let i = 0; i < text.length; i++) {
        drawText(ctx, text, i);
    }
    drawLine(ctx, props.maxLine);
    drawDot(ctx, props.maxDot);
}

/**在画布上显示数据
 * @param ctx CanvasRenderingContext2D
 * @param verifyCode 要显示的文字
 * @param index 字符索引
 */
function drawText(ctx: CanvasRenderingContext2D, text: string, index: number) {
     // 随机生成字体颜色
    ctx.fillStyle = randomColor(50, 160);
    // 随机生成字体大小
    ctx.font = randomNum(props.fontSizeMax, props.fontSizeMin) + 'px SimHei'; 
    const x = (index + 1) * (props.contentWidth / (text.length + 1));
    const y = randomNum(props.contentHeight - 5, props.fontSizeMax);
    const deg = randomNum(15, -10);
    // 修改坐标原点和旋转角度
    ctx.translate(x, y);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.fillText(text[index], 0, 0);
    // 恢复坐标原点和旋转角度
    ctx.rotate((-deg * Math.PI) / 180);
    ctx.translate(-x, -y);
}
/** 绘制干扰线
 * @param ctx CanvasRenderingContext2D
 * @param max 最大干扰线个数
 */
function drawLine(ctx: CanvasRenderingContext2D, maxLine = 4) {
    if (maxLine <= 0) {
        return;
    }
    for (let i = 0; i < maxLine; i++) {
        ctx.strokeStyle = randomColor(150, 200);
        ctx.beginPath();
        ctx.moveTo(randomNum(props.contentWidth, 0), randomNum(props.contentHeight, 0));
        ctx.lineTo(randomNum(props.contentWidth, 0), randomNum(props.contentHeight, 0));
        ctx.stroke();
    }
}
/** 绘制干扰点
 * @param ctx CanvasRenderingContext2D
 * @param max 最大干扰点个数
 */
function drawDot(ctx: CanvasRenderingContext2D, maxDot = 10) {
    if (maxDot <= 0) {
        return;
    }
    for (let i = 0; i < maxDot; i++) {
        ctx.fillStyle = randomColor(0, 255);
        ctx.beginPath();
        ctx.arc(
            randomNum(props.contentWidth, 0),
            randomNum(props.contentHeight, 0),
            1,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
}

// 定义暴露接口
defineExpose({ refreshCode });

onMounted(() => {
    refreshCode();
});
</script>
