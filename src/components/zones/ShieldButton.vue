<template>
  <RoundButton :style="{background: 'blue', color: 'beige'}" @click.stop="clickShieldButton">
    <div v-if="hasSelectedCard()" :style="{fontSize: '10px'}">
      シールドへ
    </div>
    <template v-else>
      <div :style="{fontSize: '10px'}">シールド</div>
      <div :style="{fontSize: '16px'}">
        {{ visibleCards.length }}
      </div>
    </template>
  </RoundButton>
</template>

<script setup lang="ts">
import type { PlayerType, SideType } from "@@/core/entities/player";
import RoundButton from '../elements/RoundButton.vue'
import { Card } from "@@/core/entities/card";
import { ZoneType } from "@@/core/entities/zones";
import { useZone, zoneEmit } from "./zone";
import { useCardGroups } from './cardGroups';

const props = withDefaults(defineProps<{
  player: PlayerType
  cards: Card[]
  side: SideType
  zone?: ZoneType
}>(), {
  zone: 'shieldZone',
})

const emit = defineEmits<zoneEmit>()

const {
  openWorkSpace,
  selectMode,
  hasSelectedCard,
  moveSelectedCard,
} = useZone(props, emit)

const {
  visibleCards,
} = useCardGroups(props)

function clickShieldButton() {
  if (hasSelectedCard() && selectMode.value) {
    moveSelectedCard(props.zone);
    return;
  }
  openWorkSpace({
    zone: props.zone,
    cards: props.cards,
    player: props.player,
  });
}
</script>
