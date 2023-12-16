<template>
  <div id="canvas"
    v-if="isMounted"
    v-on="!isPhone() ? {mousemove: traceMouseMove} : {}">
    <div
      class="imageDisplay"
      :class="{ hidden: display.hidden, blur: display.blur }"
      :style="[display.left ? { left: '5px' } : { left: '820px' }]"
    >
      <div
        v-if="cardIsVisible"
        class="imageDisplay_image"
        :style="{ width: `${style.width}px` }"
      >
        <img
          v-if="hoveredCard.faceDown && !hoveredCard.showInWorkSpace"
          :src="hoveredCard.backImageUrl"
        />
        <img v-else :src="hoveredCard.imageUrl" />
      </div>
      <div
        class="imageDisplay_cardText"
        v-if="cardIsVisible && hoveredCard.text"
      >
        {{ cardText }}
      </div>
    </div>
    <div v-if="imageUrl" class="phoneImageDisplay">
      <img :src="imageUrl" @click="$store.commit('setDisplayImageUrl', '')">
    </div>
    <!-- slot -->
    <slot></slot>
  </div>
  <div class="tool-footer" v-if="!isPhone()">
    <div>
      <label>
        <!-- v-modelだと値の更新が行われなかった。 -->
        <input
          type="checkbox"
          :checked="!display.hidden"
          @change="display.hidden = !$event.target.checked"
        />ホバーで画像拡大
      </label>
      <label>
        <input
          type="checkbox"
          :checked="display.blur"
          @change="display.blur = $event.target.checked"
        />画像透過
      </label>
      <!-- <label>
        <input
          type="checkbox"
          :checked="explanation.show"
          @change="explanation.show = $event.target.checked"
        />説明表示
      </label> -->
    </div>
    <div id="explanation" v-if="explanation.show">
      <p></p>
    </div>
  </div>
</template>

<script setup>
import { isPhone } from '@/helpers/Util';
import { onMounted, ref } from 'vue';
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
</script>

<script>
import { mapMutations, mapState } from "vuex/dist/vuex.cjs";

export default {
  data() {
    return {
      display: {
        left: true,
        hidden: true,
        blur: false,
        imageUrl: "",
      },
      explanation: {
        show: true,
      },
      style: {
        width: 300,
      },
    };
  },
  computed: {
    ...mapState(["hoveredCard"]),
    imageUrl() {
      return this.$store.state.displayImageUrl
    },
    cardIsVisible() {
      if (this.hoveredCard) {
        if (!this.hoveredCard.faceDown || this.hoveredCard.showInWorkSpace) {
          return true;
        }
        if (
          this.hoveredCard.faceDown &&
          !this.hoveredCard.backImageUrl.includes("/card-back.jpg")
        ) {
          return true;
        }
      }
      return false;
    },
    cardText() {
      /** @type {String} */
      const text = this.hoveredCard.text;
      if (this.hoveredCard && text) {
        if (this.hoveredCard.faceDown) {
          if (this.hoveredCard.backText) {
            return this.hoveredCard.backText;
          }
          if (text.match(/─{3,}龍解後─{3,}/)) {
            return text.split(/─{3,}龍解後─{3,}/)[1];
          }
        } else {
          if (text.match(/─{3,}龍解後─{3,}/)) {
            return text.split(/─{3,}龍解後─{3,}/)[0];
          }
        }
        return text;
      }
      return "";
    },
  },
  methods: {
    ...mapMutations(["setHoveredCard"]),
    traceMouseMove(event) {
      if (this.display.hidden) {
        return;
      }
      const imageSrc = event.target.src;
      if (!imageSrc) {
        this.display.imageUrl = "";
        return;
      }
      // ホストが異なる画像だけ拡大することで、カード画像だけが拡大できるようにする。
      if (!imageSrc.includes("card-back")) {
        this.display.imageUrl = imageSrc;
      } else {
        this.display.imageUrl = "";
      }
      let mX = event.pageX;
      // 右の余白が足りない時だけ左側に表示する。
      if (mX < window.innerWidth - this.style.width + 20) {
        this.display.left = false;
      } else {
        this.display.left = true;
      }
    },
  },
  mounted() {
    if (window.innerWidth > 800) {
      this.display.hidden = false;
    }
  },
};
</script>

<style lang="scss" scoped>
/* display */
.imageDisplay {
  position: fixed;
  top: 2px;
  // left: 10px;
  z-index: 12; // ワークスペースより大きくする
  &.blur {
    opacity: 0.6;
  }
  .imageDisplay_image {
    width: 100%;
    img {
      width: 100%;
    }
  }
  .imageDisplay_cardText {
    border-radius: 8px;
    background-color: #fff;
    padding: 8px;
    font-size: 12px;
    white-space: pre-line;
    width: 360px;
  }
}
.phoneImageDisplay {
  position: fixed;
  top: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
  z-index: 100;
  img {
    width: 90vw;
  }
}
</style>
