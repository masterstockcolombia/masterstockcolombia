/*
 * MasterStock USA - Network data-flow animation
 * Particles flowing between US hubs behind the hero section.
 * Source: assets/network-background.html (extracted from live site).
 *
 * Enhancements vs original:
 *   - DPR-aware rendering for crisp particles on retina
 *   - Respects prefers-reduced-motion (double-gated with CSS)
 *   - IntersectionObserver pauses RAF when hero leaves viewport (saves CPU)
 *   - Colors retuned to site palette (#6EC6FF + #FFFFFF) for cohesion with
 *     the mesh blob gradient. Original used #00B5C6 (teal) - swap back if needed.
 */
(function () {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (!w || !h) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    width = w;
    height = h;
  }
  window.addEventListener('resize', resize);
  resize();

  // US hub regions (approximate % coordinates aligned to a US map)
  const regions = [
    { x: 0.25, y: 0.45 },  // NorCal
    { x: 0.28, y: 0.75 },  // SoCal
    { x: 0.25, y: 0.25 },  // Washington State
    { x: 0.85, y: 0.35 },  // NYC / Northeast
    { x: 0.80, y: 0.75 },  // Florida
    { x: 0.50, y: 0.65 },  // Texas
    { x: 0.65, y: 0.35 },  // Chicago / Midwest
    { x: 0.45, y: 0.35 },  // Denver
    { x: 0.75, y: 0.55 }   // Atlanta
  ];

  const hubs = [];
  regions.forEach(function (r) {
    const count = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < count; i++) {
      hubs.push({
        x: r.x + (Math.random() - 0.5) * 0.1,
        y: r.y + (Math.random() - 0.5) * 0.1
      });
    }
  });

  function Particle() { this.reset(); }
  Particle.prototype.reset = function () {
    const startHub = hubs[Math.floor(Math.random() * hubs.length)];
    let endHub = hubs[Math.floor(Math.random() * hubs.length)];
    while (endHub === startHub) endHub = hubs[Math.floor(Math.random() * hubs.length)];
    this.x = startHub.x * width;
    this.y = startHub.y * height;
    this.targetX = endHub.x * width;
    this.targetY = endHub.y * height;
    this.progress = 0;
    this.speed = Math.random() * 0.01 + 0.005;
    this.color = Math.random() > 0.5 ? '#6EC6FF' : '#FFFFFF';
  };
  Particle.prototype.update = function () {
    this.progress += this.speed;
    if (this.progress >= 1) this.reset();
  };
  Particle.prototype.draw = function () {
    const cx = this.x + (this.targetX - this.x) * this.progress;
    const cy = this.y + (this.targetY - this.y) * this.progress;
    const tail = 0.1;
    if (this.progress > tail) {
      const px = this.x + (this.targetX - this.x) * (this.progress - tail);
      const py = this.y + (this.targetY - this.y) * (this.progress - tail);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = 1 - this.progress;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 1;
    ctx.fill();
  };

  const particles = [];
  for (let i = 0; i < 8; i++) particles.push(new Particle());

  let rafId = null;
  function animate() {
    if (!width || !height) { resize(); }
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    hubs.forEach(function (h) {
      ctx.beginPath();
      ctx.arc(h.x * width, h.y * height, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    particles.forEach(function (p) { p.update(); p.draw(); });
    rafId = requestAnimationFrame(animate);
  }
  animate();

  // Pause RAF when hero leaves viewport
  const heroWrap = canvas.closest('.hero-wrap');
  if (heroWrap && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (!rafId) animate();
        } else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    }, { threshold: 0 });
    io.observe(heroWrap);
  }
})();
