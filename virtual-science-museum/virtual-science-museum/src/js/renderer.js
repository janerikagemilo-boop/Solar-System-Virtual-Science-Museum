// Three.js Renderer and Scene Management
class SolarSystemRenderer {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    this.starfield = null;
    this.orbitalPaths = [];

    this.init();
  }

  // Initialize the Three.js environment
  init() {
    console.log("🎬 Initializing Three.js renderer...");
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.setupStarfield();
    this.setupEventListeners();

    console.log("✅ Renderer initialization complete");
  }

  // Create the main scene
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000011);
    this.scene.fog = new THREE.Fog(0x000011, 50, 300);

    console.log("🌌 Scene created with space background");
  }

  // Setup the camera
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 50);
    this.camera.lookAt(0, 0, 0);

    console.log("📷 Camera setup complete");
  }

  // Setup the WebGL renderer
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Enable shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Enable tone mapping for better colors
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    console.log("🖌️ WebGL renderer created with shadow mapping");
  }

  // Setup orbit controls
  setupControls() {
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 200;
    this.controls.maxPolarAngle = Math.PI; // Allow looking underneath
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 1.0;

    console.log("🎮 Orbit controls initialized");
  }

  // Create starfield background
  setupStarfield() {
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Random positions in a sphere
      const radius = 800 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Random colors (white to blue)
      const colorVariation = Math.random();
      colors[i * 3] = 0.8 + colorVariation * 0.2; // R
      colors[i * 3 + 1] = 0.8 + colorVariation * 0.2; // G
      colors[i * 3 + 2] = 1.0; // B

      // Random sizes
      sizes[i] = Math.random() * 2 + 0.5;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this.starfield = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starfield);

    console.log("⭐ Starfield created with " + starCount + " stars");
  }

  // Create orbital path visuals
  createOrbitalPaths(orbitalRadii) {
    // Clear existing orbital paths
    this.orbitalPaths.forEach((path) => this.scene.remove(path));
    this.orbitalPaths = [];

    const orbitalMaterial = new THREE.LineBasicMaterial({
      color: 0x444477,
      transparent: true,
      opacity: 0.15,
      linewidth: 1,
    });

    orbitalRadii.forEach((radius) => {
      const orbitGeometry = new THREE.RingGeometry(
        radius - 0.1,
        radius + 0.1,
        128
      );
      const orbit = new THREE.Mesh(orbitGeometry, orbitalMaterial);
      orbit.rotation.x = -Math.PI / 2;
      this.scene.add(orbit);
      this.orbitalPaths.push(orbit);
    });

    console.log("🔄 Created " + orbitalRadii.length + " orbital paths");
  }

  // Setup lighting for the scene
  setupLighting() {
    // Clear existing lights
    const lights = this.scene.children.filter((child) => child.isLight);
    lights.forEach((light) => this.scene.remove(light));

    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x333333, 0.4);
    this.scene.add(ambientLight);

    // Main directional light (simulating sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;

    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;

    this.scene.add(directionalLight);

    // Fill light to reduce harsh shadows
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-50, 25, -50);
    this.scene.add(fillLight);

    console.log("💡 Lighting setup complete with shadows");
  }

  // Create sun light source
  createSunLight(position, color = 0xff6b35, intensity = 2.0) {
    const sunLight = new THREE.PointLight(color, intensity, 300);
    sunLight.position.copy(position);
    sunLight.castShadow = true;

    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 200;

    this.scene.add(sunLight);

    console.log("☀️ Sun light created at position:", position);
    return sunLight;
  }

  // Setup window resize handling
  setupEventListeners() {
    window.addEventListener("resize", () => this.onWindowResize());
    console.log("📐 Window resize handler registered");
  }

  // Handle window resize
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    console.log(
      "🔄 Renderer resized to: " + window.innerWidth + "x" + window.innerHeight
    );
  }

  // Add object to scene with optional shadow configuration
  addToScene(object, castShadow = true, receiveShadow = true) {
    if (castShadow || receiveShadow) {
      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = castShadow;
          child.receiveShadow = receiveShadow;
        }
      });
    }

    this.scene.add(object);
    return object;
  }

  // Remove object from scene
  removeFromScene(object) {
    this.scene.remove(object);
  }

  // Clear entire scene (keep starfield and orbital paths)
  clearScene() {
    const objectsToKeep = [this.starfield, ...this.orbitalPaths];
    const objectsToRemove = this.scene.children.filter(
      (child) => !objectsToKeep.includes(child) && !child.isLight
    );

    objectsToRemove.forEach((object) => this.scene.remove(object));
    console.log("🧹 Scene cleared, kept " + objectsToKeep.length + " objects");
  }

  // Set camera to look at specific position
  lookAt(targetPosition) {
    this.controls.target.copy(targetPosition);
    this.controls.update();
  }

  // Animate camera to new position
  animateCameraTo(targetPosition, targetLookAt, duration = 1500) {
    return new Promise((resolve) => {
      const startPosition = this.camera.position.clone();
      const startTarget = this.controls.target.clone();
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing function
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
        this.controls.target.lerpVectors(
          startTarget,
          targetLookAt,
          easeProgress
        );

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final positions are exact
          this.camera.position.copy(targetPosition);
          this.controls.target.copy(targetLookAt);
          this.controls.update();
          resolve();
        }
      };

      animate();
    });
  }

  // Get renderer DOM element for attaching to page
  getDOMElement() {
    return this.renderer.domElement;
  }

  // Main render loop
  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // Start animation loop
  startAnimationLoop(callback) {
    const animate = () => {
      requestAnimationFrame(animate);
      this.render();
      if (callback) callback();
    };
    animate();
  }

  // Performance monitoring
  getPerformanceInfo() {
    const info = this.renderer.info;
    return {
      memory: {
        geometries: info.memory.geometries,
        textures: info.memory.textures,
      },
      render: {
        calls: info.render.calls,
        triangles: info.render.triangles,
        lines: info.render.lines,
        points: info.render.points,
      },
    };
  }

  // Dispose of resources
  dispose() {
    this.renderer.dispose();
    this.controls.dispose();

    // Dispose of geometries and materials
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    console.log("♻️ Renderer resources disposed");
  }

  // Utility method to create a grid helper
  createGridHelper(
    size = 100,
    divisions = 20,
    color1 = 0x444444,
    color2 = 0x888888
  ) {
    const gridHelper = new THREE.GridHelper(size, divisions, color1, color2);
    gridHelper.position.y = -0.1;
    this.scene.add(gridHelper);
    return gridHelper;
  }

  // Utility method to create axes helper
  createAxesHelper(size = 5) {
    const axesHelper = new THREE.AxesHelper(size);
    this.scene.add(axesHelper);
    return axesHelper;
  }

  // Set background color or texture
  setBackground(colorOrTexture) {
    if (colorOrTexture instanceof THREE.Texture) {
      this.scene.background = colorOrTexture;
    } else {
      this.scene.background = new THREE.Color(colorOrTexture);
    }
  }

  // Enable/disable shadows
  setShadowsEnabled(enabled) {
    this.renderer.shadowMap.enabled = enabled;
    this.scene.traverse((object) => {
      if (object.isLight && object.castShadow !== undefined) {
        object.castShadow = enabled;
      }
    });
  }

  // Set render quality (useful for performance tuning)
  setQuality(quality) {
    switch (quality) {
      case "low":
        this.renderer.setPixelRatio(1);
        this.renderer.shadowMap.enabled = false;
        break;
      case "medium":
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.shadowMap.enabled = true;
        break;
      case "high":
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        break;
    }
  }
}

// Make the class available globally
window.SolarSystemRenderer = SolarSystemRenderer;
