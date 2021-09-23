
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
        let scaleFactor = options.scaleFactor || 1.0;
        
        this.scene = scene
        this._param = 0;
        this._param2 = 1;
                
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
            r:0.7 * scaleFactor, 
            h:0.0025, 
            h2:0.01 * scaleFactor, 
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
        if(this.shapeId == 4) { if(v<0.0) v=0.0; }
        this._param = this.setFaceTranslation(v);  
    }
    get param2() { return this._param2; }
    set param2(v) {
        v = Math.max(0.1, Math.min(2.0, v));
        this._param2 = this.setPyramidScaling(v);
    }

    setFaceTranslation(v) {
        const snap = 0.04;
        if(Math.abs(v) < snap) v = 0;
        else if(this._v0 && Math.abs(v-this._v0) < snap) v = this._v0;
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
        return v;
    }

    setPyramidScaling(v) {
        const snap = 0.04;
        if(Math.abs(v-1) < snap) v = 1;
        if(this.faces) {
            this.faces.forEach(face => {
                face.scaling.y = v;
            })
        }
        return v;
    }
}




class StarModel {


    constructor(options, scene) {
        let edgeColor = options.edgeColor || [0.3,0.5,0.7];        
        this.scene = scene
        this._param = 0;
                
        let mat;
        mat = this.edgeMat = new BABYLON.StandardMaterial('edge-mat',scene)
        mat.diffuseColor.set(...edgeColor)
        mat.specularColor.set(0.3,0.3,0.3)
        let thickness = 0.1;
        let edgeLength = 3;
        this.pivot =  new BABYLON.TransformNode('model', scene);       

        let edgeMesh = this._createCappedEdge(edgeLength, scene);
        edgeMesh.material = mat;
        let edges = this.edges = [edgeMesh];
        for(let i=1; i<5; i++) edges.push(edgeMesh.createInstance('e'+i));
        // see : https://mathworld.wolfram.com/Pentagram.html
        const r1 = this.r1 = 0.16246 * edgeLength;
        const r2 = this.r2 = 0.688 * edgeLength;
        
        this.dirs = [];
        for(let i=0; i<5; i++) {
            let edge = edges[i];
            edge.parent = this.pivot;
            let phi = Math.PI*2*i/5;
            edge.rotation.z = phi;
            let cs = Math.cos(phi), sn = Math.sin(phi);
            this.dirs.push(cs,sn);
            edge.position.set(r1*cs, r1*sn, 0);
        }
        this._param = r1;    
    }

    _createCappedEdge(edgeLength, scene) {
        let thickness = 0.03;
        let meshes = [];
        meshes.push(BABYLON.MeshBuilder.CreateCylinder('starEdge', {
            height: edgeLength,
            diameter: thickness*2
        }, scene));
        for(let i=0; i<2; i++) {
            let sphere = BABYLON.MeshBuilder.CreateSphere('starEdgeCap'+i, {
                diameter: thickness*2
            }, scene);
            sphere.position.y = edgeLength*0.5*(-1+2*i);
            meshes.push(sphere);
        }
        const mesh = BABYLON.Mesh.MergeMeshes(meshes, true, false, false, false, false);
        return mesh;
    }


    get param() { return this._param; }
    set param(v) {
        const eps = 0.05;
        if(Math.abs(v - this.r1)<eps) v = this.r1;
        else if(Math.abs(v - this.r2)<eps) v = this.r2;
        this._param = v;

        for(let i=0; i<5; i++) {
            let edge = this.edges[i];
            let cs = this.dirs[i*2], sn = this.dirs[i*2+1];
            edge.position.set(v*cs,v*sn,0);
        }
    }

    dispose() {
        this.edges.forEach(edge => edge.dispose());
        this.pivot.dispose();
        this.pivot = null;
        this.edges = [];
    }

}



function loadTangled() {
    const scene = slide.scene;
    texture = new BABYLON.DynamicTexture('texture', {
        width:1024, 
        height:1024
    }, scene);
			
    let ctx = texture.getContext();
    var grd = ctx.createLinearGradient(0, 0, 1024, 0);
    grd.addColorStop(0.4, "orange");
    grd.addColorStop(0.49, "white");
			
    grd.addColorStop(0.52, "white");
    grd.addColorStop(0.6, "teal");
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,1024,1024);
    texture.update();
	
    BABYLON.SceneLoader.Append("./data/", "fig8a.obj", scene, 
        (scene) => {
            
            let obj = scene.meshes[scene.meshes.length-1];
            obj.material = new BABYLON.StandardMaterial('mat', scene);
            obj.material.diffuseTexture = texture;
            slide.tangled = obj;
            obj.setEnabled(false);
            obj.scaling.set(0.5,0.5,0.5);

    });
}
