import { CardContext } from "@@/core/entities/effects"

export interface CardAbility {
  onMovingToBattleZone?: (ctx: CardContext) => void
  onTapStateChanging?: (ctx: CardContext) => void
  /** 攻撃する時 */
  onAttacking?: (ctx: CardContext) => void
}

export interface Card {
  /** unique id for each card in game */
  id: number
  /** unique key for card */
  cd: string
  // mainCardId: number
  /** location in zone */
  index?: number
  tapped: boolean
  faceDown: boolean
  showInWorkSpace?: boolean
  markColor: string
  groupId: string | null
  shieldId: string
  imageUrl: string
  backImageUrl: string
  isChojigen: boolean
}

export interface CardGroup {
  id: string
  cards: Card[]
}

export type cardState = {
  tapped?: boolean,
  faceDown?: boolean,
  markColor?: string
}
