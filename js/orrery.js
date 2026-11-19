// ==========================================================================
// INTERACTIVE SOLAR SYSTEM ORRERY
// Interactive planetary orbits with live astronomical telemetry
// ==========================================================================

(function() {
  const canvas = document.getElementById('orrery-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const infoBar = document.getElementById('orrery-info-bar');

  let width = canvas.width = canvas.parentElement.clientWidth || 360;
  let height = canvas.height = width;

  const planets = [
    { name: 'Mercury', r: 38, size: 3.5, color: '#A3A3A3', speed: 0.04, angle: 0.5, vel: '47.4 km/s', dist: '0.39 AU', mission: 'BepiColombo / Messenger' },
    { name: 'Venus', r: 58, size: 5.5, color: '#FCD34D', speed: 0.025, angle: 1.8, vel: '35.0 km/s', dist: '0.72 AU', mission: 'ISRO Shukrayaan Target' },
    { name: 'Earth', r: 84, size: 6.0, color: '#38BDF8', speed: 0.018, angle: 3.2, vel: '29.8 km/s', dist: '1.00 AU', mission: 'ISRO Gaganyaan & Aditya-L1' },
    { name: 'Mars', r: 114, size: 4.5, color: '#EF4444', speed: 0.012, angle: 4.5, vel: '24.1 km/s', dist: '1.52 AU', mission: 'ISRO Mangalyaan (MOM)' },
    { name: 'Jupiter', r: 148, size: 9.0, color: '#F97316', speed: 0.007, angle: 0.9, vel: '13.1 km/s', dist: '5.20 AU', mission: 'Europa Clipper / Juno' },
    { name: 'Saturn', r: 178, size: 8.0, color: '#EAB308', ring: true, speed: 0.004, angle: 2.4, vel: '9.7 km/s', dist: '9.58 AU', mission: 'Cassini-Huygens' }
  ];

  let selectedPlanet = planets[2]; // Default to Earth
  let time = 0;
  let isPaused = false;

  function updateInfo(p) {
    if (!infoBar) return;
    infoBar.innerHTML = `<strong style="color:#FFF">${p.name.toUpperCase()}</strong> · Orbit: ${p.dist} · Velocity: ${p.vel} · <span style="color:#FF4500">${p.mission}</span>`;
  }
  updateInfo(selectedPlanet);

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left - width / 2;
    const clickY = e.clientY - rect.top - height / 2;
    const clickDist = Math.sqrt(clickX * clickX + clickY * clickY);

    let closest = null;
    let minDiff = 18;

    planets.forEach(p => {
      const diff = Math.abs(clickDist - p.r);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    });

    if (closest) {
      selectedPlanet = closest;
      updateInfo(selectedPlanet);
    }
  });

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.clientWidth || 360;
    height = canvas.height = width;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    if (!isPaused) {
      time += 1;
    }

    // Sun at center
    const sunPulse = Math.sin(time * 0.05) * 1.5;
    const sunGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, 18 + sunPulse);
    sunGrad.addColorStop(0, '#FFFBEB');
    sunGrad.addColorStop(0.3, '#FBBF24');
    sunGrad.addColorStop(0.7, '#EA580C');
    sunGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');

    ctx.beginPath();
    ctx.arc(cx, cy, 18 + sunPulse, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#FDE047';
    ctx.fill();

    // Draw Orbits & Planets
    planets.forEach((p) => {
      // Orbit Ring
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = p === selectedPlanet ? 'rgba(0, 240, 255, 0.45)' : 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = p === selectedPlanet ? 1.5 : 1;
      ctx.stroke();

      // Current Planet Position
      const currentAngle = p.angle + (time * p.speed * 0.5);
      const px = cx + Math.cos(currentAngle) * p.r;
      const py = cy + Math.sin(currentAngle) * p.r;

      // Draw planet
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Saturn Rings
      if (p.ring) {
        ctx.beginPath();
        ctx.ellipse(px, py, p.size * 1.8, p.size * 0.6, currentAngle, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Selection Halo
      if (p === selectedPlanet) {
        ctx.beginPath();
        ctx.arc(px, py, p.size + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    requestAnimationFrame(render);
  }

  render();
})();
