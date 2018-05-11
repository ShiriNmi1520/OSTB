const express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

http.listen(process.env.PORT || 48763, () => {
	console.log('Computer listening on :' + process.env.PORT);
});

io.on('connection', (socket) => {
	socket.on('test', (data) => {
		io.emit('test', data)
	});
	socket.on('test1', (data) => {
		io.emit('test1', data)
	});
	socket.on('test2', (data) => {
		io.emit('test2', data)
	});
	socket.on('disconnect', () => {
		console.log('say goodbye')
	});
});