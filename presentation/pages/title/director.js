
class Director {

    constructor(actors, stages) {
        this.stages = stages;
        this.actors = actors;
        for(let actorId in actors) {
            let actor = actors[actorId];
            actor.controller = null;
            actor.visible = true;
            actor.id = actorId;
        }
        this.currentActor = null;
        stages.forEach((s,i)=>s.stageIndex = i);
        this.currentStage = stages[0];
        this.index = 0;
        this.updateActors();
        if(this.currentStage.start) this.currentStage.start(this);
    }

    onMouseDown(btn, x, y) {
        this.oldMouseX = x;
        this.oldMouseY = y;
        this.startMouseX = x;
        this.startMouseY = y;
        let controller = this.currentActor ?  this.currentActor.controller : null;
        if(controller) {
            this.startParam = btn == 0 ? controller.param : controller.param2;
        }
    }
    onMouseUp() {}
    onMouseDrag(btn, x, y) {
        console.log(btn,x,y);
        let dx = x - this.startMouseX; this.oldMouseX = x;    
        let dy = y - this.startMouseY; this.oldMouseY = y;
        let controller = this.currentActor ?  this.currentActor.controller : null;
        if(controller) {
            if(btn == 0) controller.param = this.startParam + dy * 0.01;
            else controller.param2 = this.startParam + dy * 0.01;
        }
    }
    
    tick(dt) {
        let stage = this.currentStage;
        if(stage.stageIndex != this.index) {
            let stopped = stage.stop ? stage.stop(dt, this) : true;
            if(stopped) {
                if(this.index > stage.stageIndex) {
                    stage = this.stages[stage.stageIndex+1];
                } else {
                    stage = this.stages[stage.stageIndex-1];
                }
                this.currentStage = stage;
                this.updateActors();
                console.log("Stage #" + stage.stageIndex);
                if(stage.start) stage.start(this);
            }                
        } else {
            if(stage.tick) stage.tick(dt, this);
        }
    }

    updateActors() {
        const stage = this.currentStage;
        for(let actorId in this.actors) {
            let actor = this.actors[actorId];
            if(stage.actors.indexOf(actor.id)>=0) {
                if(actor.controller) {
                    actor.controller.pivot.setEnabled(true);
                }
                else
                {
                    actor.controller = actor.create();    
                    if(actor.id != "star")
                        actor.controller.pivot.parent = slide.modelPivot;                
                }
            } else {
                // not needed anymore
                if(actor.controller) 
                    actor.controller.pivot.setEnabled(false);
            }
        }
        this.currentActor = this.actors[this.currentStage.actors[0]];
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

const stages_old = [
    {
        // stage #0 : titolo + sissid ruotante
        start: () => {
            if(!slide.model) createStar(true);
            document.getElementById('title').style.left = "0";
            document.getElementById('credits').style.left = "0";
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
           document.getElementById('credits').style.left = "-110%";
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
        // stage #3 : sissid con 12 facce
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


const actors = {
    'sissid' : {
        create : () => {
            const scene = slide.scene;
            let controller = new PolyhedronModel({
                shapeId : 3, 
                edgeColor : [0.8,0.7,0.8],
                faceColor : [0.8,0.4,0.1],
                baseFaceColor : [0.8,0.3,0.0]        
            },scene);
            // controller.pivot.parent = slide.modelPivot;
            return controller;
        }
    },
    'sissid-p' : {
        create : () => {
            const scene = slide.scene;
            let controller = new PolyhedronModel({
                shapeId : 4, 
                edgeColor : [0.8,0.7,0.8],
                faceColor : [0.8,0.4,0.1],
                baseFaceColor : [0.8,0.3,0.0]        
            },scene);
            // controller.pivot.parent = slide.modelPivot;
            let dod = new PolyhedronModel({
                shapeId : 1,
                edgeColor : [0.8,0.8,0.8],
                faceColor : [0.8,0.3,0.0]
            },scene);
            dod.pivot.parent = controller.pivot;              
            return controller;
        }
    },
    'dod' : {
        create : () => {
            const scene = slide.scene;
            let controller = new PolyhedronModel({
                shapeId : 1, // withPyramids ? 4 : 3,
                edgeColor : [0.9,0.5,0.1],
                faceColor : [0.9,0.4,0.1],
                scaleFactor : 2
            },scene);
            // controller.pivot.parent = slide.modelPivot;
            return controller;
        }
    },
    'ico' : {
        create : () => {
            const scene = slide.scene;
            let controller = new PolyhedronModel({
                shapeId : 2, // withPyramids ? 4 : 3,
                edgeColor : [0.2,0.6,0.9],
                faceColor : [0.2,0.5,0.8],
                scaleFactor : 2
            },scene);
            return controller;
        }
    },
    'star' : {
        create : () => {
            const scene = slide.scene;
            let controller = new StarModel({
                edgeColor : [0.2,0.2,0.8]
            },scene);
            return controller;
        }
    }
};

const stages = [
    {
        actors: ['sissid-p'],
        
        start : () => {
            document.getElementById('title').style.left = "0";
            document.getElementById('credits').style.left = "0";
            slide.isSpinning = true;
        }, 
        stop : () => {
            document.getElementById('title').style.left = "110%";
            document.getElementById('credits').style.left = "-110%";
            slide.isSpinning = false;
            return true
        }
    },
    {
        actors: ['sissid-p']
    },
    {
        actors: [],
        start : () => { 
            slide.tangled.setEnabled(true); 
            slide.tangled.parent = slide.modelPivot;
            slide.isSpinning = true;
        },
        stop : () => {
            slide.tangled.setEnabled(false); 
            slide.tangled.parent = null;
            slide.isSpinning = true;
            return true;
        }
    },
    {
        actors: ['sissid-p']
    },
    {
        actors: ['sissid']
    },
    {
        actors: ['star'],
        start : () => {
            slide.camera.alpha = -Math.PI / 2;
            slide.camera.beta = Math.PI / 2;
        }
    },
    {
        actors: ['dod']
    },
    {
        actors: ['ico']
    },
    {
        actors: ['sissid']
    },

];

function createDirector() {
    return new Director(actors, stages);
}