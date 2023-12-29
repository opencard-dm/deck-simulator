import { reactive, ref, getCurrentInstance } from 'vue';
import { useStore } from 'vuex';

import { SocketUtil } from '../helpers/socket';
import { useRoute } from 'vue-router';
import { CardActions, changeCardsStateParams, groupCardParams } from './CardActions';
import { player, playerCards, zone } from '@/entities';
import { Card } from '@/entities/Card';
import { GameLogger } from './GameLogger';
import { RoomProps } from '@/components';

export class RoomConfig {
  static useFirebase = false
}

function useRoomListners({
  players,
  cardActions,
  gameLogger,
  scrollZone,
  props,
}: {
  players: ReturnType<typeof initialData>['players'],
  cardActions: CardActions,
  gameLogger: GameLogger,
  scrollZone: Function,
  props: any,
}
) {
  const route = useRoute();
  const store = useStore();
  
  function onMoveCards(from: zone, to: zone, cards: Card[], player: player, prepend = false) {
    if (!cards || cards.length === 0) return;
    if (store.state.displayImageUrl) {
      store.commit('setDisplayImageUrl', '');
    }
    cardActions.moveCards({ from, to, cards: cards, player, prepend })
    // 少し待てば、レンダリングが完了しているため、うまくいった。
    if (to === 'tefudaCards') {
      setTimeout(() => {
        scrollZone(
          '.tefuda-zone.' + (player === props.upperPlayer ? 'upper' : 'lower'),
          'left'
        );
      }, 300);
    }
    if (props.single || props.lowerPlayer === 'a') {
      sessionStorage.setItem(`room-${props.roomId}`, JSON.stringify({
        players,
        histories: gameLogger.histories,
      }));
      return;
    }
    if (!SocketUtil.socket) return;
    players[player].isReady = true;
    SocketUtil.socket.emit('cards-moved', players[player]);
  }

  function onGroupCard({ from, to, fromCard, toCard, player }: groupCardParams) {
    cardActions.groupCard({ from, to, fromCard, toCard, player })
    // 状態の変更を送信する
    if (!SocketUtil.socket) return;
    SocketUtil.socket.emit('cards-moved', players[player]);
  }

  function onChangeCardsState({ from, cards, player, cardState }: changeCardsStateParams) {
    if (!cards || cards.length === 0) return;
    // 実際に変更を加える前に状態を保存する
    cardActions.changeCardsState({ from, cards, player, cardState })
    if (props.single || props.lowerPlayer === 'a') {
      sessionStorage.setItem(`room-${props.roomId}`, JSON.stringify({
        players,
        histories: gameLogger.histories,
      }));
      return;
    }
  }
  return {
    onMoveCards,
    onGroupCard,
    onChangeCardsState,
  }
}

export function useRoomSetup(props: RoomProps) {
  const route = useRoute();
  const store = useStore();
  const roomId = route.query.roomId as string || 'single'
  const players = reactive(initialData(roomId).players);
  const deckSelectorActive = ref(true);

  const cardActions = new CardActions(roomId, players)
  const { gameLogger } = GameLogger.useGameLogger(cardActions, props.lowerPlayer)

  function scrollZone(targetSelector: string, direction: string) {
    const target = document.querySelector(targetSelector);
    if (!target) return
    target.scrollTo({
      behavior: 'smooth',
      [direction]: target.scrollWidth,
    });
  }

  function setRoomState() {
    const sessionRoom = sessionStorage.getItem(`room-${props.roomId}`);
    if (sessionRoom) {
      const parsed = JSON.parse(sessionRoom);
      players.a = parsed.players.a;
      players.b = parsed.players.b;
      gameLogger.setHistories(parsed.histories)
      return;
    }
    if (props.single && props.deck) {
      const shieldCards = props.deck.cards.slice(0, 5);
      shieldCards.forEach((c: Card) => {
        c.faceDown = true;
      });
      players.a.cards.shieldCards = shieldCards;
      players.a.cards.tefudaCards = props.deck.cards.slice(5, 10);
      // 40枚の制限をしない
      const yamafudaCards = props.deck.cards.slice(10);
      yamafudaCards.forEach((c: Card) => {
        c.faceDown = true;
      });
      players.a.cards.yamafudaCards = yamafudaCards;
      players.a.cards.chojigenCards = props.deck.chojigenCards || [];
      players.a.hasChojigen = props.deck.chojigenCards.length > 0;
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
  function onDeckSelected({ deck, player }: {
    deck: any,
    player: player
  }) {
    players[player].isReady = true;
    players[player].hasChojigen = !!deck.hasChojigen;
  }

  function resetGame() {
    players.a = initialData(roomId).players.a;
    players.b = initialData(roomId).players.b;
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
    ...useRoomListners({
      players,
      cardActions,
      gameLogger,
      props,
      scrollZone,
    }),
    cardActions,
    gameLogger,
    setRoomState,
    props,
    resetGame,
    players,
  }
}

export function initialData(roomId: string) {
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
        } as playerCards,
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
        } as playerCards,
        name: 'b',
        roomId: roomId,
        isReady: false,
        hasChojigen: false,
      },
    },
    deckSelectorActive: false,
  };
}
