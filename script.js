import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { InteractionManager  } from 'three.interactive';

// ===================== PLANETARY DATA ==================

// semi_major for planets is in kilometres * 10^6, for satellites its in kilometres
// inclination and tilt is in degrees
// inclination is in reference to the sun's equator
// radius is in kilometres

// forgot to add spin speed

const sun = {
    name: "The Sun",
    radius: 695700,
    tilt: 0
}

const mercury = {
    name: "Mercury",
    semi_major: 57909050,
    eccentric: 0.205630,
    inclination: 3.38,
    radius: 2440.5,
    tilt: 0.034,
    satellites: []
}

const venus = {
    name: "Venus",
    semi_major: 108.210,
    eccentric: 0.0068,
    inclination: 3.86,
    radius: 6051.8,
    tilt: 2.64,
    satellites: []
}

const earth = {
    name: "Earth",
    semi_major: 149.598,
    eccentric: 0.0167,
    inclination: 7.155,
    radius: 6378.137,
    tilt: 23.44,
    satellites: [{
        name: "The Moon",
        semi_major: 0.3844,
        eccentric: 0.0549,
        inclination: 23.43,
        radius: 1738.1,
        tilt: 6.68,
    }]
}

const mars = {
    name: "Mars",
    semi_major: 227.956,
    eccentric: 0.0935,
    inclination: 5.65,
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

function generateOrbit(a, e, i) {
    // a is the semi-major axis
    // e is the eccentricity
    // i is the inclination
    const b = a*Math.sqrt(1-e^2);

    let path = new THREE.CurvePath();
    path.autoClose = true;

    path.add(new THREE.Vector3(0,b,0));
    path.add(new THREE.Vector3(a,0,0));
    path.add(new THREE.Vector3(0,-b,0));
    path.add(new THREE.Vector3(-a,0,0));

    return path;
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
const cam = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
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

const sunObj = addBody("textures/sun.jpg", sun)
const sunTextureMap = new THREE.TextureLoader().load("textures/sun.jpg");
sunTextureMap.magFilter = THREE.NearestFilter;
sunTextureMap.generateMipmaps = false;
sunTextureMap.minFilter = THREE.LinearFilter;
sunObj.material = new THREE.MeshBasicMaterial({map: sunTextureMap});
const mercuryObj = addBody("textures/mercury.jpg", mercury);
const venusObj = addBody("textures/venus.jpg", venus);
const earthObj = addBody("textures/earth.png", earth);
const marsObj = addBody("textures/mars.jpg", mars);

const light0 = new THREE.AmbientLight("#fff",0.3);
light0.position.set(-25,15,15);
scene.add(light0);

const sunLight = new THREE.PointLight("#ffd782",5, 10000);
sunLight.position.set(-5000,0,0);
scene.add(sunLight);


function animate() {
	requestAnimationFrame( animate );

    sunObj.position.setX(-5000);
    mercuryObj.position.setX(-500);
    venusObj.position.setX(-300);
    earthObj.position.setX(0);
    earthObj.rotateOnAxis(new THREE.Vector3(0,1,0),0.005);
    marsObj.position.setX(250);

    interact.update();
    controls.update();
    controls.target.lerp(controlTarget, 0.1);
	renderer.render( scene, cam );
}
animate();