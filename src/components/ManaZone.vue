<template>
  <div class="manaZone_wrapper">
    <div class="manaZone" :class="side">
      <div class="manaButton" @click.stop="clickManaButton">
        <template v-if="hasSelectedCard()">
          <template v-if="selectMode.zone !== 'manaCards'">
            <p class="fs-12">チャージ</p>
          </template>
          <template v-else-if="selectMode.card.tapped">
            <p class="fs-10">全て</p>
            <p class="fs-12">アンタップ</p>
          </template>
        </template>
        <template v-else>
          <p class="fs-10">マナ</p>
          <p>{{ countNormal }}/{{ manaCards.length }}</p>
        </template>
      </div>
      <div class="manaZone_cont" :class="side">
        <div class="manaZone_cardList manaZone_cardList__tapped">
          <div
            class="card_wrapper"
            v-for="(card, index) in tappedCards"
            :key="index"
            @mouseenter="setHoveredCard(card)"
            @mouseleave="setHoveredCard(null)"
          >
            <div
              class="card"
              :class="{ 'is-selected': cardIsSelected(card) }"
              @click.stop="clickCard(card)"
            >
              <img v-if="!card.faceDown" :src="card.imageUrl" />
              <img v-else src="card.backImageUrl" />
            </div>
            <div v-if="cardIsSelected(card)" class="card_bottomButton">
              <o-button
                variant="grey-dark"
                @click.stop="toggleTap(card)"
                size="small"
                >アンタップ</o-button
              >
            </div>
          </div>
        </div>
        <div class="manaZone_cardList normal">
          <div
            class="card_wrapper"
            v-for="(card, index) in normalCards"
            :key="index"
            @mouseenter="setHoveredCard(card)"
            @mouseleave="setHoveredCard(null)"
          >
            <div
              class="card"
              :class="{ 'is-selected': cardIsSelected(card) }"
              @click.stop="clickCard(card)"
            >
              <img v-if="!card.faceDown" :src="card.imageUrl" />
              <img v-else :src="card.backImageUrl" />
            </div>
            <div v-if="cardIsSelected(card)" class="card_bottomButton">
              <o-button
                variant="grey-dark"
                @click.stop="toggleTap(card)"
                size="small"
                >タップ</o-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mixin from "@/helpers/mixin.js";

export default {
  props: ["player", "manaCards", "side"],
  mixins: [mixin.zone],
  data() {
    return {
      zone: "manaCards",
    };
  },
  computed: {
    normalCards() {
      return this.manaCards.filter((card) => {
        return card.tapped !== true;
      });
    },
    tappedCards() {
      return this.manaCards.filter((card) => {
        return card.tapped === true;
      });
    },
    countNormal() {
      return this.normalCards.length;
    },
  },
  methods: {
    clickManaButton() {
      if (this.hasSelectedCard()) {
        if (this.selectMode.zone !== "manaCards") {
          this.moveSelectedCard(this.zone);
          return;
        }
        if (this.selectMode.card.tapped) {
          this.manaCards.forEach((c) => {
            c.tapped = false;
          });
          this.setSelectMode(null);
          this.emitState();
          return;
        }
      }
      this.openWorkSpace({
        zone: "manaCards",
        cards: this.manaCards,
        player: this.player,
      });
    },
    clickCard(card) {
      if (this.cardIsSelected(card)) {
        // 選択中のカードと同じカードがクリックされた場合、
        // セレクトモードを終了。
        this.setSelectMode(null);
        return;
      }
      this.setSelectMode({
        card,
        zone: "manaCards",
        player: this.player,
      });
      return;
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/mixin.scss";
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
$card-width: 50px;
$card-margin: -35px;

.manaZone {
  display: flex;
  margin-left: 20px;
  align-items: center;
  &.upper {
    padding-top: 20px;
    .card_bottomButton {
      transform: rotate(180deg) translateX(50%);
    }
  }
  &.lower {
    margin-top: 20px;
  }
  .card {
    transform: rotate(180deg);
    &_wrapper {
      position: relative;
    }
    &.is-selected {
      img {
        border: 2px solid #b60000;
      }
    }
    &_bottomButton {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 0;
      z-index: 2;
    }
  }
  img {
    width: $card-width;
  }
  &_cont {
    width: 390px;
    height: cardHeight($card-width);
    position: relative;
    display: flex;
    &.upper {
      transform: rotate(180deg);
      margin-left: 10px;
    }
    > * {
      width: calc(50% + $card-margin);
    }
    > *:first-child {
      margin-left: calc((-1) * $card-margin);
    }
    > *:last-child {
      margin-left: auto;
    }
  }
  &_cardList {
    height: 100%;
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: wrap;
    &__tapped {
      opacity: 0.6;
    }
    > * {
      margin-left: calc($card-margin);
    }
  }
}

.manaButton {
  cursor: pointer;
  background-color: green;
  border-radius: 50%;
  height: 50px;
  width: 70px;
  color: beige;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .fs-10 {
    font-size: 10px;
  }
  .fs-12 {
    font-size: 12px;
  }
}
</style>
