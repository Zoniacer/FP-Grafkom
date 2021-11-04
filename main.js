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
function createPlatforms(){
    let geometry = new THREE.BoxGeometry(30,30,30);
    // var groundTexture = new THREE.TextureLoader().load("texture/Grass.jpg");
    let texture = new THREE.MeshLambertMaterial({color:'rgb(0,0,250)'});
    // let texture = new THREE.MeshLambertMaterial({groundTexture});
    let kubus = new THREE.Mesh(geometry, texture);
    kubus.position.set(-30,15,-30);
    scene.add(kubus);
    objects.push(kubus);
    let kubus2 = kubus.clone();
    kubus2.position.set(30, 35, -55);
    scene.add(kubus2);
    objects.push(kubus2);
    let kubus3 = kubus.clone();
    kubus3.position.set(-30, 45, -110);
    scene.add(kubus3);
    objects.push(kubus3);
    let kubus4 = kubus.clone();
    kubus4.position.set(0, 45, -110);
    scene.add(kubus4);
    objects.push(kubus4);
    let kubus5 = kubus.clone();
    kubus5.position.set(-30, 45, -140);
    scene.add(kubus5);
    objects.push(kubus5);
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