import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

// ===================== PLANETARY DATA ==================



// ======================= 3D LOGIC =======================

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("graphics")
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(cam, renderer.domElement);

cam.position.setZ(90);

const gridHelper = new THREE.GridHelper(100,10);
scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(50);
scene.add( axesHelper );

const jupiter = new THREE.Mesh(new THREE.SphereGeometry(15,64,32), new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(
    "textures/jupiter.jpg"
) }));
jupiter.rotation.z = 0.05462881;
scene.add(jupiter);

const light0 = new THREE.AmbientLight("#fff",0.5);
light0.position.set(-25,15,15);
scene.add(light0);

const light1 = new THREE.PointLight("#fff",1);
light1.position.set(25,25,15);
const light1helper = new THREE.PointLightHelper(light1, 1);
scene.add(light1);
scene.add(light1helper);

const light2 = new THREE.PointLight("#fff",1.5);
light2.position.set(-15,-25,0);
const light2helper = new THREE.PointLightHelper(light2, 1);
scene.add(light2);
scene.add(light2helper);


function animate() {
	requestAnimationFrame( animate );

    jupiter.rotation.y += 6.28;

    controls.update();
	renderer.render( scene, cam );
}
animate();