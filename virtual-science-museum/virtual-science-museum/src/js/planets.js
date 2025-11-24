// Planets Management for Solar System Museum
class PlanetManager {
  constructor(solarSystem) {
    this.solarSystem = solarSystem;
    this.planets = [];
    this.moons = [];
    this.planetObjects = {};
    this.modelsLoaded = 0;
    this.totalModels = Object.keys(this.solarSystem.planetData).length;
  }

  // Initialize all planets
  initializePlanets() {
    console.log("🪐 Initializing planets...");
    Object.keys(this.solarSystem.planetData).forEach((planetKey) => {
      const data = this.solarSystem.planetData[planetKey];

      if (this.solarSystem.useGLBModels && data.modelFile) {
        this.loadGLBModel(planetKey, data);
      } else {
        this.createFallbackPlanet(planetKey, data);
      }
    });
  }

  // Load GLB model for a planet
  loadGLBModel(planetKey, data) {
    const modelPath = `src/assets/models/planets/${data.modelFile}`;

    console.log(`📥 Loading GLB model: ${modelPath}`);

    this.solarSystem.loader.load(
      modelPath,
      (gltf) => {
        console.log(`✅ GLB model loaded: ${planetKey}`);
        this.setupPlanetModel(planetKey, data, gltf.scene);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`📊 Loading ${planetKey}: ${percent.toFixed(2)}%`);
      },
      (error) => {
        console.error(`❌ Error loading GLB model for ${planetKey}:`, error);
        console.log(`🔄 Using fallback geometric model for ${planetKey}`);
        this.createFallbackPlanet(planetKey, data);
      }
    );
  }

  // Setup loaded GLB model
  setupPlanetModel(planetKey, data, model) {
    model.scale.set(data.scale, data.scale, data.scale);

    // Position the model
    if (planetKey === "sun") {
      model.position.set(0, 0, 0);
    } else {
      model.position.set(data.orbitRadius, 0, 0);
    }

    // Add user data for interaction
    model.userData = {
      planet: planetKey,
      type: "planet",
      orbitRadius: data.orbitRadius,
      orbitSpeed: data.orbitSpeed,
      rotationSpeed: 0.01,
      isGLBModel: true,
    };

    // Enable shadows if available
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.solarSystem.scene.add(model);
    this.planets.push(model);
    this.planetObjects[planetKey] = model;

    this.modelsLoaded++;
    this.updateModelLoadingProgress();

    // Add special effects for specific planets
    this.addPlanetSpecialEffects(planetKey, model, data);
  }

  // Create fallback geometric planet
  createFallbackPlanet(planetKey, data) {
    console.log(`🎯 Creating fallback geometric model for ${planetKey}`);

    const fallback = data.fallback;
    const geometry = new THREE.SphereGeometry(fallback.radius, 32, 32);

    let material;
    if (planetKey === "sun") {
      material = new THREE.MeshBasicMaterial({
        color: fallback.color,
        emissive: fallback.emissive,
        emissiveIntensity: 0.8,
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: fallback.color,
        roughness: 0.7,
        metalness: 0.3,
      });
    }

    const planet = new THREE.Mesh(geometry, material);

    // Position the planet
    if (planetKey === "sun") {
      planet.position.set(0, 0, 0);
    } else {
      planet.position.set(data.orbitRadius, 0, 0);
    }

    planet.userData = {
      planet: planetKey,
      type: "planet",
      orbitRadius: data.orbitRadius,
      orbitSpeed: data.orbitSpeed,
      rotationSpeed: 0.02,
      isGLBModel: false,
    };

    planet.castShadow = true;
    planet.receiveShadow = true;

    this.solarSystem.scene.add(planet);
    this.planets.push(planet);
    this.planetObjects[planetKey] = planet;

    this.modelsLoaded++;
    this.updateModelLoadingProgress();

    // Add special features
    this.addPlanetSpecialEffects(planetKey, planet, data);
  }

  // Add special effects and features to planets
  addPlanetSpecialEffects(planetKey, planet, data) {
    switch (planetKey) {
      case "sun":
        this.createSolarEffects(planet);
        break;
      case "earth":
        if (data.hasMoon) {
          this.createMoon(planet);
        }
        break;
      case "saturn":
        if (data.hasRings && !planet.userData.isGLBModel) {
          this.createSaturnRings(planet);
        }
        break;
    }
  }

  // Create solar effects for the sun
  createSolarEffects(sun) {
    // Add solar corona
    const coronaGeometry = new THREE.SphereGeometry(
      sun.geometry ? sun.geometry.parameters.radius * 1.1 : 4.5,
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

    // Update sun light position
    if (this.solarSystem.sunLight) {
      this.solarSystem.sunLight.position.copy(sun.position);
    }
  }

  // Create moon for Earth
  createMoon(earth) {
    const moonSize = earth.userData.isGLBModel ? 0.15 : 0.3;
    const orbitRadius = earth.userData.isGLBModel ? 1.5 : 2.0;

    const moonGeometry = new THREE.SphereGeometry(moonSize, 16, 16);
    const moonMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
    });

    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(orbitRadius, 0, 0);
    moon.userData = {
      type: "moon",
      orbitRadius: orbitRadius,
      orbitSpeed: 0.05,
      rotationSpeed: 0.01,
    };

    earth.add(moon);
    this.moons.push({ moon, planet: earth });
  }

  // Create rings for Saturn
  createSaturnRings(saturn) {
    const innerRadius = saturn.geometry.parameters.radius * 1.4;
    const outerRadius = saturn.geometry.parameters.radius * 2.0;

    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });

    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = -Math.PI / 2;
    rings.position.y = 0.1;

    saturn.add(rings);
  }

  // Update loading progress
  updateModelLoadingProgress() {
    const progress = (this.modelsLoaded / this.totalModels) * 100;
    console.log(
      `📊 Models loaded: ${this.modelsLoaded}/${
        this.totalModels
      } (${progress.toFixed(1)}%)`
    );

    // Update loading text when all models are loaded
    if (this.modelsLoaded === this.totalModels) {
      document.getElementById("loading-text").textContent =
        "All models loaded! Finalizing...";

      // Hide loading screen after a short delay
      setTimeout(() => {
        const loadingScreen = document.getElementById("loading-screen");
        if (loadingScreen) {
          loadingScreen.style.opacity = "0";
          setTimeout(() => {
            loadingScreen.classList.add("hidden");
          }, 1000);
        }
      }, 1000);
    }
  }

  // Get planet by name
  getPlanet(planetName) {
    return this.planetObjects[planetName.toLowerCase()];
  }

  // Get all planets
  getAllPlanets() {
    return this.planets;
  }

  // Get planet data
  getPlanetData(planetName) {
    return this.solarSystem.planetData[planetName.toLowerCase()];
  }

  // Animate planets
  animatePlanets(time) {
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
    this.animateMoons(time);
  }

  // Animate moons
  animateMoons(time) {
    this.moons.forEach(({ moon, planet }) => {
      moon.rotation.y += moon.userData.rotationSpeed;

      // Moon orbital motion around its planet
      const moonAngle = time * moon.userData.orbitSpeed;
      moon.position.x = Math.cos(moonAngle) * moon.userData.orbitRadius;
      moon.position.z = Math.sin(moonAngle) * moon.userData.orbitRadius;
    });
  }

  // Get camera position for a planet
  getCameraPositionForPlanet(planetName) {
    const planet = this.getPlanet(planetName);
    if (!planet) return null;

    const data = this.getPlanetData(planetName);
    const cameraDistance = data.cameraDistance || 10;

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

    return {
      position: cameraPosition,
      lookAt: lookAtPosition,
      planetData: data,
    };
  }

  // Get planet information for display
  getPlanetInfo(planetName) {
    const data = this.getPlanetData(planetName);
    if (!data) return null;

    const planet = this.getPlanet(planetName);
    const modelType = planet?.userData?.isGLBModel
      ? "Realistic 3D Model"
      : "Geometric Model";

    return {
      title: data.name,
      description: `${data.description}\n\n📊 Model: ${modelType}`,
    };
  }

  // Check if all models are loaded
  areAllModelsLoaded() {
    return this.modelsLoaded === this.totalModels;
  }

  // Get loading progress
  getLoadingProgress() {
    return {
      loaded: this.modelsLoaded,
      total: this.totalModels,
      percentage: (this.modelsLoaded / this.totalModels) * 100,
    };
  }
}

// Make the class available globally
window.PlanetManager = PlanetManager;
