import { moveCardsParams, changeCardsStateParams, groupCardParams } from "@/helpers/CardActions"
import { player } from "."
import { startTurnParams } from "@/helpers/TurnActions"

export type cardActionMethodParams = moveCardsParams | changeCardsStateParams | groupCardParams | startTurnParams

export interface GameHistory {
    id: string
    canundo: true
    who: player
    player: player
    method: string
    args: cardActionMethodParams
    message: string
}
