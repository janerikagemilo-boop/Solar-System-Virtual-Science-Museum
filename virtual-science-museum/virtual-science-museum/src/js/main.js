// Solar System Virtual Museum - Main Entry Point
window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Initializing Solar System Museum...");

  // Check if Three.js is loaded
  if (typeof THREE === "undefined") {
    console.error("❌ Three.js not loaded!");
    document.getElementById("loading-text").textContent =
      "Error: Three.js failed to load. Please refresh.";
    return;
  }

  // Check if OrbitControls is loaded
  if (typeof THREE.OrbitControls === "undefined") {
    console.error("❌ OrbitControls not loaded!");
    document.getElementById("loading-text").textContent =
      "Error: OrbitControls failed to load. Please refresh.";
    return;
  }

  // Check if our main class is available
  if (typeof SolarSystemMuseum === "undefined") {
    console.error("❌ SolarSystemMuseum class not found!");
    document.getElementById("loading-text").textContent =
      "Error: Museum class not found. Please check console.";
    return;
  }

  console.log("✅ All dependencies loaded, starting museum...");

  try {
    new SolarSystemMuseum();
  } catch (error) {
    console.error("❌ Failed to create SolarSystemMuseum:", error);
    document.getElementById("loading-text").textContent =
      "Error: " + error.message;
  }
});
