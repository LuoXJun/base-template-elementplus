<template>
    <div>
        <div ref="canvasRef" style="height: 400px; width: 100%"></div>
        <!-- 时间轴 -->
        <el-row>
            <el-col :span="12">
                <span>当前时间范围：</span>
                <span>{{ time_range[0] }} --- {{ time_range[1] }}</span>
            </el-col>
            <el-col :span="12" style="text-align: right">
                <el-button @click="play">自动播放</el-button>
                <el-button @click="stop">停止播放</el-button>
            </el-col>
        </el-row>
        <baseTimeline
            ref="baseTimelineRef"
            :step="100"
            @change="onChange"
            :isAutoPlay="isAutoPlay"
            :time-range="time_range"
            :mark-time="markTime"
            :start-meddle-time="startMeddleTime"
        />
    </div>
</template>

<script setup lang="ts">
import baseTimeline from '@/components/baseTimeline/baseTimeline.vue';
import { createCanvas } from './createCanvas';
// @ts-ignore
import json from '/public/realy_data.json';

//绘制动画
const station = [
    2038.218, 2905.794, 3369.672, 4212.733, 5197.153, 5649.076, 6610.487, 7246.178, 7604.179,
    8524.752, 9262.44, 10244.627, 10626.736, 11872.464, 12281.853, 12739.08, 13450.322, 14656.82,
    15363.889, 15919.249, 16575.455, 17436.166, 18284.004, 19094.211, 19493.932, 20678.092,
    21372.52, 21886.221, 22731.029, 23573.053, 23776.785, 24853.172, 25561.684, 26140.209,
    26857.051, 27777.047, 28869.1, 29128.088, 29739.539, 30987.121
];

//
const baseTimelineRef = useTemplateRef('baseTimelineRef');
// 时间轴范围
const time_range = ['2023-01-02 00:00:00', '2023-01-02 23:59:59'];
// 将该时间移动到时间轴中心
const startMeddleTime = undefined; //time_range[0];
// 自动播放,时间轴以1s的速度前进
const isAutoPlay = ref(false);
// 设置标记区域
const markTime = [
    {
        beginTime: '2023-01-02 01:01:00',
        endTime: '2023-01-02 02:02:00',
        bgColor: 'red',
        text: '困人'
    },
    {
        beginTime: '2023-01-02 08:01:00',
        endTime: '2023-01-02 10:02:00',
        bgColor: 'pink',
        text: '非法闯入'
    },
    {
        beginTime: '2023-01-02 15:01:00',
        endTime: '2023-01-02 16:02:00',
        bgColor: 'yellow',
        text: '故障'
    }
];
const currentPlayTime = ref(time_range[0]);

const play = () => {
    baseTimelineRef?.value!.play(currentPlayTime.value);
};

const stop = () => {
    baseTimelineRef.value?.stop();
    isAutoPlay.value = false;
};
const onChange = (time: string) => {
    currentPlayTime.value = time;
};

//
const canvasRef = useTemplateRef('canvasRef');
onMounted(() => {
    const { canvas, resizeCanvas } = createCanvas(station, json.field_data.Q);
    canvasRef.value?.appendChild(canvas);

    nextTick(() => {
        resizeCanvas();
    });
});
</script>

<style scoped></style>
