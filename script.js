import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { InteractionManager  } from 'three.interactive';
import { TextureLoader, Vector2 } from 'three';

// ===================== PLANETARY DATA ==================

// semi_major for planets is in kilometres * 10^6, for satellites its in kilometres
// inclination and tilt is in degrees
// inclination is in reference to the sun's equator
// radius is in kilometres

// forgot to add spin speed

const sun = {
    name: "The Sun",
    radius: 695700/5,
    tilt: 7.25
}

const mercury = {
    name: "Mercury",
    semi_major: 57.909,
    eccentric: 0.205630,
    inclination: 7.004,
    radius: 2440.5,
    tilt: 0.034,
    satellites: []
}

const venus = {
    name: "Venus",
    semi_major: 108.210,
    eccentric: 0.0068,
    inclination: 3.395,
    radius: 6051.8,
    tilt: 177.36,
    satellites: []
}

const earth = {
    name: "Earth",
    semi_major: 149.598,
    eccentric: 0.0167,
    inclination: 0,
    radius: 6378.137,
    tilt: 23.44,
    satellites: [{
        name: "The Moon",
        semi_major: 0.3844,
        eccentric: 0.0549,
        inclination: 5.145,
        radius: 1738.1,
        tilt: 6.68,
    }]
}

const mars = {
    name: "Mars",
    semi_major: 227.956,
    eccentric: 0.0935,
    inclination: 1.848,
    radius: 3396.2,
    tilt: 25.19,
    satellites: [
        {
        name: "Phobos",
        semi_major: 9376,
        eccentric: 0.0151,
        inclination: 1.093,
        radius: 11.2667,
        tilt: 0,
        },
        {
        name: "Deimos",
        semi_major: 23463.2,
        eccentric: 0.00033,
        inclination: 0.93,
        radius: 6.29,
        tilt: 0,
        }
    ]
}

// ===================== FUNCTIONS =================

function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function generateOrbit(a, e, i, centerX, centerY) {
    // a is the semi-major axis
    // e is the eccentricity
    // i is the inclination
    let b = a*(Math.sqrt(1-(Math.pow(e,2))));

    let path = new THREE.EllipseCurve(
        centerX*100, centerY*100,
        a*100, b*100,
        0, 2*Math.PI,
        false,
        0
    );

    let rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationAxis(new THREE.Vector3(1,0,0), degrees_to_radians(i+90));
    let ellipse = path.getPoints(1000);
    let pathArray = [];
    let theta = degrees_to_radians(i);
    for(let i = 0; i < 1000; i++) {
        pathArray.push(new THREE.Vector2( (ellipse[i].x * Math.cos(theta))-(ellipse[i].y * Math.sin(theta)), (ellipse[i].x * Math.sin(theta))+(ellipse[i].y * Math.cos(theta)) ));
    }

    return pathArray;
}

function addBody(texture, body) {
    const textureMap = new THREE.TextureLoader().load(texture);
    textureMap.magFilter = THREE.NearestFilter;
    textureMap.generateMipmaps = false;
    textureMap.minFilter = THREE.LinearFilter;
    const obj = new THREE.Mesh(new THREE.SphereGeometry(body.radius/500,64,32), new THREE.MeshStandardMaterial({ map: textureMap }));
    obj.rotation.z = degrees_to_radians(body.tilt);
    scene.add(obj);

    interact.add(obj);
    obj.addEventListener('click', function(){
        controlTarget = obj.position;
    });

    return obj;
}

// ======================= 3D LOGIC =======================

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 150000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("graphics")
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const interact = new InteractionManager(renderer, cam, renderer.domElement);

let controlTarget = new THREE.Vector3();
const controls = new OrbitControls(cam, renderer.domElement);

cam.position.setZ(90);

const gridHelper = new THREE.GridHelper(100,10);
scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(50);
scene.add( axesHelper );

const skyboxMat = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("textures/stars.jpg")});
skyboxMat.side = THREE.BackSide;
scene.add(new THREE.Mesh(new THREE.BoxGeometry(100000,100000,100000), skyboxMat));

const sunObj = addBody("textures/sun.jpg", sun);
sunObj.position.setX(-5000);
const sunTextureMap = new THREE.TextureLoader().load("textures/sun.jpg");
sunTextureMap.magFilter = THREE.NearestFilter;
sunTextureMap.generateMipmaps = false;
sunTextureMap.minFilter = THREE.LinearFilter;
sunObj.material = new THREE.MeshBasicMaterial({map: sunTextureMap});
const mercuryObj = addBody("textures/mercury.jpg", mercury);
mercuryObj.position.setX(-500);
const venusObj = addBody("textures/venus.jpg", venus);
venusObj.position.setX(-300);
const earthObj = addBody("textures/earth.png", earth);
earthObj.position.setX(0);
const moonObj = addBody("textures/moon.jpg", earth.satellites[0]);
moonObj.position.setZ(50);
const marsObj = addBody("textures/mars.jpg", mars);
marsObj.position.setX(250);

const light0 = new THREE.AmbientLight("#fff",0.3);
light0.position.set(-25,15,15);
scene.add(light0);

const sunLight = new THREE.PointLight("#ffd782",5, 10000);
sunLight.position.set(-5000,0,0);
scene.add(sunLight);

scene.add( new THREE.Mesh(new THREE.BufferGeometry().setFromPoints( generateOrbit(earth.satellites[0].semi_major,earth.satellites[0].eccentric,earth.satellites[0].inclination,0,0) ).rotateX(degrees_to_radians(earth.satellites[0].inclination-90)), new THREE.MeshBasicMaterial({color:"#fff"}) ));
const moonOrbit = generateOrbit(earth.satellites[0].semi_major,earth.satellites[0].eccentric,earth.satellites[0].inclination,0,0);

let moonOrbitIndex = 0;

function animate() {
    if(moonOrbitIndex > 999){
        moonOrbitIndex = 0;
    }

	requestAnimationFrame( animate );
    
    mercuryObj.rotateOnAxis(new THREE.Vector3(0,1,0),0.005);
    
    venusObj.rotateOnAxis(new THREE.Vector3(0,1,0),0.005);
    
    earthObj.rotateOnAxis(new THREE.Vector3(0,1,0),0.005);
    
    moonObj.lookAt(earthObj.position);
    moonObj.rotateY(225);
    moonObj.position.copy(new THREE.Vector3(moonOrbit[moonOrbitIndex].y,0,moonOrbit[moonOrbitIndex].x));
    console.log(moonObj.position);
    moonOrbitIndex += 1;
    
    marsObj.rotateOnAxis(new THREE.Vector3(0,1,0),0.005);

    interact.update();
    controls.update();
    controls.target.lerp(controlTarget, 0.1);
	renderer.render( scene, cam );
}
animate();