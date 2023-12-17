<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  computed: {
    deviseWidth() {
      return window.screen.width;
    },
  },
  mounted() {
    window.app = this;
  },
};
</script>

<style lang="scss" scoped>
.alertBottom {
  width: 100%;
  position: fixed;
  bottom: 0;
  margin-bottom: 0;
}
</style>
