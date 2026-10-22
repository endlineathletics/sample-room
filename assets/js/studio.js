/* =====================================================================
   ORDO — Studio (studio.html)
   data/site.js 의 경력·장비·브랜드·주소·전화·서비스 5개·리드타임·진행 단계로 화면을 다시 그려요.
   → 이 항목들은 data/site.js 를 고치면 돼요.
   소개 두 문단·영문 소개·'Made by hands…' 제목은 studio.html 에 직접 적혀 있어요(그 파일에서 고쳐요).
   ===================================================================== */
(function () {
  'use strict';

  var O = window.ORDO;
  if (!O) return;
  var esc = O.esc, S = O.site;

  function ok(v) { return !O.isPlaceholder(v); }
  var ADDRESS = O.address();          // data/site.js address (비었거나 ○ 표시면 '')
  var PHONE = O.phone();              // { text, href } 또는 null
  function q(sel) { return document.querySelector('[data-st="' + sel + '"]'); }
  function setText(sel, v) { var el = q(sel); if (el && v) el.textContent = v; }

  /* ---------- 소개 ---------- */
  var years = ok(S.careerYears) ? S.careerYears : '○○';
  setText('career-line', '○○ 패턴실에서 ' + years + '년, 이제 직접 샘플실을 엽니다.');

  if (Array.isArray(S.career) && S.career.length) {
    q('career').innerHTML = S.career.map(function (c) {
      return '<li><span class="st-career__y">' + esc(c.year) + '</span><span>' + esc(c.text) + '</span></li>';
    }).join('');
  }
  if (Array.isArray(S.equipment) && S.equipment.length) {
    q('equipment').innerHTML = S.equipment.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('');
  } else {
    var eq = document.querySelector('.st-equip'); if (eq) eq.hidden = true;
  }
  var brands = (Array.isArray(S.brands) ? S.brands : []).filter(ok);
  if (brands.length) {
    q('brands').innerHTML = brands.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
    q('brands-wrap').hidden = false;
  }

  // 주소·전화는 data/site.js 값만 써요. 비어 있으면 그 자리를 숨겨요(가짜 값 금지)
  var placeEl = q('place');
  if (placeEl) {
    var place = [ADDRESS, ok(S.visit) ? S.visit : ''].filter(Boolean).join(' · ');
    if (place) placeEl.textContent = place; else placeEl.hidden = true;
  }
  var addrEl = q('address');
  if (addrEl) { if (ADDRESS) addrEl.textContent = ADDRESS; else addrEl.textContent = '주소 준비 중'; }
  setText('visit', S.visit);
  setText('hours', S.hours);
  var ph = q('phone');
  if (ph) {
    if (PHONE) { ph.textContent = PHONE.text; ph.setAttribute('href', PHONE.href); }
    else { var wrap = ph.closest('.st-loc__tel'); if (wrap) wrap.hidden = true; else ph.hidden = true; }
  }

  /* ---------- 서비스: 데스크톱 행 리스트 + 모바일 아코디언 ---------- */
  var svcs = Array.isArray(S.services) ? S.services : [];
  var box = document.getElementById('st-services');
  if (box && svcs.length) {
    var rows = svcs.map(function (s, i) {
      var no = s.no || O.pad(i + 1, 2);
      var meta = [s.days, s.min].filter(Boolean).map(esc).join(' · ');
      var href = O.contactUrl({ service: s.id });
      return '<li class="st-svc">' +
        '<span class="st-svc__no t-label">(' + esc(no) + ')</span>' +
        '<div class="st-svc__name"><h3>' + esc(s.ko) + '</h3><p>' + esc(s.en) + '</p></div>' +
        '<p class="st-svc__desc">' + esc(s.desc) + (s.prepare ? '<span class="st-svc__prep">준비물 — ' + esc(s.prepare) + '</span>' : '') + '</p>' +
        '<p class="st-svc__meta t-label">' + meta + '</p>' +
        '<a class="st-svc__cta link" href="' + esc(href) + '">이 서비스로 문의 <span class="arrow" aria-hidden="true">→</span></a>' +
      '</li>';
    }).join('');
    var accs = svcs.map(function (s, i) {
      var no = s.no || O.pad(i + 1, 2);
      var meta = [s.days, s.min].filter(Boolean).map(esc).join(' · ');
      return '<details class="acc st-svc-acc">' +
        '<summary>' +
          '<span class="st-svc-acc__no t-label">(' + esc(no) + ')</span>' +
          '<span class="st-svc-acc__name">' + esc(s.ko) + '<span class="st-svc-acc__meta t-label t-muted">' + meta + '</span></span>' +
          '<span class="acc__sign" aria-hidden="true"></span>' +
        '</summary>' +
        '<div class="st-svc-acc__body">' +
          '<p class="st-svc-acc__en t-label t-muted">' + esc(s.en) + '</p>' +
          '<p>' + esc(s.desc) + '</p>' +
          (s.prepare ? '<p class="st-svc-acc__prep"><span class="t-label t-muted">준비물</span> ' + esc(s.prepare) + '</p>' : '') +
          '<a class="btn btn--line btn--block" href="' + esc(O.contactUrl({ service: s.id })) + '">이 서비스로 문의 <span class="arrow" aria-hidden="true">→</span></a>' +
        '</div>' +
      '</details>';
    }).join('');
    box.innerHTML = '<ol class="st-svc-list hide-m">' + rows + '</ol><div class="st-svc-accs hide-d">' + accs + '</div>';
  }

  var lt = q('leadtime');            // 문장 속 → 는 Pretendard 로(Helvetica 에 없는 글자)
  if (lt && S.leadTime) lt.innerHTML = esc(S.leadTime).replace(/[→←]/g, function (c) { return '<span class="glyph">' + c + '</span>'; });
  setText('quote', S.quoteNote);

  /* ---------- 진행 5단계 ---------- */
  var steps = Array.isArray(S.process) ? S.process : [];
  var pr = document.getElementById('st-process');
  if (pr && steps.length) {
    pr.style.setProperty('--steps', steps.length);
    pr.innerHTML = steps.map(function (p, i) {
      return '<li class="st-step reveal" style="--reveal-delay: ' + (i * 60) + 'ms">' +
        '<span class="st-step__no t-label">(' + esc(p.no || O.pad(i + 1, 2)) + ')</span>' +
        '<h3 class="st-step__name">' + esc(p.ko) + '</h3>' +
        '<p class="st-step__en">' + esc(p.en) + '</p>' +
        '<p class="st-step__days t-label">' + esc(p.days) + '</p>' +
        (p.check ? '<p class="st-step__check"><span class="t-muted">고객 확인</span> ' + esc(p.check) + '</p>' : '') +
      '</li>';
    }).join('');
  }
})();
