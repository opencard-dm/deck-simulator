import { GameHistoryData } from '@@/core/entities/game';
import { Firebase } from '../helpers/firebase'
import { arrayUnion, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { FirebaseRoomType } from '@@/core/services/room.service';

export async function getRoom(roomId: string) {
    const docRef = doc(Firebase.db, Firebase.env('rooms'), roomId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data()
    }
    return null
}

export async function pushHistory(roomId: string, history: GameHistoryData) {
    const docRef = doc(Firebase.db, Firebase.env('rooms'), roomId);
    await updateDoc(docRef, {
        histories: arrayUnion(JSON.stringify(history)),
    })
}

export function listenHistoriesChange(roomId: string, callback: (room: FirebaseRoomType) => void) {
    const docRef = doc(Firebase.db, Firebase.env('rooms'), roomId);
    console.debug('listening snapshot changes', `${roomId}`)
    const unsubscribe = onSnapshot(docRef, snapshot => {
        callback(snapshot.data() as FirebaseRoomType)
    })
    return unsubscribe
}
