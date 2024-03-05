<template>
  <template v-if="side === 'lower'">
    <BattleZone
      :style="{
        opacity: !started ? 0 : 'unset'
      }"
      :side="side"
      :player="player"
      :cards="cards.battleCards"
      :game-logger="gameLogger"
      @move-cards="moveCards"
      @group-card="groupCard"
      @emit-room-state="emitRoomState"
      @change-cards-state="changeCardsState"
    ></BattleZone>
    <!-- NOTE: HTMLの重なり順の関係で下に配置している -->
    <div v-if="!started" class="startButtons">
      <o-button variant="danger" 
        @click="emit('start-game', player, true)"
        :disabled="false"
        >先攻で開始</o-button
      >
      <o-button variant="info" 
        @click="emit('start-game', player, false)"
        :disabled="false"
        >後攻で開始</o-button
      >
    </div>
  </template>
  <template v-if="side === 'upper'">
    <TefudaZone
      :side="side"
      :player="player"
      :cards="cards.tefudaCards"
      :single="single"
      @move-cards="moveCards"
      @change-cards-state="changeCardsState"
      @drawOne="deckZone?.drawOne()"
    ></TefudaZone>
    <ManaZone
      :side="side"
      :player="player"
      :cards="cards.manaCards"
      @move-cards="moveCards"
    ></ManaZone>
  </template>
  <player-zone
    :side="side"
    :player="player"
  >
    <template #shield-button>
      <ShieldButton
        :side="side"
        :player="player"
        :cards="cards.shieldCards"
        @move-cards="moveCards"
      ></ShieldButton>
    </template>
    <template #shield-zone>
      <ShieldZone
        :side="side"
        :player="player"
        :cards="cards.shieldCards"
        @move-cards="moveCards"
        @group-card="groupCard"
        @change-cards-state="changeCardsState"
      ></ShieldZone>
    </template>
    <template #deck-zone>
      <DeckZone
        :side="side"
        ref="deckZone"
        :player="player"
        :cards="cards.yamafudaCards"
        @move-cards="moveCards"
        @change-cards-state="changeCardsState"
      ></DeckZone>
    </template>
    <template #bochi-zone>
      <BochiZone
        :side="side"
        :player="player"
        :cards="cards.bochiCards"
        @move-cards="moveCards"
      ></BochiZone>
    </template>
    <template #chojigenZone>
      <ChojigenZone
        :side="side"
        :player="player"
        :cards="cards.chojigenCards"
        :hasChojigen="hasChojigen"
        @move-cards="moveCards"
      ></ChojigenZone>
    </template>
  </player-zone>
  <template v-if="side === 'lower'">
    <ManaZone
      :side="side"
      :player="player"
      :cards="cards.manaCards"
      @move-cards="moveCards"
      @change-cards-state="changeCardsState"
    ></ManaZone>
    <TefudaZone
      :side="side"
      :player="player"
      :cards="cards.tefudaCards"
      :single="single"
      @move-cards="moveCards"
      @change-cards-state="changeCardsState"
      @drawOne="deckZone?.drawOne()"
    ></TefudaZone>
  </template>
  <template v-if="side === 'upper'">
    <BattleZone
      :side="side"
      :player="player"
      :cards="cards.battleCards"
      :game-logger="gameLogger"
      @move-cards="moveCards"
      @group-card="groupCard"
      @change-cards-state="changeCardsState"
      @emit-room-state="emitRoomState"
    ></BattleZone>
  </template>
</template>

<script setup lang="ts">
import TefudaZone from './zones/TefudaZone.vue';
import ManaZone from './zones/ManaZone.vue';
import PlayerZone from './zones/PlayerZone.vue';
import BattleZone from './zones/BattleZone.vue';
import ShieldButton from './zones/ShieldButton.vue';
import ShieldZone from './zones/ShieldZone.vue';
import DeckZone from './zones/DeckZone.vue';
import ChojigenZone from './zones/ChojigenZone.vue';
import BochiZone from './zones/BochiZone.vue';
import { zoneEmit } from './zones/zone';
import type { player, side } from '@/entities';
import { Card } from '@/entities/Card';
import { ref } from 'vue';
import { GameLogger } from '@/helpers/GameLogger';

const deckZone = ref<InstanceType<typeof DeckZone> | null>(null)
const props = defineProps<{
  side: side
  player: player,
  cards: {
    manaCards: Card[],
    battleCards: Card[],
    bochiCards: Card[],
    shieldCards: Card[],
    tefudaCards: Card[],
    yamafudaCards: Card[],
    chojigenCards: Card[],
  },
  name: string,
  roomId: string,
  isReady: boolean,
  hasChojigen: boolean,
  single: boolean,
  started: boolean,
  gameLogger: GameLogger,
}>();

type playSheetEmit = zoneEmit & {
  'start-game': [player: player, first: boolean]
}

const emit = defineEmits<playSheetEmit>();

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

<style lang="scss" scoped>
.startButtons {
  display: flex;
  position: absolute;
  left: 150px;
  top: 100px;
  column-gap: 30px;
  @media screen and (max-width: 800px) {
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>