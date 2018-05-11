const express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

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
});