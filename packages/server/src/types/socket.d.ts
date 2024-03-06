export interface RegisterUser {
  email: string
  password: string
  nickname: string
}

export interface LoginUser {
  email: string
  password: string
}

export interface LoginResponse {
  type: 'success' | 'error'
  code: string
  token?: string
  nickname?: string
  email?: string
  uid?: string
}

export type RegisterResponse = Omit<LoginResponse, 'token'>

export interface CreateRoom {
  uid: string
  roomId: string
  socketId: string
}

export interface JoinRoom {
  roomId: string
  userId: string
  socketId: string
}

export interface LeaveRoom {
  roomId: string
  index: number
}

declare module 'socket.io' {
  interface Socket {
    username: string
    room: string
    token: string
    GameStatus: string
    card: string[]
  }
}
