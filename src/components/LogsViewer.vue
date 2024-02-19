<template>
  <table class="table" style="margin-top: 20px">
    <thead>
      <th><div style="font-weight: bold">処理</div></th>
      <th><div></div></th>
    </thead>
    <tbody>
      <tr v-for="history in afterStartHistories" :key="history.id">
        <td :style="{
          backgroundColor: history.method === gameLogger.startTurn.name ?
            'yellow' : ''
        }">
          <div style="text-align: left;">{{ gameLogger.readableHistory(history, cardDetails) }}</div>
        </td>
        <td style="text-align: center;">
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { state } from '@/store'
import { GameLogger } from '@/helpers/GameLogger';
import { useRoomStore } from '@/stores/room';

const roomStore = useRoomStore()
const cardDetails = computed<state["cardDetails"]>(() => roomStore.cardDetails)

const props = defineProps<{
  gameLogger: GameLogger
}>()

const afterStartHistories = computed(() => {
  const startIndex = props.gameLogger.histories.findIndex(h => h.method === props.gameLogger.startTurn.name)
  if (startIndex === -1) {
    return []
  }
  return props.gameLogger.histories.slice(startIndex)
})
</script>

<style lang="scss">
.table {
  border-collapse: collapse;
  th,
  td {
    border: 1px solid darkgray;
    padding: 5px 10px;
  }
}
</style>