import { DecksSource, SourceDeck } from '@/entities/Deck';
import { read, utils } from 'xlsx'

export async function fetchDeck(url: string): Promise<DecksSource> {
    const file = await (await fetch(url)).arrayBuffer()
    const workbook = read(file);
    const decks: SourceDeck[] = []
    workbook.SheetNames.forEach(sheetName => {
        const rows: any[] = utils.sheet_to_json(workbook.Sheets[sheetName], {
            blankrows: false,
            header: 1
        }).filter((row: any, i) => {
            if (i === 0) return false
            if (!row[0]) return false
            return true
        })
        const deck: SourceDeck = {
            name: sheetName,
            source: url,
            cards: rows.map(row => ({
                imageUrl: row[0],
                times: row[1],
            })),
            chojigenCards: [],
            grCards: []
        }
        decks.push(deck)
    })
    return {
        url,
        decks,
    }
}
