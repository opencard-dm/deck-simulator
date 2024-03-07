<template>
  <div class="select-bar">
    <DeckHeader
      :deckData="deckData.deckData"
      :deckList="deckList"
      :deckIndex="deckData.deckIndex"
      :side="'left'"
      @change-deck="changeDeck"
      @update-deck="updateDeck"
      @deleteDeck="deleteDeck"
      @copy-deck="copyDeck"
    ></DeckHeader>
  </div>
  <div>
    <OField
      class="deckInput"
      :style="{
        paddingTop: '6px',
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
      <!-- <input  name="browser"> -->
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
  <div>
    <CardList
      :cards="deckData.deckData.cards"
      :deck="deckData.deckData"
      :side="'left'"
      @update:cards="deckData.deckData.cards = $event"
    ></CardList>
  </div>
</template>

<script setup lang="ts">
import DeckHeader from "./DeckHeader.vue";
import CardList from "./CardList.vue";
import { Deck, fetchDeck } from "@/helpers/Deck";
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoomStore } from "@/stores/room";
import { SourceDeck } from "@/entities/Deck";
import { useDecksStore } from "@/stores/decks";
import cardnames from '@/cardnames.json'
import { isPhone } from "@/helpers/Util";
import axios from "axios";
import { addDeck } from "./decks";

const props = defineProps<{
  deckList: {
    readyMade: SourceDeck[],
    custom: SourceDeck[],
  }
}>()

const roomStore = useRoomStore()
const decksStore = useDecksStore()

// data
const deckData = reactive({
  deckIndex: 0,
  deckData: {
    cards: [],
  },
})
const message = ref('')

onMounted(() => {
  deckData.deckData = props.deckList.custom[deckData.deckIndex]
})

// methods
function updateDeck(params, side) {
  message.value = "変更を\n保存中です";
  // 名前を変更
  if (params.name) {
    this[side].deckData.name = params.name;
  }
  // カードを追加
  if (params.cardUrl) {
    this[side].deckData.cards.push({
      imageUrl: params.cardUrl,
      time: 0,
    });
  }
  const decksCopy = this.$store.state.decks.data;
  decksCopy[this[side].deckIndex] = this[side].deckData;
  this.$store.commit("decks/setData", decksCopy);
  message.value = "";
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
function changeDeck(deckType, index) {
  if (deckType === "custom") {
    const selectedDeck = props.deckList[deckType][index]
    deckData.deckData = Deck.formatData(selectedDeck)
    fetchDeck(selectedDeck.name, roomStore)
    deckData.deckIndex = index
  }
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
  props.deckList.custom.push(deckDataCopy)
  deckData.deckIndex = props.deckList.custom.length - 1
  deckData.deckData = deckDataCopy
  // decksCopy.splice(this[side].deckIndex, 1);
  // this.$store.commit("decks/setData", decksCopy);
  // this.message = "";
  // location.reload();
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
  deckData.deckData.cards.unshift({
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
</style>