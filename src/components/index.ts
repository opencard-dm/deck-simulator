import { player } from '@/entities'
import MarkTool from './mark-tool/MarkTool.vue'
import { CardActions } from '@/helpers/CardActions'
import { GameLogger } from '@/helpers/GameLogger'
import { Room } from '@/entities/Room'

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
}
