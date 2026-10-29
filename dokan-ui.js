/* ═══════════════════════════════════════════════════════════════════
   Dokan UI — button hover motion. Load once, at the end of <body>:
   <script src="dokan-ui.js" defer></script>
   It enhances every .dk-btn--primary / --secondary / --ghost / --tertiary
   on the page. Buttons added later: call window.dokanUI(rootElement).
   Without JS the buttons still work and keep their colour hover.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  function el(tag, cls, hidden) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (hidden) n.setAttribute('aria-hidden', 'true');
    return n;
  }
  function takeText(b, skip) {               /* pull the label text out of the button */
    var text = '';
    [].slice.call(b.childNodes).forEach(function (n) {
      if (skip && (n === skip || (n.contains && n.contains(skip)))) return;
      if (n.nodeType === 1 && n.tagName.toLowerCase() === 'svg') return;
      if (n.nodeType === 3 || n.nodeType === 1) { text += n.textContent; b.removeChild(n); }
    });
    return text.replace(/\s+/g, ' ').trim();
  }

  /* 1. PRIMARY — label roll + arrow swap inside the circle (200ms) */
  function primary(b) {
    if (b.dataset.dkUi) return; b.dataset.dkUi = '1';
    var icon = b.querySelector('.dk-btn__icon'), svg = icon && icon.querySelector('svg');
    var text = takeText(b, icon); if (!text) return;
    var roll = el('span', 'dk-roll'), mask = el('span', 'dk-roll__mask');
    var t1 = el('span', 'dk-roll__t'), t2 = el('span', 'dk-roll__t is-clone', true);
    t1.textContent = t2.textContent = text;
    mask.appendChild(t1); mask.appendChild(t2); roll.appendChild(mask);
    if (icon) b.insertBefore(roll, icon); else b.appendChild(roll);
    if (svg) {
      var box = el('span', 'dk-swap'), i1 = el('span', 'dk-swap__i'), i2 = el('span', 'dk-swap__i is-clone', true);
      icon.insertBefore(box, svg);
      i1.appendChild(svg); i2.appendChild(svg.cloneNode(true));
      box.appendChild(i1); box.appendChild(i2);
    }
    if (!b.getAttribute('aria-label')) b.setAttribute('aria-label', text);
  }

  /* 2. SECONDARY / GHOST — radial fill that follows the cursor (500ms expo-out) */
  function radial(b) {
    if (b.dataset.dkUi) return; b.dataset.dkUi = '1';
    if (b.disabled || !b.textContent.trim() || b.querySelector('svg, img')) return;
    var label = el('span', 'dk-rb__label');
    while (b.firstChild) label.appendChild(b.firstChild);
    b.appendChild(label);
    var fill = el('span', 'dk-rb__fill', true);
    fill.appendChild(label.cloneNode(true));
    var ghost = b.classList.contains('dk-btn--ghost');
    fill.style.setProperty('--dk-rb-fill', ghost ? '#FFFFFF' : '#292A29');
    b.appendChild(fill);
    b.classList.add('dk-rb');
    function point(x, y) {
      var w = b.clientWidth, h = b.clientHeight;
      x = Math.min(Math.max(x, 0), w); y = Math.min(Math.max(y, 0), h);
      var r = Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y)) + 1;
      b.style.setProperty('--dk-rb-x', x + 'px');
      b.style.setProperty('--dk-rb-y', y + 'px');
      b.style.setProperty('--dk-rb-r', r);
    }
    function local(e) { var r = b.getBoundingClientRect(); return [e.clientX - r.left - b.clientLeft, e.clientY - r.top - b.clientTop]; }
    point(b.clientWidth / 2, b.clientHeight / 2);
    var mouse = false;
    b.addEventListener('pointerenter', function (e) { mouse = true; var p = local(e); point(p[0], p[1]); b.classList.add('is-active'); });
    b.addEventListener('pointermove', function (e) { if (b.classList.contains('is-active')) { var p = local(e); point(p[0], p[1]); } });
    b.addEventListener('pointerleave', function (e) { mouse = false; var p = local(e); point(p[0], p[1]); if (!b.matches(':focus-visible')) b.classList.remove('is-active'); });
    b.addEventListener('focus', function () { if (!mouse && b.matches(':focus-visible')) { point(b.clientWidth / 2, b.clientHeight / 2); b.classList.add('is-active'); } });
    b.addEventListener('blur', function () { if (!mouse) b.classList.remove('is-active'); });
  }

  /* 3. TERTIARY — label roll + diagonal arrow + underline with a travelling 14px gap (350ms) */
  function measure(a) {                       /* the label window stops just above the underline */
    var label = a.querySelector('.dk-tb__label'); if (!label) return;
    var mask = label.querySelector('.dk-tb__mask'), ts = label.querySelectorAll('.dk-tb__t'), line = label.querySelector('.dk-tb__line');
    mask.style.height = mask.style.marginTop = mask.style.marginBottom = '';
    ts.forEach(function (t) { t.style.height = t.style.paddingTop = ''; });
    var fs = parseFloat(getComputedStyle(a).fontSize) || 16;
    var t1 = ts[0], top = t1.getBoundingClientRect().top, L = t1.getBoundingClientRect().height;
    var mark = el('span'); mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    t1.appendChild(mark); var base = mark.getBoundingClientRect().top - top; t1.removeChild(mark);
    var off = parseFloat(a.dataset.dkOff); if (isNaN(off)) off = fs * .1;
    var th = parseFloat(a.dataset.dkTh); th = isNaN(th) ? Math.max(1, Math.round(fs / 16)) : Math.max(1, Math.round(th));
    var lineTop = base + off, e1 = Math.round(fs * .2), bottom = Math.max(base + fs * .2, lineTop - 1), H = bottom + e1;
    ts.forEach(function (t) { t.style.height = H + 'px'; t.style.paddingTop = e1 + 'px'; });
    mask.style.height = H + 'px'; mask.style.marginTop = (-e1) + 'px'; mask.style.marginBottom = (L - bottom) + 'px';
    line.style.top = lineTop + 'px'; line.style.height = th + 'px';
  }
  function tertiary(a) {
    if (a.dataset.dkUi) return; a.dataset.dkUi = '1';
    var cs = getComputedStyle(a);
    var off = parseFloat(cs.textUnderlineOffset), th = parseFloat(cs.textDecorationThickness);
    if (!isNaN(off)) a.dataset.dkOff = off;
    if (!isNaN(th)) a.dataset.dkTh = th;
    var icon = a.querySelector('svg'); if (icon) a.removeChild(icon);
    var text = takeText(a); if (!text) return;
    var label = el('span', 'dk-tb__label'), mask = el('span', 'dk-tb__mask');
    var t1 = el('span', 'dk-tb__t'), t2 = el('span', 'dk-tb__t is-clone', true);
    t1.textContent = t2.textContent = text;
    mask.appendChild(t1); mask.appendChild(t2); label.appendChild(mask);
    var line = el('span', 'dk-tb__line', true); line.innerHTML = '<i></i><i class="is-clone"></i>';
    label.appendChild(line); a.appendChild(label);
    if (icon) {
      var box = el('span', 'dk-tb__ico'), i1 = el('span', 'dk-tb__io'), i2 = el('span', 'dk-tb__io is-clone', true);
      i1.appendChild(icon); i2.appendChild(icon.cloneNode(true));
      box.appendChild(i1); box.appendChild(i2); a.appendChild(box);
    }
    if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', text);
    a.classList.add('dk-tb');
    measure(a);
  }

  function run(root) {
    root = root || document;
    root.querySelectorAll('.dk-btn--primary').forEach(primary);
    root.querySelectorAll('.dk-btn--secondary, .dk-btn--ghost').forEach(radial);
    root.querySelectorAll('.dk-btn--tertiary').forEach(tertiary);
  }
  function remeasure() { document.querySelectorAll('.dk-tb').forEach(measure); }
  window.dokanUI = run;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { run(); }); else run();
  window.addEventListener('load', remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(remeasure, 150); });
})();
