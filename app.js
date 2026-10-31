/**
 * ============================================================================
 * מגן ישראל // בקר מצגת שקופיות אינטראקטיבי (app.js)
 * תמיכה מלאה בעברית, Three.js 3D, וסימולציות יירוט חיות ב-Canvas
 * ============================================================================
 */

'use strict';

// ----------------------------------------------------------------------------
// 1. מצב המערכת הגלובלי (AppState)
// ----------------------------------------------------------------------------
const AppState = {
  currentSlide: 0,
  totalSlides: 6,
  is3DActive: false,
  slideNames: [
    'תפיסת ההגנה ומפת האיומים',
    'כיפת ברזל (שכבה ראשונה)',
    'קלע דוד (שכבה שנייה)',
    'חץ 2 וחץ 3 (שכבות 3 ו-4)',
    'מערך שו"ב ומגן אור',
    'סיכום ומקורות אקדמיים'
  ]
};

// נתוני סיווג איומים (שקופית 1)
const THREAT_DATA = {
  vshorad: {
    radar: 'EL/M-2084 MMR (מכ"ם בוהה AESA)',
    velocity: '400–700 מטר/שנייה (על-קולי)',
    altitude: '1,000–6,000 מטר (טרופוספירה)',
    window: '15 עד 45 שניות בלבד!',
    allocation: 'שכבה 1 // כיפת ברזל (טיל טמי"ר)',
    colorClass: 'text-emerald'
  },
  uav: {
    radar: 'מכ"ם EL/M-2084 בשילוב ערוץ אופטי מיקרו-דופלר',
    velocity: '50–150 מטר/שנייה (מאך 0.3 תת-קולי)',
    altitude: '50–2,500 מטר (טיסה מנמכת טוס עוקבת תוואי)',
    window: '60 עד 180 שניות',
    allocation: 'שכבה 1 // מגן אור (לייזר) / כיפת ברזל',
    colorClass: 'text-laser'
  },
  cruise: {
    radar: 'מכ"ם מוטס (בקרה אווירית) + שו"ב רב-חיישני',
    velocity: '250–320 מטר/שנייה (מאך 0.85 מתמרן)',
    altitude: '30–200 מטר (חדירה מתחת לאופק המכ"ם)',
    window: '45 עד 90 שניות',
    allocation: 'שכבה 2 // קלע דוד (מיירט סטאנר)',
    colorClass: 'text-amber'
  },
  ballistic: {
    radar: 'מכ"ם "אורן ירוק משופר" (>900 ק"מ גילוי)',
    velocity: '2,500–4,200 מטר/שנייה (היפר-סוני מאך 8+)',
    altitude: '100–160+ ק"מ (בחלל / מחוץ לאטמוספירה)',
    window: '8 עד 12 דקות בלבד!',
    allocation: 'שכבות 3 ו-4 // חץ 3 (רכב השמדה בחלל) / חץ 2',
    colorClass: 'text-cyan'
  }
};

// ----------------------------------------------------------------------------
// 2. תפיסת אלמנטים מה-DOM
// ----------------------------------------------------------------------------
const DOM = {
  // ניווט שקופיות
  slides: document.querySelectorAll('.slide'),
  btnPrev: document.getElementById('btn-prev-slide'),
  btnNext: document.getElementById('btn-next-slide'),
  stepIndicators: document.getElementById('step-indicators'),
  progressBar: document.getElementById('progress-bar'),
  currentSlideCounter: document.getElementById('current-slide-counter'),
  
  // פקדי סרגל עליון
  btnToggle3D: document.getElementById('btn-toggle-3d'),
  btnToggleFullscreen: document.getElementById('btn-toggle-fullscreen'),

  // שקופית 1: סיווג איומים
  threatButtons: document.querySelectorAll('.threat-select-btn'),
  threatRadar: document.getElementById('threat-radar'),
  threatVelocity: document.getElementById('threat-velocity'),
  threatAltitude: document.getElementById('threat-altitude'),
  threatWindow: document.getElementById('threat-window'),
  threatAllocation: document.getElementById('threat-allocation'),

  // שקופית 2: כיפת ברזל
  btnSalvoIronDome: document.getElementById('btn-salvo-iron-dome'),
  btnTogglePip: document.getElementById('btn-toggle-pip'),
  pipStatusText: document.getElementById('pip-status-text'),
  btnResetIronDome: document.getElementById('btn-reset-iron-dome'),
  statThreats: document.getElementById('stat-threats'),
  statIgnored: document.getElementById('stat-ignored'),
  statEngaged: document.getElementById('stat-engaged'),
  statNeutralized: document.getElementById('stat-neutralized'),

  // שקופית 3: קלע דוד
  btnToggleEcm: document.getElementById('btn-toggle-ecm'),
  ecmStatusText: document.getElementById('ecm-status-text'),
  btnFireStunner: document.getElementById('btn-fire-stunner'),
  btnResetDavids: document.getElementById('btn-reset-davids'),
  statRfConfidence: document.getElementById('stat-rf-confidence'),
  statIirLock: document.getElementById('stat-iir-lock'),

  // שקופית 4: חץ 3
  sliderApogee: document.getElementById('slider-apogee'),
  apogeeSliderVal: document.getElementById('apogee-slider-val'),
  btnFireArrow: document.getElementById('btn-fire-arrow'),
  btnResetArrow: document.getElementById('btn-reset-arrow'),
  arrowAssignedSystem: document.getElementById('arrow-assigned-system'),
  arrowKkvStatus: document.getElementById('arrow-kkv-status'),

  // שקופית 5: שו"ב וקרן ברזל
  btnSpawnScenario: document.getElementById('btn-spawn-scenario'),
  btnAutoAllocate: document.getElementById('btn-auto-allocate'),
  bmcStatusText: document.getElementById('bmc-status-text'),
  btnResetScenario: document.getElementById('btn-reset-scenario'),

  // שקופית 6: מטריצה ומקורות
  matrixFilterButtons: document.querySelectorAll('.filter-tab-btn'),
  matrixRows: document.querySelectorAll('#defense-matrix-table tbody tr'),
  btnOpenCitations: document.getElementById('btn-open-citations'),
  modalCitations: document.getElementById('modal-citations'),
  btnCloseCitations: document.getElementById('btn-close-citations')
};

// ----------------------------------------------------------------------------
// 3. ניווט שקופיות חלק ונוח למרצה
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

  // עדכון פס התקדמות עליון
  const progressPercent = (targetIndex / (AppState.totalSlides - 1)) * 100;
  if (DOM.progressBar) {
    DOM.progressBar.style.width = `${progressPercent}%`;
  }

  // עדכון מונה שקופית בעברית
  if (DOM.currentSlideCounter) {
    DOM.currentSlideCounter.textContent = `שקופית ${targetIndex + 1} מתוך ${AppState.totalSlides}`;
  }

  // עדכון כפתורי הבא / קודם
  if (DOM.btnPrev) DOM.btnPrev.disabled = (targetIndex === 0);
  if (DOM.btnNext) DOM.btnNext.disabled = (targetIndex === AppState.totalSlides - 1);

  // הזנקת מנוע השקופית הספציפית
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
  // הפעלת סימולציות ייעודיות לכל שקופית
  switch (index) {
    case 1:
      initIronDomeSim();
      break;
    case 2:
      initDavidsSlingSim();
      break;
    case 3:
      initArrowApogeeSim();
      break;
  }

  // עדכון זווית מצלמה ב-Three.js בהתאם לשכבה
  if (window.aegisThreeCamera) {
    switch (index) {
      case 1: // כיפת ברזל (מבט נמוך)
        setCameraPreset('horizon');
        break;
      case 2: // קלע דוד (מבט ביניים)
        setCameraPreset('overlook');
        break;
      case 3: // חץ 3 (מבט חלל)
        setCameraPreset('orbital');
        break;
      default:
        setCameraPreset('overlook');
        break;
    }
  }
}

// ----------------------------------------------------------------------------
// 4. שקופית 1: סיווג איומים
// ----------------------------------------------------------------------------
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
      DOM.threatAllocation.className = `alloc-name ${data.colorClass}`;
    });
  });
}

// ----------------------------------------------------------------------------
// 5. שקופית 2: סימולטור כיפת ברזל ואלגוריתם שטח פתוח (PIP)
// ----------------------------------------------------------------------------
let ironDomeAnimId = null;
let ironDomeSimState = {
  isPipActive: true,
  rockets: [],
  interceptors: [],
  particles: [],
  threatsCount: 0,
  ignoredCount: 0,
  engagedCount: 0,
  neutralizedCount: 0
};

function initIronDomeSim() {
  const canvas = document.getElementById('iron-dome-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (ironDomeAnimId) cancelAnimationFrame(ironDomeAnimId);

  // ציור ראשוני
  renderIronDomeFrame(ctx, canvas.width, canvas.height);
}

function launchIronDomeSalvo() {
  const canvas = document.getElementById('iron-dome-canvas');
  if (!canvas) return;
  const width = canvas.width;
  const height = canvas.height;

  // שטח עירוני מיושב: בין 360 ל-560 פיקסלים
  const urbanMinX = 360;
  const urbanMaxX = 560;

  // יצירת 3 רקטות במטח
  for (let i = 0; i < 3; i++) {
    const startX = 40 + Math.random() * 50;
    const startY = height - 40;
    
    // קביעה האם הרקטה תפגע בעיר או בשטח פתוח
    const targetsCity = (i === 0 || (i === 1 && Math.random() > 0.4));
    const targetX = targetsCity ? (urbanMinX + 20 + Math.random() * (urbanMaxX - urbanMinX - 40)) : (200 + Math.random() * 120);
    const targetY = height - 40;

    const apexX = (startX + targetX) / 2;
    const apexY = 40 + Math.random() * 50;

    const rocket = {
      id: Date.now() + i,
      startX, startY, targetX, targetY, apexX, apexY,
      progress: 0,
      speed: 0.007 + Math.random() * 0.003,
      targetsCity,
      evaluated: false,
      engaged: false,
      alive: true
    };

    ironDomeSimState.rockets.push(rocket);
    ironDomeSimState.threatsCount++;
  }

  updateIronDomeDOMStats();
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

    if (ironDomeSimState.rockets.length > 0 || ironDomeSimState.interceptors.length > 0 || ironDomeSimState.particles.length > 0) {
      ironDomeAnimId = requestAnimationFrame(loop);
    }
  };

  ironDomeAnimId = requestAnimationFrame(loop);
}

function updateIronDomePhysics(width, height) {
  const batteryX = 480;
  const batteryY = height - 40;

  // עדכון רקטות
  ironDomeSimState.rockets.forEach(rocket => {
    if (!rocket.alive) return;
    rocket.progress += rocket.speed;

    // חישוב נקודת מסלול בליסטי
    const t = rocket.progress;
    rocket.currentX = (1 - t) * (1 - t) * rocket.startX + 2 * (1 - t) * t * rocket.apexX + t * t * rocket.targetX;
    rocket.currentY = (1 - t) * (1 - t) * rocket.startY + 2 * (1 - t) * t * rocket.apexY + t * t * rocket.targetY;

    // אלגוריתם ה-PIP מחליט תוך 20% מהמסלול
    if (t > 0.2 && !rocket.evaluated) {
      rocket.evaluated = true;
      if (rocket.targetsCity) {
        // מטרה מאיימת על עיר: מיירטים
        rocket.engaged = true;
        ironDomeSimState.engagedCount++;
        // שיגור טמי"ר
        ironDomeSimState.interceptors.push({
          startX: batteryX,
          startY: batteryY,
          targetRocket: rocket,
          currentX: batteryX,
          currentY: batteryY,
          progress: 0,
          speed: 0.02
        });
      } else {
        // מטרה בשטח פתוח: התעלמות
        if (ironDomeSimState.isPipActive) {
          ironDomeSimState.ignoredCount++;
        } else {
          // סינון כבוי: יורים על הכל
          rocket.engaged = true;
          ironDomeSimState.engagedCount++;
          ironDomeSimState.interceptors.push({
            startX: batteryX,
            startY: batteryY,
            targetRocket: rocket,
            currentX: batteryX,
            currentY: batteryY,
            progress: 0,
            speed: 0.02
          });
        }
      }
      updateIronDomeDOMStats();
    }

    // פגיעה בקרקע אם לא יורטה
    if (t >= 1) {
      rocket.alive = false;
      spawnExplosionParticles(rocket.targetX, rocket.targetY, '#ffb700', 12);
    }
  });

  // עדכון מיירטי טמי"ר
  ironDomeSimState.interceptors.forEach(interceptor => {
    interceptor.progress += interceptor.speed;
    const rocket = interceptor.targetRocket;

    if (rocket && rocket.alive) {
      interceptor.currentX += (rocket.currentX - interceptor.currentX) * 0.12;
      interceptor.currentY += (rocket.currentY - interceptor.currentY) * 0.12;

      // מרחק ליירוט קרבה
      const dist = Math.hypot(rocket.currentX - interceptor.currentX, rocket.currentY - interceptor.currentY);
      if (dist < 18) {
        rocket.alive = false;
        interceptor.done = true;
        ironDomeSimState.neutralizedCount++;
        updateIronDomeDOMStats();
        spawnExplosionParticles(rocket.currentX, rocket.currentY, '#00ff88', 25);
      }
    } else {
      interceptor.done = true;
    }
  });

  // סינון רכיבים שהסתיימו
  ironDomeSimState.rockets = ironDomeSimState.rockets.filter(r => r.alive);
  ironDomeSimState.interceptors = ironDomeSimState.interceptors.filter(i => !i.done);

  // עדכון חלקיקי פיצוץ
  ironDomeSimState.particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.025;
  });
  ironDomeSimState.particles = ironDomeSimState.particles.filter(p => p.alpha > 0);
}

function spawnExplosionParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    ironDomeSimState.particles.push({
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

  // רקע שחור עמוק
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, width, height);

  const groundY = height - 40;

  // ציור שטח פתוח (משמאל)
  ctx.fillStyle = 'rgba(255, 183, 0, 0.06)';
  ctx.fillRect(160, groundY - 2, 180, 4);
  ctx.fillStyle = '#ffb700';
  ctx.font = '11px "Heebo", sans-serif';
  ctx.fillText('שטח פתוח / דיונות (התעלמות)', 180, groundY + 22);

  // ציור אזור עירוני מוגן (מימין)
  ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
  ctx.fillRect(360, groundY - 50, 200, 50);
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(360, groundY - 50, 200, 50);

  // צלליות בניינים
  ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.fillRect(380, groundY - 40, 24, 40);
  ctx.fillRect(410, groundY - 60, 30, 60);
  ctx.fillRect(445, groundY - 35, 20, 35);
  ctx.fillRect(510, groundY - 48, 35, 48);

  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 12px "Heebo", sans-serif';
  ctx.fillText('פוליגון עירוני מיושב (יירוט חובה)', 380, groundY + 22);

  // סוללת כיפת ברזל ומכ"ם
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(475, groundY - 14, 20, 14);
  ctx.beginPath();
  ctx.arc(485, groundY - 16, 7, Math.PI, 0);
  ctx.fill();
  ctx.font = '11px "Heebo", sans-serif';
  ctx.fillText('סוללת טמי"ר', 465, groundY - 26);

  // קו קרקע
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(width, groundY);
  ctx.stroke();

  // ציור רקטות
  ironDomeSimState.rockets.forEach(r => {
    ctx.strokeStyle = r.targetsCity ? '#ff3366' : '#ffb700';
    ctx.lineWidth = 2;

    // ציור קו מסלול
    ctx.beginPath();
    ctx.moveTo(r.startX, r.startY);
    ctx.quadraticCurveTo(r.apexX, r.apexY, r.currentX, r.currentY);
    ctx.stroke();

    // ראש רקטה
    ctx.fillStyle = r.targetsCity ? '#ff3366' : '#ffb700';
    ctx.beginPath();
    ctx.arc(r.currentX, r.currentY, 4, 0, Math.PI * 2);
    ctx.fill();

    // תגית PIP
    if (r.evaluated) {
      ctx.font = '10px "Space Mono", monospace';
      if (r.targetsCity) {
        ctx.fillStyle = '#ff3366';
        ctx.fillText('PIP: עיר!', r.currentX - 10, r.currentY - 10);
      } else {
        ctx.fillStyle = '#ffb700';
        ctx.fillText('PIP: פתוח', r.currentX - 10, r.currentY - 10);
      }
    }
  });

  // ציור מיירטי טמי"ר
  ironDomeSimState.interceptors.forEach(i => {
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

  // ציור חלקיקי פיצוץ
  ironDomeSimState.particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function updateIronDomeDOMStats() {
  if (DOM.statThreats) DOM.statThreats.textContent = ironDomeSimState.threatsCount;
  if (DOM.statIgnored) DOM.statIgnored.textContent = ironDomeSimState.ignoredCount;
  if (DOM.statEngaged) DOM.statEngaged.textContent = ironDomeSimState.engagedCount;
  if (DOM.statNeutralized) DOM.statNeutralized.textContent = ironDomeSimState.neutralizedCount;
}

// ----------------------------------------------------------------------------
// 6. שקופית 3: קלע דוד וראש ביות כפול RF + IIR
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
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, width, height);

  // חלוקת תצוגה לשני מסכי מכ"ם (ימין = אופטי IIR, שמאל = מכ"ם RF)
  const halfW = width / 2;

  // ערוץ ימין: IIR (אופטי תרמי)
  ctx.fillStyle = 'rgba(0, 255, 136, 0.04)';
  ctx.fillRect(halfW + 4, 10, halfW - 14, height - 20);
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
  ctx.strokeRect(halfW + 4, 10, halfW - 14, height - 20);

  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 12px "Heebo", sans-serif';
  ctx.fillText('ערוץ אופטי תרמי (IIR) // חסין ל"א', halfW + 16, 32);

  // ערוץ שמאל: RF (מכ"ם)
  ctx.fillStyle = isJammingOn ? 'rgba(255, 51, 102, 0.08)' : 'rgba(0, 240, 255, 0.04)';
  ctx.fillRect(10, 10, halfW - 14, height - 20);
  ctx.strokeStyle = isJammingOn ? '#ff3366' : 'rgba(0, 240, 255, 0.2)';
  ctx.strokeRect(10, 10, halfW - 14, height - 20);

  ctx.fillStyle = isJammingOn ? '#ff3366' : '#00f0ff';
  ctx.font = 'bold 12px "Heebo", sans-serif';
  ctx.fillText(isJammingOn ? 'ערוץ מכ"ם RF // חסימה פעילה (רעש)!' : 'ערוץ מכ"ם RF // נעילה נקייה', 24, 32);

  // חישוב מיקום טיל שיוט מתמרן (תנועת סינוס עוקבת גובה)
  const targetX = width * 0.7 + Math.cos(angle * 0.8) * 45;
  const targetY = height * 0.5 + Math.sin(angle * 1.5) * 40;

  // ציור רעש ל"א בערוץ המכ"ם אם חסימה דולקת
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

  // ציור המטרה בערוץ תרמי IIR (חתימת חום ברורה של המנוע)
  ctx.fillStyle = '#ffb700';
  ctx.beginPath();
  ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(targetX, targetY, 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#00ff88';
  ctx.font = '10px "Space Mono", monospace';
  ctx.fillText('נעילה תרמית 100%', targetX + 16, targetY + 4);

  // שיגור מיירט סטאנר (Hit-to-Kill)
  if (stunnerLaunched) {
    stunnerProgress += 0.02;
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
      // פגיעה קינטית מוצלחת
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ----------------------------------------------------------------------------
// 7. שקופית 4: חץ 3 ואפוגיאה בחלל
// ----------------------------------------------------------------------------
let arrowAnimId = null;
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
  ctx.fillStyle = '#04070e';
  ctx.fillRect(0, 0, width, height);

  const groundY = height - 35;
  const maxKm = 160;

  // שכבות אטמוספירה וחלל
  const karmanY = groundY - (100 / maxKm) * (height - 60);
  const apogeeY = groundY - (apogeeKm / maxKm) * (height - 60);

  // הילת אטמוספירה כחולה
  const grad = ctx.createLinearGradient(0, groundY, 0, 0);
  grad.addColorStop(0, 'rgba(0, 240, 255, 0.16)');
  grad.addColorStop(0.62, 'rgba(0, 240, 255, 0.02)');
  grad.addColorStop(1, 'rgba(4, 7, 14, 0.95)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, groundY);

  // קו קרמן (גבול החלל - 100 ק"מ)
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

  // מסלול בליסטי פרבולי של הטיל התוקף
  ctx.strokeStyle = '#ff3366';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(50, groundY);
  ctx.quadraticCurveTo(width / 2, apogeeY - 35, width - 50, groundY);
  ctx.stroke();

  // נקודת שיא המסלול (אפוגיאה)
  ctx.fillStyle = '#00f0ff';
  ctx.beginPath();
  ctx.arc(width / 2, apogeeY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Heebo", sans-serif';
  ctx.fillText(`אפוגיאה: ${apogeeKm} ק"מ ${apogeeKm >= 100 ? '(בחלל החיצון!)' : '(באטמוספירה)'}`, width / 2 + 12, apogeeY + 4);

  // סימולציית שיגור חץ 3 בחלל
  if (arrowTestActive) {
    arrowTestT += 0.015;
    const launchX = width - 80;
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

    ctx.fillStyle = '#00ff88';
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillText('חץ 3 KKV', kkvX + 8, kkvY - 4);

    if (arrowTestT >= 1) {
      arrowTestActive = false;
      arrowTestT = 0;
      // פגיעה קינטית מוצלחת
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 25, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ----------------------------------------------------------------------------
// 8. מנוע תלת-ממד Three.js (כיפות הגנה טקטיות)
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
  const gridHelper = new THREE.GridHelper(260, 26, 0x00f0ff, 0x112233);
  gridHelper.position.y = -0.5;
  scene.add(gridHelper);

  // כיפת ברזל (שכבה ראשונה - ירוק)
  const ironGeo = new THREE.SphereGeometry(22, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const ironMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true, transparent: true, opacity: 0.35 });
  const ironDome = new THREE.Mesh(ironGeo, ironMat);
  scene.add(ironDome);

  // קלע דוד (שכבה שנייה - ענבר)
  const davidGeo = new THREE.SphereGeometry(52, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2);
  const davidMat = new THREE.MeshBasicMaterial({ color: 0xffb700, wireframe: true, transparent: true, opacity: 0.28 });
  const davidDome = new THREE.Mesh(davidGeo, davidMat);
  scene.add(davidDome);

  // חץ 2 וחץ 3 (שכבה שלישית ורביעית - ציאן עמוק בחלל)
  const arrowGeo = new THREE.SphereGeometry(105, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.22 });
  const arrowDome = new THREE.Mesh(arrowGeo, arrowMat);
  scene.add(arrowDome);

  // הגדרת בקרת סיבוב עכבר OrbitControls אם זמינה
  let controls = null;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // מניעת ירידה מתחת לקרקע
    controls.minDistance = 40;
    controls.maxDistance = 350;
  }

  // מיקום מצלמה התחלתי
  camera.position.set(90, 80, 120);
  camera.lookAt(0, 15, 0);

  // לולאת רינדור 60 FPS
  const animate = () => {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    ironDome.rotation.y += 0.001;
    davidDome.rotation.y -= 0.0008;
    arrowDome.rotation.y += 0.0005;
    renderer.render(scene, camera);
  };
  animate();

  // התאמת גודל חלון
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function setCameraPreset(preset) {
  if (!window.aegisThreeCamera) return;
  const camera = window.aegisThreeCamera;

  switch (preset) {
    case 'overlook':
      camera.position.set(90, 80, 120);
      camera.lookAt(0, 15, 0);
      break;
    case 'horizon':
      camera.position.set(35, 16, 45);
      camera.lookAt(0, 10, 0);
      break;
    case 'orbital':
      camera.position.set(0, 150, 180);
      camera.lookAt(0, 30, 0);
      break;
    case 'reset':
      camera.position.set(90, 80, 120);
      camera.lookAt(0, 15, 0);
      break;
  }
}

// ----------------------------------------------------------------------------
// 9. האזנה לאירועים ומקלדת
// ----------------------------------------------------------------------------
function initEventListeners() {
  // ניווט שקופיות בכפתורים
  if (DOM.btnPrev) DOM.btnPrev.addEventListener('click', prevSlide);
  if (DOM.btnNext) DOM.btnNext.addEventListener('click', nextSlide);

  // נקודות ניווט ישיר
  DOM.stepIndicators.querySelectorAll('.dot-btn').forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      goToSlide(idx);
    });
  });

  // החלפת תצוגת 3D
  if (DOM.btnToggle3D) {
    DOM.btnToggle3D.addEventListener('click', () => {
      AppState.is3DActive = !AppState.is3DActive;
      document.body.classList.toggle('view-3d-active', AppState.is3DActive);
    });
  }

  // מסך מלא
  if (DOM.btnToggleFullscreen) {
    DOM.btnToggleFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    });
  }

  // שקופית 2: בקרי כיפת ברזל
  if (DOM.btnSalvoIronDome) DOM.btnSalvoIronDome.addEventListener('click', launchIronDomeSalvo);
  if (DOM.btnTogglePip) {
    DOM.btnTogglePip.addEventListener('click', () => {
      ironDomeSimState.isPipActive = !ironDomeSimState.isPipActive;
      DOM.btnTogglePip.classList.toggle('active', ironDomeSimState.isPipActive);
      DOM.pipStatusText.textContent = ironDomeSimState.isPipActive ? 'פעיל (סלקטיבי)' : 'כבוי (יירוט הכל)';
    });
  }
  if (DOM.btnResetIronDome) {
    DOM.btnResetIronDome.addEventListener('click', () => {
      ironDomeSimState.rockets = [];
      ironDomeSimState.interceptors = [];
      ironDomeSimState.particles = [];
      ironDomeSimState.threatsCount = 0;
      ironDomeSimState.ignoredCount = 0;
      ironDomeSimState.engagedCount = 0;
      ironDomeSimState.neutralizedCount = 0;
      updateIronDomeDOMStats();
      initIronDomeSim();
    });
  }

  // שקופית 3: בקרי קלע דוד
  if (DOM.btnToggleEcm) {
    DOM.btnToggleEcm.addEventListener('click', () => {
      isJammingOn = !isJammingOn;
      DOM.btnToggleEcm.classList.toggle('active', isJammingOn);
      DOM.ecmStatusText.textContent = isJammingOn ? 'פעילה (ל"א ומוץ)' : 'כבויה';
      DOM.statRfConfidence.textContent = isJammingOn ? '45% (משובש!)' : '98%';
      DOM.statIirLock.textContent = isJammingOn ? 'נעול (מעקף אופטי)' : 'נעול (100%)';
    });
  }
  if (DOM.btnFireStunner) {
    DOM.btnFireStunner.addEventListener('click', () => {
      stunnerLaunched = true;
      stunnerProgress = 0;
    });
  }
  if (DOM.btnResetDavids) {
    DOM.btnResetDavids.addEventListener('click', () => {
      isJammingOn = false;
      stunnerLaunched = false;
      DOM.btnToggleEcm.classList.remove('active');
      DOM.ecmStatusText.textContent = 'כבויה';
      DOM.statRfConfidence.textContent = '98%';
      DOM.statIirLock.textContent = 'נעול (100%)';
    });
  }

  // שקופית 4: בקרי חץ 3
  if (DOM.sliderApogee) {
    DOM.sliderApogee.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      DOM.apogeeSliderVal.textContent = `${val} ק"מ ${val >= 100 ? '(בחלל מעל קו קרמן)' : '(באטמוספירה)'}`;
      if (val >= 100) {
        DOM.arrowAssignedSystem.textContent = 'חץ 3 (רכב השמדה בחלל)';
        DOM.arrowKkvStatus.textContent = 'דחף וקטורי פעיל';
      } else {
        DOM.arrowAssignedSystem.textContent = 'חץ 2 (רסס כיווני)';
        DOM.arrowKkvStatus.textContent = 'המתנה (באטמוספירה)';
      }
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

  // שקופית 5: תרחיש שו"ב
  if (DOM.btnAutoAllocate) {
    DOM.btnAutoAllocate.addEventListener('click', () => {
      DOM.btnAutoAllocate.classList.toggle('active');
      const isOn = DOM.btnAutoAllocate.classList.contains('active');
      DOM.bmcStatusText.textContent = isOn ? 'פעילה' : 'ידנית';
    });
  }

  // שקופית 6: סינון טבלת מטריצה
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

  // חלון מקורות אקדמיים (מודאל)
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

  // מקשי מקלדת נוחים במיוחד למרצה
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    switch (e.key) {
      // בעברית (RTL): חץ ימינה זה קודם, חץ שמאלה זה הבא, או להפך
      case 'ArrowLeft':
      case ' ': // מקש רווח
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowRight':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 't':
      case 'T':
      case 'א':
        if (DOM.btnToggle3D) DOM.btnToggle3D.click();
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
// 10. הזנקת המערכת בטעינת העמוד
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Aegis] מצגת ההגנה הרב-שכבתית בעברית נטענה בהצלחה.');
  initEventListeners();
  initThreatClassifier();
  initThreeEngine();
  goToSlide(0);
});
