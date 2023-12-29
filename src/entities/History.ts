import { moveCardsParams, changeCardsStateParams, groupCardParams } from "@/helpers/CardActions"
import { player } from "."

export type cardActionMethodParams = moveCardsParams | changeCardsStateParams | groupCardParams

export interface GameHistory {
    id: string
    canundo: true
    who: player
    player: player
    method: string
    args: cardActionMethodParams
    message: string
}
