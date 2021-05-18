<template>
  <div class="container" style="background: white">
    <div class="row" head="true" style="display: flex; flex-direction: row">
      <span class="cell" head="true"> X </span>
      <span class="cell" v-for="col in 100" :key="col" style="flex: 1 1 auto">{{ col }}</span>
    </div>
    <div class="row" v-for="row in 100" :key="row" style="display: flex; flex-direction: row">
      <span class="cell" head="true">{{ row }}</span>
      <span class="cell" v-for="col in 100" :key="col" style="flex: 1 1 auto">{{ row * col }}</span>
    </div>
    <video id="inputVideo" :width="resolution.width" :height="resolution.height" autoplay muted playsinline></video>
    <canvas id="canvas-ass" />
  </div>
</template>
<script>
import core from '../core/index';
import gesture from '../core/handgesture/index';
import { options } from '../store';
export default {
  components: {},
  data() {
    return {};
  },
  computed: {
    resolution() {
      return this.$store.state.sysinfo.resolutions[options.resolution];
    },
    state() {
      return this.$store.state.state;
    },
  },
  watch: {
    state(value) {
      // this.drawPreview(value);
    },
  },
  methods: {},
  mounted() {
    const video = $('#inputVideo');
    const cavas = $('#canvas-ass');
    video.onloadedmetadata = () => {
      core.restart();
    };
    core.init(this.$store.state, video);
    gesture.init(video, cavas);
    core.addModule(gesture);
  },
};
</script>
<style>
.container {
  position: relative;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  justify-items: stretch;
  align-items: stretch;
}
.row {
  margin: 0;
  flex: 1 1 auto;
  display: flex;
}
.row[head] {
  border-bottom: 1px solid #f2f2f2;
}
.cell {
  min-width: 16px;
  text-align: center;
  font-weight: 300;
}
.cell[head] {
  border-right: 1px solid #f2f2f2;
}

#inputVideo {
  /* position: fixed; */
  display: none;
}
#canvas-ass {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  pointer-events: none;
}
</style>
