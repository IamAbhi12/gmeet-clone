
const socket = io()
const videoGrid = document.getElementById('video-grid')
const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})
let USER_ID;
const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)

    peer.on('call', (call) => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user_connected', userId => {
        // connectToNewUser(userId, stream)
        setTimeout(connectToNewUser, 1000, userId, stream)
    })
})

socket.on('user_disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

const msg = document.querySelector('input')
const chatMsg = document.getElementById('chat_message')

chatMsg.addEventListener('keydown', e => {
    if (e.keyCode == 13 && msg.value.length !== 0) {
        socket.emit('message', msg.value);
        msg.value = '';
    }
})
const sendMsg = document.querySelector('.main__send__message')

sendMsg.addEventListener('click', () => {
    if (msg.value.length !== 0) {
        socket.emit('message', msg.value);
        msg.value = '';
    }
})

socket.on('new-message', message => {
    const messages = document.querySelector('ul')
    messages.innerHTML += `<li class="message"><b>user</b><br>${message}</li><br>`
    scrollToBottom()
})

peer.on('open', id => {
    socket.emit('join_room', ROOM_ID, id)
    USER_ID = id;
})

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

function scrollToBottom() {
    const d = document.querySelector('.main__chat__window');
    d.scrollTop = d.scrollHeight;
}

function muteUnmute() {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

function playStop() {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

function leaveMeet() {
    window.location = '/logout';
}

function setMuteButton() {
    const html = `
      <i class="fa-solid fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

function setUnmuteButton() {
    const html = `
      <i class="unmute fa-solid fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

function setStopVideo() {
    const html = `
      <i class="fa-solid fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

function setPlayVideo() {
    const html = `
    <i class="stop fa-solid fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

