/**
 * ============================================================================
 * AEGIS-ISR: DEFENSE-TECH PRESENTATION CONTROLLER
 * Module: app.js
 * Architecture: Vanilla ES6+ State Controller with Slide Lifecycle Hooks
 * ============================================================================
 */

'use strict';

// ----------------------------------------------------------------------------
// 1. Application State Store
// ----------------------------------------------------------------------------
const AppState = {
  currentSlide: 0,
  totalSlides: 6,
  viewMode: 'command', // 'command' | 'tactical'
  isAudioMuted: true,
  isFullscreen: false,
  radarActive: true,
  slideModules: [
    { id: 'slide-0', name: 'Strategic Doctrine', tier: 'all' },
    { id: 'slide-1', name: 'Tier 1: Iron Dome', tier: 'iron-dome' },
    { id: 'slide-2', name: 'Tier 2: David\'s Sling', tier: 'davids-sling' },
    { id: 'slide-3', name: 'Tiers 3/4: Arrow 2 & 3', tier: 'arrow' },
    { id: 'slide-4', name: 'Integrated C4I Matrix', tier: 'c4i' },
    { id: 'slide-5', name: 'Strategic Synthesis', tier: 'synthesis' }
  ]
};

// Threat Classification Dataset (Slide 1)
const THREAT_DATA = {
  vshorad: {
    radar: 'EL/M-2084 MMR (S-Band AESA)',
    velocity: '400–700 m/s (Mach 1.2–2.0)',
    altitude: '1,000–6,000 m (Troposphere)',
    window: '15 – 45 Seconds',
    allocation: 'TIER 1 // IRON DOME (TAMIR INTERCEPTOR)',
    colorClass: 'text-emerald'
  },
  uav: {
    radar: 'EL/M-2084 MMR + Electro-Optical Micro-Doppler',
    velocity: '50–150 m/s (Subsonic Mach 0.3)',
    altitude: '50–2,500 m (Low Terrain Hugging)',
    window: '60 – 180 Seconds',
    allocation: 'TIER 1 // IRON BEAM LASER / IRON DOME',
    colorClass: 'text-laser'
  },
  cruise: {
    radar: 'Airborne AEW&C + EL/M-2084 Multi-Sensor Fusion',
    velocity: '250–320 m/s (Mach 0.85 Subsonic Maneuvering)',
    altitude: '30–200 m (Radar Horizon Blindspot Penetration)',
    window: '45 – 90 Seconds',
    allocation: 'TIER 2 // DAVID\'S SLING (STUNNER DUAL-SEEKER)',
    colorClass: 'text-amber'
  },
  ballistic: {
    radar: 'EL/M-2080 Super Green Pine (>900 km AESA)',
    velocity: '2,500–4,200 m/s (Hypersonic Mach 8+)',
    altitude: '100–160+ km (Exo-Atmosphere / Low Earth Space)',
    window: '8 – 12 Minutes',
    allocation: 'TIERS 3 & 4 // ARROW 3 SPACE KKV / ARROW 2',
    colorClass: 'text-cyan'
  }
};

// ----------------------------------------------------------------------------
// 2. DOM Elements Cache
// ----------------------------------------------------------------------------
const DOM = {
  // Navigation
  btnPrev: document.getElementById('btn-prev-slide'),
  btnNext: document.getElementById('btn-next-slide'),
  stepIndicators: document.getElementById('step-indicators'),
  progressBar: document.getElementById('progress-bar'),
  slides: document.querySelectorAll('.slide'),
  
  // Header Telemetry & Buttons
  telemetrySlide: document.getElementById('telemetry-slide'),
  telemetryClock: document.getElementById('telemetry-clock'),
  telemetryRadar: document.getElementById('telemetry-radar'),
  btnToggleView: document.getElementById('btn-toggle-view'),
  btnViewText: document.getElementById('btn-view-text'),
  btnToggleAudio: document.getElementById('btn-toggle-audio'),
  audioIcon: document.getElementById('audio-icon'),
  btnToggleFullscreen: document.getElementById('btn-toggle-fullscreen'),

  // Slide 1 Threat Classifier
  threatButtons: document.querySelectorAll('.threat-btn'),
  threatRadar: document.getElementById('threat-radar'),
  threatVelocity: document.getElementById('threat-velocity'),
  threatAltitude: document.getElementById('threat-altitude'),
  threatWindow: document.getElementById('threat-window'),
  threatAllocation: document.getElementById('threat-allocation'),

  // Slide 2 Iron Dome Controls
  btnSalvoIronDome: document.getElementById('btn-salvo-iron-dome'),
  btnTogglePip: document.getElementById('btn-toggle-pip'),
  pipStatusText: document.getElementById('pip-status-text'),
  btnResetIronDome: document.getElementById('btn-reset-iron-dome'),
  statThreats: document.getElementById('stat-threats'),
  statIgnored: document.getElementById('stat-ignored'),
  statEngaged: document.getElementById('stat-engaged'),
  statNeutralized: document.getElementById('stat-neutralized'),

  // Slide 3 David's Sling Controls
  btnToggleEcm: document.getElementById('btn-toggle-ecm'),
  ecmStatusText: document.getElementById('ecm-status-text'),
  btnFireStunner: document.getElementById('btn-fire-stunner'),
  btnResetDavids: document.getElementById('btn-reset-davids'),
  statRfConfidence: document.getElementById('stat-rf-confidence'),
  statIirLock: document.getElementById('stat-iir-lock'),

  // Slide 4 Arrow Apogee Controls
  sliderApogee: document.getElementById('slider-apogee'),
  apogeeSliderVal: document.getElementById('apogee-slider-val'),
  arrowAssignedSystem: document.getElementById('arrow-assigned-system'),
  arrowKkvStatus: document.getElementById('arrow-kkv-status'),

  // Slide 5 C4I Controls
  btnSpawnScenario: document.getElementById('btn-spawn-scenario'),
  btnAutoAllocate: document.getElementById('btn-auto-allocate'),
  bmcStatusText: document.getElementById('bmc-status-text'),
  btnResetScenario: document.getElementById('btn-reset-scenario'),

  // Slide 6 Matrix Filter & Bibliography Modal
  matrixFilterButtons: document.querySelectorAll('.filter-btn'),
  matrixRows: document.querySelectorAll('#defense-matrix-table tbody tr'),
  btnOpenCitations: document.getElementById('btn-open-citations'),
  modalCitations: document.getElementById('modal-citations'),
  btnCloseCitations: document.getElementById('btn-close-citations')
};

// ----------------------------------------------------------------------------
// 3. Navigation State Machine
// ----------------------------------------------------------------------------

/**
 * Transitions application to a specific slide index with lifecycle hooks
 * @param {number} targetIndex - Zero-indexed slide index (0 to 5)
 */
function goToSlide(targetIndex) {
  if (targetIndex < 0 || targetIndex >= AppState.totalSlides) return;
  if (targetIndex === AppState.currentSlide && document.querySelector('.slide.active')) return;

  const prevIndex = AppState.currentSlide;

  // Unmount current slide lifecycle
  unmountSlide(prevIndex);

  // Update State
  AppState.currentSlide = targetIndex;

  // Update DOM Slide Elements
  DOM.slides.forEach((slide, idx) => {
    if (idx === targetIndex) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  // Update Step Indicator Dots
  const dots = DOM.stepIndicators.querySelectorAll('.step-dot');
  dots.forEach((dot, idx) => {
    if (idx === targetIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  // Update Progress Bar
  const progressPercent = (targetIndex / (AppState.totalSlides - 1)) * 100;
  if (DOM.progressBar) {
    DOM.progressBar.style.width = `${progressPercent}%`;
  }

  // Update Nav Button States
  if (DOM.btnPrev) DOM.btnPrev.disabled = (targetIndex === 0);
  if (DOM.btnNext) DOM.btnNext.disabled = (targetIndex === AppState.totalSlides - 1);

  // Update Header Telemetry
  if (DOM.telemetrySlide) {
    DOM.telemetrySlide.textContent = `0${targetIndex + 1} / 0${AppState.totalSlides}`;
  }

  // Mount new slide lifecycle
  mountSlide(targetIndex);
}

function nextSlide() {
  if (AppState.currentSlide < AppState.totalSlides - 1) {
    goToSlide(AppState.currentSlide + 1);
  }
}

function prevSlide() {
  if (AppState.currentSlide > 0) {
    goToSlide(AppState.currentSlide - 1);
  }
}

// ----------------------------------------------------------------------------
// 4. Slide Lifecycle Hooks & Modular Stubs
// ----------------------------------------------------------------------------

function mountSlide(index) {
  console.log(`[Aegis Controller] Mounting Module 0${index + 1}: ${AppState.slideModules[index].name}`);

  switch (index) {
    case 0:
      // Slide 1: Strategic Doctrine
      break;
    case 1:
      // Slide 2: Tier 1 Iron Dome
      initIronDomeSimStub();
      break;
    case 2:
      // Slide 3: Tier 2 David's Sling
      initDavidsSlingSimStub();
      break;
    case 3:
      // Slide 4: Tiers 3 & 4 Arrow 2/3
      initArrowApogeeSimStub();
      break;
    case 4:
      // Slide 5: Multi-Tier C4I Command Matrix
      initC4IScenarioSimStub();
      break;
    case 5:
      // Slide 6: Strategic Takeaways & Matrix
      break;
  }
}

function unmountSlide(index) {
  console.log(`[Aegis Controller] Unmounting Module 0${index + 1}`);
  // Hook for cancelling rAF loops and clearing canvas caches
}

// ----------------------------------------------------------------------------
// 5. Interactive Component Implementations & Stubs
// ----------------------------------------------------------------------------

/**
 * Slide 1: Threat Classifier Interaction
 */
function initThreatClassifier() {
  DOM.threatButtons.forEach(button => {
    button.addEventListener('click', () => {
      DOM.threatButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const threatKey = button.getAttribute('data-threat');
      const data = THREAT_DATA[threatKey];
      if (!data) return;

      DOM.threatRadar.textContent = data.radar;
      DOM.threatVelocity.textContent = data.velocity;
      DOM.threatAltitude.textContent = data.altitude;
      DOM.threatWindow.textContent = data.window;
      DOM.threatAllocation.textContent = data.allocation;
      DOM.threatAllocation.className = `alloc-value ${data.colorClass}`;
    });
  });
}

/**
 * Slide 2: Iron Dome Simulation Stub (Milestone 0 placeholder)
 */
function initIronDomeSimStub() {
  const canvas = document.getElementById('iron-dome-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Draw initial radar grid placeholder
  drawRadarGrid(ctx, canvas.width, canvas.height, 'IRON DOME // EL/M-2084 S-BAND AESA');
}

/**
 * Slide 3: David's Sling Simulation Stub (Milestone 0 placeholder)
 */
function initDavidsSlingSimStub() {
  const canvas = document.getElementById('davids-sling-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  drawRadarGrid(ctx, canvas.width, canvas.height, 'STUNNER // DUAL RF/IIR CORRELATION RADAR');
}

/**
 * Slide 4: Arrow 3 Apogee Simulation Stub (Milestone 0 placeholder)
 */
function initArrowApogeeSimStub() {
  const canvas = document.getElementById('arrow-apogee-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  drawApogeeProfile(ctx, canvas.width, canvas.height, parseInt(DOM.sliderApogee.value, 10));
}

/**
 * Slide 5: C4I Director Stub
 */
function initC4IScenarioSimStub() {
  console.log('[Aegis C4I] Multi-threat scenario manager ready.');
}

/**
 * Utility: Draw high-tech radar grid background on 2D canvas
 */
function drawRadarGrid(ctx, width, height, label) {
  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = '#06090e';
  ctx.fillRect(0, 0, width, height);

  // Subtle Coordinate Grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.lineWidth = 1;
  const step = 30;

  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Concentric Radar Rings
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
  const cx = width / 2;
  const cy = height * 0.85;

  [60, 120, 180, 240, 300].forEach(r => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
    ctx.stroke();
  });

  // Radar Baseline
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, cy);
  ctx.lineTo(width - 40, cy);
  ctx.stroke();

  // Label
  ctx.fillStyle = '#8892b0';
  ctx.font = '10px "Space Mono", monospace';
  ctx.fillText(label, 14, 20);
  ctx.fillStyle = '#00ff88';
  ctx.fillText('STATUS: RADAR STANDBY // AWAITING TARGET INGESTION', 14, 36);
}

/**
 * Utility: Draw Apogee Profile on Canvas
 */
function drawApogeeProfile(ctx, width, height, apogeeKm) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#06090e';
  ctx.fillRect(0, 0, width, height);

  // Altitude reference levels
  const groundY = height - 30;
  const karmanY = groundY - (100 / 160) * (height - 60);
  const apogeeY = groundY - (apogeeKm / 160) * (height - 60);

  // Atmosphere gradient
  const grad = ctx.createLinearGradient(0, groundY, 0, 0);
  grad.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
  grad.addColorStop(0.62, 'rgba(0, 240, 255, 0.03)');
  grad.addColorStop(1, 'rgba(6, 9, 14, 0.9)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, groundY);

  // Kármán Line (100 km)
  ctx.strokeStyle = 'rgba(255, 183, 0, 0.4)';
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(0, karmanY);
  ctx.lineTo(width, karmanY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#ffb700';
  ctx.font = '10px "Space Mono", monospace';
  ctx.fillText('--- KÁRMÁN LINE (100 KM) / BOUNDARY OF SPACE ---', 14, karmanY - 6);

  // Parabolic Ballistic Trajectory Curve
  ctx.strokeStyle = '#ff2a55';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, groundY);
  ctx.quadraticCurveTo(width / 2, apogeeY - 40, width - 50, groundY);
  ctx.stroke();

  // Apogee Marker
  ctx.fillStyle = '#00f0ff';
  ctx.beginPath();
  ctx.arc(width / 2, apogeeY, 5, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = '#e6f1ff';
  ctx.font = '11px "Rajdhani", sans-serif';
  ctx.fillText(`APOGEE: ${apogeeKm} KM`, width / 2 + 10, apogeeY + 4);
}

// ----------------------------------------------------------------------------
// 6. View Mode, Audio, and Fullscreen Handlers
// ----------------------------------------------------------------------------

function toggleViewMode() {
  if (AppState.viewMode === 'command') {
    AppState.viewMode = 'tactical';
    document.body.classList.remove('view-mode-command');
    document.body.classList.add('view-mode-tactical');
    DOM.btnViewText.textContent = 'COMMAND DECK';
  } else {
    AppState.viewMode = 'command';
    document.body.classList.remove('view-mode-tactical');
    document.body.classList.add('view-mode-command');
    DOM.btnViewText.textContent = 'TACTICAL 3D';
  }
  console.log(`[Aegis View Mode] Switched to: ${AppState.viewMode}`);
}

function toggleAudio() {
  AppState.isAudioMuted = !AppState.isAudioMuted;
  if (AppState.isAudioMuted) {
    DOM.audioIcon.textContent = '🔇';
    DOM.btnToggleAudio.classList.remove('active');
  } else {
    DOM.audioIcon.textContent = '🔊';
    DOM.btnToggleAudio.classList.add('active');
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// ----------------------------------------------------------------------------
// 7. Event Listeners & Hardware Keyboard Navigation
// ----------------------------------------------------------------------------

function initEventListeners() {
  // Navigation Buttons
  if (DOM.btnPrev) DOM.btnPrev.addEventListener('click', prevSlide);
  if (DOM.btnNext) DOM.btnNext.addEventListener('click', nextSlide);

  // Step Indicator Dots
  DOM.stepIndicators.querySelectorAll('.step-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const targetIdx = parseInt(dot.getAttribute('data-index'), 10);
      goToSlide(targetIdx);
    });
  });

  // Top Bar Controls
  if (DOM.btnToggleView) DOM.btnToggleView.addEventListener('click', toggleViewMode);
  if (DOM.btnToggleAudio) DOM.btnToggleAudio.addEventListener('click', toggleAudio);
  if (DOM.btnToggleFullscreen) DOM.btnToggleFullscreen.addEventListener('click', toggleFullscreen);

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ignore input if typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ': // Spacebar
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        prevSlide();
        break;
      case 't':
      case 'T':
        toggleViewMode();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'm':
      case 'M':
        toggleAudio();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
        goToSlide(parseInt(e.key, 10) - 1);
        break;
    }
  });

  // Touch Swipe Gesture Detection for Mobile / Tablet
  let touchStartX = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  // Slide 2: Iron Dome controls wiring
  if (DOM.btnSalvoIronDome) {
    DOM.btnSalvoIronDome.addEventListener('click', () => {
      DOM.statThreats.textContent = '3';
      DOM.statIgnored.textContent = '1';
      DOM.statEngaged.textContent = '2';
      DOM.statNeutralized.textContent = '2';
    });
  }

  if (DOM.btnTogglePip) {
    DOM.btnTogglePip.addEventListener('click', () => {
      DOM.btnTogglePip.classList.toggle('active');
      const isActive = DOM.btnTogglePip.classList.contains('active');
      DOM.pipStatusText.textContent = isActive ? 'ACTIVE (SELECTIVE)' : 'DISABLED (ENGAGE ALL)';
    });
  }

  if (DOM.btnResetIronDome) {
    DOM.btnResetIronDome.addEventListener('click', () => {
      DOM.statThreats.textContent = '0';
      DOM.statIgnored.textContent = '0';
      DOM.statEngaged.textContent = '0';
      DOM.statNeutralized.textContent = '0';
      initIronDomeSimStub();
    });
  }

  // Slide 3: David's Sling controls wiring
  if (DOM.btnToggleEcm) {
    DOM.btnToggleEcm.addEventListener('click', () => {
      DOM.btnToggleEcm.classList.toggle('active');
      const isJamming = DOM.btnToggleEcm.classList.contains('active');
      DOM.ecmStatusText.textContent = isJamming ? 'ON (ACTIVE JAMMING)' : 'OFF';
      DOM.statRfConfidence.textContent = isJamming ? '68% (DEGRADED)' : '98%';
      DOM.statIirLock.textContent = isJamming ? 'LOCKED (IIR OPTICAL OVERRIDE)' : 'CONFIRMED';
    });
  }

  if (DOM.btnResetDavids) {
    DOM.btnResetDavids.addEventListener('click', () => {
      DOM.btnToggleEcm.classList.remove('active');
      DOM.ecmStatusText.textContent = 'OFF';
      DOM.statRfConfidence.textContent = '98%';
      DOM.statIirLock.textContent = 'CONFIRMED';
      initDavidsSlingSimStub();
    });
  }

  // Slide 4: Arrow apogee slider wiring
  if (DOM.sliderApogee) {
    DOM.sliderApogee.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      DOM.apogeeSliderVal.textContent = `${val} KM ${val >= 100 ? '(EXO-SPACE)' : '(ATMOSPHERIC)'}`;
      if (val >= 100) {
        DOM.arrowAssignedSystem.textContent = 'ARROW 3 (SPACE KKV)';
        DOM.arrowKkvStatus.textContent = 'ARMED (TVC ACTIVE)';
      } else {
        DOM.arrowAssignedSystem.textContent = 'ARROW 2 (DIRECTIONAL FRAG)';
        DOM.arrowKkvStatus.textContent = 'STANDBY (ATMOSPHERIC)';
      }
      initArrowApogeeSimStub();
    });
  }

  // Slide 5: Scenario director wiring
  if (DOM.btnAutoAllocate) {
    DOM.btnAutoAllocate.addEventListener('click', () => {
      DOM.btnAutoAllocate.classList.toggle('active');
      const isAuto = DOM.btnAutoAllocate.classList.contains('active');
      DOM.bmcStatusText.textContent = isAuto ? 'ON' : 'MANUAL';
    });
  }

  // Slide 6: Matrix table filter wiring
  DOM.matrixFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.matrixFilterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      DOM.matrixRows.forEach(row => {
        if (filter === 'all' || row.getAttribute('data-tier') === filter) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // Bibliography Modal Open/Close
  if (DOM.btnOpenCitations) {
    DOM.btnOpenCitations.addEventListener('click', (e) => {
      e.preventDefault();
      DOM.modalCitations.classList.add('open');
      DOM.modalCitations.setAttribute('aria-hidden', 'false');
    });
  }

  if (DOM.btnCloseCitations) {
    DOM.btnCloseCitations.addEventListener('click', () => {
      DOM.modalCitations.classList.remove('open');
      DOM.modalCitations.setAttribute('aria-hidden', 'true');
    });
  }

  if (DOM.modalCitations) {
    DOM.modalCitations.addEventListener('click', (e) => {
      if (e.target === DOM.modalCitations) {
        DOM.modalCitations.classList.remove('open');
        DOM.modalCitations.setAttribute('aria-hidden', 'true');
      }
    });
  }
}

// ----------------------------------------------------------------------------
// 8. Live Clock Telemetry
// ----------------------------------------------------------------------------
function startClock() {
  const update = () => {
    const now = new Date();
    // Format Zulu / UTC+2
    const utcHours = String(now.getUTCHours() + 2).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    if (DOM.telemetryClock) {
      DOM.telemetryClock.textContent = `${utcHours}:${minutes}:${seconds} UTC+2`;
    }
  };
  update();
  setInterval(update, 1000);
}

// ----------------------------------------------------------------------------
// 9. Three.js Engine Modular Stub (Prepares container for Milestone 2)
// ----------------------------------------------------------------------------
function initThreeEngineStub() {
  console.log('[Aegis 3D] Three.js tactical WebGL engine stub ready for Milestone 2.');
}

// ----------------------------------------------------------------------------
// 10. Bootstrap Application
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Aegis Controller] Initializing Aegis Command Deck UI...');
  initEventListeners();
  initThreatClassifier();
  initThreeEngineStub();
  startClock();
  goToSlide(0);
  console.log('[Aegis Controller] System Online. Ready for operator interaction.');
});
