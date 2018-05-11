var express = require('express'), app = express(), http = require('http').Server(app), io = require('socket.io')(http);
http.listen(process.env.PORT || 48763, function () {
    console.log('Computer listening on :' + process.env.PORT);
});
io.on('connection', function (socket) {
    socket.on('test', function (data) {
        console.log(data);
        io.emit('test', "Success");
    });
    socket.on('disconnect', function () {
        console.log('say goodbye');
    });
});
//# sourceMappingURL=Server.js.map