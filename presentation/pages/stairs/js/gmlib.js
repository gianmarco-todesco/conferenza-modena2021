var GM = {}
GM.onMouseDrag = function(dx,dy,shift) {};

(function() {


    var oldx = 0, oldy = 0;
    var domElement = window;
    
    var onMouseMove = function(e) {
        e.preventDefault();
        var dx = e.clientX - oldx;
        var dy = e.clientY - oldy;
        GM.onMouseDrag(dx,dy,e.shiftKey,e);
        oldx = e.clientX;
        oldy = e.clientY;
    }
    var onMouseUp = function(e) {
        e.preventDefault();
        domElement.removeEventListener( 'mousemove', onMouseMove, false );
        domElement.removeEventListener( 'mouseup', onMouseUp, false );    
    }
    var onMouseDown = function(e) {
        e.preventDefault();
        oldx = e.clientX;
        oldy = e.clientY;
        domElement.addEventListener( 'mousemove', onMouseMove, false );
        domElement.addEventListener( 'mouseup', onMouseUp, false );
    }
    domElement.addEventListener('mousedown', onMouseDown, false );

    
})();


GM.onKeyPress = function(e) { return false; }
   
// key 
document.addEventListener('keypress', (e) => {
	console.log("gm: keypress",e);
    if(GM.onKeyPress(e)) {}
    // else if(top.oniframekeypress) { top.oniframekeypress(e); }
});


GM.onRenderFunctions = [];
GM.running = false;

GM.animate = function() {
    
    requestAnimationFrame(function animate(nowMsec){
        if(GM.running) requestAnimationFrame( animate );
        GM.onRenderFunctions.forEach(function(f){f();});
    })
}

 