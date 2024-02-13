import { player } from '@/entities'
import MarkTool from './mark-tool/MarkTool.vue'
import { CardActions } from '@/helpers/CardActions'
import { GameLogger } from '@/helpers/GameLogger'
import { Room } from '@/entities/Room'
import { SourceDeck } from '@/entities/Deck'

export {
  MarkTool,
}

export type RoomProps = {
  upperPlayer: player
  lowerPlayer: player
  cardActions: CardActions
  gameLogger: GameLogger
  players: Room['players']
  roomId: string
  single: boolean
  sourceDeck: SourceDeck|null
}
