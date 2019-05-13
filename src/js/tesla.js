const THREE = (window.THREE = require("three"));

require("three/examples/js/loaders/GLTFLoader");
require("three/examples/js/controls/OrbitControls");
import "./MobileCheck";

function loadModel() {
  var mesh;
  var bodyMesh;
  var currentColor;
  var coeff;
  var renderer;
  var textureCube;
  var idleAnimation;
  var animationID;
  var timerId;

  var texture_red, texture_blue, texture_grey, texture_black, texture_white;

  var colorSelections = document.querySelectorAll(".js-color-selection__item");
  var canvasParent = document.querySelector(".canvas-parent");

  var mobileLandscape = window.matchMedia(
    "(orientation: landscape) and (max-width: 767px), (device-width: 812px) and (device-height: 375px) and (orientation: landscape),(device-width : 896px) and (device-height : 414px) and and (orientation: landscape)"
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight);
  console.log(
    canvasParent,
    canvasParent.devicePixelRatio,
    canvasParent.clientWidth
  );
  renderer.gammaOutput = true;
  renderer.gammaFactor = 1;
  renderer.physicallyCorrectLights = true;
  renderer.domElement.style.overflow = "hidden";
  canvasParent.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog( 0xcccccc, 200, 1000);
  var camera = new THREE.PerspectiveCamera(
    45,
    canvasParent.clientWidth / canvasParent.clientHeight,
    0.1,
    10000
  );
  var controls = new THREE.OrbitControls(camera);
  controls.maxPolarAngle = Math.PI / 2;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = 0.5;

  init();
  render();

  window.addEventListener("resize", onWindowResize, false);

  controls.addEventListener("change", () => {
    restartTimer();
    render();
  });

  function init() {
    /// LOADING MANAGER -----------------------------------------

    var manager = new THREE.LoadingManager();
    manager.onProgress = function(item, loaded, total) {
      // console.log(
      //   "Loading file: " +
      //     item +
      //     ".\nLoaded " +
      //     loaded +
      //     " of " +
      //     total +
      //     " files."
      // );
    };
    manager.onLoad = function() {
      setTimeout(allLoaded, 500);
    };
    manager.onError = function() {};

    function allLoaded() {
      document.querySelector(".fade-in").style.opacity = 0;
      console.log("OK");
    }

    /// ENVIRONMENT MAP -----------------------------------------

    var r = "../assets/env/";
    var urls = [
      r + "px.jpg",
      r + "nx.jpg",
      r + "py.jpg",
      r + "ny.jpg",
      r + "pz.jpg",
      r + "nz.jpg"
    ];
    textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBFormat;
    textureCube.mapping = THREE.CubeReflectionMapping;
    var textureLoader = new THREE.TextureLoader();

    /// CAR SHADOWS -----------------------------------------

    var planeTexture = textureLoader.load("../assets/plane/plane.jpeg");
    var geometry = new THREE.PlaneGeometry(390, 390, 0);
    var material = new THREE.MeshBasicMaterial({
      map: planeTexture,
      side: THREE.DoubleSide
    });
    var plane = new THREE.Mesh(geometry, material);

    /// CAR GLB/GLTF MESH -----------------------------------------

    var loader = new THREE.GLTFLoader(manager);
    loader.load(
      "../assets/Tesla_Model_3_DELIVERY.gltf",
      function(gltf) {
        console.log(gltf);
        console.log(gltf.scene.children[0]);
        mesh = gltf.scene.children[0];
        bodyMesh = gltf.scene.children[0].children[1].children[0];
        mesh.rotation.x = 0;
        mesh.rotation.y = -Math.PI / 4;

        mesh.traverse(node => {
          if (node.isMesh) {
            node.material.envMap = textureCube;
            node.material.envMapIntensity = 2;
          }
        });

        texture_black = textureLoader.load(
          "../assets/CAR_FRAME_baseColor_black.png"
        );
        texture_black.flipY = false;
        texture_black.wrapS = THREE.RepeatWrapping;
        texture_black.wrapT = THREE.RepeatWrapping;

        texture_grey = textureLoader.load(
          "../assets/CAR_FRAME_baseColor_grey.png"
        );
        texture_grey.flipY = false;
        texture_grey.wrapS = THREE.RepeatWrapping;
        texture_grey.wrapT = THREE.RepeatWrapping;

        texture_blue = textureLoader.load(
          "../assets/CAR_FRAME_baseColor_blue.png"
        );
        texture_blue.flipY = false;
        texture_blue.wrapS = THREE.RepeatWrapping;
        texture_blue.wrapT = THREE.RepeatWrapping;

        texture_white = textureLoader.load(
          "../assets/CAR_FRAME_baseColor_white.png"
        );
        texture_white.flipY = false;
        texture_white.wrapS = THREE.RepeatWrapping;
        texture_white.wrapT = THREE.RepeatWrapping;

        texture_red = textureLoader.load(
          "../assets/CAR_FRAME_baseColor_red.png"
        );
        texture_red.flipY = false;
        texture_red.wrapS = THREE.RepeatWrapping;
        texture_red.wrapT = THREE.RepeatWrapping;

        bodyMesh.traverse(node => {
          if (node.isMesh) {
            console.log(node);
            node.material.map = texture_red;
          }
        });
        mesh.position.y = 2;

        plane.rotation.x = -Math.PI / 2;
        plane.rotation.z = -Math.PI / 4;
        plane.position.y = -26;

        scene.add(mesh);
        scene.add(plane);
        onWindowResize();

        idleAnimation = function() {
          animationID = requestAnimationFrame(function animation(time) {
            scene.rotation.y += Math.PI / 7000;

            render();

            animationID = requestAnimationFrame(animation);
          });
        };

        idleAnimation();
      },
      function(xhr) {
        if (xhr.lengthComputable) {
          var percentComplete = (xhr.loaded / xhr.total) * 100;
          console.log(Math.round(percentComplete, 2) + "% downloaded");
        }
      },
      function(error) {
        console.log("An error happened");
      }
    );

    /// LIGHTING -----------------------------------------

    var width = 2500;
    var height = 2500;
    var intensity = 1;
    var rectLight1 = new THREE.RectAreaLight(
      0xffffff,
      intensity,
      width,
      height
    );
    var rectLight2 = new THREE.RectAreaLight(
      0xffffff,
      intensity,
      width,
      height
    );
    rectLight1.position.set(10000, 0, -10000);
    rectLight1.lookAt(0, 0, 0);
    // rectLight2.position.set( -10000, 100, -10000 );
    // rectLight2.lookAt( 0, 0, 0 );
    scene.add(rectLight1);
    // scene.add( rectLight2 );

    var light = new THREE.HemisphereLight(0xcceeff, 0xcccccc, 10);
    light.position.set(15, 0, 0);
    scene.add(light);

    var ambient = new THREE.AmbientLight(0xffffff, 10);
    scene.add(ambient);

    // var spotLight = new THREE.SpotLight( 0xffffff, 1000 ,1000,1.05,1,1);
    // spotLight.position.set( 1000, 0, 0 );

    // scene.add( spotLight );

    camera.position.set(0, 0, 250);
    controls.update();
  }

  function render() {
    // controls.update();
    renderer.render(scene, camera);
  }

  // function animate() {
  //   requestAnimationFrame(animate);
  //   controls.update();
  //   renderer.render(scene, camera);
  // }

  function onWindowResize() {
    camera.aspect = canvasParent.clientWidth / canvasParent.clientHeight;
    renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight);

    // CHANGE CAMERA POSITION TO CHANGE VISIBLE MODEL SIZE
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);

    if (window.innerWidth < 768 && !mobileLandscape.matches) {
      coeff = 1.6;
    } else if (mobileLandscape.matches && window.innerWidth > 768) {
      coeff = 0.7;
    } else if (mobileLandscape.matches || window.innerWidth < 1025) {
      coeff = 1;
    } else {
      coeff = 0.7;
    }
    console.log(coeff);
    let cameraZ = maxDim / coeff / Math.tan((fov * camera.aspect) / 2);

    camera.position.z = cameraZ;

    camera.updateProjectionMatrix();
  }

  window.onorientationchange = function() {
    if (window.mobilecheck() == true) {
      window.location.reload();
    }
  };

  // COLOR SELECTION BORDER CHANGE -----------------------------------------

  colorSelections.forEach(el => el.addEventListener("click", colorChange));

  function colorChange(event) {
    currentColor = event.currentTarget;
    var select = currentColor.dataset.color;
    selectedColor(currentColor);

    bodyMesh.traverse(node => {
      if (node.isMesh) {
        node.material.map = eval("texture_" + select);
      }
    });
  }

  function selectedColor(elmt) {
    colorSelections.forEach(el =>
      el.classList.remove("color-selection__item--selected")
    );
    elmt.classList.add("color-selection__item--selected");
  }

  // RESTART TIMER FUNCTION
  function restartTimer() {
    cancelAnimationFrame(animationID);
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      idleAnimation();
    }, 3000);
  }
}

export default loadModel;
