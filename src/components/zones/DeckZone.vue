<template>
  <div
    class="deckZone_wrapper"
    position="top-left"
  >
    <div>
      <div class="deck_zone" 
        @mouseenter="isPhone() ? null : setHoveredCard(cards[0])"
        @mouseleave="isPhone() ? null : setHoveredCard(null)"
        :class="side"
      >
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
          v-if="cards.length > 0"
          :class="[{ is_selected: cardIsSelected(cards[0]) }]"
          :style="{
            top: `${deckViews.length * -2}px`,
            left: `${deckViews.length * -2}px`,
            cursor: 'pointer',
          }"
          @click.stop="clickDeck()"
        >
          <OnLongPress
            @trigger="openDeck()"
            @contextmenu.prevent
            :prevent="true"
          >
            <img
              v-if="cards[0].faceDown"
              :src="cardDetail(cards[0]).backImageUrl"
              alt=""
            />
            <TextCard
              v-else
              :card="cards[0]"
              :width="cardWidthNum"
              :selected="cardIsSelected(cards[0])"
            ></TextCard>
            <div
              class="cards-num"
            >
              {{ cards.length }}
            </div>
          </OnLongPress>
        </div>
        <div
          class="deck_topImg"
          v-else
          :style="{
            top: `${deckViews.length * -2}px`,
            left: `${deckViews.length * -2}px`,
            cursor: 'pointer',
            opacity: '0.2',
          }"
        >
          <img
            src="https://cdn.jsdelivr.net/npm/dmdeck-simulator@latest/dist/images/card-back.jpg"
            alt=""
          />
        </div>
        <CardPopup
          v-if="hasSelectedCard()" 
          :url="cards.length > 0 ? cards[0].imageUrl : ''"
          :card="cards.length > 0 ? cards[0] : null"
        >
          <div class="deck_buttons"
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
              @click.stop="setCardState(cards[0], {
                faceDown: !cards[0].faceDown
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
            <o-button
              v-if="selectMode?.zone === zone && !isPhone()"
              style="z-index: 1;"
              variant="grey-dark"
              class="deck_buttons_out_buttom"
              size="small"
              @click.stop="openDeck()"
              >山札を見る</o-button
            >
            <!-- メクレイド -->
            <o-button
              v-if="selectMode?.zone === 'battleCards' && cardData(selectMode.card).hasMekuraidAbility()"
              style="z-index: 1;"
              variant="grey-dark"
              class="deck_buttons_out_buttom"
              size="small"
              @click.stop="mekuraid()"
              >メクレイド</o-button
            >
          </div>
        </CardPopup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OnLongPress } from '@vueuse/components'
import CardPopup from '../elements/CardPopup.vue'
import { computed } from 'vue'
import { Card } from "@@/core/entities/card";
import { ZoneType } from "@@/core/entities/zones";
import { useZone, zoneEmit } from "./zone";
import { defineExpose } from 'vue';
import type { PlayerType, SideType } from "@@/core/entities/player";
import { isPhone } from '@/helpers/Util';
import TextCard from "../elements/TextCard.vue";
import { cardData } from '@@/core/entities/CardData';

const cardWidthNum = 50
const cardWidth = `${cardWidthNum}px`

const props = withDefaults(defineProps<{
  player: PlayerType
  cards: Card[]
  side: SideType
  zone?: ZoneType
}>(), {
  zone: 'yamafudaZone',
})

const emit = defineEmits<zoneEmit>()

const {
  workSpace,
  openWorkSpace,
  cardIsSelected,
  selectMode,
  setCardState,
  setSelectMode,
  hasSelectedCard,
  setHoveredCard,
  moveSelectedCard,
  cardDetail,
} = useZone(props, emit)

const drawOne = () => {
  emit('move-cards', props.zone, 'tefudaZone', [props.cards[0]], props.player)
}
defineExpose({
  drawOne
})

const deckViews = computed(() => {
  // 1~nまでの数字を順に要素とする配列を返す。
  // デッキの下に重なっているカード要素の数を
  // deckViewsLengthとする。
  const l = props.cards.length;
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
  setSelectMode(null)
  openWorkSpace({
    zone: props.zone,
    cards: props.cards,
    player: props.player,
  });
}
function mekuraid() {
  setSelectMode(null)
  const cards = props.cards.slice(0, 3)
  cards.forEach(c => c.showInWorkSpace = true)
  openWorkSpace({
    zone: props.zone,
    cards,
    player: props.player,
  });
}
function clickDeck() {
  if (workSpace.value.active) {
    return
  }
  setSelectMode({
    zone: props.zone,
    card: props.cards[0],
    player: props.player,
    selectingTarget: true,
  })
}
</script>

<style lang="scss">
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
    .deck_buttons_out_buttom {
      position: absolute;
      bottom: -70%;
    }
  }
  .cards-num {
    z-index: 10;
    color: #fff;
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 10px;
  }
}
.deckZone_wrapper {
  .o-drop__menu {
    bottom: 30px;
  }
}
</style>
