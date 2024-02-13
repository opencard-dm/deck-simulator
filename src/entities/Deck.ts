import { Card } from "./Card";

export interface CardDetail {
    id: string
    main_card_id?: number
    name: string
    name_ruby?: string
    image_paths?: string[]
    sub_types?: {
        sub_type_id: number
        name: string
        sort: number
    }[]
    power: string | null
    power_int?: number
    cost: number
    civilizations: string[]
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
}

export interface DecksSource {
    url: string
    decks: SourceDeck[]
}

export interface SourceDeck {
    name: string
    source: string
    cards: SourceCard[]
    chojigenCards: SourceCard[]
    grCards: SourceCard[]
    cardDetails?: {[key: string]: CardDetail}
}

export interface SourceCard {
    imageUrl: string
    name: string
    cd?: string
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