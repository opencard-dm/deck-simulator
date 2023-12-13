<template>
  <div class="tefuda-zone-wrapper" :class="side">
    <div class="tefuda-zone" :class="side">
      <div
        class="card_wrapper"
        v-for="(card, index) in tefudaCards"
        :key="index"
        @mouseenter="setHoveredCard(card)"
        @mouseleave="setHoveredCard(null)"
      >
        <div
          class="card"
          :class="[
            { 'is-selected': selectMode && selectMode.card.id === card.id },
          ]"
        >
          <!-- 対戦相手の手札は常に裏向き -->
          <div v-if="side === 'upper'">
            <img :src="card.backImageUrl" @click.stop="clickCard(card)" />
          </div>
          <div v-else @click.stop="clickCard(card)">
            <img v-if="card.faceDown" :src="card.backImageUrl" />
            <img v-else :src="card.imageUrl" />
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

      <div
        v-if="side === 'lower'"
        class="card_wrapper"
      >
        <div
          class="card"
          style="opacity: 0.2;cursor: pointer;"
        >
          <div>
            <img src="/images/card-back.jpg" @click="drawOne()" />
          </div>
        </div>
        <div class="card_bottomButton" style="top: 50%;">
          <o-button
            variant="grey-dark"
            style="opacity: 0.6;"
            size="small"
            >ドロー</o-button
          >
        </div>
      </div>

      <div v-if="side == 'lower'" class="tefudaZoneButton_wrapper">
        <o-icon
          v-if="!selectMode"
          class="openZoneButton"
          :class="side"
          pack="fas"
          size="large"
          icon="arrow-circle-up"
          variant="info"
          @click.stop="
            openWorkSpace({
              zone,
              cards,
              player,
            })
          "
        ></o-icon>
        <o-button
          v-else
          class="tefudaZoneButton"
          variant="info"
          rounded
          @click.stop="moveSelectedCard(zone, true)"
        >
          手札へ
        </o-button>
      </div>
    </div>
  </div>
</template>

<script>
import mixin from "@/helpers/mixin.js";

export default {
  props: ["player", "tefudaCards", "side"],
  mixins: [mixin.zone],
  emits: ['drawOne'],
  data() {
    return {
      zone: "tefudaCards",
    };
  },
  computed: {
    cards() {
      return this.tefudaCards;
    },
  },
  methods: {
    clickCard(card) {
      // すでに選択済みのカードであれば、選択解除
      if (this.selectMode && this.selectMode.card.id === card.id) {
        this.setSelectMode(null);
        return;
      }
      // 選択する
      this.setSelectMode({
        player: this.player,
        card,
        zone: this.zone,
      });
    },
    drawOne() {
      this.$emit('drawOne');
    }
  },
};
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
      height: cardHeight($card-width);
    }
  }
  &.upper {
    // マナゾーンがはみ出た時、手札が上になるようにする。
    z-index: 1;
    position: relative;
    margin-left: 100px;
    .card {
      transform: rotate(180deg);
    }
  }
  &.lower {
    margin-top: 20px;
    margin-left: 100px;
    .tefuda-zone {
      display: flex;
      flex-wrap: wrap;
      > * {
        margin-right: 5px;
        margin-top: 5px;
      }
    }
  }
  img {
    width: $card-width;
  }
  .tefuda-zone {
    height: 100%;
    display: flex;
    max-width: 410px;
    &.upper {
      overflow-x: auto;
    }
    .card_wrapper {
      position: relative;
    }
    .card {
      position: relative;
      margin-right: 5px;
      &.is-selected {
        img {
          border: 3px solid #b60000;
          border-radius: 5px;
        }
      }
      &_bottomButton {
        position: absolute;
        left: 0;
        bottom: 0;
        width: $card-width;
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
  }
}
// layout
.tefuda-zone-wrapper.upper {
  // position: absolute;
  // top: 5px;
  // right: 0px;
}
</style>
