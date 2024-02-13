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
      this.gameLogger.turn.current = turn
      this.gameLogger.turn.total = turn
    }
  }
  
  undoStartTurn({ turn, player }: startTurnParams) {
    if (this.gameLogger) {
      this.gameLogger.turn.current = turn - 1
    }
  }
}
