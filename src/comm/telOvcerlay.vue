<template>
  <bm-overlay
    ref="customOverlay"
    :class="{sample: true, active}"
    pane="labelPane"
    @draw="draw">
     <div><img src="../assets/images/name.png"/><span>{{text.name}}{{number}}号</span></div>
     <div><img src="../assets/images/tel.png"/><span>{{tel}}</span></div>
     <span class="arrow"></span>
  </bm-overlay>
</template>

<script>
export default {
    name:'telOvcerlay',
  props: ['text', 'position', 'active','number','tel'],
  watch: {
    position: {
      handler () {
        this.$refs.customOverlay.reload()
      },
      deep: true
    }
  },
  methods: {
    // handleClick () {
    //   global.alert('Well done.')
    // },
    draw ({el, BMap, map}) {
      const {lng, lat} = this.position
      const pixel = map.pointToOverlayPixel(new BMap.Point(lng, lat))
      el.style.left = pixel.x - 65 + 'px'
      el.style.top = pixel.y - 100 + 'px'
    }
  }
}
</script>

<style lang='scss' scoped>
.sample {
  position: absolute;
   background: #fff; padding: 5px; border-radius: 5px; box-shadow: 5px -2px 5px #e2e2e2;
   animation: topbot 1.5s infinite; width: 116px; height:45px;
  >div{
    display: flex; align-content:center; justify-content: flex-start; padding: 2px 0;
    >img{ width: 20px; height: 20px; } 
    >span{ display: inline-block; height: 20px; font-size: 14px;color: #333; line-height: 20px;}
  } 
  .arrow{display: inline-block; border:10px solid #fff;  position: absolute; bottom: -20px ; left: 50%; margin: 0 0 0  -5px;
  border-left-color: transparent; border-bottom-color: transparent; border-right-color: transparent;}
}

@keyframes topbot{
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