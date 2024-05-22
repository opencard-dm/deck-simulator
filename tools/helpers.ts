import 'dotenv/config'
import { CardDetail } from '@@/core/entities/Deck'
import { Record, FieldSet } from 'airtable'

export function getCardDetailFromRecord(record: Record<FieldSet>): CardDetail {
    return {
        // カード名をIDにする
        id: record.id as string,
        name: record.get('name') as string,
        races: record.get('race_names') ? record.get('race_names') as string[] : [],
        cost: record.get('cost') as number,
        power: record.get('power') as string || null,
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
