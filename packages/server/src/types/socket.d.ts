export interface RegisterUser {
  email: string
  password: string
  nickname: string
}

export interface LoginUser extends Omit<RegisterUser, 'nickname'> {}

export interface LoginResponse {
  type: 'success' | 'error'
  code: string
  token?: string
  nickname?: string
  email?: string
  uid?: string
}

export interface RegisterResponse extends Omit<LoginResponse, 'token'> {}

export interface CreateRoom {
  uid: string
  roomId: string
  socketId: string
}

export interface JoinRoom extends Omit<CreateRoom, 'uid'> {
  userId: string
}
export interface LeaveRoom extends Omit<CreateRoom, 'uid' | 'socketId'> {
  index: number
}

export interface GameChat {
  senderName: string
  content: string
}

export interface GameStart extends Omit<CreateRoom, 'socketId' | 'uid'> {
  host: boolean
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
