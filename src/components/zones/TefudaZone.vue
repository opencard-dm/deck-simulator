<template>
  <div class="tefuda-zone-wrapper" :class="side" :style="{height: tefudaHeight}">
    <div class="tefuda-zone" :class="side">
      <div
        class="card_wrapper"
        :style="{width: `${cardWidth}px`, height: `${cardHeight}px`}"
        v-for="(card, index) in cards"
        :key="index"
        @mouseenter="!hideTefuda ? setHoveredCard(card) : null"
        @mouseleave="!hideTefuda ? setHoveredCard(null) : null"
      >
        <div
          class="card"
          :class="[
            { 'is-selected': selectMode && selectMode.card.id === card.id },
          ]"
        >
          <!-- 対戦相手の手札は常に裏向き -->
          <div v-if="side === 'upper' && !single">
            <img 
              :src="card.backImageUrl" 
              @click.stop="clickCard(card)"
              :style="{width: `${cardWidth}px`}"
            />
          </div>
          <div v-else @click.stop="clickCard(card)">
            <img 
              v-if="card.faceDown" 
              :src="card.backImageUrl"
              :style="{width: `${cardWidth}px`}"
            />
            <CardPopup v-else :url="card.imageUrl">
              <img :src="card.imageUrl" :style="{width: `${cardWidth}px`}" />
            </CardPopup>
          </div>
        </div>
        <div
          v-if="selectMode && selectMode.card.id === card.id"
          class="card_bottomButton"
        >
          <o-button
            v-if="selectTargetMode() && selectMode.card.id === card.id"
            variant="grey-dark"
            size="small"
            @click.stop="clickCard(card)"
            >キャンセル</o-button
          >
          <o-button
            v-else
            variant="grey-dark"
            size="small"
            @click.stop="
              setSelectMode({
                ...selectMode,
                selectingTarget: true,
              })
            "
            >重ねる</o-button
          >
          <o-button
            v-if="!isPhone()"
            variant="grey-dark"
            size="small"
            @click.stop="
              setSelectMode(null);
              moveCard(zone, 'battleCards', card);
            "
            >出す</o-button
          >
        </div>
      </div>

      <div class="card_wrapper card-placeholder-wrapper" :style="{height: `${cardHeight}px`}">
        <div
          class="card"
          style="cursor: pointer;"
          @click.stop="clickPlaceholderCard()" 
        >
          <div style="opacity: 0.2;">
            <img src="/images/card-back.jpg" :width="cardWidth" />
          </div>
          <div
            class="card_bottomButton" 
            style="top: 50%; transform: translateY(-50%);"
          >
            <o-button
              v-if="selectMode && selectMode.zone !== zone"
              class="tefudaZoneButton"
              :size="isPhone() ? 'small' : ''"
              variant="info"
              rounded
            >
              手札へ
            </o-button>
            <o-button
              v-else-if="hideTefuda"
              variant="grey-dark"
              size="small"
              :disabled="true"
              >見る</o-button
            >
            <o-button
              v-else
              variant="grey-dark"
              size="small"
              :disabled="true"
              >ドロー</o-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { player, side } from '@/entities';
import { Card } from '@/entities/Card';
import CardPopup from '../elements/CardPopup.vue'
import { isPhone } from '@/helpers/Util'
import { Layout } from '@/helpers/layout'
import { useZone, zoneEmit } from './zone';
import { useStore } from 'vuex';
import { computed } from 'vue';
const cardWidth = 70
const cardHeight = cardWidth * 908 / 650
const tefudaHeight = Layout.tefudaHeight(cardWidth) ?
  `${Layout.tefudaHeight(cardWidth)}px` : ''

const store = useStore()
const props = defineProps<{
  player: player
  cards: Card[]
  side: side
  single: boolean
}>()
const zone = 'tefudaCards'
const hideTefuda = computed(() => {
  return !props.single && props.side === 'upper'
})

const emit = defineEmits<zoneEmit & {
  drawOne: []
}>()

const {
  setHoveredCard,
  selectTargetMode,
  selectMode,
  setSelectMode,
  moveSelectedCard,
  moveCard,
  workSpace,
  openWorkSpace,
  closeWorkSpace,
} = useZone(props, emit)

function clickCard(card: Card) {
  if (workSpace.value.active) {
    closeWorkSpace()
  }
  // すでに選択済みのカードであれば、選択解除
  if (selectMode.value && selectMode.value.card.id === card.id) {
    setSelectMode(null);
    return;
  }
  // カードのプレビューが開いていた場合、表示するカードを切り替える
  if (!card.faceDown && store.state.displayImageUrl) {
    store.commit('setDisplayImageUrl', card.imageUrl)
  }
  // 選択する
  setSelectMode({
    player: props.player,
    card,
    zone: zone,
  });
}
function clickPlaceholderCard() {
  if (selectMode.value && selectMode.value.zone !== zone) {
    moveSelectedCard(zone, false)
  } else if (hideTefuda.value) {
    openWorkSpace({
      zone: zone,
      cards: props.cards,
      player: props.player,
    })
  } else {
    emit('drawOne');
  }
}
</script>

<style lang="scss">
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
$card-width: 70px;

.tefuda-zone-wrapper {
  .openZoneButton {
    transform: rotate(45deg);
    margin-left: 10px;
    cursor: pointer;
  }
  .tefudaZoneButton {
    align-self: center;
    &_wrapper {
      display: flex;
      align-items: center;
    }
  }
  &.upper {
    background: #fff;
    margin-left: 100px;
    @media screen and (max-width: 800px) {
      margin-top: 0px;
      margin-left: 0px;
      overflow-y: scroll;
    }
    .tefuda-zone {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row-reverse;
      > * {
        margin-right: 5px;
        margin-top: 5px;
      }
    }
    .card-placeholder-wrapper {
      .card_bottomButton > * {
        transform: rotate(180deg);
      }
    }
    .card {
      transform: rotate(180deg);
    }
  }
  &.lower {
    margin-top: 20px;
    margin-left: 100px;
    @media screen and (max-width: 800px) {
      margin-left: 10px;
      position: fixed;
      bottom: 0px;
      width: 100%;
      overflow-y: scroll;
    }
    .tefuda-zone {
      display: flex;
      flex-wrap: wrap;
      > * {
        margin-right: 5px;
        margin-top: 5px;
      }
    }
  }
  .tefuda-zone {
    height: 100%;
    display: flex;
    max-width: 410px;
    padding-bottom: 10px;
    .card_wrapper {
      position: relative;
    }
    .card {
      width: 100%;
      position: relative;
      img {
        box-sizing: border-box;
      }
      &.is-selected {
        img {
          border: 3px solid #b60000;
          border-radius: 5px;
        }
      }
    }
    .card_bottomButton {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      > * + * {
        margin-top: 15px;
      }
      > * {
        width: fit-content;
      }
    }
  }
  .card-placeholder-wrapper {
    display: flex;
    align-items: center;
  }
}
// layout
.tefuda-zone-wrapper.upper {
  // position: absolute;
  // top: 5px;
  // right: 0px;
}
</style>
