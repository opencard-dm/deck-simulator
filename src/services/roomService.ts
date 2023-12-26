import { db, env } from '../helpers/firebase'
import { arrayUnion, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";

export async function getRoom(roomId: string) {
    const docRef = doc(db, env('rooms'), roomId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data()
    }
    return null
}

export async function pushHistory(roomId: string, history: any) {
    const docRef = doc(db, env('rooms'), roomId);
    await updateDoc(docRef, {
        histories: arrayUnion(JSON.stringify(history)),
    })
}

export async function listenHistoriesChange(roomId: string, callback: Function) {
    const docRef = doc(db, env('rooms'), roomId);
    const unsubscribe = onSnapshot(docRef, snapshot => {
        callback(snapshot.get('histories'))
    })
    return unsubscribe
}
