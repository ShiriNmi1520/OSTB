export interface PlayerStatus {
  id: number
  handCard: string[]
  turn: boolean
  uid: string
  life: number
  socketId: string
  nickName: string
  dead: boolean
}

export type PlayerStatusArray = PlayerStatus[]
