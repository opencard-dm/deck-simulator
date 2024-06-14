<template>
  <div class="tefuda-zone-wrapper" :class="side" :style="{height: tefudaHeight}">
    <div class="tefuda-zone" :class="side">
      <div
        class="card_wrapper"
        :style="{width: `${cardWidth}px`, height: `${cardHeight}px`}"
        v-for="(card, index) in cards"
        :key="index"
        @mouseenter="!hideTefuda && !isPhone() ? setHoveredCard(card) : null"
        @mouseleave="!hideTefuda && !isPhone() ? setHoveredCard(null) : null"
      >
        <div
          class="card"
          :class="[
            { 'is-selected': selectMode && selectMode.card.id === card.id },
          ]"
        >
          <!-- 対戦相手の手札は常に裏向き -->
          <div v-if="opponent && !single" @click.stop="clickCard(card)">
            <img 
              :src="cardDetail(card).backImageUrl"
              :style="{width: `${cardWidth}px`}"
            />
          </div>
          <div v-else @click.stop="clickCard(card)">
            <img 
              v-if="card.faceDown" 
              :src="cardDetail(card).backImageUrl"
              :style="{width: `${cardWidth}px`}"
            />
            <CardPopup v-else :url="card.imageUrl" :card="card">
              <TextCard
                :width="cardWidth"
                :card="card"
                :selected="selectMode && selectMode.card.id === card.id"
              ></TextCard>
            </CardPopup>
          </div>
        </div>
        <div
          v-if="selectMode && selectMode.card.id === card.id"
          class="card_bottomButton"
        >
          <o-button
            variant="grey-dark"
            size="small"
            @click.stop="
              setSelectMode(null);
              setCardState(card, { faceDown: !card.faceDown })"
            >裏返す</o-button
          >
          <o-button
            v-if="!isPhone()"
            variant="danger"
            size="small"
            @click.stop="
              setSelectMode(null);
              moveCard(zone, 'battleZone', card);
            "
            >出す</o-button
          >
        </div>
        <div
          v-if="!opponent"
          class="card_bottomButton"
        >
          <o-button
            v-if="game.players[player].attackingCard && cardData(card)?.ability.kakumeiChange"
            variant="danger"
            size="small"
            @click.stop="kakumeiChange(card)"
            >チェンジ</o-button
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
            <img src="https://cdn.jsdelivr.net/npm/dmdeck-simulator@latest/dist/images/card-back.jpg" :width="cardWidth" />
          </div>
          <div
            class="card_bottomButton" 
            style="top: 50%; transform: translateY(-50%);"
          >
            <o-button
              v-if="selectMode && selectMode.player === player && selectMode.zone !== zone"
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
import type { PlayerType, SideType } from "@@/core/entities/player";
import { Card } from '@@/core/entities/card';
import { ZoneType } from "@@/core/entities/zones";
import CardPopup from '../elements/CardPopup.vue'
import TextCard from '../elements/TextCard.vue'
import { isPhone } from '@/helpers/Util'
import { Layout } from '@/helpers/layout'
import { useZone, zoneEmit } from './zone';
import { computed } from 'vue';
import { cardData } from "@@/core/entities/CardData";
import { Game } from "@@/core/entities/game";
import { CardActions } from "@@/core/usecase/CardActions";
const cardWidth = 70
const cardHeight = cardWidth * 908 / 650
const tefudaHeight = Layout.tefudaHeight(cardWidth) ?
  `${Layout.tefudaHeight(cardWidth)}px` : ''

const props = withDefaults(defineProps<{
  player: PlayerType
  cards: Card[]
  side: SideType
  single: boolean
  opponent: boolean
  zone?: ZoneType
  game: Game
  cardActions: CardActions
}>(), {
  zone: 'tefudaZone'
})
const hideTefuda = computed(() => {
  return !props.single && props.opponent
})

const emit = defineEmits<zoneEmit & {
  drawOne: []
}>()

const {
  setHoveredCard,
  selectMode,
  setSelectMode,
  setCardState,
  moveSelectedCard,
  moveCard,
  workSpace,
  openWorkSpace,
  closeWorkSpace,
  cardDetail,
  hoveredCard
} = useZone(props, emit)

function clickCard(card: Card) {
  if (workSpace.value.active) {
    closeWorkSpace()
  }
  // すでに選択済みのカードであれば、選択解除
  if (selectMode.value && selectMode.value.card.id === card.id) {
    setSelectMode(null);
    setHoveredCard(null)
    return;
  }
  // カードのプレビューが開いていた場合、表示するカードを切り替える
  if (!card.faceDown && hoveredCard.value) {
    setHoveredCard(card)
  }
  // 選択する
  setSelectMode({
    player: props.player,
    card,
    zone: props.zone,
    selectingTarget: true,
  });
}
function clickPlaceholderCard() {
  if (selectMode.value && selectMode.value.zone !== props.zone) {
    moveSelectedCard(props.zone, false)
  } else if (hideTefuda.value) {
    openWorkSpace({
      zone: props.zone,
      cards: props.cards,
      player: props.player,
    })
  } else {
    emit('drawOne');
  }
}
function kakumeiChange(tefudaCard: Card) {
  const attackingCard = props.game.players[props.player].attackingCard
  if (!attackingCard) {
    return
  }
  props.cardActions.changeAttackingCard({
    from: 'tefudaZone',
    attackingCard,
    card: tefudaCard,
    player: props.player,
  })
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
