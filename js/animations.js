export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

export function startTyping(el, words) {
  if (!el || !words || !words.length) return () => {};
  if (reducedMotion) { el.textContent = words[0]; return () => {}; }
  let w = 0, c = 0, deleting = false, timer;
  const tick = () => {
    const word = words[w];
    el.textContent = word.slice(0, c);
    if (!deleting && c < word.length) c++;
    else if (deleting && c > 0) c--;
    else if (!deleting) { deleting = true; timer = setTimeout(tick, 1400); return; }
    else { deleting = false; w = (w + 1) % words.length; }
    timer = setTimeout(tick, deleting ? 45 : 90);
  };
  tick();
  return () => clearTimeout(timer);
}

// Subtle network visualization on a canvas behind the hero.
export function initNetwork(canvas) {
  if (!canvas || reducedMotion) return;
  const ctx = canvas.getContext('2d');
  let nodes = [], raf, w, h;
  const resize = () => {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    const count = Math.min(60, Math.floor(canvas.offsetWidth / 22));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const max = 140 * devicePixelRatio;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.hypot(dx, dy);
        if (d < max) {
          ctx.strokeStyle = `rgba(139,92,246,${0.18 * (1 - d / max)})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = 'rgba(59,130,246,0.7)';
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6 * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  resize();
  window.addEventListener('resize', resize);
  // Pause when the tab is hidden to protect performance.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });
  draw();
}

export function initCursorGlow() {
  if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;
  let x = 0, y = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  const loop = () => {
    x += (tx - x) * 0.15; y += (ty - y) * 0.15;
    glow.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();
}
