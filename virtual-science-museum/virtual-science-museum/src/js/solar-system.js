// Solar System Virtual Museum - Main Application
class SolarSystemMuseum {
  constructor() {
    console.log("🌌 SolarSystemMuseum constructor called");

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    this.currentExhibit = 0;
    this.exhibits = [
      { name: "Entrance", progress: 0 },
      { name: "Sun", progress: 9 },
      { name: "Mercury", progress: 18 },
      { name: "Venus", progress: 27 },
      { name: "Earth", progress: 36 },
      { name: "Mars", progress: 45 },
      { name: "Jupiter", progress: 54 },
      { name: "Saturn", progress: 63 },
      { name: "Uranus", progress: 72 },
      { name: "Neptune", progress: 81 },
      { name: "Pluto", progress: 90 },
      { name: "Exit", progress: 100 },
    ];

    this.planetData = {
      sun: {
        name: "The Sun",
        description:
          "Our star - a massive ball of hot plasma that provides energy for our solar system. Diameter: 1.39 million km, Surface Temperature: 5,500°C",
        radius: 8,
        color: 0xff4500,
        emissive: 0xff0000,
        cameraDistance: 20,
      },
      mercury: {
        name: "Mercury",
        description:
          "The smallest and innermost planet. No atmosphere, extreme temperatures (430°C to -180°C). Orbital period: 88 days.",
        modelFile: "src/assets/models/mercury.glb",
        radius: 0.8,
        color: 0x888888,
        orbitRadius: 12,
        orbitSpeed: 0.04,
        cameraDistance: 8,
      },
      venus: {
        name: "Venus",
        description:
          "Earth's 'sister planet' with a toxic atmosphere of CO₂ and sulfuric acid clouds. Hottest planet due to greenhouse effect (465°C).",
        modelFile: "src/assets/models/venus.glb",
        radius: 1.2,
        color: 0xffcc99,
        orbitRadius: 16,
        orbitSpeed: 0.015,
        cameraDistance: 10,
      },
      earth: {
        name: "Earth",
        description:
          "Our home - the only known planet with life. 71% water surface, protective atmosphere and magnetic field. One moon.",
        modelFile: "src/assets/models/earth.glb",
        radius: 1.3,
        color: 0x4facfe,
        orbitRadius: 20,
        orbitSpeed: 0.01,
        cameraDistance: 12,
        hasMoon: true,
      },
      mars: {
        name: "Mars",
        description:
          "The Red Planet with iron oxide surface. Thin CO₂ atmosphere, polar ice caps, and the largest volcano Olympus Mons.",
        modelFile: "src/assets/models/mars.glb",
        radius: 1.1,
        color: 0xff6b35,
        orbitRadius: 24,
        orbitSpeed: 0.005,
        cameraDistance: 10,
      },
      jupiter: {
        name: "Jupiter",
        description:
          "Largest planet - a gas giant with Great Red Spot storm. Has 79 moons including Ganymede, the largest moon in solar system.",
        modelFile: "src/assets/models/jupiter.glb",
        radius: 3.0,
        color: 0xffcc99,
        orbitRadius: 32,
        orbitSpeed: 0.002,
        cameraDistance: 18,
      },
      saturn: {
        name: "Saturn",
        description:
          "Famous for its spectacular ring system. Gas giant with density lower than water - it would float! Has 82 moons.",
        modelFile: "src/assets/models/saturn.glb",
        radius: 2.5,
        color: 0xffe4b5,
        orbitRadius: 40,
        orbitSpeed: 0.001,
        cameraDistance: 22,
        hasRings: true,
      },
      uranus: {
        name: "Uranus",
        description:
          "Ice giant that rotates on its side. Pale blue from methane, has 13 faint rings and 27 moons. -224°C surface temperature.",
        modelFile: "src/assets/models/uranus.glb",
        radius: 1.8,
        color: 0xafeeee,
        orbitRadius: 48,
        orbitSpeed: 0.0007,
        cameraDistance: 16,
      },
      neptune: {
        name: "Neptune",
        description:
          "The windiest planet with speeds up to 2,100 km/h. Ice giant with Great Dark Spot storm. Has 14 moons.",
        modelFile: "src/assets/models/neptune.glb",
        radius: 1.8,
        color: 0x4169e1,
        orbitRadius: 56,
        orbitSpeed: 0.0004,
        cameraDistance: 16,
      },
      pluto: {
        name: "Pluto",
        description:
          "Dwarf planet in Kuiper Belt. Has a heart-shaped glacier and 5 moons including Charon. Surface: -229°C.",
        radius: 0.6,
        color: 0xdddddd,
        orbitRadius: 64,
        orbitSpeed: 0.0002,
        cameraDistance: 8,
      },
    };

    this.planets = [];
    this.moons = [];
    this.asteroids = [];
    this.particles = [];
    this.planetObjects = {}; // Store references to planet objects

    this.init();
  }

  init() {
    console.log("🔧 Initializing museum...");
    this.setupScene();
    this.setupLighting();
    this.createMuseumStructure();
    this.setupEventListeners();
    this.setupLoadingScreen();

    // Start loading process
    this.simulateLoading();
  }

  setupScene() {
    console.log("🎬 Setting up scene...");

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000011);

    // Add starfield
    this.createStarfield();

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 50);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      canvasContainer.appendChild(this.renderer.domElement);
    } else {
      console.error("❌ Canvas container not found!");
      return;
    }

    // Add orbit controls
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 200;

    console.log("✅ Scene setup complete");
  }

  createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2000;
      positions[i + 1] = (Math.random() - 0.5) * 2000;
      positions[i + 2] = (Math.random() - 0.5) * 2000;

      // Random star colors (white to blue)
      const colorVariation = Math.random();
      colors[i] = 0.8 + colorVariation * 0.2; // R
      colors[i + 1] = 0.8 + colorVariation * 0.2; // G
      colors[i + 2] = 1.0; // B
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.5,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const starfield = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(starfield);
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333333, 0.3);
    this.scene.add(ambientLight);

    // Sun light (position will be updated when sun is created)
    this.sunLight = new THREE.PointLight(0xff6b35, 2, 300);
    this.sunLight.position.set(0, 0, 0);
    this.scene.add(this.sunLight);
  }

  createMuseumStructure() {
    // Create orbital paths
    this.createOrbitalPaths();

    // Create exhibit markers for navigation
    this.createExhibitMarkers();
  }

  createOrbitalPaths() {
    const orbitalMaterial = new THREE.LineBasicMaterial({
      color: 0x444477,
      transparent: true,
      opacity: 0.2,
    });

    // Create orbital circles for each planet
    const orbits = [12, 16, 20, 24, 32, 40, 48, 56, 64];

    orbits.forEach((radius) => {
      const orbitGeometry = new THREE.RingGeometry(
        radius - 0.1,
        radius + 0.1,
        128
      );
      const orbit = new THREE.Mesh(orbitGeometry, orbitalMaterial);
      orbit.rotation.x = -Math.PI / 2;
      this.scene.add(orbit);
    });
  }

  createExhibitMarkers() {
    const exhibitPositions = [
      { x: 0, name: "Sun", color: 0xff4500 },
      { x: 12, name: "Mercury", color: 0x888888 },
      { x: 16, name: "Venus", color: 0xffcc99 },
      { x: 20, name: "Earth", color: 0x4facfe },
      { x: 24, name: "Mars", color: 0xff6b35 },
      { x: 32, name: "Jupiter", color: 0xffcc99 },
      { x: 40, name: "Saturn", color: 0xffe4b5 },
      { x: 48, name: "Uranus", color: 0xafeeee },
      { x: 56, name: "Neptune", color: 0x4169e1 },
      { x: 64, name: "Pluto", color: 0xdddddd },
      { x: 80, name: "Exit", color: 0xff6b6b },
    ];

    exhibitPositions.forEach((pos) => {
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.7,
      });

      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(pos.x, 1, 0);
      marker.userData = {
        exhibit: pos.name,
        type: "marker",
      };

      this.scene.add(marker);
    });
  }

  setupEventListeners() {
    console.log("🎮 Setting up event listeners...");

    // Navigation buttons
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => {
        this.previousExhibit();
      });

      nextBtn.addEventListener("click", () => {
        this.nextExhibit();
      });
    } else {
      console.error("❌ Navigation buttons not found!");
    }

    // Close info panel
    const closeInfo = document.getElementById("close-info");
    if (closeInfo) {
      closeInfo.addEventListener("click", () => {
        document.getElementById("exhibit-info").classList.remove("visible");
      });
    }

    // Mouse click for object interaction
    this.renderer.domElement.addEventListener("click", (event) => {
      this.handleClick(event);
    });

    // Scroll-based navigation
    let scrollTimeout;
    window.addEventListener("wheel", (event) => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (event.deltaY > 0) {
          this.nextExhibit();
        } else {
          this.previousExhibit();
        }
      }, 150);
    });

    // Window resize
    window.addEventListener("resize", () => {
      this.onWindowResize();
    });

    // Keyboard navigation
    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        this.nextExhibit();
      } else if (event.key === "ArrowLeft") {
        this.previousExhibit();
      } else if (event.key === " ") {
        // Space bar to toggle auto-rotation
        this.toggleAutoRotation();
      }
    });

    console.log("✅ Event listeners setup complete");
  }

  setupLoadingScreen() {
    console.log("📊 Setting up loading screen...");
    document.getElementById("loading-progress").style.width = "0%";
    document.getElementById("loading-text").textContent =
      "Initializing Solar System...";
  }

  simulateLoading() {
    console.log("🔄 Starting loading simulation...");
    let progress = 0;
    const loadingInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadingInterval);

        // Finish loading
        setTimeout(() => {
          this.finishLoading();
        }, 500);
      }

      document.getElementById("loading-progress").style.width = `${progress}%`;

      // Update loading text based on progress
      if (progress < 20) {
        document.getElementById("loading-text").textContent =
          "Creating starfield...";
      } else if (progress < 40) {
        document.getElementById("loading-text").textContent =
          "Generating Sun...";
      } else if (progress < 60) {
        document.getElementById("loading-text").textContent =
          "Building inner planets...";
      } else if (progress < 80) {
        document.getElementById("loading-text").textContent =
          "Creating gas giants...";
      } else if (progress < 95) {
        document.getElementById("loading-text").textContent = "Adding Pluto...";
      } else {
        document.getElementById("loading-text").textContent =
          "Ready for launch!";
      }
    }, 200);
  }

  finishLoading() {
    console.log("✅ Loading complete, setting up solar system...");

    // Hide loading screen
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        loadingScreen.classList.add("hidden");
      }, 1000);
    }

    // Create all planets
    this.createSun();
    this.createMercury();
    this.createVenus();
    this.createEarth();
    this.createMars();
    this.createJupiter();
    this.createSaturn();
    this.createUranus();
    this.createNeptune();
    this.createPluto();

    // Start animation loop
    this.animate();

    // Show initial instructions
    setTimeout(() => {
      const instructions = document.getElementById("instructions");
      if (instructions) {
        instructions.style.opacity = "0.8";
        instructions.innerHTML =
          "Use mouse to explore • Scroll or use buttons to navigate • Click planets for info • Press SPACE for auto-rotate";
      }
    }, 2000);

    // Update navigation
    this.updateExhibit();

    console.log("🚀 Solar System ready!");
  }

  createSun() {
    const data = this.planetData.sun;
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: data.color,
      emissive: data.emissive,
      emissiveIntensity: 0.8,
    });

    const sun = new THREE.Mesh(geometry, material);
    sun.position.set(0, 0, 0);
    sun.userData = {
      planet: "sun",
      type: "star",
      rotationSpeed: 0.005,
    };

    this.scene.add(sun);
    this.planets.push(sun);
    this.planetObjects.sun = sun;

    // Update sun light position
    this.sunLight.position.copy(sun.position);

    // Add solar corona effect
    this.createSolarCorona(sun);
  }

  createSolarCorona(sun) {
    const coronaGeometry = new THREE.SphereGeometry(
      this.planetData.sun.radius * 1.2,
      32,
      32
    );
    const coronaMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    });

    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    sun.add(corona);
  }

  createMercury() {
    this.planetObjects.mercury = this.createPlanet("mercury");
  }

  createVenus() {
    this.planetObjects.venus = this.createPlanet("venus");
  }

  createEarth() {
    const earth = this.createPlanet("earth");
    this.planetObjects.earth = earth;

    // Add moon
    if (this.planetData.earth.hasMoon) {
      this.createMoon(earth);
    }
  }

  createMars() {
    this.planetObjects.mars = this.createPlanet("mars");
  }

  createJupiter() {
    this.planetObjects.jupiter = this.createPlanet("jupiter");
  }

  createSaturn() {
    const saturn = this.createPlanet("saturn");
    this.planetObjects.saturn = saturn;

    // Add rings
    if (this.planetData.saturn.hasRings) {
      this.createPlanetRings(saturn, 3.5, 5.0, 0.8);
    }
  }

  createUranus() {
    this.planetObjects.uranus = this.createPlanet("uranus");
  }

  createNeptune() {
    this.planetObjects.neptune = this.createPlanet("neptune");
  }

  createPluto() {
    this.planetObjects.pluto = this.createPlanet("pluto");
  }

  createPlanet(planetName) {
    const data = this.planetData[planetName];
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.7,
      metalness: 0.3,
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(data.orbitRadius, 0, 0);
    planet.userData = {
      planet: planetName,
      type: "planet",
      orbitRadius: data.orbitRadius,
      orbitSpeed: data.orbitSpeed,
      rotationSpeed: 0.02,
    };

    this.scene.add(planet);
    this.planets.push(planet);

    return planet;
  }

  createMoon(planet) {
    const moonGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const moonMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
    });

    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(2, 0, 0); // Position relative to Earth
    moon.userData = {
      type: "moon",
      orbitRadius: 2,
      orbitSpeed: 0.05,
      rotationSpeed: 0.01,
    };

    planet.add(moon);
    this.moons.push({ moon, planet });
  }

  createPlanetRings(planet, innerRadius, outerRadius, opacity = 0.7) {
    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: opacity,
    });

    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = -Math.PI / 2;
    rings.position.y = 0.1;

    planet.add(rings);
  }

  nextExhibit() {
    if (this.currentExhibit < this.exhibits.length - 1) {
      this.currentExhibit++;
      this.updateExhibit();
    }
  }

  previousExhibit() {
    if (this.currentExhibit > 0) {
      this.currentExhibit--;
      this.updateExhibit();
    }
  }

  updateExhibit() {
    const exhibit = this.exhibits[this.currentExhibit];

    // Update progress bar
    document.getElementById(
      "progress-fill"
    ).style.width = `${exhibit.progress}%`;

    // Update current room display
    document.getElementById("current-room").textContent = exhibit.name;

    // Update navigation buttons
    this.updateNavigationButtons();

    // Move camera to front of the planet
    this.moveCameraToPlanet(exhibit.name);

    // Show planet info
    const planetKey = exhibit.name.toLowerCase();
    if (this.planetData[planetKey]) {
      this.showPlanetInfo(this.planetData[planetKey]);
    } else if (exhibit.name === "Exit") {
      this.showExhibitInfo({
        title: "End of Tour",
        description:
          "Thank you for exploring our solar system! From the fiery Sun to distant Pluto, each celestial body has unique characteristics that make our cosmic neighborhood fascinating.",
      });
    } else {
      document.getElementById("exhibit-info").classList.remove("visible");
    }
  }

  moveCameraToPlanet(planetName) {
    const planetKey = planetName.toLowerCase();
    const planet = this.planetObjects[planetKey];

    if (!planet) {
      console.warn(`Planet ${planetName} not found`);
      return;
    }

    const data = this.planetData[planetKey];
    const cameraDistance = data.cameraDistance || 15;

    // Calculate camera position directly in front of the planet
    const planetPosition = new THREE.Vector3();
    planet.getWorldPosition(planetPosition);

    // Position camera in front of the planet (along the Z-axis)
    const cameraPosition = new THREE.Vector3(
      planetPosition.x,
      planetPosition.y + cameraDistance * 0.3, // Slightly above for better view
      planetPosition.z + cameraDistance
    );

    // Look directly at the planet
    const lookAtPosition = planetPosition.clone();

    console.log(`🎥 Moving camera to ${planetName}:`, {
      planetPosition: planetPosition.toArray(),
      cameraPosition: cameraPosition.toArray(),
      distance: cameraDistance,
    });

    this.animateCameraTo(cameraPosition, lookAtPosition);
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    if (prevBtn && nextBtn) {
      prevBtn.disabled = this.currentExhibit === 0;
      nextBtn.disabled = this.currentExhibit === this.exhibits.length - 1;

      // Update button labels
      prevBtn.textContent = this.currentExhibit === 0 ? "Start" : "Previous";
      nextBtn.textContent =
        this.currentExhibit === this.exhibits.length - 1 ? "Finish" : "Next";
    }
  }

  animateCameraTo(targetPosition, targetLookAt) {
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing
      const easeProgress =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      // Interpolate camera position
      this.camera.position.lerpVectors(
        startPosition,
        targetPosition,
        easeProgress
      );

      // Interpolate look-at target
      this.controls.target.lerpVectors(startTarget, targetLookAt, easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure final positions are exact
        this.camera.position.copy(targetPosition);
        this.controls.target.copy(targetLookAt);
        this.controls.update();
      }
    };

    animate();
  }

  showPlanetInfo(planetData) {
    this.showExhibitInfo({
      title: planetData.name,
      description: planetData.description,
    });
  }

  showExhibitInfo(data) {
    const titleElement = document.getElementById("exhibit-title");
    const descElement = document.getElementById("exhibit-description");
    const infoPanel = document.getElementById("exhibit-info");

    if (titleElement && descElement && infoPanel) {
      titleElement.textContent = data.title;
      descElement.textContent = data.description;
      infoPanel.classList.add("visible");
    }
  }

  handleClick(event) {
    const mouse = new THREE.Vector2();
    const rect = this.renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Check for planets and markers
    const intersectObjects = [];
    this.scene.traverse((obj) => {
      if (obj.userData && (obj.userData.planet || obj.userData.exhibit)) {
        intersectObjects.push(obj);
      }
    });

    const intersects = raycaster.intersectObjects(intersectObjects);

    if (intersects.length > 0) {
      const object = intersects[0].object;

      // If it's an exhibit marker, navigate to that exhibit
      if (object.userData.exhibit) {
        const exhibitName = object.userData.exhibit;
        const exhibitIndex = this.exhibits.findIndex(
          (e) => e.name === exhibitName
        );
        if (exhibitIndex !== -1) {
          this.currentExhibit = exhibitIndex;
          this.updateExhibit();
        }
      }

      // If it's a planet, show info and navigate to it
      if (object.userData.planet) {
        const planetName = object.userData.planet;
        const exhibitIndex = this.exhibits.findIndex(
          (e) => e.name.toLowerCase() === planetName
        );
        if (exhibitIndex !== -1) {
          this.currentExhibit = exhibitIndex;
          this.updateExhibit();
        }
      }
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  toggleAutoRotation() {
    this.autoRotate = !this.autoRotate;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 1.0;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Update controls
    this.controls.update();

    // Animate solar system
    this.animateSolarSystem();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  animateSolarSystem() {
    const time = Date.now() * 0.001;

    // Animate planets around the sun
    this.planets.forEach((planet) => {
      if (planet.userData.planet !== "sun") {
        // Rotate planet around its axis
        planet.rotation.y += planet.userData.rotationSpeed;

        // Orbital motion around the sun
        if (planet.userData.orbitRadius && planet.userData.orbitSpeed) {
          const angle = time * planet.userData.orbitSpeed;
          planet.position.x = Math.cos(angle) * planet.userData.orbitRadius;
          planet.position.z = Math.sin(angle) * planet.userData.orbitRadius;
        }
      } else {
        // Rotate the sun
        planet.rotation.y += planet.userData.rotationSpeed;
      }
    });

    // Animate moons
    this.moons.forEach(({ moon, planet }) => {
      moon.rotation.y += moon.userData.rotationSpeed;

      // Moon orbital motion around its planet
      const moonAngle = time * moon.userData.orbitSpeed;
      moon.position.x = Math.cos(moonAngle) * moon.userData.orbitRadius;
      moon.position.z = Math.sin(moonAngle) * moon.userData.orbitRadius;
    });
  }
  tationSpeed;
}
