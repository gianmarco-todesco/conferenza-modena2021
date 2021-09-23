"use strict";

const slide = {
    name:"Title",
    isSpinning: true,
    oldT : 0.0,
    spinningSpeed : 0.0,
}


function setup() {
    let start = performance.now();
    console.log("QUI");
    const canvas = slide.canvas = document.getElementById("renderCanvas")
    const engine = slide.engine = new BABYLON.Engine(canvas, true)
    const scene = slide.scene = new BABYLON.Scene(engine)

    scene.clearColor.set(0,0,0,0);
    const camera = slide.camera = new BABYLON.ArcRotateCamera("Camera", 
        -Math.PI / 2, Math.PI / 2, 8, 
        new BABYLON.Vector3(0,0,0), scene)
    camera.attachControl(canvas, true)
    console.log(camera.inputs.attached.keyboard)
    camera.inputs.remove(camera.inputs.attached.keyboard);

    camera.wheelPrecision=40
    camera.lowerRadiusLimit = 2

    
    const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 10, 1), scene)
    const light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 0, 0), scene)
    light2.parent = camera
    light1.intensity = 0.9;
    light2.intensity = 0.9;
    
    slide.light1 = light1;
    slide.light2 = light2;
    

    populateScene()
    handlePointer()
    scene.registerBeforeRender(tick)
    scene.onKeyboardObservable.add(onKeyEvent);
    
    engine.runRenderLoop(() => scene.render())
    window.addEventListener("resize", onResize)
    console.log("QUA: ", performance.now() - start);
    slide.oldT = performance.now();
    
}

function onResize() {
    slide.engine.resize();
}

function cleanup() {
    window.removeEventListener("resize", onResize)
    slide.engine.stopRenderLoop()
    slide.scene.dispose
    delete slide.scene
    slide.engine.dispose
    delete slide.engine    
}

function tick() {
    let t = performance.now()
    let dt = t-slide.oldT
    slide.oldT = t
    spinModel(dt);
    if(slide.director) slide.director.tick(dt);
}


function spinModel(dt) {
    if(slide.isSpinning)
        slide.spinningSpeed = Math.min(1, slide.spinningSpeed + 0.001*dt);
    else
        slide.spinningSpeed = Math.max(0, slide.spinningSpeed - 0.001*dt);
    
    let g = slide.spinningSpeed * dt * 0.05;
    if(slide.modelPivot)
    {
        let pivot = slide.modelPivot;
        pivot.rotation.x += 0.01 * g;
        pivot.rotation.y += 0.012* g;
        pivot.rotation.z += 0.0065* g;    
    }

}

function handlePointer() {
    let button = 0;
    let clicked = false
    let startY, startParamValue;
    let wasSpinning = false;
    let rotatingModel = false;
    slide.scene.onPointerObservable.add(pointerInfo => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                onpointerdown(pointerInfo)
                // console.log(pointerInfo);
                break
            case BABYLON.PointerEventTypes.POINTERUP:
                onpointerup(pointerInfo)
                // slide.isSpinning = true;
                break
            case BABYLON.PointerEventTypes.POINTERMOVE:
                if(clicked) onpointerdrag(pointerInfo)
                break
        }
    });
    function onpointerdown(pointerInfo) {
        button = pointerInfo.event.button;
        if(pointerInfo.event.offsetX<100) {
            clicked = true
            rotatingModel = false;
            slide.director.onMouseDown(button, pointerInfo.event.offsetX, pointerInfo.event.offsetY);
            setTimeout(() => slide.camera.detachControl(slide.canvas))
        } else {
            rotatingModel = true;
            wasSpinning = slide.isSpinning;
            slide.isSpinning = false;
        }
    }
    function onpointerup(pointerInfo) {
        clicked = false
        console.log(rotatingModel)
        if(rotatingModel) {
            console.log(wasSpinning)
            rotatingModel = false;
            slide.isSpinning = wasSpinning;
        }
        button = 0;
        slide.camera.attachControl(slide.canvas, true); 
        slide.director.onMouseUp();
    }
    function onpointerdrag(pointerInfo) {
        slide.director.onMouseUp();
        slide.director.onMouseDrag(button, pointerInfo.event.offsetX, pointerInfo.event.offsetY);
    }
}

function onKeyEvent(e) {
    console.log(e);
    

    if(e.type == BABYLON.KeyboardEventTypes.KEYDOWN)
    {
        if(e.event.key == "ArrowLeft") slide.director.prevStage();
        else if(e.event.key == "ArrowRight") slide.director.nextStage();
        else if(e.event.key == "p") slide.isSpinning = !slide.isSpinning;
    }
    
}



function populateScene()
{
    const scene = slide.scene
    slide.modelPivot = new BABYLON.TransformNode('model-pivot', scene);   
    slide.director = createDirector();
    loadTangled();
}

