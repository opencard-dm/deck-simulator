import { Card } from "@/entities/Card"

export type ZoneType = 'tefudaZone' 
  | 'shieldZone'
  | 'battleZone'
  | 'chojigenZone'
  | 'yamafudaZone'
  | 'manaZone'
  | 'bochiZone'

export class Zone {

  private constructor(
    public cards: Card[]
  ) {

  }

  static init() {
    return new Zone([])
  }
}
