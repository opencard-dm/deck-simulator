import { useStore } from 'vuex';

import { SocketUtil } from '../helpers/socket';
import { useRoute } from 'vue-router';
import { CardActions, changeCardsStateParams, groupCardParams } from './CardActions';
import { player, playerCards, zone } from '@/entities';
import { Card } from '@/entities/Card';
import { GameLogger } from './GameLogger';
import { RoomProps } from '@/components';
import { Deck } from '@/entities/Deck';
import axios from 'axios';

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

  function onSelectDeck(player: player, deck: Deck) {
    players[player].isReady = true;
    cardActions.selectDeck(player, deck)
  }

  return {
    onMoveCards,
    onGroupCard,
    onChangeCardsState,
    onSelectDeck,
  }
}

export function useRoomSetup(props: RoomProps) {
  const route = useRoute();
  const roomId = route.query.roomId as string || 'single'

  function scrollZone(targetSelector: string, direction: string) {
    const target = document.querySelector(targetSelector);
    if (!target) return
    target.scrollTo({
      behavior: 'smooth',
      [direction]: target.scrollWidth,
    });
  }

  function resetGame() {
    // TODO: propsを書き換えない
    props.players.a = initialData(roomId).players.a;
    props.players.b = initialData(roomId).players.b;
    window.scrollTo({
      top: 0,
      // behavior: "smooth",
    });
    if (RoomConfig.useFirebase) {
      axios.delete(`/api/rooms/${props.roomId}`)
    }
    // 状態の変更を送信する
    if (!SocketUtil.socket) return;
    SocketUtil.socket.emit("cards-moved", props.players.a);
    SocketUtil.socket.emit("cards-moved", props.players.b);
  }
  return {
    ...useRoomListners({
      players: props.players,
      cardActions: props.cardActions,
      gameLogger: props.gameLogger,
      props,
      scrollZone,
    }),
    props,
    resetGame,
    players: props.players,
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
  };
}
