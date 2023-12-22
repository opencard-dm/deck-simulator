import { zoneGroup } from "."

export interface Card {
    id: number
    tapped: boolean
    faceDown: boolean
    markColor: string
    group: zoneGroup | null
    groupId: string | null
    imageUrl: string
    backImageUrl: string
    isChojigen: boolean
}

export interface CardGroup {
    id: string
    cardIds: number[]
    cards: Card[]
}