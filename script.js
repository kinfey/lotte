(() => {
  // Config
  const segments = [
    { label: '一等奖', color: '#ff6b6b', prizeKey: 'p1' },
    { label: '二等奖', color: '#f7b500', prizeKey: 'p2' },
    { label: '三等奖', color: '#4cd964', prizeKey: 'p3' },
    { label: '谢谢参与', color: '#5b8cff', prizeKey: null },
    { label: '谢谢参与', color: '#9b59b6', prizeKey: null },
    { label: '谢谢参与', color: '#2ecc71', prizeKey: null },
    { label: '谢谢参与', color: '#e67e22', prizeKey: null },
  ];

  const prizeLimitsDefault = { p1: 1, p2: 1, p3: 1 };
  const storageKey = 'wheel-prize-limits-v1';

  // Elements
  const canvas = document.getElementById('wheel');
  const ctx = canvas.getContext('2d');
  const spinBtn = document.getElementById('spinBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultEl = document.getElementById('result');
  const statusCards = document.getElementById('statusCards');

  // Canvas sizing
  function updateCanvasSize() {
    const container = canvas.parentElement;
    const containerSize = Math.min(container.clientWidth, container.clientHeight, 520);
    canvas.width = containerSize;
    canvas.height = containerSize;
    canvas.style.width = containerSize + 'px';
    canvas.style.height = containerSize + 'px';
  }

  // Update canvas size on load and resize
  updateCanvasSize();
  window.addEventListener('resize', () => {
    updateCanvasSize();
    renderWheel(angle);
  });

  const getCanvasSize = () => canvas.width;
  const getCenterX = () => getCanvasSize() / 2;
  const getCenterY = () => getCanvasSize() / 2;
  const getRadius = () => Math.min(getCanvasSize(), getCanvasSize()) / 2 - 10;
  const getTextRadius = () => getRadius() * 0.72;

  // State
  let limits = loadLimits();
  let spinning = false;
  let angle = -Math.PI / 2; // 12 o'clock

  // Init
  renderWheel(angle);
  renderStatus();

  // Events
  spinBtn.addEventListener('click', onSpin);
  resetBtn.addEventListener('click', onReset);

  function loadLimits() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...prizeLimitsDefault, ...parsed };
      }
    } catch {}
    return { ...prizeLimitsDefault };
  }

  function saveLimits() {
    localStorage.setItem(storageKey, JSON.stringify(limits));
  }

  function renderWheel(startAngle) {
    const W = getCanvasSize();
    const H = getCanvasSize();
    const cx = getCenterX();
    const cy = getCenterY();
    const radius = getRadius();
    const textRadius = getTextRadius();
    
    ctx.clearRect(0, 0, W, H);
    const slice = (Math.PI * 2) / segments.length;

    // Outer circle background
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle);

    segments.forEach((seg, i) => {
      const a0 = i * slice;
      const a1 = a0 + slice;

      // Sector
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, a0, a1);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      // Separator line
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      const mid = a0 + slice / 2;
      const tx = Math.cos(mid) * textRadius;
      const ty = Math.sin(mid) * textRadius;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(mid + Math.PI / 2);
      ctx.fillStyle = '#101325';
      // Responsive font size
      const fontSize = Math.max(12, Math.min(20, radius * 0.08));
      ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, -apple-system`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(seg.label, 0, 0);
      ctx.restore();
    });

    // Center circle - responsive size
    const centerRadius = Math.max(12, Math.min(18, radius * 0.035));
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  function pickTargetAngle() {
    // Randomly pick a segment index uniformly, then add random offset within slice
    const slice = (Math.PI * 2) / segments.length;
    const idx = Math.floor(Math.random() * segments.length);
    const offset = (Math.random() - 0.5) * slice * 0.7; // avoid borders

    // We want pointer at 12 o'clock, which is -Math.PI/2 in our angle system
    const targetAngle = -Math.PI / 2 - (idx + 0.5) * slice - offset; // center of slice
    return { idx, angle: targetAngle };
  }

  function onSpin() {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    resultEl.textContent = '正在抽取…';

    const slice = (Math.PI * 2) / segments.length;
    const { idx, angle: target } = pickTargetAngle();

    // Add multiple full rotations for flair
    const turns = 6 + Math.floor(Math.random() * 3); // 6-8 turns
    const final = target - turns * Math.PI * 2;

    animateTo(angle, final, 2800 + Math.random() * 700, () => {
      angle = normalizeAngle(final);
      const landedIdx = getIndexAtPointer(angle, segments.length);
      const seg = segments[landedIdx];
      handlePrize(seg);
      spinning = false;
      spinBtn.disabled = false;
    });
  }

  function onReset() {
    limits = { ...prizeLimitsDefault };
    saveLimits();
    renderStatus();
    resultEl.textContent = '名额已重置。';
  }

  function handlePrize(seg) {
    if (!seg.prizeKey) {
      resultEl.textContent = '谢谢参与，下次好运！';
      return;
    }

    if (limits[seg.prizeKey] > 0) {
      limits[seg.prizeKey] -= 1;
      saveLimits();
      renderStatus();
      resultEl.textContent = `恭喜获得：${seg.label}！`;
    } else {
      resultEl.textContent = `${seg.label} 名额已抽完，本次视为未中奖。`;
    }
  }

  function renderStatus() {
    const items = [
      { title: '一等奖', key: 'p1' },
      { title: '二等奖', key: 'p2' },
      { title: '三等奖', key: 'p3' },
    ];
    statusCards.innerHTML = items.map(({ title, key }) => {
      const left = limits[key];
      const badge = left > 0 ? `<span class="badge ok">剩余 ${left}</span>` : `<span class="badge out">已抽完</span>`;
      return `
        <div class="card">
          <h3>${title} ${badge}</h3>
          <div class="meta">总名额：1 · 本地保存</div>
        </div>
      `;
    }).join('');
  }

  // Helpers
  function normalizeAngle(a) {
    const twoPi = Math.PI * 2;
    while (a < -twoPi) a += twoPi;
    while (a > twoPi) a -= twoPi;
    return a;
  }

  function getIndexAtPointer(currentAngle, count) {
    const slice = (Math.PI * 2) / count;
    // The pointer is fixed at -PI/2 (12 o'clock). The wheel is rotated by currentAngle.
    const pointerAngle = -Math.PI / 2 - currentAngle; // angle in wheel space
    let idx = Math.floor((pointerAngle % (Math.PI * 2) + Math.PI * 2) / slice);
    idx = idx % count;
    return idx;
  }

  function animateTo(from, to, duration, done) {
    const start = performance.now();
    const delta = to - from;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const a = from + delta * eased;
      renderWheel(a);
      if (t < 1) requestAnimationFrame(step); else done && done();
    }
    requestAnimationFrame(step);
  }
})();
