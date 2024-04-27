import { SourceDeck } from "@/entities/Deck"
import { player } from "./player"
import { cardActionMethodParams } from "@/entities/History"

export class Game {
  public players: {
    a: GamePlayer
    b: GamePlayer
  }
  public histories: GameHistory[]

  constructor() {
    this.players = {
      a: new GamePlayer('a'),
      b: new GamePlayer('b'),
    }
    this.histories = []
  }

}

export type GameLog = {
  name: string
  deck: SourceDeck
  deckb: SourceDeck|null
  histories: GameHistory[]
}

export class GamePlayer {
  public turn

  constructor(
    public name: string,
  ) {
    this.turn = {
      current: 0,
      total: 0
    }

    // public manaZone: zone,
    // public battleZone: zone,
    // public bochiZone: zone,
    // public shieldZone: zone,
    // public tafudaZone: zone,
    // public yamafudaZone: zone,
    // public chojigenZone: zone,
    // public triggeredAbilities: zone,
  }
}

export type GameHistoryData = {
  id: string
  canundo: true
  who: player
  player: player
  method: 'moveCards' | 'changeCardsState' | 'groupCard' | 'undoGroupCard' | 'startTurn'
  args: cardActionMethodParams
  message: string
}

export class GameHistory {
  private constructor(
    public id: string,
    public canundo: true,
    public who: player,
    public player: player,
    public method: 'moveCards' | 'changeCardsState' | 'groupCard' | 'undoGroupCard' | 'startTurn',
    public args: cardActionMethodParams,
    public message: string,
  ) {

  }

  static formData(data: GameHistoryData) {
    return new GameHistory(
      data.id,
      data.canundo,
      data.who,
      data.player,
      data.method,
      data.args,
      data.message
    )
  }
}
