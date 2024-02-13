import { SocketUtil } from "./socket"
import { player } from "@/entities"
import { CardActions, changeCardsStateParams, groupCardParams, moveCardsParams } from "./CardActions"
import { reactive } from 'vue'
import { RoomConfig } from "./room"
import { listenHistoriesChange, pushHistory } from "@/services/roomService"
import { GameHistory, cardActionMethodParams } from "@/entities/History"
import { v4 as uuidv4 } from 'uuid'
import { TurnActions, startTurnParams } from "./TurnActions"
import { Turn } from "@/entities/Turn"
import { state } from "@/store"
import { readableZone } from "@/components/zones/zone"
import { Card } from "@/entities/Card"

// Roomコンポーネント内でインスタンス化して利用する。
export class GameLogger {

  public histories: GameHistory[] = []
  public historyIndex: number = -1
  private doneIds: string[] = []
  public unsubscribes: any[] = []
  public turn: Turn
  public turnActions: TurnActions
  // vue component

  constructor(
    private cardActions: CardActions,
    private who: player = 'a'
  ) {
    this.turn = {
      current: 0,
      total: 0,
      turnPlayer: 'a'
    }
    this.turnActions = new TurnActions()
    this.turnActions.setGameLogger(this)
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
    return this.histories[this.historyIndex]
  }

  get nextHistory() {
    return this.histories[this.historyIndex + 1]
  }

  moveCards(args: moveCardsParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as moveCardsParams
    this.appendHistory(this.moveCards.name, argsCopy)
  }

  groupCard(args: groupCardParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as groupCardParams
    this.appendHistory(this.groupCard.name, argsCopy)
  }

  undoGroupCard(args: groupCardParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as groupCardParams
    this.appendHistory(this.undoGroupCard.name, argsCopy)
  }

  changeCardsState(args: changeCardsStateParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as changeCardsStateParams
    this.appendHistory(this.changeCardsState.name, argsCopy)
  }

  startTurn(args: startTurnParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as startTurnParams
    this.appendHistory(this.startTurn.name, argsCopy)
  }

  setHistories(histories: GameHistory[]) {
    this.histories = histories
    this.historyIndex = histories.length - 1
  }

  canundo() {
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

  appendHistory(method: string, args: cardActionMethodParams, message='') {
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
    // if (history.method === this.undoGroupCard.name) {
    //   const { from, to, fromCard, toCard, player } = history.args as groupCardParams
    //   if (to === 'shieldCards') {
    //     return getCardNames([fromCard], cardDetails).join('')
    //       + 'をシールドに重ねました'
    //   }
    //   return getCardNames([fromCard], cardDetails).join('') + 'を'
    //     + getCardNames([toCard], cardDetails).join('') + 'に重ねました'
    // }
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
