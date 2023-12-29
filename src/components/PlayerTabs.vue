<template>
  <div>
    <div
      v-if="isPhone()"
      class="circleTab"
      :class="{
        circleTab_left: tab === 2,
        circleTab_right: tab === 1,
      }"
      @click="$emit('switch-tab')"
    ></div>
    <div class="app-wrapper main" :class="{
      active: tab === 1,
      playerTab: true,
      tab1: true,
    }">
      <slot name="lower-player"></slot>
    </div>
    <div class="app-wrapper main" :class="{
      active: tab === 2,
      playerTab: true,
      tab1: true,
    }">
      <slot name="upper-player"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isPhone } from '@/helpers/Util';

const props = defineProps<{
  tab: number,
}>()
const emit = defineEmits<{
  'switch-tab': [],
}>()
</script>

<style lang="scss" scoped>
.circleTab {
  width: 50px;
  height: 50px;
  border: 2px solid whitesmoke;
  background: #005c98;
  position: absolute;
  @media screen and (max-device-width: 800px) {
    position: fixed;
  }
  top: 50px;
  z-index: 1;
  border-radius: 50%;
  transition: transform ease-in 0.3s;
}
.circleTab_left {
  left: 0px;
  transform: translateX(-50%);
}
.circleTab_right {
  right: 0px;
  transform: translateX(50%);
}
.app-wrapper {
  @media screen and (max-device-width: 800px) {
    display: none;
    opacity: 0;
    transition: all 1s;
    &.active {
      display: initial;
      opacity: 1;
    }
  }
}
</style>
