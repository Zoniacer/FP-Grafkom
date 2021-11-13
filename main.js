import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import {PointerLockControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let run = 1;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

init();
animate();



function init() {
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 40;

    scene = new THREE.Scene();
    const loaderBackground = new THREE.TextureLoader();
    const textureBackground = loaderBackground.load('texture/Skybox.jpg', () => {
        const rt = new THREE.WebGLCubeRenderTarget(textureBackground.image.height);
        rt.fromEquirectangularTexture(renderer, textureBackground);
        scene.background = rt.texture;
        })
    scene.fog = new THREE.Fog( 0xcaf0f8, 0, 750 );

    const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    controls = new PointerLockControls( camera, document.body );

    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );

    instructions.addEventListener( 'click', function () {
        controls.lock();
    } );

    controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    } );

    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
    } );

	scene.add( controls.getObject() );

    const onKeyDown = function ( event ) {
        switch ( event.code ) {
            case 'ArrowUp':
            case 'KeyW':
				moveForward = true;
				break;

			case 'ArrowLeft':
			case 'KeyA':
			    moveLeft = true;
			    break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = true;
				break;
            case 'ArrowRight':
			case 'KeyD':
			    moveRight = true;
				break;

            case 'Space':
				if ( canJump === true ) velocity.y += 350;
				canJump = false;
				break;

            case 'KeyR':
                run = 2;
                break;
		}
    };

	const onKeyUp = function ( event ) {
		switch ( event.code ) {
            case 'ArrowUp':
			case 'KeyW':
				moveForward = false;
				break;
            case 'ArrowLeft':
			case 'KeyA':
				moveLeft = false;
				break;
			case 'ArrowDown':
			case 'KeyS':
				moveBackward = false;
				break;
		    case 'ArrowRight':
			case 'KeyD':
				moveRight = false;
				break;            
            case 'KeyR':
                run = 1;
                break;
		}
    };
    const onMouseWheel = function ( event ) {
        var fovMAX = 100;
        var fovMIN = -500;
        camera.fov -= event.wheelDeltaY * 0.05;
        camera.fov = Math.max(Math.min(camera.fov, fovMAX), fovMIN);
        camera.updateProjectionMatrix();
    };
    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );
    document.addEventListener( 'mousewheel', onMouseWheel, false );
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    // floor

    let floorGeometry = new THREE.PlaneGeometry( 2000, 2000 );
    floorGeometry.rotateX( - Math.PI / 2 );

    // vertex displacement

    let position = floorGeometry.attributes.position;

    // let floorGeometry2 = new THREE.PlaneGeometry( 500, 500 );
    // floorGeometry2.rotateX( - Math.PI / 2 );

    // vertex displacement

    // let position2 = floorGeometry2.attributes.position;
    // position2.z = 2;
    // for ( let i = 0, l = position.count; i < l; i ++ ) {

    // 	vertex.fromBufferAttribute( position, i );

    // 	vertex.x += Math.random() * 20 - 10;
    // 	vertex.y += Math.random() * 2;
    // 	vertex.z += Math.random() * 20 - 10;

    // 	position.setXYZ( i, vertex.x, vertex.y, vertex.z );

    // }

    var groundTexture = new THREE.TextureLoader().load("texture/Grass.jpg");
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 200, 200 );
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    position = floorGeometry.attributes.position;
    const floorMaterial = new THREE.MeshToonMaterial( { color: "rgb(96,205,226)", map: groundTexture} );
    //const floorMaterial2 = new THREE.MeshLambertMaterial( { color: "rgb(208,198,168)"} );
				
    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    scene.add( floor );
    //const floor2 = new THREE.Mesh( floorGeometry2, floorMaterial2 );
    //scene.add( floor2 );
    // objects
    createPlatforms()

    //
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    //
    window.addEventListener( 'resize', onWindowResize );

}
function createText() {

    textGeo = new TextGeometry( "Halo", {

        font: font,

        size: size,
        height: height,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled

    } );

    textGeo.computeBoundingBox();

    const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

    textMesh1 = new THREE.Mesh( textGeo, materials );

    textMesh1.position.x = centerOffset;
    textMesh1.position.y = hover;
    textMesh1.position.z = 0;

    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;

    group.add( textMesh1 );

}

function createKubus(kubus, x,y,z){
    kubus.position.set(x, y, z);
    scene.add(kubus);
    objects.push(kubus);
}
function createPlatforms(){
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);
    
    let geometry = new THREE.BoxGeometry(30,30,30);
    // let texture = new THREE.MeshLambertMaterial({color:'rgb(0,0,250)'});
    let texture = new THREE.MeshLambertMaterial({map: loader.load('texture/wood1.jpg')});
    let kubus = new THREE.Mesh(geometry, texture);
    createKubus(kubus,-30,15,-30);
    let kubus2 = kubus.clone();
    createKubus(kubus2,30, 35, -55);
    let kubus3 = kubus.clone();
    createKubus(kubus3,-30, 45, -110);
    let kubus4 = kubus.clone();
    createKubus(kubus4,0, 45, -110);
    let kubus5 = kubus.clone();
    createKubus(kubus5,-30, 45, -140);
    let kubus6 = kubus.clone();
    createKubus(kubus6,50, 55, -180);
    let kubus7 = kubus.clone();
    createKubus(kubus7,50, 55, -210);
    let kubus8 = kubus.clone();
    createKubus(kubus8,20, 55, -180);
    let kubus9 = kubus.clone();createKubus(kubus9,-30, 15, -240);
    let kubus10 = kubus.clone();createKubus(kubus10,-30, 45, -240);
    let kubus11 = kubus.clone();createKubus(kubus11,-40, 65, -300);// 4kubus kiri
    let kubus11b = kubus.clone();createKubus(kubus11b,-40, 35, -300);// 4kubus kiri
    let kubus14 = kubus.clone();createKubus(kubus14,-10, 65, -300);
    let kubus14b = kubus.clone();createKubus(kubus14b,-10, 35, -300);
    let kubus12= kubus.clone();createKubus(kubus12,-40, 65, -330);
    let kubus12b= kubus.clone();createKubus(kubus12b,-40, 35, -330);
    let kubus13= kubus.clone();createKubus(kubus13,-10, 65, -330);
    let kubus13b= kubus.clone();createKubus(kubus13b,-10, 35, -330);
    let kubus15= kubus.clone();createKubus(kubus15,50, 75, -360); // 3kubus kanan
    let kubus16= kubus.clone();createKubus(kubus16,80, 75, -360);
    let kubus16b= kubus.clone();createKubus(kubus16b,110, 75, -360);
    let kubus17= kubus.clone();createKubus(kubus17,0, 95, -400);//6kubus kiri sebelum stage
    let kubus18= kubus.clone();createKubus(kubus18,-30, 95, -400);
    let kubus22= kubus.clone();createKubus(kubus22,-60, 95, -400);
    let kubus19= kubus.clone();createKubus(kubus19,0, 95, -430);
    let kubus20= kubus.clone();createKubus(kubus20,-30, 95, -430);
    let kubus21= kubus.clone();createKubus(kubus21,-60, 95, -430);



}



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    const time = performance.now();
    if ( controls.isLocked === true ) {
        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;
        
        const intersections = raycaster.intersectObjects( objects, true );
        const onObject = intersections.length > 0;
        const delta = ( time - prevTime ) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta * run;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta * run;
        if ( onObject === true ) {
			velocity.y = Math.max( 0, velocity.y );
			canJump = true;
        }

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
        controls.getObject().position.y += ( velocity.y * delta ); // new behavior
        if ( controls.getObject().position.y < 10 ) {
            velocity.y = 0;
            controls.getObject().position.y = 10;
            canJump = true;
		}
        if ( controls.getObject().position.y < 30 && controls.getObject().position.x < -15 && controls.getObject().position.x > -45 && controls.getObject().position.z > -45 && controls.getObject().position.z < -15) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        if ( controls.getObject().position.y < 60 && controls.getObject().position.y > 30 && controls.getObject().position.x >15 && controls.getObject().position.x < 45 && controls.getObject().position.z > -90 && controls.getObject().position.z < -60) {
            if(controls.getObject().position.y > 15) velocity.y = -velocity.y * -1;
            else{
                velocity.x = -velocity.x * 3;
                velocity.z = -velocity.z * 3;
            }
		}
    }

    prevTime = time;
    renderer.render( scene, camera );
}