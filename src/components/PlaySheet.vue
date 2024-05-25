<template>
  <template v-if="side === 'lower'">
    <BattleZone
      :style="{
        opacity: !started ? 0 : 'unset'
      }"
      :side="side"
      :player="player"
      :cards="game.players[player].battleZone.cards"
      :game-logger="gameLogger"
      :game="game"
      :card-actions="cardActions"
      @move-cards="moveCards"
      @group-card="groupCard"
      @put-under-card="putUnderCard"
      @emit-room-state="emitRoomState"
      @change-cards-state="changeCardsState"
    />
    <!-- NOTE: HTMLの重なり順の関係で下に配置している -->
    <div
      v-if="!started && player === lowerPlayer"
      class="startButtons"
    >
      <o-button
        variant="danger" 
        :disabled="false"
        @click="emit('start-game', player, true)"
      >
        先攻で開始
      </o-button>
      <o-button
        variant="info" 
        :disabled="false"
        @click="emit('start-game', player, false)"
      >
        後攻で開始
      </o-button>
    </div>
  </template>
  <template v-if="side === 'upper'">
    <TefudaZone
      :side="side"
      :player="player"
      :cards="game.players[player].tefudaZone.cards"
      :single="single"
      :game="game"
      :card-actions="cardActions"
      @move-cards="moveCards"
      @change-cards-state="changeCardsState"
      @draw-one="deckZone?.drawOne()"
    />
    <ManaZone
      :side="side"
      :player="player"
      :cards="game.players[player].manaZone.cards"
      @move-cards="moveCards"
    />
  </template>
  <player-zone
    :side="side"
    :player="player"
  >
    <template #shield-button>
      <ShieldButton
        :side="side"
        :player="player"
        :cards="game.players[player].shieldZone.cards"
        @move-cards="moveCards"
      />
    </template>
    <template #shield-zone>
      <ShieldZone
        :side="side"
        :player="player"
        :cards="game.players[player].shieldZone.cards"
        @move-cards="moveCards"
        @group-card="groupCard"
        @change-cards-state="changeCardsState"
      />
    </template>
    <template #deck-zone>
      <DeckZone
        ref="deckZone"
        :side="side"
        :player="player"
        :cards="game.players[player].yamafudaZone.cards"
        @move-cards="moveCards"
        @change-cards-state="changeCardsState"
      />
    </template>
    <template #bochi-zone>
      <BochiZone
        :side="side"
        :player="player"
        :cards="game.players[player].bochiZone.cards"
        @move-cards="moveCards"
      />
    </template>
    <template #chojigenZone>
      <ChojigenZone
        :side="side"
        :player="player"
        :cards="game.players[player].chojigenZone.cards"
        @move-cards="moveCards"
      />
    </template>
  </player-zone>
  <template v-if="side === 'lower'">
    <ManaZone
      :side="side"
      :player="player"
      :cards="game.players[player].manaZone.cards"
      @move-cards="moveCards"
      @change-cards-state="changeCardsState"
    />
    <TefudaZone
      :side="side"
      :player="player"
      :cards="game.players[player].tefudaZone.cards"
      :single="single"
      :game="game"
      :card-actions="cardActions"
      @move-cards="moveCards"
      @change-cards-state="changeCardsState"
      @draw-one="deckZone?.drawOne()"
    />
  </template>
  <template v-if="side === 'upper'">
    <BattleZone
      :side="side"
      :player="player"
      :cards="game.players[player].battleZone.cards"
      :game-logger="gameLogger"
      :game="game"
      :card-actions="cardActions"
      @move-cards="moveCards"
      @group-card="groupCard"
      @change-cards-state="changeCardsState"
      @put-under-card="putUnderCard"
      @emit-room-state="emitRoomState"
    />
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
import { PlayerType, SideType } from "@@/core/entities/player";
import { ref } from 'vue';
import { GameLogger } from '@@/core/usecase/GameLogger';
import { Game } from '@@/core/entities/game';
import { CardActions } from '@@/core/usecase/CardActions';

const deckZone = ref<InstanceType<typeof DeckZone> | null>(null)
const props = defineProps<{
  side: SideType
  player: PlayerType,
  lowerPlayer: PlayerType,
  game: Game,
  name: string,
  single: boolean,
  started: boolean,
  gameLogger: GameLogger,
  cardActions: CardActions,
}>();

type playSheetEmit = zoneEmit & {
  'start-game': [player: PlayerType, first: boolean]
}

const emit = defineEmits<playSheetEmit>();

function moveCards(...args: zoneEmit['move-cards']) {
  emit('move-cards', ...args);
}
function groupCard(...args: zoneEmit['group-card']) {
  emit('group-card', ...args);
}
function changeCardsState(...args: zoneEmit['change-cards-state']) {
  emit('change-cards-state', ...args);
}
function putUnderCard(...args: zoneEmit['put-under-card']) {
  emit('put-under-card', ...args);
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