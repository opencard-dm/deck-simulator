<template>
  <div
    class="chojigenZone"
    :class="[{ chojigenZone_hidden: !hasChojigen }, side]"
    @click.stop="clickChojigenZone"
  >
    <div
      v-if="selectMode && selectMode.player === player"
      class="chojigenZone_text"
    >
      超次元<br />ゾーンへ
    </div>
    <div v-else class="chojigenZone_icon">超<br />次<br />元</div>
  </div>
</template>

<script setup lang="ts">

import type { player, side, zone } from "@/entities";
import { Card } from "@/entities/Card";
import { zoneEmit, useZone } from "./zone";

const props = withDefaults(defineProps<{
  player: player
  cards: Card[]
  side: side
  hasChojigen: boolean
  zone?: zone
}>(), {
  zone: 'chojigenCards',
})
const emit = defineEmits<zoneEmit>()
const {
  openWorkSpace,
  selectMode,
  moveSelectedCard,
} = useZone(props, emit)
function clickChojigenZone() {
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
.chojigenZone {
  position: relative;
  text-align: center;
  margin-left: 8px;
  width: 50px;
  height: cardHeight(50px);
  background-color: #f4c300;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  &.upper {
    margin-left: 0;
    margin-right: 8px;
  }
  &_hidden {
    opacity: 0;
  }
  &_text {
    flex-shrink: 0;
    font-size: 12px;
    width: 100%;
    color: rgb(121, 121, 121);
    text-align: center;
  }
  &_icon {
    flex-shrink: 0;
    font-size: 14px;
    width: 100%;
    color: rgb(121, 121, 121);
    text-align: center;
  }
}
</style>
