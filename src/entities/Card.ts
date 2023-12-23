import { zoneGroup } from "."

export interface Card {
    id: number
    /** location in zone */
    index?: number
    tapped: boolean
    faceDown: boolean
    markColor: string
    group: zoneGroup | null
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