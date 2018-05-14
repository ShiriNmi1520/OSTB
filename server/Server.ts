const express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	firebase = require('firebase'),
	firebase_config = {
		apiKey: "AIzaSyC6V5XWXQCC_zdGWsXPND4OVpwYGS7VsAE",
		authDomain: "buyao-70f4a.firebaseapp.com",
		databaseURL: "https://buyao-70f4a.firebaseio.com",
		projectId: "buyao-70f4a",
		storageBucket: "buyao-70f4a.appspot.com",
		messagingSenderId: "409751210552"

	};

firebase.initializeApp(firebase_config);

http.listen(process.env.PORT || 48763, () => {
	console.log('Computer listening on :' + process.env.PORT);
});

io.on('connection', (socket) => {

	socket.on('test', (data) => {
		console.log(data);
		io.emit('test', `success ${data.split(' ').reverse()}`)
	});

	socket.on('disconnect', () => {
		console.log('say goodbye');
		io.emit('test', "ru disconnected?")
	});

	socket.on('auth', (data) => {
		console.log('get login data, start auth process..');
		firebase.auth().signInWithEmailAndPassword(data.email, data.password)
			.then(() => {
				io.emit('auth', {type: 'success', code: 'default'});
			})
			.catch((error) => {
				let errorCode = error.code;
				io.emit('auth', {type: 'error', code: `${errorCode}`});
			})
	});

	socket.on('register', (data) => {
		console.log("we've received register signal, start register process...");
		console.log(data);
		console.log(data.email, data.password);
		io.emit('test', "we got it:)");
		firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
        .then(() => {
          io.emit('reg', {type: 'success', code: 'default'});
        })
        .catch((error) => {
			// 處理錯誤區塊
			    let errorCode = error.code;
			    io.emit('reg', {type: 'error', code: `${errorCode}`});
		    });
	})
});