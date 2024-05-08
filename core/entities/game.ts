import { CardDetail, SourceDeck } from "@/entities/Deck"
import { player } from "./player"
import { cardActionMethodParams } from "@/entities/History"
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
    // TODO: zoneに置き換える
    this.cards = {
      manaCards: [],
      battleCards: [],
      bochiCards: [],
      shieldCards: [],
      tefudaCards: [],
      yamafudaCards: [],
      chojigenCards: [],
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
