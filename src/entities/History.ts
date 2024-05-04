import { moveCardsParams, changeCardsStateParams, groupCardParams } from "@@/core/usecase/CardActions"
import { player } from "."
import { startTurnParams } from "@@/core/usecase/TurnActions"

export type cardActionMethodParams = moveCardsParams | changeCardsStateParams | groupCardParams | startTurnParams

export interface GameHistory {
    id: string
    canundo: true
    who: player
    player: player
    method: 'moveCards' | 'changeCardsState' | 'groupCard' | 'undoGroupCard' | 'startTurn'
    args: cardActionMethodParams
    message: string
}
