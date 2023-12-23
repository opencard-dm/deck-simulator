<template>
  <div class="bochi" @click.stop="clickBochi()">
    <div
      v-if="selectMode && selectMode.player === player"
      class="bochi_text"
    >
      墓地へ
    </div>
    <img
      v-else-if="lastCard()"
      :src="lastCard()?.imageUrl"
      @mouseenter="setHoveredCard(lastCard())"
      @mouseleave="setHoveredCard(null)"
    />
  </div>
</template>

<script setup lang="ts">
import type { player, side, zone } from "@/entities";
import { Card } from "@/entities/Card";
import { useZone, zoneEmit } from "./zone";

const props = withDefaults(defineProps<{
  player: player
  cards: Card[]
  side: side
  zone?: zone
}>(), {
  zone: 'bochiCards',
})

const emit = defineEmits<zoneEmit>()

const {
  openWorkSpace,
  setHoveredCard,
  selectMode,
  moveSelectedCard,
} = useZone(props, emit)

function lastCard() {
  const length = props.cards.length;
  if (length && 0 < length) {
    return props.cards[length - 1];
  }
  return null;
}
function clickBochi() {
  if (!selectMode.value) {
    openWorkSpace({
      zone: props.zone,
      cards: props.cards,
      player: props.player,
    });
    return;
  }
  moveSelectedCard(props.zone);
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/mixin.scss";
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
$card-width: 50px;

.bochi {
  position: relative;
  text-align: center;
  width: 60px;
  height: cardHeight(50px);
  background-color: purple;
  background-size: cover;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: lightgray;
  .bochi_text {
    text-align: center;
  }
  @media screen and (max-device-width: 800px) {
      width: 50px;
      img {
        border-top: 1px solid purple;
        border-bottom: 1px solid purple;
        border-left: 2px solid purple;
        border-right: 2px solid purple;
      }
  }
}
</style>
