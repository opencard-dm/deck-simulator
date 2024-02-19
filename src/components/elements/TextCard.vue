<template>
  <img v-if="Features.using_image && card?.imageUrl" draggable="false" :src="card?.imageUrl" :style="{
    width: `${width}px`
  }">
  <div v-else class="cardElem" 
    :class="{
      selected: selected,
      target: canBeTarget,
      large: large,
    }"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      background: color,
    }">
    <div class="card_top">
      <span class="card_cost">{{ cardDetail?.cost }}</span>
      <span class="card_name">{{ cardDetail?.name.split('/')[0].trim() }}</span>
    </div>
    <div class="card_reces" :style="{
      width: large ? 'unset' : `${width / 0.6 - 2}px`
    }">{{ cardDetail?.races?.join(' / ') }}</div>
    <div class="card_text" v-if="cardDetail && large">{{ getReadableText(cardDetail?.card_text) }}</div>
    <template v-if="cardDetail?.combined_card">
      <div class="card_top">
        <span class="card_cost">{{ cardDetail?.combined_card.cost }}</span>
        <span class="card_name">{{ cardDetail?.combined_card.name }}</span>
      </div>
      <div class="card_text" v-if="large && cardDetail?.combined_card">{{ getReadableText(cardDetail?.combined_card.card_text) }}</div>
    </template>
    <div class="card_power" v-if="cardDetail?.power">{{ cardDetail?.power }}</div>
  </div>
</template>

<script setup lang="ts">
import { Card } from '@/entities/Card';
import { CardDetail, SourceDeck } from '@/entities/Deck';
import { Features } from '@/features';
import { useRoomStore } from '@/stores';
import { computed } from 'vue';

const roomStore = useRoomStore()

const props = withDefaults(defineProps<{
  width?: number
  card: Card | null
  selected: boolean | null
  canBeTarget?: boolean | null
  large?: boolean
  deck?: SourceDeck
}>(), {
  canBeTarget: false,
  large: false,
  width: -1, // 不正な値だとスタイルがセットされない仕様を利用
})
const height = computed(() => props.width * 908 / 650)
const cardDetail = computed<CardDetail|null>(() => {
  if (!props.card) return null
  if (props.card.cd) {
    return getCardDetail(props.card.cd)
  }
  return null
})

function getReadableText(text: string) {
  const splitted = text.split('\n')
  // console.log(splitted)
  return splitted.map(t => {
    if (t.startsWith('　')) return t
    return '■' + t
  }).join('\n')
}

const color = computed(() => {
  if (!cardDetail.value) {
    return 'white'
  }
  const civilizations = cardDetail.value.civilizations || []
  if (cardDetail.value.combined_card) {
    cardDetail.value.combined_card.civilizations.forEach(c => {
      if (!civilizations.includes(c)) {
        civilizations.push(c)
      }
    })
  }
  const colors = []
  if (civilizations.includes('light')) {
    colors.push('yellow')
  }
  if (civilizations.includes('water')) {
    colors.push('lightblue')
  }
  if (civilizations.includes('dark')) {
    colors.push('gray')
  }
  if (civilizations.includes('fire')) {
    colors.push('lightcoral')
  }
  if (civilizations.includes('nature')) {
    colors.push('lightgreen')
  }
  if (civilizations.includes('zero')) {
    colors.push('white')
  }
  if (colors.length === 1) {
    return colors[0]
  }
  if (colors.length === 2) {
    return `linear-gradient(-30deg, ${colors[0]} 50%, ${colors[1]} 50%)`
  }
  if (colors.length === 3) {
    return `linear-gradient(-30deg, ${colors[2]} 33%, rgba(0, 0, 0, 0) 33%)`
      + `, linear-gradient(-30deg, ${colors[1]} 66%, ${colors[0]} 66%)`
  }
})

function getCardDetail(cardId: string) {
  if (props.deck && props.deck.cardDetails) {
    try {
      return props.deck?.cardDetails[cardId]
    } catch (error) {
      console.error('card not found:', cardId)
      return null
    }
  }
  try {
    return roomStore.cardDetails[cardId]
  } catch (error) {
    console.error('card not found:', cardId)
    return null
  }
}
</script>

<style lang="scss" scoped>
.cardElem {
  padding-top: 2px;
  padding-left: 2px;
  border-radius: 5px;
  position: relative;
  overflow: hidden;
  user-select: none;
  box-sizing: border-box;
  &.target {
    border: 3px solid orange;
    border-radius: 5px;
  }
  &.selected {
    border: 3px solid #b60000;
    border-radius: 5px;
  }
  .card_top {
    display: inline-block;
    line-height: 14px;
  }
  .card_cost {
    font-weight: 900;
    color: white;
    border-radius: 50%;
    margin-right: 5px;
    text-shadow: 0.5px 0.5px black;
  }
  .card_name {
    word-break: break-all;
    font-size: 12px;
    font-weight: 500;
    color: black;
  }
  .card_reces {
    font-size: 10px;
    transform: scale(0.6);
    transform-origin: left top;
  }
  .card_text {
    word-break: break-all;
    white-space: pre-wrap;
    font-size: 10px;
    color: black;
  }
  .card_power {
    position: absolute;
    bottom: 0px;
    left: 0px;
    padding: 0px 4px;
    font-size: 14px;
    font-weight: 600;
    border-top-right-radius: 5px;
    border-bottom-left-radius: 5px;
    color: white;
    background-color: #444;
  }
  &.large {
    padding-bottom: 2rem;
    .card_top {
      display: inline-block;
      line-height: unset;
    }
    .card_name {
      font-size: 20px;
    }
    .card_text {
      word-break: break-all;
      font-size: 16px;
      color: black;
    }
    .card_reces {
      font-size: 14px;
      transform: unset;
    }
  }
}
</style>
