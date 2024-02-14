<template>
  <div class="battle-zone-wrapper">
    <div class="battleZoneButton_wrapper" :class="side">
      <o-icon
        class="openZoneButton battleZoneButton"
        pack="fas"
        size="medium"
        icon="arrow-circle-up"
        variant="primary"
        @click.stop="
          openWorkSpace({
            zone: zone,
            cards: cards,
            player: player,
          })
        "
      ></o-icon>
    </div>
    <div
      class="battle-zone"
      :class="{
        [side]: true,
      }"
      :style="{minHeight: cardHeight}"
    >
      <!-- keyをindexにしていると、カード移動後MarkerToolが同じindexの別のカードに移ってしまう。 -->
      <div
        class="card_wrapper"
        v-for="card in visibleCards"
        :key="card.id"
        @mouseenter="isPhone() ? null : setHoveredCard(card)"
        @mouseleave="isPhone() ? null : setHoveredCard(null)"
        :style="{width: `${cardWidth}px`, height: `${cardHeight}px`}"
      >
        <MarkTool
          :reverse="side === 'upper'"
          :tapped="card.tapped"
          :active="cardIsSelected(card)"
          :color="card.markColor"
          @change="setMarkColor(card, $event)"
        >
          <div
            class="card in-battle"
            :class="{
              tapped: card.tapped,
              'is-group': !!card.groupId,
              'is-selectMode': selectTargetMode(),
              'is-selected': cardIsSelected(card),
            }"
            :draggable="!card.groupId"
            @click.stop="clickCard(card)"
          >
            <img
              v-if="card.faceDown === true"
              :src="cardDetail(card).backImageUrl"
              :width="cardWidth"
              draggable="false"
            />
            <CardPopup v-else :card="card" :url="card.imageUrl">
              <TextCard
                class="textCard"
                :card="card"
                :width="cardWidth"
                :selected="cardIsSelected(card)"
                :canBeTarget="selectTargetMode()"
              ></TextCard>
            </CardPopup>
            <div
              v-if="card.groupId"
              class="cards-num"
            >
              {{ getGroup(card)?.cards.length }}
            </div>
          </div>
        </MarkTool>
        <div v-if="cardIsSelected(card)" class="card_bottomButton">
          <!-- 重ねる or 見る -->
          <o-button
            v-if="card.groupId"
            variant="grey-dark"
            size="small"
            @click.stop="
              openWorkSpace({
                zone: zone,
                cards: getGroup(card)?.cards,
                player: player,
                single: true,
              })
            "
            >見る</o-button
          >
          <template v-else>
            <o-button
              v-if="card.isChojigen"
              variant="grey-dark"
              size="small"
              @click.stop="setCardState(card, { faceDown: !card.faceDown })"
              >裏返す</o-button
            >
          </template>
          <o-button
            v-if="card.faceDown && !card.isChojigen"
            variant="grey-dark"
            :size="isPhone() ? 'small' : ''"
            @click.stop="setCardState(card, { faceDown: !card.faceDown })"
            >裏返す</o-button
          >
          <!-- アンタップ or タップ -->
          <template v-else>
            <o-button
              v-if="card.tapped"
              variant="grey-dark"
            :size="isPhone() ? 'small' : ''"
              @click.stop="toggleTap(card)"
              >アンタップ</o-button
            >
            <o-button v-else variant="grey-dark"
              :size="isPhone() ? 'small' : ''"
              @click.stop="toggleTap(card)"
            >タップ</o-button>
          </template>
        </div>
      </div>
      
      <div
        class="card_wrapper card-placeholder-wrapper"
        :style="{width: `${cardWidth}px`, height: `${cardHeight}px`}"
      >
        <div
          class="card in-battle card-placeholder"
        >
        </div>
        <o-button
          v-if="hasSelectedCard()"
          class="battleZoneButton"
          variant="danger"
          rounded
          @click.stop="moveSelectedCard(zone, false)"
        >
          出す
        </o-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isPhone } from "@/helpers/Util"
import CardPopup from '../elements/CardPopup.vue'
import MarkTool from "../mark-tool/MarkTool.vue";
import type { groupableZone, player, side } from "@/entities";
import { Card } from "@/entities/Card";
import { useZone, zoneEmit } from "./zone";
import { useCardGroups } from "./cardGroups";
import TextCard from "../elements/TextCard.vue";

const cardWidth = isPhone() ? 80 : 100
const cardHeight = cardWidth * 908 / 650

const props = withDefaults(defineProps<{
  player: player
  cards: Card[]
  side: side
  zone?: groupableZone
}>(), {
  zone: 'battleCards',
})

const emit = defineEmits<zoneEmit>()

const {
  openWorkSpace,
  setHoveredCard,
  cardIsSelected,
  setMarkColor,
  selectTargetMode,
  selectMode,
  setCardState,
  toggleTap,
  setSelectMode,
  hasSelectedCard,
  moveSelectedCard,
  cardDetail,
} = useZone(props, emit)

const {
  visibleCards,
  getGroup,
} = useCardGroups(props)

function clickCard(card: Card) {
  if (cardIsSelected(card)) {
    // 選択中のカードと同じカードがクリックされた場合、
    // セレクトモードを終了。
    setSelectMode(null);
    return;
  }
  if (!selectTargetMode()) {
    setSelectMode({
      card,
      zone: props.zone,
      player: props.player,
      selectingTarget: true,
    });
    return;
  } else {
    // カードを重ねる。
    // moveSelectedCardでselectModeがnullになるので、情報を残しておく。
    if (selectMode.value) {
      const fromCard = selectMode.value?.card;
      const from = selectMode.value.zone
      setSelectMode(null)
      // moveSelectedCard(props.zone);
      emit("group-card", {
        from,
        to: props.zone,
        fromCard: fromCard,
        toCard: card,
        player: props.player,
      });
      return;
    }
  }
}
</script>

<style lang="scss">
@import "@/assets/scss/mixin.scss";
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
$card-width: 100px;
.battle-zone-wrapper {
  display: flex;
  .battleZoneButton_wrapper {
    margin-left: 20px;
    margin-right: 10px;
    width: 70px;
    height: 50px;
    @media screen and (max-width: 800px) {
      margin-left: 5px;
      width: 50px;
    }
    &.upper {
      align-self: flex-start;
      margin-top: 20px;
    }
    &.lower {
      align-self: flex-end;
      margin-bottom: 20px;
    }
  }
  .battleZoneButton {
    // align-self: flex-end;
    &.o-btn {
      @media screen and (max-width: 800px) {
        // width: 45px;
        // font-size: 12px;
      }
    }
    cursor: pointer;
    &.openZoneButton {
      transform: rotate(45deg);
    }
  }
  .battle-zone {
    // スクロールをしないUIに変更
    display: flex;
    flex-wrap: wrap-reverse; // 上に行を追加していく
    min-height: cardHeight($card-width);
    // overflow-x: scroll;
    max-width: 700px; // 800 - margin-left
    @media screen and (max-width: 800px) {
      margin-left: 20px;
    }
    > * {
      flex-shrink: 0;
      margin: 0 10px 10px 0;
    }
    &.upper {
      flex-wrap: wrap;
      margin-top: 10px;
      // box-shadowが見えるようにするため。
      padding-top: 10px;
      .card {
        transform: rotate(180deg);
        &.tapped {
          // 回転中心が左下の時ちょうど、回転後の位置がx軸方向について中心になる。
          // あとはtranslateXでy座標を調整する。
          transform: rotate(-90deg) translateY(100%);
          transform-origin: left bottom;
        }
      }
    }
    &.lower {
      margin-top: 40px;
      // box-shadowが見えるようにするため。
      padding-bottom: 10px;
      .card.tapped {
        transform: rotate(-90deg) translateY(100%);
        transform-origin: left bottom;
      }
    }
  }
  .card {
    position: relative;
    display: flex;
    img {
      box-sizing: border-box;
    }
    &.is-group img {
      border: lightgray 1px solid;
      border-top-width: 0;
      border-left-width: 0;
      box-shadow: 2px 3px black;
      border-radius: 3px;
    }
    &.is-group .textCard {
      border: lightgray 1px solid;
      border-top-width: 0;
      border-left-width: 0;
      box-shadow: 2px 3px black;
      border-radius: 3px;
    }
    &.is-selectMode {
      img {
        border: 3px solid orange;
        border-radius: 5px;
      }
    }
    &.is-selected {
      img {
        border: 3px solid #b60000;
        border-radius: 5px;
      }
    }
    .cards-num {
      color: #fff;
      position: absolute;
      bottom: 3px;
      right: 5px;
      font-size: 12px;
    }
  }
  .card_wrapper {
    position: relative;
  }
  .card_bottomButton {
    position: absolute;
    z-index: 1;
    left: 50%;
    transform: translateX(-50%) translateY(-100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    > * + * {
      margin-top: 10px;
    }
  }
  .card-placeholder {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(rgba(254, 218, 151, 0.5), rgba(241, 241, 241, 0));
    border-radius: 10px;
  }
  .card-placeholder-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
