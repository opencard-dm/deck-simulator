import { SourceDeck } from '@@/core/entities/Deck'
import { readFileSync, writeFileSync } from 'fs'

const DECKS_FILE = 'src/decks.json'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    if (!body.deck) {
        setResponseStatus(event, 422)
        return {}
    }
    const deck: SourceDeck = body.deck
    
    const decks: SourceDeck[] = JSON.parse(readFileSync(DECKS_FILE, 'utf8'))
    for (const systemDeck of decks) {
        if (systemDeck.name === deck.name) {
            systemDeck.cards = deck.cards
            systemDeck.chojigenCards = deck.chojigenCards
            systemDeck.grCards = deck.grCards
            break
        }
    }
    writeFileSync(DECKS_FILE, JSON.stringify(decks, null, 2))
})
