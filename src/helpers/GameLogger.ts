import { SocketUtil } from "./socket"
import { player } from "@/entities"
import { CardActions, changeCardsStateParams, groupCardParams, moveCardsParams } from "./CardActions"
import { reactive } from 'vue'
import { RoomConfig, initialData } from "./room"
import { listenHistoriesChange, pushHistory } from "@/services/roomService"
import { GameHistory, cardActionMethodParams } from "@/entities/History"
import { v4 as uuidv4 } from 'uuid'
import { TurnActions, startTurnParams } from "./TurnActions"
import { state } from "@/store"
import { readableZone } from "@/components/zones/zone"
import { Card } from "@/entities/Card"

// Roomコンポーネント内でインスタンス化して利用する。
export class GameLogger {

  public histories: GameHistory[] = []
  public historyIndex: number = -1
  private doneIds: string[] = []
  public unsubscribes: any[] = []
  public turnActions: TurnActions
  public players: ReturnType<typeof initialData>['players']
  public firstPlayer: player
  // vue component

  constructor(
    private cardActions: CardActions,
    private who: player = 'a'
  ) {
    this.players = cardActions.players
    this.turnActions = new TurnActions()
    this.turnActions.setGameLogger(this)
    this.firstPlayer = 'a'
  }

  listenChanges() {
    if (RoomConfig.useFirebase) {
      this.unsubscribes.push(listenHistoriesChange(this.cardActions.roomId, (histories) => {
        if (!Array.isArray(histories)) return
        if (histories.length === 0) return
        console.debug(`receive ${histories.length} histories`)
        const newHistories = histories.slice(this.historyIndex + 1)
        newHistories.forEach((history) => {
          this.receiveHistory(JSON.parse(history))
        })
      }))
    }
  }

  static useGameLogger(cardActions: CardActions, who: player) {
    // https://zenn.dev/tanukikyo/articles/40603fbdc88c05#%E3%80%87-object-%C3%97-reactive
    const gameLogger = reactive(new GameLogger(cardActions, who)) as GameLogger
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

  moveCards(args: moveCardsParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as moveCardsParams
    this.appendHistory('moveCards', argsCopy)
  }

  groupCard(args: groupCardParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as groupCardParams
    this.appendHistory('groupCard', argsCopy)
  }

  undoGroupCard(args: groupCardParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as groupCardParams
    this.appendHistory('undoGroupCard', argsCopy)
  }

  changeCardsState(args: changeCardsStateParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as changeCardsStateParams
    this.appendHistory('changeCardsState', argsCopy)
  }

  startTurn(args: startTurnParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as startTurnParams
    this.appendHistory('startTurn', argsCopy)
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
      case this.startTurn.name:
        this.turnActions.undoStartTurn(history.args as startTurnParams)
        break
      default:
        break;
    }
    if (SocketUtil.socket) {
      SocketUtil.socket.emit('pop-history', history)
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
      case this.startTurn.name:
        this.turnActions.startTurnWithoutHistory(history.args as startTurnParams)
        break
      default:
        break;
    }
  }

  appendHistory(method: GameHistory['method'], args: cardActionMethodParams, message='') {
    const history: GameHistory = {
      id: uuidv4(),
      canundo: true,
      who: this.who,
      player: args.player,
      method,
      args,
      message,
    }
    // 履歴を切り捨てる
    if (this.historyIndex < this.histories.length - 1) {
      console.debug(`deleted ${this.histories.length - this.historyIndex - 1} histories.`)
      this.histories = this.histories.slice(0, this.historyIndex + 1)
    }
    if (RoomConfig.useFirebase) {
      pushHistory(this.cardActions.roomId, history)
    } else {
      // 連続するマナタップは一つの履歴にまとめる
      if (this.currentHistory && HistoryComparator.isManaStateChange(this.currentHistory, history)) {
        const currentChangeCardsStateArgs = this.currentHistory.args as changeCardsStateParams
        currentChangeCardsStateArgs.cards.push(...(args as any).cards)
        return
      }
      this.histories.push(history)
      this.historyIndex = this.histories.length - 1
    }
    if (SocketUtil.socket) {
      SocketUtil.socket.emit('append-history', history)
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
      case this.startTurn.name:
        this.turnActions.startTurnWithoutHistory(history.args as startTurnParams)
        break
      default:
        break;
    }
  }
  
  readableHistory(history: GameHistory, cardDetails: state["cardDetails"]) {
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
      if (to === 'shieldCards') {
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
      if (to === 'battleCards' && from === 'tefudaCards') {
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

function getCardNames(cards: readonly Card[], cardDetails: state["cardDetails"]) {
  return cards.map(c => {
    if (c.faceDown) {
      return 'カード'
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
      if (currentHistoryArgs.from === 'manaCards'
        && nextHistoryArgs.from === 'manaCards'
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
      if (currentHistoryArgs.to === 'battleCards'
        && ['tefudaCards', 'manaCards'].includes(currentHistoryArgs.from)
        && card.id === currentHistoryArgs.fromCard.id
      ) {
        return true
      }
    }
    return false
  }
}