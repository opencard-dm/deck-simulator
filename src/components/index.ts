import { player } from '@/entities'
import MarkTool from './mark-tool/MarkTool.vue'
import { Deck } from '@/entities/Deck'
import { initialData } from '@/helpers/room'

export {
  MarkTool,
}

export type RoomProps = {
  upperPlayer: player,
  lowerPlayer: player,
  room: ReturnType<typeof initialData>,
  roomId: string,
  loading: boolean,
  deck: Deck | null,
  single: boolean,
}
