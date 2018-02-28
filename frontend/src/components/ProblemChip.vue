<template>
  <span class="progress">
    <span class="value"
      :class="{'yellow': score < 100, 'green': score === 100}"
      :style="{width: score + '%'}">
      <a class="progress-bar-text"
        :href="'https://training.olinfo.it/#/task/' + name"
        target="_blank">
        {{ name }}
      </a>
    </span>
  </span>
</template>

<script>
export default {
  name: "ProblemChip",
  props: {
    score: Number,
    name: String,
    title: String
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.progress {
  text-align: left;
  display: inline-block;
  height: 20px;
  width: 125px;
  background-color: #f5f5f5;
  background-image: linear-gradient(to bottom, #ebebeb 0, #f5f5f5 100%);
  background-repeat: repeat-x;
  position: relative;
  border-radius: 2.5px;
}

.value {
  background-color: #7cc4ff;
  display: inline-block;
  height: 100%;
  border-radius: 2.5px;
}
.value a {
  cursor: pointer;
  text-decoration: none;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.value.green {
  background-color: #449d44;
  background-image: linear-gradient(to bottom, #5cb85c 0, #449d44 100%);
  background-repeat: repeat-x;
}
.value.yellow {
  background-color: #ec971f;
  background-image: linear-gradient(to bottom, #f0ad4e 0, #ec971f 100%);
  background-repeat: repeat-x;
}
</style>
