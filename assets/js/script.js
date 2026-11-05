/* ATN Worldwide Express – vanilla JS (ES6+). One function per feature, one
   shared rAF-throttled scroll handler, IntersectionObserver reveals.
   No libraries. Reduced-motion aware throughout. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasIO = 'IntersectionObserver' in window;

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-shown'), 2800);
  }

  /* ---------- Shared scroll loop (passive listener + rAF) ---------- */
  const scrollTasks = [];
  let ticking = false;
  function onScrollTask(fn) { scrollTasks.push(fn); }
  function runScrollTasks() { ticking = false; scrollTasks.forEach((fn) => fn(window.scrollY)); }
  function requestScroll() { if (!ticking) { ticking = true; requestAnimationFrame(runScrollTasks); } }

  /* ---------- Header: transparent -> solid, drawer ---------- */
  function initHeader() {
    const header = $('#site-header');
    const toggle = $('#menu-toggle');
    const drawer = $('#nav-drawer');
    if (!header) return;
    let drawerOpen = false;

    const setOpen = (open) => {
      drawerOpen = open;
      drawer.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      header.classList.toggle('is-stuck', open || window.scrollY > 8);
    };

    onScrollTask((y) => {
      header.classList.toggle('is-stuck', drawerOpen || y > 8);
    });

    if (toggle && drawer) {
      toggle.addEventListener('click', () => setOpen(!drawerOpen));
      $$('a', drawer).forEach((a) => a.addEventListener('click', () => setOpen(false)));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawerOpen) { setOpen(false); toggle.focus(); }
      });
      window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => e.matches && setOpen(false));
    }
  }

  /* ---------- Active nav highlighting (same-page anchors only) ---------- */
  function initScrollSpy() {
    const links = $$('[data-nav]');
    const ids = [...new Set(links.map((a) => (a.getAttribute('href') || '').replace(/^.*#/, '')))];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;
    let last = '';
    onScrollTask((y) => {
      const probe = y + window.innerHeight * 0.35;
      let current = sections[0].id;
      sections.forEach((s) => { if (s.offsetTop <= probe) current = s.id; });
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1].id;
      if (current === last) return;
      last = current;
      links.forEach((a) => {
        const active = a.getAttribute('href') === `#${current}`;
        a.classList.toggle('is-active', active);
        if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    });
  }

  /* ---------- Split headlines into words ---------- */
  function initSplit() {
    if (reduceMotion) return;
    $$('[data-split]').forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach((word, i) => {
        const outer = document.createElement('span');
        outer.className = 'w';
        const inner = document.createElement('span');
        inner.style.setProperty('--i', i);
        inner.textContent = word;
        outer.append(inner);
        el.append(outer);
        if (i < words.length - 1) el.append(document.createTextNode(' '));
      });
    });
  }

  /* ---------- Reveal once on scroll ---------- */
  function initReveal() {
    const targets = $$('[data-anim], [data-split], [data-tracker], [data-stagger]');
    $$('[data-stagger]').forEach((group) => {
      [...group.children].forEach((child, i) => child.style.setProperty('--si', i));
    });
    if (reduceMotion || !hasIO) { targets.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach((el) => io.observe(el));
  }

  /* ---------- Hero entrance ---------- */
  function initHero() {
    const hero = $('#home');
    if (!hero) return;
    const video = $('.hero-video', hero);
    if (video) {
      if (reduceMotion) { video.pause(); video.removeAttribute('autoplay'); }
      video.addEventListener('canplay', () => hero.classList.add('is-ready'), { once: true });
    }
    const ready = () => hero.classList.add('is-ready');
    const go = () => requestAnimationFrame(ready);
    if (document.readyState === 'complete') setTimeout(go, 150);
    else window.addEventListener('load', () => setTimeout(go, 150), { once: true });
    setTimeout(go, 800);
  }

  function initHeroTracking() {
    const form = $('#hero-track-form');
    const input = $('#hero-awb');
    const card = $('.hero-card');
    if (!form || !input || !card) return;

    const callFab = $('.fab-call');
    if (callFab && hasIO) {
      const observer = new IntersectionObserver(([entry]) => {
        callFab.classList.toggle('is-obscured', entry.isIntersecting);
      }, { threshold: 0.1 });
      observer.observe(card);
    }

    const tabs = $$('.hero-card-tab', card);
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
    const activateTab = (activeTab, moveFocus = false) => {
      tabs.forEach((tab, index) => {
        const selected = tab === activeTab;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[index].hidden = !selected;
      });
      if (moveFocus) activeTab.focus();
    };

    tabs.forEach((tab) => tab.addEventListener('click', () => activateTab(tab)));
    const tabList = $('.hero-card-tabs', card);
    tabList?.addEventListener('keydown', (event) => {
      const currentIndex = tabs.indexOf(document.activeElement);
      if (currentIndex < 0) return;
      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      input.value = input.value.trim();
      if (!form.reportValidity()) return;

      window.location.assign(
        `https://shiptrack.atnwxp.in/viewabstatus/${encodeURIComponent(input.value)}`
      );
    });

    const shipForm = $('#hero-ship-form', card);
    const pinInputs = [$('#hero-pickup-pin', card), $('#hero-delivery-pin', card)];
    if (!shipForm || pinInputs.some((pin) => !pin)) return;

    pinInputs.forEach((pin) => {
      pin.pattern = '[A-Za-z0-9][A-Za-z0-9 -]{1,10}[A-Za-z0-9]';
      pin.minLength = 3;
      pin.maxLength = 12;
      pin.inputMode = 'text';
    });

    shipForm.addEventListener('submit', (event) => {
      event.preventDefault();
      pinInputs.forEach((pin) => { pin.value = pin.value.trim(); });
      if (!shipForm.reportValidity()) return;

      const params = new URLSearchParams(new FormData(shipForm));
      window.location.assign(`${shipForm.action}?${params.toString()}`);
    });
  }

  /* ---------- Parallax (visible elements only) ---------- */
  function initParallax() {
    if (reduceMotion) return;
    const items = $$('[data-parallax]').map((el) => ({
      el,
      speed: parseFloat(el.dataset.parallax) || 0,
      root: el.closest('section') || el.parentElement,
      visible: false,
    }));
    if (!items.length) return;
    if (hasIO) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => items.filter((p) => p.root === entry.target).forEach((p) => { p.visible = entry.isIntersecting; }));
      }, { rootMargin: '150px 0px' });
      [...new Set(items.map((p) => p.root))].forEach((r) => io.observe(r));
    } else {
      items.forEach((p) => { p.visible = true; });
    }
    onScrollTask(() => {
      const vh = window.innerHeight;
      items.forEach((p) => {
        if (!p.visible) return;
        const r = p.root.getBoundingClientRect();
        const y = -(r.top + r.height / 2 - vh / 2) * p.speed;
        p.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      });
    });
    requestScroll();
  }

  /* ---------- Cursor spotlight on feature cards ---------- */
  function initSpotlight() {
    if (!finePointer) return;
    $$('.feature-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Subtle 3D tilt on hero card and service cards ---------- */
  function initTilt() {
    if (reduceMotion || !finePointer) return;
    $$('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 5;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ---------- Service quick-nav pills: smooth scroll + flash ---------- */
  function initServiceNav() {
    const pills = $$('.svc-pill');
    if (!pills.length) return;
    pills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(pill.getAttribute('href').slice(1));
        if (!target) return;
        pills.forEach((p) => p.classList.toggle('is-active', p === pill));
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (!reduceMotion) {
          target.classList.remove('is-flash');
          void target.offsetWidth;
          target.classList.add('is-flash');
          setTimeout(() => target.classList.remove('is-flash'), 1800);
        }
      });
    });
  }

  /* ---------- Country selects (from the browser's region data) ---------- */
  function initCountries() {
    const selects = $$('[data-country-select]');
    if (!selects.length) return;
    let names = [];
    try {
      const dn = new Intl.DisplayNames(['en'], { type: 'region' });
      for (let a = 0; a < 26; a += 1) {
        for (let b = 0; b < 26; b += 1) {
          const code = String.fromCharCode(65 + a, 65 + b);
          let name;
          try { name = dn.of(code); } catch (err) { continue; }
          if (name && name !== code && !/Unknown Region/i.test(name)) names.push(name);
        }
      }
    } catch (err) {
      names = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore', 'Australia', 'Canada', 'Germany'];
    }
    names = [...new Set(names)].sort((x, y) => x.localeCompare(y, 'en'));
    selects.forEach((sel) => {
      const first = document.createElement('option');
      first.value = '';
      first.textContent = 'Select country';
      sel.append(first);
      names.forEach((n) => {
        const o = document.createElement('option');
        o.value = n; o.textContent = n;
        sel.append(o);
      });
    });
    const pickup = $('#p-country');
    if (pickup) pickup.value = 'India';
  }

  /* ---------- Contact form ---------- */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    const status = $('#contact-form-note');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('Name')).trim();
      const body = [
        `Name: ${name}`,
        `Phone: ${String(data.get('Phone')).trim()}`,
        `Email: ${String(data.get('Email')).trim()}`,
        '',
        'Message:',
        String(data.get('Message')).trim(),
      ].join('\n');
      const subject = encodeURIComponent(`Website enquiry from ${name}`);
      status.textContent = 'Your email app will open with your message ready to send.';
      window.location.href = `mailto:info@atnwxp.in?subject=${subject}&body=${encodeURIComponent(body)}`;
    });
  }

  /* ---------- Booking form ---------- */
  function initBookingForm() {
    const form = $('#book-form');
    if (!form) return;
    const status = $('#form-status');
    const submit = $('#book-submit');
    const label = $('[data-label]', submit);
    const weight = $('#f-weight');
    const weightOut = $('#weight-out');
    const success = $('#form-success');
    const meter = $('#meter');
    const meterFill = $('#meter-fill');
    const meterText = $('#meter-text');

    if (weight && weightOut) weight.addEventListener('input', () => { weightOut.textContent = `${weight.value} kg`; });
    if ($('#p-date')) $('#p-date').min = new Date().toISOString().slice(0, 10);

    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    const rules = {
      'f-name': (v) => (v.trim() ? '' : 'Please enter your name.'),
      'f-email': (v) => (emailOk(v) ? '' : 'Please enter a valid email address.'),
      'd-name': (v) => (v.trim() ? '' : 'Please enter the recipient’s name.'),
      'd-phone': (v) => (/^[+()\d][\d\s\-()+]{5,}$/.test(v.trim()) ? '' : 'Please enter a valid delivery phone number.'),
      'd-email': (v) => (emailOk(v) ? '' : 'Please enter a valid delivery email address.'),
    };
    const ids = Object.keys(rules);

    const updateMeter = () => {
      const done = ids.filter((id) => !rules[id](document.getElementById(id).value)).length;
      meterFill.style.setProperty('--m', (done / ids.length).toFixed(3));
      meter.setAttribute('aria-valuenow', String(done));
      meterText.textContent = `${done} / ${ids.length}`;
    };

    const check = (id, announce = true) => {
      const input = document.getElementById(id);
      const msg = rules[id](input.value);
      const slot = $(`[data-error-for="${id}"]`);
      slot.textContent = msg;
      if (!slot.id) slot.id = `${id}-err`;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) input.setAttribute('aria-describedby', slot.id); else input.removeAttribute('aria-describedby');
      input.classList.toggle('is-valid', !msg && input.value.trim() !== '');
      if (msg && announce && !reduceMotion) {
        input.classList.remove('shake');
        void input.offsetWidth;
        input.classList.add('shake');
      }
      return !msg;
    };

    ids.forEach((id) => {
      const input = document.getElementById(id);
      input.addEventListener('blur', () => { if (input.value.trim() !== '') check(id, false); });
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') check(id, false);
        updateMeter();
      });
    });
    updateMeter();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.textContent = '';

      const results = ids.map((id) => check(id));
      if (results.includes(false)) {
        document.getElementById(ids[results.indexOf(false)]).focus();
        status.textContent = 'Please correct the highlighted fields.';
        status.style.color = '#b42318';
        return;
      }

      submit.disabled = true;
      label.textContent = 'Preparing…';

      const data = new FormData(form);
      const lines = ['New shipment booking request', ''];
      data.forEach((value, key) => { if (String(value).trim() !== '') lines.push(`${key}: ${String(value).trim()}`); });
      const subject = encodeURIComponent(`Shipment booking – ${data.get('Name')}`);
      const body = encodeURIComponent(lines.join('\n'));

      setTimeout(() => {
        window.location.href = `mailto:info@atnwxp.in?subject=${subject}&body=${body}`;
        submit.disabled = false;
        label.textContent = 'Submit';
        form.hidden = true;
        success.hidden = false;
        success.focus({ preventScroll: true });
        success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        toast('Booking details prepared');
      }, 600);
    });

    $('#book-again').addEventListener('click', () => {
      form.reset();
      if ($('#p-country')) $('#p-country').value = 'India';
      if (weightOut) weightOut.textContent = '0 kg';
      $$('.field', form).forEach((f) => { f.classList.remove('is-valid'); f.setAttribute('aria-invalid', 'false'); });
      $$('.field-error', form).forEach((s) => { s.textContent = ''; });
      updateMeter();
      success.hidden = true;
      form.hidden = false;
      $('#book').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Booking stepper follows the visible step ---------- */
  function initStepper() {
    const stepper = $('#steps');
    const steps = $$('.form-step');
    if (!stepper || !steps.length) return;
    const items = $$('.step', stepper);
    const setActive = (index) => {
      items.forEach((el, i) => {
        el.classList.toggle('is-active', i === index);
        el.classList.toggle('is-done', i < index);
        const a = $('a', el);
        if (i === index) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      });
      steps.forEach((s, i) => s.classList.toggle('is-current', i === index));
      const rail = $('.steps-rail span', stepper);
      if (rail) rail.style.setProperty('--sp', (index / (items.length - 1)).toFixed(3));
    };
    setActive(0);
    if (!hasIO) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(steps.indexOf(entry.target)); });
    }, { rootMargin: '-30% 0px -55% 0px' });
    steps.forEach((s) => io.observe(s));
  }

  /* ---------- Preselect shipment mode/type from the services page ---------- */
  function initPreselect() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const type = params.get('type');
    if (mode && $(`input[name="Shipment Mode"][value="${mode}"]`)) $(`input[name="Shipment Mode"][value="${mode}"]`).checked = true;
    if (type && $(`input[name="Shipment Type"][value="${type}"]`)) $(`input[name="Shipment Type"][value="${type}"]`).checked = true;

    const region = params.get('region');
    const regionField = $('#shipment-region');
    const pickupPin = params.get('pickupPincode');
    const deliveryPin = params.get('deliveryPincode');
    if (region === 'domestic' || region === 'international') {
      if (regionField) regionField.value = region === 'domestic' ? 'Domestic' : 'International';
      if (region === 'domestic' && $('#d-country')) $('#d-country').value = 'India';
    }
    if (pickupPin && $('#p-postal')) $('#p-postal').value = pickupPin;
    if (deliveryPin && $('#d-zip')) $('#d-zip').value = deliveryPin;
  }

  /* ---------- Back to top with progress ring ---------- */
  function initToTop() {
    const btn = $('#to-top');
    const arc = $('#to-top-arc');
    if (!btn || !arc) return;
    const circumference = 2 * Math.PI * 21;
    arc.style.strokeDasharray = circumference.toFixed(2);
    onScrollTask((y) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(y / max, 1) : 0;
      arc.style.strokeDashoffset = (circumference * (1 - p)).toFixed(2);
      btn.classList.toggle('is-shown', y > 700);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- Pause SVG (SMIL) animation for reduced motion ---------- */
  function initSvgMotion() {
    if (!reduceMotion) return;
    $$('svg').forEach((svg) => { if (svg.pauseAnimations) svg.pauseAnimations(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSplit();
    initHeader();
    initScrollSpy();
    initReveal();
    initHero();
    initHeroTracking();
    initParallax();
    initSpotlight();
    initTilt();
    initServiceNav();
    initCountries();
    initContactForm();
    initBookingForm();
    initStepper();
    initPreselect();
    initToTop();
    initYear();
    initSvgMotion();

    window.addEventListener('scroll', requestScroll, { passive: true });
    window.addEventListener('resize', requestScroll, { passive: true });
    requestScroll();
  });
})();
