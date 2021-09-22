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
    let clicked = false
    let startY, startParamValue;
    slide.scene.onPointerObservable.add(pointerInfo => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                onpointerdown(pointerInfo)
                slide.isSpinning = false;
                break
            case BABYLON.PointerEventTypes.POINTERUP:
                if(clicked) onpointerup(pointerInfo)
                // slide.isSpinning = true;
                break
            case BABYLON.PointerEventTypes.POINTERMOVE:
                if(clicked) onpointerdrag(pointerInfo)
                break
        }
    });
    function onpointerdown(pointerInfo) {
        if(pointerInfo.event.offsetX<100) {
            clicked = true
            startY = pointerInfo.event.offsetY
            startParamValue = slide.model.param;
            setTimeout(() => slide.camera.detachControl(slide.canvas))
        }
    }
    function onpointerup(pointerInfo) {
        clicked = false
        slide.camera.attachControl(slide.canvas, true); 
    }
    function onpointerdrag(pointerInfo) {
        let y = pointerInfo.event.offsetY
        slide.model.param = startParamValue + (y-startY) *0.006;
    }
}

function onKeyEvent(e) {
    console.log(e);
    

    if(e.type == BABYLON.KeyboardEventTypes.KEYDOWN)
    {
        if(e.event.key == "ArrowLeft") slide.director.prevStage();
        else if(e.event.key == "ArrowRight") slide.director.nextStage();
    
    }
    
}

let mmat;

function createText(txWidth, txHeight, panelHeight, f, scene)
{
    const tx = new BABYLON.DynamicTexture("DynamicTexture", {width:txWidth, height:txHeight}, scene, false);
    tx.hasAlpha = true;
    const mat = new BABYLON.StandardMaterial("mat", scene);
    mat.emissiveTexture = tx;
    mat.opacityTexture = tx;
    mat.diffuseColor.set(0,0,0);
    mat.specularColor.set(0,0,0);

    f(tx);
    //let text = "Immagini";
    //tx.drawText(text, null, null, "bold 60px Arial", "#FFFFFF", "rgba(0,0,0,0)", true);    

    const panelWidth = panelHeight * txWidth / txHeight;
    let plane = BABYLON.MeshBuilder.CreatePlane("plane", {width:panelWidth, height:panelHeight}, scene);
    plane.material = mat;
    return plane;
}

let model;



function createTickPolygon(name, options, scene) {
    const m = options.m || 5
    const r = options.r || 3
    const h = options.h || 0.01
    const h2 = options.h2 || 0.04
    const mat1 = options.edgeMat || new BABYLON.StandardMaterial(name+'-edge-mat',scene);
    const mat2 = options.faceMat || new BABYLON.StandardMaterial(name+'-face-mat',scene);
    

    const pts = [...Array(m).keys()].map(i=>Math.PI*2*i/m)
        .map(a=>new BABYLON.Vector3(r*Math.cos(a), 0, r*Math.sin(a)))
    let vdb = new VertexDataBuilder()
    for(let i=0; i<m; i++) {
        vdb.addSphere(pts[i], h2)
        vdb.addCylinder(pts[i], pts[(i+1)%m], h2)
    }
    const mesh1 = new BABYLON.Mesh(name+"-esges", scene)
    mesh1.material = mat1;
    vdb.vertexData.applyToMesh(mesh1)

    vdb = new VertexDataBuilder()
    vdb.addXZPolygon(pts, h)
    vdb.addXZPolygon(pts, -h)
    const mesh2 = new BABYLON.Mesh(name+"-faces", scene)
    vdb.vertexData.applyToMesh(mesh2)
    mesh2.material = mat2;


    // const mat = new BABYLON.StandardMaterial(name+'-mat',scene)
    // mat.diffuseColor.set(0.3,0.5,0.7)
    // mat.specularColor.set(0.3,0.3,0.3)

    const mesh = BABYLON.Mesh.MergeMeshes([mesh1,mesh2], true, false, false, false, true);
    mesh.edgeLength = BABYLON.Vector3.Distance(pts[0], pts[1])
    return mesh
}

function createTickStar(name, options, scene) {
    const inr = options.r || 1
    const h = options.h || 0.01
    const h2 = options.h2 || 0.04
    const outr =  inr * (3+Math.sqrt(5))/2;
    const m = 10;
    const mat1 = options.edgeMat || new BABYLON.StandardMaterial(name+'-edge-mat',scene);
    const mat2 = options.faceMat || new BABYLON.StandardMaterial(name+'-face-mat',scene);
    
    
    const pts = [...Array(m).keys()].map(i=>{
        const a = Math.PI*2*(i+1)/m;
        const r = (i&1)==0 ? outr : inr;
        return new BABYLON.Vector3(r*Math.cos(a), 0, r*Math.sin(a));
    });

    // edges
    let vdb = new VertexDataBuilder()
    for(let i=0; i<m; i++) {
        vdb.addSphere(pts[i], h2)
    }
    for(let i=0; i<m; i+=2) {
        vdb.addCylinder(pts[i], pts[(i+4)%m], h2)
    }
    const mesh1 = new BABYLON.Mesh(name, scene)
    vdb.vertexData.applyToMesh(mesh1)
    mesh1.material = mat1;
    
    // faces
    vdb = new VertexDataBuilder()
    const faces = [];
    faces.push([...Array(5).keys()].map(i=>pts[i*2+1]));
    for(let i=0; i<m; i+=2) faces.push([pts[i],pts[i+1],pts[(i+9)%m]]);
    faces.forEach(face => {
        vdb.addXZPolygon(face, h)
        vdb.addXZPolygon(face, -h)    
    });
    const mesh2 = new BABYLON.Mesh(name, scene)
    vdb.vertexData.applyToMesh(mesh2)
    mesh2.material = mat2;

    const mesh = BABYLON.Mesh.MergeMeshes([mesh1,mesh2], true, false, false, false, true);
    
    mesh.edgeLength = BABYLON.Vector3.Distance(pts[0], pts[4])
    mesh.pentagonEdgeLength = BABYLON.Vector3.Distance(pts[1], pts[3])
    
    return mesh
}


function createPyramid(name, options, scene) {
    const inr = options.r || 1
    const h = options.h || 0.01
    const h2 = options.h2 || 0.04
    const mat1 = options.edgeMat || new BABYLON.StandardMaterial(name+'-edge-mat',scene);
    const mat2 = options.baseFaceMat || new BABYLON.StandardMaterial(name+'-base-face-mat',scene);
    const mat3 = options.faceMat || new BABYLON.StandardMaterial(name+'-face-mat',scene);
    
    const m = 5;

    const pts = [...Array(m).keys()].map(i=>{
        const a = Math.PI*2*i/m;
        return new BABYLON.Vector3(inr*Math.cos(a), 0, inr*Math.sin(a));
    });
    const outr = inr * (3+Math.sqrt(5))/2;
    const starEdgeLength = outr / Math.sqrt(0.1*(5-Math.sqrt(5)));
    const pyramidHeight = (0.58779 - 0.26287) * starEdgeLength;
    const apex = new BABYLON.Vector3(0,pyramidHeight,0); 

    // edges
    let vdb = new VertexDataBuilder()
    for(let i=0; i<m; i++) {
        vdb.addSphere(pts[i], h2)
        vdb.addCylinder(pts[i], pts[(i+1)%m], h2)
    }
    vdb.addSphere(apex, h2)
    for(let i=0; i<m; i++) {
        vdb.addCylinder(pts[i], apex, h2)
    }
    const mesh1 = new BABYLON.Mesh(name + "_edges", scene)    
    vdb.vertexData.applyToMesh(mesh1)
    mesh1.material = mat1;
    
    // base face
    vdb = new VertexDataBuilder()
    vdb.addXZPolygon(pts, h)
    vdb.addXZPolygon(pts, -h)   
    const mesh2 = new BABYLON.Mesh(name + "_baseFace", scene)    
    vdb.vertexData.applyToMesh(mesh2)
    mesh2.material = mat2;

    // side faces    
    vdb = new VertexDataBuilder()
    for(let i=0; i<m; i++) {
        const p1 = pts[(i+1)%m], p2 = pts[i];
        vdb.addTriangle(apex,p1,p2,-h);
        vdb.addTriangle(apex,p1,p2, h);
    }
    const mesh3 = new BABYLON.Mesh(name + "_faces", scene)    
    vdb.vertexData.applyToMesh(mesh3)
    mesh3.material = mat3;

    const mesh = BABYLON.Mesh.MergeMeshes([mesh1,mesh2,mesh3], 
        true, false, false, false, true);
    
    mesh.edgeLength = BABYLON.Vector3.Distance(pts[0], pts[1])
    
    return mesh
}

let lls;

class PolyhedronModel {

    constructor(options, scene) {
        let shapeId = this.shapeId = options.shapeId || 4;
        let edgeColor = options.edgeColor || [0.3,0.5,0.7];
        let faceColor = options.faceColor || [0.2,0.4,0.9];
        let baseFaceColor = options.baseFaceColor || [0.2,0.4,0.9];
        
        
        this.scene = scene
        this._param = 0;
        this._scalingEnabled = false;
        
        let mat;
        mat = this.edgeMat = new BABYLON.StandardMaterial('edge-mat',scene)
        mat.diffuseColor.set(...edgeColor)
        mat.specularColor.set(0.3,0.3,0.3)
        mat = this.faceMat = new BABYLON.StandardMaterial('face-mat',scene)
        mat.diffuseColor.set(...faceColor)
        mat.specularColor.set(0.3,0.3,0.3)
        if(shapeId == 4) {
            mat = this.baseFaceMat = new BABYLON.StandardMaterial('base-face-mat',scene)
            mat.diffuseColor.set(...baseFaceColor)
            mat.specularColor.set(0.3,0.3,0.3)
        }
        this.baseOption = { 
            r:0.7, 
            h:0.0025, 
            h2:0.01, 
            edgeMat: this.edgeMat, 
            faceMat: this.faceMat,
            baseFaceMat: this.baseFaceMat            
        };
        this.pivot =  new BABYLON.TransformNode('model', scene);       

        switch(shapeId) {
            case 1: this.setDod(); break;
            case 2: this.setIco(); break;
            case 3: this.setSissid(); break;
            case 4: this.setSissid2(); break;
        }

    }

    setShape(shapeId) {
    }

    dispose() {
        this.clear();
    }

    clear() {
        const faces = this.faces 
        if(faces) {
            for(let i = faces.length-1; i>=0; i--) faces[i].dispose()
            this.faces = []    
        }
    }

    placeFaces(ph, edgeLength) {
        const faces = this.faces
        
        const phEdgeLength = BABYLON.Vector3.Distance(
            ph.vertices[ph.edges[0][0]],
            ph.vertices[ph.edges[0][1]])
        const scaleFactor = edgeLength / phEdgeLength
        for(let i=0; i<ph.faces.length; i++) {
            const mat = ph.getFaceMatrix(i, scaleFactor)
            const p = mat.getRow(3)
            faces[i].mat = mat
            faces[i].position.set(p.x,p.y,p.z)
            faces[i].rotationQuaternion = BABYLON.Quaternion.FromRotationMatrix(mat)
        }
    }

    setDod() {
        const pentagon = createTickPolygon('pentagon', {...this.baseOption, m:5}, this.scene)
        const faces = this.faces = [pentagon]
        for(let i=1; i<12; i++) faces.push(pentagon.createInstance('f-'+i))
        this.placeFaces(PolyhedronData.p12, faces[0].edgeLength)
        this.addFacesToPivot(faces);
        this._param = 0;
        this._v0 = -faces[0].edgeLength * (0.42533 + 1.11352); // dod inradius + great dod inradius    
    }
    setIco() {
        const triangle = createTickPolygon('triangle', {...this.baseOption, m:3}, this.scene)
        const faces = this.faces = [triangle]
        for(let i=1; i<20; i++) faces.push(triangle.createInstance('f-'+i))
        this.placeFaces(PolyhedronData.p20, faces[0].edgeLength)
        this.addFacesToPivot(faces);
        this._param = 0    
        this._v0 = -faces[0].edgeLength * (0.75576 + 0.11026); // dod inradius + great dod inradius    
    }
    setSissid() {
        const star = createTickStar('star', {...this.baseOption}, this.scene)
        const faces = this.faces = [star]
        for(let i=1; i<12; i++) faces.push(star.createInstance('f-'+i))
        this.placeFaces(PolyhedronData.p12, faces[0].pentagonEdgeLength)
        this.addFacesToPivot(faces);
        this._param = 0    
        this._v0 = -faces[0].pentagonEdgeLength * (0.42533 + 1.11352); // dod inradius + great dod inradius    
    }
    setSissid2() {
        const pyramid = createPyramid('pyramid', {...this.baseOption}, this.scene)
        const faces = this.faces = [pyramid]
        for(let i=1; i<12; i++) faces.push(pyramid.createInstance('f-'+i))
        this.placeFaces(PolyhedronData.p12, faces[0].edgeLength)
        this.addFacesToPivot(faces);
        this._param = 0    
        // this._v0 = -faces[0].pentagonEdgeLength * (0.42533 + 1.11352); // dod inradius + great dod inradius    
    }
    addFacesToPivot(faces) {
        let pivot = this.pivot;
        faces.forEach(f=>f.parent = pivot);
    }

    createFacePlane() {
        let pts = [];
        for(let i=1; i<20;i++)
        {
            const r = i*0.15;
            let circle = [];
            for(let j = 0; j<6; j++) {
                let phi = Math.PI*2*j/5;
                circle.push(new BABYLON.Vector3(r*Math.cos(phi),0,r*Math.sin(phi)));
            }
            pts.push(circle);
        }
        const ls = BABYLON.MeshBuilder.CreateLineSystem(
            "lines", {
                    lines: pts,
                    // colors: colors,
                    
            }, 
            slide.scene);
        ls.color.set(0,1,0.5);
        ls.parent = this.pivot;
        lls = ls;

        let face = this.faces[0];
        ls.position.copyFrom(face.position).scaleInPlace(1.005); 
        ls.rotationQuaternion = face.rotationQuaternion;

    }
    
    get param() { return this._param; }
    set param(v) {
        if(this.shapeId == 4) 
        {
            if(this._scalingEnabled) {
                v = Math.max(0.1, Math.min(2.0, v));
                this.setPyramidScaling(v);
            } else {
                if(v<0)v=0;
                this.setFaceTranslation(v)    
            }
        }
        else
        {
            this.setFaceTranslation(v)    
        }
    }

    setFaceTranslation(v) {
        const snap = 0.04;
        if(Math.abs(v) < snap) v = 0;
        else if(this._v0 && Math.abs(v-this._v0) < snap) v = this._v0;
        this._param = v
        const translateMatrix = BABYLON.Matrix.Translation(0,v,0)
        if(this.faces) {
            this.faces.forEach(face => {
                const mat = translateMatrix.multiply(face.mat)
                const p = mat.getRow(3)
                face.position.set(p.x,p.y,p.z)
                face.rotationQuaternion = BABYLON.Quaternion.FromRotationMatrix(mat)
                //face.scaling.y = 1-v;
            })
        }
    }

    setPyramidScaling(v) {
        const snap = 0.04;
        if(Math.abs(v-1) < snap) v = 1;
        this._param = v
        if(this.faces) {
            this.faces.forEach(face => {
                face.scaling.y = v;
            })
        }
    }
}



class Director {
    constructor(stages) {
        this.stages = stages;
        stages.forEach((s,i)=>s.stageIndex = i);
        this.currentStage = stages[0];
        this.index = 0;
        if(this.currentStage.start) this.currentStage.start(this);
    }

    tick(dt) {
        let stage = this.currentStage;
        if(stage.stageIndex != this.index) {
            let stopped = stage.stop ? stage.stop(dt, this) : true;
            if(stopped) {
                console.log(stage.stageIndex, this.index)
                if(this.index > stage.stageIndex) {
                    stage = this.stages[stage.stageIndex+1];
                } else {
                    stage = this.stages[stage.stageIndex-1];
                }
                this.currentStage = stage;
                console.log("Stage #" + stage.stageIndex);
                if(stage.start) stage.start(this);
            }
        } else {
            if(stage.tick) stage.tick(dt, this);
        }
    }

    nextStage() {
        let stage = this.currentStage;
        if(stage.stageIndex == this.index && this.index + 1 < this.stages.length) 
            this.index++;
    }

    prevStage() {
        let stage = this.currentStage;
        if(stage.stageIndex == this.index && this.index > 0) 
            this.index--;
    }

    setStage(index) {
        if(this.currentScene) {
            if(this.currentScene.end) this.currentScene.end(this);
        }
        this.stageIndex = index;
        if(0<=index && index<this.stages.length) {
            this.currentScene = this.stages[index];
            if(this.currentScene.begin) this.currentScene.begin(this);
        } else this.currentScene = null;
    }

    drag(dt) {

    }


}


// ============================================================================


function createStar(withPyramids) {
    const scene = slide.scene;
    slide.model = new PolyhedronModel({
        shapeId : withPyramids ? 4 : 3,
        edgeColor : [0.8,0.7,0.8],
        faceColor : [0.8,0.4,0.1],
        baseFaceColor : [0.8,0.3,0.0]        
    },scene);

    if(withPyramids) {
        let dod = slide.dod = new PolyhedronModel({
            shapeId : 1,
            edgeColor : [0.8,0.8,0.8],
            faceColor : [0.8,0.3,0.0]
        },scene);
        dod.pivot.parent = slide.model.pivot;    
    }
    slide.model.pivot.parent = slide.modelPivot;
}

// ============================================================================

const stages = [
    {
        // stage #0
        start: () => {
            if(!slide.model) createStar(true);
            document.getElementById('title').style.left = "0";
            slide.isSpinning = true;
        },
        stop: () => {
            /*
            slide.model.dispose();
            slide.dod.dispose();
            slide.model = null;
            slide.dod = null;
            */
           document.getElementById('title').style.left = "110%";
           slide.isSpinning = false;
           return true
        }
    },
    {
        // stage #1
        start: () => {},
        stop: (dt) => {
            if(slide.model.param == 0.0) return true;
            slide.model.param = Math.max(0.0, slide.model.param - dt * 0.001);
            return false;
        }
    },
    {
        // stage #2
        start: () => { 
            slide.model._scalingEnabled = true; 
            slide.model.param = 1;
        },
        stop: (dt) => { 
            if(slide.model.param > 1) {
                slide.model.param = Math.max(1.0, slide.model.param - dt * 0.001);
                return false;
            } else if(slide.model.param < 1) {
                slide.model.param = Math.min(1.0, slide.model.param + dt * 0.001);
                return false;
            } 
            slide.model._scalingEnabled = false; 
            slide.model.param = 0.0;
            return true; 
        }
    },
    {
        start: () => {
            slide.model.dispose();
            slide.dod.dispose();
            createStar(false);
        },
        stop: () => {
            slide.model.dispose();
            createStar(true);

        },
        // stage #3

    },
    {
        begin: () => {
            createStar(false);
        },
        end: () => {
            slide.model.dispose();
            slide.model = null;
            return true;
        }
    },
    

];


function populateScene()
{
    const scene = slide.scene
    slide.modelPivot = new BABYLON.TransformNode('model-pivot', scene);   
    slide.director = new Director(stages)


}

