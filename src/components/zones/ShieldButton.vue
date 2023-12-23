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
import type { player, side, zone, zoneGroup } from "@/entities";
import RoundButton from '../elements/RoundButton.vue'
import { Card } from "@/entities/Card";
import { useZone, zoneEmit } from "./zone";
import { useCardGroups } from './cardGroups';

const props = withDefaults(defineProps<{
  player: player
  cards: Card[]
  side: side
  zone?: zone
  zoneGroup?: zoneGroup
}>(), {
  zone: 'shieldCards',
  zoneGroup: 'shieldCardGroups',
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
    selectMode.value.card.faceDown = true;
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
