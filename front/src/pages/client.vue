<template>
  <div style="display: flex; flex-direction: column; height: 100vh" class="main">
    <div style="display: flex; flex: 0 1 auto; flex-direction: row" class="toolbar">
      <div style="align-items: center; display: flex; flex: 1 1 auto; flex-direction: row; justify-content: flex-start">
        <i class="icon-light" style="font-size: 1.2em; margin-right: 0.2em"></i>
        <label>{{ tip }}</label>
      </div>
      <div style="flex: 0 0 none; justify-content: center" class="baritems"></div>
      <div style="flex: 1 1 auto; justify-content: flex-end" class="baritems">
        <!-- <i class="icon-options"></i> -->
      </div>
    </div>
    <div style="display: flex; flex: 1 1 auto; flex-direction: column" class="actpane">
      <div style="flex: 1 1 auto" class="scripts">
        <div v-for="(item, index) in scripts" :key="index" style="align-items: center; display: flex; flex-direction: row" class="item">
          <div class="linenum">
            <label>{{ index + 1 }}</label>
          </div>
          <i :class="'icon-' + item.type"></i>
          <label style="flex: 1 1 auto">{{ item.content }}</label>
        </div>
      </div>
      <div style="align-items: center; display: flex; flex: 0 0 0%; flex-direction: row; padding: 0.5em">
        <i style="margin-right: 0.5em" class="icon-edit"></i>
        <form style="flex: 1 1 auto" @submit="onSubmit">
          <input type="text" placeholder="在这里输入命令哦" />
        </form>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      tip: 'tip',
      scripts: [
        {
          time: new Date(),
          type: 'action',
          content: 'fly()',
        },
        {
          time: new Date(),
          type: 'action',
          content: 'to(find(table).above)',
        },
      ],
    };
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      if (!e.target.children[0].value) {
        return;
      }
      this.scripts.push({
        type: 'action',
        content: e.target.children[0].value,
        time: new Date(),
      });
      e.target.children[0].value = '';
      this.$nextTick(() => {
        document.querySelector('.item:last-child').scrollIntoView(false);
      });
    },
  },
  mounted() {
    this.scripts = [];
  },
};
</script>
<style scoped='true'>
.main {
  font-size: 1.4rem;
  font-style: normal;
  flex: 1 1 auto;
}

.main i {
  font-family: 'iconfont' !important;
  color: #ff6600;
  font-size: 1.8em;
  cursor: pointer;
}

.toolbar {
  background-color: #f2f2f2;
  min-height: 3em;
  padding: 0 0.8em;
  border-bottom: 1px solid #d2d2d2;
}

.toolbar .scorebar {
  background-color: #ff6600;
  height: 1em;
  min-width: 1px;
  border-radius: 0.5em;
  margin: 0 1em;
}

.toolbar label {
  font-size: 1.8em;
  color: #ff6600;
}

.baritems {
  align-items: center;
  display: flex;
  flex-direction: row;
}

.baritems i {
  color: #ff6600;
  font-size: 1.6em;
  line-height: 1;
  margin: 0 0.5em;
  border-radius: 1.4em;
  font-weight: 900;
  font-style: normal;
}

.baritems i:last-child {
  margin-right: 0 !important;
}

.baritems i[disabled] {
  color: var(--color-disabled);
  pointer-events: none;
}

.actpane {
  flex: 1 1 auto;
  min-height: 20em;
}

.actpane input {
  border: none;
  outline: none;
  display: inline-block;
  font-size: 2em;
  font-family: longcang;
  padding-bottom: 8px;
  background: radial-gradient(circle at 10px -7px, transparent 8px, #ffcc99 8px, #ffcc99 9px, transparent 9px) repeat-x, radial-gradient(circle at 10px 27px, transparent 8px, #ffcc99 8px, #ffcc99 9px, transparent 9px) repeat-x;
  background-size: 20px 20px;
  background-position: -10px calc(100% + 16px), 0 calc(100% - 4px);
  width: 100%;
}

.scripts {
  padding: 0 0.5em;
  color: #222;
  overflow: scroll;
}

.scripts .item {
  font-size: 1.2em;
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 2em;
  background: radial-gradient(circle at 10px -7px, transparent 8px, #f2f2f2 8px, #f2f2f2 9px, transparent 9px) repeat-x, radial-gradient(circle at 10px 27px, transparent 8px, #f2f2f2 8px, #f2f2f2 9px, transparent 9px) repeat-x;
  background-size: 20px 20px;
  background-position: -10px calc(100% + 16px), 0 calc(100% - 4px);
}

.scripts .item i {
  color: #222;
  font-size: 1em;
  margin: 0.5em;
  font-style: normal;
}

.scripts .linenum {
  align-self: stretch;
  border-right: 1px solid #f2f2f2;
  min-width: 2em;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
