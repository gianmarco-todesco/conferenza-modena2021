"use strict";

const slide = {
    name:"Title"
}


function setup() {
    const canvas = slide.canvas = document.getElementById("renderCanvas")
    const engine = slide.engine = new BABYLON.Engine(canvas, true)
    const scene = slide.scene = new BABYLON.Scene(engine)

    const camera = slide.camera = new BABYLON.ArcRotateCamera("Camera", 
        -Math.PI / 2, Math.PI / 2, 8, 
        new BABYLON.Vector3(0,0,0), scene)
    camera.attachControl(canvas, true)
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
    window.addEventListener("resize", () => engine.resize())
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

}

function handlePointer() {
    let clicked = false
    let startY, startParamValue;
    slide.scene.onPointerObservable.add(pointerInfo => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                onpointerdown(pointerInfo)
                break
            case BABYLON.PointerEventTypes.POINTERUP:
                if(clicked) onpointerup(pointerInfo)
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
    if(e.event.key == "1") model.setShape(1);
    else if(e.event.key == "2") model.setShape(2);
    else if(e.event.key == "3") model.setShape(3);
    else if(e.event.key == "4") model.setShape(4);
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

function populateScene()
{
    const scene = slide.scene

    /*
    let text1 = createText(1024,128,1,(tx) => {
        const text = "Matematica per immagini ai tempi del web";
        tx.drawText(text, null, null, "bold 60px Arial", "#FFFFFF", "rgba(0,0,0,0)", true)
    }, scene);

    let text2 = createText(1024,128,0.7,(tx) => {
        let text = "Gian Marco Todesco";
        tx.drawText(text, null, null, "bold 30px Arial", "#FFFFFF", "rgba(0,0,0,0)", true)
    }, scene);

    text2.position.y = -1;
    */


    model = slide.model = new PolyhedronModel(1,scene);

    /*
    const pentagon = createTickPolygon('pentagon', {m:5, r:1}, slide.scene)
    const faces = [pentagon]
    for(let i=1; i<12; i++) faces.push(pentagon.createInstance('f-'+i));
    const ph = PolyhedronData.p12;
    const phEdgeLength = BABYLON.Vector3.Distance(
        ph.vertices[ph.edges[0][0]],
        ph.vertices[ph.edges[0][1]])
    const scaleFactor = faces[0].edgeLength / phEdgeLength
    for(let i=0; i<ph.faces.length; i++) {
        const mat = ph.getFaceMatrix(i, scaleFactor)
        const p = mat.getRow(3)
        faces[i].mat = mat
        faces[i].position.set(p.x,p.y,p.z)
        faces[i].rotationQuaternion = BABYLON.Quaternion.FromRotationMatrix(mat)
    }
    */

}




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
    const mat2 = options.faceMat || new BABYLON.StandardMaterial(name+'-face-mat',scene);
    
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
    

    // faces    
    vdb = new VertexDataBuilder()
    vdb.addXZPolygon(pts, h)
    vdb.addXZPolygon(pts, -h)   
    for(let i=0; i<m; i++) {
        const p1 = pts[(i+1)%m], p2 = pts[i];
        vdb.addTriangle(apex,p1,p2,-h);
        vdb.addTriangle(apex,p1,p2, h);
    }
    const mesh2 = new BABYLON.Mesh(name + "_faces", scene)    
    vdb.vertexData.applyToMesh(mesh2)
    mesh2.material = mat2;

    const mesh = BABYLON.Mesh.MergeMeshes([mesh1,mesh2], true, false, false, false, true);
    
    mesh.edgeLength = BABYLON.Vector3.Distance(pts[0], pts[1])
    
    return mesh
}

class PolyhedronModel {


    constructor(shapeId, scene) {
        this.scene = scene
        this._param = 0;
        
        let mat;
        mat = this.edgeMat = new BABYLON.StandardMaterial('edge-mat',scene)
        mat.diffuseColor.set(0.3,0.5,0.7)
        mat.specularColor.set(0.3,0.3,0.3)
        mat = this.faceMat = new BABYLON.StandardMaterial('face-mat',scene)
        mat.diffuseColor.set(0.2,0.4,0.9)
        mat.specularColor.set(0.3,0.3,0.3)
        this.baseOption = { r:1, h:0.02, h2:0.04, edgeMat: this.edgeMat, faceMat: this.faceMat };
        this.setShape(shapeId)       
    }

    setShape(shapeId) {
        this.clear()
        switch(shapeId) {
            case 1: this.setDod(); break;
            case 2: this.setIco(); break;
            case 3: this.setSissid(); break;
            case 4: this.setSissid2(); break;
        }

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
        this._param = 0;
        this._v0 = -faces[0].edgeLength * (0.42533 + 1.11352); // dod inradius + great dod inradius    
    }
    setIco() {
        const triangle = createTickPolygon('triangle', {...this.baseOption, m:3}, this.scene)
        const faces = this.faces = [triangle]
        for(let i=1; i<20; i++) faces.push(triangle.createInstance('f-'+i))
        this.placeFaces(PolyhedronData.p20, faces[0].edgeLength)
        this._param = 0    
        this._v0 = -faces[0].edgeLength * (0.75576 + 0.11026); // dod inradius + great dod inradius    
    }
    setSissid() {
        const star = createTickStar('star', {...this.baseOption}, this.scene)
        const faces = this.faces = [star]
        for(let i=1; i<12; i++) faces.push(star.createInstance('f-'+i))
        this.placeFaces(PolyhedronData.p12, faces[0].pentagonEdgeLength)
        this._param = 0    
        this._v0 = -faces[0].pentagonEdgeLength * (0.42533 + 1.11352); // dod inradius + great dod inradius    
    }
    setSissid2() {
        const pyramid = createPyramid('pyramid', {...this.baseOption}, this.scene)
        const faces = this.faces = [pyramid]
        for(let i=1; i<12; i++) faces.push(pyramid.createInstance('f-'+i))
        this.placeFaces(PolyhedronData.p12, faces[0].edgeLength)
        this._param = 0    
        // this._v0 = -faces[0].pentagonEdgeLength * (0.42533 + 1.11352); // dod inradius + great dod inradius    
    }

    get param() { return this._param; }
    set param(v) {
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
            })
        }
    }


}