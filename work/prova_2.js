MYLIB.initialize('renderCanvas', populateScene2);
let sphere;

/*
class Surface {
    constructor(f, nu, nv, scene) {
        this.nu = nu;
        this.nv = nv;
        
        let vd = new BABYLON.VertexData();
        this.positions = vd.positions = [];
        vd.uvs = [];
        vd.indices = [];
        vd.normals = [];
        for(let i=0; i<nu; i++) {
            let u = i/(nu-1);
            for(let j=0;j<nv; j++) {
                let v = j/(nv-1);
                let p = f(u,v,0);
                vd.positions.push(p.x,p.y,p.z);
                vd.uvs.push(u,v);
                let norm = computeNormal(f, u,v, 0);
                vd.normals.push(norm.x,norm.y,norm.z);
            }
        }
        for(let i=0; i+1<nu; i++) {
            for(let j=0;j+1<nv; j++) {
                let k = i*nv+j;
                vd.indices.push(k,k+1,k+1+nv, k,k+1+nv,k+nv);
            }
        }
        / *
        vd.normals = [];
        BABYLON.VertexData.ComputeNormals(
            vd.positions, 
            vd.indices, 
            vd.normals);
            * /
        mesh = new BABYLON.Mesh('surface', scene);
        vd.applyToMesh(mesh, true);
    
    
        scene.registerBeforeRender(() => {
    
            let t = performance.now() * 0.001;
            let positions = [];
            let normals = [];
            for(let i=0; i<nu; i++) {
                let u = i/(nu-1);
                for(let j=0;j<nv; j++) {
                    let v = j/(nv-1);
                    let p = f(u,v,t);
                    positions.push(p.x,p.y,p.z);
                    vd.uvs.push(u,v);
                    let norm = computeNormal(f, u,v, t);
                    normals.push(norm.x,norm.y,norm.z);
                }
            }
            //mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
            //mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);    
        });
    
    
        return mesh;        

    }
}
*/



function computeNormal(f,u,v,t) {
    const h = 0.001;
    let dfdu = f(u+h,v,t).subtract(f(u-h,v,t));
    let dfdv = f(u,v+h,t).subtract(f(u,v-h,t));
    return BABYLON.Vector3.Cross(dfdu,dfdv).normalize();
}

function createCustomMesh(f, nu, nv, scene) {
    let vd = new BABYLON.VertexData();
    this.positions = vd.positions = [];
    vd.uvs = [];
    vd.indices = [];
    vd.normals = [];
    for(let i=0; i<nu; i++) {
        let u = i/(nu-1);
        for(let j=0;j<nv; j++) {
            let v = j/(nv-1);
            let p = f(u,v,0);
            vd.positions.push(p.x,p.y,p.z);
            vd.uvs.push(u,v);
            let norm = computeNormal(f, u,v, 0);
            vd.normals.push(norm.x,norm.y,norm.z);
        }
    }
    for(let i=0; i+1<nu; i++) {
        for(let j=0;j+1<nv; j++) {
            let k = i*nv+j;
            vd.indices.push(k,k+1,k+1+nv, k,k+1+nv,k+nv);
        }
    }
    /*
    vd.normals = [];
    BABYLON.VertexData.ComputeNormals(
        vd.positions, 
        vd.indices, 
        vd.normals);
        */
    mesh = new BABYLON.Mesh('surface', scene);
    vd.applyToMesh(mesh, true);


    scene.registerBeforeRender(() => {

        let t = performance.now() * 0.001;
        let positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        let normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
        let pi = 0;
        let ni = 0;
        for(let i=0; i<nu; i++) {
            let u = i/(nu-1);
            for(let j=0;j<nv; j++) {
                let v = j/(nv-1);
                let p = f(u,v,t);
                positions[pi] = p.x;
                positions[pi+1] = p.y;
                positions[pi+2] = p.z;
                pi+=3;
                let norm = computeNormal(f, u,v, t);
                normals[ni] = norm.x;
                normals[ni+1] = norm.y;
                normals[ni+2] = norm.z;
                ni+=3;
            }
        }

        mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);    
    });


    return mesh;       
}


function createGridTexture(scene) {
    let tx = new BABYLON.DynamicTexture('dt', {width:1024, height:1024}, scene);
    let ctx = tx.getContext('2d');
    ctx.fillStyle = 'magenta';
    ctx.fillRect(0,0,1024,1024);
    ctx.fillStyle = 'white';
    for(let i=0;i<16;i++) {
        for(let j=0;j<16;j++) {
            if((i+j)&1) ctx.fillRect(i*64,j*64,64,64);
        }
        
    }

    ctx.fillStyle = 'black';
    for(let i=0;i<1024;i+=64) {
        ctx.fillRect(0,i,1024,6);
        ctx.fillRect(i,0,6,1024);        
    }

    tx.update();
    tx.hasAlpha = true;
    return tx;    

}

function populateScene2(scene) {
    // MYLIB.createGrid(scene);

    const R0 = 3, R1 = 1;
    let f = (u,v,t) => {
        let phi = Math.PI*2*v;
        let theta = Math.PI*2*u;
        let r1 = R1 * (1 + 0.2 * Math.sin(theta*3 + phi * 3 + t*3));
        let r = R0 + Math.cos(theta) * r1;
        return new BABYLON.Vector3(Math.cos(phi) * r, Math.sin(theta) * r1, Math.sin(phi) * r);
    };

    mesh = createCustomMesh(f, 70,70, scene);


    material = mesh.material = new BABYLON.StandardMaterial('mat', scene);
    material.backFaceCulling = false;
    material.twoSidedLighting = true;
    material.diffuseColor.set(0.4,0.7,0.8);
    material.specularColor.set(0.1,0.1,0.1);

    material.diffuseTexture = createGridTexture(scene);
    // material.useAlphaFromDiffuseTexture = true;
}






let material;

function populateScene(scene) {
    MYLIB.createGrid(scene);

    function f(u,v) {
        let r = Math.sqrt(u*u+v*v) * 2;
        return r==0 ? 1.0 : Math.sin(r)/r;
    }
    
    material = new BABYLON.StandardMaterial('mat',scene);

    let nx = 60, nz = 60;
    let vd = new BABYLON.VertexData();
    vd.positions = [];
    vd.indices = [];
    vd.uvs = [];
    for(let iz=0;iz<nz;iz++) {
        let z = (-1+2*iz/(nz-1))*5;
        for(let ix=0;ix<nx;ix++) {
            let x = (-1+2*ix/(nx-1))*5;
            y = f(x,z) + 2;
            vd.positions.push(x,y,z);                
            vd.uvs.push(ix/nx, iz/nz);
        }
    }
    for(let iz=0;iz+1<nz;iz++) {
        for(let ix=0;ix+1<nx;ix++) {
            let k = iz*nx+ix;
            vd.indices.push(k,k+1,k+1+nx, k,k+1+nx,k+nx);
        }
    }
    vd.normals = [];
    BABYLON.VertexData.ComputeNormals(
        vd.positions, 
        vd.indices, 
        vd.normals);
    mesh = new BABYLON.Mesh('surface', scene);
    vd.applyToMesh(mesh, true);
    mesh.material = material;


    let tx = new BABYLON.DynamicTexture('dt', {width:1024, height:1024}, scene);
    let ctx = tx.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,1024,1024);
    ctx.fillStyle = 'black';
    for(let i=0;i<1024;i+=64) {
        ctx.fillRect(0,i,1024,6);
        ctx.fillRect(i,0,6,1024);        
    }
    tx.update();
    material.diffuseTexture = tx;
    

    scene.registerBeforeRender(() => {
        let t = performance.now() * 0.001;

        let positions = [];
        for(let iz=0;iz<nz;iz++) {
            let z = (-1+2*iz/(nz-1))*5;
            for(let ix=0;ix<nx;ix++) {
                let x = (-1+2*ix/(nx-1))*5;
                y = f(x,z) * Math.sin(t*2) + 2;
                positions.push(x,y,z);                
            }
        }
        mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    

    });
    



}