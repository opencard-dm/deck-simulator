export type zone = 'tefudaCards' 
  | 'shieldCards'
  | 'shieldCardGroups'
  | 'battleCards'
  | 'battleCardGroups'
  | 'chojigenCards'
  | 'yamafudaCards'
  | 'manaCards'

export type zoneGroup = 'shieldCardGroups' | 'battleCardGroups'

export type player = 'a' | 'b'

export type cardState = {
    tapped: boolean,
    faceDown: boolean,
    markColor: string
}
