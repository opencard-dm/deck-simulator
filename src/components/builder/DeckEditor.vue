<template>
  <div class="select-bar">
    <DeckHeader
      :deckData="deckData.deckData"
      :deckList="deckList"
      :deckIndex="deckData.deckIndex"
      :side="'left'"
      @change-deck="changeDeck"
      @update-deck="saveDeck"
      @delete-deck="onDeleteDeck"
      @copy-deck="copyDeck"
    ></DeckHeader>
  </div>
  <div class="cardList_wrapper">
    <CardList
      :cards="deckData.deckData.cards"
      :deck="deckData.deckData"
      :side="'left'"
      @delete-card="onDeleteCard"
      @save-deck="saveDeck"
      @update:cards="deckData.deckData.cards = $event"
    ></CardList>
  </div>
  <div v-if="deckData.deckData.source === 'firebase'" style="padding-bottom: 1rem;">
    <OField
      class="deckInput"
      :style="{
        paddingLeft: '8px',
      }"
    >
      <OInput
        list="card_left"
        v-model="cardname"
        :style="{
          paddingRight: '0px',
          minWidth: '200px',
        }"
        size="small"
        placeholder="カード名を入力"
        :expanded="false"
      >
      </OInput>
      <o-button variant="info" 
        @click="addCard"
        size="small"
        :disabled="!cardExists"
        >追加</o-button
      >
      <datalist id="card_left">
        <option 
          v-for="cardname in Object.keys(cardnames)"
          :key="cardname" 
          :value="cardname"
        ></option>
      </datalist>
    </OField>
  </div>
</template>

<script setup lang="ts">
import DeckHeader from "./DeckHeader.vue";
import CardList from "./CardList.vue";
import { fetchCardDetails } from "@/helpers/Deck";
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoomStore } from "@/stores/room";
import { SourceCard, SourceDeck } from "@/entities/Deck";
import { useDecksStore } from "@/stores/decks";
import cardnames from '@/cardnames.json'
import { isPhone } from "@/helpers/Util";
import axios from "axios";
import { addDeck, deleteDeck, updateDeck } from "./decks";

const props = defineProps<{
  deckList: SourceDeck[]
}>()

const emit = defineEmits<{
  'delete-deck': [string]
}>()

const roomStore = useRoomStore()
const decksStore = useDecksStore()

const getEmptyDeck = (): SourceDeck => {
  return {
    name: '',
    source: 'builtin',
    cards: [],
    chojigenCards: [],
    grCards: []
  }
}

// data
const deckData = reactive({
  deckIndex: 0,
  deckData: getEmptyDeck() as SourceDeck,
})
const message = ref('')

onMounted(() => {
  if (props.deckList.length > 0) {
    deckData.deckData = props.deckList[deckData.deckIndex]
  }
})

// methods
async function saveDeck() {
  await updateDeck(deckData.deckData)
}
function changeDeck(index: number) {
  const selectedDeck = props.deckList[index]
  deckData.deckData = selectedDeck
  fetchCardDetails(selectedDeck, roomStore)
  deckData.deckIndex = index
}
async function onDeleteDeck() {
  const id = deckData.deckData.id
  if (id) {
    emit('delete-deck', id)
    await deleteDeck(deckData.deckData)
    deckData.deckData = getEmptyDeck()
  }
}
async function copyDeck() {
  const deckDataCopy: SourceDeck = JSON.parse(JSON.stringify(deckData.deckData))
  deckDataCopy.name += 'のコピー'
  deckDataCopy.source = 'firebase'
  await addDeck(deckDataCopy)
  props.deckList.push(deckDataCopy)
  deckData.deckIndex = props.deckList.length - 1
  deckData.deckData = deckDataCopy
}
function onDeleteCard(card: SourceCard) {
  deckData.deckData.cards = deckData.deckData.cards.filter(c => c.cd !== card.cd)
  deckData.deckData.chojigenCards = deckData.deckData.chojigenCards.filter(c => c.cd !== card.cd)
  deckData.deckData.grCards = deckData.deckData.grCards.filter(c => c.cd !== card.cd)
  saveDeck()
}

// 
// cardname
const cardname = ref('')
const cardExists = computed(() => cardname.value in cardnames)
async function addCard() {
  if (!(cardname.value in cardnames)) {
    return
  }
  const cardId = (cardnames as any)[cardname.value]
  const { data: cards } = await axios.get('/api/cards', {
    params: {
      cardIds: cardId
    }
  })
  deckData.deckData.cards.push({
    cd: cardId,
    times: 0,
  })
  cardname.value = ''
  roomStore.addCardDetails(cards)
  saveDeck()
}
</script>

<style lang="scss" scoped>
.select-bar {
  position: fixed;
  z-index: 1;
  top: 0;
  width: 100%;
}
.cardList_wrapper {
  width: 100%;
}
</style>