<template>
  <div class="container">
    <div id="scene" is="is-screen"></div>
    <video id="inputVideo" :width="resolution.width" :height="resolution.height" autoplay muted playsinline style="flex: 1 1 auto"></video>
    <canvas id="canvas-ass" style="flex: 1 1 auto"></canvas>
    <img id="qrcode" :src="state.qrcode" />
  </div>
</template>
<script>
import ClrNumber from '../components/number.vue';
import MulTable from '../components/mul.vue';
import uisys from '../uisys/index';
import { options } from '../store';
import Scenes from '../scenes/index';
import NorDic from '../util/nordic';
export default {
  components: {
    ClrNumber,
    MulTable,
  },
  data() {
    return {};
  },
  computed: {
    resolution() {
      return options.resolution;
    },
    state() {
      return this.$store.state;
    },
  },
  watch: {},
  methods: {
    startScene(name) {
      if (this.scene) {
        this.$rpc.undescribe(this.scene);
        this.scene.dispose();
      }
      this.$rpc.undescribe(this);

      const Scene = Scenes[name];
      this.scene = new Scene($('#scene'));
      this.scene.launch('');

      this.$rpc.describe('scene.start', this.startScene, this);
      this.$rpc.describe('scene.input', this.scene.input, this.scene);
      this.$rpc.describe('scene.execute', this.scene.execute, this.scene);
      this.$rpc.describe('scene.stop', () => {
        this.$rpc.undescribe(this);
        this.$rpc.describe('scene.start', this.startScene, this);
      });

      document.title = this.scene.name;

      return {
        name: this.scene.name,
        patterns: NorDic.encode(this.scene.patterns()),
      };
    },
  },
  mounted() {
    const video = $('#inputVideo');
    const cavas = $('#canvas-ass');
    video.onloadedmetadata = () => {
      uisys.start();
    };
    uisys.init(this.$store.state, video, cavas);
    this.$rpc.describe('scene.start', this.startScene, this);
  },
  unmounted() {
    uisys.stop();
  },
};
</script>
<style>
.container {
  position: relative;
  text-shadow: 1px 2px 4px gray;
}
#scene {
  position: absolute;
  width: 100vw;
  height: 100vh;
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
#qrcode {
  position: fixed;
  right: 0;
  top: 0;
  width: 100px;
  height: 100px;
}
</style>
