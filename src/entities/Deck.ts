import { Card } from "./Card";

export interface Deck {
    name: string
    dmDeckId: string
    cards: Card[]
    chojigenCards: Card[]
    grCards: Card[]
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