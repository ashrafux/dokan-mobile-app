(function () {
  // [data-fit] illustrations keep their design size and are zoomed down to the
  // width their container offers.
  var fitBoxes = document.querySelectorAll('[data-fit]');
  function layout() {
    fitBoxes.forEach(function (el) {
      el.style.zoom = '';
      if (!el.offsetWidth) return;
      var parent = el.parentElement;
      var cs = getComputedStyle(parent);
      var avail = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var scale = Math.min(1, avail / el.offsetWidth);
      if (scale < 1) el.style.zoom = scale;
    });
  }
  layout();
  window.addEventListener('resize', layout);
  if (document.fonts) document.fonts.ready.then(layout);

  // App screenshots carousel: click a side screen, a dot, or drag to change the screens.
  var stage = document.querySelector('[data-carousel]');
  if (stage) {
    var images = ['s-drawer.png', 's-order-list.png', 's-stats.png', 's-light-theme.png', 's-product-list.png'];
    var slots = Array.prototype.map.call(stage.querySelectorAll('[data-slot]'), function (el) {
      return el.querySelector('.shot > img, .shots__phone-screen img') || el.querySelector('img');
    });
    var dots = document.querySelectorAll('.dot');
    var initialDot = 4;
    var active = initialDot;
    var mod = function (n, m) { return ((n % m) + m) % m; };

    function render() {
      var offset = active - initialDot;
      slots.forEach(function (img, k) {
        img.src = 'assets/' + images[mod(k + offset, images.length)];
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === active);
        d.setAttribute('aria-selected', i === active);
      });
    }

    function go(index) {
      index = mod(index, dots.length);
      if (index === active) return;
      stage.classList.add('is-swapping');
      setTimeout(function () {
        active = index;
        render();
        stage.classList.remove('is-swapping');
      }, 200);
    }

    render();
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    stage.querySelectorAll('.shot').forEach(function (shot) {
      shot.addEventListener('click', function () { go(active + Number(shot.dataset.slot) - 2); });
    });

    var startX = null;
    stage.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    window.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  // "Go Live In 3 Simple Steps": highlight each step one by one, like the first.
  var steps = document.querySelectorAll('[data-step]');
  if (steps.length) {
    var current = 0;
    var timer;
    function setStep(i) {
      current = i;
      steps.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
    }
    function start() {
      clearInterval(timer);
      timer = setInterval(function () { setStep((current + 1) % steps.length); }, 2500);
    }
    steps.forEach(function (s, i) {
      s.addEventListener('mouseenter', function () { clearInterval(timer); setStep(i); });
      s.addEventListener('mouseleave', start);
    });
    start();
  }

  // Home hero: pin it while the floating cards move into place, then let the page scroll on.
  var pin = document.querySelector('[data-hero-pin]');
  if (pin) {
    var hero = pin.querySelector('.hero');
    var cards = Array.prototype.slice.call(pin.querySelectorAll('[data-hcard]'));
    var canPin = window.matchMedia('(min-width: 1200px) and (prefers-reduced-motion: no-preference)');
    var PIN = 560;          // extra scroll the hero stays pinned for
    var end = 1, ticking = false;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };

    function paint() {
      ticking = false;
      var p = canPin.matches ? Math.min(1, Math.max(0, window.scrollY / end)) : 1;
      cards.forEach(function (c, i) {
        // staggered: each card has its own slice of the scroll
        var e = ease(Math.min(1, Math.max(0, (p - i * 0.12) / 0.6)));
        var fx = parseFloat(c.style.getPropertyValue('--from-x')) || 0;
        c.style.opacity = e;
        c.style.transform = e === 1 ? '' :
          'translate(' + (fx * (1 - e)).toFixed(1) + 'px,' + (140 * (1 - e)).toFixed(1) + 'px) scale(' + (0.6 + 0.4 * e).toFixed(3) + ')';
      });
    }
    function measure() {
      var on = canPin.matches;
      pin.classList.toggle('is-pinned', on);
      pin.style.height = '';
      hero.style.top = '';
      if (on) {
        var h = hero.offsetHeight, vh = window.innerHeight;
        pin.style.height = (h + PIN) + 'px';
        hero.style.top = Math.min(0, vh - h) + 'px';        // stick once the whole hero is in view
        var pinTop = pin.getBoundingClientRect().top + window.scrollY;
        end = pinTop + Math.max(0, h - vh) + PIN;            // cards are fully in when the pin releases
      }
      paint();
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(paint); }
    }, { passive: true });
    window.addEventListener('resize', measure);
    if (canPin.addEventListener) canPin.addEventListener('change', measure);
    window.addEventListener('load', measure);
    measure();
  }

  // Pricing billing tabs: Monthly / Yearly / Lifetime.
  var plans = document.getElementById('plans');
  var billingTabs = document.querySelectorAll('[data-billing-tab]');
  function selectBilling(tab) {
    billingTabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    plans.dataset.active = tab.dataset.billingTab;
  }
  billingTabs.forEach(function (tab, i) {
    tab.tabIndex = tab.classList.contains('is-active') ? 0 : -1;
    tab.addEventListener('click', function () { selectBilling(tab); });
    tab.addEventListener('keydown', function (e) {
      var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      var next = billingTabs[(i + step + billingTabs.length) % billingTabs.length];
      selectBilling(next);
      next.focus();
    });
  });
})();
