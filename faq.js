/* ══════════ Dokan FAQ — accordion ══════════
   Load once at the end of <body>: <script src="faq.js" defer></script>
   One answer open at a time; clicking the open question closes it. Works
   for every .faq-list on the page. */
(function () {
  function init() {
    document.querySelectorAll('.faq-list').forEach(function (list) {
      var qs = list.querySelectorAll('.faq-q');
      qs.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var open = btn.getAttribute('aria-expanded') === 'true';
          qs.forEach(function (o) {
            o.setAttribute('aria-expanded', 'false');
            o.nextElementSibling.classList.remove('is-open');
          });
          if (!open) { btn.setAttribute('aria-expanded', 'true'); btn.nextElementSibling.classList.add('is-open'); }
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();   /* if the page uses GSAP pins */
        });
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
