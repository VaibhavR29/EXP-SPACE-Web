// ==========================================================================
// GAGANYAAN LAUNCH TELEMETRY & FLIGHT SIMULATOR
// Simulates LVM3 / Gaganyaan orbital insertion sequence
// ==========================================================================

(function() {
  const startBtn = document.getElementById('sim-start-btn');
  const resetBtn = document.getElementById('sim-reset-btn');
  const altEl = document.getElementById('hud-val-alt');
  const velEl = document.getElementById('hud-val-vel');
  const gforceEl = document.getElementById('hud-val-gforce');
  const phaseEl = document.getElementById('hud-val-phase');
  const progressFill = document.getElementById('sim-progress-fill');

  if (!startBtn) return;

  let simTimer = null;
  let isSimulating = false;
  let missionTime = 0; // seconds

  const stages = [
    { t: 0, phase: 'PRE-LAUNCH CHECK', alt: 0, vel: 0, g: 1.0 },
    { t: 15, phase: 'S200 SOLID MOTORS IGNITION', alt: 2.4, vel: 240, g: 2.1 },
    { t: 60, phase: 'MAX-Q DYNAMIC PRESSURE', alt: 18.5, vel: 980, g: 2.8 },
    { t: 110, phase: 'L110 CORE STAGE IGNITION', alt: 48.0, vel: 1750, g: 2.2 },
    { t: 140, phase: 'S200 BOOSTERS SEPARATION', alt: 68.2, vel: 2320, g: 1.9 },
    { t: 240, phase: 'CREW ESCAPE TOWER JETTISON', alt: 115.0, vel: 3400, g: 2.5 },
    { t: 320, phase: 'C25 CRYOGENIC UPPER STAGE', alt: 172.0, vel: 4950, g: 3.1 },
    { t: 540, phase: 'ORBITAL INSERTION (400 KM LEO)', alt: 400.0, vel: 7820, g: 0.0 }
  ];

  function updateHUD(timeSec) {
    let currentStage = stages[0];
    let nextStage = stages[stages.length - 1];

    for (let i = 0; i < stages.length - 1; i++) {
      if (timeSec >= stages[i].t && timeSec <= stages[i+1].t) {
        currentStage = stages[i];
        nextStage = stages[i+1];
        break;
      }
    }

    if (timeSec >= 540) {
      currentStage = stages[stages.length - 1];
      nextStage = currentStage;
    }

    const stageSpan = Math.max(1, nextStage.t - currentStage.t);
    const stageProgress = Math.min(1, Math.max(0, (timeSec - currentStage.t) / stageSpan));

    const currentAlt = currentStage.alt + (nextStage.alt - currentStage.alt) * stageProgress;
    const currentVel = currentStage.vel + (nextStage.vel - currentStage.vel) * stageProgress;
    const currentG = currentStage.g + (nextStage.g - currentStage.g) * stageProgress;

    if (altEl) altEl.textContent = `${currentAlt.toFixed(1)} KM`;
    if (velEl) velEl.textContent = `${Math.round(currentVel).toLocaleString()} M/S`;
    if (gforceEl) gforceEl.textContent = `${currentG.toFixed(1)} G`;
    if (phaseEl) phaseEl.textContent = currentStage.phase;

    const totalPct = Math.min(100, (timeSec / 540) * 100);
    if (progressFill) progressFill.style.width = `${totalPct}%`;
  }

  function startLaunch() {
    if (isSimulating) return;
    isSimulating = true;
    startBtn.textContent = 'SIMULATING...';
    startBtn.disabled = true;

    simTimer = setInterval(() => {
      missionTime += 6; // accelerated time
      updateHUD(missionTime);

      if (missionTime >= 540) {
        clearInterval(simTimer);
        isSimulating = false;
        startBtn.textContent = 'ORBIT ACHIEVED ✓';
        if (phaseEl) phaseEl.textContent = 'GAGANYAAN ORBITAL INSERTION COMPLETE (400 KM)';
        if (window.showToast) {
          window.showToast('🚀 GAGANYAAN INSERTION NOMINAL: 400 KM CIRCULAR ORBIT AT 7.82 KM/S');
        }
      }
    }, 150);
  }

  function resetSim() {
    clearInterval(simTimer);
    isSimulating = false;
    missionTime = 0;
    startBtn.textContent = 'INITIATE LAUNCH SEQUENCE ➔';
    startBtn.disabled = false;
    updateHUD(0);
    if (phaseEl) phaseEl.textContent = 'STANDBY AT SRIHARIKOTA (SHAR)';
  }

  startBtn.addEventListener('click', startLaunch);
  if (resetBtn) resetBtn.addEventListener('click', resetSim);
})();
