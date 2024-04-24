<template>
  <div class="markTool" :class="{ 'is-active': active && editorOpen }">
    <slot></slot>
    <div
      class="markTool_mark"
      ref="mark"
      :style="[{ backgroundColor: color ? color : 'transparent' }, markStyle]"
    ></div>
    <o-icon
      v-if="showEditIcon"
      class="markTool_editIcon"
      pack="fas"
      icon="pen"
      variant="dark-gray"
      @click.stop="editorOpen = !editorOpen"
    ></o-icon>
    <div v-if="editorOpen" class="markTool_colorPicker">
      <div class="red" @click.stop="selectColor($event)"></div>
      <div class="green" @click.stop="selectColor($event)"></div>
      <div class="blue" @click.stop="selectColor($event)"></div>
      <div class="yellow" @click.stop="selectColor($event)"></div>
      <div class="purple" @click.stop="selectColor($event)"></div>
      <div class="empty" @click.stop="selectColor($event)"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    tapped: {
      type: Boolean,
      default: false,
    },
    reverse: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      showEditIcon: false,
      editorOpen: false,
    };
  },
  computed: {
    markStyle() {
      if (this.reverse) {
        if (this.tapped) {
          return {
            top: '30%',
            left: "2px",
          };
        }
        return {
          bottom: "2px",
          left: "2px",
        };
      } else {
        if (this.tapped) {
          return {
            top: '30%',
            left: "2px",
          };
        }
        return {
          top: "2px",
          right: "2px",
        };
      }
    },
  },
  watch: {
    active(newVal) {
      if (newVal) {
        this.showEditIcon = true;
      } else {
        this.editorOpen = false;
        this.showEditIcon = false;
      }
    },
  },
  methods: {
    selectColor(event) {
      /** @type HTMLObjectElement */
      const target = event.target;
      const color = window.getComputedStyle(target).backgroundColor;
      this.editorOpen = false;
      this.$emit("change", color);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables.scss";
.markTool {
  height: fit-content;
  position: relative;
  &.is-active {
    // エディタの幅
    min-width: 100px;
  }
  .markTool_editIcon {
    background-color: #fff;
    padding: 4px;
    border-radius: 50%;
    cursor: pointer;
    position: absolute;
    top: -5px;
    right: 0px;
  }
  .markTool_mark {
    position: absolute;
    // top: 2px;
    // right: 2px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
  }
  .markTool_colorPicker {
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    top: -5px;
    right: 0px;
    padding: 10px;
    // カードのボタンよりも上にくるようにする
    z-index: 1;

    display: grid;
    grid-template-columns: repeat(3, 20px);
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    > * {
      cursor: pointer;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: red;
    }
    .red {
      background-color: $danger;
    }
    .green {
      background-color: $color-mana;
    }
    .blue {
      background-color: $info;
    }
    .yellow {
      background-color: $warning;
    }
    .purple {
      background-color: $color-tomb;
    }
    .gray {
      background-color: $grey-dark;
    }
    .empty {
      border: 1px dashed $grey-dark;
      background-color: transparent;
    }
  }
}
</style>
