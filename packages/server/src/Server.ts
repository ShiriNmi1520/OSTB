import * as giveCard from './giveCard'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth'
import {
  getDatabase, ref, onValue, update, get, set, push
} from 'firebase/database'
import { Server, type Socket } from 'socket.io'
import * as jwt from 'jsonwebtoken'
import config from './config'
import {
  type CreateRoom,
  type JoinRoom,
  type LeaveRoom, type LoginResponse,
  type LoginUser, type RegisterResponse,
  type RegisterUser
} from './types/socket'
import { type PlayerStatusArray } from './types/game'

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

  socket.on('auth', (data: LoginUser) => {
    function loginProcess (): any {
      return new Promise((resolve, reject) => {
        signInWithEmailAndPassword(firebaseAuthInstance, data.email, data.password)
          .then(() => {
            const tokenPayload = { email: data.email, password: data.password }
            const token: string = jwt.sign(tokenPayload, config.jwt.tokenSecret, {
              expiresIn: config.jwt.tokenExpire
            })
            socket.token = token
            onAuthStateChanged(firebaseAuthInstance, user => {
              if (user != null) {
                const userRef = ref(firebaseDatabaseInstance, `/users/${user.uid}/`)
                onValue(userRef, (snap: any) => {
                  const transferData: LoginResponse = {
                    type: 'success',
                    code: 'default',
                    token,
                    nickname: snap.val(),
                    email: data.email,
                    uid: user.uid
                  }
                  resolve(transferData)
                })
              }
            })
          })
        // Todo: 登入完之後煩到 firebase 抓取使用者的 nickname 跟 email 再 emit 回來，感恩
        // todo: 再加一個 uid 感恩。
          .catch(error => {
            const errorCode = error.code
            const transferData: LoginResponse = { type: 'error', code: `${errorCode}` }
            reject(transferData)
          })
      })
    }

    loginProcess().then((fulfilled: any) => {
      mainSocket.to(socket.id).emit('auth', fulfilled)
    }).catch((rejected: any) => {
      mainSocket.to(socket.id).emit('auth', rejected)
    })
  })

  socket.on('register', (data: RegisterUser) => {
    function registerProcess (): any {
      return new Promise((resolve, reject) => {
        createUserWithEmailAndPassword(firebaseAuthInstance, data.email, data.password)
          .then(() => {
            signInWithEmailAndPassword(firebaseAuthInstance, data.email, data.password)
              .then(() => {
                console.debug('')
                onAuthStateChanged(firebaseAuthInstance, (user: any) => {
                  console.debug(`Ready to push player nickName for user ${user.uid}`)
                  const userRef = ref(firebaseDatabaseInstance, `/users/${user.uid}/`)
                  update(userRef, { name: data.nickname }).then(() => {
                    const transferData: RegisterResponse = {
                      type: 'success',
                      code: 'default',
                      email: data.email,
                      nickname: data.nickname,
                      uid: user.uid
                    }
                    resolve(transferData)
                  })
                })
              })
          })
          .catch(error => {
            const errorCode: string = error.code
            const transferData: RegisterResponse = { type: 'error', code: `${errorCode}` }
            reject(transferData)
          })
      })
    }

    registerProcess()
      .then((fulfilled: any) => {
        socket.emit('auth', fulfilled)
      })
      .catch((rejected: any) => {
        // MainSocket.socket(socket.id).emit(rejected);
        socket.emit('error', rejected)
      })
  })
  // Todo: 另外那個 註冊的時候往 firebase 推 mail 的話會有命名規範的問題（不可以有.)，再一起想看看怎麼處理，感恩。
  // todo: 註冊的時候順便往 firebase 的 users/${userEmail} 底下推暱稱，接的格式用 data.nickname，感謝。
  // todo: 註冊的時候順便網 firebase 的 users/${userEmail} 底下推ＵＩＤ，接的格式用 data.uid，感謝。
  // uID 看你要自己做還是抓 firebase 的UID，總之我做登入的時候記得要丟回來給我就好。
  socket.on('logout', () => {
    signOut(firebaseAuthInstance)
      .then(() => {
        mainSocket.to(socket.id).emit('logout', { type: 'success', code: 'default' })
        socket.token = ''
      })
      .catch(error => {
        mainSocket.to(socket.id).emit('logout', { type: 'error', code: `${error.code}` })
      })
  })

  socket.on('createRoom', (data: CreateRoom) => {
    console.debug(`createRoom ${JSON.stringify(data)}`)
    // 創立房間、隨機生成id並加入
    // 加入後將id返回客戶端om
    // 其實你可以先 const ROOM_PATH = firebase.database().ref('/rooms/')
    // 然後再 let roomKey: string = ROOM_PATH.push({ id: id, room: data }).key;
    // 或是你想過直接把 id 做成路徑？
    // 像 firebase.database().ref(`/rooms/${id}`)
    const roomRef = ref(firebaseDatabaseInstance, `/room/${data.uid}`)
    const playerRef = ref(firebaseDatabaseInstance, `/room/${data.uid}/player`)
    const nickNameRef = ref(firebaseDatabaseInstance, `/users/${data.uid}`)
    let nickName = ''
    let playerData: Record<string, unknown> = {}
    get(nickNameRef).then((snap: any) => {
      nickName = snap.val().name
      console.debug(`created room ${data.uid} by ${nickName}`)
      set(roomRef, { room: data.roomId, player: {} })
        .then(() => {
          push(playerRef, {
            uid: data.uid,
            nickName,
            host: true,
            readyStatus: true,
            socketId: data.socketId
          })
          get(playerRef).then((snap: any) => {
            playerData = snap.val()
            get(nickNameRef).then((snap: any) => {
              mainSocket.to(socket.id).emit('createRoom', {
                host: true,
                id: data.uid,
                nickName: snap.val().name,
                player: playerData,
                room: data.roomId,
                readyStatus: true
              })
            })
          })
        })
    })
    socket.join(data.uid)
    // 這裡測試用，我加了 'room': data, 不對的話可以自行刪除。
  })

  socket.on('getRoomList', (data: any) => {
    const roomRef = ref(firebaseDatabaseInstance, '/room/')
    get(roomRef).then((snap: any) => {
      mainSocket.emit('getRoomList', snap.val())
    })
  })

  socket.on('joinRoom', (data: JoinRoom): void => {
    // 加入其他玩家所創的Room
    // 並將Room內在線人數傳回
    console.log(`joinRoom ${JSON.stringify(data)}`)
    socket.join(data.roomId)
    let error: any = false
    let room = ''
    const playerPath: any = firebase.database().ref(`/room/${data.roomId}/player`)
    const roomPath: any = firebase.database().ref(`/room/${data.roomId}`)
    const nickNamePath: any = firebase.database().ref(`/users/${data.userId}/`)
    let nickName = ''
    nickNamePath.once('value', (snap: any) => {
      nickName = snap.val().name
    })
      .then(() => {
        playerPath.push({
          host: false,
          nickName,
          readyStatus: false,
          uid: data.userId,
          socketId: data.socketId
        })
        playerPath.once('value', (snap: any) => {
          mainSocket.to(data.roomId).emit('updateRoomerStatus', { type: 'join', player: snap.val() })
          roomPath.once('value', (snap: any) => {
            room = snap.val().room
          })
          mainSocket.to(socket.id).emit('joinRoom', {
            type: 'join',
            host: false,
            nickName,
            player: snap.val(),
            readyStatus: false,
            room,
            id: data.roomId
          })
          if (snap.val().length >= 4) {
            mainSocket.to(socket.id).emit('error')
            error = true
            return error
          }
        })
        if (error === true) {
          return
        }

        nickNamePath.once('value', (snap: any) => {
          nickName = snap.val().name
        })
        roomPath.once('value', (snap: any) => {
          socket.room = snap.val().room
        })
      })
    // todo: 往 firebase 也推一下吧？我不確定你的房間的系統架構到底長怎樣...
    // todo: 記得往我這邊也丟一下資料，原本就在房間的人也更新一下資料。
  })

  socket.on('InGameChat', (data: any) => {
    if (data.senderName && data.content) {
      mainSocket.emit('InGameChat', { name: data.senderName, content: data.content })
    }
  })
  // Todo: 返回一下玩家列表、房主token，再寫一個在房間裡面準備（大家都準備好房主才能按開始）的功能，像這樣寫。
  // 玩家列表的格式為： { nickname: '', uid: '', ready: false, master: false, self: false } 有其他的你再加寫。

  socket.on('exitRoom', (data: LeaveRoom) => {
    console.log(`exitRoom ${data}`)
    const removePlayer: any = firebase.database().ref(`/room/${data.roomId}/player/${data.index}`)
    const playerPath: any = firebase.database().ref(`/room/${data.roomId}/player/`)
    removePlayer.remove()
    playerPath.once('value', (snap: any) => {
      mainSocket.to(data.roomId).emit('updateRoomerStatus', { type: 'exit', player: snap.val() })
      socket.emit('updateRoomerStatus', { type: 'exit', player: snap.val() })
    })
    socket.leave(data.roomId)
  })

  socket.on('gameStart', (data: any) => {
    // 接到房主gameStart，往該房間內所有人推送gameStart(只由房主發送過來，其餘只接收)
    // 請帶data.host，將作為是否創建status, gameInfo之依據
    const playerStatus: PlayerStatusArray = [
      {
        id: 0,
        handCard: [],
        turn: true,
        uid: '',
        life: 4,
        socketId: '',
        nickName: '',
        dead: false
      },
      {
        id: 1,
        handCard: [],
        turn: false,
        uid: '',
        life: 4,
        socketId: '',
        nickName: '',
        dead: false
      },
      {
        id: 2,
        handCard: [],
        turn: false,
        uid: '',
        life: 4,
        socketId: '',
        nickName: '',
        dead: false
      },
      {
        id: 3,
        handCard: [],
        turn: false,
        uid: '',
        life: 4,
        socketId: '',
        nickName: '',
        dead: false
      }
    ]

    function setGameStatus (): any {
      return new Promise((resolve, reject) => {
        const roomPath: any = firebase.database().ref('/room/')
        firebase.database().ref(`/room/${data.roomId}/player`).once('value', (snap: any) => {
          let counter = 0
          Object.keys(snap.val()).forEach(index => {
            // 抓玩家資料
            playerStatus[counter].uid = snap.val()[index].uid
            playerStatus[counter].socketId = snap.val()[index].socketId
            playerStatus[counter].nickName = snap.val()[index].nickName
            playerStatus[counter].handCard = giveCard.getRandom(card, 6)
            counter += 1
          })
        })
          .then(() => {
            roomPath.child(data.roomId).update({
              status: 'Started',
              gameInfo:
                    {
                      playerStatus
                    }
            })
              .then(() => {
                const result: Record<string, unknown> = { gameStartResult: 'successful' }
                resolve(result)
              })
              .catch((err: any) => {
                const resultErr: Record<string, unknown> = err
                reject(resultErr)
              })
          })
      })
    }

    async function executeGameStartProcess (): Promise<void> {
      await setGameStatus()
        .then((fulfilled: any) => {
          socket.broadcast.to(data.roomId).emit('gameStart', { fulfilled, playerStatus })
          socket.emit('gameStart', { fulfilled, playerStatus })
        })
        .catch((rejected: any) => {
          socket.broadcast.to(data.roomId).emit('error', rejected)
        })
    }

    if (data.host === true) {
      executeGameStartProcess()
    }
  })

  // RoomId & ans & userInGameId
  socket.on('defAns', (data: any) => {
    firebase.database().ref(`room/${data.roomId}/gameInfo/playerStatus/`).once('value', (snap: any) => {
      const playerStatus: any[] = snap.val()
      if (data.ans === true) {
        playerStatus[Number(data.userInGameId)].handCard.splice(data.usingCard, 1)
        firebase.database().ref('/room/').child(data.roomId).update({
          status: 'inRound',
          gameInfo:
              {
                playerStatus
              }
        })
          .then(() => {
            mainSocket.in(data.roomId).emit('getBattleStatus', { playerStatus })
          })
        mainSocket.in(data.roomId).emit('battleLoading', '')
      }

      if (data.ans === false) {
        const playerLife: number = playerStatus[Number(data.userInGameId)].life
        playerStatus[Number(data.userInGameId)].life = playerLife - 1
        if (playerStatus[Number(data.userInGameId)].life === 0) {
          playerStatus[Number(data.userInGameId)].dead = true
          mainSocket.to(data.socketId).emit('dead')
        }

        firebase.database().ref('/room/').child(data.roomId).update({
          status: 'inRound',
          gameInfo:
              {
                playerStatus
              }
        })
          .then(() => {
            mainSocket.in(data.roomId).emit('getBattleStatus', { playerStatus })
          })
        mainSocket.in(data.roomId).emit('battleLoading', '')
      }
    })
  })

  socket.on('turnEnd', (data: any) => {
    const whoIsNext: number = data.inGameId + 1 > 3 ? (data.inGameId - 4) + 1 : data.inGameId + 1
    firebase.database().ref(`/room/${data.roomId}/gameInfo/playerStatus/`).once('value', (snap: any) => {
      const playerStatus: any[] = snap.val()
      playerStatus[data.inGameId].turn = false
      if (playerStatus[whoIsNext].dead === true) {
        playerStatus[whoIsNext + 1].turn = true
        playerStatus[whoIsNext + 1].handCard.push(giveCard.getRandom(card, 1))
      } else {
        playerStatus[whoIsNext].turn = true
        playerStatus[whoIsNext].handCard.push(giveCard.getRandom(card, 1))
      }

      firebase.database().ref('/room/').child(data.roomId).update({
        status: 'inRound',
        gameInfo:
            {
              playerStatus
            }
      })
        .then(() => {
          mainSocket.in(data.roomId).emit('getBattleStatus', { playerStatus })
        })
    })
  })

  socket.on('useCard', (data: any) => {
    firebase.database().ref(`/room/${data.roomId}/gameInfo/playerStatus/`).once('value', (snap: any) => {
      const playerStatus: any[] = snap.val()
      switch (snap.val()[data.cardUserInGameId].handCard[data.usingCard]) {
        // 0為攻擊
        case 0: {
          playerStatus[data.cardUserInGameId].handCard.splice(data.usingCard, 1)
          mainSocket.to(playerStatus[data.targetUserInGameId].socketId).emit('def', '')
          mainSocket.in(data.roomId).emit('battleLoading', '')
          firebase.database().ref('/room/').child(data.roomId).update({
            status: 'inRound',
            gameInfo:
                {
                  playerStatus
                }
          })
            .then(() => {
              mainSocket.in(data.roomId).emit('getBattleStatus', { playerStatus })
            })
        }
      }
    })
  })

  socket.on('drawCard', () => {
    socket.card = giveCard.getRandom(card, 1)
  })
  // Todo: 那個 初始抽牌的部分是根據玩家抽到的角色卡血量來決定應該抽多少張，所以你可能還要再寫一個發角色卡
  // todo: 然後再寫一個每回合的抽卡，感謝。
  // 你可以這樣寫
  // 	socket.on('DrawCard', (data) => {
  // 		let CardCount = 0;
  // 		while(true){
  // 			let send = card[Math.floor(Math.random() * card.length)];
  // 			socket.emit('DrawCard', send);
  // 			cardCount ++;
  // 			if (CardCount === data.life) break;
  // 		}
  // 	});
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
  socket.on('gameOver', () => {
    socket.leave(socket.room)
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
