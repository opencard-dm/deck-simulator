import { player } from "@/entities";
import { GameLogger } from "./GameLogger";
import { RoomConfig } from "./room";

export interface startTurnParams {
  /** 開始したいターンのターン数.
   * 現在1ターン目で2ターン目を開始したいなら2となる. */
  turn: number
  player: player
}

export class TurnActions {

  private gameLogger?: GameLogger

  setGameLogger(gameLogger: GameLogger) {
    this.gameLogger = gameLogger
  }

  startTurn({ turn, player }: startTurnParams) {
    this.gameLogger?.startTurn({ turn, player })
    if (!RoomConfig.useFirebase) {
      this.startTurnWithoutHistory({ turn, player })
    }
  }

  startTurnWithoutHistory({ turn, player }: startTurnParams) {
    if (this.gameLogger) {
      if (turn === 1) {
        const totalTurns = this.gameLogger.players['a'].turn.total
          + this.gameLogger.players['b'].turn.total
        if (totalTurns === 0) {
          this.gameLogger.firstPlayer = player
        }
      }
      this.gameLogger.players[player].turn.current = turn
      this.gameLogger.players[player].turn.total = turn
    }
  }
  
  undoStartTurn({ turn, player }: startTurnParams) {
    if (this.gameLogger) {
      this.gameLogger.players[player].turn.current = turn - 1
    }
  }
}
