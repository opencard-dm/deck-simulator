<template>
  <ODropdown
    class="deckZone_wrapper"
    :triggers="dropdownTriggers"
    position="top-left"
  >
    <template v-slot:trigger>
      <div class="deck_zone" :class="side">
        <div
          class="deck_card"
          v-for="i in deckViews"
          :key="i"
          :style="{ top: `${(i - 1) * -2}px`, left: `${(i - 1) * -2}px` }"
        ></div>
        <div
          class="deck_topImg"
          v-if="yamafudaCards.length > 0"
          :class="[{ is_selected: cardIsSelected(yamafudaCards[0]) }]"
          alt
          :style="{
            top: `${deckViews.length * -2}px`,
            left: `${deckViews.length * -2}px`,
          }"
        >
          <img
            v-if="yamafudaCards[0].faceDown"
            :src="yamafudaCards[0].backImageUrl"
            alt=""
          />
          <img v-else :src="yamafudaCards[0].imageUrl" alt="" />
        </div>
        <div v-if="hasSelectedCard()" class="deck_buttons">
          <o-button
            variant="grey-dark"
            size="small"
            @click.stop="moveSelectedCard(zone, true)"
            >上へ</o-button
          >
          <o-button
            variant="grey-dark"
            size="small"
            @click.stop="moveSelectedCard(zone, false)"
            >下へ</o-button
          >
        </div>
      </div>
    </template>
    <template v-if="yamafudaCards.length > 0">
      <o-dropdown-item aria-role="listitem" @click="openDeck"
        >山札を確認</o-dropdown-item
      >
      <o-dropdown-item
        aria-role="listitem"
        @click="
          setSelectMode({
            zone: 'yamafudaCards',
            card: yamafudaCards[0],
            player,
            selectingTarget: true,
          })
        "
        >山札の上から一枚目を</o-dropdown-item
      >
      <o-dropdown-item
        aria-role="listitem"
        @click="moveCard('yamafudaCards', 'tefudaCards', yamafudaCards[0])"
        >ドロー</o-dropdown-item
      >
    </template>
  </ODropdown>
</template>

<script>
import mixin from "@/helpers/mixin.js";

export default {
  props: ["player", "yamafudaCards", "side"],
  mixins: [mixin.zone],
  data() {
    return {
      zone: "yamafudaCards",
    };
  },
  computed: {
    dropdownTriggers() {
      if (window.innerWidth >= 800 && !this.hasSelectedCard()) {
        return ['click', 'hover']
      }
      return ['click']
    },
    deckViews() {
      // 1~nまでの数字を順に要素とする配列を返す。
      // デッキの下に重なっているカード要素の数を
      // deckViewsLengthとする。
      const l = this.yamafudaCards.length;
      let deckViewsLength = 0;
      if (l >= 20) {
        deckViewsLength = 4;
      } else if (l >= 15) {
        deckViewsLength = 3;
      } else if (l >= 2) {
        deckViewsLength = 2;
        // } else if (l >= 2) {
        //   deckViewsLength = 1
        // deckViewが一枚だけだと見た目が良くなかったため飛ばして0にする。
      } else {
        deckViewsLength = 0;
      }
      const deckViews = [];
      for (let i = 0; i < deckViewsLength; i++) {
        deckViews.push(i + 1);
      }
      return deckViews;
    },
  },
  methods: {
    // デッキを開くときはデフォルトで全て裏にする。
    openDeck() {
      this.yamafudaCards.forEach((c) => {
        c.faceDown = true;
      });
      this.openWorkSpace({
        zone: "yamafudaCards",
        cards: this.yamafudaCards,
        player: this.player,
      });
    },
    drawOne() {
      this.moveCard(this.zone, 'tefudaCards', this.yamafudaCards[0])
    }
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/mixin.scss";
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
$card-width: 50px;
// コンポーネントに移動
.deck_zone {
  &.upper {
    transform: rotate(180deg);
    .deck_buttons {
      transform: rotate(180deg);
    }
  }
  width: $card-width;
  height: cardHeight($card-width);
  display: flex;
  position: relative;
  .deck_topImg {
    position: absolute;
    width: $card-width;
    height: cardHeight($card-width);
    border-radius: 2px;
    &.is_selected {
      img {
        border: 1px solid red;
        border-radius: 5px;
      }
    }
    img {
      border-radius: 2px;
      width: $card-width;
      height: cardHeight($card-width);
    }
  }
  .deck_card {
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: black;
    border: 1px solid white;
    border-radius: 2px;
  }
  .deck_buttons {
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: center;
    > * + * {
      margin-top: 8px;
    }
  }
}
.deckZone_wrapper {
  .o-drop__menu {
    bottom: 30px;
  }
}
</style>
