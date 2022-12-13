import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { InteractionManager  } from 'three.interactive';
import { GUI } from 'dat.gui';

// MODIFYABLE VARIABLES

const speedControl = {"Orbit Speed":1};
const spinControl = {"Spin Speed":0.00000083927};
const showOrbits = {"Show Orbits":true};
const hideMoons = {"Show Moons":true, "Show Moon Orbits": false};

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
        semi_major: 9376*6,
        eccentric: 0.0151,
        inclination: 1.093,
        radius: 11.2667*8,
        tilt: 0,
        },
        {
        name: "Deimos",
        semi_major: 23463.2*6,
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
        },
        {
        name: "Europa",
        semi_major: 0.6711*13,
        eccentric: 0.009,
        inclination: 0.47,
        radius: 1560.8*8,
        tilt: 0.1,
        },
        {
        name: "Ganymede",
        semi_major: 1.0704*10,
        eccentric: 0.001,
        inclination: 0.18,
        radius: 2631.2*8,
        tilt: 0.33,
        },
        {
        name: "Callisto",
        semi_major: 1.8827*7,
        eccentric: 0.007,
        inclination: 0.19,
        radius: 2410.3*8,
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
    satellites: [
        {
            name: "Mimas",
            semi_major: 0.18552*60,
            eccentric: 0.0202,
            inclination: 1.53,
            radius: 198*8,
            tilt: 0,
        },
        {
            name: "Enceladus",
            semi_major: 0.23802*52.5,
            eccentric: 0.0045,
            inclination: 0,
            radius: 252*8,
            tilt: 0,
        },
        {
            name: "Tethys",
            semi_major: 0.29466*45,
            eccentric: 0,
            inclination: 1.86,
            radius: 531*8,
            tilt: 0,
        },
        {
            name: "Dione",
            semi_major: 0.3774*37.5,
            eccentric: 0.0022,
            inclination: 0.02,
            radius: 561.5*8,
            tilt: 0,
        },
        {
            name: "Rhea",
            semi_major: 0.52704*30,
            eccentric: 0.001,
            inclination: 0.35,
            radius: 763.5*8,
            tilt: 0,
        },
        {
            name: "Titan",
            semi_major: 1.22183*15,
            eccentric: 0.0292,
            inclination: 0.33,
            radius: 2574.5*8,
            tilt: 0,
        }
    ]
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

    if(showOrbits["Show Orbits"]){
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
        controlTarget["Camera Target"] = obj.position;
    });

    return obj;
}

// ======================= 3D LOGIC =======================

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("graphics"),
    antialias: true
});
const cam = new THREE.PerspectiveCamera(75, renderer.domElement.clientWidth/renderer.domElement.clientHeight, 0.1, 550000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);

window.addEventListener('resize', function(){
    console.log("resized");
    cam.aspect = renderer.domElement.clientWidth/renderer.domElement.clientHeight;
    cam.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(renderer.domElement.clientWidth*2, renderer.domElement.clientHeight*2);
});

const interact = new InteractionManager(renderer, cam, renderer.domElement);

let controlTarget = {"Camera Target": new THREE.Vector3()};
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
controlTarget["Camera Target"] = sunObj.position;

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

let europaOrbitSpeed = 500;
const europaObj = addBody("textures/europa.jpg", jupiter.satellites[1]);
let europaOrbit = generateOrbit(jupiter.satellites[1],jupiterObj.position.x,jupiterObj.position.z,europaOrbitSpeed);
europaObj.position.copy(europaOrbit[0][0]);
let europaOrbitIndex = 0;

let ganymedeOrbitSpeed = 550;
const ganymedeObj = addBody("textures/ganymede.jpg", jupiter.satellites[2]);
let ganymedeOrbit = generateOrbit(jupiter.satellites[2],jupiterObj.position.x,jupiterObj.position.z,ganymedeOrbitSpeed);
ganymedeObj.position.copy(ganymedeOrbit[0][0]);
let ganymedeOrbitIndex = 0;

let callistoOrbitSpeed = 600;
const callistoObj = addBody("textures/callisto.jpg", jupiter.satellites[3]);
let callistoOrbit = generateOrbit(jupiter.satellites[3],jupiterObj.position.x,jupiterObj.position.z,callistoOrbitSpeed);
callistoObj.position.copy(callistoOrbit[0][0]);
let callistoOrbitIndex = 0;

const saturnObj = addBody("textures/saturn.jpg", saturn);
const saturnRings = new THREE.Mesh( new THREE.RingGeometry((66900*4)/500,(139826*4)/500,100,1,0,degrees_to_radians(360)), new THREE.MeshStandardMaterial({ color:"#fff", side: THREE.DoubleSide, map: new THREE.TextureLoader().load("textures/saturn ring.png"), transparent: true }) );
saturnRings.setRotationFromAxisAngle(new THREE.Vector3(1,0,0),degrees_to_radians(90));
saturnRings.rotation.y = degrees_to_radians(saturn.tilt);
saturnObj.attach(saturnRings);
const saturnOrbit = generateOrbit(saturn,sunObj.position.x,sunObj.position.z,orbitSpeed*saturn.semi_major);
saturnObj.position.copy(saturnOrbit[0][0]);
let saturnOrbitIndex = 0;

let mimasOrbitSpeed = 300;
const mimasObj = addBody("textures/mimas.jpg", saturn.satellites[0]);
let mimasOrbit = generateOrbit(saturn.satellites[0],saturnObj.position.x,saturnObj.position.z,mimasOrbitSpeed);
mimasObj.position.copy(mimasOrbit[0][0]);
let mimasOrbitIndex = 0;

let enceladusOrbitSpeed = 350;
const enceladusObj = addBody("textures/enceladus.jpg", saturn.satellites[1]);
let enceladusOrbit = generateOrbit(saturn.satellites[1],saturnObj.position.x,saturnObj.position.z,enceladusOrbitSpeed);
enceladusObj.position.copy(enceladusOrbit[0][0]);
let enceladusOrbitIndex = 0;

let tethysOrbitSpeed = 400;
const tethysObj = addBody("textures/tethys.jpg", saturn.satellites[2]);
let tethysOrbit = generateOrbit(saturn.satellites[2],saturnObj.position.x,saturnObj.position.z,tethysOrbitSpeed);
tethysObj.position.copy(tethysOrbit[0][0]);
let tethysOrbitIndex = 0;

let dioneOrbitSpeed = 450;
const dioneObj = addBody("textures/dione.jpg", saturn.satellites[3]);
let dioneOrbit = generateOrbit(saturn.satellites[3],saturnObj.position.x,saturnObj.position.z,dioneOrbitSpeed);
dioneObj.position.copy(dioneOrbit[0][0]);
let dioneOrbitIndex = 0;

let rheaOrbitSpeed = 500;
const rheaObj = addBody("textures/rhea.jpg", saturn.satellites[4]);
let rheaOrbit = generateOrbit(saturn.satellites[4],saturnObj.position.x,saturnObj.position.z,rheaOrbitSpeed);
rheaObj.position.copy(rheaOrbit[0][0]);
let rheaOrbitIndex = 0;

let titanOrbitSpeed = 550;
const titanObj = addBody("textures/titan.jpg", saturn.satellites[5]);
let titanOrbit = generateOrbit(saturn.satellites[5],saturnObj.position.x,saturnObj.position.z,titanOrbitSpeed);
titanObj.position.copy(titanOrbit[0][0]);
let titanOrbitIndex = 0;

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
    if(showOrbits["Show Orbits"] === false) {
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
    if(ioOrbitIndex >= ioOrbitSpeed){
        ioOrbitIndex = 0;
    }
    if(europaOrbitIndex >= europaOrbitSpeed){
        europaOrbitIndex = 0;
    }
    if(ganymedeOrbitIndex >= ganymedeOrbitSpeed){
        ganymedeOrbitIndex = 0;
    }
    if(callistoOrbitIndex >= callistoOrbitSpeed){
        callistoOrbitIndex = 0;
    }
    if(saturnOrbitIndex >= orbitSpeed*saturn.semi_major){
        saturnOrbitIndex = 0;
    }
    if(mimasOrbitIndex >= mimasOrbitSpeed){
        mimasOrbitIndex = 0;
    }
    if(enceladusOrbitIndex >= enceladusOrbitSpeed){
        enceladusOrbitIndex = 0;
    }
    if(tethysOrbitIndex >= tethysOrbitSpeed){
        tethysOrbitIndex = 0;
    }
    if(dioneOrbitIndex >= dioneOrbitSpeed){
        dioneOrbitIndex = 0;
    }
    if(rheaOrbitIndex >= rheaOrbitSpeed){
        rheaOrbitIndex = 0;
    }
    if(titanOrbitIndex >= titanOrbitSpeed){
        titanOrbitIndex = 0;
    }
    if(uranusOrbitIndex >= orbitSpeed*uranus.semi_major){
        uranusOrbitIndex = 0;
    }
    if(neptuneOrbitIndex >= orbitSpeed*neptune.semi_major){
        neptuneOrbitIndex = 0;
    }

	requestAnimationFrame( animate );
    
    mercuryObj.rotateOnAxis(new THREE.Vector3(0,1,0),(mercury.radius/8)*spinControl["Spin Speed"]);
    mercuryObj.position.copy(mercuryOrbit[0][mercuryOrbitIndex]);
    
    venusObj.rotateOnAxis(new THREE.Vector3(0,1,0),(venus.radius/8)*spinControl["Spin Speed"]);
    venusObj.position.copy(venusOrbit[0][venusOrbitIndex]);
    
    earthObj.rotateOnAxis(new THREE.Vector3(0,1,0),(earth.radius/8)*spinControl["Spin Speed"]);
    earthObj.position.copy(earthOrbit[0][earthOrbitIndex]);
    
    scene.remove(moonOrbit[1]);
    moonOrbit = generateOrbit(earth.satellites[0],earthObj.position.x,earthObj.position.z,moonOrbitSpeed);
    moonObj.lookAt(earthObj.position);
    moonObj.rotateY(225);
    moonObj.position.copy(moonOrbit[0][moonOrbitIndex]);
    
    marsObj.rotateOnAxis(new THREE.Vector3(0,1,0),(mars.radius/8)*spinControl["Spin Speed"]);
    marsObj.position.copy(marsOrbit[0][marsOrbitIndex]);

    jupiterObj.rotateOnAxis(new THREE.Vector3(0,1,0),(jupiter.radius/12)*spinControl["Spin Speed"]);
    jupiterObj.position.copy(jupiterOrbit[0][jupiterOrbitIndex]);

    scene.remove(ioOrbit[1]);
    ioOrbit = generateOrbit(jupiter.satellites[0],jupiterObj.position.x,jupiterObj.position.z,ioOrbitSpeed);
    ioObj.lookAt(jupiterObj.position);
    ioObj.position.copy(ioOrbit[0][ioOrbitIndex]);

    scene.remove(europaOrbit[1]);
    europaOrbit = generateOrbit(jupiter.satellites[1],jupiterObj.position.x,jupiterObj.position.z,europaOrbitSpeed);
    europaObj.lookAt(jupiterObj.position);
    europaObj.position.copy(europaOrbit[0][europaOrbitIndex]);

    scene.remove(ganymedeOrbit[1]);
    ganymedeOrbit = generateOrbit(jupiter.satellites[2],jupiterObj.position.x,jupiterObj.position.z,ganymedeOrbitSpeed);
    ganymedeObj.lookAt(jupiterObj.position);
    ganymedeObj.position.copy(ganymedeOrbit[0][ganymedeOrbitIndex]);

    scene.remove(callistoOrbit[1]);
    callistoOrbit = generateOrbit(jupiter.satellites[3],jupiterObj.position.x,jupiterObj.position.z,callistoOrbitSpeed);
    callistoObj.lookAt(jupiterObj.position);
    callistoObj.position.copy(callistoOrbit[0][callistoOrbitIndex]);

    saturnObj.rotateOnAxis(new THREE.Vector3(0,1,0),(saturn.radius/12)*spinControl["Spin Speed"]);
    saturnObj.position.copy(saturnOrbit[0][saturnOrbitIndex]);

    scene.remove(mimasOrbit[1]);
    mimasOrbit = generateOrbit(saturn.satellites[0],saturnObj.position.x,saturnObj.position.z,mimasOrbitSpeed);
    mimasObj.lookAt(saturnObj.position);
    mimasObj.position.copy(mimasOrbit[0][mimasOrbitIndex]);

    scene.remove(enceladusOrbit[1]);
    enceladusOrbit = generateOrbit(saturn.satellites[1],saturnObj.position.x,saturnObj.position.z,enceladusOrbitSpeed);
    enceladusObj.lookAt(saturnObj.position);
    enceladusObj.position.copy(enceladusOrbit[0][enceladusOrbitIndex]);

    scene.remove(tethysOrbit[1]);
    tethysOrbit = generateOrbit(saturn.satellites[2],saturnObj.position.x,saturnObj.position.z,tethysOrbitSpeed);
    tethysObj.lookAt(saturnObj.position);
    tethysObj.position.copy(tethysOrbit[0][tethysOrbitIndex]);

    scene.remove(dioneOrbit[1]);
    dioneOrbit = generateOrbit(saturn.satellites[3],saturnObj.position.x,saturnObj.position.z,dioneOrbitSpeed);
    dioneObj.lookAt(saturnObj.position);
    dioneObj.position.copy(dioneOrbit[0][dioneOrbitIndex]);

    scene.remove(rheaOrbit[1]);
    rheaOrbit = generateOrbit(saturn.satellites[4],saturnObj.position.x,saturnObj.position.z,rheaOrbitSpeed);
    rheaObj.lookAt(saturnObj.position);
    rheaObj.position.copy(rheaOrbit[0][rheaOrbitIndex]);

    scene.remove(titanOrbit[1]);
    titanOrbit = generateOrbit(saturn.satellites[5],saturnObj.position.x,saturnObj.position.z,titanOrbitSpeed);
    titanObj.lookAt(saturnObj.position);
    titanObj.position.copy(titanOrbit[0][titanOrbitIndex]);

    uranusObj.rotateOnAxis(new THREE.Vector3(0,1,0),(uranus.radius/12)*spinControl["Spin Speed"]);
    uranusObj.position.copy(uranusOrbit[0][uranusOrbitIndex]);

    neptuneObj.rotateOnAxis(new THREE.Vector3(0,1,0),(neptune.radius/12)*spinControl["Spin Speed"]);
    neptuneObj.position.copy(neptuneOrbit[0][neptuneOrbitIndex]);

    if(!hideMoons['Show Moons']) {
        moonObj.visible = false;
        ioObj.visible = false;
        europaObj.visible = false;
        ganymedeObj.visible = false;
        callistoObj.visible = false;
        mimasObj.visible = false;
        enceladusObj.visible = false;
        tethysObj.visible = false;
        dioneObj.visible = false;
        rheaObj.visible = false;
        titanObj.visible = false;
    } else {
        moonObj.visible = true;
        ioObj.visible = true;
        europaObj.visible = true;
        ganymedeObj.visible = true;
        callistoObj.visible = true;
        mimasObj.visible = true;
        enceladusObj.visible = true;
        tethysObj.visible = true;
        dioneObj.visible = true;
        rheaObj.visible = true;
        titanObj.visible = true;
    }
    if(!hideMoons['Show Moon Orbits']) {
        moonOrbit[1].visible = false;
        ioOrbit[1].visible = false;
        europaOrbit[1].visible = false;
        ganymedeOrbit[1].visible = false;
        callistoOrbit[1].visible = false;
        mimasOrbit[1].visible = false;
        enceladusOrbit[1].visible = false;
        tethysOrbit[1].visible = false;
        dioneOrbit[1].visible = false;
        rheaOrbit[1].visible = false;
        titanOrbit[1].visible = false;
    } else {
        moonOrbit[1].visible = true;
        ioOrbit[1].visible = true;
        europaOrbit[1].visible = true;
        ganymedeOrbit[1].visible = true;
        callistoOrbit[1].visible = true;
        mimasOrbit[1].visible = true;
        enceladusOrbit[1].visible = true;
        tethysOrbit[1].visible = true;
        dioneOrbit[1].visible = true;
        rheaOrbit[1].visible = true;
        titanOrbit[1].visible = true;
    }

    mercuryOrbitIndex += speedControl["Orbit Speed"];
    venusOrbitIndex += speedControl["Orbit Speed"];
    moonOrbitIndex += speedControl["Orbit Speed"];
    earthOrbitIndex += speedControl["Orbit Speed"];
    marsOrbitIndex += speedControl["Orbit Speed"];
    jupiterOrbitIndex += speedControl["Orbit Speed"];
    ioOrbitIndex += speedControl["Orbit Speed"];
    europaOrbitIndex += speedControl["Orbit Speed"];
    ganymedeOrbitIndex += speedControl["Orbit Speed"];
    callistoOrbitIndex += speedControl["Orbit Speed"];
    saturnOrbitIndex += speedControl["Orbit Speed"];
    mimasOrbitIndex += speedControl["Orbit Speed"];
    enceladusOrbitIndex += speedControl["Orbit Speed"];
    tethysOrbitIndex += speedControl["Orbit Speed"];
    dioneOrbitIndex += speedControl["Orbit Speed"];
    rheaOrbitIndex += speedControl["Orbit Speed"];
    titanOrbitIndex += speedControl["Orbit Speed"];
    uranusOrbitIndex += speedControl["Orbit Speed"];
    neptuneOrbitIndex += speedControl["Orbit Speed"];

    interact.update();
    controls.update();
    controls.target.lerp(controlTarget["Camera Target"], 0.1);
	renderer.render( scene, cam );
}
animate();

// GUI
const gui = new GUI( {autoPlace: false} );
document.getElementById("dat.gui").append(gui.domElement);
gui.add(speedControl, 'Orbit Speed', 0, 50, 1).listen();
gui.add(spinControl, 'Spin Speed', 0, 0.00003, 0.00000000001).listen();
gui.add(showOrbits, 'Show Orbits').listen();
gui.add(hideMoons, 'Show Moons').listen();
gui.add(hideMoons, 'Show Moon Orbits').listen();
gui.add(controlTarget, 'Camera Target', {
    "The Sun": sunObj.position,
    "Mercury": mercuryObj.position,
    "Venus": venusObj.position,
    "Earth": earthObj.position,
    "Mars": marsObj.position,
    "Jupiter": jupiterObj.position,
    "Saturn": saturnObj.position,
    "Uranus": uranusObj.position,
    "Neptune": neptuneObj.position
}).listen();

var resetSettings = { reset:function(){
    speedControl["Orbit Speed"] = 1;
    spinControl["Spin Speed"] = 0.00000083927;
    showOrbits["Show Orbits"] = true;
    hideMoons["Show Moons"] = true;
    hideMoons["Show Moon Orbits"] = false;
    controlTarget["Camera Target"] = sunObj.position;
}};
gui.add(resetSettings,'reset').name("Reset to Default Settings");