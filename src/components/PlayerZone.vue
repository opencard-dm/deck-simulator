<template>
  <div class="player-zone-wrapper">
    <div class="player-zone" :class="side">
      <div class="player-counter" :class="side">
        <RoundButton :style="{background: 'blue', color: 'beige'}" @click.stop="clickShieldButton">
          <div v-if="hasSelectedCard()" :style="{fontSize: '10px'}">
            シールドへ
          </div>
          <template v-else>
            <div :style="{fontSize: '10px'}">シールド</div>
            <div :style="{fontSize: '16px'}">
              {{ countableShieldCards.length }}
            </div>
          </template>
        </RoundButton>
      </div>
      <div class="shield-wrapper" :class="side">
        <!-- シールドゾーン -->
        <slot name="shield-zone"></slot>
        <!-- デッキゾーン -->
        <slot name="deck-zone"></slot>
        <!-- 墓地 -->
        <div class="bochi" @click.stop="clickBochi">
          <div
            v-if="selectMode && selectMode.player === player"
            class="bochi_text"
          >
            墓地へ
          </div>
          <img
            v-else-if="lastCard(bochiCards)"
            :src="lastCard(bochiCards).imageUrl"
            @mouseenter="setHoveredCard(lastCard(bochiCards))"
            @mouseleave="setHoveredCard(null)"
          />
        </div>
        <!-- 超次元ゾーン -->
        <slot name="chojigenZone"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import mixin from "@/helpers/mixin.js";
import RoundButton from './elements/RoundButton'

export default {
  props: ["player", "bochiCards", "shieldCards", "shieldCardGroups", "side"],
  mixins: [mixin.zone],
  components: {RoundButton},
  computed: {
    countableShieldCards() {
      // グループ化されているカードは一つとカウントする。
      const firstCardIds = this.shieldCardGroups.map((g) => g.cardIds[0]);
      return this.shieldCards.filter((c) => {
        return !c.groupId || firstCardIds.includes(c.id);
      });
    },
    dropdownTriggers() {
      return this.$store.state.settings.dropdownTriggers;
    },
  },
  methods: {
    lastCard: function (cards) {
      const length = cards.length;
      if (length && 0 < length) {
        return cards[length - 1];
      }
      return null;
    },
    clickBochi() {
      if (!this.selectMode) {
        this.openWorkSpace({
          zone: "bochiCards",
          cards: this.bochiCards,
          player: this.player,
        });
        return;
      }
      this.moveSelectedCard("bochiCards");
    },
    clickShieldButton() {
      if (this.hasSelectedCard()) {
        this.selectMode.card.faceDown = true;
        this.moveSelectedCard("shieldCards");
        return;
      }
      this.openWorkSpace({
        zone: "shieldCards",
        cards: this.shieldCards,
        player: this.player,
      });
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
.player-zone-wrapper {
  .player-zone {
    // background-color: blue;
    display: flex;
    width: 430px;
    > * {
      align-self: center;
    }
    margin-left: 20px;
    @media screen and (max-device-width: 800px) {
      margin-left: 5px;
    }
    &.upper {
      margin-top: 20px;
    }
    &.lower {
      margin-top: 10px;
    }
  }
  .shield-wrapper {
    margin-left: 10px;
    display: flex;
    align-items: center;
    width: 430px;
    &.upper {
      flex-direction: row-reverse;
      .bochi {
        margin-right: 5px;
        transform: rotate(180deg);
      }
      .bochi_text {
        transform: rotate(180deg);
      }
    }
    &.lower {
      .bochi {
        margin-left: 5px;
      }
    }
    .bochi {
      display: flex;
      justify-content: center;
      align-items: center;
      color: lightgray;
      &_text {
        text-align: center;
      }
    }
    > * {
      align-self: center;
    }
  }
  .player-zone img {
    width: 50px;
  }

  .player-zone .bochi {
    position: relative;
    text-align: center;
    width: 60px;
    height: cardHeight(50px);

    background-color: purple;
    background-size: cover;
    cursor: pointer;
    img {
    }
  }
}
</style>
