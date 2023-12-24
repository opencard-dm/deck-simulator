import { Card } from "./Card"

export type zone = 'tefudaCards' 
    | 'shieldCards'
    | 'battleCards'
    | 'chojigenCards'
    | 'yamafudaCards'
    | 'manaCards'
    | 'bochiCards'

export type groupableZone = 'shieldCards' | 'battleCards'

export type player = 'a' | 'b'

export type side = 'lower' | 'upper'

export type cardState = {
    tapped?: boolean,
    faceDown?: boolean,
    markColor?: string
}

export type playerCards = {
    manaCards: Card[]
    battleCards: Card[]
    bochiCards: Card[]
    shieldCards: Card[]
    tefudaCards: Card[]
    yamafudaCards: Card[]
    chojigenCards: Card[]
}
