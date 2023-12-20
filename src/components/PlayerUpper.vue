<template>
  <TefudaZone
    :side="side"
    :player="player"
    :tefudaCards="cards.tefudaCards"
    @move-cards="moveCards"
  ></TefudaZone>
  <ManaZone
    :side="side"
    :player="player"
    :manaCards="cards.manaCards"
    @move-cards="moveCards"
  ></ManaZone>
  <PlayerZone
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
        :player="player"
        :yamafudaCards="cards.yamafudaCards"
        @move-cards="moveCards"
        @group-card="groupCard"
      ></DeckZone>
    </template>
    <template #chojigenZone>
      <ChojigenZone
        :side="side"
        :player="player"
        :chojigenCards="cards.chojigenCards"
        :hasChojigen="hasChojigen"
        @move-cards="moveCards"
      ></ChojigenZone>
    </template>
  </PlayerZone>
  <BattleZone
    :side="side"
    :player="player"
    :battleCards="cards.battleCards"
    :battleCardGroups="cards.battleCardGroups"
    @move-cards="moveCards"
    @group-card="groupCard"
    @emit-room-state="emitRoomState"
  ></BattleZone>
</template>

<script setup>
import TefudaZone from './zones/TefudaZone.vue';
import ManaZone from './zones/ManaZone.vue';
import PlayerZone from './zones/PlayerZone.vue';
import BattleZone from './zones/BattleZone.vue';
import ShieldZone from './zones/ShieldZone.vue';
import DeckZone from './zones/DeckZone.vue';
import ChojigenZone from './zones/ChojigenZone.vue';

const props = defineProps({
  player: String,
  cards: {
    manaCards: Array,
    battleCards: Array,
    bochiCards: Array,
    shieldCards: Array,
    tefudaCards: Array,
    yamafudaCards: Array,
    chojigenCards: Array,
    // cardGroups
    battleCardGroups: Array,
    shieldCardGroups: Array,
  },
  name: String,
  roomId: String,
  isReady: Boolean,
  hasChojigen: Boolean,
});

const side = 'upper';

const emit = defineEmits(['move-cards', 'group-card', 'emit-room-state']);

function moveCards(from, to, cards, player, prepend) {
  emit('move-cards', ...arguments);
}
function groupCard(from, to, fromCard, toCard, player) {
  emit('group-card', ...arguments);
}
function emitRoomState() {
  emit('emit-room-state', props.player);
}
</script>
