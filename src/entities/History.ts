import { moveCardsParams, changeCardsStateParams, groupCardParams, putUnderCardParams } from "@@/core/usecase/CardActions"
import { startTurnParams } from "@@/core/usecase/TurnActions"

export type cardActionMethodParams = moveCardsParams | changeCardsStateParams | groupCardParams | putUnderCardParams | startTurnParams
