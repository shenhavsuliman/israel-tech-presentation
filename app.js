/**
 * ============================================================================
 * מגן ישראל // בקר מצגת שקופיות אינטראקטיבי (app.js)
 * תמיכה מלאה בעברית, Three.js 3D Showcase, וסימולציות יירוט חיות
 * ============================================================================
 */

'use strict';

// ----------------------------------------------------------------------------
// 1. מצב המערכת הגלובלי (AppState)
// ----------------------------------------------------------------------------
const AppState = {
  currentSlide: 0,
  totalSlides: 6,
  slideNames: [
    'מערך ההגנה הרב-שכבתי',
    'כיפת ברזל (שכבה ראשונה)',
    'קלע דוד (שכבה שנייה)',
    'חץ 2 וחץ 3 (שכבות 3 ו-4)',
    'מגן אור (קרן ברזל)',
    'מבט לעתיד וסיכום'
  ]
};

// ----------------------------------------------------------------------------
// 2. תפיסת אלמנטים מה-DOM
// ----------------------------------------------------------------------------
const DOM = {
  slides: document.querySelectorAll('.slide'),
  btnPrev: document.getElementById('btn-prev-slide'),
  btnNext: document.getElementById('btn-next-slide'),
  stepIndicators: document.getElementById('step-indicators'),
  progressBar: document.getElementById('progress-bar'),
  currentSlideCounter: document.getElementById('current-slide-counter'),
  btnToggleFullscreen: document.getElementById('btn-toggle-fullscreen'),

  // שקופית 2: כיפת ברזל
  btnSalvoIronDome: document.getElementById('btn-salvo-iron-dome'),
  btnTogglePip: document.getElementById('btn-toggle-pip'),
  btnResetIronDome: document.getElementById('btn-reset-iron-dome'),

  // שקופית 3: קלע דוד
  btnFireStunner: document.getElementById('btn-fire-stunner'),
  btnToggleEcm: document.getElementById('btn-toggle-ecm'),
  ecmBtnText: document.getElementById('ecm-btn-text'),
  btnResetDavids: document.getElementById('btn-reset-davids'),

  // שקופית 4: חץ 3
  sliderApogee: document.getElementById('slider-apogee'),
  apogeeSliderVal: document.getElementById('apogee-slider-val'),
  btnFireArrow: document.getElementById('btn-fire-arrow'),
  btnResetArrow: document.getElementById('btn-reset-arrow'),

  // שקופית 5: מגן אור (לייזר)
  btnFireLaser: document.getElementById('btn-fire-laser'),
  btnResetLaser: document.getElementById('btn-reset-laser'),

  // שקופית 6: מקורות אקדמיים
  btnOpenCitations: document.getElementById('btn-open-citations'),
  modalCitations: document.getElementById('modal-citations'),
  btnCloseCitations: document.getElementById('btn-close-citations')
};

// ----------------------------------------------------------------------------
// 3. ניווט שקופיות חלק
// ----------------------------------------------------------------------------
function goToSlide(targetIndex) {
  if (targetIndex < 0 || targetIndex >= AppState.totalSlides) return;

  AppState.currentSlide = targetIndex;

  // עדכון שקופית פעילה
  DOM.slides.forEach((slide, idx) => {
    if (idx === targetIndex) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  // עדכון נקודות ניווט
  const dots = DOM.stepIndicators.querySelectorAll('.dot-btn');
  dots.forEach((dot, idx) => {
    if (idx === targetIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  // עדכון פס התקדמות
  const progressPercent = (targetIndex / (AppState.totalSlides - 1)) * 100;
  if (DOM.progressBar) {
    DOM.progressBar.style.width = `${progressPercent}%`;
  }

  // עדכון מונה שקופית
  if (DOM.currentSlideCounter) {
    DOM.currentSlideCounter.textContent = `שקופית ${targetIndex + 1} מתוך ${AppState.totalSlides}`;
  }

  // עדכון כפתורי הבא / קודם
  if (DOM.btnPrev) DOM.btnPrev.disabled = (targetIndex === 0);
  if (DOM.btnNext) DOM.btnNext.disabled = (targetIndex === AppState.totalSlides - 1);

  // הזנקת מנוע השקופית והזזת מצלמת 3D
  onSlideChanged(targetIndex);
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

function onSlideChanged(index) {
  switch (index) {
    case 0:
      // שקופית 1: מיצג פתיחה 3D במרכז המסך
      if (window.aegisThreeCamera) {
        window.aegisThreeCamera.position.set(0, 85, 150);
        window.aegisThreeCamera.lookAt(0, 20, 0);
      }
      break;
    case 1:
      // שקופית 2: כיפת ברזל
      initIronDomeSim();
      if (window.aegisThreeCamera) {
        window.aegisThreeCamera.position.set(45, 30, 75);
        window.aegisThreeCamera.lookAt(-15, 12, 0);
      }
      break;
    case 2:
      // שקופית 3: קלע דוד
      initDavidsSlingSim();
      if (window.aegisThreeCamera) {
        window.aegisThreeCamera.position.set(65, 55, 110);
        window.aegisThreeCamera.lookAt(-20, 20, 0);
      }
      break;
    case 3:
      // שקופית 4: חץ 3
      initArrowApogeeSim();
      if (window.aegisThreeCamera) {
        window.aegisThreeCamera.position.set(0, 150, 190);
        window.aegisThreeCamera.lookAt(-25, 35, 0);
      }
      break;
    case 4:
      // שקופית 5: מגן אור (לייזר)
      initLaserSim();
      if (window.aegisThreeCamera) {
        window.aegisThreeCamera.position.set(30, 25, 60);
        window.aegisThreeCamera.lookAt(-10, 8, 0);
      }
      break;
    case 5:
      // שקופית 6: סיכום
      if (window.aegisThreeCamera) {
        window.aegisThreeCamera.position.set(80, 80, 140);
        window.aegisThreeCamera.lookAt(-20, 25, 0);
      }
      break;
  }
}

// ----------------------------------------------------------------------------
// 4. שקופית 2: סימולטור כיפת ברזל (PIP)
// ----------------------------------------------------------------------------
let ironDomeAnimId = null;
let isPipActive = true;
let rockets = [];
let interceptors = [];
let particles = [];

function initIronDomeSim() {
  const canvas = document.getElementById('iron-dome-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (ironDomeAnimId) cancelAnimationFrame(ironDomeAnimId);
  renderIronDomeFrame(ctx, canvas.width, canvas.height);
}

function launchIronDomeSalvo() {
  const canvas = document.getElementById('iron-dome-canvas');
  if (!canvas) return;
  const width = canvas.width;
  const height = canvas.height;

  const urbanMinX = 420;
  const urbanMaxX = 640;

  for (let i = 0; i < 3; i++) {
    const startX = 40 + Math.random() * 60;
    const startY = height - 40;

    const targetsCity = (i === 0 || (i === 1 && Math.random() > 0.4));
    const targetX = targetsCity ? (urbanMinX + 20 + Math.random() * (urbanMaxX - urbanMinX - 40)) : (220 + Math.random() * 140);
    const targetY = height - 40;

    const apexX = (startX + targetX) / 2;
    const apexY = 40 + Math.random() * 50;

    rockets.push({
      id: Date.now() + i,
      startX, startY, targetX, targetY, apexX, apexY,
      progress: 0,
      speed: 0.0075 + Math.random() * 0.003,
      targetsCity,
      evaluated: false,
      alive: true
    });
  }

  startIronDomeLoop();
}

function startIronDomeLoop() {
  const canvas = document.getElementById('iron-dome-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (ironDomeAnimId) cancelAnimationFrame(ironDomeAnimId);

  const loop = () => {
    updateIronDomePhysics(canvas.width, canvas.height);
    renderIronDomeFrame(ctx, canvas.width, canvas.height);

    if (rockets.length > 0 || interceptors.length > 0 || particles.length > 0) {
      ironDomeAnimId = requestAnimationFrame(loop);
    }
  };
  ironDomeAnimId = requestAnimationFrame(loop);
}

function updateIronDomePhysics(width, height) {
  const batteryX = 540;
  const batteryY = height - 40;

  rockets.forEach(rocket => {
    if (!rocket.alive) return;
    rocket.progress += rocket.speed;

    const t = rocket.progress;
    rocket.currentX = (1 - t) * (1 - t) * rocket.startX + 2 * (1 - t) * t * rocket.apexX + t * t * rocket.targetX;
    rocket.currentY = (1 - t) * (1 - t) * rocket.startY + 2 * (1 - t) * t * rocket.apexY + t * t * rocket.targetY;

    if (t > 0.2 && !rocket.evaluated) {
      rocket.evaluated = true;
      if (rocket.targetsCity || !isPipActive) {
        interceptors.push({
          startX: batteryX,
          startY: batteryY,
          targetRocket: rocket,
          currentX: batteryX,
          currentY: batteryY,
          progress: 0,
          speed: 0.022
        });
      }
    }

    if (t >= 1) {
      rocket.alive = false;
      spawnExplosion(rocket.targetX, rocket.targetY, '#ffb700', 10);
    }
  });

  interceptors.forEach(interceptor => {
    interceptor.progress += interceptor.speed;
    const rocket = interceptor.targetRocket;

    if (rocket && rocket.alive) {
      interceptor.currentX += (rocket.currentX - interceptor.currentX) * 0.14;
      interceptor.currentY += (rocket.currentY - interceptor.currentY) * 0.14;

      const dist = Math.hypot(rocket.currentX - interceptor.currentX, rocket.currentY - interceptor.currentY);
      if (dist < 18) {
        rocket.alive = false;
        interceptor.done = true;
        spawnExplosion(rocket.currentX, rocket.currentY, '#00ff88', 25);
      }
    } else {
      interceptor.done = true;
    }
  });

  rockets = rockets.filter(r => r.alive);
  interceptors = interceptors.filter(i => !i.done);

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.025;
  });
  particles = particles.filter(p => p.alpha > 0);
}

function spawnExplosion(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      alpha: 1,
      size: 2 + Math.random() * 3
    });
  }
}

function renderIronDomeFrame(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);

  // רקע חצי-שקוף אלגנטי
  ctx.fillStyle = 'rgba(6, 10, 18, 0.40)';
  ctx.fillRect(0, 0, width, height);

  const groundY = height - 40;

  // שטח פתוח (משמאל)
  ctx.fillStyle = 'rgba(255, 183, 0, 0.08)';
  ctx.fillRect(180, groundY - 2, 200, 4);
  ctx.fillStyle = '#ffb700';
  ctx.font = '12px "Heebo", sans-serif';
  ctx.fillText('שטח פתוח (התעלמות)', 220, groundY + 24);

  // עיר מוגנת (מימין)
  ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
  ctx.fillRect(420, groundY - 55, 220, 55);
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(420, groundY - 55, 220, 55);

  ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.fillRect(440, groundY - 45, 28, 45);
  ctx.fillRect(478, groundY - 65, 36, 65);
  ctx.fillRect(525, groundY - 40, 24, 40);
  ctx.fillRect(590, groundY - 52, 38, 52);

  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 13px "Heebo", sans-serif';
  ctx.fillText('אזור עירוני מיושב (יירוט חובה)', 445, groundY + 24);

  // סוללה ומכ"ם
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(535, groundY - 14, 20, 14);
  ctx.beginPath();
  ctx.arc(545, groundY - 16, 7, Math.PI, 0);
  ctx.fill();

  // קו קרקע
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(width, groundY);
  ctx.stroke();

  // רקטות
  rockets.forEach(r => {
    ctx.strokeStyle = r.targetsCity ? '#ff3366' : '#ffb700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(r.startX, r.startY);
    ctx.quadraticCurveTo(r.apexX, r.apexY, r.currentX, r.currentY);
    ctx.stroke();

    ctx.fillStyle = r.targetsCity ? '#ff3366' : '#ffb700';
    ctx.beginPath();
    ctx.arc(r.currentX, r.currentY, 4, 0, Math.PI * 2);
    ctx.fill();

    if (r.evaluated) {
      ctx.font = '11px "Space Mono", monospace';
      ctx.fillStyle = r.targetsCity ? '#ff3366' : '#ffb700';
      ctx.fillText(r.targetsCity ? 'PIP: עיר!' : 'PIP: פתוח', r.currentX - 10, r.currentY - 10);
    }
  });

  // מיירטי טמי"ר
  interceptors.forEach(i => {
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(i.startX, i.startY);
    ctx.lineTo(i.currentX, i.currentY);
    ctx.stroke();

    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(i.currentX, i.currentY, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // חלקיקים
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

// ----------------------------------------------------------------------------
// 5. שקופית 3: קלע דוד וראש ביות כפול
// ----------------------------------------------------------------------------
let davidsAnimId = null;
let isJammingOn = false;
let stunnerLaunched = false;
let stunnerProgress = 0;

function initDavidsSlingSim() {
  const canvas = document.getElementById('davids-sling-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (davidsAnimId) cancelAnimationFrame(davidsAnimId);

  let angle = 0;
  const loop = () => {
    angle += 0.035;
    renderDavidsFrame(ctx, canvas.width, canvas.height, angle);
    davidsAnimId = requestAnimationFrame(loop);
  };
  davidsAnimId = requestAnimationFrame(loop);
}

function renderDavidsFrame(ctx, width, height, angle) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(6, 10, 18, 0.40)';
  ctx.fillRect(0, 0, width, height);

  const halfW = width / 2;

  // ערוץ ימין: IIR תרמי
  ctx.fillStyle = 'rgba(0, 255, 136, 0.05)';
  ctx.fillRect(halfW + 4, 10, halfW - 14, height - 20);
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.25)';
  ctx.strokeRect(halfW + 4, 10, halfW - 14, height - 20);

  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 12px "Heebo", sans-serif';
  ctx.fillText('ערוץ אופטי-תרמי (IIR) // חסין ל"א', halfW + 16, 32);

  // ערוץ שמאל: RF מכ"ם
  ctx.fillStyle = isJammingOn ? 'rgba(255, 51, 102, 0.08)' : 'rgba(0, 240, 255, 0.05)';
  ctx.fillRect(10, 10, halfW - 14, height - 20);
  ctx.strokeStyle = isJammingOn ? '#ff3366' : 'rgba(0, 240, 255, 0.25)';
  ctx.strokeRect(10, 10, halfW - 14, height - 20);

  ctx.fillStyle = isJammingOn ? '#ff3366' : '#00f0ff';
  ctx.font = 'bold 12px "Heebo", sans-serif';
  ctx.fillText(isJammingOn ? 'ערוץ מכ"ם RF // חסימה פעילה (רעש)!' : 'ערוץ מכ"ם RF // נעילה נקייה', 24, 32);

  const targetX = width * 0.72 + Math.cos(angle * 0.8) * 45;
  const targetY = height * 0.5 + Math.sin(angle * 1.5) * 45;

  if (isJammingOn) {
    ctx.strokeStyle = 'rgba(255, 51, 102, 0.4)';
    for (let i = 0; i < 20; i++) {
      const rx = 15 + Math.random() * (halfW - 30);
      const ry = 40 + Math.random() * (height - 60);
      ctx.beginPath();
      ctx.moveTo(rx - 8, ry);
      ctx.lineTo(rx + 8, ry);
      ctx.stroke();
    }
  }

  // חתימת חום של טיל השיוט
  ctx.fillStyle = '#ffb700';
  ctx.beginPath();
  ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(targetX, targetY, 15, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#00ff88';
  ctx.font = '11px "Space Mono", monospace';
  ctx.fillText('נעילה תרמית 100%', targetX + 18, targetY + 4);

  // סטאנר
  if (stunnerLaunched) {
    stunnerProgress += 0.022;
    const startX = halfW;
    const startY = height - 20;

    const curX = startX + (targetX - startX) * stunnerProgress;
    const curY = startY + (targetY - startY) * stunnerProgress;

    ctx.strokeStyle = '#ffb700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(curX, curY, 4, 0, Math.PI * 2);
    ctx.fill();

    if (stunnerProgress >= 1) {
      stunnerLaunched = false;
      stunnerProgress = 0;
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ----------------------------------------------------------------------------
// 6. שקופית 4: חץ 3 ואפוגיאה בחלל
// ----------------------------------------------------------------------------
let arrowTestActive = false;
let arrowTestT = 0;

function initArrowApogeeSim() {
  const canvas = document.getElementById('arrow-apogee-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const apogeeKm = parseInt(DOM.sliderApogee.value, 10);
  renderArrowFrame(ctx, canvas.width, canvas.height, apogeeKm);
}

function renderArrowFrame(ctx, width, height, apogeeKm) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(6, 10, 18, 0.40)';
  ctx.fillRect(0, 0, width, height);

  const groundY = height - 35;
  const maxKm = 160;

  const karmanY = groundY - (100 / maxKm) * (height - 60);
  const apogeeY = groundY - (apogeeKm / maxKm) * (height - 60);

  // הילת אטמוספירה
  const grad = ctx.createLinearGradient(0, groundY, 0, 0);
  grad.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
  grad.addColorStop(0.62, 'rgba(0, 240, 255, 0.02)');
  grad.addColorStop(1, 'rgba(4, 7, 14, 0.95)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, groundY);

  // קו קרמן (100 ק"מ)
  ctx.strokeStyle = '#ffb700';
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(20, karmanY);
  ctx.lineTo(width - 20, karmanY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#ffb700';
  ctx.font = 'bold 11px "Heebo", sans-serif';
  ctx.fillText('--- קו קרמן (100 ק"מ) // גבול החלל הבינלאומי ---', 30, karmanY - 8);

  // מסלול בליסטי
  ctx.strokeStyle = '#ff3366';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(60, groundY);
  ctx.quadraticCurveTo(width / 2, apogeeY - 35, width - 60, groundY);
  ctx.stroke();

  // נקודת אפוגיאה
  ctx.fillStyle = '#00f0ff';
  ctx.beginPath();
  ctx.arc(width / 2, apogeeY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Heebo", sans-serif';
  ctx.fillText(`אפוגיאה: ${apogeeKm} ק"מ ${apogeeKm >= 100 ? '(בחלל החיצון!)' : '(באטמוספירה)'}`, width / 2 + 12, apogeeY + 4);

  // שיגור KKV
  if (arrowTestActive) {
    arrowTestT += 0.016;
    const launchX = width - 90;
    const launchY = groundY;
    const targetX = width / 2;
    const targetY = apogeeY;

    const kkvX = launchX + (targetX - launchX) * arrowTestT;
    const kkvY = launchY + (targetY - launchY) * arrowTestT;

    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(launchX, launchY);
    ctx.lineTo(kkvX, kkvY);
    ctx.stroke();

    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(kkvX, kkvY, 5, 0, Math.PI * 2);
    ctx.fill();

    if (arrowTestT >= 1) {
      arrowTestActive = false;
      arrowTestT = 0;
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 25, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ----------------------------------------------------------------------------
// 7. שקופית 5: מגן אור (לייזר)
// ----------------------------------------------------------------------------
let laserAnimId = null;
let laserActive = false;
let drones = [];

function initLaserSim() {
  const canvas = document.getElementById('laser-demo-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  drones = [
    { x: 80, y: 80, alive: true, hp: 100 },
    { x: 140, y: 130, alive: true, hp: 100 },
    { x: 90, y: 180, alive: true, hp: 100 },
    { x: 160, y: 90, alive: true, hp: 100 }
  ];

  if (laserAnimId) cancelAnimationFrame(laserAnimId);
  renderLaserFrame(ctx, canvas.width, canvas.height);
}

function fireLaser() {
  laserActive = true;
  const canvas = document.getElementById('laser-demo-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let currentDroneIdx = 0;
  const interval = setInterval(() => {
    if (currentDroneIdx < drones.length) {
      drones[currentDroneIdx].alive = false;
      currentDroneIdx++;
      renderLaserFrame(ctx, canvas.width, canvas.height);
    } else {
      clearInterval(interval);
      laserActive = false;
      renderLaserFrame(ctx, canvas.width, canvas.height);
    }
  }, 400);
}

function renderLaserFrame(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(6, 10, 18, 0.40)';
  ctx.fillRect(0, 0, width, height);

  const emitterX = width - 60;
  const emitterY = height - 50;

  // פולט הלייזר
  ctx.fillStyle = '#ff4477';
  ctx.fillRect(emitterX - 15, emitterY - 15, 30, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = '11px "Heebo", sans-serif';
  ctx.fillText('תותח לייזר 100kW', emitterX - 50, emitterY + 25);

  // רחפנים
  drones.forEach((drone, idx) => {
    if (drone.alive) {
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(drone.x, drone.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px "Space Mono", monospace';
      ctx.fillText(`כטב"ם 0${idx + 1}`, drone.x - 15, drone.y - 12);
    } else {
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(drone.x, drone.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Space Mono", monospace';
      ctx.fillText('יורט!', drone.x - 10, drone.y - 12);
    }

    if (laserActive && !drone.alive) {
      // קרן לייזר באנרגיה גבוהה
      ctx.strokeStyle = '#ff4477';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff4477';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(emitterX, emitterY);
      ctx.lineTo(drone.x, drone.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  });
}

// ----------------------------------------------------------------------------
// 8. מנוע תלת-ממד Three.js (כיפות הגנה טקטיות מלאות)
// ----------------------------------------------------------------------------
function initThreeEngine() {
  const container = document.getElementById('three-canvas-target');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  window.aegisThreeCamera = camera;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // רשת קואורדינטות קרקעית
  const gridHelper = new THREE.GridHelper(280, 28, 0x00f0ff, 0x112233);
  gridHelper.position.y = -0.5;
  scene.add(gridHelper);

  // כיפת ברזל (שכבה ראשונה - ירוק)
  const ironGeo = new THREE.SphereGeometry(24, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2);
  const ironMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true, transparent: true, opacity: 0.45 });
  const ironDome = new THREE.Mesh(ironGeo, ironMat);
  scene.add(ironDome);

  // קלע דוד (שכבה שנייה - ענבר)
  const davidGeo = new THREE.SphereGeometry(56, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const davidMat = new THREE.MeshBasicMaterial({ color: 0xffb700, wireframe: true, transparent: true, opacity: 0.35 });
  const davidDome = new THREE.Mesh(davidGeo, davidMat);
  scene.add(davidDome);

  // חץ 2 וחץ 3 (שכבות עליונות ובחלל - ציאן עמוק)
  const arrowGeo = new THREE.SphereGeometry(110, 36, 22, 0, Math.PI * 2, 0, Math.PI / 2);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.28 });
  const arrowDome = new THREE.Mesh(arrowGeo, arrowMat);
  scene.add(arrowDome);

  // בקרת סיבוב עכבר OrbitControls
  let controls = null;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 40;
    controls.maxDistance = 350;
  }

  // מיקום מצלמה התחלתי לשקופית 1
  camera.position.set(0, 85, 150);
  camera.lookAt(0, 20, 0);

  // לולאת רינדור
  const animate = () => {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    ironDome.rotation.y += 0.001;
    davidDome.rotation.y -= 0.0008;
    arrowDome.rotation.y += 0.0005;
    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ----------------------------------------------------------------------------
// 9. מאזיני אירועים ומקלדת
// ----------------------------------------------------------------------------
function initEventListeners() {
  if (DOM.btnPrev) DOM.btnPrev.addEventListener('click', prevSlide);
  if (DOM.btnNext) DOM.btnNext.addEventListener('click', nextSlide);

  DOM.stepIndicators.querySelectorAll('.dot-btn').forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      goToSlide(idx);
    });
  });

  if (DOM.btnToggleFullscreen) {
    DOM.btnToggleFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    });
  }

  // שקופית 2
  if (DOM.btnSalvoIronDome) DOM.btnSalvoIronDome.addEventListener('click', launchIronDomeSalvo);
  if (DOM.btnTogglePip) {
    DOM.btnTogglePip.addEventListener('click', () => {
      isPipActive = !isPipActive;
      DOM.btnTogglePip.classList.toggle('active', isPipActive);
      DOM.btnTogglePip.querySelector('span').textContent = isPipActive ? 'סינון PIP: פעיל (סלקטיבי)' : 'סינון PIP: כבוי (יירוט הכל)';
    });
  }
  if (DOM.btnResetIronDome) {
    DOM.btnResetIronDome.addEventListener('click', () => {
      rockets = [];
      interceptors = [];
      particles = [];
      initIronDomeSim();
    });
  }

  // שקופית 3
  if (DOM.btnFireStunner) {
    DOM.btnFireStunner.addEventListener('click', () => {
      stunnerLaunched = true;
      stunnerProgress = 0;
    });
  }
  if (DOM.btnToggleEcm) {
    DOM.btnToggleEcm.addEventListener('click', () => {
      isJammingOn = !isJammingOn;
      DOM.btnToggleEcm.classList.toggle('active', isJammingOn);
      DOM.ecmBtnText.textContent = isJammingOn ? 'חסימת ל"א: פעילה (מוץ)' : 'חסימת ל"א: כבויה';
    });
  }
  if (DOM.btnResetDavids) {
    DOM.btnResetDavids.addEventListener('click', () => {
      isJammingOn = false;
      stunnerLaunched = false;
      DOM.btnToggleEcm.classList.remove('active');
      DOM.ecmBtnText.textContent = 'חסימת ל"א: כבויה';
    });
  }

  // שקופית 4
  if (DOM.sliderApogee) {
    DOM.sliderApogee.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      DOM.apogeeSliderVal.textContent = `${val} ק"מ ${val >= 100 ? '(בחלל מעל קו קרמן)' : '(באטמוספירה)'}`;
      initArrowApogeeSim();
    });
  }
  if (DOM.btnFireArrow) {
    DOM.btnFireArrow.addEventListener('click', () => {
      arrowTestActive = true;
      arrowTestT = 0;
      const canvas = document.getElementById('arrow-apogee-canvas');
      if (canvas) {
        const loop = () => {
          renderArrowFrame(canvas.getContext('2d'), canvas.width, canvas.height, parseInt(DOM.sliderApogee.value, 10));
          if (arrowTestActive) requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      }
    });
  }
  if (DOM.btnResetArrow) {
    DOM.btnResetArrow.addEventListener('click', () => {
      arrowTestActive = false;
      arrowTestT = 0;
      initArrowApogeeSim();
    });
  }

  // שקופית 5
  if (DOM.btnFireLaser) DOM.btnFireLaser.addEventListener('click', fireLaser);
  if (DOM.btnResetLaser) DOM.btnResetLaser.addEventListener('click', initLaserSim);

  // מודאל מקורות
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

  // מקלדת
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    switch (e.key) {
      case 'ArrowLeft':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowRight':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'f':
      case 'F':
      case 'כ':
        if (DOM.btnToggleFullscreen) DOM.btnToggleFullscreen.click();
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
}

// ----------------------------------------------------------------------------
// 10. הזנקת האפליקציה
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Aegis] מצגת ההגנה הרב-שכבתית בעברית נטענה.');
  initEventListeners();
  initThreeEngine();
  goToSlide(0);
});
