<template>
  <div class="bochi" :class="side" @click.stop="clickBochi()">
    <div
      v-if="selectMode && selectMode.player === player"
      class="bochi_text"
    >
      墓地へ
    </div>
    <TextCard
      v-else-if="lastCard()"
      :card="(lastCard() as Card)"
      :width="50"
      :selected="false"
      @mouseenter="isPhone() ? null : setHoveredCard(lastCard())"
      @mouseleave="isPhone() ? null : setHoveredCard(null)"
    ></TextCard>
  </div>
</template>

<script setup lang="ts">
import type { player, side, zone } from "@/entities";
import { Card } from "@/entities/Card";
import { useZone, zoneEmit } from "./zone";
import TextCard from "../elements/TextCard.vue";
import { isPhone } from "@/helpers/Util"

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
  @media screen and (max-width: 800px) {
      width: 50px;
      img {
        border-top: 1px solid purple;
        border-bottom: 1px solid purple;
        border-left: 2px solid purple;
        border-right: 2px solid purple;
      }
  }
  &.upper {
    img {
      transform: rotate(180deg);
    }
  }
}
</style>
