/* =========================================================
   PORTFÓLIO — JULIA NEVES  |  JavaScript puro (Vanilla JS)
   ========================================================= */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Ano atual no rodapé ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Cabeçalho, barra de progresso e menu ativo ---------- */
  const header = $('#header');
  const bar    = $('#progressBar');
  let ticking  = false;

  function onScroll() {
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 24);
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* Menu mobile */
  const toggle = $('#navToggle');
  const nav    = $('#nav');

  function closeNav() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('a', nav).forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  /* Link ativo conforme a seção visível */
  const links    = $$('.nav a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Elementos que aparecem suavemente ao rolar ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- Hero: movimento sutil das formas ao mover o mouse ---------- */
  const hero  = $('.hero');
  const blobs = $$('.blob');
  if (hero && finePointer && !reduceMotion) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      blobs.forEach(b => {
        const d = parseFloat(b.dataset.depth || 0);
        b.style.transform = `translate3d(${x * d * 2}px, ${y * d * 2}px, 0)`;
      });
    });
    hero.addEventListener('mouseleave', () => blobs.forEach(b => (b.style.transform = '')));
    blobs.forEach(b => (b.style.transition = 'transform .6s ease-out'));
  }

  /* ---------- Brilho que acompanha o cursor ---------- */
  const glow = $('.cursor-glow');
  if (glow && finePointer && !reduceMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0, started = false;
    window.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      if (!started) { cx = tx; cy = ty; started = true; glow.classList.add('on'); loop(); }
    });
    document.addEventListener('mouseleave', () => glow.classList.remove('on'));
    document.addEventListener('mouseenter', () => glow.classList.add('on'));
    function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    }
  }

  /* ---------- Cards com leve inclinação 3D ---------- */
  if (finePointer && !reduceMotion) {
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => (card.style.transform = ''));
    });
  }

  /* ---------- Botões: efeito magnético + ondulação no clique ---------- */
  $$('.btn').forEach(btn => {
    if (finePointer && !reduceMotion) {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener('mouseleave', () => (btn.style.transform = ''));
    }
    btn.addEventListener('click', e => {
      const r    = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const dot  = document.createElement('span');
      dot.className = 'ripple';
      dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      btn.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove());
    });
  });

  /* ---------- Equalizador decorativo (gera as barras) ---------- */
  $$('.eq').forEach(eq => {
    const total = parseInt(eq.dataset.bars || 32, 10);
    for (let i = 0; i < total; i++) {
      const s = document.createElement('span');
      // Altura em formato de "onda" + um pouco de aleatoriedade
      const wave = Math.abs(Math.sin(i * 0.45)) * 0.6 + Math.random() * 0.4;
      s.style.setProperty('--h', Math.max(14, wave * 100) + '%');
      s.style.setProperty('--dl', (-Math.random() * 1.2).toFixed(2) + 's');
      s.style.animationDuration = (0.55 + Math.random() * 0.7).toFixed(2) + 's';
      eq.appendChild(s);
    }
  });

  /* ---------- Controle de mídia ---------- */
  const medias = $$('audio, video');

  // Só uma mídia toca por vez
  medias.forEach(m => {
    m.addEventListener('play', () => {
      medias.forEach(other => { if (other !== m && !other.paused) other.pause(); });
    });
  });

  // Estado "tocando" para animar o ícone, o equalizador e o disco de vinil
  $$('[data-playing-scope]').forEach(scope => {
    const audio = $('audio', scope);
    if (!audio) return;
    const on  = () => scope.classList.add('playing');
    const off = () => scope.classList.remove('playing');
    audio.addEventListener('play', on);
    audio.addEventListener('playing', on);
    ['pause', 'ended', 'error'].forEach(ev => audio.addEventListener(ev, off));
  });

  // Pausa o vídeo quando sai da tela (economiza dados e bateria)
  if ('IntersectionObserver' in window) {
    const pauser = new IntersectionObserver(entries => {
      entries.forEach(e => { if (!e.isIntersecting && !e.target.paused) e.target.pause(); });
    }, { threshold: 0.1 });
    $$('video').forEach(v => pauser.observe(v));
  }

  /* ---------- Imagens ausentes: mostra um espaço reservado elegante ---------- */
  function markMissing(img) {
    const holder = img.closest('.photo-frame, .feature-img, .info-img');
    if (holder) holder.classList.add('is-missing');
  }
  $$('.photo-frame img, .feature-img img, .info-img img').forEach(img => {
    if (img.complete && img.naturalWidth === 0) markMissing(img);
    img.addEventListener('error', () => markMissing(img));
    img.addEventListener('load',  () => {
      const holder = img.closest('.photo-frame, .feature-img, .info-img');
      if (holder) holder.classList.remove('is-missing');
    });
  });

  /* ---------- Infográfico: janela de ampliação ---------- */
  const lightbox = $('#lightbox');
  const openBtn  = $('#infoOpen');
  const closeBtn = $('#lightboxClose');
  const lbImg    = $('#lightboxImg');

  if (lightbox && openBtn && typeof lightbox.showModal === 'function') {
    openBtn.addEventListener('click', () => {
      const src = $('.info-img img')?.getAttribute('src');
      if (src) lbImg.src = src;
      lbImg.classList.remove('zoomed');
      lightbox.showModal();
    });
    closeBtn.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });
    lbImg.addEventListener('click', () => lbImg.classList.toggle('zoomed'));
  } else if (openBtn) {
    // Navegadores muito antigos: apenas abre a imagem em outra aba
    openBtn.addEventListener('click', () => {
      const src = $('.info-img img')?.getAttribute('src');
      if (src) window.open(src, '_blank', 'noopener');
    });
  }

})();
