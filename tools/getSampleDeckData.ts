import 'dotenv/config'
import fs from 'fs'
import decks from '../src/decks.json' assert { type: "json" }
import { getDeckData } from '../srv/gm-deck-maker'
import { Deck } from '../src/helpers/Deck'
import { Deck as DeckType } from '../src/entities/Deck';
import axios from 'axios'

axios.defaults.baseURL = `http://127.0.0.1:${process.env.PORT}`

async function getSampleDeckData() {
    const deckList: DeckType[] = []
    for (const deck of decks) {
        const deckData = Deck.convertGmFormat(await getDeckData(deck.dmDeckId))
        const cardDetails = await Deck.fetchCardsData([
          ...deckData.cards,
          ...deckData.chojigenCards,
        ]);
        deckData.cardDetails = cardDetails
        deckList.push(deckData)
    }
    // NOTE: pwdからの相対パス
    fs.writeFileSync('./src/decks.json', JSON.stringify(deckList, null, 2));
}

getSampleDeckData()
