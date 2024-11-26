import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Initialize core Three.js components
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-40, 15, 50);

// Setup renderer
const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;

// Setup controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;

// Setup lighting
const lights = {
    ambient: new THREE.AmbientLight(0xffffff, 1.0),
    sun: new THREE.DirectionalLight(0xffffff, 2),
    center: new THREE.PointLight(0xffd700, 4, 200),
    planet1: new THREE.PointLight(0xffffff, 1, 100),
    planet2: new THREE.PointLight(0xffffff, 1, 100)
};

lights.sun.position.set(0, 0, 100);
lights.sun.castShadow = true;
lights.center.position.set(0, 0, 0);
lights.planet1.position.set(50, 0, 0);
lights.planet2.position.set(-50, 0, 0);

Object.values(lights).forEach(light => scene.add(light));

// Load environment map
new EXRLoader().load('public/assets/models/sky4.exr', texture => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.encoding = THREE.LinearEncoding;
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.exposure = 0.1;
    scene.background = scene.environment = texture;
});

// Animation system
const mixers = [];
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let solarSystem;
const infoContainer = document.getElementById('info-container');
const knowMoreBtn = document.getElementById('know-more-btn');
let selectedPlanetName = '';

// Mapping of object names to planet names
const planetNames = {
    'Object_5': 'Mercury',
    'Object_8': 'Venus',
    'Object_11': 'Earth',
    'Object_14': 'Mars',
    'Object_17': 'Jupiter',
    'Object_20': 'Saturn',
    'Object_25': 'Uranus',
    'Object_28': 'Neptune',
    'Object_31': 'Pluto',
    'Object_56': 'Sun'
};

// Load and setup solar system model
new GLTFLoader().load(
    '/assets/models/solar_system_animation.glb',
    gltf => {
        solarSystem = gltf.scene;

        // Align planets and log names
        solarSystem.traverse(object => {
            if (object.isMesh) {
                object.position.y = 0;
                object.rotation.x = object.rotation.z = 0;
                console.log('Object name:', object.name);
            }
        });

        scene.add(solarSystem);

        // Setup animations
        if (gltf.animations?.length) {
            const mixer = new THREE.AnimationMixer(solarSystem);
            mixers.push(mixer);

            gltf.animations.forEach(clip => {
                // Configure animation settings
                clip.loop = THREE.LoopRepeat;
                clip.repetitions = Infinity;
                clip.clampWhenFinished = false;

                // Process animation tracks
                clip.tracks.forEach(track => {
                    if (track.name.includes('position')) {
                        for (let i = 1; i < track.values.length; i += 3) {
                            track.values[i] = 0;
                        }
                    }
                    if (track.name.includes('quaternion')) {
                        for (let i = 0; i < track.values.length; i += 4) {
                            track.values[i] = track.values[i + 2] = 0;
                        }
                    } else if (track.name.includes('rotation')) {
                        for (let i = 0; i < track.values.length; i += 3) {
                            track.values[i] = track.values[i + 2] = 0;
                        }
                    }
                });

                // Start animation
                const action = mixer.clipAction(clip);
                action.setLoop(THREE.LoopRepeat, Infinity);
                action.clampWhenFinished = false;
                action.timeScale = 0.1;
                action.play();
            });
        }

        // Handle planet selection
        window.addEventListener('click', event => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(solarSystem.children, true);

            if (intersects.length) {
                const selectedObject = intersects[0].object;
                console.log('Selected object:', selectedObject.name);
                const planetPosition = new THREE.Vector3();
                selectedObject.getWorldPosition(planetPosition);
                const targetPosition = planetPosition.clone().add(new THREE.Vector3(5, 2, 5));
                animateCamera(camera.position.clone(), targetPosition, planetPosition);
                const button = document.getElementById('know-more-btn');
                button.innerText = 'Know More';
                button.style.display = 'block';
                button.dataset.planetName = selectedObject.name;

                // Set the selected planet name using the mapping object
                selectedPlanetName = planetNames[selectedObject.name] || 'Unknown Planet';

                // Add button click event to display planet name
                const planetNameDiv = document.getElementById('planet-name');
                planetNameDiv.innerText = selectedPlanetName;
                planetNameDiv.style.display = 'block';
            }
        });
    },
    null,
    error => console.error('Loading error:', error)
);

// Handle know more button click
knowMoreBtn.addEventListener('click', () => {
    const objectName = knowMoreBtn.dataset.planetName;
    console.log(objectName);
    if (objectName) {
        window.location.href = `planet-info.html?planet=${encodeURIComponent(objectName)}`;
    }
});


// Camera animation helper
function animateCamera(start, end, target, duration = 1000) {
    const startTime = Date.now();

    function update() {
        const progress = (Date.now() - startTime) / duration;

        if (progress < 1) {
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            camera.position.lerpVectors(start, end, easeProgress);
            controls.target.lerp(target, easeProgress);
            requestAnimationFrame(update);
        }
    }

    update();
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    mixers.forEach(mixer => mixer.update(delta));
    controls.update();
    renderer.render(scene, camera);
}

animate();
