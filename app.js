////////////////////////////////////////////////////////////////////////////////
// Make hat, body, leg and foot of Drinking Bird shiny
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window, $ */
var camera, scene, renderer;
var cameraControls;

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
	adenin:{color:0xffff00, width:20},
	thymine:{color:0x00ffff,width:40},
	guanine:{color:0x0000ff,width:30},
	cytosine:{color:0xff0000,width:10}
};

function connect (spiral1, spiral2) {
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
			nucleotides.adenin,
			nucleotides.thymine
		);

		lines.add(line.getMesh());
	};

	return lines;
}

var Line = function (fromVertice, toVertice, nuc1, nuc2) {


	var segments = 2;

	this.segments = new THREE.Object3D();


	var segmentDeltaVector = new THREE.Vector3( (toVertice.x - fromVertice.x)/segments, 0, (toVertice.z - fromVertice.z)/segments );

	
	this.material = new THREE.LineBasicMaterial({color:nuc1.color, linewidth:nuc1.width});
	this.geometry = new THREE.Geometry();

	// var n = new THREE.Vector3(prev.x + segmentDelta.x),prev.y,prev.z + segmentDelta.z));
	var n = (fromVertice.clone()).add(segmentDeltaVector);


	this.geometry.vertices.push(fromVertice,n);
	this.segments.add(new THREE.Line(this.geometry, this.material));




	// add last
	this.geometry= new THREE.Geometry();
	this.material = new THREE.LineBasicMaterial({color:nuc2.color, linewidth:nuc2.width});
	this.geometry.vertices.push(n,toVertice);	
	this.segments.add(new THREE.Line(this.geometry, this.material));




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
	var targetFps = 30;
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

