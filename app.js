
/*global THREE, Coordinates, document, window, $ */
var camera, scene, renderer;
var cameraControls;

(function(){


	var dna;

	var clock = new THREE.Clock();

	function fillScene() {
		scene = new THREE.Scene();
		// scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

		// LIGHTS

		scene.add( new THREE.AmbientLight( 0x222222 ) );

		var light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
		light.position.set( 200, 500, 500 );

		scene.add( light );

		light = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
		light.position.set( -200, -100, -400 );

		scene.add( light );

		Coordinates.drawGround({size:1000});

		createDNA();
		// test();
		// createDrinkingBird();
	}

	function spiral (offset) {
		var geometry = new THREE.Geometry();
		var circleSegments = 20;
		var laps = 2;
		var radius = 100;
		var step = 2*Math.PI / circleSegments;
		for (var i = 0; i < circleSegments*laps; i++) {
			var angle = step * i + offset;

			var x = Math.sin(angle) * radius;
			var z = Math.cos(angle) * radius;
			geometry.vertices.push(new THREE.Vector3( x, i*30, z ));
		};
		return geometry;
	}

	var nucleotides = {
		adenin:{color:0xffff00, width:20, length:2/3},
		thymine:{color:0x00ffff,width:40,length:1/3},
		guanine:{color:0x0000ff,width:30,length:2/3},
		cytosine:{color:0xff0000,width:10,length:1/3}
	};

	function convert(input) {
		//convert to binary
	    var binary = "";
	    for (i=0; i < input.length; i++) {
	        binary += input[i].charCodeAt(0).toString(2) + "";
	    };
	    console.log(binary)

	    // convert to nucleotides
	    var n = [];
	    for (i=0; i < binary.length; i++) {
	    	// TODO
	    	console.log(input.charAt(i))
	    	var nuc = binary.charAt(i) == "1" ? nucleotides.adenin : nucleotides.thymine;
	        n.push(nuc);
	    };

		return n;
	}

	function connect (spiral1, spiral2) {
		var nucs = convert("hithereherethrerhi");


		var lines = new THREE.Object3D();
		// var material = new THREE.LineBasicMaterial({color:0x407711, linewidth:10});

		// THREE.GeometryUtils.merge(geometry, otherGeometry);


		for (var i = 0; i < spiral1.geometry.vertices.length; i++) {
			// var geometry = new THREE.Geometry();
			// geometry.vertices.push(spiral1.geometry.vertices[i],spiral2.geometry.vertices[i]);
			// lines.add(new THREE.Line( geometry, material ));

			var line = new Line(
				spiral1.geometry.vertices[i],
				spiral2.geometry.vertices[i],
				nucs[2*i],
				nucs[Math.abs(2*i-1)]
			);

			lines.add(line.getMesh());
		};

		return lines;
	}

	var Line = function (fromVertice, toVertice, nuc1, nuc2) {

		var geometry;
		var material;

		this.segments = new THREE.Object3D();

		// calculate meeting point of nucleotides, (same height: y = 0)
		var segmentDeltaVector = new THREE.Vector3(
			(toVertice.x - fromVertice.x)*nuc1.length,
			0,
			(toVertice.z - fromVertice.z)*nuc1.length
		);
		var meetingPoint = (fromVertice.clone()).add(segmentDeltaVector);


		// add the first nucleotide
		material = new THREE.LineBasicMaterial({color:nuc1.color, linewidth:nuc1.width});
		geometry = new THREE.Geometry();
		geometry.vertices.push(fromVertice,meetingPoint);
		this.segments.add(new THREE.Line(geometry, material));

		// add second nucleotide
		geometry = new THREE.Geometry();
		material = new THREE.LineBasicMaterial({color:nuc2.color, linewidth:nuc2.width});
		geometry.vertices.push(meetingPoint,toVertice);	
		this.segments.add(new THREE.Line(geometry, material));
	};

	Line.prototype.getMesh = function() {
		return this.segments;
	}

	function createDNA () {
		
		var material = new THREE.LineBasicMaterial({linewidth:10});

		var spiral1 = new THREE.Line( spiral(0), material );
		var spiral2 = new THREE.Line( spiral(Math.PI), material );

		dna = new THREE.Object3D();

		dna.add(spiral1);
		dna.add(spiral2);

		dna.add(connect(spiral1, spiral2));

		scene.add(dna);
		// var material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide});
		// material.color.r = 104/255;
		// material.color.g = 1/255;
		// material.color.b = 5/255;
		// geometry = new THREE.Line3(0,1);


		// mesh.position.y = 100;

	};

	function init() {
		var canvasWidth = 600;
		var canvasHeight = 800;
		// For grading the window is fixed in size; here's general code:
		//var canvasWidth = window.innerWidth;
		//var canvasHeight = window.innerHeight;
		var canvasRatio = canvasWidth / canvasHeight;

		// RENDERER
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		renderer.setSize(canvasWidth, canvasHeight);
		renderer.setClearColorHex( 0xAAAAAA, 1.0 );

		// CAMERA
		camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );
		// CONTROLS
		cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
		camera.position.set( 1200, 1200, 1200 );
		cameraControls.target.set(0,600,0);

		fillScene();
	}

	function addToDOM() {
		var container = document.getElementById('container');
		var canvas = container.getElementsByTagName('canvas');

		if (canvas.length>0) {
			container.removeChild(canvas[0]);
		}
		container.appendChild( renderer.domElement );
	}

	function animate() {
		var targetFps = 10;
		window.setInterval(render, 1000 / targetFps);
		// window.requestAnimationFrame(animate);
		// render();
	}

	// var delta = 0.1;
	var rot = Math.PI;

	function render() {
		var delta = clock.getDelta();
		cameraControls.update(delta);

		// rot += 0.02;
		// dna.rotation.setY(rot);

		renderer.render(scene, camera);
	}


	try {
		init();
		fillScene();
		addToDOM();
		animate();
	} catch(e) {
		var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
		$('#container').append(errorReport+e);
	}
})();