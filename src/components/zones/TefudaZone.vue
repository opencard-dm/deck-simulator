<template>
  <div class="tefuda-zone-wrapper" :class="side" :style="{height: tefudaHeight}">
    <div class="tefuda-zone" :class="side">
      <div
        class="card_wrapper"
        :style="{width: `${cardWidth}px`, height: `${cardHeight}px`}"
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

      <div v-if="side === 'lower'" class="card_wrapper card-placeholder-wrapper" :style="{height: `${cardHeight}px`}">
        <div
          class="card"
          style="cursor: pointer;"
          @click="clickPlaceholderCard()" 
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

<script setup>
import CardPopup from '../elements/CardPopup.vue'
import { isPhone } from '@/helpers/Util'
import { Layout } from '@/helpers/layout'
const cardWidth = 70
const cardHeight = cardWidth * 908 / 650
const tefudaHeight = Layout.tefudaHeight(cardWidth) ?
  `${Layout.tefudaHeight(cardWidth)}px` : false
</script>

<script>
import mixin from "@/helpers/mixin";

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
      if (this.workSpace.active) {
        this.closeWorkSpace()
      }
      // すでに選択済みのカードであれば、選択解除
      if (this.selectMode && this.selectMode.card.id === card.id) {
        this.setSelectMode(null);
        return;
      }
      // カードのプレビューが開いていた場合、表示するカードを切り替える
      if (!card.faceDown && this.$store.state.displayImageUrl) {
        this.$store.commit('setDisplayImageUrl', card.imageUrl)
      }
      // 選択する
      this.setSelectMode({
        player: this.player,
        card,
        zone: this.zone,
      });
    },
    clickPlaceholderCard() {
      if (this.selectMode && this.selectMode.zone !== this.zone) {
        this.moveSelectedCard(this.zone, false)
      } else {
        this.$emit('drawOne');
      }
    },
  },
};
</script>

<style lang="scss">
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
$card-width: 70px;

.tefuda-zone-wrapper {
  @media screen and (max-device-width: 800px) {
    position: fixed;
    bottom: 0px;
    width: 100%;
    overflow-y: scroll;
  }
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
    @media screen and (max-device-width: 800px) {
      margin-left: 10px;
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
    &.upper {
      overflow-x: auto;
    }
    .card_wrapper {
      position: relative;
    }
    .card {
      position: relative;
      margin-right: 5px;
      img {
        box-sizing: border-box;
      }
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
