<template>
  <div
    class="chojigenZone"
    :class="[side]"
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

import type { PlayerType, SideType } from "@@/core/entities/player";
import { Card } from "@@/core/entities/card";
import { ZoneType } from "@@/core/entities/zones";
import { zoneEmit, useZone } from "./zone";

const props = withDefaults(defineProps<{
  player: PlayerType
  cards: Card[]
  side: SideType
  zone?: ZoneType
}>(), {
  zone: 'chojigenZone',
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
