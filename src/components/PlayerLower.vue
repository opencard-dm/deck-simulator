<template>
  <BattleZone
    :side="side"
    :player="player"
    :battleCards="cards.battleCards"
    :battleCardGroups="cards.battleCardGroups"
    @move-cards="moveCards"
    @group-card="groupCard"
    @emit-room-state="emitRoomState"
    @change-cards-state="changeCardsState"
  ></BattleZone>

  <player-zone
    :side="side"
    :player="player"
    :bochiCards="cards.bochiCards"
    :yamafudaCards="cards.yamafudaCards"
    :shieldCards="cards.shieldCards"
    :shieldCardGroups="cards.shieldCardGroups"
    @move-cards="moveCards"
  >
    <template #shield-zone>
      <ShieldZone
        :side="side"
        :player="player"
        :shieldCards="cards.shieldCards"
        :shieldCardGroups="cards.shieldCardGroups"
        @move-cards="moveCards"
        @group-card="groupCard"
      ></ShieldZone>
    </template>
    <template #deck-zone>
      <DeckZone
        :side="side"
        ref="lowerDeckZone"
        :player="player"
        :yamafudaCards="cards.yamafudaCards"
        @move-cards="moveCards"
        @group-card="groupCard"
      ></DeckZone>
    </template>
    <template #chojigenZone>
      <ChojigenZone
        :side="side"
        v-if="cards.chojigenCards.length > 0"
        :player="player"
        :chojigenCards="cards.chojigenCards"
        :hasChojigen="hasChojigen"
        @move-cards="moveCards"
      ></ChojigenZone>
    </template>
  </player-zone>
  <mana-zone
    :side="side"
    :player="player"
    :manaCards="cards.manaCards"
    @move-cards="moveCards"
  ></mana-zone>
  <tefuda-zone
    :side="side"
    :player="player"
    :tefudaCards="cards.tefudaCards"
    @move-cards="moveCards"
    @drawOne="lowerDeckZone?.drawOne()"
  ></tefuda-zone>
</template>

<script setup lang="ts">
import TefudaZone from './zones/TefudaZone.vue';
import ManaZone from './zones/ManaZone.vue';
import PlayerZone from './zones/PlayerZone.vue';
import BattleZone from './zones/BattleZone.vue';
import ShieldZone from './zones/ShieldZone.vue';
import DeckZone from './zones/DeckZone.vue';
import ChojigenZone from './zones/ChojigenZone.vue';
import { zoneEmit } from './zones/zone';
import type { player } from '@/entities';
import { Card, CardGroup } from '@/entities/Card';
import { ref } from 'vue';

const lowerDeckZone = ref<InstanceType<typeof DeckZone> | null>(null)
const props = defineProps<{
  player: player,
  cards: {
    manaCards: Card[],
    battleCards: Card[],
    bochiCards: Card[],
    shieldCards: Card[],
    tefudaCards: Card[],
    yamafudaCards: Card[],
    chojigenCards: Card[],
    // cardGroups
    battleCardGroups: CardGroup[],
    shieldCardGroups: CardGroup[],
  },
  name: string,
  roomId: string,
  isReady: boolean,
  hasChojigen: boolean,
}>();

const side = 'lower';

const emit = defineEmits<zoneEmit>();

function moveCards(...args: any[]) {
  // @ts-ignore
  emit('move-cards', ...args);
}
function groupCard(...args: any[]) {
  // @ts-ignore
  emit('group-card', ...args);
}
function changeCardsState(...args: any[]) {
  // @ts-ignore
  emit('change-cards-state', ...args);
}
function emitRoomState() {
  emit('emit-room-state', props.player);
}
</script>
