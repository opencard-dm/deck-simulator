import { SourceDeck } from '@/entities/Deck';
import { Firebase } from '@/helpers/firebase';
import { useAuthStore } from '@/stores/auth';
import { doc, setDoc, addDoc, collection, getDocs } from 'firebase/firestore';

export async function addDeck(deck: SourceDeck) {
  const authStore = useAuthStore()
  const collectionRef = collection(Firebase.db, `/users/${authStore.user?.uid}/decks`);
  await addDoc(collectionRef, deck)
}

export async function updateDeck(deck: SourceDeck) {
  if (!deck.id) {
    console.error('id is required')
    return
  }
  const authStore = useAuthStore()
  const deckRef = doc(Firebase.db, `/users/${authStore.user?.uid}/decks/${deck.id}`)
  await setDoc(deckRef, deck)
}

export async function getUserDecks(): Promise<SourceDeck[]> {
  const authStore = useAuthStore()
  if (authStore.user === null) {
    return []
  }
  const decksRef = collection(Firebase.db, `/users/${authStore.user.uid}/decks`);
  const decks = await getDocs(decksRef)
  const sourceDecks: SourceDeck[] = []
  decks.forEach(deckRef => {
    const deck = deckRef.data() as SourceDeck
    deck.id = deckRef.id
    sourceDecks.push(deck)
  })
  return sourceDecks
}

export async function createUserDoc() {
  const authStore = useAuthStore()
  const docRef = doc(Firebase.db, `/users/${authStore.user?.uid}`);
  return setDoc(docRef, {
    decks: []
  })
}
