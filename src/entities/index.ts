export type zone = 'tefudaCards' 
  | 'shieldCards'
  | 'battleCards'
  | 'chojigenCards'
  | 'yamafudaCards'
  | 'manaCards'
  | 'bochiCards'

export type groupableZone = 'shieldCards' | 'battleCards'

export type player = 'a' | 'b'

export type side = 'lower' | 'upper'

export type cardState = {
    tapped?: boolean,
    faceDown?: boolean,
    markColor?: string
}
