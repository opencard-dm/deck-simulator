<template>
  <div class="manaZone_wrapper">
    <div class="manaZone" :class="side">
      <RoundButton :style="{color: 'beige', background: 'green'}" @click.stop="clickManaButton">
        <template v-if="hasSelectedCard()">
          <template v-if="selectMode?.zone !== zone">
            <p :style="{fontSize: '12px'}">チャージ</p>
          </template>
          <template v-else-if="selectMode.card.tapped">
            <p :style="{fontSize: '10px'}">全て</p>
            <p :style="{fontSize: '12px'}">アンタップ</p>
          </template>
        </template>
        <template v-else>
          <p :style="{fontSize: '10px'}">マナ</p>
          <p>{{ countNormal }}/{{ cards.length }}</p>
        </template>
      </RoundButton>
      <div class="manaZone_cont" :class="side">
        <div class="manaZone_cardList manaZone_cardList__tapped">
          <div
            class="card_wrapper"
            v-for="(card, index) in tappedCards"
            :key="index"
            @mouseenter="isPhone() ? null : setHoveredCard(card)"
            @mouseleave="isPhone() ? null : setHoveredCard(null)"
          >
            <div
              class="card"
              :class="{ 'is-selected': cardIsSelected(card) }"
              @click.stop="clickCard(card)"
            >
              <img v-if="card.faceDown" :src="cardDetail(card).backImageUrl" />
              <TextCard
                v-else
                :card="card"
                :width="50"
                :selected="cardIsSelected(card)"
              ></TextCard>
            </div>
            <div v-if="cardIsSelected(card)" class="card_bottomButton">
              <o-button
                variant="grey-dark"
                @click.stop="toggleTap(card)"
                size="small"
                >アンタップ</o-button
              >
            </div>
          </div>
        </div>
        <div class="manaZone_cardList normal">
          <div
            class="card_wrapper"
            v-for="(card, index) in normalCards"
            :key="index"
            @mouseenter="isPhone() ? null : setHoveredCard(card)"
            @mouseleave="isPhone() ? null : setHoveredCard(null)"
          >
            <div
              class="card"
              :class="{ 'is-selected': cardIsSelected(card) }"
              @click.stop="clickCard(card)"
            >
              <img v-if="card.faceDown" :src="cardDetail(card).backImageUrl" />
              <TextCard
                v-else
                :card="card"
                :width="50"
                :selected="cardIsSelected(card)"
              ></TextCard>
            </div>
            <div v-if="cardIsSelected(card)" class="card_bottomButton">
              <o-button
                variant="grey-dark"
                @click.stop="toggleTap(card)"
                size="small"
                >タップ</o-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RoundButton from '../elements/RoundButton.vue'
import { computed } from 'vue'
import type { PlayerType, SideType } from "@@/core/entities/player";
import { Card } from "@@/core/entities/card";
import { ZoneType } from "@@/core/entities/zones";
import { useZone, zoneEmit } from "./zone";
import TextCard from "../elements/TextCard.vue";
import { isPhone } from '@/helpers/Util';

const props = withDefaults(defineProps<{
  player: PlayerType
  cards: Card[]
  side: SideType
  zone?: ZoneType
}>(), {
  zone: 'manaZone',
})
const emit = defineEmits<zoneEmit>()

const {
  openWorkSpace,
  setHoveredCard,
  cardIsSelected,
  selectMode,
  toggleTap,
  setSelectMode,
  hasSelectedCard,
  moveSelectedCard,
  emitState,
  cardDetail,
} = useZone(props, emit)

const normalCards = computed(() => {
  return props.cards.filter((card) => {
    return card.tapped !== true;
  });
})
const tappedCards = computed(() => {
  return props.cards.filter((card) => {
    return card.tapped === true;
  });
})
const countNormal = computed(() => {
  return normalCards.value.length;
})
function clickManaButton() {
  if (hasSelectedCard()) {
    if (selectMode.value?.zone !== props.zone) {
      moveSelectedCard(props.zone);
      return;
    }
    if (selectMode.value.card.tapped) {
      props.cards.forEach((c) => {
        c.tapped = false;
      });
      setSelectMode(null);
      emitState();
      return;
    }
  }
  openWorkSpace({
    zone: props.zone,
    cards: props.cards,
    player: props.player,
  });
}

function clickCard(card: Card) {
  if (cardIsSelected(card)) {
    // 選択中のカードと同じカードがクリックされた場合、
    // セレクトモードを終了。
    setSelectMode(null);
    return;
  }
  setSelectMode({
    card,
    zone: props.zone,
    player: props.player,
  });
  return;
}
</script>

<style lang="scss">
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
$card-width: 50px;
$card-margin: -35px;

.manaZone {
  display: flex;
  margin-left: 20px;
  @media screen and (max-width: 800px) {
    margin-left: 5px;
  }
  align-items: center;
  &.upper {
    padding-top: 20px;
    .card_bottomButton {
      transform: rotate(180deg) translateX(50%);
    }
  }
  &.lower {
    margin-top: 20px;
  }
  .card {
    transform: rotate(180deg);
    &_wrapper {
      position: relative;
    }
    &.is-selected {
      img {
        border: 2px solid #b60000;
      }
    }
    &_bottomButton {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 0;
      z-index: 2;
    }
  }
  img {
    width: $card-width;
  }
  .manaZone_cont {
    width: 390px;
    position: relative;
    display: flex;
    @media screen and (max-width: 800px) {
      margin-right: 5px;
    }
    &.upper {
      transform: rotate(180deg);
      margin-left: 10px;
    }
    > * {
      width: calc(50% + $card-margin);
    }
    > *:first-child {
      margin-left: calc((-1) * $card-margin);
    }
    > *:last-child {
      margin-left: auto;
    }
  }
  &_cardList {
    height: 100%;
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: wrap;
    &__tapped {
      opacity: 0.6;
    }
    > * {
      margin-left: calc($card-margin);
    }
  }
}
</style>
