<template>
  <div class="shield-zone" :class="side">
    <div
      v-for="(card, index) in countableShieldCards"
      :key="index"
      class="shield"
      :class="{
        'is-selectMode': selectTargetMode(),
        'is-selected': cardIsSelected(card),
      }"
      @click.stop="clickShield(card)"
      @mouseenter="setHoveredCard(card)"
      @mouseleave="setHoveredCard(null)"
    >
      <MarkTool
        :reverse="side === 'upper'"
        :active="cardIsSelected(card)"
        :color="card.markColor"
        @change="setMarkColor(card, $event)"
      >
        <div class="shield-card card">
          <span class="shield-id">{{ card.shieldId }}</span>
          <!-- 裏向きのカードの場合表示されない。 -->
          <img v-if="!card.faceDown" :src="card.imageUrl" />
          <img v-else :src="card.backImageUrl" />
          <div
            v-if="card.groupId && group(card).cardIds.length > 1"
            class="shield-num"
          >
            {{ group(card).cardIds.length }}
          </div>
        </div>
        <div v-if="cardIsSelected(card)" class="card_buttons">
          <o-button
            variant="grey-dark"
            size="small"
            @click.stop="
              openWorkSpace({
                zone: 'shieldCards',
                cards: card.groupId ? group(card).cards : [card],
                player: player,
                single: true,
              })
            "
            >確認</o-button
          >
        </div>
      </MarkTool>
    </div>
  </div>
</template>

<script>
// Dropdownを使うと、スクロールゾーンの中にメニューが表示されて何も見えない問題があった。
import mixin from "@/helpers/mixin";
import MarkTool from "../mark-tool/MarkTool.vue";

export default {
  components: { MarkTool },
  props: ["player", "shieldCards", "shieldCardGroups", "side"],
  mixins: [mixin.zone],
  data() {
    return {
      zone: "shieldCards",
      groupZone: "shieldCardGroups",
    };
  },
  computed: {
    countableShieldCards() {
      // グループ化されているカードは一つとカウントする。
      const firstCardIds = this.shieldCardGroups.map((g) => g.cardIds[0]);
      return this.shieldCards.filter((c) => {
        return !c.groupId || firstCardIds.includes(c.id);
      });
    },
  },
  methods: {
    // リレーション
    group(card) {
      if (!card.groupId) {
        return null;
      }
      const group = {
        ...this.shieldCardGroups.find((g) => g.id === card.groupId),
      };
      group.cards = this.shieldCards.filter((c) => c.groupId === group.id);
      return group;
    },
    clickShield(card) {
      if (this.cardIsSelected(card)) {
        // 選択中のカードと同じカードがクリックされた場合、
        // セレクトモードを終了。
        this.setSelectMode(null);
        return;
      }
      if (this.selectTargetMode()) {
        if (this.selectMode.player === this.player) {
          // カードを重ねる。
          // moveSelectedCardでselectModeがnullになるので、情報を残しておく。
          const fromCard = this.selectMode.card;
          this.moveSelectedCard(this.zone);
          this.$emit("group-card", {
            from: this.zone,
            to: this.groupZone,
            fromCard: fromCard,
            toCard: card,
            player: this.player,
          });
        }
        return;
      }
      this.setSelectMode({
        card,
        zone: "shieldCards",
        player: this.player,
      });
    },
  },
};
</script>

<style lang="scss">
@function cardHeight($value) {
  @return calc($value * 908 / 650);
}
.shield-zone {
  background-color: rgb(79, 205, 255);
  width: 275px;
  height: cardHeight(50px) + 8px;
  display: flex;
  flex-direction: row-reverse;
  position: relative;
  overflow-x: scroll;
  margin-right: 8px;
  &::-webkit-scrollbar {
    // 下のスクロールバーの幅だけスクロール可能になっているので消す。
    width: 0px;
  }
  > * {
    margin-right: 2px;
  }
  &.upper {
    flex-direction: row;
    margin-left: 8px;
    .shield-card {
      transform: rotate(180deg);
    }
  }
  .shield {
    position: relative;
    &.is-selectMode {
      .card::before {
        content: "";
        display: block;
        width: 100%;
        height: 100%;
        border: 3px solid orange;
        position: absolute;
        top: 0;
      }
    }
    &.is-selected {
      .card::before {
        content: "";
        display: block;
        width: 100%;
        height: 100%;
        border: 3px solid #b60000;
        position: absolute;
        top: 0;
      }
    }
  }
  .shield-num {
    color: #fff;
    position: absolute;
    bottom: 3px;
    right: 5px;
    font-size: 10px;
  }
  .shield-reverse {
    display: block;
    width: 50px;
    height: cardHeight(50px);
  }
  .card_buttons {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 0%);
  }
}
</style>
