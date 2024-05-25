import { Firebase } from "@/helpers/firebase";
import { Timestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { GameHistory, GameHistoryData, GameLog } from "../entities/game"
import axios from "axios";
import { SourceDeck } from "../entities/Deck";

type RoomType = {
  histories: GameHistory[]
  deckA?: SourceDeck
  deckB?: SourceDeck
}

export async function fetchRoom(roomId: string): Promise<RoomType | null> {
  const docRef = doc(Firebase.db, Firebase.env('rooms'), roomId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null
  }

  const roomData = docSnap.data()
  const room: RoomType = {
    histories: roomData.histories.map((h: GameHistoryData) => GameHistory.fromData(h)),
    deckA: roomData.deckA,
    deckB: roomData.deckB,
  }
  return room
}

export async function updateRoom(params: {
  roomId: string
  deckA?: SourceDeck
  deckB?: SourceDeck
}): Promise<void> {
  const {
    roomId,
    deckA,
    deckB,
  } = params;
  const docRef = doc(Firebase.db, Firebase.env('rooms'), roomId);

  const updatePramas = {} as any
  if (deckA) {
    updatePramas.deckA = deckA
  }
  if (deckB) {
    updatePramas.deckB = deckB
  }
  await updateDoc(docRef, updatePramas)
  return
}

export async function createRoom(roomId: string) {
  await axios.put(`/api/rooms/${roomId}`);
  return {
    histories: []
  }
}

export async function initializeRoom(params: {
  roomId: string,
  deckA?: SourceDeck
  deckB?: SourceDeck
}) {
  const {
    roomId,
    deckA,
    deckB,
  } = params
  const docRef = doc(Firebase.db, Firebase.env('rooms'), roomId);

  const initParams: any = {
    histories: [],
    ttl: Timestamp.fromMillis(Date.now() + (1 * 60 * 60 * 1000)),
  }
  if (deckA) {
    initParams.deckA = deckA
  }
  if (deckB) {
    initParams.deckB = deckB
  }
  await setDoc(docRef, initParams)
}
