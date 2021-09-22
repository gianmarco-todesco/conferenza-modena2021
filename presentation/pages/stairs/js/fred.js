
	function myCylinderGeometry(r0,r1,h) {
        var n = 30, m = 10;
        var normals = [];
		var geom =  new THREE.Geometry();
        var u = new THREE.Vector2(h,r1-r0).normalize();
        
        for(var i=0;i<n;i++) {
            var phi = Math.PI*2*i/n;
            var cs = Math.cos(phi);
            var sn = -Math.sin(phi);
            var nrm = new THREE.Vector3(u.x*cs,u.x*sn,u.y);
            for(var j=0;j<m;j++) {
                var t = j/(m-1);
                var r = r0 * (1-t) + r1 * t;
                normals.push(nrm);
                geom.vertices.push(new THREE.Vector3(cs*r,sn*r,h*t));
            }
        }
        for(var i=0;i<n;i++) {
            var i1 = (i+1)%n;
            for(var j=0;j+1<m;j++) {
                var k0 = i*m+j, k1 = k0+1, k3 = i1*m+j, k2 = k3+1;
                var f = new THREE.Face3(k0,k1,k2);
                f.vertexNormals = [normals[k0],normals[k1],normals[k2]];
                geom.faces.push(f);
                f = new THREE.Face3(k0,k2,k3);
                f.vertexNormals = [normals[k0],normals[k2],normals[k3]];
                geom.faces.push(f);
            }
        }
        // geom.computeFaceNormals();
		return geom;
	}
	
	function LegData() {
		this.thighHeight = 0.8;
		this.thighGeometry = myCylinderGeometry(0.10,0.10,this.thighHeight);
		this.legHeight = 0.8;
		this.legGeometry = myCylinderGeometry(0.1,0.1,this.legHeight);
		this.kneeGeometry = new THREE.SphereGeometry(0.14,30,30);
		this.footGeometry = new THREE.SphereGeometry(0.14,30,30);
		this.thighMaterial = this.legMaterial = 
			new THREE.MeshLambertMaterial({ color:0x880000 });
		this.kneeMaterial = new THREE.MeshPhongMaterial({ color:0x551133 });
		this.footMaterial = new THREE.MeshPhongMaterial({ color:0x111177 });
	}
	
	function Leg(data) {
	    THREE.Object3D.call( this );
		this.thigh = new THREE.Mesh(data.thighGeometry, data.thighMaterial);
		this.add(this.thigh);
		this.thighHeight = data.thighHeight;
		this.knee = new THREE.Mesh(data.kneeGeometry, data.kneeMaterial);
		this.add(this.knee);
		this.leg = new THREE.Mesh(data.legGeometry, data.legMaterial);
		this.add(this.leg);
		this.legHeight = data.legHeight;
		this.foot = new THREE.Mesh(data.footGeometry, data.footMaterial);
		this.add(this.foot);
		this.axis = new THREE.Vector3(1,0,0);
		this.setFootPos(new THREE.Vector3(0,-1,0));
	}
	
	Leg.prototype = Object.create( THREE.Object3D.prototype );
	
	Leg.prototype.setFootPos = function(pos) {
		var d = pos.length();
		var thigh = this.thighHeight;
		var leg = this.legHeight;
		var dMax = thigh+leg;
		if(d>dMax) {
			pos.multiplyScalar(dMax/d);
			d = dMax;
		}
		var ang = Math.acos((thigh*thigh+d*d-leg*leg)/(2*thigh*d));
		var u = new THREE.Vector3().copy(pos).normalize();
		var p1 = new THREE.Vector3().copy(u).multiplyScalar(thigh);
		var axis = this.axis.clone(); // new THREE.Vector3(1,0,1).normalize();
		axis.sub(new THREE.Vector3().copy(u).multiplyScalar(u.dot(axis))).normalize();
		p1.applyAxisAngle(axis,ang);
		this.knee.position.copy(p1);
		this.foot.position.copy(pos);
		this.thigh.lookAt(p1);
		this.leg.position.copy(p1);
		this.leg.lookAt(pos);
	}
	
	Leg.prototype.animate = function(t) {
		t -= Math.floor(t);
		var t0 = 0.55;
		var x=0,y=-1.6,z=0;
		if(t<t0) {
			z = (t/t0-0.5);
		}
		else {
			var psi = Math.PI*(t-t0)/(1-t0);
			z = 0.5*Math.cos(psi);
			y += 0.3*Math.sin(psi);
		}
		this.setFootPos(new THREE.Vector3(0,y,z));	
	}
	Leg.prototype.moveForward = function () {
		var q = new THREE.Vector3();
		return function(footPrint1, footPrint2, t) {
			q.copy(footPrint1).lerp(footPrint2, t);
			q.y += 0.3*4*t*(1-t);
			this.worldToLocal(q);
			this.setFootPos(q);				
		}
	}();
	Leg.prototype.moveBackward = function () {
		var q = new THREE.Vector3();
		return function(footPrint) {
			q.copy(footPrint);
			this.worldToLocal(q);
			this.setFootPos(q);			
		}
	}();
	
	
	function Body() {
	    THREE.Object3D.call( this );
		var legData = new LegData();
		
		this.add(this.leftLeg = new Leg(legData));
		this.leftLeg.position.x = -0.2;
		this.leftLeg.axis.set(1,0,-1).normalize();
		
		this.add(this.rightLeg = new Leg(legData));
		this.rightLeg.position.x = 0.2;
		this.rightLeg.axis.set(1,0,1).normalize();
		
		this.y = 1.2;
		this.leftLeg.setFootPos(new THREE.Vector3(0,-this.y,0));
		this.rightLeg.setFootPos(new THREE.Vector3(0,-this.y,0));
		
		var head = new THREE.Mesh(
			new THREE.SphereGeometry(0.5,20,20), 
			new THREE.MeshPhongMaterial({
				color:0xBB9911,
				specular:0x111111,
				shininess:10
				
			}));
		this.head = head;
		head.position.y = 0.3;
		this.add(head);
        
        var eyeGeometry = new THREE.SphereGeometry(0.2,20,20);
        var eyeMaterial = new THREE.MeshLambertMaterial({
			color:0xffffff,
			map:THREE.ImageUtils.loadTexture("textures/eye.jpg")
		});
        
		var eyeLidGeometry = new THREE.SphereGeometry(0.22,20,20,0,Math.PI, 0,Math.PI*1.3);
        var eyeLidMaterial = new THREE.MeshPhongMaterial({
			color:0xBB9911,
			specular:0x111111,
			shininess:10
		});
		head.eyeLids = [];
		
		for(var eyeIndex = 0; eyeIndex<2; eyeIndex++) {
			
			var eye;
			eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
			eye.position.set(0.2*(-1+2*eyeIndex),0.2,-0.35);
			eye.rotation.y = Math.PI/2;
			head.add(eye);
			
			var eyeLid;
			eyeLid = new THREE.Mesh(eyeLidGeometry, eyeLidMaterial);
			eyeLid.position.set(0.2*(-1+2*eyeIndex),0.2,-0.35);
			// eyeLid.rotation.y = Math.PI/2;
			head.add(eyeLid);
			head.eyeLids.push(eyeLid);
			/*
			eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
			eye.position.set(-0.2,0.2,-0.35);
			eye.rotation.y = Math.PI/2;
			
			head.add(eye);
			*/
			
        }
		
		head.blink = function(t) {
			this.eyeLids[0].rotation.x = -Math.PI*t;
			this.eyeLids[1].rotation.x = -Math.PI*t;
		}
		this.footPrints = [];
	}
	
	Body.prototype = Object.create( THREE.Object3D.prototype );
	

	var bezier2 = function() {
		var p12 = new THREE.Vector3();
		var p23 = new THREE.Vector3();
		return function(ris, p1,p2,p3,t) {
			p12.copy(p1).lerp(p2,t);
			p23.copy(p2).lerp(p3,t);
			ris.copy(p12).lerp(p23,t);
			return ris;
		}
	}();
		
	Body.prototype.animate = function() {
		var p1 = new THREE.Vector3();
		// var p2 = new THREE.Vector3();
		var p3 = new THREE.Vector3();
		var d1 = new THREE.Vector3();
		var d2 = new THREE.Vector3();
		var d3 = new THREE.Vector3();
		return function(t) {
			var prints = this.footPrints;
			var n = prints.length;
			if(n<6) return;
			
			var k = Math.floor(t); 
			t -= k;
      k %= n;
			
			var q1 = prints[(k+n-1)%n], q2 = prints[k], q3 = prints[(k+1)%n];
			p1.copy(q1).lerp(q2,0.5);
			p3.copy(q3).lerp(q2,0.5);
			
			bezier2(this.position, p1,q2,p3, t);
			this.position.y += this.y + 0.1*Math.cos(t*2*Math.PI);
			
			d1.copy(q1).sub(prints[(k+n-2)%n]);
			d2.copy(q3).sub(q1);
			d3.copy(prints[(k+2)%n]).sub(q3);			
			d1.lerp(d3,t);
			d1.lerp(d2,0.5);
			
			var phi = Math.atan2(d1.x,d1.z) + Math.PI;
			this.rotation.y = phi;
			this.updateMatrixWorld(true);

			var legs = [this.leftLeg, this.rightLeg];
			var j = (k+1+1)%2;
			var leg1 = legs[j], leg2 = legs[1-j];
			leg1.updateMatrix();
			leg2.updateMatrix();
			
			leg1.moveForward(q1,q3,t);
			leg2.moveBackward(q2);
		};
	}();
