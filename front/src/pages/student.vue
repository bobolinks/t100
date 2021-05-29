<template>
  <div class="page" style="align-items: stretch; display: flex; flex-direction: column">
    <div class="main" style="display: flex; flex: 1 1 auto; flex-direction: column">
      <div class="toolbar" style="display: flex; flex: 0 1 auto; flex-direction: row">
        <div style="align-items: center; display: flex; flex: 1 1 auto; flex-direction: row; justify-content: flex-start">
          <i class="icon-pane" style="font-size: 1.2em; margin-right: 0.2em; color: white !important"></i>
          <label>{{ title }}</label>
        </div>
        <div class="baritems" style="flex: 0 0 none; justify-content: center">
          <!-- <label>{{ tip }}</label> -->
        </div>
        <div class="baritems" style="flex: 1 1 auto; justify-content: flex-end">
          <!-- <i class="icon-options"></i> -->
        </div>
      </div>
      <div class="actpane" style="display: flex; flex: 1 1 auto; flex-direction: column">
        <div class="scripts" style="flex: 1 1 auto">
          <div class="item" v-for="(item, index) in scripts" :key="index" style="align-items: center; display: flex; flex-direction: row">
            <div class="linenum">
              <label>{{ index + 1 }}</label>
            </div>
            <i :class="'icon-' + item.type"></i>
            <label style="flex: 1 1 auto">{{ item.content }}</label>
          </div>
        </div>
        <form class="input-form" @submit="onSubmit" style="flex: 0 0 0%">
          <span class="input-item sugestion">{{ inputSugestion }}</span>
          <div style="align-items: center; display: flex; flex-direction: row">
            <i class="icon-edit" style="flex: 0 0 0%; margin: 0 0.4em"></i>
            <input class="input-item" id="cmd-txt" type="text" :placeholder="tip" @keyup="onkey" style="flex: 1 1 auto" />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { Is } from '../is/index';
import NorDic from '../util/nordic';
export default {
  components: {},
  data() {
    return {
      inputSugestion: '...',
      title: 'title',
      tip: '在这里输入命令哦',
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
      const cmdline = $('#cmd-txt').value;
      if (!cmdline) {
        return;
      }
      $('#cmd-txt').value = '';
      let action = 'action';
      if (cmdline === 'exit') {
        action = 'exit';
        this.$rpc.request('relay.input', 'scene.stop').then((e) => {
          this.scripts.push({
            type: 'message',
            content: `Stop succesfully!`,
            time: new Date(),
          });
          this.term = null;
        });
      } else if (/^start\s(\w+)$/.test(cmdline)) {
        action = 'start';
        const [, name] = cmdline.match(/^start\s(\w+)$/);
        this.$rpc.request('relay.input', 'scene.start', name).then((e) => {
          this.scripts.push({
            type: 'message',
            content: `Start succesfully!`,
            time: new Date(),
          });
          this.title = e.name;
          this.startScene(NorDic.decode(e.patterns));
        });
      } else if (!this.term) {
        return;
      } else if (!this.term.excute(cmdline)) {
        action = 'error';
      }
      this.scripts.push({
        type: action,
        content: cmdline,
        time: new Date(),
      });

      this.$nextTick(() => {
        document.querySelector('.item:last-child').scrollIntoView(false);
      });
    },
    onkey(e) {
      if (this.term) {
        const cmdline = $('#cmd-txt').value;
        const rs = this.term.input(cmdline);
        this.inputSugestion = rs.sugesstions?.length ? rs.sugesstions[0] : '...';
        if (rs.sugesstions?.length) {
          this.$rpc.request('relay.input', 'scene.input', e.keyCode, cmdline).then((e) => {});
        }
      }
    },
    startScene(patterns) {
      if (this.term) {
        this.$rpc.undescribe(this.term);
      }
      this.$rpc.undescribe(this);
      this.$rpc.describe(
        'scene.tip',
        (e) => {
          // InputTip
          this.tip = e.tip;
          this.term.limit(e.pattern);
        },
        this,
      );
      this.term = new Is.Terminator(patterns, (name, args) => {
        this.$rpc.request('relay.input', 'scene.execute', name, args).then((e) => {
          if (e) {
            this.scripts.push({
              type: 'message',
              content: e,
              time: new Date(),
            });
          }
        });
      });
    },
  },
  mounted() {
    document.title = '[Student]';
    this.scripts = [];
  },
};
</script>
<style scoped='true'>
.main {
  font-size: 1.4rem;
  font-style: normal;
  flex: 1 1 auto;
  border-radius: 8px;
  /* border: 1px solid #f2f2f2; */
  overflow: hidden;
  box-sizing: border-box;
  background: white;
}

.main i {
  font-family: 'iconfont' !important;
  color: #ff6600;
  font-size: 1.8em;
}

.toolbar {
  background-color: #0ae;
  min-height: 3em;
  padding: 0 0.8em;
  border-bottom: 1px solid #d2d2d2;
}

.toolbar i {
  color: white;
  cursor: pointer;
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
  color: white;
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
  letter-spacing: 0.2em;
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
  color: #666;
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

.input-form {
  position: relative;
  background: radial-gradient(circle at 10px -7px, transparent 8px, #ffcc99 8px, #ffcc99 9px, transparent 9px) repeat-x, radial-gradient(circle at 10px 27px, transparent 8px, #ffcc99 8px, #ffcc99 9px, transparent 9px) repeat-x;
  background-size: 20px 20px;
  background-position: -10px calc(100% + 16px), 0 calc(100% - 4px);
  border-top: 1px solid #f2f2f2;
  display: flex;
  flex-direction: column;
  padding: 0.5em;
}

.input-form .icon-edit {
  font-size: 1.2em;
}

.input-form .input-item {
  font-family: sans-serif !important;
  border: none;
  outline: none;
  display: inline-block;
  font-family: longcang;
  padding-bottom: 8px;
  width: 100%;
  letter-spacing: 0.2em;
  background: transparent;
}

.input-form .sugestion {
  font-size: 1.2em;
  min-height: 1.2em;
  margin-left: 2.2em;
  user-select: none;
  pointer-events: none;
  color: #aaa;
}

.input-form input {
  font-size: 2em;
  color: #888;
}
</style>
