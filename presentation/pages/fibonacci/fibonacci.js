
'use strict'


let canvas
let ctx
let width, height, running
let stop=false, tt;
let position = 0;
let speed = 0;
let lastTime;

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
    lastTime = performance.now();
    position = 0;
    speed = 1;
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


let steps = [{
    x:-1,
    y:-1,
    w:2,
    h:2,
    k:0,
    pts: [-1,-1,1,-1,1,1,-1,1,-1,-1],
    center: [0,0],
    value: 1
}];

function addStep() {
    let {x,y,w,h,k,pts,center,value} = steps[steps.length-1];
    if(steps.length-2>=0) value += steps[steps.length-2].value;
    let q = k%4;
    if(q==0) {
        // destra
        pts = [x+w,y,x+w+h,y,x+w+h,y+h,x+w,y+h];
        center = [x+w+h*0.5,y+h*0.5];
        w+=h;
    } else if(q==1) {
        // basso
        pts = [x+w,y+h,x+w,y+h+w,x,y+h+w,x,y+h];
        center = [x+w*0.5,y+h+w*0.5];
        h+=w;        
    } else if(q==2) {
        // sinistra
        pts = [x,y+h,x-h,y+h,x-h,y,x,y];
        center = [x-h*0.5,y+h*0.5];
        x-=h;
        w += h;
    } else {
        // alto
        pts = [x,y,x,y-w,x+w,y-w,x+w,y];
        center = [x+w*0.5,y-w*0.5];
        y-=w;
        h+=w;
    }
    k ++;
    steps.push({x,y,w,h,k,pts,center,value});
}

for(let i=0; i<50; i++) addStep();

function draw() {
    if(stop) return;
    let unit = 10.0 * Math.pow(1.61803398875,-position);

    let curTime =  performance.now();
    let dt = curTime - lastTime;
    lastTime = curTime;

    position += speed * dt *0.001;

    /*


    t = position * 0.001;
    unit = 300.0 * Math.pow(1.61803398875,-t);
    let it = Math.floor(t);
    t -= it;
    while(steps[steps.length-1].k<it) 
    {
        addStep();
        console.log(t,it,steps[steps.length-1].value);
    }

    if(steps.length>15) 
        steps.splice(0,1);

    */
    let it = 0;
    let t = 0.5;

    let offx = 0;
    let offy = 0;

    let limit1 = canvas.height * 0.5 * 0.7;
    let limit2 = limit1 * 1.61803398875;

    // let colors = ['black','red','green','blue','cyan'];
    for(let z=0; z<steps.length; z++) {
        let step = steps[z];
        const {x,y,w,h,k,pts,center,value} = step;
        let r = unit * Math.sqrt(center[0]*center[0]+center[1]*center[1]);
        if(z>0 && r<1) continue;
        if(r>limit2) break;

        ctx.beginPath();
        ctx.moveTo(pts[0]*unit,pts[1]*unit);
        for(let i=2; i+1<pts.length;i+=2) {
            ctx.lineTo(pts[i]*unit,pts[i+1]*unit);
        }

        t = 1.0;
        if(r>limit1) { t = 1.0 - (r-limit1)/(limit2-limit1); }
        
        ctx.globalAlpha = t;
        ctx.strokeStyle = 'gray';
        ctx.stroke();

        if((w+h)*unit>100) {
            ctx.font = '20px arial';
            ctx.fillStyle = "black";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value, center[0]*unit,center[1]*unit);
        }
    }

}

document.addEventListener('keydown', (e) => {
    console.log(e);
    if(e.key=="s") {
        speed = speed == 0.0 ? 1.0 : 0.0;
    }
}, false);

let oldMouseX = 0;
let mousePressed = false;
document.addEventListener('mousedown', (e) => { 
    oldMouseX = e.offsetX; 
    mousePressed = true;
    
}, false);
document.addEventListener('mouseup', (e) => { 
    mousePressed = false;
}, false);
document.addEventListener('mousemove', (e) => { 
    
    if(mousePressed) {
        let dx = e.offsetX - oldMouseX;
        oldMouseX = e.offsetX; 
        position += 0.01 * dx;
    
    }
 }, false);