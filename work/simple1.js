let canvas = document.getElementById('c');
let ctx = canvas.getContext('2d');

function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.save();
    ctx.translate(w/2,h/2);


    for(let i=0; i<100; i++) {
        let r = 200 * Math.exp(-i*0.1);
        ctx.beginPath();
        let phi = i*0.2*Math.sin(performance.now()*0.005);
        ctx.moveTo(Math.cos(phi)*r, Math.sin(phi)*r);
        for(let i=1; i<=5; i++) {
            phi += 2*Math.PI/5;
            ctx.lineTo(Math.cos(phi)*r, Math.sin(phi)*r);
        }
        ctx.stroke();
    
    }



    ctx.restore();

}

function animate() {
    draw()
    requestAnimationFrame(animate)
}
animate()