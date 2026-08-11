<template>
    <div class="base-tabs">
        <div class="tab-title">
            <p
                v-for="label in labels"
                :key="label"
                :class="{ active: activeName === label }"
                @click="onTabChange(label)"
            >
                {{ label }}
            </p>
        </div>
        <div class="tas-content">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
const activeName = defineModel<string>({ default: '' });

const emits = defineEmits<{
    onClick: [label: string];
}>();

defineProps({
    labels: {
        type: Array as PropType<Array<string>>,
        default: () => []
    }
});

const onTabChange = (label: string) => {
    activeName.value = label;
    emits('onClick', activeName.value);
};
</script>

<style scoped lang="scss">
.base-tabs {
    width: 100%;
    height: 100%;
    color: #17304a;
    font-family: 'PingFang SC';
    font-size: 16px;
    .tab-title {
        width: 100%;
        display: flex;
        align-items: center;

        > p {
            flex: 1;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 2px solid #fff;
            cursor: pointer;
            &.active {
                color: #0982d2;
                border-bottom: 2px solid #7d9ec3;
            }
        }
    }
}
</style>
