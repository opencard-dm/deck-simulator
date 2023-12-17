<template>
  <div id="app" style="background-color: lightgray" v-if="isMounted">
    <CHeader @reset-game="resetGame" :single="single"></CHeader>
    <div class="app-wrapper main">
      <ImageViewer>
        <WorkSpace
          :lowerPlayer="lowerPlayer"
          @move-cards="moveCards"
          @shuffle-cards="shuffleCards"
          @emit-room-state="emitRoomState"
        ></WorkSpace>

        <DeckSelector
          v-if="!loading && !single"
          v-model:active="deckSelectorActive"
          :player="lowerPlayer"
          :isReady="players[lowerPlayer].isReady"
          :partnerIsReady="players[upperPlayer].isReady"
          @moveCards="moveCards"
          @selected="onDeckSelected"
        ></DeckSelector>

        <div id="js_gameBoard" class="gameBoard" :style="{
          opacity: $store.state.workSpace.active ? 0.3 : 1,
          height: playerZoneHeight,
        }">
          <template v-if="!single">
            <PlayerUpper
              :player="upperPlayer"
              :cards="players[upperPlayer].cards"
              :name="players[upperPlayer].name"
              :roomId="players[upperPlayer].roomId"
              :isReady="players[upperPlayer].isReady"
              :hasChojigen="players[upperPlayer].hasChojigen"
              @move-cards="moveCards"
              @group-card="groupCard"
              @emit-room-state="emitRoomState"
            ></PlayerUpper>
          </template>

          <!-- <MessageBox :upper-player="upperPlayer"
            :lower-player="lowerPlayer"
          ></MessageBox>-->

          <!-- center -->
          <!-- <MessageButtons :player="lowerPlayer"></MessageButtons> -->
          <PlayerLower
            :player="lowerPlayer"
            :cards="players[lowerPlayer].cards"
            :name="players[lowerPlayer].name"
            :roomId="players[lowerPlayer].roomId"
            :isReady="players[lowerPlayer].isReady"
            :hasChojigen="players[lowerPlayer].hasChojigen"
            @move-cards="moveCards"
            @group-card="groupCard"
            @emit-room-state="emitRoomState"
          ></PlayerLower>
        </div>
      </ImageViewer>
    </div>
  </div>
</template>

<script setup>
import { Layout } from '@/helpers/layout'
import { isPhone } from '@/helpers/Util'
import { onMounted, ref } from 'vue';
import CHeader from "./CHeader.vue";
import WorkSpace from "./WorkSpace.vue";
import ImageViewer from "./ImageViewer.vue";
import DeckSelector from "./DeckSelector.vue";
import PlayerLower from './PlayerLower.vue';
import PlayerUpper from './PlayerUpper.vue';

const playerZoneHeight = isPhone() ? `${Layout.playerZoneHeight(70)}px` : false
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
</script>

<script>
import { Deck } from "@/helpers/Deck";
import { Util } from "@/helpers/Util";
import { SocketUtil } from '../helpers/socket';

function initialData({ roomId }) {
  return {
    players: {
      a: {
        cards: {
          manaCards: [],
          battleCards: [],
          bochiCards: [],
          shieldCards: [],
          tefudaCards: [],
          yamafudaCards: [],
          chojigenCards: [],
          // cardGroups
          battleCardGroups: [],
          shieldCardGroups: [],
        },
        name: "a",
        roomId: roomId,
        isReady: false,
        hasChojigen: false,
      },
      b: {
        cards: {
          manaCards: [],
          battleCards: [],
          bochiCards: [],
          shieldCards: [],
          tefudaCards: [],
          yamafudaCards: [],
          chojigenCards: [],
          // cardGroups
          battleCardGroups: [],
          shieldCardGroups: [],
        },
        name: "b",
        roomId: roomId,
        isReady: false,
        hasChojigen: false,
      },
    },
    deckSelectorActive: false,
  };
}

export default {
  props: ["upperPlayer", "lowerPlayer", "room", "loading", "deck", "single"],
  data() {
    const data = initialData({
      roomId: this.$route.query.roomId,
    });
    return data;
  },
  watch: {
    loading: function (newVal, oldVal) {
      if (newVal === false) {
        this.setRoomState()
      }
    }
  },
  computed: {
    roomId() {
      return this.$route.query.roomId;
    },
  },
  methods: {
    onDeckSelected({deck, player}) {
      this.players[player].isReady = true
      this.players[player].hasChojigen = !!deck.hasChojigen
    },
    groupCard({ from, to, fromCard, toCard, player }) {
      // 情報をカードに追加
      // card.groupはできれば使いたくない。moveCards内でのみ使用。
      fromCard.group = to;
      toCard.group = to;
      if (toCard.groupId) {
        // ターゲットのカードが既にグループ化されていた場合、
        // 既存のグループに追加する。
        const group = this.players[player]["cards"][to].find(
          (g) => g.id === toCard.groupId
        );
        group.cardIds.unshift(fromCard.id);
        fromCard.groupId = toCard.groupId;
      } else {
        // 新しくグループを作成する。
        // TODO: 被らない文字列にする。
        const groupId = `${toCard.id}-${fromCard.id}`;
        this.players[player]["cards"][to].push({
          id: groupId,
          cardIds: [fromCard.id, toCard.id],
        });
        fromCard.groupId = groupId;
        toCard.groupId = groupId;
      }
      // 並べ替え
      if (["battleCardGroups", "shieldCardGroups"].includes(to)) {
        // fromCardをtoCardの前に移す。
        Util.arrayInsertBefore(
          this.players[player]["cards"][from],
          toCard,
          fromCard
        );
      }
      // 状態の変更を送信する
      if (!SocketUtil.socket) return;
      SocketUtil.socket.emit("cards-moved", this.players[player]);
    },
    // groupNameはbattleCardGroupsかshieldCardGroups
    ungroupCard({ groupName, card, player, zone }) {
      // シールドのグループの場合はカードの行き先がわからず、注意が必要。
      const groupIndex = this.players[player]["cards"][groupName].findIndex(
        (g) => g.id === card.groupId
      );
      const group = this.players[player]["cards"][groupName].find(
        (g) => g.id === card.groupId
      );
      this.players[player]["cards"][groupName][groupIndex].cardIds.splice(
        group.cardIds.findIndex((id) => id === card.id),
        1
      );
      // カードが一枚だけのグループは消す。
      if (group.cardIds.length === 1) {
        const lastCardIndex = this.players[player]["cards"][zone].findIndex(
          (c) => c.id === group.cardIds[0]
        );
        if (lastCardIndex) {
          const lastCard = this.players[player]["cards"][zone][lastCardIndex];
          this.ungroupCard({
            groupName,
            card: lastCard,
            player,
            zone,
          });
        }
      }
      // cardIdsが0になったグループは自動で消す。
      if (group.cardIds.length === 0) {
        this.players[player]["cards"][groupName].splice(groupIndex, 1);
      }
      card.groupId = null;
      card.group = null;
    },
    moveCard: function (from, to, card, player, prepend = false) {
      // GRゾーン, 超次元ゾーンを考えると、一枚ずつの方が、処理しやすい
      this.moveCards(from, to, [card], player, prepend);
    },
    moveCards: function (from, to, selectedCards, player, prepend = false) {
      if (!selectedCards || selectedCards.length === 0) return;
      if (this.$store.state.displayImageUrl) {
        this.$store.commit('setDisplayImageUrl', '')
      }
      // 先頭のカードがグループに属していた場合、そのグループから抜ける。
      const card = selectedCards[0];
      if (card.groupId) {
        this.ungroupCard({
          zone: from,
          groupName: card.group,
          card,
          player,
        });
      }
      // 手札、マナ、墓地へ行く場合は表向きにする。
      if (
        ["tefudaCards", "manaCards", "bochiCards"].includes(to) &&
        to !== from
      ) {
        selectedCards.forEach((card) => {
          card.faceDown = false;
        });
      }
      // 山札へ行くときは裏向きにする。
      if (["yamafudaCards"].includes(to) && to !== from) {
        selectedCards.forEach((card) => {
          card.faceDown = true;
        });
      }
      // 違うゾーンへ移動するときはタップとマークを解除する。
      if (to !== from) {
        selectedCards.forEach((card) => {
          card.markColor = "";
          card.tapped = false;
        });
      }
      this.players[player]["cards"][from] = Util.arrayRemoveCards(
        this.players[player]["cards"][from],
        selectedCards
      );
      if (prepend) {
        this.players[player]["cards"][to] = Util.arrayPrependCards(
          this.players[player]["cards"][to],
          selectedCards
        );
      } else {
        this.players[player]["cards"][to] = Util.arrayAppendCards(
          this.players[player]["cards"][to],
          selectedCards
        );
      }
      // 少し待てば、レンダリングが完了しているため、うまくいった。
      if (to === "tefudaCards") {
        setTimeout(() => {
          this.scrollZone(
            ".tefuda-zone." + (player === this.upperPlayer ? "upper" : "lower"),
            "left"
          );
        }, 300);
      }
      if (this.single) {
        sessionStorage.setItem('room', JSON.stringify(this.players))
        return
      }
      if (!SocketUtil.socket) return;
      this.players[player].isReady = true;
      SocketUtil.socket.emit("cards-moved", this.players[player]);
    },
    emitRoomState() {
      if (SocketUtil.socket) {
        // 今のところバトルゾーンとマナゾーンのタップ状態を送信するために使用。
        SocketUtil.socket.emit("cards-moved", this.players[this.lowerPlayer]);
        // SocketUtil.socket.emit("cards-moved", this.players[this.upperPlayer])
      }
    },
    shuffleCards(from, cards, player) {
      this.players[player]["cards"][from] = Deck.shuffle(cards);
      const shuffleMessage = {
        shieldCards: "シールド",
        yamafudaCards: "山札",
        tefudaCards: "手札",
      };
      this.setMessage(shuffleMessage[from] + "をシャッフル", player);
    },
    scrollZone(targetSelector, direction) {
      const target = document.querySelector(targetSelector);
      target.scrollTo({
        behavior: "smooth",
        [direction]: target.scrollWidth,
      });
    },
    setMessage() {
      //
    },
    setRoomState() {
      if (this.single) {
        const sessionRoom = sessionStorage.getItem('room')
        if (sessionRoom) {
          this.players = JSON.parse(sessionRoom)
          return
        }
        const shieldCards = this.deck.cards.slice(0, 5);
        shieldCards.forEach((c) => {
          c.faceDown = true;
        });
        this.players.a.cards.shieldCards = shieldCards
        this.players.a.cards.tefudaCards = this.deck.cards.slice(5, 10)
        // 40枚の制限をしない
        const yamafudaCards = this.deck.cards.slice(10);
        yamafudaCards.forEach((c) => {
          c.faceDown = true;
        });
        this.players.a.cards.yamafudaCards = yamafudaCards
        this.players.a.cards.chojigenCards = this.deck.chojigenCards || []
        this.players.a.hasChojigen = this.deck.hasChojigen
        this.onDeckSelected({ 
          deck: this.deck, 
          player: 'a' 
        })
        this.deckSelectorActive = false;
        return
      }
      if (this.room.a) {
        this.players.a = this.room.a;
      }
      if (this.room.b) {
        this.players.b = this.room.b;
      }
      // 片方がデッキ未選択であれば、モーダルを表示する。
      if (!this.players.a.isReady || !this.players.b.isReady) {
        this.deckSelectorActive = true;
      } else {
        this.deckSelectorActive = false;
      }
      if (SocketUtil.socket) {
        //
        // イベントをリッスン
        SocketUtil.socket.on("cards-moved", (playerData) => {
          this.players[playerData.name] = playerData;
        });
        SocketUtil.socket.on(
          "set-message",
          function (data) {
            // this.message[data.player] = data.message;
            this.expireMessage(data.message, data.player);
          }.bind(this)
        );
      }
    },
    resetGame() {
      this.players = initialData({ roomId: this.roomId }).players;
      window.scrollTo({
        top: 0,
        // behavior: "smooth",
      });
      this.deckSelectorActive = true;
      // 状態の変更を送信する
      if (!SocketUtil.socket) return;
      SocketUtil.socket.emit("cards-moved", this.players.a);
      SocketUtil.socket.emit("cards-moved", this.players.b);
    },
  },
  async mounted() {
    // デバッグのために公開
    window.$room = this;
  },
};
</script>
