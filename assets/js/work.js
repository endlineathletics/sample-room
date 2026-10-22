/* =====================================================================
   ORDO — work.js (Work 페이지 전용, ref3)
   - 거대한 ORDO 를 화면 폭에 맞춰요(글자 잉크 기준, 가로 밀림 없음)
   - 작업마다 머리 줄 · [+] 정보 패널 · 사진 매소너리를 그려요
   - 매소너리: 12칸(모바일 4칸) grid + dense + 4px 행 단위.
     사진마다 크기 등급(S·M·L)을 작업 번호로 시드한 결정적 리듬으로 정하고(늘 같은 결과),
     가로 사진은 한 단계 넓게. 행 수 = 실제 너비 × (세로/가로) ÷ 행 단위.
     실제 사진이 불러와지면 그 사진 비율로, 창 크기가 바뀌면 그 너비로 다시 계산해요.
   이 파일은 data/works.js 의 사진 목록(w.images)만 읽어요. 사진을 추가하면 자동으로 배치돼요.
   ===================================================================== */
(function () {
  'use strict';

  var O = window.ORDO;
  var doc = document;
  var root = doc.getElementById('wk-root');
  if (!O || !root) return;

  var esc = O.esc;
  var site = O.site || {};
  var main = doc.querySelector('.page--work') || doc.body;

  /* ------------------------------------------------------------------
     0. 설정
     ------------------------------------------------------------------ */
  function cssPx(name, fallback) {
    var v = parseFloat(getComputedStyle(main).getPropertyValue(name));
    return v > 0 ? v : fallback;
  }
  // 크기 등급 → 칸 수. 0=S 1=M 2=L 3=XL(가로 사진 L)
  var SPANS = {
    desktop: { cols: 12, S: 2, M: 3, L: [4, 5], XL: 6, tallMax: 4, sqMax: 4, vtallMax: 3, allowed: [2, 3, 4, 5, 6] },
    tablet:  { cols: 12, S: 3, M: 4, L: [6, 6], XL: 8, tallMax: 5, sqMax: 6, vtallMax: 4, allowed: [3, 4, 5, 6, 8] },
    mobile:  { cols: 4,  S: 2, M: 2, L: [4, 4], XL: 4, tallMax: 4, sqMax: 4, vtallMax: 2, allowed: [2, 4] }
  };
  var LANDSCAPE = 1.1;   // 가로/세로 가 이보다 크면 가로 사진 → 한 단계 넓게
  var TALL = 0.7;        // 이보다 작으면(2:3 보다 길쭉) 너무 길어지지 않게 L 폭을 줄여요
  var VTALL = 0.6;       // 9:16 처럼 아주 길쭉하면 더 좁게

  function bp() {
    var w = window.innerWidth || doc.documentElement.clientWidth;
    try {
      if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop';
      if (window.matchMedia('(min-width: 768px)').matches) return 'tablet';
      return 'mobile';
    } catch (e) {
      return w >= 1024 ? 'desktop' : (w >= 768 ? 'tablet' : 'mobile');
    }
  }

  /* ------------------------------------------------------------------
     1. 머리 정보 줄 채우기 (site.js · works.js 값)
     ------------------------------------------------------------------ */
  var works = O.getWorks();

  function fill(key, text) {
    var el = doc.querySelector('[data-wk="' + key + '"]');
    if (el && text != null) el.textContent = text;
  }
  if (!O.isPlaceholder(site.city)) fill('city', site.city);
  if (!O.isPlaceholder(site.year)) fill('year', site.year);
  fill('count', works.length ? '(' + O.pad(works.length, 2) + ')' : '(00)');
  fill('range', works.length ? '(001' + (works.length > 1 ? '–' + O.pad(works.length, 3) : '') + ')' : '');
  var cats = O.categories().filter(function (c) { return c.id !== 'all'; }).map(function (c) { return c.label; });
  if (cats.length) fill('cats', cats.join(', '));

  /* ------------------------------------------------------------------
     2. 거대한 ORDO — 글자 잉크가 좌우 여백 안쪽 끝에 정확히 닿게
     ------------------------------------------------------------------ */
  var giant = doc.querySelector('.wk-giant');
  var giantT = giant && giant.querySelector('.wk-giant__t');
  var measureCtx = null;
  /* 설계서대로 글자 크기는 약 27vw 로 두고(높이가 첫 화면을 다 먹지 않게),
     네 글자를 화면 폭에 고르게 벌려 ref3 처럼 '넓게 흩어진' 워드마크로 만들어요.
     첫 글자 왼쪽·마지막 글자 오른쪽 잉크가 좌우 여백 끝에 닿도록 사이드 베어링만큼 당겨요. */
  var giantText = giantT ? giantT.textContent.trim() : '';
  if (giantT && giantText) {
    giantT.innerHTML = giantText.split('').map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('');
    giantT.classList.add('is-spread');
  }
  function fitGiant() {
    if (!giant || !giantT || !giantText) return;
    var W = giant.clientWidth;
    if (!W) return;
    giantT.style.fontSize = '';
    var cs = getComputedStyle(giantT);
    var fs = parseFloat(cs.fontSize) || 100;             // CSS 27vw
    try {
      if (!measureCtx) measureCtx = doc.createElement('canvas').getContext('2d');
      measureCtx.font = cs.fontWeight + ' 100px ' + cs.fontFamily;
      var first = measureCtx.measureText(giantText.charAt(0));
      var last = measureCtx.measureText(giantText.charAt(giantText.length - 1));
      var whole = measureCtx.measureText(giantText);
      if (typeof first.actualBoundingBoxLeft === 'number' && whole.width > 0) {
        // 글자끼리 붙을 만큼 좁은 화면이면 조금 줄임(글자 사이가 적어도 3% 남게)
        var maxFs = W * 100 / (whole.width * 1.03);
        if (fs > maxFs) { fs = Math.floor(maxFs * 100) / 100; giantT.style.fontSize = fs + 'px'; }
        var k = fs / 100;
        giantT.style.marginLeft = (first.actualBoundingBoxLeft * k).toFixed(2) + 'px';
        giantT.style.marginRight = (-(last.width - last.actualBoundingBoxRight) * k).toFixed(2) + 'px';
      }
    } catch (e) { /* 측정이 안 되면 그냥 27vw 로 벌려 둠 */ }
  }
  fitGiant();
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fitGiant, function () {});

  /* ------------------------------------------------------------------
     3. 크기 리듬 — 작업 번호로 시드한 결정적 난수(랜덤 금지, 늘 같은 구성)
        비율과 무관하게 먼저 뽑아 두어, 실제 사진이 들어와도 리듬은 그대로예요
     ------------------------------------------------------------------ */
  function rhythm(w, n) {
    var r = O.rng((w.no || 1) * 7919 + 101);
    var out = [], prev = -1, run = 0, hasL = false;
    for (var i = 0; i < n; i++) {
      var u = r(), u2 = r(), alt = r();                  // 사진마다 같은 횟수만 뽑아요(결정성 유지)
      var lv;
      if (i === 0) lv = u < 0.55 ? 2 : 1;                 // 첫 사진은 크게(L) 또는 중간(M)
      else lv = u < 0.42 ? 0 : (u < 0.78 ? 1 : 2);
      if (lv === prev && run >= 2) lv = (lv + 1 + (u2 < 0.5 ? 0 : 1)) % 3;   // 같은 크기 세 번 연속 금지
      run = lv === prev ? run + 1 : 1;
      prev = lv;
      if (lv === 2) hasL = true;
      out.push({ lv: lv, alt: alt < 0.5 ? 0 : 1 });
    }
    if (n >= 3 && !hasL) out[1 + Math.floor(r() * (n - 1))].lv = 2;   // 큰 사진 하나는 꼭
    return out;
  }

  // 너무 길쭉한 사진·정사각 사진은 L 폭을 줄여 한 장이 화면을 다 차지하지 않게
  function capFor(value, s) {
    if (value < VTALL) return s.vtallMax;
    if (value < TALL) return s.tallMax;
    if (value <= LANDSCAPE) return value >= 0.9 ? s.sqMax : s.L[1];
    return s.cols;
  }

  // 룩이 아닌 사진(디테일·안쪽·패턴)은 M 까지만 → 룩 사진이 가장 크게 보이는 위계
  function groupCap(group, s) { return group && group !== 'look' ? s.M : s.cols; }

  function spanFor(slot, value, mode, group) {
    var s = SPANS[mode];
    var lv = slot.lv;
    if (value > LANDSCAPE) lv += 1;                      // 가로 사진은 한 단계 넓게
    var span;
    if (lv <= 0) span = s.S;
    else if (lv === 1) span = s.M;
    else if (lv === 2) span = s.L[slot.alt];
    else span = s.XL;
    var cap = Math.min(capFor(value, s), groupCap(group, s));
    if (span > cap) span = cap;
    return Math.max(1, Math.min(s.cols, span));
  }

  /* ------------------------------------------------------------------
     4. 그리기
     ------------------------------------------------------------------ */
  function factsHTML(w) {
    var rows = [
      ['Category', w.categoryLabel + (w.categoryKo && w.categoryKo !== w.categoryLabel ? ' · ' + w.categoryKo : '')],
      ['Fabric', w.fabric],
      ['Pattern pieces', w.pieces],
      ['Toiles', w.toiles],
      ['Lead time', w.days],
      ['Client', w.clientLabel]
    ].filter(function (r) { return r[1] !== undefined && r[1] !== null && !O.isPlaceholder(r[1]); });
    if (!rows.length) return '';
    return '<dl class="wk-facts">' + rows.map(function (r) {
      return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>';
    }).join('') + '</dl>';
  }

  function blockHTML(w) {
    var id = 'w-' + w.id;
    var tid = 'wk-t-' + w.id;
    var pid = 'wk-i-' + w.id;
    var scope = w.scopeEn || w.categoryLabel;
    var html = '';
    html += '<article class="wk-proj" id="' + esc(id) + '" aria-labelledby="' + esc(tid) + '" data-id="' + esc(w.id) + '">';

    // 머리 줄
    html += '<header class="wk-row wk-head t-label reveal" lang="en">';
    html += '<p class="wk-head__scope"><span class="wk-head__no">(' + esc(w.no3) + ')</span>' + esc(scope) + '</p>';
    html += '<h2 class="wk-head__title" id="' + esc(tid) + '"><a class="wk-head__link" href="' + esc(w.url) + '"><span class="link">' + esc(w.title) + '</span></a></h2>';
    html += '<button type="button" class="wk-tog wk-head__tog" aria-expanded="false" aria-controls="' + esc(pid) + '">' +
      '<span class="wk-tog__off" aria-hidden="true">[+]</span><span class="wk-tog__on" aria-hidden="true">[−]</span>' +
      '<span class="sr-only">' + esc(w.title) + ' <span lang="ko">작업 정보</span></span></button>';
    html += '<p class="wk-head__year">' + esc(w.year || '') + '</p>';
    html += '</header>';

    // [+] 정보 패널
    html += '<div class="wk-info" id="' + esc(pid) + '" role="region" aria-label="' + esc(w.title) + ' 작업 정보">';
    html += '<div class="wk-info__in"><div class="wk-row wk-info__grid">';
    html += '<p class="wk-info__no">' + (w.scopeList.length ? esc(w.scopeList.map(function (x) { return x.ko; }).join(' · ')) : '') + '</p>';
    html += '<div class="wk-info__main">' +
      (w.titleKo ? '<p class="wk-info__ko">' + esc(w.titleKo) + '</p>' : '') +
      (O.isPlaceholder(w.summary) ? '' : '<p class="wk-info__sum">' + esc(w.summary) + '</p>') +
      '</div>';
    html += '<div class="wk-info__facts">' + factsHTML(w) + '</div>';
    html += '<p class="wk-info__goWrap"><a class="wk-info__go" href="' + esc(w.url) + '"><span class="link">View project</span> <span class="arrow" aria-hidden="true">→</span></a></p>';
    html += '</div></div></div>';

    // 사진 무리
    html += '<div class="wk-mason" role="group" aria-label="' + esc(w.title) + ' 사진 ' + w.images.length + '장">';
    w.images.forEach(function (im, i) {
      html += '<a class="wk-tile reveal" data-i="' + i + '" href="' + esc(O.projectUrl(w.id, im.group)) + '"' +
        ' aria-label="' + esc(im.alt + ' — 작업 상세 보기') + '"' +
        ' style="--reveal-delay: ' + ((i % 4) * 60) + 'ms">' +
        O.photoHTML({ img: im, className: 'wk-ph' }) +
        '</a>';
    });
    html += '</div>';
    html += '</article>';
    return html;
  }

  var blocks = [];

  function render() {
    if (!works.length) {
      root.innerHTML = '<p class="wk-empty">아직 보여드릴 작업이 없어요. <a class="link" href="contact.html#form">의뢰 문의 →</a></p>';
      return;
    }
    root.innerHTML = works.map(blockHTML).join('');
    blocks = works.map(function (w) {
      var el = doc.getElementById('w-' + w.id);
      var tiles = [].slice.call(el.querySelectorAll('.wk-tile')).map(function (t, i) {
        var im = w.images[i];
        var ph = t.querySelector('.ph');
        var nw = ph && +ph.getAttribute('data-nw'), nh = ph && +ph.getAttribute('data-nh');
        return { el: t, ph: ph, group: im.group, value: nw && nh ? nw / nh : im.ratio.value };
      });
      return { w: w, el: el, tiles: tiles, slots: rhythm(w, tiles.length) };
    });
  }

  /* ------------------------------------------------------------------
     5. 매소너리 계산
        칸 폭은 계산으로 알 수 있으니(컨테이너 폭 하나만 읽음) 사진마다
        행 수 = ceil((너비 ÷ 비율 + 간격) ÷ 행 단위).
        자리 잡기: 12칸 grid 의 '가장 낮은 곳' 부터 채워요(스카이라인).
        원하는 칸 수로 넣었을 때 아래에 구멍이 생기거나 1칸짜리 틈이 남으면
        한 단계 좁게/넓게도 시험해서 구멍이 가장 적은 자리를 골라요.
        → 결과는 grid-column / grid-row 로 지정(JS 가 없으면 CSS dense 가 대신 배치).
     ------------------------------------------------------------------ */
  function pits(h, minSpan) {
    // 양옆보다 낮고 폭이 최소 칸 수보다 좁은 골(사진이 못 들어가는 틈) 개수
    var n = 0, C = h.length, i = 0;
    while (i < C) {
      var j = i;
      while (j + 1 < C && h[j + 1] === h[i]) j++;
      var leftWall = i === 0 || h[i - 1] > h[i];
      var rightWall = j === C - 1 || h[j + 1] > h[i];
      if (leftWall && rightWall && (j - i + 1) < minSpan) n++;
      i = j + 1;
    }
    return n;
  }

  function pack(b, W, mode, unit, gap) {
    var s = SPANS[mode], C = s.cols, allowed = s.allowed, minSpan = allowed[0];
    var colW = (W - (C - 1) * gap) / C;
    var h = [], k;
    for (k = 0; k < C; k++) h.push(0);
    function width(n) { return colW * n + gap * (n - 1); }
    function rowsFor(n, v) { return Math.max(1, Math.ceil((width(n) / v + gap) / unit)); }

    b.tiles.forEach(function (t, i) {
      var want = spanFor(b.slots[i], t.value, mode, t.group);
      var wi = allowed.indexOf(want);
      if (wi < 0) { wi = 0; while (wi < allowed.length - 1 && allowed[wi] < want) wi++; want = allowed[wi]; }
      var wantPx = width(want) / t.value;
      var basePits = pits(h, minSpan);
      var best = null;
      for (var ai = Math.max(0, wi - 1); ai <= Math.min(allowed.length - 1, wi + 1); ai++) {
        var n = allowed[ai];
        if (n > C) continue;
        if (n > want && n > Math.min(capFor(t.value, s), groupCap(t.group, s))) continue;
        var rows = rowsFor(n, t.value);
        for (var c = 0; c + n <= C; c++) {
          var top = 0, j;
          for (j = c; j < c + n; j++) if (h[j] > top) top = h[j];
          var hole = 0;
          for (j = c; j < c + n; j++) hole += top - h[j];
          var nh = h.slice();
          for (j = c; j < c + n; j++) nh[j] = top + rows;
          var pit = Math.max(0, pits(nh, minSpan) - basePits);
          var score = top * unit +
            hole * unit * (colW + gap) / width(n) * 0.8 +        // 아래에 남는 구멍(넓이)
            Math.abs(ai - wi) * wantPx * 0.15 +                   // 원래 크기에서 벗어난 정도(작게: 더 높은 빈자리가 있으면 한 단계 줄여서라도 채움)
            pit * 0.6 * wantPx +                                  // 못 채우는 1칸 틈
            c * 0.01;                                              // 같으면 왼쪽
          if (!best || score < best.score) best = { score: score, n: n, c: c, top: top, rows: rows };
        }
      }
      for (k = best.c; k < best.c + best.n; k++) h[k] = best.top + best.rows;
      t.place = best;
    });
  }

  var lastSig = '';
  function layout(force) {
    if (!blocks.length) return;
    var mode = bp();
    var unit = cssPx('--wk-unit', 4);
    var gap = cssPx('--wk-gap', 8);
    var mason = blocks[0].el.querySelector('.wk-mason');
    var W = mason ? mason.clientWidth : 0;
    if (!W) return;
    var sig = mode + '|' + W;
    if (!force && sig === lastSig) return;
    lastSig = sig;

    blocks.forEach(function (b) {
      pack(b, W, mode, unit, gap);
      b.tiles.forEach(function (t) {
        var p = t.place;
        var col = (p.c + 1) + ' / span ' + p.n;
        var row = (p.top + 1) + ' / span ' + p.rows;
        if (t.col !== col) { t.el.style.gridColumn = col; t.col = col; }
        if (t.row !== row) { t.el.style.gridRow = row; t.row = row; }
      });
    });
  }
  var hashTarget = null, afterLayout = null;
  var schedule = O.rafThrottle(function () { layout(true); if (afterLayout) afterLayout(); });
  var onResize = O.rafThrottle(function () { layout(false); fitGiant(); });

  // 실제 사진이 불러와지면 그 사진의 비율로 바꿔서 다시 배치
  root.addEventListener('ordo:photoload', function (e) {
    var ph = e.target;
    var d = e.detail || {};
    if (!ph || !d.w || !d.h) return;
    var tile = ph.closest('.wk-tile');
    var art = tile && tile.closest('.wk-proj');
    if (!tile || !art) return;
    var b = null;
    for (var k = 0; k < blocks.length; k++) if (blocks[k].el === art) { b = blocks[k]; break; }
    if (!b) return;
    var t = b.tiles[+tile.getAttribute('data-i')];
    if (!t) return;
    var v = d.w / d.h;
    ph.style.setProperty('--ar', d.w + ' / ' + d.h);   // 회색 자리 비율 → 실제 사진 비율
    if (Math.abs(v - t.value) > 0.001) { t.value = v; schedule(); }
  });

  /* ------------------------------------------------------------------
     6. [+] 정보 패널
     ------------------------------------------------------------------ */
  root.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.wk-tog');
    if (!btn || !root.contains(btn)) return;
    var panel = doc.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    var open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.classList.toggle('is-open', open);
  });
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var panel = e.target.closest && e.target.closest('.wk-info.is-open');
    if (!panel) return;
    var btn = root.querySelector('.wk-tog[aria-controls="' + panel.id + '"]');
    if (btn) { btn.click(); btn.focus(); }
  });

  /* ------------------------------------------------------------------
     7. 시작
     ------------------------------------------------------------------ */
  render();
  layout(true);                                          // 첫 화면 전에 한 번(밀림 없이)
  O.syncPhotos(root);                                    // 이미 캐시된 사진 비율 반영

  if ('ResizeObserver' in window) {
    new ResizeObserver(onResize).observe(root);
    if (giant) new ResizeObserver(O.rafThrottle(fitGiant)).observe(giant);
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  // work.html#w-coat-12 처럼 들어오면 배치가 끝난 뒤 그 작업으로.
  // 위쪽 작업의 사진이 늦게 불러와져 높이가 바뀌어도, 사용자가 직접 스크롤하기 전(3초 안)이면 다시 맞춰요
  if (location.hash && /^#w-/.test(location.hash)) {
    try { hashTarget = doc.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { hashTarget = null; }
    if (hashTarget) {
      var hashUntil = Date.now() + 3000;
      var stopHash = function () { hashTarget = null; };
      ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, stopHash, { once: true, passive: true }); });
      afterLayout = function () {
        if (!hashTarget) return;
        if (Date.now() > hashUntil) { hashTarget = null; return; }
        hashTarget.scrollIntoView({ block: 'start' });
      };
      requestAnimationFrame(afterLayout);
    }
  }

  // QA·디버그용 읽기 전용 정보(전역 함수 아님)
  root.__wk = { blocks: blocks, layout: function () { layout(true); }, fitGiant: fitGiant };
})();
