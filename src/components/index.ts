import { player } from '@/entities'
import MarkTool from './mark-tool/MarkTool.vue'
import { CardActions } from '@@/core/usecase/CardActions'
import { GameLogger } from '@@/core/usecase/GameLogger'
import { Game } from '@@/core/entities/game'

export {
  MarkTool,
}

export type RoomProps = {
  upperPlayer: player
  lowerPlayer: player
  game: Game
  cardActions: CardActions
  gameLogger: GameLogger
  roomId: string
  single: boolean
}
