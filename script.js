import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { InteractionManager  } from 'three.interactive';
import { GUI } from 'dat.gui';

// MODIFYABLE VARIABLES

const speedControl = {speedControl:1};
const spinControl = {spinControl:0.00000083927};
const showOrbits = {showOrbits:true};

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
    semi_major: 778.479/12,
    eccentric: 0.0487,
    inclination: 3.13,
    radius: 69173*4,
    tilt: 3.13,
    satellites: [
        {
        name: "Io",
        semi_major: 0.4217*16,
        eccentric: 0.0041,
        inclination: 2.213,
        radius: 1821.6*8,
        tilt: 0,
        }
    ]
}

const saturn = {
    name: "Saturn",
    semi_major: 1432.041/12,
    eccentric: 0.0520,
    inclination: 2.486,
    radius: 57316*4,
    tilt: 26.73,
    satellites: []
}

const uranus = {
    name: "Uranus",
    semi_major: 2867.043/16,
    eccentric: 0.0469,
    inclination: 0.77,
    radius: 25266*4,
    tilt: 97.77,
    satellites: []
}

const neptune = {
    name: "Neptune",
    semi_major: 4514.953/16,
    eccentric: 0.0097,
    inclination: 1.77,
    radius: 24552.5*4,
    tilt: 28.32,
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

    const orbitMesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints( pathArray ), new THREE.LineBasicMaterial({color:"#fff",linewidth:1}) );

    if(showOrbits.showOrbits){
        scene.add(orbitMesh);
    }

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
        controlTarget.target = obj.position;
    });

    return obj;
}

// ======================= 3D LOGIC =======================

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("graphics")
});
const cam = new THREE.PerspectiveCamera(75, renderer.domElement.clientWidth/renderer.domElement.clientHeight, 0.1, 550000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);

window.addEventListener('resize', function(){
    cam.aspect = renderer.domElement.clientWidth/renderer.domElement.clientHeight;
    cam.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
});

const interact = new InteractionManager(renderer, cam, renderer.domElement);

let controlTarget = {target: new THREE.Vector3()};
const controls = new OrbitControls(cam, renderer.domElement);

cam.position.setZ(900);
cam.position.setY(500);

const gridHelper = new THREE.GridHelper(100,10);
scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(50);
scene.add( axesHelper );

const skyboxMat = [
    new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("textures/stars.jpg")}),
    new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("textures/stars.jpg")}),
    new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("textures/stars2.jpg")}),
    new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("textures/stars2.jpg")}),
    new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("textures/stars.jpg")}),
    new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("textures/stars.jpg")})
];
for(let i = 0; i < skyboxMat.length; i++){
    skyboxMat[i].side = THREE.BackSide;
}
scene.add(new THREE.Mesh(new THREE.BoxGeometry(500000,500000/2,500000/2), skyboxMat));

// BODY GENERATION

const sunObj = addBody("textures/sun.jpg", sun);
sunObj.position.setX(0);
const sunTextureMap = new THREE.TextureLoader().load("textures/sun.jpg");
sunTextureMap.magFilter = THREE.NearestFilter;
sunTextureMap.generateMipmaps = false;
sunTextureMap.minFilter = THREE.LinearFilter;
sunObj.material = new THREE.MeshBasicMaterial({map: sunTextureMap});
const sunLight = new THREE.PointLight("#ffd782",1.5, 35000, 0.75);
sunLight.position.copy(sunObj.position);
scene.add(sunLight);
controlTarget.target = sunObj.position;

let orbitSpeed = 134.766507574;

const mercuryObj = addBody("textures/mercury.jpg", mercury);
const mercuryOrbit = generateOrbit(mercury,sunObj.position.x,sunObj.position.z,orbitSpeed*mercury.semi_major);
mercuryObj.position.copy(mercuryOrbit[0][0]);
let mercuryOrbitIndex = 0;

const venusObj = addBody("textures/venus.jpg", venus);
venusObj.position.setX(-300);
const venusOrbit = generateOrbit(venus,sunObj.position.x,sunObj.position.z,orbitSpeed*venus.semi_major);
venusObj.position.copy(venusOrbit[0][0]);
let venusOrbitIndex = 0;

const earthObj = addBody("textures/earth.png", earth);
const earthOrbit = generateOrbit(earth,sunObj.position.x,sunObj.position.z,orbitSpeed*earth.semi_major);
earthObj.position.copy(earthOrbit[0][0]);
let earthOrbitIndex = 0;

let moonOrbitSpeed = 500;
const moonObj = addBody("textures/moon.jpg", earth.satellites[0]);
let moonOrbit = generateOrbit(earth.satellites[0],earthObj.position.x,earthObj.position.z,moonOrbitSpeed);
moonObj.position.copy(moonOrbit[0][0]);
let moonOrbitIndex = 0;

const marsObj = addBody("textures/mars.jpg", mars);
const marsOrbit = generateOrbit(mars,sunObj.position.x,sunObj.position.z,orbitSpeed*mars.semi_major);
marsObj.position.copy(marsOrbit[0][0]);
let marsOrbitIndex = 0;

const jupiterObj = addBody("textures/jupiter.jpg", jupiter);
const jupiterOrbit = generateOrbit(jupiter,sunObj.position.x,sunObj.position.z,orbitSpeed*jupiter.semi_major);
jupiterObj.position.copy(jupiterOrbit[0][0]);
let jupiterOrbitIndex = 0;

let ioOrbitSpeed = 450;
const ioObj = addBody("textures/io.jpg", jupiter.satellites[0]);
let ioOrbit = generateOrbit(jupiter.satellites[0],jupiterObj.position.x,jupiterObj.position.z,ioOrbitSpeed);
ioObj.position.copy(ioOrbit[0][0]);
let ioOrbitIndex = 0;

const saturnObj = addBody("textures/saturn.jpg", saturn);
const saturnRings = new THREE.Mesh( new THREE.RingGeometry((66900*4)/500,(139826*4)/500,100,1,0,degrees_to_radians(360)), new THREE.MeshStandardMaterial({ color:"#fff", side: THREE.DoubleSide, map: new THREE.TextureLoader().load("textures/saturn ring.png"), transparent: true }) );
saturnRings.setRotationFromAxisAngle(new THREE.Vector3(1,0,0),degrees_to_radians(90));
saturnRings.rotation.y = degrees_to_radians(saturn.tilt);
saturnObj.attach(saturnRings);
const saturnOrbit = generateOrbit(saturn,sunObj.position.x,sunObj.position.z,orbitSpeed*saturn.semi_major);
saturnObj.position.copy(saturnOrbit[0][0]);
let saturnOrbitIndex = 0;

const uranusObj = addBody("textures/uranus.jpg", uranus);
const uranusRings = new THREE.Mesh( new THREE.RingGeometry((26840*4)/500,(51149*4)/500,100,1,0,degrees_to_radians(360)), new THREE.MeshStandardMaterial({ color:"#fff", side: THREE.DoubleSide, map: new THREE.TextureLoader().load("textures/uranus ring.png"), transparent: true }) );
uranusRings.setRotationFromAxisAngle(new THREE.Vector3(1,0,0),degrees_to_radians(90));
uranusRings.rotation.y = degrees_to_radians(uranus.tilt);
uranusObj.attach(uranusRings);
const uranusOrbit = generateOrbit(uranus,sunObj.position.x,sunObj.position.z,orbitSpeed*uranus.semi_major);
uranusObj.position.copy(uranusOrbit[0][0]);
let uranusOrbitIndex = 0;

const neptuneObj = addBody("textures/neptune.jpg", neptune);
const neptuneOrbit = generateOrbit(neptune,sunObj.position.x,sunObj.position.z,orbitSpeed*neptune.semi_major);
neptuneObj.position.copy(neptuneOrbit[0][0]);
let neptuneOrbitIndex = 0;

const light = new THREE.AmbientLight("#fff",0.2);
scene.add(light);

function animate() {
    if(showOrbits.showOrbits === false) {
        mercuryOrbit[1].visible = false;
        venusOrbit[1].visible = false;
        earthOrbit[1].visible = false;
        marsOrbit[1].visible = false;
        jupiterOrbit[1].visible = false;
        saturnOrbit[1].visible = false;
        uranusOrbit[1].visible = false;
        neptuneOrbit[1].visible = false;
    } else {
        mercuryOrbit[1].visible = true;
        venusOrbit[1].visible = true;
        earthOrbit[1].visible = true;
        marsOrbit[1].visible = true;
        jupiterOrbit[1].visible = true;
        saturnOrbit[1].visible = true;
        uranusOrbit[1].visible = true;
        neptuneOrbit[1].visible = true;
    }

    if(mercuryOrbitIndex >= orbitSpeed*mercury.semi_major){
        mercuryOrbitIndex = 0;
    }
    if(venusOrbitIndex >= orbitSpeed*venus.semi_major){
        venusOrbitIndex = 0;
    }
    if(earthOrbitIndex >= orbitSpeed*earth.semi_major){
        earthOrbitIndex = 0;
    }
    if(moonOrbitIndex >= moonOrbitSpeed){
        moonOrbitIndex = 0;
    }
    if(marsOrbitIndex >= orbitSpeed*mars.semi_major){
        marsOrbitIndex = 0;
    }
    if(jupiterOrbitIndex >= orbitSpeed*jupiter.semi_major){
        jupiterOrbitIndex = 0;
    }
    if(saturnOrbitIndex >= orbitSpeed*saturn.semi_major){
        saturnOrbitIndex = 0;
    }
    if(ioOrbitIndex >= ioOrbitSpeed){
        ioOrbitIndex = 0;
    }
    if(uranusOrbitIndex >= orbitSpeed*uranus.semi_major){
        uranusOrbitIndex = 0;
    }
    if(neptuneOrbitIndex >= orbitSpeed*neptune.semi_major){
        neptuneOrbitIndex = 0;
    }

	requestAnimationFrame( animate );
    
    mercuryObj.rotateOnAxis(new THREE.Vector3(0,1,0),(mercury.radius/8)*spinControl.spinControl);
    mercuryObj.position.copy(mercuryOrbit[0][mercuryOrbitIndex]);
    
    venusObj.rotateOnAxis(new THREE.Vector3(0,1,0),(venus.radius/8)*spinControl.spinControl);
    venusObj.position.copy(venusOrbit[0][venusOrbitIndex]);
    
    earthObj.rotateOnAxis(new THREE.Vector3(0,1,0),(earth.radius/8)*spinControl.spinControl);
    earthObj.position.copy(earthOrbit[0][earthOrbitIndex]);
    
    scene.remove(moonOrbit[1]);
    moonOrbit = generateOrbit(earth.satellites[0],earthObj.position.x,earthObj.position.z,moonOrbitSpeed);
    moonObj.lookAt(earthObj.position);
    moonObj.rotateY(225);
    moonObj.position.copy(moonOrbit[0][moonOrbitIndex]);
    
    marsObj.rotateOnAxis(new THREE.Vector3(0,1,0),(mars.radius/8)*spinControl.spinControl);
    marsObj.position.copy(marsOrbit[0][marsOrbitIndex]);

    jupiterObj.rotateOnAxis(new THREE.Vector3(0,1,0),(jupiter.radius/12)*spinControl.spinControl);
    jupiterObj.position.copy(jupiterOrbit[0][jupiterOrbitIndex]);

    scene.remove(ioOrbit[1]);
    ioOrbit = generateOrbit(jupiter.satellites[0],jupiterObj.position.x,jupiterObj.position.z,ioOrbitSpeed);
    ioObj.lookAt(jupiterObj.position);
    ioObj.position.copy(ioOrbit[0][ioOrbitIndex]);

    saturnObj.rotateOnAxis(new THREE.Vector3(0,1,0),(saturn.radius/12)*spinControl.spinControl);
    saturnObj.position.copy(saturnOrbit[0][saturnOrbitIndex]);

    uranusObj.rotateOnAxis(new THREE.Vector3(0,1,0),(uranus.radius/12)*spinControl.spinControl);
    uranusObj.position.copy(uranusOrbit[0][uranusOrbitIndex]);

    neptuneObj.rotateOnAxis(new THREE.Vector3(0,1,0),(neptune.radius/12)*spinControl.spinControl);
    neptuneObj.position.copy(neptuneOrbit[0][neptuneOrbitIndex]);

    mercuryOrbitIndex += speedControl.speedControl;
    venusOrbitIndex += speedControl.speedControl;
    moonOrbitIndex += speedControl.speedControl;
    earthOrbitIndex += speedControl.speedControl;
    marsOrbitIndex += speedControl.speedControl;
    jupiterOrbitIndex += speedControl.speedControl;
    ioOrbitIndex += speedControl.speedControl;
    saturnOrbitIndex += speedControl.speedControl;
    uranusOrbitIndex += speedControl.speedControl;
    neptuneOrbitIndex += speedControl.speedControl;

    interact.update();
    controls.update();
    controls.target.lerp(controlTarget.target, 0.1);
	renderer.render( scene, cam );
}
animate();

// GUI
const gui = new GUI();
gui.add(speedControl, 'speedControl', 0, 50, 1);
gui.add(spinControl, 'spinControl', 0, 0.00003, 0.00000000001);
gui.add(showOrbits, 'showOrbits');
gui.add(controlTarget, 'target', {
    "The Sun": sunObj.position,
    "Mercury": mercuryObj.position,
    "Venus": venusObj.position,
    "Earth": earthObj.position,
    "The Moon": moonObj.position,
    "Jupiter": jupiterObj.position,
    "Io": ioObj.position,
    "Saturn": saturnObj.position,
    "Uranus": uranusObj.position,
    "Neptune": neptuneObj.position
});