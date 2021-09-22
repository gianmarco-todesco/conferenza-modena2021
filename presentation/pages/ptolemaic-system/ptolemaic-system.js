/*
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let width, height;

function mainLoop() {
    width = canvas.width;
    height = canvas.height;
    ctx.clearRect(0,0,width,height);
    draw();
    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);


function draw() {
    const time = performance.now() * 0.001;


    ctx.lineWidth = 3;
    for(var i=0; i<15; i++) {
        const factor = (i*0.05+1) * 2;
        ctx.strokeStyle = "rgb(255," + 127*i/15 + ",127)";
        drawGraph(t => Math.sin(Math.PI*2*t + factor*time)*(100-i*2));
    }


}
*/


function setup() {
    createCanvas(500,500);

}

let gamma = 0;

function draw()
{
    clear();


    let t = performance.now();

    let earthRadius = 100;
    let earthPeriod = 3000;
    
    let venusRadius = earthRadius * 0.723;
    let venusPeriod = earthPeriod * 0.615;
    
    let venusPhi = 2*Math.PI*t/venusPeriod;
    let earthPhi = 2*Math.PI*t/earthPeriod;

    let venus = { x: venusRadius * Math.cos(venusPhi), y : venusRadius * Math.sin(venusPhi)  };
    let earth = { x: earthRadius * Math.cos(earthPhi), y : earthRadius * Math.sin(earthPhi)  };

    let cx = 250 - venus.x * gamma;
    let cy = 250 - venus.y * gamma;
    ellipse(cx,cy, 40,40);
    ellipse(cx+venus.x,cy+venus.y, 15,15);
    ellipse(cx+earth.x,cy+earth.y, 20,20);
    

    /*
    if(mouseIsPressed) fill(0);
    else fill(255);
    ellipse(mouseX,mouseY,80,80);
    */
   ellipse(0,0,80,80);
}