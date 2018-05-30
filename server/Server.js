"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var giveCard = require("./giveCard");
var express = require('express'), app = express(), http = require('http').Server(app), io = require('socket.io')(http), firebase = require('firebase'), jwt = require('jsonwebtoken'), firebase_config = {
    apiKey: "AIzaSyC6V5XWXQCC_zdGWsXPND4OVpwYGS7VsAE",
    authDomain: "buyao-70f4a.firebaseapp.com",
    databaseURL: "https://buyao-70f4a.firebaseio.com",
    projectId: "buyao-70f4a",
    storageBucket: "buyao-70f4a.appspot.com",
    messagingSenderId: "409751210552"
}, card = ["Bang", "Miss", "Beer", "Panic", "Duel", "GeneralStore", "Indians", "StageCoach", "Salcon", "Jail", "Barrel"];
//生日快樂啦!
firebase.initializeApp(firebase_config);
http.listen(process.env.PORT || 48763, function () {
    console.log('Computer listening on :' + process.env.PORT);
});
//現在createRoom join_room執行時需附帶auth成功時返回的token
//否則function不會執行，直接回傳status 403
io.on('connection', function (socket) {
    socket.room = "";
    socket.token = "";
    socket.GameStatus = "";
    socket.on('test', function (data) {
        console.log(data);
        io.emit('test', "success " + data.split(' ').reverse());
    });
    socket.on('disconnect', function () {
        io.emit('test', "ru disconnected?");
    });
    socket.on('auth', function (data) {
        console.log("get login data from " + data.email + ", start auth process..");
        firebase.auth().signInWithEmailAndPassword(data.email, data.password)
            .then(function () {
            //創立一個token，往後執行動作皆需附帶此token，否則傳回403 error
            var ProfileForToken = { email: data.email, password: data.password }, token = jwt.sign(ProfileForToken, 'token', {
                expiresIn: 60 * 60 * 24
            });
            socket.token = token;
            io.emit('auth', { type: 'success', code: 'default', token: token });
        })
            .catch(function (error) {
            var errorCode = error.code;
            io.emit('auth', { type: 'error', code: "" + errorCode });
        });
    });
    socket.on('register', function (data) {
        console.log("we've received register signal from " + data.email + ", start register process...");
        console.log(data.email, data.password);
        io.emit('test', "we got it:)");
        firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
            .then(function () {
            io.emit('reg', { type: 'success', code: 'default' });
        })
            .catch(function (error) {
            // 處理錯誤區塊
            var errorCode = error.code;
            io.emit('reg', { type: 'error', code: "" + errorCode });
        });
        var nameKey = firebase.database().ref('/users/').child(data.email).push({ name: data.nickname }).key;
        io.emit('reg', { name: data.nickname, key: nameKey });
    });
    // TODO: 註冊的時候順便往 firebase 的 users/${userEmail} 底下推暱稱，接的格式用 data.nickname，感謝。
    socket.on('logout', function (data) {
        console.log("We've received logout signal from " + data.email + ", star logout process...");
        firebase.auth().signOut()
            .then(function () {
            io.emit('logout', { type: 'success', code: 'default' });
            socket.token = "";
        })
            .catch(function (error) {
            io.emit('logout', { type: 'error', code: "" + error.code });
        });
    });
    socket.on('createRoom', function (data) {
        //創立房間、隨機生成id並加入
        //加入後將id返回客戶端om
        var id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        var RoomKey = firebase.database().ref('/rooms/').push({ id: id, room: data }).key;
        socket.join(id);
        io.to(id).emit('createRoom', { 'id': id, 'key': RoomKey });
        //roomID會被存放在每個unique-id底下
        //透過key() 來得到
        //傳送的data作為遊戲室名稱
        console.log("Created room name " + data);
    });
    socket.on('getRoomId', function () {
        firebase.database().ref('/rooms/').once('value', function (snap) {
            console.log(snap.val());
            io.emit('getRoomId', snap.val());
        });
    });
    socket.on('joinRoom', function (data) {
        //加入其他玩家所創的Room
        //並將Room內在線人數傳回
        socket.join(data);
        io.to(data).emit('Player joined!');
        console.log("Now we have " + io.sockets.adapter.rooms[data].length + " clients in " + data);
    });
    socket.on('InGameChat', function (data) {
        if (data.name && data.content) {
            io.emit('InGameChat', { name: data.name, content: data.content });
        }
    });
    socket.on('exitRoom', function (data) {
        firebase.database().ref('/rooms/').child(data).remove();
    });
    socket.on('DrawCard', function (count) {
        giveCard.getRandom(card, count);
        giveCard.getRandomWithType(count);
    });
    // TODO: 那個 初始抽牌的部分是根據玩家抽到的角色卡血量來決定應該抽多少張，所以你可能還要再寫一個發角色卡
    // TODO: 然後再寫一個每回合的抽卡，感謝。
    // 你可以這樣寫
    // 	socket.on('DrawCard', (data) => {
    // 		let CardCount = 0;
    // 		while(true){
    // 			let send = card[Math.floor(Math.random() * card.length)];
    // 			socket.emit('DrawCard', send);
    // 			CardCount ++;
    // 			if (CardCount === data.life) break;
    // 		}
    // 	});
    // 另外無窮迴圈盡量少用，感恩。
    socket.on('GameOver', function () {
        socket.leave(socket.room);
        socket.room = "";
    });
    socket.on('ShutdownSignal', function () {
        socket.emit("Server is going down in five minutes");
        socket.broadcast.emit("Server is going down in five minutes");
        setTimeout(ShutDownProcess, 300000);
        function ShutDownProcess() {
            process.exit(0);
        }
    });
});
// TODO: 規則在這邊，煩請詳閱。'https://zh.wikipedia.org/wiki/砰！#基本版遊戲概要'
//# sourceMappingURL=Server.js.map