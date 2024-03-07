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

export interface DefenseAnswer {
  uid: string
  roomId: string
  socketId: string
  userInGameId: number
  ans: boolean
  usingCard: number
}

export interface NextTurn extends Pick<DefenseAnswer, 'userInGameId' | 'roomId'> {}
