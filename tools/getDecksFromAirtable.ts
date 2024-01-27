/**
 * 現在airtableはローカルでのデッキデータのjsonファイル作成に使用し、本番環境では使用していません。
 */
import 'dotenv/config'
import { CardDetail, SourceDeck } from '@/entities/Deck';
import Airtable from 'airtable'
import { readFileSync,  writeFileSync } from 'fs'
import decks from '../src/decks.json' assert { type: "json" }

type CardDetails = {[key: string]: CardDetail}

console.assert(process.env.AIRTABLE_SECRET_TOKEN, 'AIRTABLE_SECRET_TOKEN is required')

var base = new Airtable({
    apiKey: process.env.AIRTABLE_SECRET_TOKEN
}).base('appNBBdv4EODRJJJI');

const deckFiles = [
    'tools/json/202401_黒緑アビス.json',
]

for (const file of deckFiles) {
    const cardDetails: CardDetails = {}
    const sourceDeck: SourceDeck = JSON.parse(readFileSync(file, 'utf8'))

    for (const card of sourceDeck.cards) {
        await fetchCardByName(card.name, cardDetails)
    }
    sourceDeck.source = 'airtable'
    sourceDeck.cardDetails = cardDetails
    // デッキを追加
    decks.push(sourceDeck as any)
    console.log(sourceDeck)
}
writeFileSync('./src/decks.json', JSON.stringify(decks, null, 2));

async function fetchCardByName(name: string, cardDetails: CardDetails) {

    const records = await base('cards').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 3,
        view: "Grid view",
        filterByFormula: `name = "${name}"`
    }).firstPage();
    if (records.length === 0) {
        console.error(`カード"${name}"が見つかりませんでした`)
    }
    const record = records[0]
    cardDetails[name] = {
        // カード名をIDにする
        id: record.get('name') as string,
        name: record.get('name') as string,
        cost: record.get('cost') as number,
        power: record.get('power') as string,
        card_text: record.get('text') as string,
        civilizations: Array.from(record.get('civilizations') as any).map((c) => {
            switch (c) {
                case '光':
                    return 'light';
                case '水':
                    return 'water';
                case '闇':
                    return 'dark';
                case '火':
                    return 'fire';
                case '自然':
                    return 'nature';
                case 'ゼロ':
                    return 'zero';
                default:
                    c;
            }
        }) as string[],
    }
}
