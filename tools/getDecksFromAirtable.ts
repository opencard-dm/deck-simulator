/**
 * カード名からAirtableのIDを検索し付与します。
 */
import 'dotenv/config'
import { SourceDeck } from '@/entities/Deck';
import Airtable from 'airtable'
import { readFileSync,  writeFileSync } from 'fs'
import decks from '../src/decks.json' assert { type: "json" }

console.assert(process.env.AIRTABLE_SECRET_TOKEN, 'AIRTABLE_SECRET_TOKEN is required')

var base = new Airtable({
    apiKey: process.env.AIRTABLE_SECRET_TOKEN
}).base('appNBBdv4EODRJJJI');

const deckFiles = [
    'tools/json/202401_赤青マジック.json',
    'tools/json/202402_フィオナアカシック.json',
    'tools/json/202401_アナカラージャオウガ.json',
    'tools/json/202401_黒緑アビス.json',
    'tools/json/202402_青黒魔道具.json',
    'tools/json/202402_赤緑アポロ.json',
    'tools/json/202402_青黒コンプレックス_超CSⅥ福岡4位.json',
]

for (const file of deckFiles) {
    const sourceDeck: SourceDeck = JSON.parse(readFileSync(file, 'utf8'))

    for (const card of sourceDeck.cards) {
        card.cd = await fetchCardIdByName(card.name)
    }
    sourceDeck.source = 'airtable'
    // デッキを追加
    decks.push(sourceDeck as any)
    console.log(sourceDeck)
}
writeFileSync('./src/decks.json', JSON.stringify(decks, null, 2));

async function fetchCardIdByName(name: string) {
    const records = await base('cards').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 3,
        view: "Grid view",
        filterByFormula: `name = "${name}"`
    }).firstPage();
    if (records.length === 0) {
        console.error(`カード"${name}"が見つかりませんでした`)
    }
    if (records.length >= 2) {
        console.warn('重複', name)
    }
    const record = records[0]
    return record.id
}
