'use strict'
const socket = io()
const videoGrid = document.getElementById('video-grid')
// const peer = new Peer(undefined, {
//     path: '/peerjs',
//     host: '/',
//     port: '443'
// })
const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3001'
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

peer.on('open', id => {
    USER_ID = id;
    socket.emit('join_room', ROOM_ID, USER_ID)

})

const msg = document.querySelector('input')
const chatMsg = document.getElementById('chat_message')

function addMyMessage() {
    const message = msg.value;
    const messages = document.querySelector('ul')
    var data = {msg : "hi", from : "someone"};
    data.msg = message
    data.from = USER_NAME
    messages.innerHTML += `<li class="message"><a style = "font-weight:500;">${USER_NAME}</a><br><p>${message}</p></li><br>`
    scrollToBottom();
    socket.emit('send', data);
    msg.value = '';
}

chatMsg.addEventListener('keydown', e => {
    if (e.keyCode == 13 && msg.value.length !== 0) {
        addMyMessage()
    }
})

const sendMsg = document.querySelector('.main__send__message')

sendMsg.addEventListener('click', (e) => {
    e.preventDefault();
    if (msg.value.length !== 0) {
        addMyMessage()
    }
}
)

socket.on('receive', data => {
    const messages = document.querySelector('ul')
    messages.innerHTML += `<li class="message"><a style = "font-weight:500;">${data.from}</a><br>${data.msg}</li><br>`
    scrollToBottom()
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
    const html = `
    <div class="overlayText" style="color : white;  position:absolute;
  top:30%;
  left:50%;
  z-index:1;">
        <p id="topText" style="
  color: white;
  font-size: 20px;
  align-self: center;
">Content above your video</p>
    </div>
    `
    videoGrid.append(video)
    // document.getElementsByClassName("main__videos").innerHTML += (html);
//     document.innerHTML += (<div >
//     <p>Content above your video</p>
//     <form>
//         <p>Content Below Your Video</p>
//         <label for="input">Form Input Label</label>
//         <input id="input" name="input" value="" />
//         <button type="submit">Submit</button>
//     </form>
// </div>)
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
    var backlen = history.length;
    history.go(-backlen);
    window.location.href = '/logout';
}

function setMuteButton() {
    const html = `
    <span class="material-icons">mic</span>
      
    `
    document.querySelector('.main__mute_button').innerHTML = html;
    document.querySelector('.main__mute_button').style = "background-color : #3C4043;"
}

function setUnmuteButton() {
    const html = `
    <span class="material-icons" style = " color : white;">
    mic_off
    </span>
      
    `
    document.querySelector('.main__mute_button').innerHTML = html;
    document.querySelector('.main__mute_button').style = "background-color : #EA4335;"
}

function setStopVideo() {
    const html = `
    <span class="material-symbols-outlined" >
              videocam
              </span>
      
    `
    document.querySelector('.main__video_button').innerHTML = html;
    document.querySelector('.main__video_button').style = "background-color : #3C4043;"
}

function setPlayVideo() {
    const html = `
    <span class="material-symbols-outlined" style = " color : white;">
    videocam_off
    </span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
    document.querySelector('.main__video_button').style = "background-color : #EA4335;"

}

const chatWindow = document.querySelector('.main__right')
const videoWindow = document.querySelector('.main__left')
function showHideChat() {
    if (chatWindow.style.display === 'none') {
        videoWindow.style.flex = 0.8;
        chatWindow.style.flex = 0.2;
        chatWindow.style.display = 'flex';
    } else {
        videoWindow.style.flex = 1.0;
        chatWindow.style.display = 'none';
    }
}
