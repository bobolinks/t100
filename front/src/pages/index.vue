<template>
  <div class="container" style="align-items: center; background: white; display: flex; flex-direction: row; justify-content: space-around">
    <div class="table" style="align-items: stretch; display: flex; flex-direction: column">
      <div class="row" head="true" style="display: flex; flex: 1 1 auto; flex-direction: row">
        <span class="cell" head="true"> X </span>
        <ClrNumber class="cell" v-for="col in 9" :key="col" :value="col"></ClrNumber>
      </div>
      <div class="row" v-for="row in 9" :key="row" style="display: flex; flex: 1 1 auto; flex-direction: row">
        <ClrNumber class="cell" head="true" :value="row"></ClrNumber>
        <ClrNumber class="cell" v-for="col in 9" :key="col" :value="row * col"></ClrNumber>
      </div>
    </div>
    <MulTable class="mul" style="flex: 0 0 0%"></MulTable>
    <video id="inputVideo" :width="resolution.width" :height="resolution.height" autoplay muted playsinline style="flex: 1 1 auto"></video>
    <canvas id="canvas-ass" style="flex: 1 1 auto"></canvas>
  </div>
</template>
<script>
import ClrNumber from '../components/number.vue';
import MulTable from '../components/mul.vue';
import uisys from '../uisys/index';
import { options } from '../store';
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
      return this.$store.state.sysinfo.resolutions[options.resolution];
    },
    state() {
      return this.$store.state.state;
    },
  },
  watch: {},
  methods: {},
  mounted() {
    const video = $('#inputVideo');
    const cavas = $('#canvas-ass');
    video.onloadedmetadata = () => {
      uisys.start();
    };
    uisys.init(this.$store.state, video, cavas);
  },
  unmounted() {
    uisys.stop();
  },
};
</script>
<style>
.container {
  position: relative;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: stretch;
  text-shadow: 1px 2px 4px gray;
}
.table {
  border-top: 1px solid #eee;
  border-left: 1px solid #eee;
  font-size: 42px;
}
.row {
  margin: 0;
  display: flex;
}
.row[head] {
  background: #f2f2f2;
}
.cell {
  flex: 0 0 0%;
  min-width: 80px;
  min-height: 80px;
  text-align: center;
  vertical-align: middle;
  line-height: 80px;
  font-weight: 300;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
}
.row[head] .cell {
  font-weight: 800;
}
.cell[head] {
  background: #f2f2f2;
  font-weight: 800;
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
