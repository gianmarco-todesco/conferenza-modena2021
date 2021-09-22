let canvas, ctx, running;

const slide = {
    name: "venus"
};


function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    running = true;
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

let segmentTrail = [];
let tickCount = 0;

function animate() {
    if(!running) return;
    tickCount++;

    let w = canvas.width;
    let h = canvas.height;

    // cfr: https://nssdc.gsfc.nasa.gov/planetary/factsheet/planet_table_ratio.html
    const earthRadius = h*0.3;
    const venusRadius = 0.723 * earthRadius;
    const earthPeriod = 5000; // ms
    const venusPeriod = earthPeriod * 0.615;

    let t = performance.now();
    let earthPhi = t * 2 * Math.PI / earthPeriod;
    let venusPhi = t * 2 * Math.PI / venusPeriod;
    

    const sun = { x:0, y:0 };
    const earth = { 
        x : sun.x + earthRadius * Math.cos(earthPhi), 
        y : sun.y + earthRadius * Math.sin(earthPhi)
    };
    const venus = { 
        x : sun.x + venusRadius * Math.cos(venusPhi), 
        y : sun.y + venusRadius * Math.sin(venusPhi)
    };

    if((tickCount%5)==0) {
        segmentTrail.push({x0:earth.x, y0:earth.y, x1:venus.x, y1:venus.y});
        let maxLength = 1000;
        if(segmentTrail.length > maxLength) segmentTrail.splice(0,segmentTrail.length-maxLength);
    
    }

    ctx.clearRect(0,0,w,h);
    ctx.save();
    ctx.translate(w/2,h/2);


    // segment trail
    if(segmentTrail.length>0) {
        ctx.beginPath();
        segmentTrail.forEach(segment => {
            ctx.moveTo(segment.x0,segment.y0);
            ctx.lineTo(segment.x1,segment.y1);
        })
        ctx.strokeStyle = 'gray';
        ctx.stroke();
    }

    // sun
    circle(sun.x,sun.y,30,'black','yellow');

    // orbits
    circle(sun.x,sun.y,venusRadius,'gray');
    circle(sun.x,sun.y,earthRadius,'gray');

    // earth
    circle(earth.x,earth.y,20,'black','cyan');
    
    // venus
    circle(venus.x,venus.y,15,'black','#AAA');

    ctx.restore();

    requestAnimationFrame(animate);
}


animate();
