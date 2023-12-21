import { reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';

import { Util } from '@/helpers/Util';
import { SocketUtil } from '../helpers/socket';
import { useRoute } from 'vue-router';

export function useRoomSetup(props) {
  const route = useRoute();
  const store = useStore();
  const roomId = route.query.roomId
  const players = reactive(initialData({ roomId }).players);
  const deckSelectorActive = ref(true);

  function moveCards(from, to, selectedCards, player, prepend = false) {
    if (!selectedCards || selectedCards.length === 0) return;
    if (store.state.displayImageUrl) {
      store.commit('setDisplayImageUrl', '');
    }
    // 先頭のカードがグループに属していた場合、そのグループから抜ける。
    const card = selectedCards[0];
    if (card.groupId) {
      ungroupCard({
        zone: from,
        groupName: card.group,
        card,
        player,
      });
    }
    // 手札、マナ、墓地へ行く場合は表向きにする。
    if (
      ['tefudaCards', 'manaCards', 'bochiCards'].includes(to) &&
      to !== from
    ) {
      selectedCards.forEach((card) => {
        card.faceDown = false;
      });
    }
    // 山札へ行くときは裏向きにする。
    if (['yamafudaCards'].includes(to) && to !== from) {
      selectedCards.forEach((card) => {
        card.faceDown = true;
      });
    }
    // 違うゾーンへ移動するときはタップとマークを解除する。
    if (to !== from) {
      selectedCards.forEach((card) => {
        card.markColor = '';
        card.tapped = false;
      });
    }
    players[player]['cards'][from] = Util.arrayRemoveCards(
      players[player]['cards'][from],
      selectedCards
    );
    if (prepend) {
      players[player]['cards'][to] = Util.arrayPrependCards(
        players[player]['cards'][to],
        selectedCards
      );
    } else {
      players[player]['cards'][to] = Util.arrayAppendCards(
        players[player]['cards'][to],
        selectedCards
      );
    }
    // 少し待てば、レンダリングが完了しているため、うまくいった。
    if (to === 'tefudaCards') {
      setTimeout(() => {
        scrollZone(
          '.tefuda-zone.' + (player === props.upperPlayer ? 'upper' : 'lower'),
          'left'
        );
      }, 300);
    }
    if (props.single) {
      sessionStorage.setItem('room', JSON.stringify(players));
      return;
    }
    if (!SocketUtil.socket) return;
    players[player].isReady = true;
    SocketUtil.socket.emit('cards-moved', players[player]);
  }

  function scrollZone(targetSelector, direction) {
    const target = document.querySelector(targetSelector);
    if (!target) return
    target.scrollTo({
      behavior: 'smooth',
      [direction]: target.scrollWidth,
    });
  }

  function setRoomState() {
    if (props.single) {
      const sessionRoom = sessionStorage.getItem('room');
      if (sessionRoom) {
        const parsed = JSON.parse(sessionRoom);
        players.a = parsed.a;
        players.b = parsed.b;
        return;
      }
      const shieldCards = props.deck.cards.slice(0, 5);
      shieldCards.forEach((c) => {
        c.faceDown = true;
      });
      players.a.cards.shieldCards = shieldCards;
      players.a.cards.tefudaCards = props.deck.cards.slice(5, 10);
      // 40枚の制限をしない
      const yamafudaCards = props.deck.cards.slice(10);
      yamafudaCards.forEach((c) => {
        c.faceDown = true;
      });
      players.a.cards.yamafudaCards = yamafudaCards;
      players.a.cards.chojigenCards = props.deck.chojigenCards || [];
      players.a.hasChojigen = props.deck.hasChojigen;
      onDeckSelected({
        deck: props.deck,
        player: 'a',
      });
      deckSelectorActive.value = false;
      return;
    }
    if (props.room.a) {
      players.a = props.room.a;
    }
    if (props.room.b) {
      players.b = props.room.b;
    }
    // 片方がデッキ未選択であれば、モーダルを表示する。
    if (!players.a.isReady || !players.b.isReady) {
      deckSelectorActive.value = true;
    } else {
      deckSelectorActive.value = false;
    }
    if (SocketUtil.socket) {
      //
      // イベントをリッスン
      SocketUtil.socket.on('cards-moved', (playerData) => {
        players[playerData.name] = playerData;
      });
      // SocketUtil.socket.on(
      //   'set-message',
      //   function (data) {
      //     // this.message[data.player] = data.message;
      //     this.expireMessage(data.message, data.player);
      //   }.bind(this)
      // );
    }
  }
  function onDeckSelected({ deck, player }) {
    players[player].isReady = true;
    players[player].hasChojigen = !!deck.hasChojigen;
  }

  function groupCard({ from, to, fromCard, toCard, player }) {
    // 情報をカードに追加
    // card.groupはできれば使いたくない。moveCards内でのみ使用。
    fromCard.group = to;
    toCard.group = to;
    if (toCard.groupId) {
      // ターゲットのカードが既にグループ化されていた場合、
      // 既存のグループに追加する。
      const group = players[player]['cards'][to].find(
        (g) => g.id === toCard.groupId
      );
      group.cardIds.unshift(fromCard.id);
      fromCard.groupId = toCard.groupId;
    } else {
      // 新しくグループを作成する。
      // TODO: 被らない文字列にする。
      const groupId = `${toCard.id}-${fromCard.id}`;
      players[player]['cards'][to].push({
        id: groupId,
        cardIds: [fromCard.id, toCard.id],
      });
      fromCard.groupId = groupId;
      toCard.groupId = groupId;
    }
    // 並べ替え
    if (['battleCardGroups', 'shieldCardGroups'].includes(to)) {
      // fromCardをtoCardの前に移す。
      Util.arrayInsertBefore(players[player]['cards'][from], toCard, fromCard);
    }
    // 状態の変更を送信する
    if (!SocketUtil.socket) return;
    SocketUtil.socket.emit('cards-moved', players[player]);
  }
  // groupNameはbattleCardGroupsかshieldCardGroups
  function ungroupCard({ groupName, card, player, zone }) {
    // シールドのグループの場合はカードの行き先がわからず、注意が必要。
    const groupIndex = players[player]['cards'][groupName].findIndex(
      (g) => g.id === card.groupId
    );
    const group = players[player]['cards'][groupName].find(
      (g) => g.id === card.groupId
    );
    players[player]['cards'][groupName][groupIndex].cardIds.splice(
      group.cardIds.findIndex((id) => id === card.id),
      1
    );
    // カードが一枚だけのグループは消す。
    if (group.cardIds.length === 1) {
      const lastCardIndex = players[player]['cards'][zone].findIndex(
        (c) => c.id === group.cardIds[0]
      );
      if (lastCardIndex) {
        const lastCard = players[player]['cards'][zone][lastCardIndex];
        ungroupCard({
          groupName,
          card: lastCard,
          player,
          zone,
        });
      }
    }
    // cardIdsが0になったグループは自動で消す。
    if (group.cardIds.length === 0) {
      players[player]['cards'][groupName].splice(groupIndex, 1);
    }
    card.groupId = null;
    card.group = null;
  }
  function changeCardsState(from, cards, player, cardState) {
    const cardIds = cards.map((c) => c.id);
    players[player]["cards"][from].forEach((c) => {
      if (!cardIds.includes(c.id)) return;
      Object.keys(cardState).forEach((key) => {
        if (["tapped", "faceDown", "markColor"].includes(key)) {
          c[key] = cardState[key];
        }
      });
    });
  }
  function resetGame() {
    players.a = initialData({ roomId }).players.a;
    players.b = initialData({ roomId }).players.b;
    window.scrollTo({
      top: 0,
      // behavior: "smooth",
    });
    // 状態の変更を送信する
    if (!SocketUtil.socket) return;
    SocketUtil.socket.emit("cards-moved", players.a);
    SocketUtil.socket.emit("cards-moved", players.b);
  }
  return {
    moveCards,
    groupCard,
    ungroupCard,
    setRoomState,
    changeCardsState,
    props,
    resetGame,
    players,
  }
}

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
        name: 'a',
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
        name: 'b',
        roomId: roomId,
        isReady: false,
        hasChojigen: false,
      },
    },
    deckSelectorActive: false,
  };
}
