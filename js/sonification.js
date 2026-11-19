// ==========================================================================
// COSMIC SONIFICATION STUDIO (Web Audio API Synthesizer)
// Transforms astronomical data into audible cosmic soundscapes
// ==========================================================================

(function() {
  let audioCtx = null;
  let masterGain = null;
  let analyser = null;
  let currentSource = null;
  let activePreset = null;
  let isPlaying = false;

  const canvas = document.getElementById('visualizer-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const statusEl = document.getElementById('visualizer-status-text');
  const navAudioBtn = document.getElementById('nav-audio-btn');

  function initAudio() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.4, audioCtx.currentTime);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  function stopCurrent() {
    if (currentSource) {
      if (currentSource.stop) {
        try { currentSource.stop(); } catch (e) {}
      }
      if (currentSource.interval) {
        clearInterval(currentSource.interval);
      }
      currentSource = null;
    }
    isPlaying = false;
    updateUIState();
  }

  // Preset 1: Pulsar Radio Pulse (PSR B1919+21 - 1.337 Hz pulse)
  function playPulsar() {
    initAudio();
    stopCurrent();

    const interval = setInterval(() => {
      if (!isPlaying || !audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.12);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    }, 748); // ~1.337 Hz

    currentSource = { interval };
    isPlaying = true;
    activePreset = 'pulsar';
    updateUIState('PSR B1919+21 PULSAR · 1.337 HZ INTERVAL');
  }

  // Preset 2: Black Hole Acoustic Echo (Perseus Galaxy Cluster)
  function playBlackHole() {
    initAudio();
    stopCurrent();

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(65.4, audioCtx.currentTime); // C2

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(65.9, audioCtx.currentTime); // Slight detune for acoustic beat

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, audioCtx.currentTime);
    filter.Q.setValueAtTime(4, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc1.start();
    osc2.start();

    currentSource = {
      stop: () => {
        osc1.stop();
        osc2.stop();
      }
    };
    isPlaying = true;
    activePreset = 'blackhole';
    updateUIState('PERSEUS BLACK HOLE ACOUSTIC RESONANCE · 57 OCTAVES UP');
  }

  // Preset 3: Solar Wind & Interstellar Shimmer
  function playSolarWind() {
    initAudio();
    stopCurrent();

    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(440, audioCtx.currentTime);
    filter.Q.setValueAtTime(8, audioCtx.currentTime);

    // LFO to sweep filter
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.25, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(280, audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    whiteNoise.start();
    lfo.start();

    currentSource = {
      stop: () => {
        whiteNoise.stop();
        lfo.stop();
      }
    };
    isPlaying = true;
    activePreset = 'solar';
    updateUIState('ADITYA-L1 SOLAR WIND & HELIOSPHERE STREAM');
  }

  // Preset 4: Chandra X-Ray Sonification
  function playChandra() {
    initAudio();
    stopCurrent();

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C Major pentatonic
    let noteIdx = 0;

    const interval = setInterval(() => {
      if (!isPlaying || !audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIdx % notes.length], now);
      noteIdx++;

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.46);
    }, 280);

    currentSource = { interval };
    isPlaying = true;
    activePreset = 'chandra';
    updateUIState('CHANDRA X-RAY TELESCOPE DATA SONIFICATION');
  }

  // Preset 5: Deep Space Ambient Drone
  function playAmbient() {
    initAudio();
    stopCurrent();

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(110, audioCtx.currentTime); // A2
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(164.81, audioCtx.currentTime); // E3

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);

    osc1.start();
    osc2.start();

    currentSource = {
      stop: () => {
        osc1.stop();
        osc2.stop();
      }
    };
    isPlaying = true;
    activePreset = 'ambient';
    updateUIState('DEEP SPACE AMBIENT DRIFT · 110 HZ ROOT');
  }

  function updateUIState(statusText) {
    if (statusEl && statusText) {
      statusEl.textContent = statusText;
    } else if (statusEl && !isPlaying) {
      statusEl.textContent = 'TELEMETRY AUDIO OFF · SELECT A PRESET';
    }

    if (navAudioBtn) {
      if (isPlaying) {
        navAudioBtn.classList.add('playing');
        navAudioBtn.querySelector('.audio-label').textContent = 'AUDIO: ON';
      } else {
        navAudioBtn.classList.remove('playing');
        navAudioBtn.querySelector('.audio-label').textContent = 'COSMIC AUDIO';
      }
    }

    // Update preset buttons
    document.querySelectorAll('.audio-track-btn').forEach(btn => {
      if (isPlaying && btn.getAttribute('data-preset') === activePreset) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Hook preset buttons
  document.querySelectorAll('.audio-track-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      if (isPlaying && activePreset === preset) {
        stopCurrent();
      } else {
        if (preset === 'pulsar') playPulsar();
        else if (preset === 'blackhole') playBlackHole();
        else if (preset === 'solar') playSolarWind();
        else if (preset === 'chandra') playChandra();
        else if (preset === 'ambient') playAmbient();
      }
    });
  });

  if (navAudioBtn) {
    navAudioBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopCurrent();
      } else {
        playAmbient();
      }
    });
  }

  // Visualizer Render Loop
  if (canvas && ctx) {
    function drawVisualizer() {
      requestAnimationFrame(drawVisualizer);

      const w = canvas.width = canvas.clientWidth || 300;
      const h = canvas.height = canvas.clientHeight || 160;

      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, w, h);

      if (!analyser || !isPlaying) {
        // Flat baseline with subtle idle noise
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        for (let x = 0; x < w; x += 4) {
          ctx.lineTo(x, h / 2 + Math.sin(x * 0.04 + Date.now() * 0.002) * 2);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (w / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * h * 0.85;

        const grad = ctx.createLinearGradient(0, h, 0, h - barHeight);
        grad.addColorStop(0, '#FF4500');
        grad.addColorStop(0.6, '#FF8C00');
        grad.addColorStop(1, '#00F0FF');

        ctx.fillStyle = grad;
        ctx.fillRect(x, h - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    }
    drawVisualizer();
  }

  // Expose global controller
  window.CosmicSonification = {
    playPulsar,
    playBlackHole,
    playSolarWind,
    playChandra,
    playAmbient,
    stopCurrent
  };
})();
