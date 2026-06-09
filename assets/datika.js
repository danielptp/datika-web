/* DÁTIKA — JS compartido del sitio
   Tema (claro/oscuro) · Idioma (ES/EN) · Menú · Toast · Correo anti-spam
   Cada página puede definir antes de cargar este archivo:
     window.DATIKA_I18N = { en: { ...claves de la página... } }
     window.DATIKA_META = { es:{title,desc}, en:{title,desc} }
*/
(function () {
  'use strict';

  /* ─── Correo (ensamblado por JS para evitar bots, sin depender de Cloudflare) ─── */
  var EMAIL = ['datika', 'sv'].join('.') + '@' + ['gmail', 'com'].join('.');

  /* ─── Diccionario base (nav + footer, compartido por todas las páginas) ─── */
  var BASE_EN = {
    'nav.solutions': 'Solutions',
    'nav.whoFor': "Who it's for",
    'nav.contact': 'Contact',
    'nav.cta': 'Book a call',
    'nav.ctaShort': 'Book',
    'menu.title': 'Menu',
    'menu.soon': 'Coming soon',
    'menu.home': 'Home',
    'menu.about': 'About us',
    'menu.careers': 'Work with us',
    'menu.cases': 'Success stories',
    'foot.region': 'Central America'
  };
  var PAGE_EN = (window.DATIKA_I18N && window.DATIKA_I18N.en) || {};
  var EN = {};
  var k;
  for (k in BASE_EN) EN[k] = BASE_EN[k];
  for (k in PAGE_EN) EN[k] = PAGE_EN[k];

  /* ─── Plantillas de mailto por idioma (y variantes por página) ─── */
  var MAILTO = {
    es: {
      subject: 'Quiero un diagnóstico — DÁTIKA',
      body: 'Hola DÁTIKA,\n\nMi negocio se dedica a: \nLo que más me gustaría resolver: \nFacturación / tamaño aproximado: \n\nQuedo atento(a). ¡Gracias!'
    },
    en: {
      subject: "I'd like a diagnostic — DÁTIKA",
      body: 'Hi DÁTIKA,\n\nMy business does: \nWhat I would most like to solve: \nApproximate revenue / size: \n\nLooking forward to hearing from you. Thanks!'
    },
    'collab-es': {
      subject: 'Quiero colaborar con DÁTIKA',
      body: 'Hola DÁTIKA,\n\nMi especialidad es: \nHerramientas que manejo: \nPortafolio o LinkedIn: \nDisponibilidad: \n\n¡Gracias!'
    },
    'collab-en': {
      subject: 'I want to collaborate with DÁTIKA',
      body: 'Hi DÁTIKA,\n\nMy specialty is: \nTools I work with: \nPortfolio or LinkedIn: \nAvailability: \n\nThanks!'
    }
  };

  function applyMailto(lang) {
    document.querySelectorAll('a.js-mailto').forEach(function (a) {
      var variant = a.getAttribute('data-mailto'); // ej. "collab"
      var key = variant ? variant + '-' + lang : lang;
      var m = MAILTO[key] || MAILTO[variant ? variant + '-es' : 'es'] || MAILTO.es;
      a.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(m.subject) +
        '&body=' + encodeURIComponent(m.body);
    });
    // Correo visible (footer): texto + enlace simple
    document.querySelectorAll('[data-email]').forEach(function (el) {
      el.textContent = EMAIL;
      if (el.tagName === 'A') el.href = 'mailto:' + EMAIL;
    });
  }

  /* ─── Idioma ─── */
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.dataset.i18nEs = el.innerHTML; // el español del HTML es la fuente
  });

  function setLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.dataset.i18n;
      if (lang === 'es') el.innerHTML = el.dataset.i18nEs;
      else if (EN[key] !== undefined) el.innerHTML = EN[key];
    });
    var meta = window.DATIKA_META && window.DATIKA_META[lang];
    if (meta) {
      if (meta.title) document.title = meta.title;
      var m = document.querySelector('meta[name="description"]');
      if (m && meta.desc) m.content = meta.desc;
    }
    var sw = document.getElementById('langSwitch');
    if (sw) {
      sw.classList.toggle('en', lang === 'en');
      sw.querySelectorAll('button').forEach(function (b) {
        var active = b.dataset.lang === lang;
        b.classList.toggle('on', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
    try { localStorage.setItem('datika-lang', lang); } catch (e) {}
    try {
      var url = new URL(location.href);
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    } catch (e) {}
    applyMailto(lang);
  }

  document.querySelectorAll('#langSwitch button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });

  (function initLang() {
    var lang = null;
    try {
      var u = new URLSearchParams(location.search).get('lang');
      if (u === 'en' || u === 'es') lang = u;
    } catch (e) {}
    if (!lang) {
      try {
        var s = localStorage.getItem('datika-lang');
        if (s === 'en' || s === 'es') lang = s;
      } catch (e) {}
    }
    if (lang === 'en') setLang('en');
    else applyMailto('es');
  })();

  /* ─── Tema claro / oscuro ─── */
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    var themeLabel = function () {
      var t = document.documentElement.getAttribute('data-theme');
      themeToggle.setAttribute('aria-label', t === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro');
    };
    themeLabel();
    themeToggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('datika-theme', next); } catch (e) {}
      themeLabel();
    });
  }

  /* ─── Menú ─── */
  var menuBtn = document.getElementById('menuBtn');
  var menuPanel = document.getElementById('menuPanel');
  if (menuBtn && menuPanel) {
    var closeMenu = function () {
      menuPanel.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    };
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menuPanel.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (menuPanel.classList.contains('open') && !menuPanel.contains(e.target) && e.target !== menuBtn) closeMenu();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    menuPanel.querySelectorAll('a:not(.is-soon)').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    /* Toast para entradas "Próximamente" */
    var toastT;
    var showToast = function () {
      var el = document.getElementById('toast');
      if (!el) return;
      var lang = document.documentElement.lang === 'en' ? 'en' : 'es';
      el.textContent = lang === 'en' ? 'Coming soon ✦' : 'Próximamente ✦';
      el.classList.add('show');
      clearTimeout(toastT);
      toastT = setTimeout(function () { el.classList.remove('show'); }, 1900);
    };
    menuPanel.querySelectorAll('[data-soon]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); closeMenu(); showToast(); });
    });
  }

  /* ─── Scroll suave para anclas internas ─── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#') return;
      var t = document.querySelector(id);
      if (t) {
        e.preventDefault();
        var y = t.getBoundingClientRect().top + window.pageYOffset - 12;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
})();
