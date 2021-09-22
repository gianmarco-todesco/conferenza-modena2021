
'use strict'


let canvas
let ctx
let width, height, running

const slide = {
    name:"fibonacci"
}


function mainLoop () {
    if(!running) return;
    width = canvas.width = canvas.clientWidth
    height = canvas.height = canvas.clientHeight
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(width / 2, height / 2)
    draw()
    ctx.restore()
    requestAnimationFrame(mainLoop)
}

function setup() {
    if(!canvas) {
        canvas = document.getElementById('c')
        ctx = canvas.getContext('2d');
    }

    running = true;
    requestAnimationFrame(mainLoop)
}

function cleanup() {
    running = false;
}

function drawRect(x,y,w,h) {
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.strokeStyle = "gray";
    ctx.stroke();
}

function draw() {

    let unit = 30.0;
    unit *= Math.exp(-performance.now()*0.0001);
    unit = Math.floor(unit + 0.5);
    drawRect(0,0,unit,unit);
    let rect = { x:0, y:0, w:unit, h:unit };
    let k = 0;

    let t = performance.now()*0.001;
    let imax = Math.floor(t);
    t -= imax;

    for(let i=0; i<10 && i<imax; i++) {
        if(i == imax-1) ctx.globalAlpha = t;
        else  ctx.globalAlpha = 1;
        if(k==0) {
            drawRect(rect.x+rect.w,rect.y,rect.h,rect.h);
            rect.w += rect.h;
        } else if(k==1) {
            drawRect(rect.x,rect.y-rect.w,rect.w,rect.w);
            rect.y -= rect.w;
            rect.h += rect.w;
        } else if(k==2) {
            drawRect(rect.x-rect.h,rect.y,rect.h,rect.h);
            rect.x -= rect.h;
            rect.w += rect.h;
        } else {
            drawRect(rect.x,rect.y+rect.h,rect.w,rect.w);
            rect.h += rect.w;
        }
    
        k = (k+1)%4;
    
    }

}