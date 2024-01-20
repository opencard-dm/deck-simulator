<template>
  <OField
    class="deckInput"
    :variant="error ? 'danger' : ''"
    :message="loading ? 'デッキ取得中です' : error"
  >
    <OInput
      v-model="url"
      placeholder="GoogleスプレッドシートのURLを貼り付ける"
      :expanded="true"
      :disabled="loading"
      @keypress.prevent="error = 'ペーストのみ可能です'"
      @input="onUrlChange()"
    >
    </OInput>
  </OField>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { fetchDeck } from './GoogleSheetInput';

const store = useStore()

const url = ref('')
const error = ref('')
const loading = ref(false)
async function onUrlChange() {
  const newVal = url.value
  if (!newVal) {
    error.value = "";
    return;
  }
  if (
    !newVal.startsWith('https://docs.google.com/')
  ) {
    error.value = "不適切なURLです";
    return;
  } else {
    if (loading.value || error.value) return;
    loading.value = true
    const fileId = new URL(newVal)
      .pathname
      .split('/')[3]
    const downloadSheetUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`
    const decksSource = await fetchDeck(downloadSheetUrl)
    store.commit('decks/setData', decksSource)
    url.value = ''
    loading.value = false
  }
  error.value = "";
}
</script>
