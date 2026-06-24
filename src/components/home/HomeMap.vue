<template>
  <div class="mapBox">
    <div class="minute" v-if="stoptime">
      <img src="../../assets/images/marker-current.png" />
      <span class="tsTitle">外出时间</span>
      <span class="tsRed" v-if="hours != 0">{{ hours }}小时</span>
      <span class="tsRed" v-if="minute != 0">{{ minute }}分钟</span>
    </div>
    <div v-if="mapBusy" class="map-loading">
      <ASpin :size="30" />
      <span>地图加载中...</span>
    </div>
    <BaiduMap
      v-if="mapVisible"
      class="map"
      :center="center"
      :zoom="zoom"
      :scroll-wheel-zoom="true"
      @click="$emit('map-click', $event)"
      @ready="$emit('ready', $event)"
      @dragstart="$emit('interaction-start')"
      @dragend="$emit('interaction-end')"
      @moving="$emit('interaction-start')"
      @moveend="$emit('interaction-end')"
      @zoomstart="$emit('interaction-start')"
      @zoomend="$emit('interaction-end')"
      @tilesloaded="$emit('loaded')"
    >
      <BmMarker
        v-if="showDq && shouldRenderMapOverlays"
        :position="center"
        :dragging="false"
        anum
      >
      </BmMarker>
      <div v-if="embrace && shouldRenderMapOverlays">
        <BmCircle
          :center="scopeCircle"
          :radius="radius"
          stroke-color="red"
          :stroke-opacity="1"
          :stroke-weight="2"
          :massClear="true"
        ></BmCircle>
        <BmPolygon
          :path="polygonPath"
          stroke-color="#f00"
          :stroke-opacity="1"
          :stroke-weight="2"
        ></BmPolygon>
        <div v-for="item in exceedArry" :key="item.lng">
          <MyOverlayBlue :position="{ lng: item.lng, lat: item.lat }">
          </MyOverlayBlue>
        </div>
      </div>
      <div v-if="addCoordShow && shouldRenderMapOverlays">
        <div>
          <MyOverlay
            :position="addCoord"
            :active="active"
            @mouseover="$emit('update:active', true)"
            @mouseleave="$emit('update:active', false)"
          >
          </MyOverlay>
        </div>

        <BmCircle
          :center="addCoord"
          :radius="radius"
          stroke-color="red"
          :stroke-opacity="0.5"
          :stroke-weight="2"
          :massClear="true"
        ></BmCircle>
      </div>
    </BaiduMap>
  </div>
</template>

<script setup>
import {
  BaiduMap,
  BmCircle,
  BmMarker,
  BmPolygon,
} from "vue-baidu-map-3x";
import MyOverlay from "../../comm/MyOverlay.vue";
import MyOverlayBlue from "../../comm/MyOverlayBlue.vue";

defineProps({
  active: Boolean,
  addCoord: {
    type: Object,
    required: true,
  },
  addCoordShow: Boolean,
  center: {
    type: Object,
    required: true,
  },
  embrace: Boolean,
  exceedArry: {
    type: Array,
    default: () => [],
  },
  hours: {
    type: Number,
    default: 0,
  },
  mapBusy: Boolean,
  mapVisible: Boolean,
  minute: {
    type: Number,
    default: 0,
  },
  polygonPath: {
    type: Array,
    default: () => [],
  },
  radius: {
    type: Number,
    default: 100,
  },
  scopeCircle: {
    type: Object,
    required: true,
  },
  shouldRenderMapOverlays: Boolean,
  showDq: Boolean,
  stoptime: Boolean,
  zoom: {
    type: Number,
    default: 15,
  },
});

defineEmits([
  "interaction-end",
  "interaction-start",
  "loaded",
  "map-click",
  "ready",
  "update:active",
]);
</script>

<style lang="scss" scoped>
.mapBox {
  flex: 1;
  min-height: 0;
  background: #fff;
  border: 1px solid #dadce0;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: none;

  .minute {
    position: absolute;
    top: 16px;
    left: 50%;
    min-width: 260px;
    height: 42px;
    padding: 0 16px;
    z-index: 999;
    background: #ffffff;
    border: 1px solid #dadce0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    box-shadow: 0 8px 24px rgba(60, 64, 67, 0.12);
    border-radius: 8px;
    transform: translateX(-50%);
    animation: stopAnim 0.24s ease-out both;

    > img {
      display: inline-block;
      width: 20px;
      height: 20px;
    }

    > span {
      font-size: 14px;
      font-weight: 500;

      &.tsTitle {
        color: #1a73e8;
      }

      &.tsRed {
        color: #d93025;
      }
    }
  }
}

.map-loading {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  color: #3c4043;
  font-size: 14px;
  line-height: 20px;
  pointer-events: none;
  backdrop-filter: blur(2px);
}

@keyframes stopAnim {
  from {
    opacity: 0;
    transform: translate(-50%, -8px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.map {
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  height: 100%;

  :deep(.anchorBL) {
    left: 10px !important;
    bottom: 10px !important;
  }

  :deep(.BMap_cpyCtrl) {
    bottom: 10px !important;
  }
}
</style>
