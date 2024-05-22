import { GamePlayer } from "@@/core/entities/game"
import { Card, CardGroup } from "@@/core/entities/card"

export interface CardContext {
    card: Card
    group: CardGroup | null
    player: GamePlayer
    opponent: GamePlayer
}
