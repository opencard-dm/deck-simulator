import { SourceDeck } from '@/entities/Deck';
import { Firebase } from '@/helpers/firebase';
import { useAuthStore } from '@/stores/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export async function addDeck(deck: SourceDeck) {
  const authStore = useAuthStore()
  const docRef = doc(Firebase.db, `/users/${authStore.user?.uid}`);
  const userDoc = await getDoc(docRef)
  if (!userDoc.exists()) {
    await createUserDoc()
  }
  await updateDoc(docRef, {
    decks: arrayUnion(deck),
  })
}

export async function getUserDecks(): Promise<SourceDeck[]> {
  const authStore = useAuthStore()
  if (authStore.user === null) {
    return []
  }
  const docRef = doc(Firebase.db, `/users/${authStore.user.uid}`);
  const userDoc = await getDoc(docRef)
  if (userDoc.exists()) {
    return userDoc.get('decks')
  }
  return []
}

export async function createUserDoc() {
  const authStore = useAuthStore()
  const docRef = doc(Firebase.db, `/users/${authStore.user?.uid}`);
  return setDoc(docRef, {
    decks: []
  })
}
