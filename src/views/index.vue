<template>
    <baseLayoutHorizontal v-if="isHorizontalMenu" />
    <baseLayoutVertical v-else />
</template>

<script setup lang="ts">
import baseLayoutHorizontal from '@/components/baseLayoutHorizontal/baseLayoutHorizontal.vue';
import baseLayoutVertical from '@/components/baseLayoutVertical/baseLayoutVertical.vue';

import { isHorizontalMenu } from './config';
</script>
