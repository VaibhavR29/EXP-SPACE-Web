// ==========================================================================
// 3D EARTH & GAGANYAAN ORBITAL VISUALIZER (Three.js)
// ==========================================================================

(function() {
  const container = document.getElementById('earth-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 450;
  const height = container.clientHeight || 450;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
  camera.position.z = 2.8;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);
  renderer.domElement.id = 'earth-canvas';

  // Lights
  const ambientLight = new THREE.AmbientLight(0x334466, 0.7);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
  sunLight.position.set(5, 3, 4);
  scene.add(sunLight);

  // Earth Group
  const earthGroup = new THREE.Group();
  scene.add(earthGroup);

  // Texture Loader
  const textureLoader = new THREE.TextureLoader();
  let earthMaterial;

  try {
    const earthMap = textureLoader.load('assets/images/earth_texture.jpg');
    const specularMap = textureLoader.load('assets/images/earth_specular.jpg');

    earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: specularMap,
      specular: new THREE.Color(0x223344),
      shininess: 18,
    });
  } catch (e) {
    earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x1d4ed8,
      specular: 0x112233,
      shininess: 15
    });
  }

  const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
  const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  earthGroup.add(earthMesh);

  // Cloud Layer
  let cloudsMesh;
  try {
    const cloudsMap = textureLoader.load('assets/images/earth_clouds.jpg');
    const cloudsMaterial = new THREE.MeshLambertMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(1.015, 64, 64), cloudsMaterial);
    earthGroup.add(cloudsMesh);
  } catch (e) {
    // skip clouds if error
  }

  // Atmospheric Glow (Fresnel rim)
  const atmosphereGeometry = new THREE.SphereGeometry(1.15, 64, 64);
  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
        gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0) * intensity * 0.7;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);

  // Gaganyaan Orbital Ring
  const orbitCurve = new THREE.EllipseCurve(
    0, 0,            // ax, aY
    1.38, 1.38,      // xRadius, yRadius
    0, 2 * Math.PI,  // aStartAngle, aEndAngle
    false,           // aClockwise
    0                // aRotation
  );
  const orbitPoints = orbitCurve.getPoints(120);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
    orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
  );
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xff4500,
    transparent: true,
    opacity: 0.55
  });
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  orbitLine.rotation.x = Math.PI / 4.5;
  orbitLine.rotation.z = Math.PI / 8;
  scene.add(orbitLine);

  // Gaganyaan Satellite / Crew Module
  const satGeo = new THREE.SphereGeometry(0.035, 16, 16);
  const satMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const satellite = new THREE.Mesh(satGeo, satMat);
  scene.add(satellite);

  // Mouse Interaction (Drag to Rotate)
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let autoRotationSpeed = 0.002;

  const dom = renderer.domElement;

  dom.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    earthGroup.rotation.y += deltaX * 0.006;
    earthGroup.rotation.x += deltaY * 0.006;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Touch Support
  dom.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    earthGroup.rotation.y += deltaX * 0.008;
    earthGroup.rotation.x += deltaY * 0.008;

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  // Handle Resize
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });

  // Animation Loop
  let orbitAngle = 0;

  function animate() {
    requestAnimationFrame(animate);

    if (!isDragging) {
      earthGroup.rotation.y += autoRotationSpeed;
    }
    if (cloudsMesh) {
      cloudsMesh.rotation.y += autoRotationSpeed * 1.25;
    }

    // Orbit Gaganyaan
    orbitAngle += 0.015;
    const r = 1.38;
    const x = Math.cos(orbitAngle) * r;
    const z = Math.sin(orbitAngle) * r;

    // Apply orbit line orientation
    const pos = new THREE.Vector3(x, 0, z);
    pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 4.5);
    pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 8);
    satellite.position.copy(pos);

    renderer.render(scene, camera);
  }

  animate();
})();
