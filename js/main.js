import { CONFIG } from './config.js';
import { translations, roadmapStages, labs } from './translations.js';
import { projects, writeups } from './projects.js';
import { initReveal, startTyping, initNetwork, initCursorGlow } from './animations.js';

const LANG_KEY = 'portfolio-lang';
let currentLang = CONFIG.defaultLang;
let stopTyping = () => {};

const t = (key) => (translations[currentLang] && translations[currentLang][key]) ?? translations[CONFIG.defaultLang][key] ?? key;
const pick = (obj) => obj[currentLang] ?? obj[CONFIG.defaultLang];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function applyStaticText() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    // format: attr:key
    const [attr, key] = el.dataset.i18nAttr.split(':');
    el.setAttribute(attr, t(key));
  });
  document.querySelectorAll('.lang-btn').forEach(b => {
    const active = b.dataset.lang === currentLang;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  stopTyping();
  stopTyping = startTyping(document.getElementById('typing'), translations[currentLang].hero_typing);
}

function renderRoadmap() {
  const root = document.getElementById('roadmap-list');
  root.innerHTML = roadmapStages.map(s => `
    <li class="stage reveal">
      <span class="stage-id">${esc(s.id)}</span>
      <div class="stage-body">
        <h3>${esc(pick(s.title))}</h3>
        <p class="stage-status status-${esc(s.status)}">${t('road_status_' + s.status)}</p>
        <p class="stage-topics"><span>${t('road_topics')}:</span> ${s.topics.map(esc).join(' · ')}</p>
      </div>
    </li>`).join('');
}

function renderLabs() {
  document.getElementById('labs-grid').innerHTML = labs.map(l => `
    <article class="card lab reveal">
      <h3>${esc(l.name)}</h3>
      <p class="muted">${t('labs_category')}: ${esc(pick(l.category))}</p>
      <p class="muted">${t('labs_status')}: ${t('road_status_' + l.status)}</p>
      ${l.url
        ? `<a class="link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${t('labs_open')} →</a>`
        : `<span class="link disabled">${t('proj_soon')}</span>`}
    </article>`).join('');
}

function renderProjects() {
  document.getElementById('projects-grid').innerHTML = projects.map(p => `
    <article class="card project reveal">
      <div class="project-preview" aria-hidden="true"><span>${t('proj_placeholder')}</span></div>
      <div class="project-body">
        <h3>${esc(p.title)}</h3>
        <p class="muted">${t('proj_techs')}: ${p.techs.map(esc).join(', ')}</p>
        <div class="project-links">
          ${p.github ? `<a class="link" href="${esc(p.github)}" target="_blank" rel="noopener noreferrer">${t('proj_github')} →</a>` : `<span class="link disabled">${t('proj_github')}: ${t('proj_soon')}</span>`}
          ${p.demo ? `<a class="link" href="${esc(p.demo)}" target="_blank" rel="noopener noreferrer">${t('proj_demo')} →</a>` : ''}
        </div>
      </div>
    </article>`).join('');
}

function renderWriteups() {
  const root = document.getElementById('writeups-list');
  if (!writeups.length) {
    root.innerHTML = `<p class="muted empty">${t('write_empty')}</p>`;
    return;
  }
  root.innerHTML = writeups.map(w => `
    <article class="card reveal">
      <p class="muted">${esc(w.category)} · ${esc(w.date)}</p>
      <h3>${esc(pick(w.title))}</h3>
      <p>${esc(pick(w.description))}</p>
      <p class="tags">${(w.tags || []).map(x => `<span>#${esc(x)}</span>`).join(' ')}</p>
    </article>`).join('');
}

function renderAll() {
  applyStaticText();
  renderRoadmap();
  renderLabs();
  renderProjects();
  renderWriteups();
  initReveal();
}

function setLang(lang) {
  if (!CONFIG.supportedLangs.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  renderAll();
}

function initLang() {
  const saved = localStorage.getItem(LANG_KEY);
  currentLang = CONFIG.supportedLangs.includes(saved) ? saved : CONFIG.defaultLang;
  document.querySelectorAll('.lang-btn').forEach(b =>
    b.addEventListener('click', () => setLang(b.dataset.lang)));
}

function initNav() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('nav-menu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => io.observe(s));

  const header = document.querySelector('.site-header');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
    document.getElementById('to-top').classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const rules = {
    name: [v => v.trim().length >= 2, 'form_err_name'],
    email: [v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), 'form_err_email'],
    message: [v => v.trim().length >= 10, 'form_err_msg']
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    for (const [field, [check, errKey]] of Object.entries(rules)) {
      const input = form.elements[field];
      const err = form.querySelector(`[data-err="${field}"]`);
      const valid = check(input.value);
      err.textContent = valid ? '' : t(errKey);
      input.setAttribute('aria-invalid', String(!valid));
      if (!valid && ok) input.focus();
      ok = ok && valid;
    }
    if (!ok) return;

    // No backend configured: do not pretend the message was sent.
    if (!CONFIG.contactEndpoint) {
      status.textContent = t('form_noconf');
      status.className = 'form-status is-warn';
      return;
    }
    try {
      const res = await fetch(CONFIG.contactEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      if (!res.ok) throw new Error(res.statusText);
      form.reset();
      status.textContent = t('form_ok');
      status.className = 'form-status is-ok';
    } catch {
      status.textContent = t('form_noconf');
      status.className = 'form-status is-warn';
    }
  });
}

function fillConfig() {
  document.querySelectorAll('[data-config]').forEach(el => {
    const key = el.dataset.config;
    if (key === 'email') {
      el.href = `mailto:${CONFIG.email}`;
      const strong = el.querySelector('strong');
      if (strong) strong.textContent = CONFIG.email;
      else el.textContent = CONFIG.email;
    }
    else if (key === 'telegram') { el.href = CONFIG.telegram; }
    else if (key === 'github') { el.href = CONFIG.github; }
    else if (key === 'name') { el.textContent = CONFIG.name; }
    else if (key === 'brand') { el.textContent = CONFIG.brand; }
  });
  const img = document.getElementById('profile-img');
  if (img) img.src = CONFIG.profileImage;
}

function init() {
  fillConfig();
  initLang();
  initNav();
  initContactForm();
  initNetwork(document.getElementById('network'));
  initCursorGlow();
  renderAll();
  document.getElementById('to-top').addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.classList.add('is-loaded');
}

document.addEventListener('DOMContentLoaded', init);
