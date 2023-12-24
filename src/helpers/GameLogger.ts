import { SocketUtil } from "./socket"
import { player } from "@/entities"
import { CardActions, changeCardsStateParams, groupCardParams, moveCardsParams } from "./CardActions"
import { reactive } from 'vue'

// Roomコンポーネント内でインスタンス化して利用する。
export class GameLogger {

  public histories: history[] = []
  public historyIndex: number = -1
  // vue component

  constructor(
    private cardActions: CardActions,
    private who: player = 'a'
  ) {}

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

  changeCardsState(args: changeCardsStateParams) {
    const argsCopy = JSON.parse(JSON.stringify(args)) as changeCardsStateParams
    this.appendHistory(this.changeCardsState.name, argsCopy)
  }

  setHistories(histories: history[]) {
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
      case this.changeCardsState.name:
        this.cardActions.undoCardsState(history.args as changeCardsStateParams)
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
        this.cardActions.moveCards(history.args as moveCardsParams)
        break;
      case this.groupCard.name:
        this.cardActions.groupCard(history.args as groupCardParams)
        break
      case this.changeCardsState.name:
        this.cardActions.changeCardsState(history.args as changeCardsStateParams)
        break
      default:
        break;
    }
  }

  appendHistory(method: string, args: methodParams, message='') {
    const history: history = {
      canundo: true,
      who: this.who,
      player: args.player,
      method,
      args,
      message,
    }
    // 履歴を切り捨てる
    if (this.historyIndex < this.histories.length - 1) {
      console.debug(`${this.histories.length - this.historyIndex - 1}件の履歴を削除しました`)
      this.histories = this.histories.slice(0, this.historyIndex + 1)
    }
    this.histories.push(history)
    this.historyIndex = this.histories.length - 1
    if (SocketUtil.socket) {
      SocketUtil.socket.emit('append-history', history)
    }
  }

  receiveHistory(history: history) {
    this.histories.push(history)
    switch (history.method) {
      case this.moveCards.name:
        this.cardActions.moveCards(history.args as moveCardsParams)
        break;
      case this.groupCard.name:
        this.cardActions.groupCard(history.args as groupCardParams)
        break
      case this.changeCardsState.name:
        this.cardActions.changeCardsState(history.args as changeCardsStateParams)
        break
      default:
        break;
    }
  }
}

type methodParams = moveCardsParams | changeCardsStateParams | groupCardParams

interface history {
  canundo: true
  who: player
  player: player
  method: string
  args: methodParams
  message: string
}
