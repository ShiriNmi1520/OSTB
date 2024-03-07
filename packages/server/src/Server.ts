import * as giveCard from './giveCard'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import {
  getDatabase, ref, update, get, set, push, remove
} from 'firebase/database'
import { FirebaseError } from '@firebase/util'
import { Server, type Socket } from 'socket.io'
import * as jwt from 'jsonwebtoken'
import config from './config'
import {
  type CreateRoom, type GameChat, type GameStart,
  type JoinRoom,
  type LeaveRoom, type LoginResponse,
  type LoginUser, type RegisterResponse,
  type RegisterUser
} from './types/socket'
import { type DefenseAnswer, type NextTurn, type PlayerInGameStatusArray, type PlayerStatus, type UseCard } from './types/game'

const firebaseConfig = {
  apiKey: config.fireBase.apiKey,
  authDomain: config.fireBase.authDomain,
  databaseURL: config.fireBase.databaseURL,
  projectId: config.fireBase.projectId,
  storageBucket: config.fireBase.storageBucket,
  messagingSenderId: config.fireBase.messagingSenderId
}
const card: number[] = [0, 1]
const mainSocket = new Server()
const firebaseInstance = initializeApp(firebaseConfig)
const firebaseAuthInstance = getAuth(firebaseInstance)
const firebaseDatabaseInstance = getDatabase(firebaseInstance)

mainSocket.listen(48763)
console.info('Server is running on port 48763')
console.debug(`Firebase application name: ${firebaseInstance.name}`)

// 現在createRoom join_room執行時需附帶auth成功時返回的token
// 否則function不會執行，直接回傳status 403
mainSocket.on('connection', (socket: Socket) => {
  socket.room = ''
  socket.token = ''
  socket.GameStatus = ''

  socket.on('test', (data: any) => {
    mainSocket.to(socket.id).emit(socket.id)
  })

  socket.on('disconnect', () => {
    mainSocket.to(socket.id).emit('disconnected')
  })

  socket.on('auth', async (data: LoginUser) => {
    try {
      const authStatus = await signInWithEmailAndPassword(firebaseAuthInstance, data.email, data.password)
      const tokenPayload = { email: data.email, password: data.password }
      const userToken: string = jwt.sign(tokenPayload, config.jwt.tokenSecret, {
        expiresIn: config.jwt.tokenExpire,
        algorithm: 'ES512'
      })
      const userRef = ref(firebaseDatabaseInstance, `/users/${authStatus.user.uid}/`)
      const userData = await get(userRef)
      socket.token = userToken
      const transferData: LoginResponse = {
        type: 'success',
        code: 'default',
        token: userToken,
        nickname: userData.val().name,
        email: data.email,
        uid: authStatus.user.uid
      }
      return mainSocket.to(socket.id).emit('auth', transferData)
    } catch (loginError: unknown) {
      if (loginError instanceof FirebaseError) {
        console.error(`Failed login attempt by ${data.email}\nError code ${loginError.code}\nError message ${loginError.message}`)
        const errorCode = loginError.code
        const transferData: LoginResponse = { type: 'error', code: `${errorCode}` }
        return mainSocket.to(socket.id).emit('auth', transferData)
      }
      console.error(`Failed login attempt by ${data.email} (Error not generated by Firebase)`)
      return mainSocket.to(socket.id).emit('auth', { type: 'error', code: 'unknown' })
    }
  })

  socket.on('register', async (data: RegisterUser) => {
    try {
      const registerStatus = await createUserWithEmailAndPassword(firebaseAuthInstance, data.email, data.password)
      const userRef = ref(firebaseDatabaseInstance, `/users/${registerStatus.user.uid}/`)
      await update(userRef, { name: data.nickname })
      const transferData: RegisterResponse = {
        type: 'success',
        code: 'default',
        email: data.email,
        nickname: data.nickname,
        uid: registerStatus.user.uid
      }
      return socket.emit('auth', transferData)
    } catch (registerError: unknown) {
      if (registerError instanceof FirebaseError) {
        console.error(`Failed registration attempt by ${data.email}\nError code ${registerError.code}\nError message ${registerError.message}`)
        const errorCode = registerError.code
        const transferData: RegisterResponse = { type: 'error', code: `${errorCode}` }
        return socket.emit('auth', transferData)
      }
      console.error(`Failed registration attempt by ${data.email} (Error not generated by Firebase)`)
      return socket.emit('auth', { type: 'error', code: 'unknown' })
    }
  })
  // Todo: 另外那個 註冊的時候往 firebase 推 mail 的話會有命名規範的問題（不可以有.)，再一起想看看怎麼處理，感恩。
  // todo: 註冊的時候順便往 firebase 的 users/${userEmail} 底下推暱稱，接的格式用 data.nickname，感謝。
  // todo: 註冊的時候順便網 firebase 的 users/${userEmail} 底下推ＵＩＤ，接的格式用 data.uid，感謝。
  // uID 看你要自己做還是抓 firebase 的UID，總之我做登入的時候記得要丟回來給我就好。
  socket.on('logout', async () => {
    try {
      await signOut(firebaseAuthInstance)
      socket.token = ''
      return mainSocket.to(socket.id).emit('logout', { type: 'success', code: 'default' })
    } catch (logoutError: unknown) {
      if (logoutError instanceof FirebaseError) {
        console.error(`Failed logout attempt by socket ${socket.id}\nError code ${logoutError.code}\nError message ${logoutError.message}`)
        const errorCode = logoutError.code
        return mainSocket.to(socket.id).emit('logout', { type: 'error', code: `${errorCode}` })
      }
      console.error(`Failed logout attempt by socket ${socket.id} (Error not generated by Firebase)`)
      return mainSocket.to(socket.id).emit('logout', { type: 'error', code: 'unknown' })
    }
  })

  socket.on('createRoom', async (data: CreateRoom) => {
    console.debug(`Create room payload:\n${JSON.stringify(data)}`)
    /*
          創立房間、隨機生成id並加入
          加入後將id返回客戶端om
          其實你可以先 const ROOM_PATH = firebase.database().ref('/rooms/')
          然後再 let roomKey: string = ROOM_PATH.push({ id: id, room: data }).key;
          或是你想過直接把 id 做成路徑？
          像 firebase.database().ref(`/rooms/${id}`)
         */
    try {
      const roomRef = ref(firebaseDatabaseInstance, `/room/${data.uid}`)
      const playerRef = ref(firebaseDatabaseInstance, `/room/${data.uid}/player`)
      const nickNameRef = ref(firebaseDatabaseInstance, `/users/${data.uid}`)
      const nickName = await get(nickNameRef).then((snap: any) => snap.val().name)
      await set(roomRef, { room: data.roomId, player: {} })
      await push(playerRef, {
        uid: data.uid,
        nickName,
        host: true,
        readyStatus: true,
        socketId: data.socketId
      })
      const currentPlayers = await get(playerRef).then((snap: any) => snap.val())
      await socket.join(data.uid)
      // 這裡測試用，我加了 'room': data, 不對的話可以自行刪除。
      return mainSocket.to(socket.id).emit('createRoom', {
        host: true,
        id: data.uid,
        nickName,
        player: currentPlayers,
        room: data.roomId,
        readyStatus: true
      })
    } catch (createRoomError: unknown) {
      if (createRoomError instanceof FirebaseError) {
        console.error(`Failed to create room by ${data.uid}\nError code ${createRoomError.code}\nError message ${createRoomError.message}`)
        const errorCode = createRoomError.code
        return mainSocket.to(socket.id).emit('createRoom', { type: 'error', code: `${errorCode}` })
      }
      console.error(`Failed to create room by ${data.uid} (Error not generated by Firebase)`)
      return mainSocket.to(socket.id).emit('createRoom', { type: 'error', code: 'unknown' })
    }
  })

  socket.on('getRoomList', async (data: any) => {
    try {
      const roomRef = ref(firebaseDatabaseInstance, '/room/')
      const snap = await get(roomRef)
      return mainSocket.emit('getRoomList', snap.val())
    } catch (getRoomError: unknown) {
      if (getRoomError instanceof FirebaseError) {
        console.error(`Failed to get room list by ${data.uid}\nError code ${getRoomError.code}\nError message ${getRoomError.message}`)
        const errorCode = getRoomError.code
        return mainSocket.to(socket.id).emit('getRoomList', { type: 'error', code: `${errorCode}` })
      }
      console.error(`Failed to get room list by ${data.uid} (Error not generated by Firebase)`)
      return mainSocket.to(socket.id).emit('getRoomList', { type: 'error', code: 'unknown' })
    }
  })

  socket.on('joinRoom', async (data: JoinRoom) => {
    // 加入其他玩家所創的Room
    // 並將Room內在線人數傳回
    try {
      console.debug(`Join room payload:\n${JSON.stringify(data)}`)
      const playerRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}/player`)
      const roomRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}`)
      const currentUserRef = ref(firebaseDatabaseInstance, `/users/${data.userId}`)
      const currentUserName = await get(currentUserRef).then((snap: any) => snap.val().name)
      let roomStatus = await get(roomRef).then((snap: any) => snap.val())
      if (roomStatus.player.length >= 4) {
        return mainSocket.to(socket.id).emit('error')
      }
      await socket.join(data.roomId)
      await push(playerRef, {
        uid: data.userId,
        nickName: currentUserName,
        host: false,
        readyStatus: false,
        socketId: data.socketId
      })
      roomStatus = await get(roomRef).then((snap: any) => snap.val())
      socket.room = roomStatus.room
      // Broadcast to all players in the room
      mainSocket.to(data.roomId).emit('updateRoomerStatus', { type: 'join', player: roomStatus.player })
      // Emit to the player who joined the room
      return mainSocket.to(socket.id).emit('joinRoom', {
        type: 'join',
        host: false,
        nickName: currentUserName,
        player: roomStatus.player,
        readyStatus: false,
        room: roomStatus.room,
        id: data.roomId
      })
    } catch (joinRoomError: unknown) {
      if (joinRoomError instanceof FirebaseError) {
        console.error(`Failed to join room by ${data.userId}\nError code ${joinRoomError.code}\nError message ${joinRoomError.message}`)
        const errorCode = joinRoomError.code
        return mainSocket.to(socket.id).emit('joinRoom', { type: 'error', code: `${errorCode}` })
      }
      console.error(`Failed to join room by ${data.userId} (Error not generated by Firebase)`)
      return mainSocket.to(socket.id).emit('joinRoom', { type: 'error', code: 'unknown' })
    }
    // todo: 往 firebase 也推一下吧？我不確定你的房間的系統架構到底長怎樣...
    // todo: 記得往我這邊也丟一下資料，原本就在房間的人也更新一下資料。
  })

  socket.on('InGameChat', (data: GameChat) => {
    return mainSocket.emit('InGameChat', { name: data.senderName, content: data.content })
  })
  // Todo: 返回一下玩家列表、房主token，再寫一個在房間裡面準備（大家都準備好房主才能按開始）的功能，像這樣寫。
  // 玩家列表的格式為： { nickname: '', uid: '', ready: false, master: false, self: false } 有其他的你再加寫。

  socket.on('exitRoom', async (data: LeaveRoom) => {
    try {
      console.debug(`Exit room payload:\n${JSON.stringify(data)}`)
      const targetPlayerRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}/player/${data.index}`)
      const playersInRoomRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}/player/`)
      const playerList = await get(playersInRoomRef).then((snap: any) => snap.val())
      await remove(targetPlayerRef)
      await socket.leave(data.roomId)
      socket.emit('updateRoomStatus', { type: 'exit', player: playerList })
      return mainSocket.to(data.roomId).emit('updateRoomStatus', { type: 'exit', player: playerList })
    } catch (exitRoomError: unknown) {
      if (exitRoomError instanceof FirebaseError) {
        console.error(`Failed to exit room by player ${data.index} in room ${data.roomId}\nError code ${exitRoomError.code}\nError message ${exitRoomError.message}`)
        const errorCode = exitRoomError.code
        return mainSocket.to(socket.id).emit('exitRoom', { type: 'error', code: `${errorCode}` })
      }
      console.error(`Failed to exit room by player ${data.index} in room ${data.roomId} (Error not generated by Firebase)`)
      return mainSocket.to(socket.id).emit('exitRoom', { type: 'error', code: 'unknown' })
    }
  })

  socket.on('gameStart', async (data: GameStart) => {
    // 接到房主gameStart，往該房間內所有人推送gameStart(只由房主發送過來，其餘只接收)
    // 請帶data.host，將作為是否創建status, gameInfo之依據
    try {
      const roomRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}`)
      const playerRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}/player`)
      const playerStatusArr: PlayerInGameStatusArray = []
      const playerList = await get(playerRef).then((snap: any) => snap.val())
      playerList.forEach((player: PlayerStatus, index: number) => {
        playerStatusArr.push({
          id: index,
          handCard: [],
          turn: false,
          uid: player.uid,
          life: 4,
          socketId: player.socketId,
          nickName: player.nickName,
          dead: false
        })
      })
      await update(roomRef, {
        status: 'Started',
        gameInfo: {
          playerStatus: playerStatusArr
        }
      })
      socket.broadcast.to(data.roomId).emit('gameStart', { gameStartResult: 'successful', playerStatus: playerStatusArr })
      socket.emit('gameStart', { gameStartResult: 'successful', playerStatus: playerStatusArr })
    } catch (gameStartError: unknown) {
      if (gameStartError instanceof FirebaseError) {
        console.error(`Failed to start game in room ${data.roomId}\nError code ${gameStartError.code}\nError message ${gameStartError.message}`)
        const errorCode = gameStartError.code
        socket.broadcast.to(data.roomId).emit('error', { type: 'error', code: `${errorCode}` })
      }
      console.error(`Failed to start game in room ${data.roomId} (Error not generated by Firebase)`)
      socket.broadcast.to(data.roomId).emit('error', { type: 'error', code: 'unknown' })
    }
  })

  // RoomId & ans & userInGameId
  socket.on('defAns', async (data: DefenseAnswer) => {
    try {
      const roomRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}`)
      const playerStatusRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}/gameInfo/playerStatus/`)
      const playerStatus: PlayerInGameStatusArray = await get(playerStatusRef).then((snap: any) => snap.val())
      // Defending
      if (data.ans) {
        playerStatus[Number(data.userInGameId)].handCard.splice(data.usingCard, 1)
      } else {
        // Subtract life by 1
        playerStatus[Number(data.userInGameId)].life -= 1
        if (playerStatus[Number(data.userInGameId)].life === 0) {
          playerStatus[Number(data.userInGameId)].dead = true
          mainSocket.to(data.socketId).emit('dead')
        }
      }
      await update(roomRef, {
        status: 'inRound',
        gameInfo: {
          playerStatus
        }
      })
      mainSocket.in(data.roomId).emit('getBattleStatus', { playerStatus })
      mainSocket.in(data.roomId).emit('battleLoading', '')
    } catch (defAnsError: unknown) {
      if (defAnsError instanceof FirebaseError) {
        console.error(`Defense answer failed by socket ${data.socketId} in room ${data.roomId}\nError code ${defAnsError.code}\nError message ${defAnsError.message}`)
        const errorCode = defAnsError.code
        mainSocket.to(socket.id).emit('defAns', { type: 'error', code: `${errorCode}` })
      }
      console.error(`Defense answer failed by socket ${data.socketId} in room ${data.roomId} (Error not generated by Firebase)`)
      mainSocket.to(socket.id).emit('defAns', { type: 'error', code: 'unknown' })
    }
  })

  socket.on('turnEnd', async (data: NextTurn) => {
    try {
      const nextPlayerId = data.userInGameId + 1 > 3 ? (data.userInGameId - 4) + 1 : data.userInGameId + 1
      const roomRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}`)
      const playerStatusRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}/gameInfo/playerStatus/`)
      const playerStatus: PlayerInGameStatusArray = await get(playerStatusRef).then((snap: any) => snap.val())
      playerStatus[data.userInGameId].turn = false
      if (playerStatus[nextPlayerId].dead) {
        playerStatus[nextPlayerId + 1].turn = true
        playerStatus[nextPlayerId + 1].handCard.push(...giveCard.getRandom(card, 1))
      } else {
        playerStatus[nextPlayerId].turn = true
        playerStatus[nextPlayerId].handCard.push(...giveCard.getRandom(card, 1))
      }
      await update(roomRef, {
        status: 'inRound',
        gameInfo: {
          playerStatus
        }
      })
      mainSocket.in(data.roomId).emit('getBattleStatus', { playerStatus })
    } catch (turnEndError: unknown) {
      if (turnEndError instanceof FirebaseError) {
        console.error(`Turn end failed in room ${data.roomId}\nError code ${turnEndError.code}\nError message ${turnEndError.message}`)
        const errorCode = turnEndError.code
        mainSocket.to(socket.id).emit('turnEnd', { type: 'error', code: `${errorCode}` })
      }
      console.error(`Turn end failed in room ${data.roomId} (Error not generated by Firebase)`)
      mainSocket.to(socket.id).emit('turnEnd', { type: 'error', code: 'unknown' })
    }
  })

  socket.on('useCard', async (data: UseCard) => {
    try {
      const roomRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}`)
      const playerStatusRef = ref(firebaseDatabaseInstance, `/room/${data.roomId}/gameInfo/playerStatus/`)
      const playerStatus: PlayerInGameStatusArray = await get(playerStatusRef).then((snap: any) => snap.val())
      const card = playerStatus[data.userInGameId].handCard[data.usingCard]
      switch (card) {
        // Attacking
        case '0': {
          playerStatus[data.userInGameId].handCard.splice(data.usingCard, 1)
          mainSocket.to(playerStatus[data.targetUserInGameId].socketId).emit('def', '')
          mainSocket.in(data.roomId).emit('battleLoading', '')
          mainSocket.in(data.roomId).emit('getBattleStatus', { playerStatus })
          break
        }
      }
      await update(roomRef, {
        status: 'inRound',
        gameInfo: {
          playerStatus
        }
      })
    } catch (useCardError: unknown) {
      if (useCardError instanceof FirebaseError) {
        console.error(`Turn end failed in room ${data.roomId}\nError code ${useCardError.code}\nError message ${useCardError.message}`)
        const errorCode = useCardError.code
        mainSocket.to(socket.id).emit('useCard', { type: 'error', code: `${errorCode}` })
      }
      console.error(`Turn end failed in room ${data.roomId} (Error not generated by Firebase)`)
      mainSocket.to(socket.id).emit('useCard', { type: 'error', code: 'unknown' })
    }
  })

  socket.on('drawCard', () => {
    socket.card = giveCard.getRandom(card, 1)
  })
  // Todo: 那個 初始抽牌的部分是根據玩家抽到的角色卡血量來決定應該抽多少張，所以你可能還要再寫一個發角色卡
  // todo: 然後再寫一個每回合的抽卡，感謝。
  // 你可以這樣寫
  // socket.on('DrawCard', (data) => {
  //   let CardCount = 0;
  //   while(true){
  //     let send = card[Math.floor(Math.random() * card.length)];
  //     socket.emit('DrawCard', send);
  //     cardCount ++;
  //     if (CardCount === data.life) break;
  //   }
  // });
  // 另外無窮迴圈盡量少用，感恩。
  // todo: 記得寫個 gameStart ， 它返回使用者在遊戲裡面的id (1~4), emit 給 client 端，感謝。
  // 要丟回來的有 player: [{
  //   id: 0,
  //   charCard: 0,
  //   life: 0,
  //   handCard: [{id: 1},{id: 2},{id: 3},{id: 4}]
  // },{
  //   id: 1,
  //   charCard: 2,
  //   life: 3,
  //   handCard: [{id: 1},{id: 2},{id: 3},{id: 4}]},{
  //   id: 2,
  //   charCard: 0,
  //   life: 0,
  //   handCard: [{id: 1},{id: 2},{id: 3},{id: 4}]
  // },{
  //   id: 3,
  //   charCard: 0,
  //   life: 0,
  //   handCard: [{id: 1},{id: 2},{id: 3},{id: 4}]
  // }]
  // 以上資料希望可以實時更新，每次有玩家對這場遊戲觸發任何事件都丟回來。
  socket.on('gameOver', async () => {
    await socket.leave(socket.room)
    socket.room = ''
  })

  socket.on('ShutdownSignal', () => {
    socket.emit('Server is going down in five minutes')
    socket.broadcast.emit('Server is going down in five minutes')
    setTimeout(ShutDownProcess, 300000)

    function ShutDownProcess (): void {
      process.exit(0)
    }
  })
})

// Todo: 規則在這邊，煩請詳閱。'https://zh.wikipedia.org/wiki/砰！#基本版遊戲概要'
