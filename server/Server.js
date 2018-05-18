var express = require('express'), app = express(), http = require('http').Server(app), io = require('socket.io')(http), firebase = require('firebase'), firebase_config = {
    apiKey: "AIzaSyC6V5XWXQCC_zdGWsXPND4OVpwYGS7VsAE",
    authDomain: "buyao-70f4a.firebaseapp.com",
    databaseURL: "https://buyao-70f4a.firebaseio.com",
    projectId: "buyao-70f4a",
    storageBucket: "buyao-70f4a.appspot.com",
    messagingSenderId: "409751210552"
};
firebase.initializeApp(firebase_config);
http.listen(process.env.PORT || 48763, function () {
    console.log('Computer listening on :' + process.env.PORT);
});
io.on('connection', function (socket) {
    socket.on('test', function (data) {
        console.log(data);
        io.emit('test', "success " + data.split(' ').reverse());
    });
    socket.on('disconnect', function () {
        console.log('say goodbye');
        io.emit('test', "ru disconnected?");
    });
    socket.on('auth', function (data) {
        console.log("get login data from " + data.email + ", start auth process..");
        firebase.auth().signInWithEmailAndPassword(data.email, data.password)
            .then(function () {
            io.emit('auth', { type: 'success', code: 'default' });
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
    });
    socket.on('logout', function (data) {
        console.log("We've received logout signal from " + data.email + ", star logout process...");
        firebase.auth().signOut()
            .then(function () {
            io.emit('logout', { type: 'success', code: 'default' });
        })
            .catch(function (error) {
            io.emit('logout', { type: 'error', code: "" + error.code });
        });
    });
    socket.on('create_room', function () {
        //創立房間、隨機生成id並加入
        //加入後將id返回客戶端
        var id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        socket.join(id);
        io.emit('room', { type: 'joined_room', id: "" + id });
        //roomID會被存放在每個unique-id底下
        //透過key() 來得到
        var RoomKey = firebase.database().ref('rooms').push({ id: id }).key();
        console.log(RoomKey);
    });
    socket.on('join_room', function (RoomId) {
        socket.join(RoomId);
    });
});
//# sourceMappingURL=Server.js.map