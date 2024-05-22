import { CardDetail, SourceDeck } from "@@/core/entities/Deck"
import { PlayerType } from "./player"
import { cardActionMethodParams } from "@@/core/usecase/CardActions"
import { Zone } from "./zones"

export class Game {

  private constructor(
    public players: {
      a: GamePlayer
      b: GamePlayer
    },
    public histories: GameHistory[],
    public cardDetails: { [key:string]: CardDetail }
  ) { }

  static init() {
    const players = {
      a: new GamePlayer('a'),
      b: new GamePlayer('b'),
    }
    return new Game(
      players,
      [],
      {}
    )
  }

  static fromData(data: GameData) {
    const players = {
      a: GamePlayer.fromData(data.players.a),
      b: GamePlayer.fromData(data.players.b),
    }
    return new Game(
      players,
      data.histories.map(h => GameHistory.fromData(h)),
      data.cardDetails
    )
  }
}

export type GameData = {
  players: {
    a: GamePlayer
    b: GamePlayer
  }
  histories: GameHistoryData[]
  cardDetails: { [key:string]: CardDetail }
}

export type GameLog = {
  name: string
  deck: SourceDeck
  deckb: SourceDeck|null
  histories: GameHistory[]
}

export class GamePlayer {
  public turn
  public deck: SourceDeck|null = null
  public manaZone: Zone
  public battleZone: Zone
  public bochiZone: Zone
  public shieldZone: Zone
  public tefudaZone: Zone
  public yamafudaZone: Zone
  public chojigenZone: Zone
  public triggeredAbilities: Zone

  constructor(
    public name: string,
  ) {
    this.turn = {
      current: 0,
      total: 0
    }

    this.manaZone = Zone.init()
    this.battleZone = Zone.init()
    this.bochiZone = Zone.init()
    this.shieldZone = Zone.init()
    this.tefudaZone = Zone.init()
    this.yamafudaZone = Zone.init()
    this.chojigenZone = Zone.init()
    this.triggeredAbilities = Zone.init()
  }

  static fromData(data: GamePlayer) {
    const self = new GamePlayer(data.name)
    self.turn = data.turn
    self.deck = data.deck

    self.manaZone = Zone.fromData(data.manaZone)
    self.battleZone = Zone.fromData(data.battleZone)
    self.bochiZone = Zone.fromData(data.bochiZone)
    self.shieldZone = Zone.fromData(data.shieldZone)
    self.tefudaZone = Zone.fromData(data.tefudaZone)
    self.yamafudaZone = Zone.fromData(data.yamafudaZone)
    self.chojigenZone = Zone.fromData(data.chojigenZone)
    self.triggeredAbilities = data.triggeredAbilities
    return self
  }

  isReady(): boolean {
    if (this.deck) {
      return true
    }
    return false
  }

  getZone(zoneName: string): Zone {
    const name = zoneName.replace('Cards', 'Zone')
    return this[name]
  }
}

export type GameHistoryData = {
  id: string
  canundo: true
  who: PlayerType
  player: PlayerType
  method: 'moveCards' | 'changeCardsState' | 'groupCard' | 'undoGroupCard' | 'putUnderCard' | 'startTurn'
  args: cardActionMethodParams
  message: string
}

export class GameHistory {
  private constructor(
    public id: string,
    public canundo: true,
    public who: PlayerType,
    public player: PlayerType,
    public method: GameHistoryData['method'],
    public args: cardActionMethodParams,
    public message: string,
  ) {

  }

  static fromData(data: GameHistoryData) {
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
