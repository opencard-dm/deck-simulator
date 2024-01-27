<template>
  <table class="roomTable" style="margin-top: 20px">
    <thead>
      <th><div style="font-weight: bold">サンプルデッキ(画像無し)</div></th>
      <th><div></div></th>
    </thead>
    <tbody>
      <tr v-for="deck in decks" :key="deck.name">
        <td>
          <div style="text-align: left;">{{ deck.name }}</div>
        </td>
        <td style="text-align: center;">
          <router-link
            :to="{
              path: '/single',
              query: { deck_id: deck.name },
            }"
          >
            <o-button variant="info" size="small">動かす</o-button>
          </router-link>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import jsonDecks from '@/decks.json'
import { SourceDeck } from '@/entities/Deck'

const decks: SourceDeck[] = jsonDecks as any
</script>

<style lang="scss">
.roomTable {
  border-collapse: collapse;
  th,
  td {
    border: 1px solid darkgray;
    padding: 5px 10px;
  }
}
</style>