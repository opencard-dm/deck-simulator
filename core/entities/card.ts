import { CardContext } from "@@/core/entities/effects"

export interface CardAbility {
  onMovingToBattleZone?: (ctx: CardContext) => void
}
