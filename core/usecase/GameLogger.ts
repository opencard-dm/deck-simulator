import { PlayerType } from "@@/core/entities/player";
import { CardActions, changeCardsStateParams, groupCardParams, moveCardsParams, putUnderCardParams, startAttackingParams } from "@@/core/usecase/CardActions"
import { reactive } from 'vue'
import { RoomConfig } from "@/helpers/room"
import { listenHistoriesChange, pushHistory } from "@/services/roomService"
import { cardActionMethodParams } from "@@/core/usecase/CardActions"
import { Game, GameHistory } from "../entities/game"
import { v4 as uuidv4 } from 'uuid'
import { TurnActions, startTurnParams } from "@@/core/usecase/TurnActions"
import { State, useRoomStore } from "@/stores/room"
import { readableZone } from "@/components/zones/zone"
import { Card } from "@@/core/entities/card"
import { fetchCardDetailsAndAbilities } from "../services/card.service";
import { initializeRoom } from "../services/room.service";
import { Deck } from "@/helpers/Deck";

export interface resetGameParams {
  keepDecks: boolean
}

// Roomコンポーネント内でインスタンス化して利用する。
export class GameLogger {

  public histories: GameHistory[] = []
  public historyIndex: number = -1
  private doneIds: string[] = []
  public unsubscribes: any[] = []
  public turnActions: TurnActions
  public players: Game['players']
  public game: Game
  public firstPlayer: PlayerType
  // vue component

  constructor(
    private cardActions: CardActions,
    private readonly roomId: string,
    private who: PlayerType = 'a'
  ) {
    this.players = cardActions.game.players
    this.game = cardActions.game
    this.turnActions = new TurnActions()
    this.turnActions.setGameLogger(this)
    this.firstPlayer = 'a'
  }

  listenChanges() {
    if (RoomConfig.useFirebase) {
      const roomStore = useRoomStore()
      this.unsubscribes.push(listenHistoriesChange(this.roomId, async (room) => {

        // deck
        // nullからそうでない値に切り替わるときに、デッキの選択が行われたと判断する
        const {
          deckA,
          deckB
        } = room;
        if (this.players.a.deck === null && deckA) {
          this.players.a.deck = deckA
          this.game.cardDetails = {
            ...this.game.cardDetails,
            ...await fetchCardDetailsAndAbilities(deckA),
          }
        } else {
          this.players.a.deck = deckA || null
        }
        if (this.players.b.deck === null && deckB) {
          this.players.b.deck = deckB
          console.debug('fetch deckB cardDetails in firebase listner')
          this.game.cardDetails = {
            ...this.game.cardDetails,
            ...await fetchCardDetailsAndAbilities(deckB),
          }
        } else {
          this.players.b.deck = deckB || null
        }
        roomStore.addCardDetails(this.game.cardDetails)

        // histories
        const histories = room.histories;
        if (!Array.isArray(histories)) return
        console.debug(`receive ${histories.length} histories`)
        const newHistories = histories.slice(this.historyIndex + 1)
        newHistories.forEach((history) => {
          this.receiveHistory(JSON.parse(history))
        })
      }))
    }
  }

  async resetGame(params: resetGameParams) {
    const {
      keepDecks
    } = params
    const deckA = this.players.a.deck
    const deckB = this.players.b.deck
    if (RoomConfig.useFirebase) {
      await this.appendHistory('resetGame', params)
      if (keepDecks) {
        await initializeRoom({
          roomId: this.roomId,
          deckA: deckA || undefined,
          deckB: deckB || undefined,
        })
      } else {
        await initializeRoom({
          roomId: this.roomId,
        })
      }
    }
    if (keepDecks) {
      if (deckA) {
        this.cardActions.selectDeck('a', await Deck.prepareDeckForGame(deckA, true, true))
      }
      if (deckB) {
        this.cardActions.selectDeck('b', await Deck.prepareDeckForGame(deckB, true, true))
      }
    }
  }

  resetGameWithoutHistory({
    keepDecks,
  }: resetGameParams) {
    console.log('resetGameWithoutHistory')
    this.histories = []
    this.historyIndex = -1

    const initialGame = Game.init()
    this.players.a = initialGame.players.a;
    this.players.b = initialGame.players.b;
  }

  static useGameLogger(cardActions: CardActions, roomId: string, who: PlayerType) {
    // https://zenn.dev/tanukikyo/articles/40603fbdc88c05#%E3%80%87-object-%C3%97-reactive
    const gameLogger = reactive(new GameLogger(cardActions, roomId, who)) as GameLogger
    cardActions.setGameLogger(gameLogger)
    return {
      gameLogger
    }
  }

  get currentHistory() {
    if (this.historyIndex === -1) {
      return null
    }
    return this.histories[this.historyIndex]
  }

  get nextHistory() {
    return this.histories[this.historyIndex + 1]
  }

  get totalTurns() {
    return this.players.a.turn.total + this.players.b.turn.total
  }

  async moveCards(args: moveCardsParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as moveCardsParams
    await this.appendHistory('moveCards', argsCopy)
  }

  async groupCard(args: groupCardParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as groupCardParams
    await this.appendHistory('groupCard', argsCopy)
  }

  async putUnderCard(args: putUnderCardParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as putUnderCardParams
    await this.appendHistory('putUnderCard', argsCopy)
  }

  async undoGroupCard(args: groupCardParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as groupCardParams
    await this.appendHistory('undoGroupCard', argsCopy)
  }

  async changeCardsState(args: changeCardsStateParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as changeCardsStateParams
    await this.appendHistory('changeCardsState', argsCopy)
  }

  async startAttacking(args: startAttackingParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as startAttackingParams
    await this.appendHistory('startAttacking', argsCopy)
  }

  async startTurn(args: startTurnParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as startTurnParams
    await this.appendHistory('startTurn', argsCopy)
  }

  setHistories(histories: GameHistory[]) {
    this.histories = histories
    this.historyIndex = histories.length - 1
  }

  canundo() {
    if (
      this.players.a.turn.current === 0
      && this.players.b.turn.current === 0
    ) {
      return false
    }
    return this.historyIndex !== -1
  }

  undo() {
    if (!this.canundo()) return
    const history = this.histories[this.historyIndex]
    this.historyIndex -= 1
    switch (history.method) {
      case this.moveCards.name:
        this.cardActions.undoMoveCards(history.args as moveCardsParams)
        break;
      case this.groupCard.name:
        this.cardActions.undoGroupCard(history.args as groupCardParams)
        break
      case this.undoGroupCard.name:
        this.cardActions.groupCardWithoutHistory(history.args as groupCardParams)
        break
      case this.changeCardsState.name:
        this.cardActions.undoCardsState(history.args as changeCardsStateParams)
        break
      case this.startAttacking.name:
        this.cardActions.undoStartAttacking(history.args as startAttackingParams)
        break
      case this.putUnderCard.name:
        this.cardActions.undoPutUnderCard(history.args as putUnderCardParams)
        break
      case this.startTurn.name:
        this.turnActions.undoStartTurn(history.args as startTurnParams)
        break
      default:
        break;
    }
  }

  canredo() {
    return this.histories.length - 1 !== this.historyIndex
  }

  redo() {
    if (!this.canredo()) return
    this.historyIndex += 1
    const history = this.histories[this.historyIndex]
    switch (history.method) {
      case this.moveCards.name:
        this.cardActions.moveCardsWithoutHistory(history.args as moveCardsParams)
        break;
      case this.groupCard.name:
        this.cardActions.groupCardWithoutHistory(history.args as groupCardParams)
        break
      case this.undoGroupCard.name:
        this.cardActions.undoGroupCard(history.args as groupCardParams)
        break
      case this.changeCardsState.name:
        this.cardActions.changeCardsStateWithoutHistory(history.args as changeCardsStateParams)
        break
      case this.startAttacking.name:
        this.cardActions.startAttackingWithoutHistory(history.args as startAttackingParams)
        break
      case this.putUnderCard.name:
        this.cardActions.putUnderCardWithoutHistory(history.args as putUnderCardParams)
        break
      case this.startTurn.name:
        this.turnActions.startTurnWithoutHistory(history.args as startTurnParams)
        break
      default:
        break;
    }
  }

  async appendHistory(method: GameHistory['method'], args: cardActionMethodParams, message='') {
    const history: GameHistory = GameHistory.fromData({
      id: uuidv4(),
      canundo: true,
      who: this.who,
      player: args.player,
      method,
      args,
      message,
    })
    // 履歴を切り捨てる
    if (this.historyIndex < this.histories.length - 1) {
      console.debug(`deleted ${this.histories.length - this.historyIndex - 1} histories.`)
      this.histories = this.histories.slice(0, this.historyIndex + 1)
    }
    if (RoomConfig.useFirebase) {
      await pushHistory(this.roomId, history)
    } else {
      // 連続するマナタップは一つの履歴にまとめる
      if (this.currentHistory && HistoryComparator.isManaStateChange(this.currentHistory, history)) {
        const currentChangeCardsStateArgs = this.currentHistory.args as changeCardsStateParams
        currentChangeCardsStateArgs.cards.push(...(args as changeCardsStateParams).cards)
        return
      }
      this.histories.push(history)
      this.historyIndex = this.histories.length - 1
    }
  }

  receiveHistory(history: GameHistory) {
    if (this.doneIds.includes(history.id)) return
    this.histories.push(history)
    this.historyIndex = this.histories.length - 1
    switch (history.method) {
      case this.moveCards.name:
        this.cardActions.moveCardsWithoutHistory(history.args as moveCardsParams)
        break;
      case this.groupCard.name:
        this.cardActions.groupCardWithoutHistory(history.args as groupCardParams)
        break
      case this.undoGroupCard.name:
        this.cardActions.undoGroupCard(history.args as groupCardParams)
        break
      case this.changeCardsState.name:
        this.cardActions.changeCardsStateWithoutHistory(history.args as changeCardsStateParams)
        break
      case this.startAttacking.name:
        this.cardActions.startAttackingWithoutHistory(history.args as startAttackingParams)
        break
      case this.putUnderCard.name:
        this.cardActions.putUnderCardWithoutHistory(history.args as groupCardParams)
        break
      case this.startTurn.name:
        this.turnActions.startTurnWithoutHistory(history.args as startTurnParams)
        break
      case this.resetGame.name:
        this.resetGameWithoutHistory(history.args as resetGameParams)
        break
      default:
        break;
    }
  }
  
  readableHistory(history: GameHistory, cardDetails: State["cardDetails"]) {
    if (history.method === this.moveCards.name) {
      const { from, to, cards, player, prepend, index } = history.args as moveCardsParams
      if (from === to) {
        return readableZone(from) + 'の'
          + getCardNames(cards, cardDetails).join('') + 'を動かしました'
      }
      return readableZone(from) + 'から' + readableZone(to) + 'へ'
        + getCardNames(cards, cardDetails).join('') + 'を移動しました'
    }
    if (history.method === this.groupCard.name) {
      const { from, to, fromCard, toCard, player } = history.args as groupCardParams
      if (to === 'shieldZone') {
        return getCardNames([fromCard], cardDetails).join('')
          + 'をシールドに重ねました'
      }
      return getCardNames([fromCard], cardDetails).join('') + 'を'
        + getCardNames([toCard], cardDetails).join('') + 'に重ねました'
    }
    if (history.method === this.undoGroupCard.name) {
      const { from, to, fromCard, toCard, player } = history.args as groupCardParams
      if (from === to) {
        return readableZone(from) + 'の'
          + getCardNames([fromCard], cardDetails).join('') + 'を動かしました'
      }
      if (to === 'battleZone' && from === 'tefudaZone') {
        // 革命チェンジ
        return getCardNames([fromCard], cardDetails).join('') + 'を手札に戻しました'
      }
      return readableZone(to) + 'から' + readableZone(from) + 'へ'
        + getCardNames([fromCard], cardDetails).join('') + 'を移動しました'
    }
    if (history.method === this.changeCardsState.name) {
      const { from, cards, player, cardState } = history.args as changeCardsStateParams
      if (cardState?.tapped !== undefined) {
        return readableZone(from) + 'の' + getCardNames(cards, cardDetails).join('')
          + 'を' + (cardState.tapped ? 'タップ' : 'アンタップ')
          + 'しました'
      }
      if (cardState?.faceDown !== undefined) {
        return readableZone(from) + 'の' + getCardNames(cards, cardDetails).join('')
          + 'を裏返しました'
      }
      return ''
    }
    if (history.method === this.startTurn.name) {
      const { turn, player } = history.args as startTurnParams
      return String(turn) + 'ターン目を開始しました'
    }
    return ''
  }
}

function getCardNames(cards: readonly Card[], cardDetails: State["cardDetails"]) {
  return cards.map(c => {
    if (c.faceDown) {
      return 'カード'
    }
    if (!(c.cd in cardDetails)) {
      return '《xxx》'
    }
    return '《' + cardDetails[c.cd as string].name + '》'
  })
}

export class HistoryComparator {
  static isManaStateChange(currentHistory: GameHistory, nextHistory: GameHistory) {
    if (currentHistory.method === nextHistory.method
      && nextHistory.method === 'changeCardsState'
    ) {
      const currentHistoryArgs = currentHistory.args as changeCardsStateParams
      const nextHistoryArgs = nextHistory.args as changeCardsStateParams
      if (currentHistoryArgs.from === 'manaZone'
        && nextHistoryArgs.from === 'manaZone'
        && JSON.stringify(currentHistoryArgs.cardState) === JSON.stringify(nextHistoryArgs.cardState)
      ) {
        return true
      }
    }
    return false
  }

  /**
   * 革命チェンジやJチェンジのボタンを表示するタイミングの判定に使う
   */
  static isLastGroupedCard(card: Card, currentHistory: GameHistory) {
    if (!card.groupId) return false
    if (currentHistory.method === 'groupCard') {
      const currentHistoryArgs = currentHistory.args as groupCardParams
      if (currentHistoryArgs.to === 'battleZone'
        && ['tefudaZone', 'manaZone'].includes(currentHistoryArgs.from)
        && card.id === currentHistoryArgs.fromCard.id
      ) {
        return true
      }
    }
    return false
  }
}