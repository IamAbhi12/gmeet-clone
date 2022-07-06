const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const socketIO = require('socket.io')
const io = socketIO(server)
const { v4: uuidV4 } = require('uuid')
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
})
const cookieSession = require('cookie-session');
const { nextTick } = require('process')
const passport = require('passport')
require('./passport-setup');

//middleware
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/peerjs', peerServer)
app.use(passport.initialize());
app.use(passport.session());

//to store the room information
let ROOM_ID;

//to start a new room
app.get('/', (req, res) => {
    ROOM_ID = uuidV4();
    if (req.user) {
        res.redirect(`/${ROOM_ID}`)
    } else
        res.redirect('/auth/google')
})

//to join an existing room
app.get('/:room', (req, res) => {
    ROOM_ID = req.params.room;
    if (req.user)
        res.render('room', { roomId: ROOM_ID })
    else
        res.redirect('/auth/google')
})

//socket code
io.on('connection', (socket) => {
    socket.on('join_room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user_connected', userId)

        socket.on('message', message => {
            io.to(roomId).emit('new-message', message)

        })
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user_disconnected', userId)
        })
        socket.on('left', (userId, roomId) => {
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

//google authentication

app.get('/auth/google/failure', (req, res) => {
    res.send('Could Not Login, Try Again...');
})

app.get('/auth/google',
    passport.authenticate('google', {
        scope:
            ['email', 'profile']
    }
    ));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: (ROOM_ID) ? `/${ROOM_ID}` : `/${uuidV4()}`,
        failureRedirect: '/auth/google/failure'
    }));

server.listen(process.env.PORT || 3000)