var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer  = new THREE.WebGLRenderer(),
	projector = new THREE.Projector(),
	mouse     = new THREE.Vector3();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var anchorMesh    = new THREE.Object3D(),
	colors        = new ColorScheme().from_hue(220).distance(0.9).scheme('contrast').variation('hard').colors();

var languages = {}, numLanguages = 0;

window.addEventListener('click', function(e) {
	mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
	mouse.y = 1 - 2 * ( e.clientY / window.innerHeight );

	var raycaster = projector.pickingRay( mouse.clone(), camera ),
		pick      =	raycaster.intersectObjects(anchorMesh.children);

	if(pick && pick[0]) alert(pick[0].object.data.name + " contains " + pick[0].object.data.lines + " lines");	
});

window.addEventListener('keydown', function(e) {
	switch(e.keyCode) {
		case 87: // W
			camera.translateZ(-0.5);
		break;
		case 83: // S
			camera.translateZ(0.5);
		break;
		case 65: // A
			camera.rotateOnAxis(new THREE.Vector3( 0, 1, 0 ), 0.1);
		break
		case 68: // D
			camera.rotateOnAxis(new THREE.Vector3( 0, 1, 0 ), -0.1);
		break;
		case 38: // Arrow up
			camera.rotateOnAxis(new THREE.Vector3( 1, 0, 0 ), 0.01);
		break;
		case 40: // Arrow down
			camera.rotateOnAxis(new THREE.Vector3( 1, 0, 0 ), -0.01);
		break;
	}
});

if(window.location.hash) {
	document.getElementById("analyse").style.display = "none";
	$.getJSON("repos/" + window.location.hash.slice(1), initGrid);
	console.log(window.location.hash.slice(1));
}

function initGrid(theGrid) {
	console.log("INIT", theGrid.length, theGrid[0]);
	var gridDimension = Math.ceil(Math.sqrt(theGrid.length)),
		maxHeight = 0;
	
	for(var x=0; x<gridDimension; x++) {
		for(var z=0; z<gridDimension; z++) {
			var block 	 = theGrid[x * gridDimension + z];
			if(!block) break;
			
			if(!languages[block.language]) { 
				languages[block.language] = new THREE.MeshBasicMaterial({ color: parseInt(colors[numLanguages++ % colors.length], 16) });
			}
	
			var height 	 = block.lines / 10.0,
				geometry = new THREE.BoxGeometry(1, height, 1),
				cube 	 = new THREE.Mesh(geometry, languages[block.language]);

			if(height > maxHeight) maxHeight = height;
	
			cube.position.x =  -(gridDimension - 1) + x * 2;
			cube.position.z =  -(gridDimension - 1) + z * 2;
			cube.position.y = height / 2;
			
			cube.data = block;
	
			anchorMesh.add(cube);
		}
	}
	scene.add(anchorMesh);
	
	camera.position.z = 3 * gridDimension;
	camera.position.y =  (maxHeight / theGrid.length);
	camera.position.x = gridDimension / 2;
}

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}
render();
