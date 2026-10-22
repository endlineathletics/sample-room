/* =====================================================================
   ORDO — 작업 상세 (project.html?id=<작업 id>)
   - 상단 줄: ← Back · (07 / 12) · Prev, Next
   - 제목 · 한글 제목 · 요약
   - 사진 그룹 Look → Detail → Inside → Pattern(빈 그룹은 숨김) + 오른쪽 sticky 정보 패널
   - 사진 클릭 → 흰 전체화면 라이트박스(ESC·닫기·←/→·스와이프, 핀치줌 그대로)
   - ←/→ 키로 이전·다음 작업, 잘못된 id 는 안내
   내용은 data/works.js 에서 읽어요. 이 파일은 고치지 않아도 돼요.
   ===================================================================== */
(function () {
  'use strict';

  var O = window.ORDO;
  var root = document.getElementById('pd-root');
  if (!O || !root) return;
  var esc = O.esc;

  var id = O.param('id');
  var cat = O.param('cat');                         // (선택) 필터가 걸린 채로 왔으면 그 카테고리 안에서만 이동
  if (cat && !O.category(cat)) cat = null;
  var w = id ? O.getWork(id) : null;
  if (w && w.hidden) w = null;

  if (!w) { renderMissing(); return; }

  var nb = O.neighbors(w.id, cat ? { category: cat } : null);
  if (nb.index < 0) { cat = null; nb = O.neighbors(w.id); }

  function linkTo(work, hash) {
    var u = 'project.html?id=' + encodeURIComponent(work.id) + (cat ? '&cat=' + encodeURIComponent(cat) : '');
    return u + (hash ? '#' + hash : '');
  }
  function splitName(name) {           // "바운드 버튼홀 / Bound buttonhole" → [ko, en]
    var parts = String(name || '').split(/\s+\/\s+/);
    return { ko: parts[0] || '', en: parts.slice(1).join(' / ') };
  }
  function has(v) { return !(v === undefined || v === null || String(v).trim() === '' || O.isPlaceholder(v)); }

  /* ---------- 문서 제목·설명 ---------- */
  document.title = w.title + ' — ORDO';
  var md = document.querySelector('meta[name="description"]');
  if (md && w.summary) md.setAttribute('content', w.title + ' (' + w.titleKo + ') — ' + w.summary);
  var ogt = document.querySelector('meta[property="og:title"]');
  if (ogt) ogt.setAttribute('content', w.title + ' — ORDO');

  var reqUrl = O.contactUrl({ ref: w.id, item: w.category });
  O.setBar('project', { href: reqUrl });

  /* ---------- 사진 그룹 ---------- */
  var groups = O.GROUPS.filter(function (g) { return w.groups[g.id] && w.groups[g.id].length; });
  var flat = [];                        // 라이트박스 순서 = 화면 순서
  groups.forEach(function (g) { w.groups[g.id].forEach(function (im) { flat.push(im); }); });

  function photoButton(im, i, extraCls) {
    var landscape = im.ratio.value > 1.15;
    return '<button type="button" class="pd-photo' + (landscape ? ' is-wide' : '') + (extraCls ? ' ' + extraCls : '') + '" data-i="' + i + '"' +
      ' aria-label="사진 크게 보기 — ' + esc(im.alt) + '">' +
      O.photoHTML({ img: im, tag: 'span', priority: i === 0 }) +
      '</button>';
  }

  var counter = 0;
  var groupsHTML = groups.map(function (g) {
    var list = w.groups[g.id];
    var items = list.map(function (im, j) {
      var html = photoButton(im, counter, j === 0 && g.id === 'look' ? 'is-lead' : '');
      counter++;
      return html;
    }).join('');
    var isLook = g.id === 'look';
    return '<section class="pd-group pd-group--' + g.id + '" id="' + g.id + '" aria-labelledby="pd-g-' + g.id + '">' +
      '<div class="pd-group__head">' +
        '<h2 class="t-label" id="pd-g-' + g.id + '">(' + esc(g.label) + ')<span class="sr-only"> ' + esc(g.ko) + ' 사진</span></h2>' +
        '<p class="t-label t-muted pd-group__count"' + (isLook ? ' data-swipe-count' : '') + '>' +
          (isLook ? '<span class="pd-swipe-now">1</span> / ' + list.length : O.pad(list.length, 2)) + '</p>' +
      '</div>' +
      '<div class="pd-photos">' + items + '</div>' +
    '</section>';
  }).join('');

  /* ---------- 정보 패널 ---------- */
  var pointsHTML = '';
  if (w.points.length) {
    pointsHTML = '<section class="pd-block" aria-labelledby="pd-points">' +
      '<h2 class="pd-block__title t-label" id="pd-points">Construction Points <span class="t-muted">(' + O.pad(w.points.length, 2) + ')</span></h2>' +
      '<ol class="pd-points">' + w.points.map(function (p, i) {
        var n = splitName(p.name);
        var idx = -1;
        if (p.img) for (var k = 0; k < flat.length; k++) if (flat[k].file === p.img) { idx = k; break; }
        var thumb = idx >= 0
          ? '<button type="button" class="pd-point__thumb" data-i="' + idx + '" aria-label="' + esc(n.ko || n.en) + ' 사진 크게 보기">' +
              O.photoHTML({ img: flat[idx], tag: 'span', ratio: '1:1', noLabel: true }) + '</button>'
          : '';
        return '<li class="pd-point" id="p' + (i + 1) + '">' +
          '<span class="pd-point__no" aria-hidden="true">' + '(' + O.pad(i + 1, 2) + ')' + '</span>' +
          '<div class="pd-point__txt">' +
            '<h3 class="pd-point__name">' + esc(n.ko) + '</h3>' +
            (n.en ? '<p class="pd-point__en">' + esc(n.en) + '</p>' : '') +
            (p.text ? '<p class="pd-point__desc">' + esc(p.text) + '</p>' : '') +
          '</div>' + thumb +
        '</li>';
      }).join('') + '</ol></section>';
  }

  var sheetRows = [
    ['Fabric', '소재', w.fabric],
    ['Pattern pieces', '패턴 피스', has(w.pieces) ? w.pieces + ' pcs' : ''],
    ['Toiles', '토일', has(w.toiles) ? w.toiles + (Number(w.toiles) === 1 ? ' round' : ' rounds') : ''],
    ['Lead time', '제작 기간', w.days],
    ['Scope', '작업 범위', w.scopeList.length ? w.scopeList.map(function (s) { return s.ko; }).join(' · ') : ''],
    ['Client', '클라이언트', w.clientLabel]
  ].filter(function (r) { return has(r[2]); });

  var sheetHTML = '<section class="pd-block" aria-labelledby="pd-sheet">' +
    '<h2 class="pd-block__title t-label" id="pd-sheet">Construction Sheet</h2>' +
    '<dl class="pd-sheet">' + sheetRows.map(function (r) {
      return '<div class="pd-sheet__row"><dt><span class="pd-sheet__en">' + esc(r[0]) + '</span> <span class="pd-sheet__ko">' + esc(r[1]) + '</span></dt>' +
        '<dd>' + esc(r[2]) + '</dd></div>';
    }).join('') + '</dl></section>';

  var jumpHTML = groups.length > 1
    ? '<nav class="pd-jump" aria-label="사진 그룹 바로가기"><ul class="commas">' + groups.map(function (g) {
        return '<li><a class="tbtn pd-jump__a" href="#' + g.id + '" data-g="' + g.id + '">' + esc(g.label) + '</a></li>';
      }).join('') + '</ul></nav>'
    : '';

  // 카톡 채널 주소가 아직 없으면 막다른 링크 대신 전화로(site.js 에 카톡 주소를 넣으면 자동으로 카톡)
  var ph = O.phone();
  var kakaoEmpty = O.isPlaceholder(O.site.contact && O.site.contact.kakaoUrl);
  var quickHTML = (kakaoEmpty && ph)
    ? '<a class="pd-cta__kakao link" href="' + esc(ph.href) + '">전화로 바로 문의 ' + esc(ph.text) + ' <span class="arrow" aria-hidden="true">→</span></a>'
    : '<a class="pd-cta__kakao link" href="' + esc(O.kakaoHref()) + '"' + O.kakaoAttrs() + '>카톡으로 바로 문의 <span class="arrow" aria-hidden="true">→</span></a>';
  function nb_(s) { return String(s || '').replace(/ /g, '\u00a0'); }   // 2026 FW 가 두 줄로 갈라지지 않게
  var panelHTML =
    '<aside class="pd-panel" aria-label="작업 정보">' +
      '<div class="pd-panel__in">' +
        '<p class="pd-panel__meta t-label" lang="en"><span>(' + esc(w.no3) + ')</span><span>' + esc(w.categoryLabel) + (w.year ? ' · ' + esc(nb_(w.year)) : '') + '</span></p>' +
        jumpHTML +
        pointsHTML +
        sheetHTML +
        '<div class="pd-cta">' +
          '<a class="btn btn--block btn--lg" href="' + esc(reqUrl) + '">이 작업처럼 의뢰하기 <span class="arrow" aria-hidden="true">→</span></a>' +
          quickHTML +
        '</div>' +
      '</div>' +
    '</aside>';

  /* ---------- 상단 줄 · 머리 · 다음 작업 ---------- */
  var total = nb.total;
  var pos = nb.index + 1;
  var topHTML =
    '<nav class="pd-top wrap" aria-label="작업 이동">' +
      '<a class="pd-top__back link" href="projects.html" data-back lang="en"><span class="arrow arrow--back" aria-hidden="true">←</span> Back</a>' +
      '<p class="pd-top__count t-num"><span aria-hidden="true">(' + O.pad(pos, 2) + ' / ' + O.pad(total, 2) + ')</span>' +
        '<span class="sr-only">' + total + '개 중 ' + pos + '번째</span></p>' +
      (total > 1
        ? '<ul class="pd-top__pn commas" lang="en">' +
            '<li><a class="link" href="' + esc(linkTo(nb.prev)) + '" rel="prev" title="' + esc(nb.prev.title) + '">Prev</a></li>' +
            '<li><a class="link" href="' + esc(linkTo(nb.next)) + '" rel="next" title="' + esc(nb.next.title) + '">Next</a></li>' +
          '</ul>'
        : '<span></span>') +
    '</nav>';

  var headHTML =
    '<header class="pd-head grid wrap">' +
      '<div class="pd-head__title">' +
        '<h1 class="pd-title" lang="en">' + esc(w.title) + '</h1>' +
        (w.titleKo ? '<p class="pd-title-ko">' + esc(w.titleKo) + '</p>' : '') +
      '</div>' +
      '<div class="pd-head__side">' +
        (w.summary ? '<p class="pd-summary">' + esc(w.summary) + '</p>' : '') +
        '<p class="pd-head__tags t-label t-muted" lang="en">' + esc(w.categoryLabel) + (w.year ? ' · ' + esc(nb_(w.year)) : '') +
          (w.scopeEn ? '<br>' + esc(w.scopeEn) : '') + '</p>' +
      '</div>' +
    '</header>';

  var nextHTML = '';
  if (total > 1) {
    var nx = nb.next;
    nextHTML =
      '<section class="pd-next wrap" aria-label="다음 작업">' +
        '<a class="pd-next__a" href="' + esc(linkTo(nx)) + '">' +
          '<span class="pd-next__label t-label t-muted" lang="en">(Next project — ' + esc(nx.no3) + ')</span>' +
          '<span class="pd-next__title" lang="en">Next — ' + esc(nx.title) + '&nbsp;<span class="arrow" aria-hidden="true">→</span></span>' +
          '<span class="pd-next__sub">' + esc(nx.titleKo) + (nx.titleKo ? ' · ' : '') + esc(nx.categoryLabel) + (nx.year ? ' · ' + esc(nb_(nx.year)) : '') + '</span>' +
          '<span class="pd-next__thumb" aria-hidden="true">' + O.photoHTML({ img: nx.cover, tag: 'span', ratio: '3:4', noLabel: false, alt: '' }) + '</span>' +
        '</a>' +
      '</section>';
  }

  root.innerHTML = topHTML + headHTML +
    '<div class="pd-body grid wrap">' +
      '<div class="pd-media">' + (groupsHTML || '<p class="t-small t-muted">아직 사진이 없어요.</p>') + '</div>' +
      panelHTML +
    '</div>' + nextHTML;

  /* ---------- ← Back ---------- */
  var back = root.querySelector('[data-back]');
  if (back) back.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    if (O.cameFromSite()) { e.preventDefault(); history.back(); }
  });

  /* ---------- sticky 패널: 화면보다 길면 아래쪽 기준으로 붙게 ---------- */
  var panel = root.querySelector('.pd-panel__in');
  function fitSticky() {
    if (!panel) return;
    if (O.isMobile()) { panel.style.top = ''; return; }
    var headerH = (document.querySelector('.site-header') || { offsetHeight: 64 }).offsetHeight;
    var topGap = headerH + 24;
    var h = panel.offsetHeight;
    var vh = window.innerHeight;
    panel.style.top = (h + topGap + 24 > vh ? Math.round(vh - h - 32) : topGap) + 'px';
  }
  fitSticky();
  window.addEventListener('resize', O.rafThrottle(fitSticky));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSticky);

  /* ---------- 그룹 바로가기: 현재 그룹 표시 ---------- */
  var jumps = root.querySelectorAll('.pd-jump__a');
  if (jumps.length && 'IntersectionObserver' in window) {
    var visible = {};
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      var best = null, bestV = 0;
      groups.forEach(function (g) { if ((visible[g.id] || 0) > bestV) { bestV = visible[g.id]; best = g.id; } });
      if (!best) return;
      jumps.forEach(function (a) {
        if (a.getAttribute('data-g') === best) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }, { threshold: [0, .15, .3, .5, .75, 1], rootMargin: '-20% 0px -30% 0px' });
    groups.forEach(function (g) { var s = document.getElementById(g.id); if (s) gio.observe(s); });
  }
  root.addEventListener('click', function (e) {
    var a = e.target.closest('.pd-jump__a');
    if (!a) return;
    var t = document.getElementById(a.getAttribute('data-g'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: O.reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    try { history.replaceState(null, '', '#' + t.id); } catch (err) { /* file:// 등 */ }
  });

  /* ---------- 모바일 Look 스와이프 카운터 ---------- */
  var lookRow = root.querySelector('.pd-group--look .pd-photos');
  var lookNow = root.querySelector('.pd-swipe-now');
  if (lookRow && lookNow) {
    lookRow.addEventListener('scroll', O.rafThrottle(function () {
      var items = lookRow.children;
      if (!items.length) return;
      var x = lookRow.scrollLeft + lookRow.clientWidth / 2, n = 1;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.offsetLeft <= x) n = i + 1;
      }
      lookNow.textContent = n;
    }), { passive: true });
  }

  /* ---------- 해시로 들어오면 그 그룹으로 ---------- */
  function goHash() {
    var h = (location.hash || '').replace('#', '');
    if (!h) return;
    var t = document.getElementById(h);
    if (t && root.contains(t)) t.scrollIntoView({ block: 'start' });
  }
  if (location.hash) { goHash(); window.addEventListener('load', goHash); }

  /* =================================================================
     라이트박스
     ================================================================= */
  var lb = null, lbIndex = 0, lbOpener = null, lbRelease = null, lbOpen = false;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'pd-lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', '사진 크게 보기');
    lb.hidden = true;
    lb.innerHTML =
      '<div class="pd-lb__top wrap">' +
        '<p class="pd-lb__count t-label" aria-live="polite"></p>' +
        '<p class="pd-lb__title t-label t-muted">' + esc(w.title) + '</p>' +
        '<button type="button" class="pd-lb__close" data-lb="close">Close <span aria-hidden="true" class="pd-lb__x"></span></button>' +
      '</div>' +
      '<div class="pd-lb__stage" data-lb="stage"></div>' +
      '<div class="pd-lb__bottom wrap">' +
        '<button type="button" class="pd-lb__nav" data-lb="prev"><span class="arrow arrow--back" aria-hidden="true">←</span> Prev</button>' +
        '<p class="pd-lb__cap t-label t-muted"></p>' +
        '<button type="button" class="pd-lb__nav" data-lb="next">Next <span class="arrow" aria-hidden="true">→</span></button>' +
      '</div>';
    document.body.appendChild(lb);
    lb.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lb]');
      var act = b && b.getAttribute('data-lb');
      if (act === 'close') closeLb();
      else if (act === 'prev') showLb(lbIndex - 1);
      else if (act === 'next') showLb(lbIndex + 1);
      else if (act === 'stage' && e.target === b) closeLb();     // 사진 바깥 여백을 누르면 닫힘
    });
    lb.addEventListener('ordo:photoload', function (e) {
      var ph = e.target.closest('.ph');
      if (ph && e.detail && e.detail.w) setStageRatio(ph, e.detail.w / e.detail.h, e.detail.w + ' / ' + e.detail.h);
    });
    // 스와이프(한 손가락, 확대 안 한 상태일 때만). 핀치줌은 막지 않아요
    var sx = 0, sy = 0, st = 0, multi = false;
    lb.addEventListener('touchstart', function (e) {
      multi = e.touches.length > 1;
      if (multi) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now();
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (multi || e.touches.length) return;
      var vv = window.visualViewport;
      if (vv && vv.scale > 1.02) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - sx, dy = t.clientY - sy;
      if (Date.now() - st < 600 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showLb(lbIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  function setStageRatio(ph, value, css) {
    ph.style.setProperty('--ar', css);
    ph.style.setProperty('--rv', value);
  }

  function showLb(i) {
    if (!flat.length) return;
    lbIndex = (i + flat.length) % flat.length;
    var im = flat[lbIndex];
    var stage = lb.querySelector('[data-lb="stage"]');
    stage.innerHTML = O.photoHTML({ img: im, fit: 'contain', loading: 'eager', className: 'pd-lb__ph' });
    var ph = stage.firstChild;
    setStageRatio(ph, im.ratio.value, im.ratio.css);
    var img = ph.querySelector('img');
    if (img && img.complete && img.naturalWidth) setStageRatio(ph, img.naturalWidth / img.naturalHeight, img.naturalWidth + ' / ' + img.naturalHeight);
    lb.querySelector('.pd-lb__count').textContent = O.pad(lbIndex + 1, 2) + ' / ' + O.pad(flat.length, 2);
    lb.querySelector('.pd-lb__cap').textContent = '(' + im.groupLabel + ') ' + im.label;
    var single = flat.length < 2;
    lb.querySelectorAll('.pd-lb__nav').forEach(function (b) { b.hidden = single; });
  }

  function openLb(i, opener) {
    if (!lb) buildLightbox();
    lbOpener = opener || document.activeElement;
    showLb(i);
    if (lbOpen) return;
    lbOpen = true;
    lb.hidden = false;
    void lb.offsetWidth;
    lb.classList.add('is-open');
    O.lockScroll(true);
    lbRelease = O.trapFocus(lb);
    lb.querySelector('.pd-lb__close').focus();
  }

  function closeLb() {
    if (!lbOpen) return;
    lbOpen = false;
    lb.classList.remove('is-open');
    O.lockScroll(false);
    if (lbRelease) { lbRelease(); lbRelease = null; }
    var done = function () { if (!lbOpen) { lb.hidden = true; lb.querySelector('[data-lb="stage"]').innerHTML = ''; } };
    if (O.reducedMotion()) done(); else setTimeout(done, 260);
    if (lbOpener && lbOpener.focus) { try { lbOpener.focus({ preventScroll: true }); } catch (e) { lbOpener.focus(); } }
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('.pd-photo, .pd-point__thumb');
    if (!b) return;
    openLb(parseInt(b.getAttribute('data-i'), 10) || 0, b);
  });

  /* ---------- 키보드: 라이트박스 ←/→/ESC, 평소 ←/→ = 이전·다음 작업 ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (lbOpen) {
      if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); showLb(lbIndex - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); showLb(lbIndex + 1); }
      return;
    }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (document.documentElement.classList.contains('is-locked')) return;   // 모바일 메뉴 열림
    if (t && t.closest && t.closest('.pd-group--look .pd-photos') && O.isMobile()) return;
    if (total < 2) return;
    e.preventDefault();
    location.href = linkTo(e.key === 'ArrowLeft' ? nb.prev : nb.next);
  });

  /* =================================================================
     잘못된 id
     ================================================================= */
  function renderMissing() {
    document.title = 'Project not found — ORDO';
    var list = O.getWorks().slice(0, 4);
    // works.js 문법 오류 때문에 못 찾은 거면 '없는 작업' 이라고 하지 않고 원인을 알려요
    var dataBroken = (O.dataErrors || []).some(function (e) { return e.file === 'works'; });
    if (dataBroken) {
      root.innerHTML =
        '<section class="pd-empty wrap" aria-labelledby="pd-empty-title">' +
          '<p class="t-label t-muted" lang="en">(Data error)</p>' +
          '<h1 class="pd-empty__title" id="pd-empty-title" lang="en">Project unavailable.</h1>' +
          '<p class="pd-empty__text">작업 데이터 파일(<strong>data/works.js</strong>)을 읽지 못해 이 작업을 보여드릴 수 없어요. 위 안내대로 고치면 다시 보여요.</p>' +
          '<p class="pd-empty__links"><a class="link" href="check.html">check.html 에서 점검하기 <span class="arrow" aria-hidden="true">→</span></a>' +
          '<a class="link link--muted" href="index.html" lang="en">Home</a></p>' +
        '</section>';
      O.setBar('default');
      return;
    }
    root.innerHTML =
      '<section class="pd-empty wrap" aria-labelledby="pd-empty-title">' +
        '<p class="t-label t-muted">(' + (id ? 'Not found' : 'No project selected') + ')</p>' +
        '<h1 class="pd-empty__title" id="pd-empty-title">Project not found.</h1>' +
        '<p class="pd-empty__text">' + (id
          ? '찾는 작업(<strong>' + esc(id) + '</strong>)이 없어요. 주소가 바뀌었거나 잠시 숨겨 둔 작업일 수 있어요.'
          : '어떤 작업을 볼지 주소에 빠져 있어요. 목록에서 작업을 골라 주세요.') + '</p>' +
        '<p class="pd-empty__links"><a class="link" href="projects.html">Projects 목록 보기 <span class="arrow" aria-hidden="true">→</span></a>' +
        '<a class="link link--muted" href="index.html">Home</a></p>' +
        (list.length ? '<div class="pd-empty__more"><p class="t-label t-muted">(Recent projects)</p><ul>' + list.map(function (x) {
          return '<li><a class="link" href="' + esc(x.url) + '"><span class="t-label t-muted">(' + esc(x.no3) + ')</span> ' + esc(x.title) + '</a></li>';
        }).join('') + '</ul></div>' : '') +
      '</section>';
    O.setBar('default');
  }
})();
