import { useEffect, useRef } from "react";

export default function GlobeSatellites() {
  const ref = useRef(null);

  useEffect(() => {
    // Skip execution in SSR environment
    if (typeof window === 'undefined') return;
    
    let renderer, scene, camera, controls, anim, disposeFns = [];

    (async () => {
      try {
        // dynamic import keeps three.js out of the initial bundle
        const THREE = await import("three");
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js"); // correct path
        const el = ref.current;
        
        if (!el) return;
        
        // Wait a moment to ensure DOM is fully rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if element has dimensions
        const width = el.clientWidth;
        const height = el.clientHeight;
        
        if (width === 0 || height === 0) {
          console.error("Container has zero dimensions:", width, height);
          return;
        }
        
        console.log("Creating WebGL renderer with dimensions:", width, height);
        
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          powerPreference: "high-performance",
          alpha: true // Enable transparency
        });
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0); // Transparent background
        
        // Ensure the canvas is properly constrained
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.maxWidth = '100%';
        renderer.domElement.style.maxHeight = '100%';
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.objectFit = 'contain';
        
        el.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        scene.background = null; // Transparent background
        camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 200);
        camera.position.set(0, 0, 8);

        controls = new OrbitControls(camera, renderer.domElement); // drag / wheel
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.7;
        
        // Disable panning (translation)
        controls.enablePan = false;
        
        // Disable zooming
        controls.enableZoom = true;
        
        // Set rotation limits (optional)
        controls.minPolarAngle = Math.PI / 6; // 30 degrees
        controls.maxPolarAngle = Math.PI / 2;  // 90 degrees

        // Add lighting for better visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);
        
        // Create Earth-like globe with atmosphere
        const globeRadius = 2;
        
        // Base globe (Earth)
        const globe = new THREE.Mesh(
          new THREE.SphereGeometry(globeRadius, 64, 64),
          new THREE.MeshPhongMaterial({ 
            color: 0x1a4d7c, 
            wireframe: false, 
            opacity: 0.9, 
            transparent: true,
            emissive: 0x0a2845,
            emissiveIntensity: 0.2,
            shininess: 30
          })
        );
        scene.add(globe);
        
        // Add wireframe overlay for grid lines
        const gridLines = new THREE.Mesh(
          new THREE.SphereGeometry(globeRadius * 1.001, 32, 32),
          new THREE.MeshBasicMaterial({ 
            color: 0x3a8bda, 
            wireframe: true, 
            opacity: 0.2, 
            transparent: true
          })
        );
        scene.add(gridLines);
        
        // Add atmosphere glow
        const atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(globeRadius * 1.1, 64, 64),
          new THREE.MeshPhongMaterial({ 
            color: 0x4a89c0, 
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.3,
            emissive: 0x2a5980,
            emissiveIntensity: 0.5
          })
        );
        scene.add(atmosphere);
        
        // Add equator highlight
        const equatorGeometry = new THREE.TorusGeometry(globeRadius * 1.001, 0.01, 16, 100);
        const equator = new THREE.Mesh(
          equatorGeometry,
          new THREE.MeshBasicMaterial({ color: 0x55aaff, opacity: 0.8, transparent: true })
        );
        equator.rotation.x = Math.PI / 2;
        scene.add(equator);

        // Satellites as instanced dots with improved visibility
        const count = 800; // Fewer satellites for better performance
        const dotGeo = new THREE.SphereGeometry(0.1, 8, 8); // Slightly larger dots
        
        // Create different materials for satellite types
        const dotMatTypes = [
          new THREE.MeshPhongMaterial({ 
            color: 0xffffff, 
            emissive: 0xcccccc,
            emissiveIntensity: 0.5,
            shininess: 100
          }),
          new THREE.MeshPhongMaterial({ 
            color: 0x88aaff, 
            emissive: 0x4477aa,
            emissiveIntensity: 0.6,
            shininess: 120
          }),
          new THREE.MeshPhongMaterial({ 
            color: 0xff8855, 
            emissive: 0xaa4422,
            emissiveIntensity: 0.5,
            shininess: 90
          })
        ];
        
        // Create satellite instance groups
        const satelliteGroups = [];
        
        // Create satellite orbital data
        const orbitalData = [];
        
        // Create different orbital planes
        const orbitTypes = [
          { count: 10, minR: 3.4, maxR: 3.7, colorIndex: 0, speedFactor: 1.0 },    // LEO (Low Earth Orbit)
          { count: 7, minR: 3.9, maxR: 4.3, colorIndex: 1, speedFactor: 0.7 },    // MEO (Medium Earth Orbit) 
          { count: 5, minR: 4.5, maxR: 5.0, colorIndex: 2, speedFactor: 0.4 },    // GEO (Geostationary Earth Orbit)
          { count: 3,  minR: 4.8, maxR: 5.2, colorIndex: 0, speedFactor: 0.3 }     // Special orbits
        ];
        
        // Initialize orbital data and create instance meshes for each orbit type
        let countSoFar = 0;
        orbitTypes.forEach((orbitType, groupIndex) => {
          // Create instance mesh for this group
          const dots = new THREE.InstancedMesh(
            dotGeo, 
            dotMatTypes[orbitType.colorIndex], 
            orbitType.count
          );
          scene.add(dots);
          satelliteGroups.push(dots);
          
          // Generate orbital parameters
          const m = new THREE.Matrix4();
          for (let i = 0; i < orbitType.count; i++) {
            // Create orbital parameters
            const inclination = Math.random() * Math.PI * 0.5; // Orbital inclination (0 to 90 degrees)
            const ascendingNode = Math.random() * Math.PI * 2; // Right ascension of ascending node
            const eccentricity = Math.random() * 0.2; // Orbital eccentricity (0 = circle, >0 = ellipse)
            const semiMajorAxis = THREE.MathUtils.lerp(orbitType.minR, orbitType.maxR, Math.random());
            const period = Math.pow(semiMajorAxis, 1.5) * orbitType.speedFactor; // Kepler's Third Law approximation
            const meanAnomaly = Math.random() * Math.PI * 2; // Initial position in orbit
            
            // Store orbital parameters
            orbitalData.push({
              semiMajorAxis,
              inclination,
              ascendingNode,
              eccentricity,
              period,
              meanAnomaly,
              groupIndex,
              instanceIndex: i
            });
            
            // Set initial position (calculated in render loop)
            m.makeTranslation(0, 0, 0);
            dots.setMatrixAt(i, m);
          }
          dots.instanceMatrix.needsUpdate = true;
          countSoFar += orbitType.count;
        });
        
        // Function to calculate satellite position based on orbital parameters
        function calculateSatellitePosition(data, time) {
          // Calculate position in orbital plane
          const meanMotion = 2 * Math.PI / data.period;
          const meanAnomaly = data.meanAnomaly + meanMotion * time;
          
          // Solve Kepler's equation (approximation)
          let eccentricAnomaly = meanAnomaly;
          for (let i = 0; i < 5; i++) {
            eccentricAnomaly = meanAnomaly + data.eccentricity * Math.sin(eccentricAnomaly);
          }
          
          // Calculate position in orbital plane
          const x = data.semiMajorAxis * (Math.cos(eccentricAnomaly) - data.eccentricity);
          const y = data.semiMajorAxis * Math.sqrt(1 - data.eccentricity * data.eccentricity) * Math.sin(eccentricAnomaly);
          
          // Rotate to correct orbital plane
          const position = new THREE.Vector3(x, 0, y);
          position.applyAxisAngle(new THREE.Vector3(1, 0, 0), data.inclination);
          position.applyAxisAngle(new THREE.Vector3(0, 1, 0), data.ascendingNode);
          
          return position;
        }

        const onResize = () => {
          try {
            if (!el || !renderer || !camera) return;
            
            const { clientWidth: w, clientHeight: h } = el;
            
            // Skip if dimensions are zero or invalid
            if (w === 0 || h === 0) {
              console.warn("Skipping resize - zero dimensions:", w, h);
              return;
            }
            
            console.log("Resizing renderer to:", w, h);
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          } catch (error) {
            console.error("Error in resize handler:", error);
          }
        };
        
        // Initial resize call
        onResize();
        
        // Set up resize observer
        const ro = new ResizeObserver((entries) => {
          // Add a small delay to ensure measurements are accurate
          setTimeout(onResize, 100);
        });
        ro.observe(el); 
        disposeFns.push(() => ro.disconnect());
        
        // Animation variables
        let rotationSpeed = 0.0002;
        let time = 0;
        const matrix = new THREE.Matrix4();
        const tempQuaternion = new THREE.Quaternion();
        const tempPosition = new THREE.Vector3();
        const tempScale = new THREE.Vector3(1, 1, 1);
        
        // Create trail effects for a few selected satellites
        const trailCount = 12;
        const trailLength = 50;
        const trails = [];
        
        // Select some satellites for trails
        const trailSatellites = [];
        for (let i = 0; i < trailCount; i++) {
          const index = Math.floor(Math.random() * orbitalData.length);
          trailSatellites.push(index);
          
          // Create trail line
          const trailGeometry = new THREE.BufferGeometry();
          const positions = new Float32Array(trailLength * 3);
          trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          
          const trailMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.4
          });
          
          const trail = new THREE.Line(trailGeometry, trailMaterial);
          scene.add(trail);
          trails.push({
            line: trail,
            positions: positions,
            satelliteIndex: index,
            nextPointIndex: 0
          });
        }
        
        const render = () => {
          try {
            // Check if we still have a valid renderer and scene
            if (!renderer || !scene || !camera || !el) {
              return;
            }
            
            // Check if container is still visible and has dimensions
            if (el.clientWidth === 0 || el.clientHeight === 0 || !el.isConnected) {
              return;
            }
            
            time += 0.01;
            
            // Rotate the globe slowly
            globe.rotation.y += rotationSpeed;
            
            // Update all satellite positions based on orbital mechanics
            orbitalData.forEach((satData, index) => {
              // Get satellite position based on orbital parameters
              const position = calculateSatellitePosition(satData, time);
              
              // Update matrix for this satellite
              tempPosition.copy(position);
              tempQuaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0), 
                position.clone().normalize()
              );
              
              matrix.compose(tempPosition, tempQuaternion, tempScale);
              
              // Apply to the correct instance in the correct group
              satelliteGroups[satData.groupIndex].setMatrixAt(satData.instanceIndex, matrix);
            });
            
            // Update instance matrices
            satelliteGroups.forEach(group => {
              group.instanceMatrix.needsUpdate = true;
            });
            
            // Update trail positions (less frequently)
            if (time % 0.2 < 0.01) {
              trails.forEach(trail => {
                const satData = orbitalData[trail.satelliteIndex];
                const pos = calculateSatellitePosition(satData, time);
                
                // Update next position in the trail
                const idx = trail.nextPointIndex * 3;
                trail.positions[idx] = pos.x;
                trail.positions[idx + 1] = pos.y;
                trail.positions[idx + 2] = pos.z;
                
                // Move to next point in circular buffer
                trail.nextPointIndex = (trail.nextPointIndex + 1) % trailLength;
                
                // Mark the trail's geometry for update
                trail.line.geometry.attributes.position.needsUpdate = true;
              });
            }
            
            controls.update();
            renderer.render(scene, camera);
          } catch (error) {
            console.error("Error in render loop:", error);
          }
          
          // Schedule next frame
          anim = requestAnimationFrame(render);
        };
        anim = requestAnimationFrame(render);

        // cleanup
        disposeFns.push(() => cancelAnimationFrame(anim));
        disposeFns.push(() => renderer.dispose());
      } catch (error) {
        console.error("Error initializing WebGL scene:", error);
      }
    })();

    return () => {
      disposeFns.forEach(fn => fn && fn());
      if (ref.current) ref.current.innerHTML = "";
    };
  }, []);

  return (
    <figure 
      ref={ref} 
      style={{ 
        width: "100%", 
        maxWidth: "100%",
        minWidth: "320px",
        height: "auto",
        minHeight: "240px", 
        aspectRatio: "16 / 9", 
        background: "transparent",
        border: "1px solid rgba(0,0,0,0.00)",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
        margin: "1rem 0",
        boxSizing: "border-box"
      }}
    >
      {/* <figcaption className="sr-only">Interactive 3D globe with satellite dots</figcaption> */}
    </figure>
  );
}
