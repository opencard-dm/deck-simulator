<template>
  <div class="gameBoard_topButtons">
    <div
      v-if="players[player].isReady"
      class="turnButtons"
      :class="{
        right: isPhone() && player === upperPlayer
      }"
      style="">
      <o-button
        variant="grey-dark"
        size="small"
        :disabled="gameLogger.totalTurns === 0"
        @click="emit('start-turn', player)"
      >{{ players[player].turn.current + 1 }}ターン目を開始</o-button>
      <o-button
        class="turnButtons_currentTurn"
        :class="{
          startTurn: gameLogger.currentHistory?.method === 'startTurn'
            && gameLogger.currentHistory?.player === player
        }"
        style="margin-left: 8px;"
        variant="grey-dark"
        size="small"
        @click="emit('open-logs')"
      >
        <span>{{ player === gameLogger.firstPlayer ? '先' : '後' }}</span>
      {{ players[player].turn.current }} / {{ players[player].turn.total }}</o-button>
    </div>
    <div v-if="!isPhone() && !players[player].isReady"
      style="float: right;">
      <o-button
        variant="grey-dark"
        size="small"
        @click="emit('select-deck', player)"
      >相手のデッキを選択する</o-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { player as playerType } from '@/entities';
import { GameLogger } from '@@/core/usecase/GameLogger';
import { isPhone } from '@/helpers/Util';
import { initialData } from '@/helpers/room';

const props = defineProps<{
  player: playerType
  upperPlayer: playerType
  players: ReturnType<typeof initialData>['players']
  gameLogger: GameLogger
}>()

const emit = defineEmits<{
  'start-turn': [player],
  'select-deck': [player],
  'open-logs': [],
}>()

</script>

<style lang="scss" scoped>
.gameBoard_topButtons {
  display: flex;
  justify-content: space-between;
}
.turnButtons.right {
  margin-left: auto;
}
.turnButtons_currentTurn {
  background-color: #4a4a4a;
  transition: all 0.5s ease;
}
.turnButtons_currentTurn.startTurn {
  background-color: #b60000 !important;
}
</style>
