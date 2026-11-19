// ==========================================================================
// MAIN CONTROLLER: Navigation, Telemetry Ticker, Theme Switcher & Transmissions
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Theme Engine
  const themeButtons = document.querySelectorAll('.theme-pill-btn');
  const savedTheme = localStorage.getItem('vaibhav-theme') || 'vyomanaut';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vaibhav-theme', theme);

    themeButtons.forEach(btn => {
      if (btn.getAttribute('data-set-theme') === theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const themeNames = {
      'vyomanaut': '🚀 VYOMANAUT (ISRO VERMILION)',
      'aurora': '🌌 DEEP AURORA (NEBULA VIOLET)',
      'lunar': '🌙 LUNAR TITANIUM (CHANDRA-3 GOLD)',
      'holo': '🛸 HOLO-TACTICAL (CYBERDECK HUD)'
    };

    if (window.showToast) {
      window.showToast(`AESTHETIC MATRIX UPDATED: ${themeNames[theme] || theme.toUpperCase()}`);
    }

    // Play subtle audio chirp
    playUIChirp();
  }

  // Audio chirp feedback using Web Audio API
  function playUIChirp() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  }

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-set-theme');
      applyTheme(theme);
    });
  });

  // Apply saved theme initially
  applyTheme(savedTheme);

  // Mobile Menu Toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.flexDirection = 'column';
        navLinks.style.background = 'var(--color-bg-primary)';
        navLinks.style.padding = '24px';
        navLinks.style.gap = '20px';
        navLinks.style.borderBottom = '1px solid var(--color-border)';
      }
    });
  }

  // Live Telemetry Clock & Ticker Time
  const timeEl = document.getElementById('live-utc-time');
  function updateTelemetryClock() {
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = now.toUTCString().replace('GMT', 'UTC');
    }
  }
  updateTelemetryClock();
  setInterval(updateTelemetryClock, 1000);

  // Toast HUD notification system
  const toast = document.getElementById('toast-hud');
  window.showToast = function(msg, duration = 3500) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  };

  // Transmission Form Submission
  const form = document.getElementById('transmission-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const callsign = document.getElementById('sender-callsign')?.value || 'Guest Observer';
      const submitBtn = form.querySelector('button[type="submit"]');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'TRANSMITTING VIA DEEP SPACE NETWORK...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'TRANSMISSION SENT ✓';
        }
        window.showToast(`📡 SIGNAL UPLINK CONFIRMED: Message logged from ${callsign}. Stored in Vaibhav's flight manifest!`);
        form.reset();
        setTimeout(() => {
          if (submitBtn) submitBtn.textContent = 'LAUNCH TRANSMISSION ➔';
        }, 3500);
      }, 1200);
    });
  }

  // Active Nav Link Spy
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
});
