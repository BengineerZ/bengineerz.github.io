import { useEffect, useRef } from "react";

export default function BoxArrowDemo() {
  console.log("BoxArrowDemo rendering");
  const leftRef = useRef(null);     // 3D container
  const mapRef = useRef(null);      // 2D canvas

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on SSR
    
    let renderer, scene, camera, raf;
    let dispose = () => {};

    (async () => {
      // Dynamically load three to keep initial bundle lean
      const THREE = await import("three");
      // OrbitControls (official addon path)
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

      const el = leftRef.current;
      const W = el.clientWidth, H = el.clientHeight;

      scene = new THREE.Scene();
      scene.background = null; // Transparent background

      // Orthographic camera for a diagram look
      const viewSize = 6;
      const aspect = W / H;
      camera = new THREE.OrthographicCamera(
        (-viewSize * aspect) / 2,
        (viewSize * aspect) / 2,
        viewSize / 2,
        -viewSize / 2,
        0.1,
        100
      );
      camera.position.set(5, 5, 5);  // Adjusted camera position
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true // Enable transparency
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0); // Transparent background
      el.appendChild(renderer.domElement);

      // Enhanced lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));  // Increased ambient light intensity
      
      // Add directional light
      const dir = new THREE.DirectionalLight(0xffffff, 1.0);  // Increased intensity
      dir.position.set(5, 8, 4);
      scene.add(dir);
      
      // Add additional light from another angle
      const dir2 = new THREE.DirectionalLight(0xffffff, 0.7);
      dir2.position.set(-5, 6, -4);
      scene.add(dir2);

      // Ground: shallow box with top at y=0 as a solid green object
      const boxSize = 4, boxThickness = 0.2;
      const ground = new THREE.Mesh(
        new THREE.BoxGeometry(boxSize, boxThickness, boxSize),
        new THREE.MeshPhongMaterial({ 
          color: 0x2e8b57, // Sea green color
          wireframe: false,
          flatShading: true,
          shininess: 30
        })
      );
      ground.position.y = -boxThickness / 2;
      scene.add(ground);

      // Arrow (group) - blue and pointing down at the ground
      const blueColor = 0x0066cc; // Nice blue color
      
      // Create shaft pointing downward
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16),
        new THREE.MeshPhongMaterial({ 
          color: blueColor,
          shininess: 70
        })
      );
      
      // Create head (cone) pointing downward
      const head = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.25, 24),
        new THREE.MeshPhongMaterial({ 
          color: blueColor,
          shininess: 70
        })
      );
      
      // Position the head below the shaft
      head.position.y = -0.525;
      
      // Rotate the head 180 degrees to point downward
      head.rotation.x = Math.PI;
      
      const arrow = new THREE.Group();
      arrow.add(shaft, head);
      
      // Position the arrow so the tip touches the ground surface
      arrow.position.y = 0.6; // Position high enough so tip touches ground at y=0
      
      scene.add(arrow);

      // Controls for intuitive drag orbit - rotation only
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.rotateSpeed = 0.7;
      
      // Disable panning (translation)
      controls.enablePan = false;
      
      // Disable zooming
      controls.enableZoom = false;
      controls.enableScale = false;
      
      // Lock vertical rotation to a reasonable range (optional)
      controls.minPolarAngle = Math.PI / 6; // 30 degrees
      controls.maxPolarAngle = Math.PI / 2;  // 90 degrees
      
      // These will be toggled based on interaction mode
      let controlsEnabled = true;

      // Dragging on the y=0 plane via raycast
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const dom = renderer.domElement;

      function onPlaneAt(clientX, clientY) {
        const r = dom.getBoundingClientRect();
        ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
        ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        const p = new THREE.Vector3();
        return raycaster.ray.intersectPlane(plane, p) ? p : null;
      }
      function clampToBox(p) {
        const half = boxSize / 2;
        p.x = Math.max(-half, Math.min(half, p.x));
        p.z = Math.max(-half, Math.min(half, p.z));
        p.y = 0.6; // Maintain the arrow's height above ground
        return p;
      }

      // Right-hand 2D map
      const map = mapRef.current;
      function resizeMap() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        map.width  = Math.round(map.clientWidth  * dpr);
        map.height = Math.round(map.clientHeight * dpr);
      }
      function drawDot(x, z) {
        const ctx = map.getContext("2d");
        const w = map.width, h = map.height, pad = 12;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = "#666"; ctx.lineWidth = 1;
        ctx.strokeRect(pad, pad, w - 2 * pad, h - 2 * pad);

        const half = boxSize / 2;
        const nx = (x + half) / (2 * half);
        const nz = (z + half) / (2 * half);
        const cx = pad + nx * (w - 2 * pad);
        const cy = pad + (1 - nz) * (h - 2 * pad);

        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2); // simple dot
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
      resizeMap(); drawDot(0, 0); // Initialize the map dot at center

      // Pointer events (mouse/touch/pen)
      let dragging = false;
      let isOverArrow = false;
      
      // Check if pointer is over the arrow
      function checkArrowHover(clientX, clientY) {
        const r = dom.getBoundingClientRect();
        ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
        ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        
        // Check if pointer is over the arrow
        const intersects = raycaster.intersectObjects([arrow.children[0], arrow.children[1]]);
        return intersects.length > 0;
      }
      
      function down(e) {
        // Check if we're hovering over the arrow
        isOverArrow = checkArrowHover(e.clientX, e.clientY);
        
        if (isOverArrow) {
          // If over arrow, disable orbit controls and enable arrow dragging
          dragging = true;
          controls.enabled = false;
          dom.setPointerCapture?.(e.pointerId);
          
          const hit = onPlaneAt(e.clientX, e.clientY);
          if (hit) {
            clampToBox(hit);
            arrow.position.set(hit.x, 0.6, hit.z); // Keep arrow at correct height
            drawDot(hit.x, hit.z);
          }
        } else {
          // If not over arrow, enable orbit controls
          controls.enabled = true;
        }
      }
      
      function move(e) {
        // Only move arrow if we're dragging and initially clicked on the arrow
        if (dragging && isOverArrow) {
          const hit = onPlaneAt(e.clientX, e.clientY);
          if (hit) {
            clampToBox(hit);
            arrow.position.set(hit.x, 0.6, hit.z); // Keep arrow at correct height
            drawDot(hit.x, hit.z);
          }
        }
        
        // Update cursor based on hover state if not currently dragging
        if (!dragging) {
          isOverArrow = checkArrowHover(e.clientX, e.clientY);
          dom.style.cursor = isOverArrow ? 'grab' : 'auto';
        } else if (isOverArrow) {
          dom.style.cursor = 'grabbing';
        }
      }
      
      function up() { 
        dragging = false;
        // Re-enable controls after we're done dragging
        controls.enabled = true;
        dom.style.cursor = isOverArrow ? 'grab' : 'auto';
      }
      
      dom.addEventListener("pointerdown", down);
      dom.addEventListener("pointermove", move);
      dom.addEventListener("pointerup", up);

      // Resize 3D view with container
      const ro = new ResizeObserver(() => {
        const w = el.clientWidth, h = el.clientHeight;
        renderer.setSize(w, h);
        const a = w / h;
        camera.left = (-viewSize * a) / 2;
        camera.right = (viewSize * a) / 2;
        camera.top = viewSize / 2;
        camera.bottom = -viewSize / 2;
        camera.updateProjectionMatrix();
        resizeMap();
      });
      ro.observe(el);

      // Render loop
      const tick = () => {
        controls.update();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      dispose = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        dom.removeEventListener("pointerdown", down);
        dom.removeEventListener("pointermove", move);
        dom.removeEventListener("pointerup", up);
        renderer.dispose();
        el.innerHTML = "";
      };
    })();

    return () => dispose();
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
      <figure ref={leftRef} style={{ width: "100%", aspectRatio: "16 / 10", margin: 0, background: "transparent", borderRadius: 12 }} />
      <canvas ref={mapRef} style={{ width: "100%", aspectRatio: "1 / 1", background: "var(--surface,#0b0b0b)", borderRadius: 12 }} />
    </div>
  );
}
