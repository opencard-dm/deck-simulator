<template>
  <div id="canvas"
    v-if="isMounted">
    <div
      class="imageDisplay"
      :class="{ hidden: display.hidden, blur: display.blur }"
      :style="[display.left ? { left: '5px' } : { left: '820px' }]"
    >
      <div
        v-if="Features.using_image && cardIsVisible"
        class="imageDisplay_image"
        :style="{ width: `${style.width}px` }"
      >
        <img
          v-if="hoveredCard.faceDown && !hoveredCard.showInWorkSpace"
          :src="cardDetail.backImageUrl"
        />
        <img v-else :src="hoveredCard.imageUrl" />
      </div>
      <div v-if="cardIsVisible && cardDetail && cardDetail.card_text">
        <TextCard
          :card="hoveredCard"
          :selected="false"
          :large="true"
          @click="closePopup()"
        ></TextCard>
      </div>

    </div>
    <!-- スマホでカードをプッシュしたときに表示される画像 -->
    <div v-if="isPhone() && hoveredCard" class="phoneImageDisplay" @contextmenu.prevent>
      <TextCard
        :card="hoveredCard"
        :selected="false"
        :large="true"
        @click="closePopup()"
      ></TextCard>
    </div>
    <!-- slot -->
    <slot></slot>
  </div>
  <!-- <div class="tool-footer" v-if="!isPhone()">
    <div>
      <label>
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
      <label>
        <input
          type="checkbox"
          :checked="explanation.show"
          @change="explanation.show = $event.target.checked"
        />説明表示
      </label>
    </div>
    <div id="explanation" v-if="explanation.show">
      <p></p>
    </div>
  </div> -->
</template>

<script setup lang="ts">
import { CardDetail } from '@/entities/Deck';
import { isPhone } from '@/helpers/Util';
import { onMounted, ref } from 'vue';
import { Features } from '@/features';
import TextCard from './elements/TextCard.vue';

const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
</script>

<script lang="ts">
import { mapMutations, mapState } from "vuex/dist/vuex.cjs";

export default {
  data() {
    return {
      display: {
        left: false,
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
    cardDetail() {
      if (!this.hoveredCard) return {}
      if (this.hoveredCard.mainCardId) {
        return this.getCardDetail(this.hoveredCard.mainCardId)
      }
      if (this.hoveredCard.cd) {
        return this.getCardDetail(this.hoveredCard.cd)
      }
    },
    cardIsVisible() {
      if (this.hoveredCard) {
        if (!this.hoveredCard.faceDown || this.hoveredCard.showInWorkSpace) {
          return true;
        }
        if (
          this.hoveredCard.faceDown &&
          this.cardDetail &&
          !this.cardDetail.backImageUrl.includes("/card-back.jpg")
        ) {
          return true;
        }
      }
      return false;
    },
    cardText() {
      /** @type {String} */
      const text = this.cardDetail.card_text;
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
    closePopup() {
      this.$store.commit('setHoveredCard', null)
    },
    getCardDetail(cardId: string) {
      let cardDetail = {} as CardDetail
      try {
        cardDetail = this.$store.state.cardDetails[cardId]
      } catch (error) {
        console.error('card not found:', cardId)
        cardDetail = {} as CardDetail
      }
      if (!cardDetail.backImageUrl) {
        cardDetail.backImageUrl = 'https://cdn.jsdelivr.net/npm/dmdeck-simulator@latest/dist/images/card-back.jpg'
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
  > * {
    width: 90vw;
    max-width: 400px;
  }
}
</style>
