export interface RegisterUser {
  email: string
  password: string
  nickname: string
}

export type LoginUser = Omit<RegisterUser, 'nickname'>

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

export type JoinRoom = Omit<CreateRoom, 'uid'> & {
  userId: string
}

export type LeaveRoom = Omit<CreateRoom, 'uid' | 'socketId'> & {
  index: number
}

export interface GameChat {
  senderName: string
  content: string
}

export type StartGame = Omit<CreateRoom, 'socketId'>

declare module 'socket.io' {
  interface Socket {
    username: string
    room: string
    token: string
    GameStatus: string
    card: string[]
  }
}
