import { GameHistory, GameHistoryData, GameLog } from "../entities/game"
import axios from "axios"

export async function fetchLog(logId: string): Promise<GameLog> {
  const { data: logData } = await axios.get(`/api/logs/${logId}`)
  const log: GameLog = {
    name: logData.name,
    deck: logData.deck,
    deckb: logData.deckb,
    histories: logData.histories.map((h: GameHistoryData) => GameHistory.fromData(h))
  }
  return log
}
