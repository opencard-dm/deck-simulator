<template>
  <div class="content_wrapper">
    <div>自分のログ</div>
    <table class="roomTable" style="margin-top: 20px">
      <thead>
        <th><div style="font-weight: bold"></div></th>
        <th><div></div></th>
        <th v-if="Features.view_logs"><div></div></th>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td>
            <div style="text-align: left;">{{ log.name }}</div>
          </td>
          <td style="text-align: center;">
            <router-link
              :to="`/logs/${log.id}`"
            >
              <o-button variant="info" size="small">見る</o-button>
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import jsonDecks from '@/decks.json'
import { SourceDeck } from '@/entities/Deck'
import { Features } from '@/features';
import { useAuthStore } from '@/stores/auth'
import axios from  'axios'
import { onMounted, ref } from 'vue'

const authStore = useAuthStore()
const logs = ref([])

async function getLogs() {
  const { data: logsData } = await axios.get('/api/logs', {
    params: {
      userId: authStore.user?.uid
    }
  })
  logs.value = logsData
}

onMounted(() => {
  setTimeout(() => {
    getLogs()
  }, 1000)
})
</script>

<style lang="scss">

.content_wrapper {
  max-width: 600px;
  margin: 0 auto;
}
.roomTable {
  border-collapse: collapse;
  th,
  td {
    border: 1px solid darkgray;
    padding: 5px 10px;
  }
}
</style>