import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import {PointerLockControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/PointerLockControls.js';
import { FontLoader } from './jsm/loaders/FontLoader.js';
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

let Score = 10;
let currentScore = 0;
let elementScore = document.getElementById("score");
let level1clear = 0;

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

            case 'ShiftLeft':
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
            case 'ShiftLeft':
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
    let floorGeometry = new THREE.PlaneGeometry( 5000, 5000 );
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

    var groundTexture = new THREE.TextureLoader().load("texture/img.jpg");
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 30, 30 );
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
    createText()
    //
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    //
    window.addEventListener( 'resize', onWindowResize );

}
function createText() {
    const loader = new FontLoader();
    loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

        const color = 0x006699;

        const matDark = new THREE.LineBasicMaterial( {
            color: color,
            side: THREE.DoubleSide
        } );

        const matLite = new THREE.MeshBasicMaterial( {
            color: 0x000000,
 
            side: THREE.DoubleSide
        } );

        const message = "Level 1";

        const shapes = font.generateShapes( message, 70 );
        const geometry = new THREE.ShapeGeometry( shapes );
        geometry.computeBoundingBox();
        const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

        geometry.translate( xMid, 0, 0 );

        const holeShapes = [];

        for ( let i = 0; i < shapes.length; i ++ ) {

            const shape = shapes[ i ];

            if ( shape.holes && shape.holes.length > 0 ) {

                for ( let j = 0; j < shape.holes.length; j ++ ) {

                    const hole = shape.holes[ j ];
                    holeShapes.push( hole );

                }

            }

        }

        shapes.push.apply( shapes, holeShapes );

        const lineText = new THREE.Object3D();

        for ( let i = 0; i < shapes.length; i ++ ) {

            const shape = shapes[ i ];

            const points = shape.getPoints();
            const geometry = new THREE.BufferGeometry().setFromPoints( points );

            geometry.translate( xMid, 0, 0 );

            const lineMesh = new THREE.Line( geometry, matDark );
            lineText.add( lineMesh );

        }
        lineText.position.set(0, 100, -240)
        scene.add( lineText );
        let shapes_podium = font.generateShapes( "What is the meaning of life", 5 );
        let geometry_podium = new THREE.ShapeGeometry( shapes_podium );
        let podiumText = new THREE.Mesh( geometry_podium, matLite );
        createPositionText(podiumText,20, 200, -750);
        let shapes_pilihan_a = font.generateShapes( "Nothing", 2 );
        let geometry_pilihan_a = new THREE.ShapeGeometry( shapes_pilihan_a );
        let pilihan_a = new THREE.Mesh( geometry_pilihan_a, matLite );
        createPositionText(pilihan_a,0, 210, -875);
        let shapes_pilihan_b = font.generateShapes( "Happiness", 2 );
        let geometry_pilihan_b = new THREE.ShapeGeometry( shapes_pilihan_b );
        let pilihan_b = new THREE.Mesh( geometry_pilihan_b, matLite );
        createPositionText(pilihan_b,40, 210, -875);
        let shapes_pilihan_c = font.generateShapes( "Searching", 2 );
        let geometry_pilihan_c = new THREE.ShapeGeometry( shapes_pilihan_c );
        let pilihan_c = new THREE.Mesh( geometry_pilihan_c, matLite );
        createPositionText(pilihan_c,80, 210, -875);
        let shapes_pilihan_d = font.generateShapes( "Freedom", 2 );
        let geometry_pilihan_d = new THREE.ShapeGeometry( shapes_pilihan_d );
        let pilihan_d = new THREE.Mesh( geometry_pilihan_d, matLite );
        createPositionText(pilihan_d,120, 210, -875);
    } );

}

function createPositionText(text, x,y,z){
    text.position.set(x,y,z);
    scene.add( text );
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
    // let texture = new THREE.MeshLambertMaterial({color:'rgb(0,0,250)'});10.6
    let texture = new THREE.MeshLambertMaterial({map: loader.load('texture/wood1.jpg')});

    let kubus = new THREE.Mesh(geometry, texture);createKubus(kubus,-30,15,-130);//1st cube

    let kubus2 = kubus.clone();createKubus(kubus2,30, 35, -155);
    //3kubus kiri
    let kubus3 = kubus.clone();createKubus(kubus3,-30, 45, -210);
    let kubus4 = kubus.clone();createKubus(kubus4,0, 45, -210);
    let kubus5 = kubus.clone();createKubus(kubus5,-30, 45, -240);
    //3kubus kanan
    let kubus6 = kubus.clone();createKubus(kubus6,50, 55, -280);
    let kubus7 = kubus.clone();createKubus(kubus7,50, 55, -310);
    let kubus8 = kubus.clone();createKubus(kubus8,20, 55, -280);
    //tower kubus kiri
    let kubus9 = kubus.clone();createKubus(kubus9,-30, 15, -340);
    let kubus10 = kubus.clone();createKubus(kubus10,-30, 45, -340);
    // 4kubus kiri
    let kubus11 = kubus.clone();createKubus(kubus11,-40, 65, -400);
    let kubus11b = kubus.clone();createKubus(kubus11b,-40, 35, -400);
    let kubus14 = kubus.clone();createKubus(kubus14,-10, 65, -400);
    let kubus14b = kubus.clone();createKubus(kubus14b,-10, 35, -400);
    let kubus12= kubus.clone();createKubus(kubus12,-40, 65, -430);
    let kubus12b= kubus.clone();createKubus(kubus12b,-40, 35, -430);
    let kubus13= kubus.clone();createKubus(kubus13,-10, 65, -430);
    let kubus13b= kubus.clone();createKubus(kubus13b,-10, 35, -430);
    // 3kubus kanan
    let kubus15= kubus.clone();createKubus(kubus15,50, 75, -460); 
    let kubus16= kubus.clone();createKubus(kubus16,80, 75, -460);
    let kubus16b= kubus.clone();createKubus(kubus16b,110, 75, -460);
    //6kubus kiri sebelum stage
    let kubus17= kubus.clone();createKubus(kubus17,0, 95, -500);
    let kubus18= kubus.clone();createKubus(kubus18,-30, 95, -500);
    let kubus22= kubus.clone();createKubus(kubus22,-60, 95, -500);
    let kubus19= kubus.clone();createKubus(kubus19,0, 95, -530);
    let kubus20= kubus.clone();createKubus(kubus20,-30, 95, -530);
    let kubus21= kubus.clone();createKubus(kubus21,-60, 95, -530);
    //tangga stage 1
    let stairs_arr=[11];
    for (let i = 0; i < 10; i++) {
        stairs_arr[i]=kubus.clone();
        if(i==9) createKubus(stairs_arr[i],205, 95, -590);
        else createKubus(stairs_arr[i],-60+i*30, 95, -590);
    }
    //tangga stage 2
    let stairs_arr2=[11];
    for (let i = 0; i < 10; i++) {
        stairs_arr2[i]=kubus.clone();
        if(i==9) createKubus(stairs_arr2[i],205,125, -620);
        else createKubus(stairs_arr2[i],-60+i*30, 125, -620);
    }
     
    //pillar 
    let geometry_pillar = new THREE.CylinderGeometry( 15, 15, 30, 30 );
    let texture_pillar = new THREE.MeshLambertMaterial({map: loader.load('texture/pillar.jpg')});
    let pillar = new THREE.Mesh(geometry_pillar, texture_pillar)
    // let pillar = new THREE.Mesh(geometry, texture_pillar);createKubus(pillar,210, 5, -645);//1st pillar
    //pillar kanan
    let pillarArray2=[10];
    for (let i = 0; i < 8; i++) {
        pillarArray2[i]=pillar.clone();
        createKubus(pillarArray2[i],230, 5+i*30, -645);
      }
    let pillarArray=[10];
    //pillar kiri
    for (let i = 0; i < 8; i++) {
        pillarArray[i]=pillar.clone();
        createKubus(pillarArray[i],-90, 5+i*30, -645);
      }

    //stage
    let geo = new THREE.BoxGeometry(310,30,270);
    // let texture = new THREE.MeshLambertMaterial({color:ssrgb(0,0,250)'});
    let wood = new THREE.MeshLambertMaterial({map: loader.load('texture/wood1.jpg')});
    let cube = new THREE.Mesh(geo, wood);
    createKubus(cube,80, 155, -770);

    //atapnya pilar
    const roof_geo = new THREE.TorusGeometry( 158, 15, 15,56,3.2 );
    const roof_mat = new THREE.MeshLambertMaterial({map: loader.load('texture/pillar.jpg')});
    const torus = new THREE.Mesh( roof_geo , roof_mat );
    torus.position.set(70, 245, -645);
    scene.add( torus );
   
    let pt_geo = new THREE.BoxGeometry(40,10,30);
    let pt_mat = new THREE.MeshLambertMaterial({map: loader.load('texture/wood1.jpg')});
    let pt = new THREE.Mesh(pt_geo, pt_mat);createKubus(pt,-90, 240, -645);
    let pt2= pt.clone();createKubus(pt2,230, 240, -645);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function inputCollision(controls, x,y,z, panjang){
    panjang=panjang/2;
    if(controls.getObject().position.y < y+panjang && controls.getObject().position.y > y-panjang 
    && controls.getObject().position.x > x-panjang && controls.getObject().position.x < x+panjang 
    && controls.getObject().position.z > z-panjang && controls.getObject().position.z < z+panjang){
        return true;
    }
    else return false;
}

function animate() {
    requestAnimationFrame( animate );
    const time = performance.now();
    if ( controls.isLocked === true ) {
        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;
        
        const intersections = raycaster.intersectObjects( objects, true );
        const onObject = intersections.length > 0;
//        const frontObject = intersections.length.BoxGeometry > 0;
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
        /*
        if ( frontObject === true ) {
			velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
			canJump = true;
        }
        */

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
        controls.getObject().position.y += ( velocity.y * delta ); // new behavior
        if ( controls.getObject().position.y < 10 ) {
            velocity.y = 0;
            controls.getObject().position.y = 10;
            canJump = true;
		}
        
        if ( inputCollision(controls, -30,15,-130,30)==true) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        if ( controls.getObject().position.y < 60 && controls.getObject().position.y > 30 && controls.getObject().position.x >15 && controls.getObject().position.x < 45 && controls.getObject().position.z > -190 && controls.getObject().position.z < -160) {
                velocity.y = -velocity.y;
                velocity.x = -velocity.x * 3;
                velocity.z = -velocity.z * 3;
            
		}
        if ( controls.getObject().position.y < 50 && controls.getObject().position.x > 15 && controls.getObject().position.x < 45 && controls.getObject().position.z > -170 && controls.getObject().position.z < -140) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        //kubus9
        if ( controls.getObject().position.y < 60 && controls.getObject().position.x < -15 && controls.getObject().position.x > -45 && controls.getObject().position.z > -355 && controls.getObject().position.z < -325) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        //4 kubus
        if ( controls.getObject().position.y < 80 && controls.getObject().position.y > 20 && controls.getObject().position.x < 5 && controls.getObject().position.x > -55 && controls.getObject().position.z > -445 && controls.getObject().position.z < -385) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
            velocity.y = -velocity.y * 1.05;
		}
        //Tangga Stage
        if ( controls.getObject().position.y > 110 && controls.getObject().position.y < 140 && controls.getObject().position.x < 195 && controls.getObject().position.x > -75 && controls.getObject().position.z < -605 && controls.getObject().position.z > -635) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        if ( controls.getObject().position.y > 140 && controls.getObject().position.y < 170 && controls.getObject().position.x < 195 && controls.getObject().position.x > -75 && controls.getObject().position.z < -635 && controls.getObject().position.z > -905) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        
        //score
        if (level1clear==0 && controls.getObject().position.y < 200 && controls.getObject().position.y > 155 && controls.getObject().position.x < 195 && controls.getObject().position.x > -75 && controls.getObject().position.z > -905 && controls.getObject().position.z < -770) {
            currentScore += Score;
            console.log(currentScore);
            elementScore.innerHTML = currentScore;
            level1clear=2;
		}
    }

    prevTime = time;
    renderer.render( scene, camera );
}