var meter;
var canvas, ctx;
var triangle;
var time = 0;
var state = 0;
var running = false;
var count = 0;
var a0 = 0.05;

function step(t, a,b) { return t<a?0.0:t>b?1.0:(t-a)/(b-a); }
function smooth(t) { return t*t*(3-2*t); }
function smoothstep(t, a,b) { return smooth(step(t,a,b)); }


function initialize(canvasId) {
    
    if(false) meter = new FPSMeter(null, {
        interval:100,
        smoothing:10,
        show: 'fps',
        decimals: 1,
        maxFps: 60,
        threshold: 100,
        
        position: 'absolute',
        zIndex: 10,
        left: '20px',
        top: '20px',
        theme: 'dark',
        heat: 1,
        graph: 1,
        history: 20
    });    
    canvas = document.getElementById(canvasId);
    canvas.addEventListener('mousedown',onMouseDown);
    window.addEventListener('keydown', onKeyDown);

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // canvas.width = window.width;
    // canvas.height = window.height;
    ctx = canvas.getContext('2d');
    
    
   
    // onFrame();
}   
    


function drawTriangle() {
    ctx.beginPath();
    ctx.moveTo(triangle[4], triangle[5]);
    for(var i=0;i<3;i++) {
        ctx.lineTo(triangle[i*2],triangle[i*2+1]);
    }
    ctx.stroke();
}

function drawPartialTriangle(t) {

    if(t<=0.0) return;
    if(t>=1.0) { drawTriangle(); return; }


    /*
    t *= 3;
    ctx.beginPath();
    ctx.moveTo(triangle[4], triangle[5]);
    for(var i=0;i<3;i++) {
        if(t>=1.0)
            ctx.lineTo(triangle[i*2],triangle[i*2+1]);
        else {
            if(t>0.0) {
                var i1 = (i+2)%3;
                var x0 = triangle[i1*2], y0 = triangle[i1*2+1];
                var x1 = triangle[i*2], y1 = triangle[i*2+1];
                ctx.lineTo((1-t)*x0+t*x1, (1-t)*y0+t*y1);
            }
            break;            
        }
        t-=1.0;
    }
    ctx.stroke();
    */




    if(t>0) {
        ctx.beginPath();
        for(var i=0;i<3;i++) {
            var i1 = (i+1)%3;
            ctx.moveTo(triangle[i*2],triangle[i*2+1]);
            if(t>=1.0)
                ctx.lineTo(triangle[i1*2],triangle[i1*2+1]);
            else {
                var x0 = triangle[i*2], y0 = triangle[i*2+1];
                var x1 = triangle[i1*2], y1 = triangle[i1*2+1];
                ctx.lineTo((1-t)*x0+t*x1, (1-t)*y0+t*y1);
            }
       }
       ctx.stroke();    
    }

}

function drawTriangleDots(a,r) {
    if(r<=0) return;
    for(var i=0;i<3;i++) {
        var i1 = (i+2)%3;
        var x0 = triangle[i1*2], y0 = triangle[i1*2+1];
        var x1 = triangle[i*2], y1 = triangle[i*2+1];
        var x = (1-a)*x0+a*x1;
        var y = (1-a)*y0+a*y1;
        ctx.beginPath();
        ctx.arc(x,y,r,0,2*Math.PI);        
        ctx.fill();
    }
}

function makeTransform(a) {
    var x0 = triangle[0], y0 = triangle[1];
    var x1 = triangle[2], y1 = triangle[3];
    var x = (1-a)*x0+a*x1;
    var y = (1-a)*y0+a*y1;
    var sc = Math.sqrt((x*x+y*y)/(x0*x0+y0*y0));
    var cs = (x*x0+y*y0)/Math.sqrt((x*x+y*y)*(x0*x0+y0*y0));
    var sn = Math.sqrt(1-cs*cs);
    return [sc*cs,sc*sn,-sc*sn,sc*cs,0,0];    
}

function drawFullTriangle(a,t) {

    var t0 = 0.05, t1 = 0.20;
    // t1=>1 draw, 1=>1+t0 grow points, 1+t0=>1+t1 move points, 2=>2+t0 shrink points
    var tr = makeTransform(a);
    ctx.save();
    while(t>0) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#28F';
        drawPartialTriangle(smoothstep(t,t1,1));
        if(t<1) break;
        ctx.lineWidth = 1;
        ctx.fillStyle = '#000'; 
        if(t<2+t0)        
            drawTriangleDots(a*smoothstep(t,1+t0,1+t1), 5*(smoothstep(t,1,1+t0)-smoothstep(t,2,2+t0)));
        t-=1.0;
        ctx.transform(tr[0],tr[1],tr[2],tr[3],tr[4],tr[5]);
    }
    ctx.restore();        
}

function place(i,k) {
    ctx.translate(triangle[2*i],triangle[2*i+1]);
    ctx.rotate(k*Math.PI/3);
    ctx.translate(-triangle[2*i],-triangle[2*i+1]);                
}

function redraw() {
    if(window.meter) meter.tickStart();
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate( canvas.width/2, canvas.height/2);
    
    var sc = 0.5*Math.min(canvas.width, canvas.height)/400.0;
    
    var r  = 300 * sc;
    if(triangle) {
        for(var i=0;i<3;i++) {
            var phi = Math.PI*2*i/3;
            triangle[i*2] = r*Math.cos(phi);
            triangle[i*2+1] = r*Math.sin(phi);
        }
    }
    else
    {
        triangle = [];
        for(var i=0;i<3;i++) {
            var phi = Math.PI*2*i/3;
            triangle.push(r*Math.cos(phi), r*Math.sin(phi));
        }
    }


    // ctx.scale(sc,sc);

    var max = 80;
    
    if(state<3) {
        time += 0.003;
        if(time>1+state) { time=1+state; }   
        drawFullTriangle(a0, Math.max(0,Math.min(max, time)));             
    }
    else if(state<4) 
    {
        time += 0.2;
        if(time>max) { time = max; }
        drawFullTriangle(a0, Math.max(0,Math.min(max, time)));
                
    }
    else if(state<5) 
    {
        time += 0.2;
        var max2 = max+45;
        if(time>max2) { time = max2; }
       
        drawFullTriangle(a0, max);
        
        var tt = [time, time-30, time-45];
        for(var i=0; i<3; i++) {
            ctx.save();
            place(i,1);
            drawFullTriangle(1-a0, Math.max(0,tt[i]));
            ctx.restore();            
        }

    }
    else if(state<6) 
    {
        time += 0.2;
        if(time>max) { time = max; }
        
        drawFullTriangle(a0, max);
        
        for(var i=0; i<3; i++) {
            ctx.save();
            place(i,1);
            drawFullTriangle(1-a0, max);
            ctx.restore();            
        }

        var dx = triangle[2]-triangle[0];
        var dy = triangle[3]-triangle[1];
        var dd = [dx,dy,dx,-dy,-dx,dy,-dx,-dy,0,-dy*2,0,dy*2,dx*2,0];
        for(var i=0;i+1<dd.length;i+=2) {
            ctx.save();
            ctx.translate(dd[i],dd[i+1]);
            drawFullTriangle(a0, time);
            ctx.restore();              
        }
        dd = [0,dy*2,0,-dy*2,dx,dy,dx,-dy,-2*dx,0,-2*dx,2*dy,-2*dx,-2*dy];
        for(var i=0;i+1<dd.length;i+=2) {
            ctx.save();
            ctx.translate(dd[i],dd[i+1]);
            place(2,1);
            drawFullTriangle(1-a0, time);
            ctx.restore();              
        }
        
        
        
    }
    // drawTriangle();

    /*
    // draw border
    ctx.beginPath();
    ctx.moveTo(-1280/2,-800/2);
    ctx.lineTo( 1280/2,-800/2);
    ctx.lineTo( 1280/2, 800/2);
    ctx.lineTo(-1280/2, 800/2);
    ctx.lineTo(-1280/2,-800/2);
    ctx.strokeStyle = '#f0f';
    ctx.stroke();
    */
    
    ctx.restore();
    if(window.meter) meter.tick();
}

var oldx,oldy;


function onMouseDown(e) {
    oldx = e.offsetX;
    oldy = e.offsetY;
    window.addEventListener('mousemove', onMouseDrag);
    window.addEventListener('mouseup', onMouseUp);
}
function onMouseDrag(e) {
    var dx = e.offsetX - oldx; oldx = e.offsetX;
    var dy = e.offsetY - oldy; oldy = e.offsetY;
    // time = Math.max(0, Math.min(1, time + dx*0.001));
    // setA0(a0 + dx*0.01);
    a0 = Math.max(0.038,Math.min(1,a0 + dx*0.001));
}
function onMouseUp(e) {
    window.removeEventListener('mousemove', onMouseDrag);
    window.removeEventListener('mouseup', onMouseUp);    
}

function onKeyDown(e) {
    console.log(e);
    if(e.code=="Space") {
        if(!running)  { 
            state = 0; 
            time = 0.2; 
            startSlide(); }
        else { 
            state++; 
            if(state==4 || state==5) time=0;
        }
    } else if(e.code=="Digit0") {
        state = 0;
        time = 0.0;
    }    
}

function nextStep() {
    if(!running)  { 
        state = 0; 
        time = 0.2; 
        startSlide(); }
    else { 
        state++; 
        if(state==4 || state==5) time=0;
    }
}

function reset() {
    state = 0;
    time = 0.0;
}


function setState(s) {
    state = s;
    
}



function startSlide() { if(running) return; running = true; onFrame(); }
function stopSlide() { running = false; }

function onFrame() { 
    if(running) {
        redraw(); 
        window.requestAnimationFrame(onFrame); 
    }
}


window.addEventListener("load", function() { 
    initialize('c'); 
    defineSlide('tri_spiral', startSlide, stopSlide);
});

