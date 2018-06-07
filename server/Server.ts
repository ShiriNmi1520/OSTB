///<reference path="node_modules/@types/node/index.d.ts"/>
import * as giveCard from "./giveCard";
import * as firebase from "firebase";
import * as http from "http";
import io from "socket.io";
import express = require("express");
import jwt = require("jsonwebtoken");

const app: any = express(),
	FIREBASE_CONFIG: object = {
		apiKey: "AIzaSyC6V5XWXQCC_zdGWsXPND4OVpwYGS7VsAE",
		authDomain: "buyao-70f4a.firebaseapp.com",
		databaseURL: "https://buyao-70f4a.firebaseio.com",
		projectId: "buyao-70f4a",
		storageBucket: "buyao-70f4a.appspot.com",
		messagingSenderId: "409751210552"
	},
	card: Array<string> = ["Bang", "Miss"];
let http2: any = new http.Server(app);
let mainSocket: any = io(http2);
// 生日快樂啦!
firebase.initializeApp(FIREBASE_CONFIG);
http2.listen(process.env.PORT || 48763, () => {
	console.log("Computer listening on :" + process.env.PORT);
});

// 現在createRoom join_room執行時需附帶auth成功時返回的token
// 否則function不會執行，直接回傳status 403
mainSocket.on("connection", (socket: any) => {
	socket.room = "";
	socket.token = "";
	socket.GameStatus = "";

	socket.on("test", (data: any) => {
		console.log(data);
		mainSocket.emit("test", `success ${data.split(" ").reverse()}`);
	});

	socket.on("disconnect", () => {
		mainSocket.emit("test", "ru disconnected?");
	});

	socket.on("auth", (data: any) => {
		firebase.auth().signInWithEmailAndPassword(data.email, data.password)
			.then(() => {
				// 創立一個token，往後執行動作皆需附帶此token，否則傳回403 error
				const profileForToken: object = { email: data.email, password: data.password };
				const token: string = jwt.sign(profileForToken, "token", {
					expiresIn: 60 * 60 * 24
				});
				socket.token = token;
				mainSocket.emit("auth", { type: "success", code: "default", token, email: data.email });
			})
			// todo: 登入完之後煩到 firebase 抓取使用者的 nickname 跟 email 再 emit 回來，感恩
			// todo: 再加一個 uid 感恩。
			.catch((error) => {
				const errorCode: string = error.code;
				mainSocket.emit("auth", { type: "error", code: `${errorCode}` });
			});
	});

	socket.on("register", (data: any) => {
		let uid: string = "";
		firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
			.then(() => {
				firebase.auth().signInWithEmailAndPassword(data.email, data.password)
					.then(() => {
						firebase.auth().onAuthStateChanged((user: any) => {
							uid = user.uid;
							console.log(uid);
							firebase.database().ref("/users/").child(uid).update({ name: data.nickname });
						});
					});
				mainSocket.emit("auth", { type: "success", code: "default", uid: uid });
				// https://stackoverflow.com/questions/38352772/is-there-any-way-to-get-firebase-auth-user-uid
				// 這邊有抓ＵＩＤ的方式，你再試試看，感謝。
				// 想不到怎麼寫的話請直接說，都可討論。
			})
			.catch((error) => {
				// 處理錯誤區塊
				let errorCode: string = error.code;
				mainSocket.emit("auth", { type: "error", code: `${errorCode}` });
			});
	});
	// todo: 另外那個 註冊的時候往 firebase 推 mail 的話會有命名規範的問題（不可以有.)，再一起想看看怎麼處理，感恩。
	// todo: 註冊的時候順便往 firebase 的 users/${userEmail} 底下推暱稱，接的格式用 data.nickname，感謝。
	// todo: 註冊的時候順便網 firebase 的 users/${userEmail} 底下推ＵＩＤ，接的格式用 data.uid，感謝。
	// uID 看你要自己做還是抓 firebase 的UID，總之我做登入的時候記得要丟回來給我就好。
	socket.on("logout", () => {
		firebase.auth().signOut()
			.then(() => {
				mainSocket.emit("logout", { type: "success", code: "default" });
				socket.token = "";
			})
			.catch((error) => {
				mainSocket.emit("logout", { type: "error", code: `${error.code}` });
			});
	});

	socket.on("createRoom", (data: any) => {
		// 創立房間、隨機生成id並加入
		// 加入後將id返回客戶端om
		// 其實你可以先 const ROOM_PATH = firebase.database().ref('/rooms/')
		// 然後再 let roomKey: string = ROOM_PATH.push({ id: id, room: data }).key;
		// 或是你想過直接把 id 做成路徑？
		// 像 firebase.database().ref(`/rooms/${id}`)
		const path: any = firebase.database().ref(`/room/`).child(data.uid);
		const playerPath: any = firebase.database().ref(`/room/${data.uid}/player`);
		const nicknamePath: any = firebase.database().ref(`/users/${data.uid}`);
		let nickname: string = "";
    let playerData: object = {};
		nicknamePath.once("value", (snap: any) => {
			nickname = snap.val();
		});
		console.log(data);
		path.set({
      room: data.roomId,
      player: {}
		});
		playerPath.push({
			uid: data.uid,
			nickname: nickname,
			host: true,
			readyStatus: true
		}).then(() => {
			playerPath.once("value", (snap: any) => {
				playerData = snap.val();
			}).then(() => {
				mainSocket.to(data.uid).emit("createRoom", { id: data.uid, room: data.roomId, player: playerData });
			});
		}).catch((err: any) => {
      console.log(err);
    });
		socket.join(data.uid);
		// 這裡測試用，我加了 'room': data, 不對的話可以自行刪除。
	});

	socket.on("getRoomId", (data: any) => {
		firebase.database().ref("/room/").once("value", snap => {
			mainSocket.to(data.id).emit("getRoomId", snap.val());
		});
	});

	socket.on("joinRoom", (data: any) => {
		// 加入其他玩家所創的Room
    // 並將Room內在線人數傳回
    console.log(data);
    let error : any = false;
		const path: any = firebase.database().ref(`/room/${data.roomId}/player`);
		const nicknamePath: any = firebase.database().ref(`/users/${data.userId}/name`);
    let nickname: string = "";
    path.once("value", (snap: any) => {
      mainSocket.emit("updateRoomStatus", snap.val());
      if (snap.val().length >= 4) {
        mainSocket.emit("error");
        error = true;
      return error;
      }
    });
    if (error === true) {
      return 1;
    }
    nicknamePath.once("value", (snap: any) => {
			nickname = snap.val();
		});
    path.push({ host: false, nickname: nickname, readyStatus: false, uid: data.userId});
    socket.join(data.roomId);
		mainSocket.to(data).emit("Player joined!");
		// todo: 往 firebase 也推一下吧？我不確定你的房間的系統架構到底長怎樣...
    // todo: 記得往我這邊也丟一下資料，原本就在房間的人也更新一下資料。
    return ;
    });

	socket.on("InGameChat", (data: any) => {
		if (data.senderName && data.content) {
			mainSocket.emit("InGameChat", { name: data.senderName, content: data.content });
		}
	});
	// todo: 返回一下玩家列表、房主token，再寫一個在房間裡面準備（大家都準備好房主才能按開始）的功能，像這樣寫。
	// 玩家列表的格式為： { nickname: '', uid: '', ready: false, master: false, self: false } 有其他的你再加寫。

	socket.on("exitRoom", (data: any) => {
    console.log(data);
    if(data.host === false) {
      const removePlayer : any = firebase.database().ref(`/room/${data.roomId}/player/${data.index}`);
      removePlayer.remove();
      socket.leave(data.roomId);
    }
		// firebase.database().ref("/rooms/").child(data).remove();
	});

	socket.on("userStatus", (data : any) => {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				firebase.database().ref("/users/").child(user.uid).once("value", snap => {
					mainSocket.to(data.clientId).emit("userStatus", { email: user.email, uid: user.uid, nickname: snap.val() });
				});
			} else {
				mainSocket.emit("userStatus", { login: false });
			}
		});
	});

	socket.on("gameStart", () => {
	 const path : any = firebase.database().ref("/room/");
	});

	socket.on("drawCard", (count: any) => {
		giveCard.getRandom(card, count);
		giveCard.getRandomWithType(count);
	});
	// todo: 那個 初始抽牌的部分是根據玩家抽到的角色卡血量來決定應該抽多少張，所以你可能還要再寫一個發角色卡
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
	socket.on("gameOver", () => {
		socket.leave(socket.room);
		socket.room = "";
	});

	socket.on("card", (data: any) => {
		switch (data.card) {
			case "Bang":
				mainSocket.emit("card", { who: data.id, card: data.card, target: data.target });
				mainSocket.to(data.target).emit(`You've been attacked by ${data.id}\nDid u have "miss"?`);
				// todo: 這邊只要 emit 觸發的事件給我就好 不需要寫訊息喔
				socket.on("response", (data: any) => {
					switch (data) {
						case true:
							mainSocket.to(data.id).emit("Attack success!");
							mainSocket.to(data.target).emit("You lost 1 life!");
							// 這裡直接丟資料回來給我 不需要訊息
							break;
						case false:
							mainSocket.to(data.id).emit("Attack fail!");
						// 這裡直接丟資料回來給我 不需要訊息
					}
				});
		}
	});

	socket.on("ShutdownSignal", () => {
		socket.emit("Server is going down in five minutes");
		socket.broadcast.emit("Server is going down in five minutes");
		setTimeout(ShutDownProcess, 300000);

		function ShutDownProcess(): void {
			process.exit(0);
		}
	});

});

// todo: 規則在這邊，煩請詳閱。'https://zh.wikipedia.org/wiki/砰！#基本版遊戲概要'