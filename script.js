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

// For better visibility, the semi-major axes of the planets are divided by 4 and their radii multiplied by 4. To compensate for this, the semi-major axes of all moons are multiplied by 4 as well as their radii.
// For the outer gas planets, their radii stays the same but their semi-major axes are also divided by 4. The outer moons have their radii multiplied by 4 but their semi-major axes stay the same.

const sun = {
    name: "The Sun",
    radius: 695700/5,
    tilt: 7.25
}

const mercury = {
    name: "Mercury",
    semi_major: 57.909/8,
    eccentric: 0.205630,
    inclination: 7.004,
    radius: 2440.5*8,
    tilt: 0.034,
    satellites: []
}

const venus = {
    name: "Venus",
    semi_major: 108.210/8,
    eccentric: 0.0068,
    inclination: 3.395,
    radius: 6051.8*8,
    tilt: 177.36,
    satellites: []
}

const earth = {
    name: "Earth",
    semi_major: 149.598/8,
    eccentric: 0.0167,
    inclination: 0,
    radius: 6378.137*8,
    tilt: 23.44,
    satellites: [{
        name: "The Moon",
        semi_major: 0.3844*6,
        eccentric: 0.0549,
        inclination: 50.145,
        radius: 1738.1*8,
        tilt: 6.68,
    }]
}

const mars = {
    name: "Mars",
    semi_major: 227.956/8,
    eccentric: 0.0935,
    inclination: 1.848,
    radius: 3396.2*8,
    tilt: 25.19,
    satellites: [
        {
        name: "Phobos",
        semi_major: 9376*8,
        eccentric: 0.0151,
        inclination: 1.093,
        radius: 11.2667*8,
        tilt: 0,
        },
        {
        name: "Deimos",
        semi_major: 23463.2*8,
        eccentric: 0.00033,
        inclination: 0.93,
        radius: 6.29*8,
        tilt: 0,
        }
    ]
}

const jupiter = {
    name: "Jupiter",
    semi_major: 778.479/8,
    eccentric: 0.0487,
    inclination: 3.13,
    radius: 69173*4,
    tilt: 3.13,
    satellites: [
        {
        name: "Io",
        semi_major: 421800*4,
        eccentric: 0.0041,
        inclination: 2.213,
        radius: 1821.6*8,
        tilt: 0,
        }
    ]
}

const saturn = {
    name: "Saturn",
    semi_major: 1432.041/8,
    eccentric: 0.0520,
    inclination: 2.486,
    radius: 57316*4,
    tilt: 26.73,
    satellites: []
}

// ===================== FUNCTIONS =================

function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function generateOrbit(body, centerX, centerY, count) {
    // a is the semi-major axis
    // e is the eccentricity
    let a = body.semi_major;
    let e = body.eccentric;
    let b = a*(Math.sqrt(1-(Math.pow(e,2))));

    let path = new THREE.EllipseCurve(
        centerX, centerY,
        a*100, b*100,
        0, 2*Math.PI,
        true,
        0
    );
    let ellipse = path.getPoints(count);
    let pathArray = [];
    for(let i = 0; i < count; i++) {
        let pos = new THREE.Vector3(ellipse[i].x,0,ellipse[i].y);

        pathArray.push(pos);
    }

    const orbitMesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints( pathArray ), new THREE.LineBasicMaterial({color:"#fff",linewidth:10}) );
    scene.add(orbitMesh);

    return [pathArray,orbitMesh];
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

cam.position.setZ(900);
cam.position.setY(500);

const gridHelper = new THREE.GridHelper(100,10);
scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(50);
scene.add( axesHelper );

const skyboxMat = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("textures/stars.jpg")});
skyboxMat.side = THREE.BackSide;
scene.add(new THREE.Mesh(new THREE.BoxGeometry(100000,100000,100000), skyboxMat));

// BODY GENERATION

const sunObj = addBody("textures/sun.jpg", sun);
sunObj.position.setX(0);
const sunTextureMap = new THREE.TextureLoader().load("textures/sun.jpg");
sunTextureMap.magFilter = THREE.NearestFilter;
sunTextureMap.generateMipmaps = false;
sunTextureMap.minFilter = THREE.LinearFilter;
sunObj.material = new THREE.MeshBasicMaterial({map: sunTextureMap});
const sunLight = new THREE.PointLight("#ffd782",1.5, 25000, 0.35);
sunLight.position.copy(sunObj.position);
scene.add(sunLight);

const mercuryObj = addBody("textures/mercury.jpg", mercury);
const mercuryOrbit = generateOrbit(mercury,sunObj.position.x,sunObj.position.z,134.766507574*mercury.semi_major)[0];
mercuryObj.position.copy(mercuryOrbit[0]);
let mercuryOrbitIndex = 0;

const venusObj = addBody("textures/venus.jpg", venus);
venusObj.position.setX(-300);
const venusOrbit = generateOrbit(venus,sunObj.position.x,sunObj.position.z,134.766507574*venus.semi_major)[0];
venusObj.position.copy(venusOrbit[0]);
let venusOrbitIndex = 0;

const earthObj = addBody("textures/earth.png", earth);
const earthOrbit = generateOrbit(earth,sunObj.position.x,sunObj.position.z,134.766507574*earth.semi_major)[0];
earthObj.position.copy(earthOrbit[0]);
let earthOrbitIndex = 0;

const moonObj = addBody("textures/moon.jpg", earth.satellites[0]);
let moonOrbit = generateOrbit(earth.satellites[0],earthObj.position.x,earthObj.position.y,500);
moonObj.position.copy(moonOrbit[0][0]);
let moonOrbitIndex = 0;

const marsObj = addBody("textures/mars.jpg", mars);
const marsOrbit = generateOrbit(mars,sunObj.position.x,sunObj.position.z,134.766507574*mars.semi_major)[0];
marsObj.position.copy(marsOrbit[0]);
let marsOrbitIndex = 0;

const jupiterObj = addBody("textures/jupiter.jpg", jupiter);
const jupiterOrbit = generateOrbit(jupiter,sunObj.position.x,sunObj.position.z,134.766507574*jupiter.semi_major)[0];
jupiterObj.position.copy(jupiterOrbit[0]);

const ioObj = addBody("textures/io.jpg", jupiter.satellites[0]);
const ioOrbit = generateOrbit(jupiter.satellites[0],jupiterObj.position.x,jupiterObj.position.z,10000);
ioObj.position.copy(ioOrbit[0][0]);

const saturnObj = addBody("textures/saturn.jpg", saturn);
const saturrOrbit = generateOrbit(saturn,sunObj.position.x,sunObj.position.z,134.766507574*saturn.semi_major)[0];
saturnObj.position.copy(saturrOrbit[0]);

const light = new THREE.AmbientLight("#fff",0.2);
scene.add(light);

function animate() {
    if(mercuryOrbitIndex >= 134.766507574*mercury.semi_major){
        mercuryOrbitIndex = 0;
    }
    if(venusOrbitIndex >= 134.766507574*venus.semi_major){
        venusOrbitIndex = 0;
    }
    if(earthOrbitIndex >= 134.766507574*earth.semi_major){
        earthOrbitIndex = 0;
    }
    if(moonOrbitIndex >= 500){
        moonOrbitIndex = 0;
    }
    if(marsOrbitIndex >= 134.766507574*mars.semi_major){
        marsOrbitIndex = 0;
    }

	requestAnimationFrame( animate );
    
    mercuryObj.rotateOnAxis(new THREE.Vector3(0,1,0),0.005);
    mercuryObj.position.copy(mercuryOrbit[mercuryOrbitIndex]);
    
    venusObj.rotateOnAxis(new THREE.Vector3(0,1,0),0.005);
    venusObj.position.copy(venusOrbit[venusOrbitIndex]);
    
    earthObj.rotateOnAxis(new THREE.Vector3(0,1,0),0.005);
    earthObj.position.copy(earthOrbit[earthOrbitIndex]);
    
    scene.remove(moonOrbit[1]);
    moonOrbit = generateOrbit(earth.satellites[0],earthObj.position.x,earthObj.position.z,500);
    moonObj.lookAt(earthObj.position);
    moonObj.rotateY(225);
    moonObj.position.copy(moonOrbit[0][moonOrbitIndex]);
    
    marsObj.rotateOnAxis(new THREE.Vector3(0,1,0),0.005);
    marsObj.position.copy(marsOrbit[marsOrbitIndex]);

    mercuryOrbitIndex += 1;
    venusOrbitIndex += 1;
    moonOrbitIndex += 1;
    earthOrbitIndex += 1;
    marsOrbitIndex += 1;

    /*if(cam.position.distanceTo(controlTarget) > 100){
        cam.position.lerp(controlTarget, 0.01);
    }*/

    interact.update();
    controls.update();
    controls.target.lerp(controlTarget, 0.1);
	renderer.render( scene, cam );
}
animate();