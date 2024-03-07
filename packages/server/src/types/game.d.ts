interface PlayerInGameStatus {
  id: number
  handCard: string[]
  turn: boolean
  uid: string
  life: number
  socketId: string
  nickName: string
  dead: boolean
}

export type PlayerInGameStatusArray = PlayerInGameStatus[]

export interface PlayerStatus {
  uid: string
  nickName: string
  host: boolean
  readyStatus: boolean
  socketId: string
}

export type PlayerStatusArray = PlayerStatus[]
