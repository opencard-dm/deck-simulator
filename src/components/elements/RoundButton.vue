<template>
  <div class="roundButton">
    <slot></slot>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>

.roundButton {
  cursor: pointer;
  // background-color: green;
  border-radius: 50%;
  height: 50px;
  width: 50px;
  flex-shrink: 0;
  color: beige;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>