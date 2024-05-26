<template>
    <bm-overlay
    ref="customOverlay"
    :class="{sample: true, active}"
    pane="labelPane"
    @draw="draw">
    <div>
        <div class="ripple"></div>
        <div class="ripple"></div>
        <div class="ripple"></div>
    </div>
  </bm-overlay>
</template>

<script>
export default {
    name:'MyOverlayBlue',
  props: ['text', 'position', 'active'],
  watch: {
    position: {
      handler () {
        this.$refs.customOverlay.reload()
      },
      deep: true
    }
  },
  methods: {
   
    draw ({el, BMap, map}) {
      const {lng, lat} = this.position
      const pixel = map.pointToOverlayPixel(new BMap.Point(lng, lat))
      el.style.left = pixel.x - 8 + 'px'
      el.style.top = pixel.y - 8 + 'px'
    }
  }
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
  background: rgba(0,0,0,0.75);
  color: #fff;
}

.ripple {
         width:10px;
         height: 10px;
         border-radius: 50%;
         position: absolute;
         top: 50%;
         left: 50%;
         transform: translate(-50%,-50%);
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