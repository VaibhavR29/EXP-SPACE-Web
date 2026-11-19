// ==========================================================================
// STARFIELD ENGINE: Twinkling Stars, Shooting Stars & Interactive Warp Field
// ==========================================================================

(function() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const stars = [];
  const numStars = Math.min(220, Math.floor((width * height) / 6000));
  const shootingStars = [];

  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  // Star generation
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      baseAlpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: 0.015 + Math.random() * 0.03,
      twinkleOffset: Math.random() * Math.PI * 2,
      depth: Math.random() * 1.5 + 0.5,
      hue: Math.random() > 0.85 ? (Math.random() > 0.5 ? 20 : 190) : 0 // warm orange or cool cyan or white
    });
  }

  function spawnShootingStar() {
    if (shootingStars.length < 2 && Math.random() < 0.012) {
      const startX = Math.random() * width;
      const startY = Math.random() * (height * 0.4);
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 8 + 10;
      shootingStars.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length: Math.random() * 70 + 40,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.015
      });
    }
  }

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  let time = 0;

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse parallax
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;
    const offsetX = (mouseX - width / 2) * 0.02;
    const offsetY = (mouseY - height / 2) * 0.02;

    time += 0.02;

    // Draw twinkling stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const currentAlpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed * 60 + s.twinkleOffset) * 0.35;
      const clampedAlpha = Math.max(0.1, Math.min(1.0, currentAlpha));

      const px = (s.x - offsetX * s.depth + width) % width;
      const py = (s.y - offsetY * s.depth + height) % height;

      ctx.beginPath();
      ctx.arc(px, py, s.size, 0, Math.PI * 2);

      if (s.hue === 20) {
        ctx.fillStyle = `rgba(255, 140, 60, ${clampedAlpha})`;
      } else if (s.hue === 190) {
        ctx.fillStyle = `rgba(100, 220, 255, ${clampedAlpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${clampedAlpha})`;
      }
      ctx.fill();

      // Soft glow for larger stars
      if (s.size > 1.4) {
        ctx.beginPath();
        ctx.arc(px, py, s.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = s.hue === 20 ? `rgba(255, 100, 40, ${clampedAlpha * 0.2})` : `rgba(255, 255, 255, ${clampedAlpha * 0.15})`;
        ctx.fill();
      }
    }

    // Shooting stars
    spawnShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      const tailX = ss.x - ss.dx * (ss.length / 10);
      const tailY = ss.y - ss.dy * (ss.length / 10);

      const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
      grad.addColorStop(0.3, `rgba(255, 120, 40, ${ss.life * 0.8})`);
      grad.addColorStop(1, 'rgba(255, 69, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ss.x += ss.dx;
      ss.y += ss.dy;
      ss.life -= ss.decay;

      if (ss.life <= 0 || ss.x > width || ss.y > height) {
        shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(render);
  }

  render();
})();
