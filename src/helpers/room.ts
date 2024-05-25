import { SocketUtil } from '../helpers/socket';
import { CardActions, changeCardsStateParams, groupCardParams } from '@@/core/usecase/CardActions';
import type { PlayerType } from "@@/core/entities/player";
import { Card } from '@@/core/entities/card';
import { ZoneType } from '@@/core/entities/zones';
import { GameLogger } from '@@/core/usecase/GameLogger';
import { RoomProps } from '@/components';
import { Deck as DeckType } from '@@/core/entities/Deck';
import { Game, GamePlayer } from '@@/core/entities/game';
import { saveGameTemporarily } from '@@/core/services/game.service';
import { initializeRoom } from '@@/core/services/room.service';
import { Deck } from './Deck';

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
  players: {
    a: GamePlayer
    b: GamePlayer
  },
  cardActions: CardActions,
  gameLogger: GameLogger,
  scrollZone: Function,
  props: any,
}
) {
  const side = (player: PlayerType) => player === props.upperPlayer ? 'upper' : 'lower'
  
  function onMoveCards(from: ZoneType, to: ZoneType, cards: Card[], player: PlayerType, prepend = false) {
    if (!cards || cards.length === 0) return;
    cardActions.moveCards({ from, to, cards: cards, player, prepend })
    // 少し待てば、レンダリングが完了しているため、うまくいった。
    if (to === 'tefudaZone') {
      setTimeout(() => {
        scrollZone(
          '.tefuda-zone.' + side(player),
          'left'
        );
      }, 300);
    }
    // 少し待てば、レンダリングが完了しているため、うまくいった。
    if (to === 'shieldZone') {
      setTimeout(() => {
        const shieldZone = document.querySelector('.shield-zone.' + side(player))
        shieldZone?.scrollTo({
          left: - shieldZone.scrollWidth,
          behavior: 'smooth',
        })
      }, 300);
    }
    if (props.single || props.lowerPlayer === 'a') {
      saveGameTemporarily(props.game)
    }
    if (!SocketUtil.socket) return;
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
      saveGameTemporarily(props.game)
    }
  }

  function onStartTurn({ player }: { player: PlayerType }) {
    const nextTurn = players[player].turn.current + 1
    gameLogger.turnActions.startTurn({
      player,
      turn: nextTurn
    })
    if (players[player].battleZone.cards.filter(c => c.tapped).length > 0) {
      onChangeCardsState({ 
        from: 'battleZone',
        cards: players[player].battleZone.cards,
        player,
        cardState: {
          tapped: false,
        }
      })
    }
    if (players[player].manaZone.cards.filter(c => c.tapped).length > 0) {
      onChangeCardsState({
        from: 'manaZone',
        cards: players[player].manaZone.cards,
        player,
        cardState: {
          tapped: false,
        }
      })
    }
    // ターン開始時のドローは自動で行わないようにする
  }

  function onSelectDeck(player: PlayerType, deck: DeckType) {
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
  const players = props.game.players

  function scrollZone(targetSelector: string, direction: string) {
    const target = document.querySelector(targetSelector);
        if (!target) return
    target.scrollTo({
      behavior: 'smooth',
      [direction]: target.scrollWidth,
    });
  }

  async function resetGame(keepDecks: boolean) {
    // TODO: propsを書き換えない
    const deckA = props.game.players.a.deck
    const deckB = props.game.players.b.deck
    if (RoomConfig.useFirebase) {
      if (keepDecks) {
        await initializeRoom({
          roomId: props.roomId,
          deckA: props.game.players.a.deck || undefined,
          deckB: props.game.players.b.deck || undefined,
        })
      } else {
        await initializeRoom({
          roomId: props.roomId,
        })
      }
      props.gameLogger.unsubscribes.forEach(u => u())
      props.gameLogger.listenChanges()
      props.gameLogger.histories = []
      props.gameLogger.historyIndex = -1
    }
    const initialGame = Game.init()
    if (keepDecks) {
      initialGame.players.a.deck = deckA
      initialGame.players.b.deck = deckB
      if (deckA) {
        props.cardActions.selectDeck('a', await Deck.prepareDeckForGame(deckA, true, true))
      }
      if (deckB) {
        props.cardActions.selectDeck('b', await Deck.prepareDeckForGame(deckB, true, true))
      }
    }
    players.a = initialGame.players.a;
    players.b = initialGame.players.b;
    window.scrollTo({
      top: 0,
      // behavior: "smooth",
    });
  }
  return {
    ...useRoomListners({
      players,
      cardActions: props.cardActions,
      gameLogger: props.gameLogger,
      props,
      scrollZone,
    }),
    props,
    resetGame,
    players,
  }
}
