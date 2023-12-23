<template>
  <RoundButton :style="{background: 'blue', color: 'beige'}" @click.stop="clickShieldButton">
    <div v-if="hasSelectedCard()" :style="{fontSize: '10px'}">
      シールドへ
    </div>
    <template v-else>
      <div :style="{fontSize: '10px'}">シールド</div>
      <div :style="{fontSize: '16px'}">
        {{ countableShieldCards.length }}
      </div>
    </template>
  </RoundButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { player, side, zone, zoneGroup } from "@/entities";
import RoundButton from '../elements/RoundButton.vue'
import { Card, CardGroup } from "@/entities/Card";
import { useZone, zoneEmit } from "./zone";

const props = withDefaults(defineProps<{
  player: player
  cardGroups: CardGroup[]
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

const countableShieldCards = computed(() => {
  // グループ化されているカードは一つとカウントする。
  const firstCardIds = props.cardGroups.map((g) => g.cardIds[0]);
  return props.cards.filter((c) => {
    return !c.groupId || firstCardIds.includes(c.id);
  });
})

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
