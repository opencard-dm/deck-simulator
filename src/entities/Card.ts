import { zoneGroup } from "."

export interface Card {
    id: number
    tapped: boolean
    faceDown: boolean
    markColor: string
    group: zoneGroup | null
    groupId: string | null
}

export interface CardGroup {
    id: string
}