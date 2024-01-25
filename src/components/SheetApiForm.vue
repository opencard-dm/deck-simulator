<template>
  <div>
    <OField
      class="deckForm_searchField"
      style="margin-top: 10px; max"
      :message="message"
    >
      <OInput
        v-model="url"
        placeholder="Google SheetのデプロイしたURLを貼り付ける"
        type="text"
        icon="search"
        :expanded="true"
        :disabled="loading"
        @keypress.prevent="message = 'ペーストのみ可能です'"
        @input="getDecks()"
      >
      </OInput>
    </OField>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore()
const url = ref('')
const message = ref('')
const loading = ref(false)
const emit = defineEmits<{
  'fetched-decks': [any[]]
}>()
// const decks = reactive([])
async function getDecks() {
  if (!url.value) return
  if (loading.value) return
  loading.value = true
  message.value = 'Google Sheetの情報を取得中です'
  try {
    const response = await axios.get(url.value)
    if (!response.data[0].name) throw Error()
    console.debug(response)
    emit('fetched-decks', response.data)
    // store.commit("decks/setData", response.data)
    // decks.push(...response.data as never[])
  } catch (error) {
    url.value = ''
    console.error(error)
  }
  loading.value = false
  message.value = ''
}
</script>