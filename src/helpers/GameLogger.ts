import { Socket } from "socket.io-client"
import { SocketUtil } from "./socket"
import SingleRoom from "@/components/SingleRoom.vue"

// Roomコンポーネント内でインスタンス化して利用する。
export class GameLogger {

  histories = []
  // vue component

  constructor(
    private room: InstanceType<typeof SingleRoom>
  ) {}

  moveCards(who, {from, to, cards, player, prepend}) {
    
  }

  groupCard(who, {from, to, fromCard, toCard, player}) {

  }
  
  changeCardsState(who, {from, cards, player, cardState}) {

  }

  /**
   * @param {Socket} socket 
   */
  emitChange(socket) {
    socket.emit(('pop-history', this.players[this.lowerPlayer]))
  }

  appendHistory(who, method, args, message='') {
    const history = {
      canundo: true,
      who,
      method,
      args,
      message,
    }
    this.histories.push(history) 
    if (SocketUtil.socket) {
      SocketUtil.socket.emit(('append-history', history))
    }
  }

  receiveHistory(history) {
    if (history.method === this.moveCards.name) {
      /**
       * @see useRoomSetup
       */
      // this.room.
    }
    switch (history.method) {
      case this.moveCards.name:
        const { from, to, cards, player, prepend } = history.args
        this.room.moveCards(from, to, cards, player, prepend)
        break;
      case this.groupCard.name:
        const { from, to, fromCard, toCard, player } = history.args
        this.room.groupCard(from, to, fromCard, toCard, player)
        break
      case this.changeCardsState.name:
        const { from, cards, player, cardState } = history.args
        this.room.changeCardsState(from, cards, player, cardState)
        break
      default:
        break;
    }
    this.room[history.method]()
  }
}
