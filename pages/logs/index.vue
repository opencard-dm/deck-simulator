<template>
  <div class="content_wrapper">
    <h2 class="h2">自分のログ</h2>
    <div style="margin-top: 1rem;">※一人回しの画面で左上のメニューを開き、「ログを保存する」ボタンを押すと、ログの保存ができます。</div>
    <o-loading v-model:active="isLoading" 
      :full-page="true"
      icon="rotate"
    ></o-loading>
    <table v-if="logs.length > 0" class="roomTable" style="margin-top: 20px">
      <thead>
        <th><div style="font-weight: bold">ログ名</div></th>
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
          <td style="text-align: center;">
            <o-button 
              variant="danger"
              size="small"
              @click="deleteLog(log.id)"
            >削除</o-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import jsonDecks from '@/decks.json'
import { SourceDeck } from '@@/core/entities/Deck'
import { Features } from '@/features';
import { useAuthStore } from '@/stores/auth'
import axios from  'axios'
import { onMounted, ref } from 'vue'

const authStore = useAuthStore()
const logs = ref<{
  id: string,
  name: string,
}[]>([])

const isLoading = ref(true)

async function getLogs() {
  const { data: logsData } = await axios.get('/api/logs', {
    params: {
      userId: authStore.user?.uid
    }
  })
  isLoading.value = false
  logs.value = logsData
}
async function deleteLog(logId: string) {
  if (!window.confirm('ログを削除しますか？')) {
    return
  }
  isLoading.value = true
  const url = '/api/logs/' + logId
  await axios.delete(url, {
    params: {
      userId: authStore.user?.uid
    }
  })
  logs.value = logs.value.filter(log => log.id !== logId)
  isLoading.value = false
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
  margin: 2rem auto 0;
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