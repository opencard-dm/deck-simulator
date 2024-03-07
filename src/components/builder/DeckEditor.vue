<template>
  <div class="select-bar">
    <DeckHeader
      :deckData="deckData.deckData"
      :deckList="deckList"
      :deckIndex="deckData.deckIndex"
      :side="'left'"
      @change-deck="changeDeck"
      @update-deck="saveDeck"
      @deleteDeck="deleteDeck"
      @copy-deck="copyDeck"
    ></DeckHeader>
  </div>
  <div class="cardList_wrapper">
    <CardList
      :cards="deckData.deckData.cards"
      :deck="deckData.deckData"
      :side="'left'"
      @delete-card="onDeleteCard"
      @update:cards="deckData.deckData.cards = $event"
    ></CardList>
  </div>
  <div style="padding-bottom: 1rem;">
    <OField
      class="deckInput"
      :style="{
        paddingLeft: '8px',
      }"
      :variant="error ? 'danger' : ''"
      :message="loading ? 'カードが見つかりませんでした' : error"
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
import { addDeck, updateDeck } from "./decks";

const props = defineProps<{
  deckList: SourceDeck[]
}>()

const roomStore = useRoomStore()
const decksStore = useDecksStore()

// data
const deckData = reactive({
  deckIndex: 0,
  deckData: {
    name: '',
    source: 'builtin',
    cards: [],
    chojigenCards: [],
    grCards: []
  } as SourceDeck,
})
const message = ref('')

onMounted(() => {
  if (props.deckList.length > 0) {
    deckData.deckData = props.deckList[deckData.deckIndex]
  }
})

// methods
async function saveDeck() {
  message.value = "変更を\n保存中です";
  await updateDeck(deckData.deckData)
  setTimeout(() => {
    message.value = "";
  }, 1000)
}
function createDeck(params, side) {
  if (!params.name) return;
  const deck = {
    name: params.name,
    cards: [],
  };
  const decksCopy = this.$store.state.decks.data;
  decksCopy.push(deck);
  this.$store.commit("decks/setData", decksCopy);
  this[side]["deckData"] = deck;
}
function changeDeck(index: number) {
  const selectedDeck = props.deckList[index]
  deckData.deckData = selectedDeck
  fetchCardDetails(selectedDeck, roomStore)
  deckData.deckIndex = index
}
function deleteDeck(side) {
  const decksCopy = this.$store.state.decks.data;
  decksCopy.splice(this[side].deckIndex, 1);
  this.$store.commit("decks/setData", decksCopy);
  this.message = "";
  location.reload();
}
async function copyDeck() {
  const deckDataCopy: SourceDeck = JSON.parse(JSON.stringify(deckData.deckData))
  deckDataCopy.name += 'のコピー'
  deckDataCopy.source = 'firebase'
  await addDeck(deckDataCopy)
  props.deckList.push(deckDataCopy)
  deckData.deckIndex = props.deckList.length - 1
  deckData.deckData = deckDataCopy
  // decksCopy.splice(this[side].deckIndex, 1);
  // this.$store.commit("decks/setData", decksCopy);
  // this.message = "";
  // location.reload();
}
function onDeleteCard(card: SourceCard) {
  deckData.deckData.cards = deckData.deckData.cards.filter(c => c.cd !== card.cd)
  deckData.deckData.chojigenCards = deckData.deckData.chojigenCards.filter(c => c.cd !== card.cd)
  deckData.deckData.grCards = deckData.deckData.grCards.filter(c => c.cd !== card.cd)
}

// 
// cardname
const cardname = ref('')
const cardExists = computed(() => cardname.value in cardnames)
async function addCard() {
  if (!(cardname.value in cardnames)) {
    return
  }
  const cardId = cardnames[cardname.value]
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