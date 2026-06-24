<template>
  <bm-overlay
    ref="customOverlay"
    :class="{ sample: true, active }"
    pane="labelPane"
    @draw="draw"
  >
    <div>
      <div class="ripple"></div>
      <div class="ripple"></div>
      <div class="ripple"></div>
    </div>
  </bm-overlay>
</template>

<script setup>
import { ref, watch } from "vue";
import { pointToOverlayPixel } from "../utils/baiduMapAdapter";

defineOptions({
  name: "MyOverlayBlue",
});

const props = defineProps({
  text: {
    type: [String, Object],
    default: "",
  },
  position: {
    type: Object,
    default: () => ({ lng: 0, lat: 0 }),
  },
  active: {
    type: Boolean,
    default: false,
  },
});

const customOverlay = ref(null);

watch(
  () => props.position,
  () => {
    customOverlay.value?.reload?.();
  },
  { deep: true },
);

function draw({ el, BMap, map }) {
  const pixel = pointToOverlayPixel(
    { BMap, map },
    props.position,
    { x: -8, y: -8 },
  );

  if (!pixel) {
    return;
  }

  el.style.left = `${pixel.x}px`;
  el.style.top = `${pixel.y}px`;
}
</script>

<style scoped>
.sample {
  text-align: center;
  position: absolute;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #5ecef6;
}
.sample.active {
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
}

.ripple {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid #5ecef6;
  animation: ripple 2s linear infinite;
}

@keyframes ripple {
  to {
    width: 40px;
    height: 40px;
    opacity: 0;
  }
}
.ripple:nth-child(1) {
  animation-delay: 1s;
}
.ripple:nth-child(2) {
  animation-delay: 2s;
}
</style>
