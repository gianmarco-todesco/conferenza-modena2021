MYLIB.initialize('renderCanvas', populateScene);

function populateScene(scene) {

    MYLIB.createGrid(scene);


    const w = 4; // drums distance
    const h = 4; // max ball height
    const period = 1; // seconds between two consecutive bounces

    let ball = BABYLON.MeshBuilder.CreateSphere('ball', {diameter:2}, scene);
    ball.material = new BABYLON.StandardMaterial('ballmat', scene);
    ball.material.diffuseColor.set(0.9,0.1,0.1);

    

    scene.registerBeforeRender(() => {

        // secondi dall'inizio
        let seconds = performance.now() * 0.001;

        
        // t e dir controllano l'animazione
        // t va da 0 a 1; dir vale 1 (movimento verso destra) o -1 (sinistra)
        let t, dir;

        t = 0.5 * seconds / period; 
        t = 2*(t-Math.floor(t)); // t va da 0 a 2
        if(t<1) { dir = 1; }
        else { t-=1; dir = -1; }


        // legge del moto:

        // la x si muove linearmente fra -w e e w 
        // (il verso dipende da dir)
        ball.position.x = dir * (-0.5+t)  * w; 

        // la y ha un andamento parabolico, con un massimo per t=0.5 e minimo per t=0 e t=1
        // il valore minimo di y è 1 (la palla, con raggio=1,  tocca il pavimento)
        ball.position.y = 1 + h * 4 * t * (1-t);


    });

}