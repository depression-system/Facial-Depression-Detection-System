<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useMessage } from 'naive-ui'
import Echarts from "@/components/Echarts/index.vue";
import type { ECOption } from "@/components/Echarts/config";
import { SmileRegular, SadCryRegular } from "@vicons/fa";

const showAnalysis = ref(true);

// ===================== 批量筛查测试数据 =====================
// 得分范围对应 Math.round(score * 63)：正常0-16，轻度17-32，中度33-47，重度48-63
// 统计图数据：正常71人，轻度17人，中度6人，重度2人，共96人，补4条凑100
const generateTestData = () => {
  const data: { name: string; score: number; level: string }[] = [];
  let idx = 1;
  // 正常 71人：得分 0-16（score 0~0.254）
  for (let i = 0; i < 71; i++) {
    const rawScore = parseFloat((Math.random() * 0.253 + 0.001).toFixed(4));
    data.push({ name: `s${idx++}`, score: Math.round(rawScore * 63), level: '正常' });
  }
  // 轻度 17人：得分 17-31（score 0.27~0.499）
  for (let i = 0; i < 17; i++) {
    const rawScore = parseFloat((Math.random() * 0.23 + 0.27).toFixed(4));
    data.push({ name: `s${idx++}`, score: Math.round(rawScore * 63), level: '轻度' });
  }
  // 中度 6人：得分 32-47（score 0.508~0.746）
  for (let i = 0; i < 6; i++) {
    const rawScore = parseFloat((Math.random() * 0.238 + 0.508).toFixed(4));
    data.push({ name: `s${idx++}`, score: Math.round(rawScore * 63), level: '中度' });
  }
  // 重度 2人：得分 48-63（score 0.762~1.0）
  for (let i = 0; i < 2; i++) {
    const rawScore = parseFloat((Math.random() * 0.238 + 0.762).toFixed(4));
    data.push({ name: `s${idx++}`, score: Math.round(rawScore * 63), level: '重度' });
  }
  // 补充4条正常数据凑齐100
  for (let i = 0; i < 4; i++) {
    const rawScore = parseFloat((Math.random() * 0.253 + 0.001).toFixed(4));
    data.push({ name: `s${idx++}`, score: Math.round(rawScore * 63), level: '正常' });
  }
  return data;
};

const testData = reactive(generateTestData());

// 测试数据表格列
const testTableColumns = ref([
  { title: '名称', key: 'name', align: 'center' },
  { title: '得分', key: 'score', align: 'center' },
]);

// 统计各等级人数
const levelCount = computed(() => ({
  normal: testData.filter(d => d.level === '正常').length,
  mild:   testData.filter(d => d.level === '轻度').length,
  moderate: testData.filter(d => d.level === '中度').length,
  severe: testData.filter(d => d.level === '重度').length,
  total:  testData.length,
}));

// 饼图 option
const pieOption = computed<ECOption>(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
  legend: {
    orient: 'horizontal',
    bottom: 4,
    data: ['正常', '轻度', '中度', '重度'],
    textStyle: { color: '#333', fontSize: 16 },
  },
  series: [
    {
      name: '风险等级占比',
      type: 'pie',
      radius: ['35%', '62%'],
      center: ['50%', '46%'],
      data: [
        { value: levelCount.value.normal,   name: '正常', itemStyle: { color: '#4682B4' } },
        { value: levelCount.value.mild,     name: '轻度', itemStyle: { color: '#2E8B57' } },
        { value: levelCount.value.moderate, name: '中度', itemStyle: { color: '#f2994a' } },
        { value: levelCount.value.severe,   name: '重度', itemStyle: { color: '#eb5757' } },
      ],
      label: { formatter: '{b} {d}%', color: '#333', fontSize: 16 },
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' } },
    },
  ],
}));

// 柱状图 option
const barOption = computed<ECOption>(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '12%', right: '5%', top: '15%', bottom: '12%' },
  xAxis: [{
    type: 'category',
    data: ['正常', '轻度', '中度', '重度'],
    axisLabel: { color: '#333', fontSize: 16 },
    axisTick: { alignWithLabel: true },
  }],
  yAxis: [{
    type: 'value',
    name: '人数',
    nameTextStyle: { color: '#666', fontSize: 16 },
    axisLabel: { color: '#333', fontSize: 16 },
    splitLine: { lineStyle: { color: '#e5eaf2' } },
  }],
  series: [
    {
      name: '各等级人数',
      type: 'bar',
      barWidth: '45%',
      data: [
        { value: levelCount.value.normal,   itemStyle: { color: '#4682B4', borderRadius: [6,6,0,0] } },
        { value: levelCount.value.mild,     itemStyle: { color: '#2E8B57', borderRadius: [6,6,0,0] } },
        { value: levelCount.value.moderate, itemStyle: { color: '#f2994a', borderRadius: [6,6,0,0] } },
        { value: levelCount.value.severe,   itemStyle: { color: '#eb5757', borderRadius: [6,6,0,0] } },
      ],
      label: { show: true, position: 'top', color: '#222', fontWeight: 'bold', fontSize: 16 },
    },
  ],
}));

const message = useMessage();
// 视频保存地址
const filePath = ref('');
// 录制视频相关控件
const cameraRef = ref();
// 记录视频的相关控件
const recordedVideoRef = ref();
// 摄像头是否打开
const isCamera = ref(false);
// 视频流
const stream: any = ref(null);
// MediaRecorder 实例
const mediaRecorder: any = ref(null);
// 录制的视频
const recordedChunks: any = ref([]);
// 录制的视频URL
const recordUrl: any = ref(null);
// 是否录制中
const isRecording = ref(false);
// 进程通信
const { saveBuffer, startAnalysis } = window.electronAPI;

// 开启摄像头
const startCamera = async () => {
  try {
    isCamera.value = true;
    stream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraRef.value.srcObject = stream.value;
  } catch (error: any) {
    message.error(error);
  }
}

// 关闭摄像头
const endCamera = () => {
  try {
    isCamera.value = false;
    stream.value = null;
    cameraRef.value.srcObject = null;
  } catch (error: any) {
    message.error(error);
  }
}

// 开始录制
const startRecord = () => {
  // 判断摄像头是否打开
  if (!stream.value) {
    message.warning("请先启动摄像头！");
    return;
  }
  // 更新状态
  isRecording.value = true;
  isAnalysis.value = false;
  Object.assign(analysisResult, {
    score: null,
    result: null
  })
  recordedChunks.value = [];
  mediaRecorder.value = null;
  mediaRecorder.value = new MediaRecorder(stream.value);
  // 收集录制数据
  mediaRecorder.value.ondataavailable = (event: any) => {
    if (event.data.size > 0) {
      recordedChunks.value.push(event.data);
    }
  };
  // 停止录制时回调
  mediaRecorder.value.onstop = async () => {
    // 保存视频
    const blob = new Blob(recordedChunks.value, { type: "video/webm" });
    const buffer = await blob.arrayBuffer();
    try {
      await saveBuffer(buffer).then((res) => {
        filePath.value = res;
      });
      recordUrl.value = URL.createObjectURL(blob);
      recordedVideoRef.value.src = recordUrl.value;
    } catch (error: Error | any) {
      message.error("视频保存失败:", error.message);
    }
  };
  mediaRecorder.value.start();
  isRecording.value = true;

}

// 结束录制
const endRecord = () => {
  isAnalysis.value = true;
  isRecording.value = false;

  if (mediaRecorder.value) {
    mediaRecorder.value.stop();
  }
}

// 分析状态
const isAnalysis = ref(false);
const analysisIng = ref(false);
const analysisResult = reactive({
  score: null,
  result: null,
  level: null,
})

// 开始分析
const handleAnalysis = async () => {
  analysisIng.value = true;
  Object.assign(analysisResult, {
    score: null,
    result: null,
    level: null,
  })
  if (!filePath.value) {
    message.error("获取视频录制地址失败")
    return;
  }
  // 调用过程
  startAnalysis(filePath.value).then((res: any) => {
    // 解析结果
    Object.assign(analysisResult, res)
    tableData.push({
      level: res.level,
      score: Math.round(res.score * 63).toFixed(0),
    })
    if (tableData.length > 2) {
      tableData.shift()
    }
    Object.assign(option, {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          center: ['50%', '75%'],
          radius: '90%',
          min: 0,
          max: 1,
          splitNumber: 8,
          axisLine: {
            lineStyle: {
              width: 6,
              color: [
                [0.25, '#7CFFB2'],
                [0.5, '#58D9F9'],
                [0.75, '#FDDD60'],
                [1, '#FF6E76']
              ]
            }
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '12%',
            width: 20,
            offsetCenter: [0, '-60%'],
            itemStyle: {
              color: 'auto'
            }
          },
          axisTick: {
            length: 12,
            lineStyle: {
              color: 'auto',
              width: 2
            }
          },
          splitLine: {
            length: 20,
            lineStyle: {
              color: 'auto',
              width: 5
            }
          },
          axisLabel: {
            color: '#464646',
            fontSize: 20,
            distance: -60,
            rotate: 'tangential',

            formatter: (value: number) => {
              if (value === 0.875) {
                return '重度';
              } else if (value === 0.625) {
                return '中度';
              } else if (value === 0.375) {
                return '轻度';
              } else if (value === 0.125) {
                return '轻微';
              }
              return '';
            }
          },
          title: {
            offsetCenter: [0, '-10%'],
            fontSize: 20
          },
          detail: {
            fontSize: 30,
            offsetCenter: [0, '-35%'],
            valueAnimation: true,
            color: 'inherit',
            formatter: (value: number) => {
              return Math.round(value * 63).toFixed(0) + '';
            },
          },
          data: [
            {
              value: analysisResult.score,
              name: '评级'
            }
          ]
        }
      ]
    })
    analysisIng.value = false;
  });
}

// echarts图表
const option = reactive<ECOption>({})

const tableColumns = ref([{
  title: '程度',
  key: 'level'
}, {
  title: '得分',
  key: 'score'
},])

const tableData = reactive<any[]>([]);
</script>


<template>
  <n-spin :show="analysisIng" class="dashboard">
    <div class="header">
      抑郁检测平台
    </div>
    <n-grid :x-gap="12" :cols="10" class="dashboard-grid">
      <template v-if="showAnalysis">
        <!-- 左侧4列：测试数据表格 -->
        <n-gi :span="2" class="dashboard-grid-item">
          <n-card title="**社区测评统计结果" class="card table-card" style="height:100%">
            <n-data-table
              :columns="testTableColumns"
              :data="testData"
              :bordered="true"
              flex-height
              style="height:100%;width:100%"
              :virtual-scroll="true"
            />
          </n-card>
        </n-gi>
        <!-- 右侧6列：3个Card，40/40/20比例 -->
        <n-gi :span="8" class="dashboard-grid-item">
          <!-- Card 1：饼图 40% -->
          <div class="card-grid-item" style="height: calc(50% - 6px)">
            <n-card title="风险等级占比" class="card">
              <div class="card-content">
                <Echarts :option="pieOption" class="camera" />
              </div>
            </n-card>
          </div>
          <!-- Card 2：柱状图 40% -->
          <div class="card-grid-item" style="height: calc(50% - 6px); margin-top: 8px">
            <n-card title="各等级人数统计" class="card">
              <div class="card-content">
                <Echarts :option="barOption" class="camera" />
              </div>
            </n-card>
          </div>
          <!-- Card 3：统计摘要 20% -->
          <!-- <div class="card-grid-item" style="height: calc(20% - 4px); margin-top: 8px">
            <n-card title="统计摘要" class="card">
              <div class="card-content">
                <n-row style="width:100%">
                  <n-col :span="5">
                    <n-space justify="center" vertical>
                      <n-statistic label="有效样本">{{ levelCount.total }}</n-statistic>
                    </n-space>
                  </n-col>
                  <n-col :span="5">
                    <n-space justify="center" vertical>
                      <n-statistic label="正常">
                        <span style="color:#4682B4">{{ levelCount.normal }}人</span>
                      </n-statistic>
                    </n-space>
                  </n-col>
                  <n-col :span="5">
                    <n-space justify="center" vertical>
                      <n-statistic label="轻度">
                        <span style="color:#2E8B57">{{ levelCount.mild }}人</span>
                      </n-statistic>
                    </n-space>
                  </n-col>
                  <n-col :span="5">
                    <n-space justify="center" vertical>
                      <n-statistic label="中度">
                        <span style="color:#f2994a">{{ levelCount.moderate }}人</span>
                      </n-statistic>
                    </n-space>
                  </n-col>
                  <n-col :span="4">
                    <n-space justify="center" vertical>
                      <n-statistic label="重度">
                        <span style="color:#eb5757">{{ levelCount.severe }}人</span>
                      </n-statistic>
                    </n-space>
                  </n-col>
                </n-row>
              </div>
            </n-card>
          </div> -->
        </n-gi>
      </template>
      <template v-else>
        <n-gi :span="5" class="dashboard-grid-item">
          <n-grid :y-gap="8" :cols="1" class="card-grid">
            <n-gi class="card-grid-item">
              <n-card title="摄像头捕获" class="card">
                <div class="card-content">
                  <n-skeleton class="camera" :sharp="false" v-if="!isCamera" />
                  <video class="camera" ref="cameraRef" autoplay v-else></video>
                </div>
                <template #footer>
                  <n-space justify="end">
                    <n-button type="info" :disabled="isCamera" @click="startCamera">开启摄像头</n-button>
                    <n-button :disabled="!isCamera" @click="endCamera">关闭摄像头</n-button>
                    <n-button type="primary" :disabled="isRecording" @click="startRecord">开始录制</n-button>
                    <n-button :disabled="!isRecording" @click="endRecord">结束录制</n-button>
                  </n-space>
                </template>
              </n-card>
            </n-gi>
            <n-gi class="card-grid-item">
              <n-card title="视频录制预览" class="card">
                <div class="card-content">
                  <n-skeleton class="camera" :sharp="false" v-if="!isAnalysis" />
                  <video class="camera" ref="recordedVideoRef" autoplay controls v-else></video>
                </div>
                <template #footer>
                  <n-space justify="end">
                    <n-button type="primary" :disabled="!isAnalysis" @click="handleAnalysis">开始分析</n-button>
                  </n-space>
                </template>
              </n-card>
            </n-gi>
          </n-grid>
        </n-gi>

        <n-gi :span="5" class="dashboard-grid-item">
          <div class="card-grid-item" style="height: 180px">
            <n-card title="分析结果" class="card">
              <div class="card-content">
                <n-skeleton class="camera" :sharp="false" v-if="analysisResult.result === null" />
                <div v-else class="camera">
                  <n-space justify="space-around" size="large">
                    <n-icon size="64" class="icon" :color="analysisResult.result ? '#18A058' : '#e0e0e0'">
                      <SmileRegular />
                    </n-icon>
                    <n-icon size="64" class="icon" :color="!analysisResult.result ? '#18A058' : '#e0e0e0'">
                      <SadCryRegular />
                    </n-icon>
                  </n-space>
                </div>
              </div>
            </n-card>
          </div>
          <div class="card-grid-item" style="height: calc((100% - 180px - 16px) / 3 * 2); margin-top: 8px">
            <n-card title="分析评分" class="card">
              <div class="card-content">
                <n-skeleton class="camera" :sharp="false" v-if="analysisResult.score === null" />
                <Echarts :option="option" class="camera" v-else></Echarts>
              </div>
            </n-card>
          </div>
          <div class="card-grid-item" style="height: calc((100% - 180px - 16px) / 3);margin-top: 8px">
            <div class="params">
              <n-card title="分析历史" class="card">
                <div class="card-content">
                  <n-data-table max-height="100px" :columns="tableColumns" :data="tableData" :bordered="true" />
                </div>
              </n-card>
              <n-card title="分析结果" class="card" style="margin-left: 12px">
                <div class="card-content">
                  <n-skeleton class="camera" :sharp="false" v-if="analysisResult.score === null" />
                  <n-row v-else>
                    <n-col :span="12">
                      <n-space justify="center">
                        <n-statistic label="程度">
                          {{ analysisResult.level }}
                        </n-statistic>
                      </n-space>

                    </n-col>
                    <n-col :span="12">
                      <n-space justify="center">
                        <n-statistic label="得分">
                          {{ Math.round(analysisResult.score * 63).toFixed(0) }}
                        </n-statistic>
                      </n-space>
                    </n-col>
                  </n-row>
                </div>
              </n-card>
            </div>
          </div>
        </n-gi>
      </template>


    </n-grid>
    <template #description>
      正在计算中，请稍后……
    </template>
  </n-spin>
</template>

<style lang="scss" scoped>
@use "./index.scss";
</style>