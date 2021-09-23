let canvas, ctx, running = false;
let showSun = true;
let showSegmentTrail = false;
let segmentTrail = [];
const maxSegmentTrailLength = 800;
let tickCount = 0;
let qt;
let gamma = 0.0;
let gammaTarget = 0.0;
let oldTime;
let venusTrail = [];
const maxVenusTrailLength = 6000;
let venusTrailEnabled = false;
let superSpeedEnabled = false;

const slide = {
    name: "venus"
};


function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    running = true;
    oldTime = performance.now();
    animate();
}

document.addEventListener('resize', ()=>{
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

}, false);


function circle(x,y,r,strokeColor,fillColor=null) {
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI);
    ctx.strokeStyle = strokeColor;
    if(fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    ctx.stroke();
}


let earthTick = 0;
let earthTickTarget = 0.0;
const tickAngle = Math.PI*2 / 1000.0;

// cfr: https://nssdc.gsfc.nasa.gov/planetary/factsheet/planet_table_ratio.html
const earthRadius = 0.3; // 1.0 = altezza finestra
const venusRadius = 0.723 * earthRadius;
const earthPeriod = 5000; // ms
const venusPeriod = earthPeriod * 0.615;

const sun = { x:0, y:0 };
const earth = { x:0, y:0 };
const venus = { x:0, y:0 };

function updatePositions() {
    let earthPhi = earthTick * tickAngle;
    let venusPhi = earthPhi * earthPeriod / venusPeriod;

    earth.x = earthRadius * Math.cos(earthPhi); 
    earth.y = earthRadius * Math.sin(earthPhi);
    venus.x = venusRadius * Math.cos(venusPhi); 
    venus.y = venusRadius * Math.sin(venusPhi);
    let offx = -earth.x*gamma;
    let offy = -earth.y*gamma;
    sun.x = offx;
    sun.y = offy;
    earth.x += offx;
    earth.y += offy;
    venus.x += offx;
    venus.y += offy;
    
};


function animate() {
    if(!running) return;
    tickCount++;

    let curTime = performance.now();
    let dt = curTime - oldTime;
    oldTime = curTime;

    if(gammaTarget != gamma) {
        if(gammaTarget > gamma) {
            gamma = Math.min(gammaTarget, gamma + dt * 0.001);
        } else {
            gamma = Math.max(gammaTarget, gamma - dt * 0.001);
        }
    }

    let w = canvas.width = canvas.clientWidth;
    let h = canvas.height = canvas.clientHeight;


    earthTickTarget += dt *  Math.PI * 2 / (earthPeriod * tickAngle) * (superSpeedEnabled ? 4 : 1);
    // let target = Math.PI * 2 * performance.now() / (earthPeriod * tickAngle);
    
    while(earthTick < earthTickTarget) {
        earthTick++;
        
        if(showSegmentTrail && earthTick % 10==0) {
            updatePositions();
            segmentTrail.push({x0:earth.x, y0:earth.y, x1:venus.x, y1:venus.y});
            if(segmentTrail.length > maxSegmentTrailLength) 
                segmentTrail.splice(0,segmentTrail.length-maxSegmentTrailLength);    
            
        }
    }
    updatePositions();
    
    if(!showSegmentTrail && segmentTrail.length>0) {
        segmentTrail.splice(0,1);      
    } 

    ctx.clearRect(0,0,w,h);
    ctx.save();
    ctx.translate(w/2,h/2);


    // segment trail
    if(segmentTrail.length>0) {
        ctx.beginPath();
        segmentTrail.forEach(segment => {
            ctx.moveTo(h*segment.x0,h*segment.y0);
            ctx.lineTo(h*segment.x1,h*segment.y1);
        })
        ctx.strokeStyle = 'gray';
        ctx.stroke();
    }

    // venus trail
    if(venusTrailEnabled && gamma == 1.0) {
        venusTrail.push({x:venus.x, y:venus.y});
        if(venusTrail.length > maxVenusTrailLength)
            venusTrail.splice(0, venusTrail.length - maxVenusTrailLength);
    }
    else {
        if(venusTrail.length > 0)
            venusTrail.splice(0, 1);
    }



    // sun
    if(showSun) circle(h*sun.x,h*sun.y,30,'black','yellow');

    // orbits
    circle(h*sun.x,h*sun.y,h*venusRadius,'gray');

    if(gamma < 1.0) {
        ctx.globalAlpha = 1.0 - gamma;
        circle(h*sun.x,h*sun.y,h*earthRadius,'gray');
    } 
    if(gamma > 0.0) {
        ctx.globalAlpha = gamma;
        circle(h*earth.x,h*earth.y,h*earthRadius,'gray');
    }


    // earth
    circle(h*earth.x,h*earth.y,20,'black','cyan');

    
    if(venusTrail.length>=2) {
        ctx.beginPath();
        ctx.moveTo(venusTrail[0].x*h, venusTrail[0].y*h);
        for(let i=1; i<venusTrail.length; i++)
            ctx.lineTo(venusTrail[i].x*h, venusTrail[i].y*h);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = 1;
    }

    // venus
    circle(h*venus.x,h*venus.y,15,'black','#AAA');



    ctx.restore();

    requestAnimationFrame(animate);
}

function setup() {
    init();
    animate();
}

function cleanup() {
    running = false;
}

document.addEventListener('keydown', (e) => {
    console.log(e);
    if(e.key=="s") {
        showSegmentTrail = !showSegmentTrail;
        showSun = !showSegmentTrail;
    } else if(e.key == "+") {
        superSpeedEnabled = true;
    } else if(e.key == "-") {
        superSpeedEnabled = false;
    } else if(e.key == "e") {
        gammaTarget = 1.0 - gammaTarget;
        if(segmentTrail.length>0) gammaTarget = 0;
    } else if(e.key == "v") {
        venusTrailEnabled = !venusTrailEnabled;        
    }
}, false);