import { Card } from "./Card";

type civilization = 'light'
    | 'water'
    | 'dark'
    | 'fire'
    | 'nature'
    | 'zero'

type cardType = 'ツインパクト'
    | 'クリーチャー'
    | '呪文'
    | '進化クリーチャー'
    | 'サイキック'
    | 'ドラグハート'
    | 'フィールド'
    | '城'
    | 'クロスギア'
    | 'エグザイル・クリーチャー'
    | 'GR'
    | 'オレガ・オーラ'
    | 'タマシード'

export interface CardDetail {
    id: string
    main_card_id?: number
    imageUrl?: string
    backImageUrl?: string
    name: string
    name_ruby?: string
    image_paths?: string[]
    types?: cardType[]
    power: string | null
    power_int?: number
    cost: number
    civilizations: civilization[]
    races?: string[]
    card_text: string
    combined_card?: CardDetail
}

export interface Deck {
    name: string
    dmDeckId: string
    cards: Card[]
    chojigenCards: Card[]
    grCards: Card[]
    cardDetails?: {[key: string]: CardDetail}
    hasChojigen: boolean
}

export interface DecksSource {
    url: string
    decks: SourceDeck[]
}

export interface SourceDeck {
    /** firestoreのid */
    id?: string
    name: string
    source: 'firebase' | 'airtable' | 'googleSheet' | 'builtin'
    cards: SourceCard[]
    chojigenCards: SourceCard[]
    grCards: SourceCard[]
    cardDetails?: {[key: string]: CardDetail}
}

export interface SourceCard {
    imageUrl?: string
    name?: string
    cd: string
    backImageUrl?: string
    times: number
}

export type GmCard = {
    large_image_url: string,
}

export interface GmDeckData {
    name: string
    dm_deck_id: string
    main_cards: GmCard[]
    hyper_spatial_cards: GmCard[]
    gr_cards: GmCard[]
}