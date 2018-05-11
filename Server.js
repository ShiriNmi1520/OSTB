var express = require('express'), app = express(), http = require('http').Server(app), io = require('socket.io')(http);
http.listen(process.env.PORT || 48763, function () {
    console.log('Computer listening on :' + process.env.PORT);
});
io.on('connection', function (socket) {
    socket.on('test', function (data) {
        io.emit('test', data);
    });
    socket.on('test1', function (data) {
        io.emit('test1', data);
    });
    socket.on('test2', function (data) {
        io.emit('test2', data);
    });
    socket.on('disconnect', function () {
        console.log('say goodbye');
    });
});
//# sourceMappingURL=Server.js.map