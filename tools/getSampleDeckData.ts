import 'dotenv/config'
import fs from 'fs'
import decks from '../src/decks.json' assert { type: "json" }
import { getDeckData } from '../srv/gm-deck-maker'
import { Deck } from '../src/helpers/Deck'
import { Deck as DeckType } from '../src/entities/Deck';

async function getSampleDeckData() {
    const deckList: DeckType[] = []
    for (const deck of decks) {
        const deckData = await getDeckData(deck.dmDeckId)
        deckList.push(Deck.convertGmFormat(deckData))
    }
    // NOTE: pwdからの相対パス
    fs.writeFileSync('./src/decks.json', JSON.stringify(deckList, null, 2));
}

getSampleDeckData()
