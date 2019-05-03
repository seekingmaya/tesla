//fix for scroll bounce
document.body.addEventListener('touchmove', function(e) { e.preventDefault()}, { passive: false });


var mesh;
var bodyMesh; 
var currentColor;

var texture_red, texture_blue, texture_grey, texture_black, texture_white;

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth * 0.99, window.innerHeight * 0.99 );
renderer.gammaOutput = true;
renderer.gammaFactor = 1;
renderer.physicallyCorrectLights = true;
renderer.domElement.style.overflow = "hidden";
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xcccccc );
scene.fog = new THREE.Fog( 0xcccccc, 200, 1000);
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
var controls = new THREE.OrbitControls( camera);
controls.maxPolarAngle = Math.PI / 2;
controls.enableZoom = false;
controls.enablePan = false;
controls.rotateSpeed = 0.5;



init();
animate();
window.addEventListener( 'resize', onWindowResize, false);



function init() {
	if(window.mobilecheck() == true) {
		document.getElementById('order').style.opacity = 0;
	}

/// LOADING MANAGER -----------------------------------------		

	var manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
	};
	manager.onLoad = function () {
		setTimeout(allLoaded, 500);
	};
	manager.onError = function () {
	};

	function allLoaded () {
		document.getElementById("loading").style.opacity = 0;
		console.log("OK");
	}

/// ENVIRONMENT MAP -----------------------------------------				

	currentColor = document.getElementById("select_black");
	selectedColor(currentColor);
	var r = "env/";
	var urls = [ r + "px.jpg", r + "nx.jpg",
				 r + "py.jpg", r + "ny.jpg",
				 r + "pz.jpg", r + "nz.jpg" ];
	textureCube = new THREE.CubeTextureLoader().load( urls );
	textureCube.format = THREE.RGBFormat;
	textureCube.mapping = THREE.CubeReflectionMapping;
	var textureLoader = new THREE.TextureLoader();

/// CAR SHADOWS -----------------------------------------


	var planeTexture = textureLoader.load( 'assets/plane/shade.png');
	var geometry = new THREE.PlaneGeometry( 390, 390, 0 );
    var material = new THREE.MeshBasicMaterial( {map:planeTexture, side:THREE.DoubleSide});
	var plane = new THREE.Mesh( geometry, material );


/// CAR GLB/GLTF MESH -----------------------------------------		

	var loader = new THREE.GLTFLoader(manager);
	loader.load(
		'assets/Tesla_Model_3_DELIVERY.gltf',
		function ( gltf ) {
			console.log(gltf)
			console.log(gltf.scene.children[0]);
			mesh = gltf.scene.children[0];
			bodyMesh = gltf.scene.children[0].children[1].children[0];
			mesh.rotation.x = 0;
			mesh.rotation.y = -Math.PI/4;

			mesh.traverse((node) => {
				if (node.isMesh) {
				    node.material.envMap = textureCube;
				    node.material.envMapIntensity = 2;
		        };
			});

			texture_black = textureLoader.load('assets/CAR_FRAME_baseColor_black.png' );
			texture_black.flipY = false;
			texture_black.wrapS = THREE.RepeatWrapping;
			texture_black.wrapT = THREE.RepeatWrapping;

			texture_grey = textureLoader.load('assets/CAR_FRAME_baseColor_grey.png' );
			texture_grey.flipY = false;
			texture_grey.wrapS = THREE.RepeatWrapping;
			texture_grey.wrapT = THREE.RepeatWrapping;

			texture_blue = textureLoader.load('assets/CAR_FRAME_baseColor_blue.png' );
			texture_blue.flipY = false;
			texture_blue.wrapS = THREE.RepeatWrapping;
			texture_blue.wrapT = THREE.RepeatWrapping;

			texture_white = textureLoader.load('assets/CAR_FRAME_baseColor_white.png' );
			texture_white.flipY = false;
			texture_white.wrapS = THREE.RepeatWrapping;
			texture_white.wrapT = THREE.RepeatWrapping;

			texture_red = textureLoader.load('assets/CAR_FRAME_baseColor_red.png' );
			texture_red.flipY = false;
			texture_red.wrapS = THREE.RepeatWrapping;
			texture_red.wrapT = THREE.RepeatWrapping;

			bodyMesh.traverse((node) => {
				if (node.isMesh) {
					console.log(node);
				    node.material.map = texture_black;
		        }
			});
			mesh.position.y = 2;


			plane.rotation.x = -Math.PI/2;
			plane.rotation.z = -Math.PI/4;
			plane.position.y = -26;

			scene.add(mesh);
			scene.add( plane );
			onWindowResize();

		},
		function ( xhr ) {
			if ( xhr.lengthComputable ) {
		    var percentComplete = xhr.loaded / xhr.total * 100;
		    console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
		  }
		},
		function ( error ) {
			console.log( 'An error happened' );
		}
	);


/// LIGHTING -----------------------------------------

	var width = 2500;
	var height = 2500;
	var intensity = 1;
	var rectLight1 = new THREE.RectAreaLight( 0xffffff, intensity,  width, height );
	var rectLight2 = new THREE.RectAreaLight( 0xffffff, intensity,  width, height );			
	rectLight1.position.set( 10000, 0, -10000 );
	rectLight1.lookAt( 0, 0, 0 );		
	// rectLight2.position.set( -10000, 100, -10000 );
	// rectLight2.lookAt( 0, 0, 0 );					
	scene.add( rectLight1 );
	// scene.add( rectLight2 );

	var light = new THREE.HemisphereLight( 0xcceeff, 0xcccccc, 10 );
	light.position.set(15, 0, 0);
	scene.add(light);

	var ambient = new THREE.AmbientLight( 0xffffff, 10 );
	scene.add(ambient);



	// var spotLight = new THREE.SpotLight( 0xffffff, 1000 ,1000,1.05,1,1);
	// spotLight.position.set( 1000, 0, 0 );

	// scene.add( spotLight );

	camera.position.set( 0, 0, 250 );
	controls.update();
}

function animate() {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
}

function onWindowResize(){

    camera.aspect = window.innerWidth * 0.99 / window.innerHeight * 0.99;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth * 0.99, window.innerHeight * 0.99 );
	selectedColor(currentColor);
	camera.position.set( 0, 0, 450 - window.innerWidth/1920 * 250 );
}

window.onorientationchange = function() {
	if(window.mobilecheck() == true) {
    	window.location.reload();
	}
};

// COLOR SELECTION BORDER CHANGE -----------------------------------------

function colorChange(elmt) {
	currentColor = elmt;
	var selected = String(elmt.id);
	var select = selected.substring(7);
	selectedColor(currentColor);

	bodyMesh.traverse((node) => {
		if (node.isMesh) {
		    node.material.map = eval('texture_' + select);
        }
	});
}

function selectedColor(elmt) {
	var color_selected = document.getElementById("color_selected");
	color_selected.style.left = String(elmt.getBoundingClientRect().x - 5) + "px";
	color_selected.style.top = String(elmt.getBoundingClientRect().y - 5) + "px";				
}		