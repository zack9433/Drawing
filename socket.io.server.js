var SocketIOSrv = {
    init: function( server ) {
        var io = require( 'socket.io' ).listen( server );

        io.configure('production', function() {
            io.set( 'log level', 1 );

            io.set('transports', [
               'websocket',
               'flashsocket',
               'htmlfile',
               'xhr-polling',
               'jsonp-polling'
            ]);
        });

        io.configure('development', function() {
            io.set( 'log level', 1 );

            io.set( 'transports', ['websocket'] );
        });

        io.sockets.on('connection', function (socket) {
            socket.emit('index', { msg: 'Hello world!' });
            socket.on('paint', function( data ) {
                socket.broadcast.emit( 'paint', data );
            });
        });
    }
};

module.exports = {
    init: SocketIOSrv.init
};
