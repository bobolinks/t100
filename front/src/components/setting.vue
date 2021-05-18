<template>
  <div class="setting">
    <div class="layout-row" style="font-size: 12px; justify-content: space-around; min-height: 30px">
      <el-button size="medium" @click="restartApp">重启APP</el-button>
      <el-button size="medium" @click="restartGame">重新识别</el-button>
    </div>
    <el-divider content-position="center">开关</el-divider>
    <div class="layout-row field">
      <label>调试窗</label>
      <el-switch v-model="profile.showDebug"></el-switch>
    </div>
    <el-divider content-position="center">设备</el-divider>
    <div class="layout-row field">
      <label>摄像头</label>
      <el-select v-model="profile.device" size="mini" style="flex: 1 1 auto">
        <el-option v-for="item in sysinfo.devices" :key="item.deviceId" :label="item.label" :value="item.deviceId"> </el-option>
      </el-select>
    </div>
    <div class="layout-col" v-for="(filter, key) in profile.filters" :key="key">
      <el-divider content-position="center">{{ filter.label }}</el-divider>
      <div class="layout-row field" v-for="(prop, name) in filter.props" :key="name">
        <label>{{ prop.description }}</label>
        <el-input-number v-model="prop.value" size="mini" :min="prop.min" :max="prop.max" @change="handleChange" style="flex: 1 1 auto"></el-input-number>
      </div>
    </div>
  </div>
</template>
<script>
import core from '../core/index-fx';
export default {
  computed: {
    sysinfo() {
      return this.$store.state.sysinfo;
    },
    profile() {
      return this.$store.state.profile;
    },
  },
  methods: {
    handleChange() {
      this.$store.state.profileRevision++;
    },
    restartApp() {
      location.href = location.origin;
    },
    restartGame() {
      core.startAction('detecting');
    },
  },
};
</script>
<style>
.setting {
  position: absolute;
  top: 48px;
  right: 20px;
  width: 320px;
  padding: 12px;
  border-radius: 4px;
  background: white;
  /* opacity: 0.9; */
  font-size: 12px;
}
.field {
  margin: 4px 0;
  justify-content: space-between;
}
.field label {
  min-width: 80px;
  max-width: 80px;
  text-align: right;
  display: block;
  text-overflow: ellipsis;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
}
</style>
