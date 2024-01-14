<template>
  <img v-if="Features.using_image" draggable="false" :src="card?.imageUrl" :style="{
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
      <span class="card_name">{{ cardDetail?.name }}</span>
    </div>
    <div class="card_text" v-if="large">{{ cardDetail?.card_text }}</div>
  </div>
</template>

<script setup lang="ts">
import { Card } from '@/entities/Card';
import { CardDetail } from '@/entities/Deck';
import { Features } from '@/features';
import { computed } from 'vue';
import { useStore } from 'vuex';

const props = withDefaults(defineProps<{
  width?: number
  card: Card | null
  selected: boolean | null
  canBeTarget?: boolean | null
  large?: boolean
}>(), {
  canBeTarget: false,
  large: false,
  width: -1, // 不正な値だとスタイルがセットされない仕様を利用
})
const height = computed(() => props.width * 908 / 650)
const cardDetail = computed<CardDetail|null>(() => {
  if (!props.card) return null
  return getCardDetail(props.card.mainCardId.toString())
})

const color = computed(() => {
  if (!cardDetail.value) {
    return 'white'
  }
  const colors = []
  if (cardDetail.value.is_light) {
    colors.push('yellow')
  }
  if (cardDetail.value.is_water) {
    colors.push('lightblue')
  }
  if (cardDetail.value.is_dark) {
    colors.push('gray')
  }
  if (cardDetail.value.is_fire) {
    colors.push('lightcoral')
  }
  if (cardDetail.value.is_nature) {
    colors.push('lightgreen')
  }
  if (cardDetail.value.is_zero) {
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
  try {
    return useStore().state.cardDetails[cardId]
  } catch (error) {
    console.error('card not found:', cardId)
    return {}
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
  .card_text {
    word-break: break-all;
    font-size: 10px;
    color: black;
  }
  &.large {
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
  }
}
</style>
