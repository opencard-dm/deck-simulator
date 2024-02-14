
export interface Card {
    /** unique id for each card in game */
    id: number
    /** unique key for card */
    cd: string
    // mainCardId: number
    /** location in zone */
    index?: number
    tapped: boolean
    faceDown: boolean
    markColor: string
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