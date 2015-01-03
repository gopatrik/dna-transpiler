
/*global THREE, Coordinates, document, window, $ */
var camera, scene, renderer;
var cameraControls;

(function(){


	var dna;

	var clock = new THREE.Clock();

	function fillScene() {
		scene = new THREE.Scene();
		// scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

		lights();

		// Coordinates.drawGround({size:1000});

		createDNA();
	}

	var lights = function () {
		scene.add( new THREE.AmbientLight( 0x999999 ) );

		var light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
		light.position.set( 200, 500, 500 );

		scene.add( light );

		light = new THREE.DirectionalLight( 0xFFFFFF, 1 );
		light.position.set( -200, -100, -400 );

		scene.add( light );
	}

	function spiralGeometry(offset) {
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
		adenin:{color:0xEC6451, width:4, length:2/3},
		thymine:{color:0x3BD086,width:6,length:1/3},
		guanine:{color:0xF3CB31,width:5,length:2/3},
		cytosine:{color:0x45AAE0,width:2,length:1/3}
	};

	function convert(input) {
		//convert to binary
	    var binary = "";
	    for (i=0; i < input.length; i++) {
	        binary += input[i].charCodeAt(0).toString(2) + "";
	    };

	    // convert to nucleotides
	    var n = [];
	    for (i=0; i < binary.length; i++) {
	    	// TODO
	    	var nuc = binary.charAt(i) == "1" ? nucleotides.adenin : nucleotides.thymine;
	        n.push(nuc);
	    };

		return n;
	}

	function connect (nucs, spiral1, spiral2) {
		var lines = new THREE.Object3D();
		// var material = new THREE.LineBasicMaterial({color:0x407711, linewidth:10});

		// THREE.GeometryUtils.merge(geometry, otherGeometry);


		for (var i = 0; i < spiral1.geometry.vertices.length; i++) {
			// var geometry = new THREE.Geometry();
			// geometry.vertices.push(spiral1.geometry.vertices[i],spiral2.geometry.vertices[i]);
			// lines.add(new THREE.Line( geometry, material ));


			var sphereMaterial = new THREE.MeshLambertMaterial( {color:0xffffff});
			var sphereGeometry = new THREE.SphereGeometry( 20, 32, 32);
			var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
			var sphereMesh2 = new THREE.Mesh(sphereGeometry, sphereMaterial);

			sphereMesh.position = spiral1.geometry.vertices[i];
			sphereMesh2.position = spiral2.geometry.vertices[i];

			lines.add(sphereMesh);
			lines.add(sphereMesh2);


			var line = new BasePair(
				spiral1.geometry.vertices[i],
				spiral2.geometry.vertices[i],
				nucs[2*i],
				nucs[Math.abs(2*i-1)]
			);

			lines.add(line.getMesh());
		};

		return lines;
	}

	// courtesy of http://stackoverflow.com/questions/15316127/three-js-line-vector-to-cylinder
	var pipe = function( pointX, pointY,color ) {
		var material = new THREE.MeshLambertMaterial( {color:color} );

	    // edge from X to Y
	    var direction = new THREE.Vector3().subVectors( pointY, pointX );
	    var arrow = new THREE.ArrowHelper( direction, pointX );

	    // cylinder: radiusAtTop, radiusAtBottom, 
	    //     height, radiusSegments, heightSegments
	    var edgeGeometry = new THREE.CylinderGeometry( 6, 6, direction.length(), 6, 4 );
	    var edge = new THREE.Mesh( edgeGeometry, material );

	    edge.rotation = arrow.rotation.clone();
	    edge.position = new THREE.Vector3().addVectors( pointX, direction.multiplyScalar(0.5) );
	    return edge;
	}

	var BasePair = function (fromVertice, toVertice, nuc1, nuc2) {

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

		this.segments.add(pipe(fromVertice, meetingPoint, nuc1.color));
		this.segments.add(pipe(meetingPoint, toVertice, nuc2.color));
	};

	BasePair.prototype.getMesh = function() {
		return this.segments;
	}

	var createDNA = function () {
		var nucs = convert("hithereherethrerhi");
		
		var material = new THREE.LineBasicMaterial({linewidth:3, color:0xE6E6E6});

		var spiral1 = new THREE.Line( spiralGeometry(0), material );


		var spiral2 = new THREE.Line( spiralGeometry(Math.PI), material );

		dna = new THREE.Object3D();

		// dna.add(spiral1);
		// dna.add(spiral2);
		dna.add(connect(nucs, spiral1, spiral2));

		// rotate and reposish
		dna.position.setY(100);
		dna.position.setZ(300);
		dna.rotation.setX(-Math.PI/4);

		scene.add(dna);
	};

	function init() {
		var canvasWidth = 600;
		var canvasHeight = 800;
		// For grading the window is fixed in size; here's general code:
		//var canvasWidth = window.innerWidth;
		//var canvasHeight = window.innerHeight;
		var canvasRatio = canvasWidth / canvasHeight;

		// RENDERER
		renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );
		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		renderer.setSize(canvasWidth, canvasHeight);
		renderer.setClearColorHex( 0x2C3E50, 1.0 );

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

	var animFrame;
	function animate() {
		// var targetFps = 1;
		// window.setInterval(render, 1000 / targetFps);
		animFrame = window.requestAnimationFrame(animate);
		render();
		
	}

	function startAnimation () {
		animFrame = window.requestAnimationFrame(animate);
	}

	function stopAnimation () {
		cancelAnimationFrame( animFrame );
	}

	// var delta = 0.1;
	var rot = Math.PI;

	function render() {
		var delta = clock.getDelta();
		cameraControls.update(delta);

		rot += 0.01;
		dna.rotation.setY(rot);

		renderer.render(scene, camera);
	}


	try {
		init();
		fillScene();
		addToDOM();
		// animate();
		render();

		$('canvas').on('mousedown', function () {
			stopAnimation();
			startAnimation();
		});

		$('canvas').on('mouseup', function () {
			stopAnimation();
		});

	} catch(e) {
		var errorReport = "Your program encountered an unrecoverable error<br/><br/>";
		$('#container').append(errorReport+e);
	}
})();