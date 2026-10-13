/* movimento.js — movimento DESTE site, reproduzido da referência (Kit de Design, seção "Movimento"; specs/design.md §10).
   Entradas (.mov): fade + subida 16 px, laterais ±24 px, escala .98 ou só fade, 0,5 s, curva expo-out,
   escalonadas 80 ms entre irmãos (máx. 0,4 s). Acordeão: um aberto por vez, altura + fade 0,3 s.
   main.js e base.css não se editam. Tudo respeita prefers-reduced-motion. */
(function () {
  'use strict';
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var itens = document.querySelectorAll('.mov');

  if (reduzir || !('IntersectionObserver' in window)) {
    itens.forEach(function (el) { el.classList.add('visivel'); });
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var irmaos = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('mov'); });
        var i = Math.min(irmaos.indexOf(el), 5);
        if (i > 0) el.style.transitionDelay = (i * 80) + 'ms';
        el.classList.add('visivel');
        /* o atraso só vale para a entrada; depois sai, para não atrasar hovers (lição Guilherme) */
        el.addEventListener('transitionend', function limpar() { el.style.transitionDelay = ''; el.removeEventListener('transitionend', limpar); });
        obs.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    itens.forEach(function (el) { obs.observe(el); });
  }

  /* Acordeão: um aberto por vez; abre e fecha animando a altura da resposta */
  document.querySelectorAll('[data-acordeao]').forEach(function (grupo) {
    var todos = grupo.querySelectorAll('details');
    todos.forEach(function (d) {
      var resumo = d.querySelector('summary');
      var resposta = d.querySelector('.acordeao__resposta');
      resumo.addEventListener('click', function (e) {
        if (reduzir || !resposta.animate) {
          if (!d.open) todos.forEach(function (o) { if (o !== d) o.open = false; });
          return;
        }
        e.preventDefault();
        if (d.open) {
          var h = resposta.offsetHeight;
          var a = resposta.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' });
          resposta.style.overflow = 'hidden';
          a.onfinish = function () { d.open = false; resposta.style.overflow = ''; };
        } else {
          todos.forEach(function (o) { if (o !== d && o.open) o.open = false; });
          d.open = true;
          var alvo = resposta.offsetHeight;
          resposta.style.overflow = 'hidden';
          var b = resposta.animate([{ height: '0px', opacity: 0 }, { height: alvo + 'px', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' });
          b.onfinish = function () { resposta.style.overflow = ''; };
        }
      });
    });
  });
})();
