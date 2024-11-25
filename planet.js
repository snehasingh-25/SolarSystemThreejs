import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// Get the planet name from the URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const planetName = urlParams.get('planet');
console.log("Planet name from URL:", planetName);
// Reference elements
const planetNameElem = document.getElementById('planet-name');
const planetDescriptionElem = document.getElementById('planet-description');
const modelContainer = document.getElementById('container3D');

// Planet data with models
const planetData = {
    Object_56: {
        name: "Sun",
        description: "The Sun is the star at the center of our Solar System. It's a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core. The Sun radiates energy in the form of light, ultraviolet, and infrared radiation.",
        model: "/assets/models/sun.glb"
    },
    Object_5: {
        name: "Mercury",
        description: "Mercury is the smallest and innermost planet in the Solar System. It has no natural satellites and no substantial atmosphere. The planet has a large iron core and thin mantle, giving it the highest density of all the planets after Earth.",
        model: "/assets/models/mercury.glb"
    },
    Object_8: {
        name: "Venus",
        description: "Venus is the second planet from the Sun and is often called Earth's 'sister planet' due to their similar size and mass. It has a thick atmosphere that creates a strong greenhouse effect, making it the hottest planet in our Solar System.",
        model: "/assets/models/venus.glb"
    },
    Object_11: {
        name: "Earth",
        description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. It has one natural satellite, the Moon, and its atmosphere is rich in nitrogen and oxygen. Earth's surface is 71% covered in water.",
        model: "/assets/models/earth.glb"
    },
    Object_14: {
        name: "Mars",
        description: "Mars is the fourth planet from the Sun and is often called the 'Red Planet' due to its reddish appearance caused by iron oxide on its surface. It has two small moons, Phobos and Deimos, and features the largest volcano in the Solar System, Olympus Mons.",
        model: "/assets/models/mars.glb"
    },
    Object_17: {
        name: "Jupiter",
        description: "Jupiter is the largest planet in the Solar System and is a gas giant. It's known for its Great Red Spot, a giant storm that has been raging for at least 400 years. Jupiter has at least 79 moons, including the four large Galilean moons.",
        model: "/assets/models/jupiter.glb"
    },
    Object_20: {
        name: "Saturn",
        description: "Saturn is the sixth planet from the Sun and is famous for its prominent ring system, composed mainly of ice particles, rocky debris, and dust. It's another gas giant and has 82 confirmed moons, with Titan being the largest.",
        model: "/assets/models/saturn2.glb"
    },
    Object_25: {
        name: "Uranus",
        description: "Uranus is the seventh planet and is an ice giant. It's unique among the planets as it rotates on its side, likely due to a massive impact early in its history. It has 27 known moons and a faint ring system.",
        model: "/assets/models/uranus.glb"
    },
    Object_28: {
        name: "Neptune",
        description: "Neptune is the eighth and farthest known planet from the Sun. It's an ice giant similar to Uranus and has 14 known moons. Its blue color comes from methane in its atmosphere, and it experiences the strongest winds of any planet in the Solar System.",
        model: "/assets/models/neptune.glb"
    },
    Object_31: {
        name: "Pluto",
        description: "While no longer classified as a planet, Pluto is a dwarf planet in the Kuiper Belt. It has five known moons, with Charon being the largest. Its surface is composed mainly of frozen nitrogen, methane, and carbon monoxide.",
        model: "/assets/models/pluto.glb"
    }
};

// Display planet details
if (planetName && planetData[planetName]) {
    // Set up container dimensions
    modelContainer.style.width = '100vw';
    modelContainer.style.height = '100vh';
    modelContainer.style.position = 'fixed';
    modelContainer.style.top = '0';
    modelContainer.style.left = '0';
    modelContainer.style.zIndex = '1'; // Lower z-index for 3D container
    
    // Load 3D models
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Enable alpha
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    renderer.setClearAlpha(0); // Make background transparent
    modelContainer.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    
    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add point lights for more dynamic lighting
    const pointLight1 = new THREE.PointLight(0xffffff, 1);
    pointLight1.position.set(-10, 5, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1);
    pointLight2.position.set(10, -5, -10);
    scene.add(pointLight2);

    // Add a subtle hemisphere light for better ambient lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(hemisphereLight);

    // Update text content directly in HTML
    if (planetNameElem) {
        planetNameElem.textContent = planetData[planetName].name;
    }
    if (planetDescriptionElem) {
        planetDescriptionElem.textContent = planetData[planetName].description;
    }

    // Load environment map
    new EXRLoader().load('/assets/models/sky4.exr', texture => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.encoding = THREE.LinearEncoding;
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.exposure = 0.01;
        scene.background = texture;
    });
    
    const loader = new GLTFLoader();
    loader.load(planetData[planetName].model, (gltf) => {
        const model = gltf.scene;
        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
            
        });
        scene.add(model);
        
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4 / maxDim; // Increased from 2 to 4 to make planets larger
        model.scale.setScalar(scale);
        
        model.position.sub(center.multiplyScalar(scale));
        camera.position.z = 7; // Increased from 5 to 7 to accommodate larger planet size

        // Load and position the additional 3D model (cute_astronaut.glb)
        loader.load('/assets/models/cute_astronaut.glb', (gltf) => {
            const astronaut = gltf.scene;
            astronaut.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            setAstronautSize(astronaut, 10);
            astronaut.position.set(-4, 0, 2.5); // Moved further out to account for larger planet
            astronaut.rotation.y = Math.PI/3;
            scene.add(astronaut);

            const clock = new THREE.Clock();
            function animateAstronaut() {
                requestAnimationFrame(animateAstronaut);
                const time = clock.getElapsedTime();
                astronaut.position.y = Math.sin(time) * 0.5;
                controls.update();
                renderer.render(scene, camera);
            }
            animateAstronaut();
        });

        function animate() {
            requestAnimationFrame(animate);
            model.rotation.y += 0.01;
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    });
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
} else {
    planetNameElem.textContent = "Unknown Object";
    planetDescriptionElem.textContent = "No details available for this celestial object.";
}

function setAstronautSize(astronaut, size) {
    astronaut.scale.set(2, 2, 2);
}