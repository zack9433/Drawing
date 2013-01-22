(function( io, $, undefined ) {
    var Drawing = {
        init: function( canvas ) {
            var socket = io.connect(),
                self = this;

            self.setSocket( socket );
            socket.on( 'index', self.showHelloMsg );
            socket.on( 'paint', self.paint );
            self.setContext( canvas.getContext('2d') );
            self.setLineWidth( 6 );
            self.setColor( "#" + Math.floor( Math.random() * 16777215 ).toString( 16 ) );
            self.setStartDrawStatus( false );
            self.setCounter( 0 );
        },

        showHelloMsg: function( data ) {
            console.log( data );
        },

        paint: function( data ) {
            console.log( data );
            var context = Drawing.getContext();
            context.strokeStyle  = data.color;
            Drawing.setStartDrawStatus( true );
            context.beginPath();
            context.moveTo( data.from_x, data.from_y );
            context.lineTo( data.to_x, data.to_y );
            context.stroke();
            Drawing.setStartDrawStatus( false );
        },

        setCounter: function( counter ) {
            this.counter = counter;
        },

        getCounter: function() {
            return this.counter;
        },

        setStartDrawStatus: function( status ) {
            this.startDrawing = status;
        },

        getStartDrawStatus: function() {
            return this.startDrawing;
        },

        setLineWidth: function( width ) {
            var context = this.getContext();
            context.lineWidth = width;
        },

        getLineWidth: function() {
            var context = this.getContext();
            return context.lineWidth;
        },

        setColor: function( color ) {
            this.color = color;
        },

        getColor: function() {
            return this.color;
        },

        setSocket: function( socket ) {
            this.socket = socket;
        },

        getSocket: function() {
            return this.socket;
        },

        setCoordinate: function( x, y ) {
            var coordinate= this.coordinate || {};
            coordinate.x = x;
            coordinate.y = y;
            this.coordinate = coordinate;
        },

        getCoordinate: function() {
            return this.coordinate;
        },

        setContext: function( context ) {
            this.context = context;
        },

        getContext: function() {
            return this.context;
        },

        mousePressToDraw: function( ev ) {
            var context = Drawing.getContext();
            Drawing.setCoordinate( ev.offsetX, ev.offsetY );
            context.beginPath();
            context.moveTo( ev.offsetX, ev.offsetY );
            Drawing.setStartDrawStatus( true );
        },

        mouseMoveToDraw: function( ev ) {
            if ( Drawing.getStartDrawStatus() ) {
            
                var context = Drawing.getContext(),
                    coordinate = Drawing.getCoordinate(),
                    counter = Drawing.getCounter();

                counter++;
                Drawing.setCounter( counter );
                context.strokeStyle = Drawing.getColor();
                context.lineTo( ev.offsetX, ev.offsetY );
                context.stroke();
                if ( counter % 5 === 0 ) {
                    if ( coordinate.x !== -1 && coordinate.y !== -1) {
                        Drawing.getSocket().emit('paint',{
                            color: Drawing.getColor(),
                            from_x: coordinate.x,
                            from_y: coordinate.y,
                            to_x: ev.offsetX,
                            to_y: ev.offsetY
                        });
                    }
                    Drawing.setCoordinate( ev.offsetX, ev.offsetY );
                }
            }
        },

        mouseFinishDrawing: function( ev ) {
            if ( Drawing.getStartDrawStatus() ) {
                Drawing.mouseMoveToDraw( ev );
                Drawing.setStartDrawStatus( false );
                Drawing.setCounter( 1 );
                //reset the last cords
                Drawing.setCoordinate( -1, -1 );
            }
        },

        fingerPressToDraw: function( ev ) {
            var touch = ev.originalEvent.touches[0] || ev.originalEvent.changedTouches[0];
            var $elm = $( ev.target );
            var offset = $elm.offset();
            var x = touch.pageX - offset.left;
            var y = touch.pageY - offset.top;
            if ( x < $elm.width() && x > 0 ) {
                if( y < $elm.height() && y > 0 ) {
                    Drawing.setCoordinate( touch.pageX, touch.pageY );
                    var context = Drawing.getContext();
                    context.beginPath();
                    context.moveTo( touch.pageX, touch.pageY );
                    Drawing.setStartDrawStatus( true );
                }
            }
        },

        fingerMoveToDraw: function( ev ) {
            ev.preventDefault();
            var touch = ev.originalEvent.touches[0] || ev.originalEvent.changedTouches[0];
            var $elm = $( ev.target );
            var offset = $elm.offset();
            var x = touch.pageX - offset.left;
            var y = touch.pageY - offset.top;
            if ( x < $elm.width() && x > 0 ) {
                if( y < $elm.height() && y > 0 ) {

                    if ( Drawing.getStartDrawStatus() ) {
                    
                        var context = Drawing.getContext(),
                            coordinate = Drawing.getCoordinate(),
                            counter = Drawing.getCounter();

                        counter++;
                        Drawing.setCounter( counter );
                        context.strokeStyle = Drawing.getColor();
                        context.lineTo( touch.pageX, touch.pageY );
                        context.stroke();
                        if ( counter % 5 === 0 ) {
                            if ( coordinate.x !== -1 && coordinate.y !== -1) {
                                Drawing.getSocket().emit('paint',{
                                    color: Drawing.getColor(),
                                    from_x: coordinate.x,
                                    from_y: coordinate.y,
                                    to_x: touch.pageX,
                                    to_y: touch.pageY
                                });
                            }
                            Drawing.setCoordinate( touch.pageX, touch.pageY );
                        }
                    }
                }
            }
        },

        fingerFinishDrawing: function( ev ) {
            var touch = ev.originalEvent.touches[0] || ev.originalEvent.changedTouches[0];
            var context = Drawing.getContext();
            var $elm = $( ev.target );
            var offset = $elm.offset();
            var x = touch.pageX - offset.left;
            var y = touch.pageY - offset.top;
            if ( x < $elm.width() && x > 0 ) {
                if( y < $elm.height() && y > 0 ) {
                    if ( Drawing.getStartDrawStatus() ) {
                        Drawing.fingerMoveToDraw( ev );
                        Drawing.setStartDrawStatus( false );
                        Drawing.setCounter( 1 );
                        //reset the last cords
                        Drawing.setCoordinate( -1, -1 );
                    }
                }
            }
        },

        setCanvasRect: function( $canvas ) {
            var winHeight = $( window ).height(),
                canvasWidth = $canvas.width(),
                headHeight = $( 'header' ).height();

            $canvas.attr( 'width', canvasWidth );
            $canvas.attr( 'height', winHeight - headHeight - 5 );
        }
    };

    $(function() {

        var $canvas = $( '#canvas' );

        $( window ).resize(function() {
            Drawing.setCanvasRect( $canvas );
        });
        
        Drawing.setCanvasRect( $canvas );
        Drawing.init( $canvas[0] );
        $( 'article.container' )
            .on( 'mousemove', '#canvas', Drawing.mouseMoveToDraw )
            .on( 'mousedown', '#canvas',Drawing.mousePressToDraw )
            .on( 'mouseup', '#canvas', Drawing.mouseFinishDrawing )
            .on( 'touchmove', '#canvas', Drawing.fingerMoveToDraw )
            .on( 'touchstart', '#canvas',Drawing.fingerPressToDraw )
            .on( 'touchend', '#canvas', Drawing.fingerFinishDrawing );
    });
})( io, jQuery )
