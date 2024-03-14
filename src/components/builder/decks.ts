import { SourceDeck } from '@/entities/Deck';
import { Firebase } from '@/helpers/firebase';
import { useAuthStore } from '@/stores/auth';
import { doc, setDoc, addDoc, collection, getDocs, deleteDoc, getDoc } from 'firebase/firestore';

/**
 * 引数のdeckにidを付与する副作用あり
 */
export async function addDeck(deck: SourceDeck) {
  const authStore = useAuthStore()
  const collectionRef = collection(Firebase.db, `/users/${authStore.user?.uid}/decks`);
  const docRef = await addDoc(collectionRef, deck)
  deck.id = docRef.id
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

export async function deleteDeck(deck: SourceDeck) {
  if (!deck.id) {
    return
  }
  const authStore = useAuthStore()
  const deckRef = doc(Firebase.db, `/users/${authStore.user?.uid}/decks/${deck.id}`)
  await deleteDoc(deckRef)
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

export async function getUserDeck(id: string): Promise<SourceDeck|null> {
  const authStore = useAuthStore()
  if (authStore.user === null) {
    return null
  }
  const deckRef = doc(Firebase.db, `/users/${authStore.user.uid}/decks/${id}`);
  const deckDoc = await getDoc(deckRef)
  const sourceDecks: SourceDeck[] = []
  if (!deckDoc.exists()) {
    return null
  }
  return deckDoc.data() as SourceDeck
}

export async function createUserDoc() {
  const authStore = useAuthStore()
  const docRef = doc(Firebase.db, `/users/${authStore.user?.uid}`);
  return setDoc(docRef, {
    decks: []
  })
}
