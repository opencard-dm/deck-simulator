<template>
  <table class="roomTable" style="margin-top: 20px">
    <thead>
      <th><div>デッキ名</div></th>
      <th><div>カード枚数</div></th>
      <th colspan="3"><div></div></th>
    </thead>
    <template v-for="(decksSource, sourceIndex) in userDecks">
      <tr v-for="(deck, deckIndex) in decksSource.decks" :key="decksSource.url + deck.name">
        <td>
          <div style="text-align: left;">{{ deck.name }}</div>
        </td>
        <td>
          <div style="text-align: left;">{{ cardsNumInDeck(deck) }}</div>
        </td>
        <td style="text-align: center;">
          <router-link
            :to="{
              path: '/single',
              query: { deck_id: sourceIndex + '-' + deck.name },
            }"
          >
            <o-button variant="info" size="small">動かす</o-button>
          </router-link>
        </td>
        <td v-if="deckIndex === 0" :rowspan="decksSource.decks.length">
          <o-button variant="info" size="small" @click="updateDeckFromSource(decksSource.url)">更新</o-button>
        </td>
        <td v-if="deckIndex === 0" :rowspan="decksSource.decks.length">
          <a
            class="link"
            :href="decksSource.url.replace('/export', '/edit')"
            target="sheet"
            rel="noopener"
          >
            <span>シートを開く</span>
            <o-icon
              pack="fas"
              style="margin-left: 4px;"
              icon="arrow-up-right-from-square"
              size="small"
            ></o-icon>
          </a>
        </td>
      </tr>
    </template>
    <template v-for="sourceDeck in firebaseDecks" :key="sourceDeck.id">
      <tr>
        <td>
          <div style="text-align: left;">{{ sourceDeck.name }}</div>
        </td>
        <td>
          <div style="text-align: left;">{{ cardsNumInDeck(sourceDeck) }}</div>
        </td>
        <td style="text-align: center;">
          <router-link
            :to="{
              path: '/single',
              query: { deck_id: 'firebase' + '-' + sourceDeck.id },
            }"
          >
            <o-button variant="info" size="small">動かす</o-button>
          </router-link>
        </td>
        <td colspan="2">
          <router-link
            :to="{
              path: '/decks/edit',
              query: { deck_id: sourceDeck.id },
            }"
          >
            <o-button variant="info" size="small">編集</o-button>
          </router-link>
        </td>
      </tr>
    </template>
  </table>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted } from "vue";
import { getUserDecks } from "./builder/decks";
import { SourceDeck } from "@/entities/Deck";
import { fetchDeck } from "@/components/deck-inputs/GoogleSheetInput";
import { useDecksStore } from "@/stores/decks";

const firebaseDecks = reactive<SourceDeck[]>([])

onMounted(async () => {
  firebaseDecks.push(...(await getUserDecks()))
})

function cardsNumInDeck(deck: SourceDeck) {
  let num = 0
  for (const card of deck.cards) {
    num += card.times
  }
  let chojigenCardsNum = 0
  for (const card of deck.chojigenCards) {
    chojigenCardsNum += card.times
  }
  let grCardsNum = 0
  for (const card of deck.grCards) {
    grCardsNum += card.times
  }
  let expression = num.toString()
  const specialCardsExpressions = []
  if (chojigenCardsNum > 0) {
    specialCardsExpressions.push(`超次元:${chojigenCardsNum}`)
  }
  if (grCardsNum > 0) {
    specialCardsExpressions.push(`GR: ${grCardsNum}`)
  }
  if (specialCardsExpressions.length > 0) {
    expression += '(' + specialCardsExpressions.join(', ') + ')'
  }
  return expression
}

const decksStore = useDecksStore()
const userDecks = computed(() => {
  return decksStore.data
})

async function updateDeckFromSource(url: string) {
  const decksSource = await fetchDeck(url)
  console.log(decksSource)
  decksStore.addDecksSource(decksSource)
}
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