/* =====================================================
   Tindahan ng mga Alaala  |  shared script for all 9 pages
   1. Draws the little icons
   2. Morph transition between the store and the pages
   3. Photo viewer, tabs, joke reveal, missing-photo notes
   ===================================================== */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* ---------- 1. Icons ---------- */
  var ICONS = {
    kite: '<path d="M24 3 38 18 24 34 10 18Z" fill="currentColor"/><path class="s2" d="M24 3V34M10 18H38" stroke-width="2" fill="none"/><path d="M24 34c-6 2-6 6 0 8s5 3 0 5" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    house: '<path d="M5 23 24 7l19 16" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 21v19h26V21L24 10Z" fill="currentColor"/><rect class="f2" x="20" y="27" width="8" height="13" rx="1"/>',
    friends: '<circle cx="17" cy="17" r="6" fill="currentColor"/><circle cx="31" cy="17" r="6" fill="currentColor"/><path d="M5 40c0-8 5-13 12-13s12 5 12 13Z" fill="currentColor"/><path d="M25 40c0-6 2-10 6-12 7 0 12 5 12 12Z" fill="currentColor" opacity=".8"/>',
    heart: '<path d="M24 41C8 29 5 17 12 12c5-3 10-1 12 4 2-5 7-7 12-4 7 5 4 17-12 29Z" fill="currentColor"/>',
    bowl: '<path d="M5 22h38c0 11-8 19-19 19S5 33 5 22Z" fill="currentColor"/><path d="M16 17c-2-3 2-4 0-8M24 17c-2-3 2-4 0-8M32 17c-2-3 2-4 0-8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    clap: '<rect x="6" y="19" width="36" height="21" rx="3" fill="currentColor"/><path d="M6 19 40 9l2 7L8 26Z" fill="currentColor"/><path class="s2" d="M14 15.5l5 6M24 12.5l5 6M34 9.5l5 6" stroke-width="3"/>',
    note: '<path d="M18 36V10l20-4v26" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linejoin="round"/><ellipse cx="13" cy="36" rx="7" ry="5.5" fill="currentColor"/><ellipse cx="33" cy="32" rx="7" ry="5.5" fill="currentColor"/>',
    laugh: '<path d="M8 6h32a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H22l-9 8v-8H8a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Z" fill="currentColor"/><path class="s2" d="M14 16h6M28 16h6" stroke-width="3" stroke-linecap="round"/><path class="f2" d="M14 23c3 7 17 7 20 0Z"/>'
  };
  function svg(name) {
    return '<svg viewBox="0 0 48 48" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-icon]'), function (el) {
    el.innerHTML = svg(el.getAttribute('data-icon'));
  });

  /* ---------- 2. Morph transition ---------- */
  var PACKS = {
    childhood: { title: 'Childhood Memories', icon: 'kite',    c: '#d4381f', cd: '#8f2410', t: '#ffffff' },
    family:    { title: 'My Family & Relatives', icon: 'house', c: '#2563c9', cd: '#153f8a', t: '#ffffff' },
    friends:   { title: 'My Friends', icon: 'friends',          c: '#f7b500', cd: '#9a6400', t: '#2a1b00' },
    love:      { title: 'Me & My Love', icon: 'heart',          c: '#d81b60', cd: '#8f0f3f', t: '#ffffff' },
    food:      { title: 'My Favorite Food', icon: 'bowl',       c: '#2e8b34', cd: '#1b5c20', t: '#ffffff' },
    movie:     { title: 'My Favorite Movie', icon: 'clap',      c: '#7b3fbf', cd: '#4a2279', t: '#ffffff' },
    song:      { title: 'My Song', icon: 'note',                c: '#f08300', cd: '#8f4a00', t: '#2a1500' },
    jokes:     { title: 'Joke Time', icon: 'laugh',              c: '#0a7d70', cd: '#054b43', t: '#ffffff' }
  };
  var EASE = 'cubic-bezier(.76,0,.2,1)';
  var FULL = 'inset(0px 0px 0px 0px round 0px)';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(key, val) { try { if (val === null) sessionStorage.removeItem(key); else sessionStorage.setItem(key, val); } catch (e) {} }
  function load(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }

  function insetOf(r) {
    var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
    return 'inset(' + r.top + 'px ' + (w - r.right) + 'px ' + (h - r.bottom) + 'px ' + r.left + 'px round 14px)';
  }
  function makeOverlay(id) {
    var p = PACKS[id];
    var m = document.createElement('div');
    m.id = 'morph';
    m.style.setProperty('--c', p.c); m.style.setProperty('--cd', p.cd); m.style.setProperty('--t', p.t);
    m.innerHTML = '<div class="mo-inner"><span class="p-burst">' + svg(p.icon) + '</span><b>' + p.title.replace(/&/g, '&amp;') + '</b></div>';
    document.documentElement.appendChild(m);
    return m;
  }
  function removeOverlay() {
    var m = document.getElementById('morph');
    if (m) m.remove();
  }
  function frames(n) {
    return new Promise(function (res) { (function f() { if (n-- <= 0) res(); else requestAnimationFrame(f); })(); });
  }

  /* leaving a page: grow a colored sachet from the clicked element, then go */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-go], a[data-back]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (reduce || !a.animate) return;           // normal link, no animation
    e.preventDefault();
    var go = a.getAttribute('data-go'), back = a.getAttribute('data-back');
    var id = go || back, href = a.href;
    store('mm', JSON.stringify({ kind: go ? 'open' : 'back', id: id }));
    var m = makeOverlay(id);
    var r = a.getBoundingClientRect();
    var anim = m.animate([{ clipPath: insetOf(r) }, { clipPath: FULL }], { duration: 650, easing: EASE, fill: 'both' });
    m.firstChild.animate([{ opacity: 0, transform: 'scale(.55)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 420, delay: 240, easing: 'ease-out', fill: 'both' });
    anim.finished.then(function () { location.href = href; }, function () { location.href = href; });
  });

  /* arriving on a page: the colored sachet is already full-screen, so let it fade
     (opening a memory) or shrink back into its pack (returning to the store) */
  function arrive() {
    var raw = load('mm'), mm = null;
    store('mm', null);
    try { mm = JSON.parse(raw); } catch (e) {}
    var root = document.documentElement;
    if (!mm || !PACKS[mm.id] || reduce || !document.body.animate) { root.classList.remove('arriving'); return; }
    var m = makeOverlay(mm.id);
    root.classList.remove('arriving');

    function fade() {
      return m.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, delay: 120, easing: 'ease', fill: 'both' }).finished;
    }
    if (mm.kind === 'back') {
      var pk = document.querySelector('.pack[data-go="' + mm.id + '"]');
      if (!pk) { fade().then(removeOverlay, removeOverlay); return; }
      pk.classList.add('gone');
      pk.scrollIntoView({ block: 'center' });
      frames(2).then(function () {
        var r = pk.getBoundingClientRect();
        m.firstChild.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in', fill: 'both' });
        return m.animate([{ clipPath: FULL }, { clipPath: insetOf(r) }], { duration: 600, easing: EASE, fill: 'both' }).finished;
      }).then(function () {
        pk.classList.remove('gone');
        return m.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'both' }).finished;
      }).then(removeOverlay, removeOverlay);
    } else {
      fade().then(removeOverlay, removeOverlay);
    }
  }
  arrive();
  /* browser Back button can restore a page from cache with the overlay still on it */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { removeOverlay(); document.documentElement.classList.remove('arriving'); }
  });

  /* ---------- 3. Page helpers ---------- */

  /* photos that are not in the folder yet show a note instead of a broken image */
  function checkImg(img) {
    var pol = img.closest('.polaroid');
    if (!pol) return;
    function bad() { pol.classList.add('missing'); }
    if (img.complete && img.naturalWidth === 0) bad();
    img.addEventListener('error', bad);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.polaroid img'), checkImg);

  /* photo viewer */
  var lb = null;
  function openLightbox(src, alt) {
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'lb'; lb.hidden = true;
      lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Photo viewer');
      lb.innerHTML = '<img alt=""><button type="button">Close</button>';
      lb.addEventListener('click', function () { lb.hidden = true; });
      document.body.appendChild(lb);
    }
    lb.firstChild.src = src; lb.firstChild.alt = alt || '';
    lb.hidden = false;
  }
  document.addEventListener('click', function (e) {
    var img = e.target.closest && e.target.closest('.polaroid img');
    if (img && !img.closest('.missing')) openLightbox(img.src, img.alt);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb) lb.hidden = true; });

  /* joke reveal */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-reveal]');
    if (b) b.closest('.joke').classList.add('open');
  });

  /* tabs (movie and song pages) */
  var tabs = document.querySelector('.tabs');
  if (tabs) {
    var btns = Array.prototype.slice.call(tabs.querySelectorAll('[data-tab]'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.tabpanel'));
    var show = function (id) {
      btns.forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === id ? 'true' : 'false'); });
      panels.forEach(function (p) {
        var on = p.id === 'tp-' + id;
        p.hidden = !on;
        if (!on) Array.prototype.forEach.call(p.querySelectorAll('video'), function (v) { v.pause(); });
      });
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-tab')); }); });
    show(btns[0].getAttribute('data-tab'));
  }
})();
