///<reference path="node_modules/@types/node/index.d.ts"/>
import * as giveCard from "./giveCard";
import * as firebase from "firebase";
import * as http from "http";
import express from "express";
import io from "socket.io";
import jwt from "jsonwebtoken";
const app :any = express(),
	FIRREBASE_CONFIG :object = {
		apiKey: "AIzaSyC6V5XWXQCC_zdGWsXPND4OVpwYGS7VsAE",
		authDomain: "buyao-70f4a.firebaseapp.com",
		databaseURL: "https://buyao-70f4a.firebaseio.com",
		projectId: "buyao-70f4a",
		storageBucket: "buyao-70f4a.appspot.com",
		messagingSenderId: "409751210552"
	},
	card :Array<string> = ["Bang", "Miss"];
  let http2:any = new http.Server(app);
// 生日快樂啦!
firebase.initializeApp(FIRREBASE_CONFIG);
http2.listen(process.env.PORT || 48763, () => {
	console.log("Computer listening on :" + process.env.PORT);
});

// 現在createRoom join_room執行時需附帶auth成功時返回的token
// 否則function不會執行，直接回傳status 403
io.on("connection", (socket) => {
	socket.room = "";
	socket.token = "";
	socket.GameStatus = "";

	socket.on("test", (data) => {
		console.log(data);
		io.emit("test", `success ${data.split(" ").reverse()}`);
	});

	socket.on("disconnect", () => {
		io.emit("test", "ru disconnected?");
	});

	socket.on("auth", (data) => {
		console.log(`get login data from ${data.email}, start auth process..`);
		firebase.auth().signInWithEmailAndPassword(data.email, data.password)
			.then(() => {
				// 創立一個token，往後執行動作皆需附帶此token，否則傳回403 error
				const profileForToken :object = {email: data.email, password:data.password};
				const token :string= jwt.sign(profileForToken, "token", {
					expiresIn: 60*60*24
				});
				socket.token = token;
				io.emit("auth", {type: "success", code: "default", token, email: data.email});
			})
      // todo: 登入完之後煩到 firebase 抓取使用者的 nickname 跟 email 再 emit 回來，感恩
      // todo: 再加一個 uid 感恩。
			.catch((error) => {
				const errorCode :string = error.code;
				io.emit("auth", {type: "error", code: `${errorCode}`});
			});
	});

	socket.on("register", (data) => {
		console.log(`we've received register signal from ${data.email}, start register process...`);
		console.log(data.email, data.password);
		io.emit("test", "we got it:)");
		firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
			.then(() => {
				io.emit("reg", {type: "success", code: "default"});
				// https://stackoverflow.com/questions/38352772/is-there-any-way-to-get-firebase-auth-user-uid
        // 這邊有抓ＵＩＤ的方式，你再試試看，感謝。
        // 想不到怎麼寫的話請直接說，都可討論。
			})
			.catch((error) => {
				// 處理錯誤區塊
				let errorCode :string = error.code;
				io.emit("reg", {type: "error", code: `${errorCode}`});
			});
		let nameKey :string = firebase.database().ref("/users/").child(data.email).push({name: data.nickname}).key;
  });
	// todo: 另外那個 註冊的時候往 firebase 推 mail 的話會有命名規範的問題（不可以有.)，再一起想看看怎麼處理，感恩。
  // todo: 註冊的時候順便往 firebase 的 users/${userEmail} 底下推暱稱，接的格式用 data.nickname，感謝。
  // todo: 註冊的時候順便網 firebase 的 users/${userEmail} 底下推ＵＩＤ，接的格式用 data.uid，感謝。
  // uID 看你要自己做還是抓 firebase 的UID，總之我做登入的時候記得要丟回來給我就好。
	socket.on("logout", (data) => {
	  console.log(`We've received logout signal from ${data.email}, star logout process...`);
		firebase.auth().signOut()
			.then(() => {
				io.emit("logout", {type: "success", code: "default"});
				socket.token = "";
			})
			.catch((error) => {
				io.emit("logout", {type: "error", code: `${error.code}`});
			});
	});

	socket.on("createRoom", (data) => {
		// 創立房間、隨機生成id並加入
		// 加入後將id返回客戶端om
		let id: string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		// 其實你可以先 const ROOM_PATH = firebase.database().ref('/rooms/')
    // 然後再 let roomKey: string = ROOM_PATH.push({ id: id, room: data }).key;
    // 或是你想過直接把 id 做成路徑？
    // 像 firebase.database().ref(`/rooms/${id}`)
		let RoomKey: string = firebase.database().ref("/rooms/").push({id: id, room: data}).key;
		socket.join(id);
		io.to(id).emit("createRoom", {"id": id, "key": RoomKey, "room": data});
		console.log(data);
		// 這裡測試用，我加了 'room': data, 不對的話可以自行刪除。
		// roomID會被存放在每個unique-id底下
		// 透過key() 來得到
		// 傳送的data作為遊戲室名稱
		console.log(`Created room name ${data}`);
	});

	socket.on("getRoomId", (data) => {
		firebase.database().ref("/rooms/").once("value", snap => {
			console.log(snap.val());
			io.to(data.id).emit("getRoomId", snap.val());
		});
	});

	socket.on("joinRoom", (data) => {
		// 加入其他玩家所創的Room
		// 並將Room內在線人數傳回
			socket.join(data);
			io.to(data).emit("Player joined!");
			console.log(`Now we have ${io.sockets.adapter.rooms[data].length} clients`);
			// todo: 往 firebase 也推一下吧？我不確定你的房間的系統架構到底長怎樣...
	});

	socket.on("InGameChat", (data) => {
		if (data.name && data.content) {
			io.emit("InGameChat", {name: data.name, content: data.content});
		}
	});
	// todo: 返回一下玩家列表、房主token，再寫一個在房間裡面準備（大家都準備好房主才能按開始）的功能，像這樣寫。
  // 玩家列表的格式為： { nickname: '', uid: '', ready: false, master: false, self: false } 有其他的你再加寫。
	socket.on("exitRoom", (data) => {
		firebase.database().ref("/rooms/").child(data).remove();
	});

	socket.on("DrawCard", (count) => {
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
	socket.on("GameOver", () => {
		socket.leave(socket.room);
		socket.room = "";
	});

	socket.on("card", (data) => {
		switch(data.card) {
      case "Bang":
				io.emit("card", {who: data.id, card: data.card, target: data.target});
				io.to(data.target).emit(`You've been attacked by ${data.id}\nDid u have "miss"?`);
				// todo: 這邊只要 emit 觸發的事件給我就好 不需要寫訊息喔
				socket.on("response", (data) => {
					switch(data) {
						case true:
							io.to(data.id).emit("Attack success!");
							io.to(data.target).emit("You lost 1 life!");
							// 這裡直接丟資料回來給我 不需要訊息
							break;
						case false:
							io.to(data.id).emit("Attack fail!");
              // 這裡直接丟資料回來給我 不需要訊息
          }
				});
		}
	});

	socket.on("ShutdownSignal", () => {
		socket.emit("Server is going down in five minutes");
		socket.broadcast.emit("Server is going down in five minutes");
		setTimeout(ShutDownProcess, 300000);
		function ShutDownProcess():void {
			process.exit(0);
		}
	});

});

// todo: 規則在這邊，煩請詳閱。'https://zh.wikipedia.org/wiki/砰！#基本版遊戲概要'