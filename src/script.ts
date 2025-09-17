// Type definitions for the lottery wheel
interface PrizeSegment {
  label: string;
  color: string;
  prizeKey: string | null;
}

interface PrizeLimits {
  p1: number;
  p2: number;
  p3: number;
}

interface TargetAngle {
  idx: number;
  angle: number;
}

interface StatusItem {
  title: string;
  key: keyof PrizeLimits;
}

(() => {
  // 等待 i18n 初始化
  const initApp = (): void => {
    if (!(window as any).i18n) {
      setTimeout(initApp, 50);
      return;
    }

    // 初始化多语言
    (window as any).i18n.init();

    // 获取当前语言的奖项配置
    const getPrizeSegments = (): PrizeSegment[] => {
      return [
        { label: (window as any).i18n.t('thankYou'), color: '#5b8cff', prizeKey: null },
        { label: (window as any).i18n.t('secondPrize'), color: '#f7b500', prizeKey: 'p2' },
        { label: (window as any).i18n.t('thankYou'), color: '#9b59b6', prizeKey: null },
        { label: (window as any).i18n.t('firstPrize'), color: '#ff6b6b', prizeKey: 'p1' },
        { label: (window as any).i18n.t('thankYou'), color: '#2ecc71', prizeKey: null },
        { label: (window as any).i18n.t('thirdPrize'), color: '#4cd964', prizeKey: 'p3' },
        { label: (window as any).i18n.t('thankYou'), color: '#e67e22', prizeKey: null },
        { label: (window as any).i18n.t('thankYou'), color: '#34495e', prizeKey: null },
      ];
    };

    // Config
    let segments: PrizeSegment[] = getPrizeSegments();

    const prizeLimitsDefault: PrizeLimits = { p1: 1, p2: 1, p3: 1 };
    const storageKey = 'wheel-prize-limits-v1';

    // Elements
    const canvas = document.getElementById('wheel') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const spinBtn = document.getElementById('spinBtn') as HTMLButtonElement;
    const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
    const resultEl = document.getElementById('result') as HTMLElement;
    const statusCards = document.getElementById('statusCards') as HTMLElement;

    // Canvas sizing
    function updateCanvasSize(): void {
      const container = canvas.parentElement!;
      const containerSize = Math.min(container.clientWidth, container.clientHeight, 520);
      canvas.width = containerSize;
      canvas.height = containerSize;
      canvas.style.width = containerSize + 'px';
      canvas.style.height = containerSize + 'px';
    }

    updateCanvasSize();

    window.addEventListener('resize', () => {
      updateCanvasSize();
      renderWheel(angle);
    });

    const getCanvasSize = (): number => canvas.width;
    const getCenterX = (): number => getCanvasSize() / 2;
    const getCenterY = (): number => getCanvasSize() / 2;
    const getRadius = (): number => Math.min(getCanvasSize(), getCanvasSize()) / 2 - 10;
    const getTextRadius = (): number => getRadius() * 0.72;

    // State
    let limits: PrizeLimits = loadLimits();
    let spinning = false;
    let angle = -Math.PI / 2; // 12 o'clock

    // Init
    renderWheel(angle);
    renderStatus();

    // Events
    spinBtn.addEventListener('click', onSpin);
    resetBtn.addEventListener('click', onReset);

    function loadLimits(): PrizeLimits {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          return { ...prizeLimitsDefault, ...parsed };
        }
      } catch {
        // Silent fail
      }
      return { ...prizeLimitsDefault };
    }

    function saveLimits(): void {
      localStorage.setItem(storageKey, JSON.stringify(limits));
    }

    function renderWheel(startAngle: number): void {
      ctx.clearRect(0, 0, getCanvasSize(), getCanvasSize());
      ctx.save();
      ctx.translate(getCenterX(), getCenterY());
      ctx.rotate(startAngle);

      const slice = (Math.PI * 2) / segments.length;
      const radius = getRadius();
      const textRadius = getTextRadius();

      segments.forEach((seg, i) => {
        const a0 = i * slice;
        const a1 = (i + 1) * slice;

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, a0, a1);
        ctx.fillStyle = seg.color;
        ctx.fill();
        ctx.stroke();

        // Draw text
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

    function pickTargetAngle(): TargetAngle {
      // Pick a random segment
      const idx = Math.floor(Math.random() * segments.length);
      const slice = (Math.PI * 2) / segments.length;
      const a0 = idx * slice;
      const a1 = (idx + 1) * slice;
      // Random angle within that segment
      const angle = a0 + Math.random() * (a1 - a0);
      return { idx, angle };
    }

    function onSpin(): void {
      if (spinning) return;
      spinning = true;
      spinBtn.disabled = true;
      resultEl.textContent = (window as any).i18n.t('spinning');

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

    function onReset(): void {
      limits = { ...prizeLimitsDefault };
      saveLimits();
      renderStatus();
      resultEl.textContent = (window as any).i18n.t('quotaReset');
    }

    function handlePrize(seg: PrizeSegment): void {
      if (!seg.prizeKey) {
        resultEl.textContent = (window as any).i18n.t('thanksForParticipation');
        return;
      }

      const key = seg.prizeKey as keyof PrizeLimits;
      if (limits[key] > 0) {
        limits[key]--;
        saveLimits();
        renderStatus();
        resultEl.textContent = (window as any).i18n.t('congratulations', { prize: seg.label });
      } else {
        resultEl.textContent = (window as any).i18n.t('prizeExhausted', { prize: seg.label });
      }
    }

    function renderStatus(): void {
      const items: StatusItem[] = [
        { title: (window as any).i18n.t('firstPrize'), key: 'p1' },
        { title: (window as any).i18n.t('secondPrize'), key: 'p2' },
        { title: (window as any).i18n.t('thirdPrize'), key: 'p3' },
      ];
      statusCards.innerHTML = items.map(({ title, key }) => {
        const left = limits[key];
        const badge = left > 0 
          ? `<span class="badge ok">${(window as any).i18n.t('remaining', { count: left })}</span>` 
          : `<span class="badge out">${(window as any).i18n.t('exhausted')}</span>`;
        return `
          <div class="card">
            <h3>${title} ${badge}</h3>
            <div class="meta">${(window as any).i18n.t('totalQuota')}</div>
          </div>
        `;
      }).join('');
    }

    // 监听语言变化
    const originalSetLanguage = (window as any).i18n.setLanguage.bind((window as any).i18n);
    (window as any).i18n.setLanguage = function(lang: SupportedLanguage) {
      originalSetLanguage(lang);
      // 更新转盘文本
      segments = getPrizeSegments();
      renderWheel(angle);
      renderStatus();
    };

    // Helpers
    function normalizeAngle(a: number): number {
      const twoPi = Math.PI * 2;
      while (a < -twoPi) a += twoPi;
      while (a > twoPi) a -= twoPi;
      return a;
    }

    function getIndexAtPointer(currentAngle: number, count: number): number {
      const slice = (Math.PI * 2) / count;
      // The pointer is fixed at -PI/2 (12 o'clock). The wheel is rotated by currentAngle.
      const pointerAngle = -Math.PI / 2 - currentAngle; // angle in wheel space
      let idx = Math.floor((pointerAngle % (Math.PI * 2) + Math.PI * 2) / slice);
      idx = idx % count;
      return idx;
    }

    function animateTo(from: number, to: number, duration: number, done?: () => void): void {
      const start = performance.now();
      const delta = to - from;
      function step(now: number): void {
        const t = Math.min(1, (now - start) / duration);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        const a = from + delta * eased;
        renderWheel(a);
        if (t < 1) requestAnimationFrame(step); else done && done();
      }
      requestAnimationFrame(step);
    }

  }; // 结束 initApp 函数

  // 启动应用
  initApp();
})();