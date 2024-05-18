<template>
  <div class="select-bar">
    <DeckHeader
      :deck-data="deckData.deckData"
      :deck-list="deckList"
      :deck-index="deckData.deckIndex"
      :side="'left'"
      :editable="editable"
      @change-deck="changeDeck"
      @update-deck="saveDeck"
      @delete-deck="onDeleteDeck"
      @copy-deck="copyDeck"
    />
  </div>
  <div class="cardList_wrapper">
    <CardList
      :cards="deckData.deckData.cards"
      :side="'left'"
      :editable="editable"
      @delete-card="onDeleteCard"
      @save-deck="saveDeck"
      @update:cards="deckData.deckData.cards = $event"
    />
    <CardList
      :cards="deckData.deckData.chojigenCards"
      :side="'left'"
      :editable="editable"
      @delete-card="onDeleteCard"
      @save-deck="saveDeck"
      @update:cards="deckData.deckData.cards = $event"
    />
    <CardList
      :cards="deckData.deckData.grCards"
      :side="'left'"
      :editable="editable"
      @delete-card="onDeleteCard"
      @save-deck="saveDeck"
      @update:cards="deckData.deckData.cards = $event"
    />
  </div>
  <div
    v-if="editable"
    class="deckEditor_footer"
    style="padding-bottom: 1rem;"
  >
    <OField
      class="deckInput"
      :style="{
        paddingLeft: '8px',
        marginBottom: '4px',
      }"
      message="カード名の部分一致で検索できます。ひらがな・カタカナは区別して入力する必要があります。"
    >
      <OInput
        v-model="cardname"
        list="card_left"
        :style="{
          paddingRight: '0px',
          minWidth: '200px',
        }"
        size="small"
        placeholder="カード名を入力"
        :expanded="false"
      />
      <o-button
        variant="info" 
        size="small"
        :disabled="!cardExists"
        @click="addCard"
      >
        追加
      </o-button>
      <datalist id="card_left">
        <option 
          v-for="cardname in Object.keys(cardnames)"
          :key="cardname" 
          :value="cardname"
        />
      </datalist>
    </OField>
    <div
      v-if="cardExists"
      class="preview"
    >
      <TextCard
        :card="inputCard"
        :width="50"
        :selected="false"
        :deck="null"
        @mouseenter="isPhone() ? null : roomStore.setHoveredCard(inputCard)"
        @mouseleave="isPhone() ? null : roomStore.setHoveredCard(null)"
        @click.stop="isPhone() ? roomStore.setHoveredCard(inputCard) : null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DeckHeader from "./DeckHeader.vue";
import CardList from "./CardList.vue";
import { fetchCardDetails } from "@@/core/services/card.service";
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoomStore } from "@/stores/room";
import { CardDetail, SourceCard, SourceDeck } from "@/entities/Deck";
import { useDecksStore } from "@/stores/decks";
import cardnames from '@/cardnames.json'
import { isPhone } from "@/helpers/Util";
import axios from "axios";
import { addDeck, deleteDeck, updateDeck } from "./decks";
import TextCard from "../elements/TextCard.vue";

const props = defineProps<{
  deckList: SourceDeck[]
  isMain: boolean
}>()

const emit = defineEmits<{
  'delete-deck': [string]
}>()

const roomStore = useRoomStore()
const decksStore = useDecksStore()
const config = useRuntimeConfig()

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
  deckIndex: -1,
  deckData: getEmptyDeck() as SourceDeck,
})
const message = ref('')
const editable = computed(() => {
  if (config.public.dev) return true
  if (deckData.deckData.source === 'firebase') {
    return true
  }
  return false
})

onMounted(() => {
  const deckId = new URLSearchParams(location.search).get('deck_id')
  if (!props.isMain) return
  if (deckId && props.isMain) {
    for (const [index, deck] of props.deckList.entries()) {
      if (deck.id === deckId) {
        deckData.deckData = deck
        deckData.deckIndex = index
        return
      }
    }
  }
  if (props.deckList.length > 0) {
    deckData.deckIndex = 0
    deckData.deckData = props.deckList[deckData.deckIndex]
  }
})

// methods
async function saveDeck() {
  await updateDeck(deckData.deckData)
}
async function changeDeck(index: number) {
  const selectedDeck = props.deckList[index]
  deckData.deckData = selectedDeck
  roomStore.addCardDetails(await fetchCardDetails(selectedDeck))
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
const inputCard = computed(() => {
  if (!cardExists.value) return null
  const cardId = (cardnames as any)[cardname.value]
  if (!(cardId in roomStore.cardDetails)) {
    // 通信量を減らすために、カード詳細情報がない場合のみ取得
    axios.get('/api/cards', {
      params: {
        cardIds: cardId
      }
    }).then(({data: cards}) => {
      roomStore.addCardDetails(cards)
    })
  }
  return {
    cd: cardId
  }
})
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
  const cardDetail: CardDetail = cards[cardId]
  if (cardDetail.types?.includes('GR')) {
    deckData.deckData.grCards.push({
      cd: cardId,
      times: 0,
    })
  } else if (cardDetail.types?.includes('サイキック')
    || cardDetail.types?.includes('ドラグハート')
  ) {
    deckData.deckData.chojigenCards.push({
      cd: cardId,
      times: 0,
    })
  } else {
    deckData.deckData.cards.push({
      cd: cardId,
      times: 0,
    })
  }
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
  // deckEditor_footer のheightと連動する
  padding-bottom: 140px;
}
.preview {
  padding-left: 10px;
  opacity: 0.6;
}
.deckEditor_footer {
  width: 100%;
  height: 140px;
  padding-top: 8px;
  background-color: white;
  position: fixed;
  bottom: 0px;
}
</style>