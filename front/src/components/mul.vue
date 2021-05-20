<template>
  <div class="mul-table" style="display: flex; flex-direction: column">
    <div class="mul-row" v-for="(v, i) in 6" :key="i" style="display: flex; flex: 1 1 auto; flex-direction: row">
      <ClrNumber class="mul-cell" v-for="(v, j) in 4" :key="j" :value="calc(i, j)" :row="i" :col="j" style="flex: 1 1 auto"></ClrNumber>
    </div>
  </div>
</template>
<script>
import ClrNumber from './number.vue';
export default {
  components: {
    ClrNumber,
  },
  props: {
    a: {
      type: [Number, String],
      default: 23,
    },
    b: {
      type: [Number, String],
      default: 65,
    },
  },
  computed: {
    a0() {
      return parseInt((this.a + 100).toString()[1]);
    },
    a1() {
      return parseInt((this.a + 100).toString()[2]);
    },
    b0() {
      return parseInt((this.b + 100).toString()[1]);
    },
    b1() {
      return parseInt((this.b + 100).toString()[2]);
    },
  },
  methods: {
    calc(row, col) {
      if (row === 0) {
        if (col % 3) {
          return (this.a + 100).toString()[col];
        }
      } else if (row === 1) {
        if (col % 3) {
          return (this.b + 100).toString()[col];
        } else if (col === 0) {
          return 'X';
        }
      } else if (row === 2) {
        const m0 = this.a0 * this.b0;
        const m1 = this.a1 * this.b1;
        if (col === 0) {
          return (m0 + 100).toString()[1];
        } else if (col === 1) {
          return (m0 + 100).toString()[2];
        } else if (col === 2) {
          return (m1 + 100).toString()[1];
        } else {
          return (m1 + 100).toString()[2];
        }
      } else if (row === 3) {
        if (col % 3) {
          const m0 = this.a0 * this.b1;
          return (m0 + 100).toString()[col];
        }
      } else if (row === 4) {
        if (col % 3) {
          const m0 = this.a1 * this.b0;
          return (m0 + 100).toString()[col];
        } else if (col === 0) {
          return '+';
        }
      } else {
        const m0 = this.a * this.b;
        return (m0 + 10000).toString()[col + 1];
      }
      return '';
    },
  },
};
</script>
<style>
.mul-table {
  width: 100%;
  font-size: 64px;
}

.mul-cell {
  min-width: 160px;
  min-height: 120px;
  text-align: center;
  vertical-align: middle;
  line-height: 120px;
  font-weight: bold;
  border-bottom: 1px dashed #eee;
  border-right: 1px dashed #eee;
}

.mul-cell[col='1'] {
  border-right: 1px solid #aaa !important;
}
.mul-cell[col='3'] {
  border-right: none !important;
}
.mul-cell[row='1'],
.mul-cell[row='4'] {
  border-bottom: 1px solid #aaa !important;
}
.mul-cell[row='5'] {
  border-bottom: none !important;
}
</style>
