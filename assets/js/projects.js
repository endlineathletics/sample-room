/* =====================================================================
   ORDO — projects.js
   Projects 페이지(projects.html)와 Home(index.html)이 같이 써요.
   - #pj-root 가 있으면: 필터 줄 + 전체 작업 그리드(데스크톱 빈칸 리듬)
   - #hm-featured 가 있으면: Home 대표 작업 4개 + 문구를 site.js 값으로
   작업·카테고리는 전부 data/works.js 에서 읽어요(여기서 고칠 것 없음).
   ===================================================================== */
(function () {
  'use strict';
  var O = window.ORDO;
  if (!O) return;
  var doc = document;
  var esc = O.esc;

  /* ---------- 카드 ---------- */
  function metaText(w) {
    return [w.categoryLabel, w.year].filter(Boolean).join(' · ');
  }

  function cardHTML(w, opts) {
    opts = opts || {};
    var meta = metaText(w);
    var cover = w.cover || {};
    var label = (cover.groupLabel ? cover.groupLabel.toUpperCase() + ' ' + (cover.n || '01') : 'LOOK 01') + ' · 3:4';
    var name = '(' + w.no3 + ') ' + w.title + (w.titleKo ? ' — ' + w.titleKo : '') + (meta ? ', ' + meta : '');
    var delay = opts.col ? ' style="--reveal-delay: ' + (opts.col * 60) + 'ms"' : '';
    return '<li class="pj-cell reveal"' + delay + '>' +
      '<a class="pj-card" href="' + esc(w.url) + '" aria-label="' + esc(name) + '" data-id="' + esc(w.id) + '">' +
        '<span class="pj-card__no t-label" aria-hidden="true">(' + esc(w.no3) + ')</span>' +
        '<span class="pj-card__media on-dark">' +
          O.photoHTML({ img: cover, ratio: '3:4', label: label, priority: !!opts.priority, tag: 'span', className: 'pj-card__ph' }) +
          '<span class="pj-card__ov" aria-hidden="true">' +
            '<span class="pj-card__top">' +
              '<span class="pj-card__en" lang="en">' + esc(w.title) + '</span>' +
              (w.titleKo ? '<span class="pj-card__ko">' + esc(w.titleKo) + '</span>' : '') +
            '</span>' +
            '<span class="pj-card__bot">' +
              (w.summary ? '<span class="pj-card__sum">' + esc(w.summary) + '</span>' : '') +
              (meta ? '<span class="pj-card__meta t-label">' + esc(meta) + '</span>' : '') +
              '<span class="pj-card__view" lang="en">View project <span class="arrow">→</span></span>' +
            '</span>' +
          '</span>' +
        '</span>' +
        '<span class="pj-card__cap" aria-hidden="true">' +
          '<span class="pj-card__cap-t" lang="en">' + esc(w.title) + '</span>' +
          (meta ? '<span class="pj-card__cap-m t-label">' + esc(meta) + '</span>' : '') +
        '</span>' +
      '</a>' +
    '</li>';
  }

  /* 데스크톱 빈칸 리듬: 8칸마다 2번째·7번째 칸을 비움(작업이 6개 미만이면 없음).
     빈칸은 작업 앞에만 넣으므로 끝에 빈칸이 남지 않아요. 태블릿·모바일에서는 CSS가 숨겨요. */
  var BLANK_SLOTS = { 1: true, 6: true };
  function gridHTML(list, opts) {
    opts = opts || {};
    var withBlanks = opts.blanks && list.length >= 6;
    var html = '', pos = 0;
    list.forEach(function (w, i) {
      if (withBlanks) {
        while (BLANK_SLOTS[pos % 8]) { html += '<li class="pj-cell pj-cell--blank" aria-hidden="true"></li>'; pos++; }
      }
      html += cardHTML(w, { col: O.isMobile() ? 0 : pos % 4, priority: opts.priority && i === 0 });
      pos++;
    });
    return html;
  }

  /* ---------- Projects 페이지 ---------- */
  function initProjects(grid) {
    var bar = doc.getElementById('pj-bar');
    var filterEl = doc.getElementById('pj-filter');
    var countEl = doc.getElementById('pj-count');
    var cats = O.categories();
    var all = O.getWorks();

    if (!all.length) {
      grid.innerHTML = '<li class="pj-empty">아직 공개한 작업이 없어요. 작업을 추가하면 여기에 나와요. ' +
        '<a class="link" href="contact.html#form">의뢰 문의 <span class="arrow" aria-hidden="true">→</span></a></li>';
      return;
    }

    var valid = {};
    cats.forEach(function (c) { valid[c.id] = true; });
    var current = (O.param('category') || 'all').toLowerCase();
    if (!valid[current]) current = 'all';

    filterEl.innerHTML = cats.map(function (c) {
      return '<li><button class="tbtn" type="button" data-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === current) + '">' +
        esc(c.label) + '&nbsp;(' + c.count + ')</button></li>';
    }).join('');
    if (bar) bar.hidden = false;

    function countText(n) { return n + (n === 1 ? ' Project' : ' Projects'); }

    function render() {
      var list = O.getWorks({ category: current });
      grid.innerHTML = gridHTML(list, { blanks: true, priority: true });
      countEl.textContent = countText(list.length);
    }

    var timer = 0;
    function setCategory(cat) {
      if (cat === current || !valid[cat]) return;
      current = cat;
      filterEl.querySelectorAll('.tbtn').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === current));
      });
      // 주소에 기억(뒤로 왔을 때 같은 필터)
      try {
        var url = location.pathname + (current === 'all' ? '' : '?category=' + encodeURIComponent(current)) + location.hash;
        history.replaceState(null, '', url);
      } catch (e) { /* file:// 등 */ }

      clearTimeout(timer);
      if (O.reducedMotion()) { render(); O.revealAll(grid); return; }
      grid.classList.add('is-fading');
      timer = setTimeout(function () {
        render();
        O.revealAll(grid);          // 필터 교체 직후에는 리빌 없이 바로 보이게(페이드만)
        requestAnimationFrame(function () { grid.classList.remove('is-fading'); });
      }, 200);
    }

    filterEl.addEventListener('click', function (e) {
      var b = e.target.closest('.tbtn');
      if (b) setCategory(b.getAttribute('data-cat'));
    });

    render();
  }

  /* ---------- Home ---------- */
  function setText(sel, text) {
    var el = doc.querySelector(sel);
    if (el && text) el.textContent = text;
    return el;
  }

  function initHome(grid) {
    var s = O.site;
    setText('[data-hm="headline"]', s.headline);
    setText('[data-hm="headlineKo"]', s.headlineKo);
    if (s.descriptor) setText('[data-hm="tag"]', '(' + s.descriptor + ')');
    var intro = doc.querySelector('[data-hm="intro"]');
    if (intro && Array.isArray(s.intro) && s.intro.length) {
      intro.innerHTML = s.intro.map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('');
    }
    var kw = doc.querySelector('[data-hm="keywords"]');
    if (kw && Array.isArray(s.keywords) && s.keywords.length) {
      kw.innerHTML = s.keywords.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('');
    }
    // 주소 · 전화 · 방문 안내 (site.js 값, 비어 있으면 줄을 숨김)
    var loc = doc.querySelector('[data-hm="loc"]');
    if (loc) {
      var parts = [];
      var addr = O.address(), ph = O.phone();
      if (addr) parts.push(esc(addr));
      if (ph) parts.push('<a class="link" href="' + esc(ph.href) + '">' + esc(ph.text) + '</a>');
      if (s.visit && !O.isPlaceholder(s.visit)) parts.push(esc(s.visit));
      if (parts.length) { loc.innerHTML = parts.join(' · '); loc.hidden = false; }
    }

    var works = O.getWorks();
    var pick = works.filter(function (w) { return w.featured; });
    works.forEach(function (w) { if (pick.length < 4 && pick.indexOf(w) < 0) pick.push(w); });
    pick = pick.slice(0, 4);
    if (!pick.length) {
      var sec = grid.closest('section');
      if (sec) sec.hidden = true;
      return;
    }
    grid.innerHTML = gridHTML(pick, { blanks: false, priority: false });
  }

  var pj = doc.getElementById('pj-root');
  if (pj) initProjects(pj);
  var hm = doc.getElementById('hm-featured');
  if (hm) initHome(hm);
})();
