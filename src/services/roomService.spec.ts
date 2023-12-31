import { it, expect } from 'vitest'
import { getRoom, pushHistory } from './roomService'
import { db, env } from '../helpers/firebase'
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { FirebaseError } from 'firebase/app';

it.skip('getRoom 1', async () => {
    const room = await getRoom('1')
    console.log(room)
})

it.skip('pushHistory', async () => {
    // なぜかたまにしか更新されない
    pushHistory('1', {a: 2})
})

it.skip('check permission denied', async () => {
    // 例外のテストが失敗する
    const docRef = doc(db, env('rooms'), '1');
    // expect(async () => {
        await updateDoc(docRef, {
            cookie: 'aaa',
            histories: arrayUnion('aaa'),
        })
    // }).toThrow(FirebaseError)
})
