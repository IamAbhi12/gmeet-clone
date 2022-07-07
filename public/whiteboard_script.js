// const { isPromise } = require("util/types");

const Socket = io('/');

let canvas = document.getElementById("canvas");
// canvas.Width=window.innerWidth;
// canvas.height=window.innerHeight;

let ctx = canvas.getContext("2d");

let x;
let y;
let mousedown = false;
window.onmousedown = (e) => {
    ctx.moveTo(x, y);
    Socket.emit('down', { x, y });
    mousedown = true;
}
window.onmouseup = (e) => {
    mousedown = false;
}
Socket.on("ondraw", ({ x, y }) => {
    ctx.lineTo(x, y);
    ctx.stroke();
})
Socket.on('ondown', ({ x, y }) => {
    ctx.moveTo(x, y);
});
window.onmousemove = (e) => {
    x = e.clientX;
    y = e.clientY;
    // console.log({x,y});
    if (mousedown) {
        Socket.emit('draw', { x, y });
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}