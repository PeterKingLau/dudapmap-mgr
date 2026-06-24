<template>
  <bm-overlay
    ref="customOverlay"
    :class="{ sample: true, active }"
    pane="labelPane"
    @draw="draw"
  >
    <div>
      <img src="../assets/images/overlay-name.png" /><span
        >{{ text.name }}{{ number }}号</span
      >
    </div>
    <div>
      <img src="../assets/images/overlay-phone.png" /><span>{{ tel }}</span>
    </div>
    <span class="arrow"></span>
  </bm-overlay>
</template>

<script setup>
import { ref, watch } from "vue";
import { pointToOverlayPixel } from "../utils/baiduMapAdapter";

defineOptions({
  name: "TelOverlay",
});

const props = defineProps({
  text: {
    type: Object,
    default: () => ({ name: "人员" }),
  },
  position: {
    type: Object,
    default: () => ({ lng: 0, lat: 0 }),
  },
  offset: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
  active: {
    type: Boolean,
    default: false,
  },
  number: {
    type: [Number, String],
    default: "",
  },
  tel: {
    type: [Number, String],
    default: "",
  },
});

const customOverlay = ref(null);

watch(
  () => [props.position, props.offset],
  () => {
    customOverlay.value?.reload?.();
  },
  { deep: true },
);

function draw({ el, BMap, map }) {
  const offsetX = Number(props.offset?.x || 0);
  const offsetY = Number(props.offset?.y || 0);
  const pixel = pointToOverlayPixel(
    { BMap, map },
    props.position,
    {
      x: -65 + offsetX,
      y: -100 + offsetY,
    },
  );

  if (!pixel) {
    return;
  }

  el.style.left = `${pixel.x}px`;
  el.style.top = `${pixel.y}px`;
}
</script>

<style lang="scss" scoped>
.sample {
  position: absolute;
  background: #fff;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 5px -2px 5px #e2e2e2;
  animation: topbot 1.5s infinite;
  width: 116px;
  height: 45px;
  > div {
    display: flex;
    align-content: center;
    justify-content: flex-start;
    padding: 2px 0;
    > img {
      width: 20px;
      height: 20px;
    }
    > span {
      display: inline-block;
      height: 20px;
      font-size: 14px;
      color: #333;
      line-height: 20px;
    }
  }
  .arrow {
    display: inline-block;
    border: 10px solid #fff;
    position: absolute;
    bottom: -20px;
    left: 50%;
    margin: 0 0 0 -5px;
    border-left-color: transparent;
    border-bottom-color: transparent;
    border-right-color: transparent;
  }
}

@keyframes topbot {
  0% {
    transform: translate(0px, 0px);
  }
  50% {
    transform: translate(0px, -5px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}
</style>
