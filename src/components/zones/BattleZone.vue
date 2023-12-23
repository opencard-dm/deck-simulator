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
        @mouseenter="setHoveredCard(card)"
        @mouseleave="setHoveredCard(null)"
        :style="{width: `${cardWidth}px`, height: `${cardHeight}px`}"
      >
        <MarkTool
          :reverse="side === 'upper'"
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
              :src="card.backImageUrl"
              :width="cardWidth"
              draggable="false"
            />
            <CardPopup v-else :url="card.imageUrl">
              <img :src="card.imageUrl" draggable="false" :width="cardWidth" />
            </CardPopup>
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
                cards: card.groupId ? getGroup(card)?.cards : [card],
                player: player,
                single: true,
              })
            "
            >見る</o-button
          >
          <template v-else>
            <o-button
              v-if="selectTargetMode() && selectMode?.card.id === card.id"
              variant="grey-dark"
              size="small"
              @click.stop="clickCard(card)"
              >キャンセル</o-button
            >
            <template v-else>
              <o-button
                v-if="card.isChojigen"
                variant="grey-dark"
                size="small"
                @click.stop="setCardState(card, { faceDown: !card.faceDown })"
                >裏返す</o-button
              >
              <o-button
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
            </template>
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
    @media screen and (max-device-width: 800px) {
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
      @media screen and (max-device-width: 800px) {
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
    @media screen and (max-device-width: 800px) {
      margin-left: 20px;
    }
    > * {
      flex-shrink: 0;
      margin: 0 10px 10px 0;
    }
    &.upper {
      margin-top: 10px;
      // box-shadowが見えるようにするため。
      padding-top: 10px;
      .card {
        transform: rotate(180deg);
        &.tapped {
          // 回転中心が左下の時ちょうど、回転後の位置がx軸方向について中心になる。
          // あとはtranslateXでy座標を調整する。
          transform: rotate(90deg) translateX(-100%);
          transform-origin: left bottom;
        }
      }
    }
    &.lower {
      margin-top: 40px;
      // box-shadowが見えるようにするため。
      padding-bottom: 10px;
      .card.tapped {
        transform: rotate(-90deg) translateX(100%);
        transform-origin: right bottom;
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
  }
  .card_wrapper {
    position: relative;
  }
  .card_bottomButton {
    position: absolute;
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
    background: radial-gradient(rgb(254, 218, 151), rgb(241, 241, 241));
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
