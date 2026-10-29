/* Dokan header menu — mega menus (desktop) + dropdown with accordions (≤1200px).
   Vanilla JS, no dependencies. Load once, before </body>, after menu.html's markup. */
(function () {
  var host = document.getElementById('site-nav');
  if (!host) return;
  var variant = host.dataset.variant || 'light';
  var logoImg = host.querySelector('.menu-logo img');
  var LOGO_LIGHT = host.dataset.logoLight, LOGO_DARK = host.dataset.logoDark;
  var logo = variant === 'dark' && LOGO_DARK ? LOGO_DARK : (LOGO_LIGHT || (logoImg && logoImg.getAttribute('src')));
  if (logoImg && logo) logoImg.setAttribute('src', logo);
  var mobileNav = window.matchMedia('(max-width:1200px)');

  /* ---------- Mega menus (Product / Solutions / Resource) ---------- */
  (function () {
    var current = null, closeTimer = null;
    var menus = [].slice.call(host.querySelectorAll('.menu-links li[data-mega]')).map(function (li) {
      return { li: li, link: li.querySelector('a'), panel: host.querySelector('#' + li.dataset.mega) };
    }).filter(function (m) { return m.panel; });
    if (!menus.length) return;

    function paint(m, open) {
      m.panel.classList.toggle('is-open', open);
      m.li.classList.toggle('is-open', open);
      m.link.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    /* The page dim: one transparent box on <body> laid over the open panel; its
       huge outer box-shadow darkens everything else, and pointer-events:none
       lets outside clicks through so they can close the menu. */
    var shade = document.createElement('div');
    shade.className = 'mega-shade';
    shade.setAttribute('aria-hidden', 'true');
    document.body.appendChild(shade);
    function placeShade() {
      if (!current) return;
      var r = current.panel.getBoundingClientRect();
      shade.style.left   = (r.left + window.scrollX) + 'px';
      shade.style.top    = (r.top + window.scrollY) + 'px';
      shade.style.width  = r.width + 'px';
      shade.style.height = r.height + 'px';
    }
    window.addEventListener('resize', placeShade);
    function open(m) {
      if (current === m) return;
      if (current) paint(current, false);
      current = m || null;
      if (current) paint(current, true);
      placeShade();
      shade.classList.toggle('is-on', !!current);
      host.classList.toggle('is-mega-open', !!current && !mobileNav.matches);   /* desktop sheet only */
      /* on a dark hero the white logo would vanish on the white sheet */
      if (variant === 'dark' && logoImg && LOGO_LIGHT) {
        logoImg.setAttribute('src', current && !mobileNav.matches ? LOGO_LIGHT : logo);
      }
    }
    function closeAll() { open(null); }
    host.__megaClose = closeAll;
    function cancelClose() { clearTimeout(closeTimer); }
    function scheduleClose() { cancelClose(); closeTimer = setTimeout(closeAll, 140); }

    menus.forEach(function (m) {
      /* hover opens on desktop only; on touch / the dropdown, taps toggle */
      m.li.addEventListener('mouseenter', function () { if (mobileNav.matches) return; cancelClose(); open(m); });
      m.li.addEventListener('mouseleave', function () { if (!mobileNav.matches) scheduleClose(); });
      m.panel.addEventListener('mouseenter', cancelClose);
      m.panel.addEventListener('mouseleave', scheduleClose);
      m.link.addEventListener('click', function (e) {
        e.preventDefault(); cancelClose(); open(current === m ? null : m);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && current) { var l = current.link; closeAll(); l.focus(); }
    });
    function outside(e) {
      if (!current) return;
      if (!current.panel.contains(e.target) && !current.li.contains(e.target)) closeAll();
    }
    document.addEventListener('click', outside);
    document.addEventListener('focusin', outside);
  })();

  /* ---------- Mobile dropdown ---------- */
  (function () {
    var t = host.querySelector('#menuToggle'), l = host.querySelector('#menuLinks');
    if (!t || !l) return;

    /* The mega sheets are desktop-only, so below 1200px each one is mirrored
       as an accordion inside its own <li>: group headings plus plain links,
       built from the same markup so the two never drift apart. The mega
       script's is-open class on the <li> expands it (one at a time). */
    function label(node) {
      var n = node.querySelector('.t') || node, out = '';
      n.childNodes.forEach(function (c) {
        out += c.nodeName === 'BR' ? ' ' : (c.nodeType === 3 || c.nodeType === 1 ? c.textContent : '');
      });
      return out.replace(/\s+/g, ' ').trim();
    }
    l.querySelectorAll('li[data-mega]').forEach(function (li) {
      var panel = host.querySelector('#' + li.dataset.mega);
      if (!panel) return;
      var sub = document.createElement('div'), inner = document.createElement('div');
      sub.className = 'msub'; inner.className = 'msub-inner';
      panel.querySelectorAll('.mega-col, .mega-listcol').forEach(function (col) {
        var g = document.createElement('div'), h = col.querySelector('.mega-head, .mega-h');
        g.className = 'msub-group';
        if (h) { var p = document.createElement('p'); p.className = 'msub-h'; p.textContent = label(h); g.appendChild(p); }
        col.querySelectorAll('a').forEach(function (a) {
          var x = document.createElement('a');
          x.href = a.getAttribute('href') || '#';
          x.textContent = label(a);
          if (a.classList.contains('mega-more')) x.className = 'msub-more';
          g.appendChild(x);
        });
        inner.appendChild(g);
      });
      sub.appendChild(inner); li.appendChild(sub);
      sub.addEventListener('transitionend', fit);   /* re-fit once an accordion settles */
    });

    /* Cap the dropdown to what is visible (viewport and any clipping
       ancestor); beyond that it scrolls inside itself. */
    function fit() {
      if (!l.classList.contains('is-open')) return;
      var top = l.getBoundingClientRect().top, bottom = window.innerHeight;
      for (var el = host.parentElement; el && el !== document.body; el = el.parentElement) {
        var cs = getComputedStyle(el);
        if (cs.overflowY !== 'visible' || cs.overflowX !== 'visible') bottom = Math.min(bottom, el.getBoundingClientRect().bottom);
      }
      l.style.maxHeight = Math.max(220, bottom - top - 12) + 'px';
    }
    function setOpen(open) {
      l.classList.toggle('is-open', open);
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) fit();
      else if (host.__megaClose) host.__megaClose();
    }
    t.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!l.classList.contains('is-open'));
    });
    document.addEventListener('click', function (e) {
      if (l.classList.contains('is-open') && !l.contains(e.target) && !t.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && l.classList.contains('is-open')) { setOpen(false); t.focus(); }
    });
    window.addEventListener('resize', fit);
  })();
})();
