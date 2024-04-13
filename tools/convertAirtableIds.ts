/**
 * yarn ts-node tools/convertAirtableIds.ts
 */

import { SourceDeck } from '@/entities/Deck'
import { writeFileSync, readFileSync } from 'fs'
import cardnames from '../src/cardnames.json' assert { type: "json" }

const DECKS_FILE = 'src/decks.json'

main()

async function main() {
  const decks: SourceDeck[] = JSON.parse(readFileSync(DECKS_FILE, 'utf8'))
  for (const systemDeck of decks) {
    systemDeck.cards.forEach(card => {
      if (card.name && (card.name in cardnames)) {
        card.cd = cardnames[card.name]
      }
    })
  }
  writeFileSync(DECKS_FILE, JSON.stringify(decks, null, 2))
}
