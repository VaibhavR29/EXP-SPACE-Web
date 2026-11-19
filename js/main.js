// ==========================================================================
// MAIN CONTROLLER: Navigation, Telemetry Ticker, Transmissions & Toast
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
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
        navLinks.style.background = 'rgba(5, 6, 8, 0.98)';
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
  window.showToast = function(msg, duration = 4000) {
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
