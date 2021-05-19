<template>
  <div class="colorfull-number">
    <span v-for="(v, i) in text" :key="i" class="num-it" :nv="v">{{ v }}</span>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
    },
  },
  computed: {
    text() {
      return (this.value || '').toString();
    },
  },
};
</script>

<style>
.colorfull-number {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
}
.num-it {
  padding: 0 2px;
}
.num-it[nv='0'] {
  color: red;
}
.num-it[nv='1'] {
  color: forestgreen;
}
.num-it[nv='2'] {
  color: sandybrown;
}
.num-it[nv='3'] {
  color: coral;
}
.num-it[nv='4'] {
  color: chocolate;
}
.num-it[nv='5'] {
  color: brown;
}
.num-it[nv='6'] {
  color: purple;
}
.num-it[nv='7'] {
  color: blueviolet;
}
.num-it[nv='8'] {
  color: royalblue;
}
.num-it[nv='9'] {
  color: blue;
}
</style>
