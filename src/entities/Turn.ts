import { player } from "."

export interface Turn {
    current: number
    total: number
    turnPlayer: player
}
