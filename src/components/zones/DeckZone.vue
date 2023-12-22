<template>
  <div
    class="deckZone_wrapper"
    position="top-left"
  >
    <div>
      <div class="deck_zone" :class="side">
        <div
          class="deck_card"
          v-for="i in deckViews"
          :key="i"
          :style="{ 
            top: `${(i - 1) * -2}px`,
            left: `${(i - 1) * -2}px` 
          }"
        ></div>
        <div
          class="deck_topImg"
          v-if="yamafudaCards.length > 0"
          :class="[{ is_selected: cardIsSelected(yamafudaCards[0]) }]"
          :style="{
            top: `${deckViews.length * -2}px`,
            left: `${deckViews.length * -2}px`,
            cursor: 'pointer',
          }"
          @click.stop="setSelectMode({
            zone: 'yamafudaCards',
            card: yamafudaCards[0],
            player,
            selectingTarget: true,
          })"
        >
          <OnLongPress
            v-if="yamafudaCards[0].faceDown"
            @trigger="openDeck()"
            @contextmenu.prevent
            :prevent="true"
          >
            <img
              :src="yamafudaCards[0].backImageUrl"
              alt=""
            />
          </OnLongPress>
          <CardPopup v-else :url="yamafudaCards[0].imageUrl">
            <img :src="yamafudaCards[0].imageUrl" alt="" />
          </CardPopup>
        </div>
        <div v-if="hasSelectedCard()" class="deck_buttons"
          :style="{
            top: `${deckViews.length * -2}px`,
            left: `${deckViews.length * -2}px`,
            cursor: 'pointer',
            width: cardWidth
          }"
          @contextmenu.prevent
        >
          <o-button
            v-if="selectMode?.zone === zone"
            variant="grey-dark"
            size="small"
            class="deck_buttons_top"
            @click.stop="setCardState(yamafudaCards[0], {
              faceDown: !yamafudaCards[0].faceDown
            })">裏返す</o-button
          >
          <o-button
            v-else
            variant="grey-dark"
            size="small"
            @click.stop="moveSelectedCard(zone, true)"
            >上へ</o-button
          >
          <o-button
            variant="grey-dark"
            class="deck_buttons_buttom"
            size="small"
            @click.stop="moveSelectedCard(zone, false)"
            >下へ</o-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OnLongPress } from '@vueuse/components'
import CardPopup from '../elements/CardPopup.vue'
import { computed } from 'vue'
import { Card } from "@/entities/Card";
import { useZone, zoneEmit } from "@/helpers/zone";
import { defineExpose } from 'vue';
import type { player, side, zone } from "@/entities";

const cardWidthNum = 50
const cardWidth = `${cardWidthNum}px`

const zone = 'yamafudaCards'
const props = defineProps<{
  player: player
  yamafudaCards: Card[]
  side: side
}>()

const emit = defineEmits<zoneEmit>()

const {
  openWorkSpace,
  cardIsSelected,
  selectMode,
  setCardState,
  setSelectMode,
  hasSelectedCard,
  moveSelectedCard,
} = useZone(props, emit)

const drawOne = () => {
  emit('move-cards', 'yamafudaCards', 'tefudaCards', [props.yamafudaCards[0]], props.player)
}
defineExpose({
  drawOne
})

const deckViews = computed(() => {
  // 1~nまでの数字を順に要素とする配列を返す。
  // デッキの下に重なっているカード要素の数を
  // deckViewsLengthとする。
  const l = props.yamafudaCards.length;
  let deckViewsLength = 0;
  if (l >= 20) {
    deckViewsLength = 4;
  } else if (l >= 15) {
    deckViewsLength = 3;
  } else if (l >= 2) {
    deckViewsLength = 2;
    // } else if (l >= 2) {
    //   deckViewsLength = 1
    // deckViewが一枚だけだと見た目が良くなかったため飛ばして0にする。
  } else {
    deckViewsLength = 0;
  }
  const deckViews = [];
  for (let i = 0; i < deckViewsLength; i++) {
    deckViews.push(i + 1);
  }
  return deckViews;
})
function openDeck() {
  // デッキを開くときはデフォルトで全て裏にする。
  props.yamafudaCards.forEach((c) => {
    c.faceDown = true;
  });
  openWorkSpace({
    zone: "yamafudaCards",
    cards: props.yamafudaCards,
    player: props.player,
  });
}
</script>

<style lang="scss">
@import "@/assets/scss/mixin.scss";
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
$card-width: 50px;
// コンポーネントに移動
.deck_zone {
  &.upper {
    transform: rotate(180deg);
    .deck_buttons {
      transform: rotate(180deg);
    }
  }
  width: $card-width;
  height: cardHeight($card-width);
  display: flex;
  position: relative;
  .deck_topImg {
    position: absolute;
    width: $card-width;
    height: cardHeight($card-width);
    border-radius: 2px;
    &.is_selected {
      img {
        border: 1px solid red;
        border-radius: 5px;
      }
    }
    img {
      border-radius: 2px;
      width: $card-width;
      height: cardHeight($card-width);
    }
  }
  .deck_card {
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: black;
    border: 1px solid white;
    border-radius: 2px;
  }
  .deck_buttons {
    position: relative;
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    .deck_buttons_top {
      position: absolute;
      bottom: 100%;
    }
    .deck_buttons_buttom {
      position: absolute;
      bottom: 0;
    }
  }
}
.deckZone_wrapper {
  .o-drop__menu {
    bottom: 30px;
  }
}
</style>
