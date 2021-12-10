import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import {PointerLockControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/PointerLockControls.js';
import { FontLoader } from './jsm/loaders/FontLoader.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';
let camera, scene, renderer, controls;

const objects = [];

let raycaster;
let finish=0;

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

let Score = 100;
let currentScore = 0;
let elementScore = document.getElementById("score");
let level1clear = 0;
let level2clear = 0;
init();
animate();

var jumping_sound = document.getElementById("myAudio"); 
jumping_sound.volume = 0.1;

function timeToString(time) {
    let diffInHrs = time / 3600000;
    let hh = Math.floor(diffInHrs);
  
    let diffInMin = (diffInHrs - hh) * 60;
    let mm = Math.floor(diffInMin);
  
    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);
  
    let diffInMs = (diffInSec - ss) * 100;
    let ms = Math.floor(diffInMs);
  
    let formattedMM = mm.toString().padStart(2, "0");
    let formattedSS = ss.toString().padStart(2, "0");
    let formattedMS = ms.toString().padStart(2, "0");
  
    return `${formattedMM}:${formattedSS}:${formattedMS}`;
  }
  
  // Declare variables to use in our functions below
  
  let startTime;
  let elapsedTime = 0;
  let timerInterval;
  
  // Create function to modify innerHTML
  
  function print(txt) {
    document.getElementById("display").innerHTML = txt;
  }
  
  // Create "start", "pause" and "reset" functions
  
  function start() {
    if(finish == 0){
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(function printTime() {
        elapsedTime = Date.now() - startTime;
        print(timeToString(elapsedTime));
        }, 10);
    }
  }
  
  function pause() {
    clearInterval(timerInterval);
  }
  
function init() {
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.y = 20;

    scene = new THREE.Scene();
    const loaderBackground = new THREE.TextureLoader();
    const textureBackground = loaderBackground.load('texture/Skydome2.jpg', () => {
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
        start();
    } );

    controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    } );

    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
        pause();
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
                jumping_sound.pause();
                jumping_sound.currentTime = 0;
                jumping_sound.play();
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
            case 'KeyR':
                camera.position.set(0,20,-921);
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
    let floorGeometry = new THREE.PlaneGeometry( 900, 4200 );
    floorGeometry.rotateX( - Math.PI / 2 );

    let position = floorGeometry.attributes.position;

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
    createText();
    trees();
    
    //trees2();
    // trees3();
    //
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    //
    window.addEventListener( 'resize', onWindowResize );

}
//tree banyak
function trees() {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/trees_set/scene.gltf', (gltf) => {
    const treesGLTF = gltf.scene;
    treesGLTF.scale.set(30,30,30)
    treesGLTF.position.z=-390;
    treesGLTF.position.x=40;
    scene.add(treesGLTF);
    })}

// function trees2() {
//     const gltfLoader = new GLTFLoader();
//     gltfLoader.load('/stage2tree/scene.gltf', (gltf) => {
//     const treesGLTF2 = gltf.scene;
//     treesGLTF2.scale.set(5,5,5)
//     treesGLTF2.position.z=-1247;
//     treesGLTF2.position.x=0;
//     treesGLTF2.rotation.y=1.5;
//     scene.add(treesGLTF2);
//     })}

//1 tree aja
    // function trees() {
    //     const gltfLoader = new GLTFLoader();
    //     gltfLoader.load('/oak_tree/scene.gltf', (gltf) => {
    //     const treesGLTF = gltf.scene;
    //     treesGLTF.scale.set(15,15,15)
    //     treesGLTF.position.z=-400;
    //     treesGLTF.position.x=-300;
    //     scene.add(treesGLTF);
    //     })}
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

        const matLite2 = new THREE.MeshBasicMaterial( {
            color: 0x4ac300,
 
            side: THREE.DoubleSide
        } );

        
        //stage1
        let text_stage1=["A", "D", "U", "J"];
        let shape_stage1=[4];
        let geometry_stage1=[4];
        let mesh_stage1=[4];

        let shapes_podium = font.generateShapes( "Apakah Huruf ke-4 dalam Abjad?", 5 );
        let geometry_podium = new THREE.ShapeGeometry( shapes_podium );
        let podiumText = new THREE.Mesh( geometry_podium, matLite2 );
        createPositionText(podiumText,20, 200, -750);
        
        for (let i = 0; i < 4; i++) {
            shape_stage1[i]=font.generateShapes( text_stage1[i], 5 );
            geometry_stage1[i]=new THREE.ShapeGeometry( shape_stage1[i] );
            mesh_stage1[i] = new THREE.Mesh( geometry_stage1[i], matLite2 );
            createPositionText(mesh_stage1[i],0+45*i, 235, -900);
        }
        //stage2
        
        let text_stage2=["Matahari", "Bulan", "Langit", "Laba"];
        let shape_stage2=[4];
        let geometry_stage2=[4];
        let mesh_stage2=[4];

        let shapes_podium2 = font.generateShapes( "Jika diucapkan sekali jauh, diucapkan dua kali dekat. Apakah itu?", 5 );
        let geometry_podium2 = new THREE.ShapeGeometry( shapes_podium2 );
        let podiumText2 = new THREE.Mesh( geometry_podium2, matLite2 );
        createPositionText(podiumText2,10, 200, -1760);
        
        for (let i = 0; i < 4; i++) {
            shape_stage2[i]=font.generateShapes( text_stage2[i], 5 );
            geometry_stage2[i]=new THREE.ShapeGeometry( shape_stage2[i] );
            mesh_stage2[i] = new THREE.Mesh( geometry_stage2[i], matLite2 );
            createPositionText(mesh_stage2[i],(0+45*i)-5, 235, -1910);
        }
        
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
    let texture = new THREE.MeshLambertMaterial({map: loader.load('texture/wood1.jpg'), side: THREE.DoubleSide});

    let kubus = new THREE.Mesh(geometry, texture);createKubus(kubus,-30,15,-130);//1st cube
    let kubus2 = kubus.clone();createKubus(kubus2,30, 35, -155);
    //3kubus kiri
    let cubes_arr=[3];
    for (let i = 0; i < 3; i++) {
        cubes_arr[i]=kubus.clone();
        if(i==2) createKubus(cubes_arr[i],-60, 45, -240);
        else createKubus(cubes_arr[i],-60+i*30, 45, -210);
    }
    //3kubus kanan
    let cubes2_arr=[3];
    for (let i = 0; i < 3; i++) {
        cubes2_arr[i]=kubus.clone();
        if(i==2) createKubus(cubes2_arr[i],50, 55, -310);
        else createKubus(cubes2_arr[i],20+i*30, 55, -280);
    }
    //tower kubus kiri
    let kubus9 = kubus.clone();createKubus(kubus9,-30, 15, -340);
    let kubus10 = kubus.clone();createKubus(kubus10,-30, 45, -340);
    // 4kubus kiri
    let kubus11b = kubus.clone();createKubus(kubus11b,-40, 35, -400);
    let kubus11 = kubus.clone();createKubus(kubus11,-40, 65, -400);
    let kubus14b = kubus.clone();createKubus(kubus14b,-10, 35, -400);
    let kubus14 = kubus.clone();createKubus(kubus14,-10, 65, -400);
    let kubus12b= kubus.clone();createKubus(kubus12b,-40, 35, -430);
    let kubus12= kubus.clone();createKubus(kubus12,-40, 65, -430);
    let kubus13b= kubus.clone();createKubus(kubus13b,-10, 35, -430);
    let kubus13= kubus.clone();createKubus(kubus13,-10, 65, -430);
    // 3kubus kanan
    let kubus15= kubus.clone();createKubus(kubus15,50, 75, -460); 
    let kubus16= kubus.clone();createKubus(kubus16,80, 75, -460);
    let kubus16b= kubus.clone();createKubus(kubus16b,110, 75, -460);
    //6kubus kiri sebelum stage
    let bef_stage=[6];
    for (let i = 0; i < 6; i++) {
        bef_stage[i]=kubus.clone();
        if(i<3) createKubus(bef_stage[i],-i*30, 95, -500);
        else createKubus(bef_stage[i],-(i-3)*30, 95, -530);
    }
    
    //tangga stage 1
    let stairs_arr=[11];
    for (let i = 0; i < 10; i++) {
        stairs_arr[i]=kubus.clone();
        if(i==9) createKubus(stairs_arr[i],205, 95, -590);
        else createKubus(stairs_arr[i],-60+i*30, 95, -590);
    }
    let stairs_arr2=[11];
    for (let i = 0; i < 10; i++) {
        stairs_arr2[i]=kubus.clone();
        if(i==9) createKubus(stairs_arr2[i],205,125, -620);
        else createKubus(stairs_arr2[i],-60+i*30, 125, -620);
    }
    //tangga stage 2
    let stairs_arr3=[11];
    for (let i = 0; i < 10; i++) {
        stairs_arr3[i]=kubus.clone();
        if(i==9) createKubus(stairs_arr3[i],205, 95, -1600);
        else createKubus(stairs_arr3[i],-60+i*30, 95, -1600);
    }
    let stairs_arr4=[11];
    for (let i = 0; i < 10; i++) {
        stairs_arr4[i]=kubus.clone();
        if(i==9) createKubus(stairs_arr4[i],205,125, -1630);
        else createKubus(stairs_arr4[i],-60+i*30, 125, -1630);
    }
    
    //pillar 
    let geometry_pillar = new THREE.CylinderGeometry( 15, 15, 240, 30 );
    let texture_pillar = new THREE.MeshLambertMaterial({map: loader.load('texture/pillar.jpg'), side: THREE.DoubleSide});
    let pillar = new THREE.Mesh(geometry_pillar, texture_pillar)
    // let pillar = new THREE.Mesh(geometry, texture_pillar);createKubus(pillar,210, 5, -645);//1st pillar
    //pillar kanan
    let pillarr = pillar.clone();
    pillarr.position.set(230, 120, -645);
    scene.add(pillarr);
    //pillar kiri
    let pillarl = pillar.clone();
    pillarl.position.set(-90, 120, -645);
    scene.add(pillarl);
    //pillar stage 2
    let pillarr2 = pillar.clone();
    pillarr2.position.set(230, 120, -1655);
    scene.add(pillarr2);
    //pillar kiri
    let pillarl2 = pillar.clone();
    pillarl2.position.set(-90, 120, -1655);
    scene.add(pillarl2);
    //stage
    let geo = new THREE.BoxGeometry(310,170,270);
    // let texture = new THREE.MeshLambertMaterial({color:ssrgb(0,0,250)'});
    let wood = new THREE.MeshLambertMaterial({map: loader.load('texture/wood1.jpg'), side: THREE.DoubleSide});
    let cube = new THREE.Mesh(geo, wood);
    createKubus(cube,80, 85, -770);
    //stage2
    let cube2 = cube.clone();createKubus(cube2,80, 85, -1780);

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
    //stage 2
    let torus2 = torus.clone();
    torus2.position.set(70, 245, -1655);
    scene.add( torus2 );
    let pt3= pt.clone();createKubus(pt3,-90, 240, -1655);
    let pt4= pt.clone();createKubus(pt4,230, 240, -1655);

    //Drop
    let geometry_drop = new THREE.BoxGeometry(30, 200, 30);
    let texture_drop = new THREE.MeshLambertMaterial({map: loader.load('texture/wood4.jpg'), side: THREE.DoubleSide});
    let drop = new THREE.Mesh(geometry_drop, texture_drop);
    drop.position.set(0,130, -921);
    let drop2 = drop.clone();
    drop2.position.set(45,130,-921);
    let drop3 = drop.clone();
    drop3.position.set(90,130,-921);
    let drop4 = drop.clone();
    drop4.position.set(135,130,-921);
    scene.add(drop);
    scene.add(drop2);
    scene.add(drop3);
    scene.add(drop4);

    //Dinding Drop
    let geometry_dinding = new THREE.BoxGeometry(15, 260, 30);
    let texture_dinding = new THREE.MeshLambertMaterial({map: loader.load('texture/wood1.jpg'), side: THREE.DoubleSide});
    let dinding = new THREE.Mesh(geometry_dinding, texture_dinding);
    dinding.position.set(22.5,130,-921);
    let dinding2 = dinding.clone();
    dinding2.position.set(67.5,130,-921);
    let dinding3 = dinding.clone();
    dinding3.position.set(112.5,130,-921);
    scene.add(dinding);
    scene.add(dinding2);
    scene.add(dinding3);
    let dinding4 = kubus.clone();
    createKubus(dinding4,0,245,-921);
    let dinding5 = kubus.clone();
    createKubus(dinding5,45,245,-921);
    let dinding6 = kubus.clone();
    createKubus(dinding6,90,245,-921);
    let dinding7 = kubus.clone();
    createKubus(dinding7,135,245,-921);
    let geometry_tembok = new THREE.BoxGeometry(60, 260, 30);
    let texture_tembok = new THREE.MeshLambertMaterial({map: loader.load('texture/wood1.jpg'), side: THREE.DoubleSide});
    let tembok = new THREE.Mesh(geometry_tembok, texture_tembok);
    tembok.position.set(-45, 130, -921);
    scene.add(tembok);
    let geometry_tembok2 = new THREE.BoxGeometry(90, 260, 30);
    let texture_tembok2 = new THREE.MeshLambertMaterial({map: loader.load('texture/wood1.jpg'), side: THREE.DoubleSide});
    let tembok2 = new THREE.Mesh(geometry_tembok2, texture_tembok2);
    tembok2.position.set(195, 130, -921);
    scene.add(tembok2);

    //stage 2
    let st2_1= kubus.clone();createKubus(st2_1,50,15,-1050); 
    let st2_2= kubus.clone();createKubus(st2_2,110,35,-1080);//obstacle kanan
    let st2_6= kubus.clone();createKubus(st2_6,130,15,-1155);//obstacle kanan
    let st2_7= kubus.clone();createKubus(st2_7,130,45,-1155);
    let st2_8= kubus.clone();createKubus(st2_8,200,15,-1175);//obstacle kanan sebelum glass
    let st2_9= kubus.clone();createKubus(st2_9,200,45,-1175);
    //let st2_11= kubus.clone();createKubus(st2_11,200,60,-1175);
    let geometry_half = new THREE.BoxGeometry(30,15,30);
    let kubus_half = new THREE.Mesh(geometry_half, texture);createKubus(kubus_half,200,66,-1175);
    //path kaca 1
    let glass = new THREE.BoxGeometry(20, 20, 120);
    let glass_txt = new THREE.MeshLambertMaterial({map: loader.load('texture/glass.jpg'), side: THREE.DoubleSide});
    let path = new THREE.Mesh(glass, glass_txt);
    path.position.set(200,60,-1245);
    scene.add(path);
    objects.push(path);
    let path3 = path.clone();
    path3.position.set(100,60,-1385);
    scene.add(path3);
    objects.push(path3);
    //path kaca 2
    let glass2 = new THREE.BoxGeometry(120, 20, 20);
    let glass2_txt = new THREE.MeshLambertMaterial({map: loader.load('texture/glass.jpg'), side: THREE.DoubleSide});
    let path2 = new THREE.Mesh(glass2, glass2_txt);
    path2.position.set(150,60,-1315);
    scene.add(path2);
    objects.push(path2);

    let st2_10= kubus.clone();createKubus(st2_10,100,60,-1455); 
    let st2_12= kubus.clone();createKubus(st2_12,100,60,-1525); 
    let st2_13= kubus.clone();createKubus(st2_13,30,77,-1555);

    let drop21 = drop.clone();
    drop21.position.set(0,130, -1930);
    let drop22 = drop.clone();
    drop22.position.set(45,130,-1930);
    let drop23 = drop.clone();
    drop23.position.set(90,130,-1930);
    let drop24 = drop.clone();
    drop24.position.set(135,130,-1930);
    scene.add(drop21);
    scene.add(drop22);
    scene.add(drop23);
    scene.add(drop24);

    //Dinding Drop
    let dinding21 = dinding.clone()
    dinding21.position.set(22.5,130,-1930);
    let dinding22 = dinding.clone();
    dinding22.position.set(67.5,130,-1930);
    let dinding23 = dinding.clone();
    dinding23.position.set(112.5,130,-1930);
    scene.add(dinding21);
    scene.add(dinding22);
    scene.add(dinding23);
    let dinding24 = kubus.clone();
    createKubus(dinding24,0,245,-1930);
    let dinding25 = kubus.clone();
    createKubus(dinding25,45,245,-1930);
    let dinding26 = kubus.clone();
    createKubus(dinding26,90,245,-1930);
    let dinding27 = kubus.clone();
    createKubus(dinding27,135,245,-1930);
    let tembok21 = tembok.clone()
    tembok21.position.set(-45, 130, -1930);
    scene.add(tembok21);
    let tembok22 = tembok2.clone()
    tembok22.position.set(195, 130, -1930);
    scene.add(tembok22);

    //finish line
    let finish_geometry = new THREE.BoxGeometry(200,2,20);
    let finish_texture = new THREE.MeshLambertMaterial({map: loader.load('texture/finish_line.jpg'), side: THREE.DoubleSide});
    let finish_line = new THREE.Mesh(finish_geometry, finish_texture);createKubus(finish_line,70,0,-2000);
    

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

function inputCollisionSpesifik(controls, x,y,z, panjang, lebar, tinggi){
    panjang=panjang/2;
    lebar=lebar/2;
    tinggi=tinggi/2;
    if(controls.getObject().position.y < y+tinggi && controls.getObject().position.y > y-tinggi 
    && controls.getObject().position.x > x-panjang && controls.getObject().position.x < x+panjang 
    && controls.getObject().position.z > z-lebar && controls.getObject().position.z < z+lebar){
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
        //1st box
        if ( inputCollision(controls, -30,15,-130,30)==true) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        //2nd box
        if ( inputCollision(controls, 30,35,-155,30)==true ) {
                velocity.y = -velocity.y;
                velocity.x = -velocity.x * 3;
                velocity.z = -velocity.z * 3;
            
		}
        //3rd box

        if ( inputCollision(controls, -60,45,-240,30)==true || inputCollision(controls, -30,45,-210,30)==true || inputCollision(controls, -60,45,-210,30)==true) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
            velocity.y = -velocity.y;
		}

        if ( inputCollision(controls, 50,55,-310,30)==true || inputCollision(controls, 20,45,-280,30)==true || inputCollision(controls, 50,45,-280,30)==true) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
            velocity.y = -velocity.y;
		}
        //2 kubus
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
        if ( controls.getObject().position.y > 0 && controls.getObject().position.y < 170 && controls.getObject().position.x < 195 && controls.getObject().position.x > -75 && controls.getObject().position.z < -635 && controls.getObject().position.z > -905) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}

        //Dinding Drop
        if(inputCollisionSpesifik(controls, -45, 130, -920, 60, 30, 260)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if(inputCollisionSpesifik(controls, 195, 130, -920, 90, 30, 260)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if(inputCollisionSpesifik(controls, 22.5, 130, -920, 15, 30, 260)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if(inputCollisionSpesifik(controls, 67.5, 130, -920, 15, 30, 260)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if(inputCollisionSpesifik(controls, 112.5, 130, -920, 15, 30, 260)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if(controls.getObject().position.x > 240 || controls.getObject().position.x < -100){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }

        //sketsa 2
        //1st box
        if ( inputCollision(controls, 50,15,-1050,30)==true ) {
            velocity.y = -velocity.y;
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        //2nd box kanan

        if (inputCollision(controls, 110,35,-1080,30)==true ) {
            velocity.y = -velocity.y;
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        //3rd box kiri
        // if ( inputCollision(controls, 25,15,-1110,30)==true || inputCollision(controls, 25,45,-1110,30)==true ) {
        //     velocity.x = -velocity.x * 3;
        //     velocity.z = -velocity.z * 3;
		// }
        //4box kanan
        if ( inputCollision(controls, 130,15,-1155,30)==true || inputCollision(controls, 200,45,-1175,30)==true ) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        //box sebelum kaca 200,75,-1175
        if ( inputCollision(controls, 200,15,-1175,30)==true || inputCollision(controls, 130,45,-1155,30)==true || inputCollision(controls, 200,66,-1175,30)==true) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        //box kaca
        if(inputCollisionSpesifik(controls,200,60,-1245,20,120,20)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
            velocity.y = -velocity.y; 
        }

        if(inputCollisionSpesifik(controls,100,60,-1385,20,120,20)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
            velocity.y = -velocity.y; 
        }

        if(inputCollisionSpesifik(controls,150,60,-1315,120,20,20)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
            velocity.y = -velocity.y; 
        }
        //box sesudah kaca
        if ( inputCollision(controls, 100,60,-1455,30)==true) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if ( inputCollision(controls, 100,60,-1525,30)==true) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if ( inputCollision(controls, 30,77,-1555,30)==true) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }

        if ( controls.getObject().position.y > 110 && controls.getObject().position.y < 140 && controls.getObject().position.x < 195 && controls.getObject().position.x > -75 && controls.getObject().position.z < -1615 && controls.getObject().position.z > -1645) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        if ( controls.getObject().position.y > 0 && controls.getObject().position.y < 170 && controls.getObject().position.x < 195 && controls.getObject().position.x > -75 && controls.getObject().position.z < -1645 && controls.getObject().position.z > -1885) {
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
		}
        
        //Dinding Drop 2
        //Dinding Drop
        if(inputCollisionSpesifik(controls, -45, 130, -1930, 60, 30, 260)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if(inputCollisionSpesifik(controls, 195, 130, -1930, 90, 30, 260)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if(inputCollisionSpesifik(controls, 22.5, 130, -1930, 15, 30, 260)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if(inputCollisionSpesifik(controls, 67.5, 130, -1930, 15, 30, 260)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if(inputCollisionSpesifik(controls, 112.5, 130, -1930, 15, 30, 260)){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }
        if(controls.getObject().position.x > 240 || controls.getObject().position.x < -100){
            velocity.x = -velocity.x * 3;
            velocity.z = -velocity.z * 3;
        }

        //score
        if (level1clear==0 && inputCollision(controls, 0,130,-920,30)==true) {
            currentScore += Score;
            console.log(currentScore);
            elementScore.innerHTML = currentScore;
            level1clear=2;
		}
        
        if (level2clear==0 && inputCollision(controls, 90,130,-1930,30)==true) {
            currentScore += Score;
            console.log(currentScore);
            elementScore.innerHTML = currentScore;
            level2clear=2;
		}
    
        //finish line
        if (inputCollisionSpesifik(controls, 70,0,-2000,200,20,30)==true) {
            pause();
            finish = 1;
		}

        if(finish==1){

        }

    }
    prevTime = time;
    renderer.render( scene, camera );
}
