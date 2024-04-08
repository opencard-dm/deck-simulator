/**
 * 現在airtableはローカルでのデッキデータのjsonファイル作成に使用し、本番環境では使用していません。
 */
import 'dotenv/config'
import { CardDetail } from '@/entities/Deck';
import Airtable from 'airtable'
import { FireStore } from '../server/firestore'
import { getCardDetailFromRecord } from './helpers';

type CardDetails = {[key: string]: CardDetail}

console.assert(process.env.AIRTABLE_SECRET_TOKEN, 'AIRTABLE_SECRET_TOKEN is required')

const base = new Airtable({
    apiKey: process.env.AIRTABLE_SECRET_TOKEN
}).base('appNBBdv4EODRJJJI');

base('cards').select({
    // Selecting the first 3 records in List:
    maxRecords: 1000,
    view: "カード一覧",
    filterByFormula: 'IS_AFTER({updated_at}, "2024-02-18")',
}).eachPage(function page(records, fetchNextPage) {
    records.forEach(async function(record) {
        // TODO: コストがないカードに対応
        if (!Number.isInteger(record.get('cost'))) {
            console.warn('skipped', record.fields)
            return true
        }
        const cardDetail = getCardDetailFromRecord(record)
        // console.log(cardDetail)
        if (record.get('combined_card')) {
            const combinedCard = await base('cards').find(record.get('combined_card') as string)
            cardDetail.combined_card = getCardDetailFromRecord(combinedCard)
        }
        try {
            FireStore.db.doc(`/cards/${record.id}`).set(cardDetail)
        } catch (error) {
            console.error(cardDetail)
            throw error
        }
        // FireStore.db.doc(`/cards/${record.id}`).set({
        //     id: cardDetail.id,
        //     name: cardDetail.name,
        //     races: cardDetail.races,
        //     cost: cardDetail.cost,
        //     power: cardDetail.power,
        //     card_text: cardDetail.card_text,
        //     civilizations: cardDetail.civilizations,
        //     combined_card: cardDetail.combined_card,
        // })
        console.log('Retrieved', record.get('name'));
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
});
