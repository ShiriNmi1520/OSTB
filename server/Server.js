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
        console.log('get login data\nstart auth process..');
    });
    socket.on('register', function (data) {
        console.log("we've received register signal\nstart register process...");
        console.log(data);
        console.log(data.email, data.password);
        io.emit('test', "we got it:)");
    });
});
//# sourceMappingURL=Server.js.map