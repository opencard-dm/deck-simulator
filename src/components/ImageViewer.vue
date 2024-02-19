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
          v-if="hoveredCard?.faceDown && !hoveredCard.showInWorkSpace"
          :src="cardDetail?.backImageUrl"
        />
        <img v-else :src="cardDetail?.imageUrl" />
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
</template>

<script setup lang="ts">
import { CardDetail } from '@/entities/Deck';
import { isPhone } from '@/helpers/Util';
import { computed, onMounted, reactive, ref } from 'vue';
import { Features } from '@/features';
import TextCard from './elements/TextCard.vue';

const isMounted = ref(false);
const roomStore = useRoomStore()

// ref
const display = reactive({
  left: false,
  hidden: true,
  blur: false,
  imageUrl: "",
})
const explanation = reactive({
  show: true,
})
const style = reactive({
  width: 300,
})

// computed
const hoveredCard = computed(() => roomStore.hoveredCard)
const cardDetail = computed<CardDetail|null>(() => {
  if (!roomStore.hoveredCard) return null
  if (roomStore.hoveredCard.cd) {
    return getCardDetail(roomStore.hoveredCard.cd)
  }
  return null
})
const cardIsVisible = computed(() => {
  if (roomStore.hoveredCard) {
    if (!roomStore.hoveredCard.faceDown || roomStore.hoveredCard.showInWorkSpace) {
      return true;
    }
    if (
      roomStore.hoveredCard.faceDown &&
      cardDetail.value &&
      !cardDetail.value.backImageUrl.includes("/card-back.jpg")
    ) {
      return true;
    }
  }
  return false;
})

onMounted(() => {
  if (window.innerWidth > 800) {
    display.hidden = false;
  }
  isMounted.value = true;
});

function closePopup() {
  roomStore.setHoveredCard(null)
}

function getCardDetail(cardId: string) {
  let cardDetail = {} as CardDetail
  try {
    cardDetail = roomStore.cardDetails[cardId]
  } catch (error) {
    console.error('card not found:', cardId)
    cardDetail = {} as CardDetail
  }
  if (!cardDetail.backImageUrl) {
    cardDetail.backImageUrl = 'https://cdn.jsdelivr.net/npm/dmdeck-simulator@latest/dist/images/card-back.jpg'
  }
  return cardDetail
}
</script>

<script lang="ts">
import { useRoomStore } from '@/stores';
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
