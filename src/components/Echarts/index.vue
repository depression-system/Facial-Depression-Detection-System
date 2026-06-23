<script setup lang="ts">
import {computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import echarts, {type ECOption} from "./config";
import {type EChartsType} from "echarts/core";
import {useDebounceFn} from "@vueuse/core";

interface Props {
  option: ECOption;
  renderer?: "canvas" | "svg";
  resize?: boolean;
  id?: string;
  theme?: Object | string;
  width?: number | string;
  height?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  renderer: "canvas",
  resize: true,
  id: "echarts",
});

const echartsStyle = computed(() => {
  return props.width || props.height
      ? {height: props.height + "px", width: props.width + "px"}
      : {height: "100%", width: "100%"};
});

// 这个新增的监听事件是为了监听拖动窗口大小改变， 普通的resize方法并不能监听到该动作
const myChart = ref<Element | null>();
let observer: ResizeObserver | null = null;

const chartRef = ref<HTMLDivElement | HTMLCanvasElement>();
const chartInstance = ref<EChartsType>();

const draw = () => {
  if (chartInstance.value) {
    chartInstance.value.setOption(props.option, {notMerge: true});
  }
};

watch(props, () => {
  draw();
});

const init = () => {
  if (!chartRef.value) return;
  chartInstance.value = echarts.getInstanceByDom(chartRef.value);
  if (!chartInstance.value) {
    chartInstance.value = markRaw(
        echarts.init(chartRef.value, props.theme, {
          renderer: props.renderer,
          locale: "ZH"
        })
    );

    draw();
  }
};

const resize = () => {
  if (chartInstance.value && props.resize) {
    chartInstance.value.resize({animation: {duration: 500}});
  }
};

const debouncedResize = useDebounceFn(resize, 50);

onMounted(() => {
  nextTick(() => init());
  window.addEventListener("resize", debouncedResize);
  if (myChart.value) {
    observer = new ResizeObserver(debouncedResize);
    observer.observe(myChart.value);
  }
});

onBeforeUnmount(() => {
  chartInstance.value?.dispose();
  window.removeEventListener("resize", debouncedResize);
  if (observer) {
    observer.disconnect();
  }
});

defineExpose({
  getInstance: () => chartInstance.value,
  resize,
  draw,

});
</script>

<template>
  <div class="comChart" ref="myChart">
    <div class="chart" :id="id" ref="chartRef" :style="echartsStyle"/>
  </div>
</template>

<style lang="scss" scoped>
@use './index.scss';
</style>