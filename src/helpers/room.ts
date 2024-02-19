import { SocketUtil } from '../helpers/socket';
import { useRoute } from 'vue-router';
import { CardActions, changeCardsStateParams, groupCardParams } from './CardActions';
import { player, playerCards, zone } from '@/entities';
import { Card } from '@/entities/Card';
import { GameLogger } from './GameLogger';
import { RoomProps } from '@/components';
import { Deck } from '@/entities/Deck';
import axios from 'axios';
import { useRoomStore } from '@/stores/room';

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
  const roomStore = useRoomStore();
  const side = (player: player) => player === props.upperPlayer ? 'upper' : 'lower'
  
  function onMoveCards(from: zone, to: zone, cards: Card[], player: player, prepend = false) {
    if (!cards || cards.length === 0) return;
    cardActions.moveCards({ from, to, cards: cards, player, prepend })
    // 少し待てば、レンダリングが完了しているため、うまくいった。
    if (to === 'tefudaCards') {
      setTimeout(() => {
        scrollZone(
          '.tefuda-zone.' + side(player),
          'left'
        );
      }, 300);
    }
    // 少し待てば、レンダリングが完了しているため、うまくいった。
    if (to === 'shieldCards') {
      setTimeout(() => {
        const shieldZone = document.querySelector('.shield-zone.' + side(player))
        shieldZone?.scrollTo({
          left: - shieldZone.scrollWidth,
          behavior: 'smooth',
        })
      }, 300);
    }
    if (props.single || props.lowerPlayer === 'a') {
      sessionStorage.setItem(`room-${props.roomId}`, JSON.stringify({
        cardDetails: roomStore.cardDetails,
        sourceDeck: props.sourceDeck,
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
        cardDetails: roomStore.cardDetails,
        sourceDeck: props.sourceDeck,
        players,
        histories: gameLogger.histories,
      }));
      return;
    }
  }

  function onStartTurn({ player }: { player: player }) {
    const nextTurn = players[player].turn.current + 1
    gameLogger.turnActions.startTurn({
      player,
      turn: nextTurn
    })
    const totalTurns = players['a'].turn.total + players['b'].turn.total
    if (players[player].cards.battleCards.filter(c => c.tapped).length > 0) {
      onChangeCardsState({ 
        from: 'battleCards',
        cards: players[player].cards.battleCards,
        player,
        cardState: {
          tapped: false,
        }
      })
    }
    if (players[player].cards.manaCards.filter(c => c.tapped).length > 0) {
      onChangeCardsState({
        from: 'manaCards',
        cards: players[player].cards.manaCards,
        player,
        cardState: {
          tapped: false,
        }
      })
    }
    if (totalTurns >= 2 && players[player].cards.yamafudaCards.length > 0) {
      onMoveCards(
        'yamafudaCards',
        'tefudaCards',
        [players[player].cards.yamafudaCards[0]],
        player
      )
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
    onStartTurn,
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

  async function resetGame() {
    // TODO: propsを書き換えない
    props.players.a = initialData(roomId).players.a;
    props.players.b = initialData(roomId).players.b;
    window.scrollTo({
      top: 0,
      // behavior: "smooth",
    });
    if (RoomConfig.useFirebase) {
      await axios.delete(`/api/rooms/${props.roomId}`)
      props.gameLogger.unsubscribes.forEach(u => u())
      props.gameLogger.listenChanges()
      props.gameLogger.histories = []
      props.gameLogger.historyIndex = -1
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
        turn: {
          current: 0,
          total: 0,
        }
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
        turn: {
          current: 0,
          total: 0,
        }
      },
    },
  };
}
