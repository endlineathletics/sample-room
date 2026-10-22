/* =====================================================================
   ORDO — portfolio.js (Portfolio 페이지 전용, ref2)
   가로 한 줄 스트립: 늘 하나가 커져 있어요.
   - 마우스: 올린 사진이 커짐 · 휠(세로)→가로 스크롤 · 드래그 · 클릭/Enter → 상세
   - 키보드: ←/→ 로 활성 사진 이동(자동으로 가운데로), Home/End
   - 터치: 스와이프(스냅) → 가운데 온 사진이 커짐 · 작은 사진 탭 → 그 사진으로 이동 · 커진 사진 탭 → 상세
   작업 데이터는 data/works.js 에서 읽어요(여기는 고칠 필요 없음).
   ===================================================================== */
(function () {
  'use strict';

  var O = window.ORDO;
  if (!O) return;

  var doc = document;
  var strip = doc.getElementById('pf-strip');
  var track = doc.getElementById('pf-track');
  var countEl = doc.getElementById('pf-count');
  var nowEl = doc.getElementById('pf-now');
  var hintEl = doc.getElementById('pf-hint');
  var rangeEl = doc.getElementById('pf-range');
  if (!strip || !track) return;

  var esc = O.esc;
  var works = O.getWorks();
  var total = works.length;

  /* ---------- 윗줄: 작업 연도 범위 ---------- */
  var years = works.map(function (w) {
    var m = String(w.year || '').match(/(19|20)\d{2}/);
    return m ? Number(m[0]) : null;
  }).filter(Boolean);
  if (rangeEl) {
    if (years.length) {
      var y0 = Math.min.apply(null, years), y1 = Math.max.apply(null, years);
      rangeEl.textContent = '(' + (y0 === y1 ? y0 : y0 + '—' + y1) + ')';
    } else {
      rangeEl.textContent = '(Archive)';
    }
  }

  /* ---------- 작업이 없을 때 ---------- */
  if (!total) {
    strip.insertAdjacentHTML('afterend', '<p class="pf-empty">아직 보여줄 작업이 없어요. data/works.js 에 작업을 넣으면 여기에 나와요.</p>');
    strip.hidden = true;
    if (countEl) countEl.textContent = '(00 / 00)';
    return;
  }

  /* ---------- 그리기 ---------- */
  function capText(w) {
    // 연도와 시즌(2026 FW)은 줄바꿈 없는 공백으로 이어 'FW' 만 다음 줄로 떨어지지 않게
    var year = w.year && !O.isPlaceholder(w.year) ? String(w.year).replace(/ /g, '\u00a0') : '';
    return [w.title, w.categoryLabel, year].filter(function (v) { return v && !O.isPlaceholder(v); }).join(', ');
  }
  track.innerHTML = works.map(function (w, i) {
    var aria = [w.title, w.titleKo, w.categoryLabel, w.year].filter(Boolean).join(', ') + ' — 상세 보기';
    return '<li class="pf-item" data-i="' + i + '">' +
      '<p class="pf-cap" aria-hidden="true" lang="en">' +
        '<span class="pf-cap__no">(' + esc(O.pad(i + 1, 2)) + ')</span>' +
        '<span class="pf-cap__t">' + esc(capText(w)) + '</span>' +
      '</p>' +
      '<a class="pf-link" href="' + esc(w.url) + '" draggable="false" aria-label="' + esc(aria) + '">' +
        O.photoHTML({
          img: w.cover,
          ratio: '3:4',
          className: 'ph--fill',
          label: (w.categoryLabel || 'Work') + ' ' + O.pad(i + 1, 2) + ' · 3:4',
          alt: '',
          priority: i === 0,
          loading: i < 8 ? 'eager' : 'lazy'
        }) +
      '</a>' +
    '</li>';
  }).join('');

  var items = Array.prototype.slice.call(track.children);
  var links = items.map(function (li) { return li.querySelector('.pf-link'); });

  /* ---------- 상태 ---------- */
  var active = -1;
  var hoverMode = O.canHover();

  function setActive(i) {
    i = Math.max(0, Math.min(total - 1, i));
    if (i === active) return false;
    if (active >= 0 && items[active]) items[active].classList.remove('is-active');
    active = i;
    items[i].classList.add('is-active');
    var w = works[i];
    if (countEl) {
      countEl.innerHTML = '<span aria-hidden="true">(' + O.pad(i + 1, 2) + ' / ' + O.pad(total, 2) + ')</span>' +
        '<span class="sr-only">' + total + '개 중 ' + (i + 1) + '번째</span>';
      countEl.hidden = false;
    }
    if (nowEl) {
      nowEl.innerHTML =
        '<a class="link" href="' + esc(w.url) + '" lang="en">' + esc(capText(w)) + '</a>' +
        (w.titleKo ? '<span class="pf-now__ko">' + esc(w.titleKo) + '</span>' : '');
    }
    return true;
  }

  function maxScroll() { return Math.max(0, strip.scrollWidth - strip.clientWidth); }
  function clampX(x) { return Math.max(0, Math.min(maxScroll(), x)); }
  /** 지금 레이아웃 기준, i번째 사진을 스트립 가운데에 두는 scrollLeft */
  function centerX(i) {
    var it = items[i];
    return clampX(it.offsetLeft + it.offsetWidth / 2 - strip.clientWidth / 2);
  }

  /* ---------- 부드러운 스크롤(한 개의 rAF 루프) ----------
     mode 'follow' : 커지는 중인 사진의 실제 위치를 매 프레임 따라가며 가운데로
     mode 'target' : 휠·드래그 관성의 목표 위치로 */
  var anim = { raf: 0, mode: null, i: 0, x: 0, pos: 0, until: 0 };
  function stopAnim() {
    if (anim.raf) cancelAnimationFrame(anim.raf);
    anim.raf = 0; anim.mode = null;
    strip.classList.remove('is-settling');
  }
  function step() {
    anim.raf = 0;
    var now = performance.now();
    if (anim.mode === 'anchor') {                    // 새로 커지는 사진의 화면 위치를 그대로 붙잡아 둠
      strip.scrollLeft = clampX(items[anim.i].offsetLeft - anim.ax);
      if (now > anim.until) { stopAnim(); return; }
      anim.raf = requestAnimationFrame(step);
      return;
    }
    var goal = anim.mode === 'follow' ? centerX(anim.i) : clampX(anim.x);
    var d = goal - anim.pos;
    var k = anim.mode === 'follow' ? 0.16 : 0.14;
    if (Math.abs(d) < 0.5 && (anim.mode !== 'follow' || now > anim.until)) {
      var ended = anim.mode;
      strip.scrollLeft = goal;
      stopAnim();
      if (ended === 'target') retarget();             // 휠·드래그 관성이 끝나면 커진 사진을 다시 고름
      return;
    }
    anim.pos += d * k;
    strip.scrollLeft = anim.pos;
    anim.raf = requestAnimationFrame(step);
  }
  function startAnim() {
    if (anim.raf) return;
    anim.pos = strip.scrollLeft;
    anim.raf = requestAnimationFrame(step);
  }
  function follow(i) {
    if (O.reducedMotion()) { stopAnim(); strip.scrollLeft = centerX(i); return; }
    var wasRunning = !!anim.raf && anim.mode;
    anim.mode = 'follow';
    anim.i = i;
    anim.until = performance.now() + 620;          // 크기 전환(0.5s)이 끝날 때까지 따라감
    strip.classList.add('is-settling');            // 터치 스냅이 끼어들지 않게
    if (!wasRunning) startAnim();
  }
  function glideTo(x) {
    if (O.reducedMotion()) { stopAnim(); strip.scrollLeft = clampX(x); retarget(); return; }
    if (anim.mode !== 'target') { anim.mode = 'target'; anim.x = strip.scrollLeft; }
    anim.x = clampX(x);
    startAnim();
  }

  /* 휠·드래그로 넘긴 뒤: 커져 있던 사진이 화면 밖으로 나가 작은 사진만 남지 않게
     → 마우스 아래 사진(없으면 지금 커진 사진이 보이는지 보고, 안 보이면 가운데 사진)을 커지게 */
  var gx = null, gy = null;                          // 마지막 마우스 위치(화면 어디든)
  window.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { gx = e.clientX; gy = e.clientY; } }, { passive: true });
  function anchorTo(i) {
    if (i === active) return;
    var x0 = items[i].offsetLeft - strip.scrollLeft;
    setActive(i);
    if (O.reducedMotion()) { strip.scrollLeft = clampX(items[i].offsetLeft - x0); return; }
    anim.mode = 'anchor'; anim.i = i; anim.ax = x0; anim.until = performance.now() + 620;
    startAnim();
  }
  function retarget() {
    if (!hoverMode || drag.on || drag.down || anim.mode) return;
    var i = -1;
    if (gx != null) {
      var el = doc.elementFromPoint(gx, gy);
      var li = el && el.closest && el.closest('.pf-item');
      if (li && track.contains(li)) i = Number(li.getAttribute('data-i'));
    }
    if (i < 0) {
      var r = items[active].getBoundingClientRect(), sr = strip.getBoundingClientRect();
      if (r.right > sr.left + r.width / 2 && r.left < sr.right - r.width / 2) return;   // 커진 사진이 아직 잘 보임
      i = nearest();
    }
    anchorTo(i);
  }
  var retargetSoon = (function () { var t = 0; return function () { clearTimeout(t); t = setTimeout(retarget, 60); }; })();

  /* ---------- 마우스: 올리면 커짐 ---------- */
  var intent = 0, lastPX = null, lastPY = null;
  track.addEventListener('pointermove', function (e) {
    if (!hoverMode || e.pointerType === 'touch' || drag.on) return;
    // 레이아웃이 바뀌어 생긴 가짜 이동(좌표 그대로)은 무시 → 휠로 흘러가는 중에 저절로 바뀌지 않음
    if (e.clientX === lastPX && e.clientY === lastPY) return;
    lastPX = e.clientX; lastPY = e.clientY;
    var li = e.target.closest && e.target.closest('.pf-item');
    clearTimeout(intent);
    if (!li) return;
    var i = Number(li.getAttribute('data-i'));
    if (i === active) return;
    intent = setTimeout(function () { setActive(i); }, 40);   // 빠르게 훑고 지나갈 때 출렁이지 않게
  });
  track.addEventListener('pointerleave', function () { clearTimeout(intent); });

  /* ---------- 휠(세로) → 가로 스크롤 ---------- */
  strip.addEventListener('wheel', function (e) {
    if (e.ctrlKey) return;                          // 핀치 줌은 그대로
    var dx = e.deltaX, dy = e.deltaY;
    if (Math.abs(dy) <= Math.abs(dx)) { if (anim.mode === 'target') stopAnim(); return; }   // 트랙패드 가로 = 기본 동작
    var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? strip.clientWidth : 1;
    var delta = dy * unit;
    var cur = anim.mode === 'target' ? anim.x : strip.scrollLeft;
    var mx = maxScroll();
    if ((delta < 0 && cur <= 0) || (delta > 0 && cur >= mx - 1)) return;   // 끝이면 페이지 스크롤에 양보
    e.preventDefault();
    if (anim.mode && anim.mode !== 'target') stopAnim();
    glideTo(cur + delta);
  }, { passive: false });

  /* ---------- 드래그(마우스) ---------- */
  var drag = { down: false, on: false, x: 0, sx: 0, id: null, vx: 0, lx: 0, lt: 0 };
  var suppressClick = false;
  strip.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.down = true; drag.on = false;
    drag.x = e.clientX; drag.sx = strip.scrollLeft; drag.id = e.pointerId;
    drag.vx = 0; drag.lx = e.clientX; drag.lt = performance.now();
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag.down || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x;
    if (!drag.on) {
      if (Math.abs(dx) < 6) return;
      drag.on = true;
      clearTimeout(intent);
      stopAnim();
      strip.classList.add('is-dragging');
      try { strip.setPointerCapture(drag.id); } catch (err) { /* 무시 */ }
    }
    var t = performance.now();
    var dt = Math.max(1, t - drag.lt);
    drag.vx = drag.vx * 0.6 + ((e.clientX - drag.lx) / dt) * 0.4;   // px/ms
    drag.lx = e.clientX; drag.lt = t;
    strip.scrollLeft = drag.sx - dx;
  });
  function endDrag(e) {
    if (!drag.down || (e && e.pointerId !== drag.id)) return;
    drag.down = false;
    if (!drag.on) return;
    drag.on = false;
    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 0);
    strip.classList.remove('is-dragging');
    try { strip.releasePointerCapture(drag.id); } catch (err) { /* 무시 */ }
    if (performance.now() - drag.lt < 80 && Math.abs(drag.vx) > 0.05) glideTo(strip.scrollLeft - drag.vx * 260);   // 살짝 관성
    else retargetSoon();
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  strip.addEventListener('dragstart', function (e) { e.preventDefault(); });

  /* ---------- 클릭 / 탭 ---------- */
  track.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.pf-link');
    if (!a) return;
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
    var i = links.indexOf(a);
    if (!hoverMode && i !== active) {               // 터치: 작은 사진은 먼저 그 사진으로 이동·확대
      e.preventDefault();
      setActive(i);
      follow(i);
    }
  }, true);

  /* ---------- 키보드 ---------- */
  strip.addEventListener('focusin', function (e) {
    var i = links.indexOf(e.target);
    if (i < 0) return;
    var keyboard = false;
    try { keyboard = e.target.matches(':focus-visible'); } catch (err) { keyboard = true; }
    if (!keyboard && !hoverMode) return;           // 터치 탭의 포커스는 click 에서 처리(작은 사진 첫 탭 = 이동·확대)
    if (setActive(i) && keyboard) follow(i);
  });
  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    setActive(i);
    // 스트립 안이거나 아무 데도 포커스가 없을 때(본문) ←/→ 를 누르면 그 사진 링크로 포커스를 옮겨
    // 화면 낭독기도 바뀐 작업을 읽어요
    var ae = doc.activeElement;
    if (!ae || ae === doc.body || ae === strip || strip.contains(ae)) {
      try { links[i].focus({ preventScroll: true }); } catch (err) { links[i].focus(); }
    }
    follow(i);
  }
  doc.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (doc.documentElement.classList.contains('is-locked')) return;   // 모바일 메뉴가 열려 있음
    var inStrip = strip.contains(doc.activeElement);
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
    else if (inStrip && e.key === 'Home') { e.preventDefault(); go(0); }
    else if (inStrip && e.key === 'End') { e.preventDefault(); go(total - 1); }
    else if (e.key === 'Enter' && (doc.activeElement === doc.body || doc.activeElement === strip)) {
      window.location.href = works[active].url;
    }
  });

  /* ---------- 터치: 스와이프가 멈추면 가운데 사진을 크게 ---------- */
  var touching = false, settleTimer = 0;
  strip.addEventListener('touchstart', function () { touching = true; if (anim.mode) stopAnim(); }, { passive: true });
  strip.addEventListener('touchend', function () { touching = false; queueSettle(); }, { passive: true });
  strip.addEventListener('touchcancel', function () { touching = false; queueSettle(); }, { passive: true });
  function nearest() {
    var mid = strip.scrollLeft + strip.clientWidth / 2;
    var best = 0, bd = Infinity;
    for (var i = 0; i < total; i++) {
      var c = items[i].offsetLeft + items[i].offsetWidth / 2;
      var d = Math.abs(c - mid);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  function settle() {
    clearTimeout(settleTimer);
    if (hoverMode || touching || anim.mode) return;
    var i = nearest();
    if (i !== active) { setActive(i); follow(i); }
  }
  function queueSettle() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 140);
  }
  strip.addEventListener('scroll', function () { if (!hoverMode && !anim.mode) queueSettle(); }, { passive: true });
  if ('onscrollend' in window) strip.addEventListener('scrollend', function () {
    if (hoverMode) { if (!anim.mode) retargetSoon(); return; }   // 트랙패드 가로 스크롤 등 기본 스크롤이 끝났을 때
    if (!anim.mode && !touching) settle();
  });

  /* ---------- 모드 · 크기 ---------- */
  function applyMode() {
    hoverMode = O.canHover();
    strip.classList.toggle('is-touch', !hoverMode);
    if (hintEl) {
      hintEl.innerHTML = (hoverMode ? 'Scroll, Drag, ' : 'Swipe ') + '<span class="arrow">←</span> <span class="arrow">→</span>';
      hintEl.hidden = false;
    }
  }
  applyMode();
  setActive(0);
  strip.scrollLeft = hoverMode ? 0 : centerX(0);

  var lastW = window.innerWidth;
  window.addEventListener('resize', O.rafThrottle(function () {
    var was = hoverMode;
    applyMode();
    if (was !== hoverMode || window.innerWidth !== lastW) {
      lastW = window.innerWidth;
      stopAnim();
      strip.scrollLeft = centerX(active);
    }
  }));
})();
