/* =====================================================================
   ORDO — Contact (contact.html)
   1) 연락 채널: data/site.js 값으로 채움, 비어 있으면 '준비 중' 표시, Copy 버튼
   2) 지도: site.js 주소로 Google 지도 임베드·지도 앱 링크를 만듦(모바일은 탭해야 지도 조작)
   3) 의뢰 정리 폼: 필수 2칸 · 칩 · 실시간 미리보기 · [복사하고 카톡 열기] · [메일로 보내기]
      · 브라우저 임시 저장(localStorage) · ?service= ?ref= ?item= 미리 채우기 + 0.6초 하이라이트
   연락처·주소·운영시간은 data/site.js 만 고치면 돼요(이 파일에 직접 적힌 값 없음).
   FAQ·준비물 문장은 contact.html 의 '4. 의뢰 전 준비물' 아래에서 고쳐요.
   ===================================================================== */
(function () {
  'use strict';

  var O = window.ORDO;
  if (!O) return;
  var S = O.site, C = S.contact || {};
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };

  // 연락처·주소는 전부 data/site.js 에서(비었거나 ○ 표시면 빈칸 처리, 가짜 값 금지)
  function ok(v) { return !O.isPlaceholder(v); }
  var ADDRESS = O.address();
  var PH = O.phone();                       // { text, href } 또는 null
  var PHONE = PH ? PH.text : '';
  var TEL = PH ? PH.href : '';
  var EMAIL = ok(C.email) ? String(C.email).trim() : '';
  var KAKAO = ok(C.kakaoUrl) ? String(C.kakaoUrl).trim() : '';
  var IG = ok(C.instagram) ? String(C.instagram).replace(/^@/, '').trim() : '';
  var enc = encodeURIComponent(ADDRESS || '서울');
  var MAPS = {
    embed: 'https://maps.google.com/maps?q=' + enc + '&z=17&hl=ko&output=embed',
    kakao: 'https://map.kakao.com/link/search/' + enc,
    naver: 'https://map.naver.com/p/search/' + enc,
    google: 'https://www.google.com/maps/search/?api=1&query=' + enc
  };

  /* =================================================================
     1. 연락 채널
     ================================================================= */
  var emailItem = $('[data-ch="email"]');
  if (emailItem) {
    var ev = $('.ct-item__value', emailItem), eb = $('.ct-copy', emailItem);
    if (EMAIL) {
      ev.innerHTML = '<a class="ct-mail" href="mailto:' + O.esc(EMAIL) + '">' + O.esc(EMAIL) + '</a>';
      eb.hidden = false; eb.setAttribute('data-copy', EMAIL);
    } else {
      ev.innerHTML = '<span class="is-empty">이메일 주소 준비 중</span>';
      eb.hidden = true;
    }
  }
  var phoneItem = $('[data-ch="phone"]');
  if (phoneItem) {
    var pv = $('.ct-item__value', phoneItem), pb = $('.ct-copy', phoneItem);
    if (PH) {
      var pa = $('.ct-tel', phoneItem);
      pa.textContent = PHONE; pa.setAttribute('href', TEL);
      pb.setAttribute('data-copy', PHONE); pb.hidden = false;
    } else {
      pv.innerHTML = '<span class="is-empty">전화번호 준비 중</span>';
      pb.hidden = true;
    }
  }
  var kLi = $('[data-ch="kakao"]');
  if (kLi) kLi.innerHTML = KAKAO
    ? '<a class="link" href="' + O.esc(KAKAO) + '" target="_blank" rel="noopener">KakaoTalk</a>'
    : '<span class="is-empty" title="카카오톡 채널은 준비 중이에요.' + (PH ? ' 지금은 전화로 문의해 주세요.' : '') + '" lang="en">KakaoTalk<span class="sr-only" lang="ko"> (준비 중)</span></span>';
  var iLi = $('[data-ch="instagram"]');
  if (iLi) iLi.innerHTML = IG
    ? '<a class="link" href="https://www.instagram.com/' + encodeURIComponent(IG) + '/" target="_blank" rel="noopener">Instagram</a>'
    : '<span class="is-empty" title="인스타그램은 준비 중이에요." lang="en">Instagram<span class="sr-only" lang="ko"> (준비 중)</span></span>';
  var nLi = $('[data-ch="naver"] a');
  if (nLi) nLi.setAttribute('href', MAPS.naver);

  $$('[data-ct="hours"]').forEach(function (el) { if (S.hours) el.textContent = S.hours; });
  $$('[data-ct="reply"]').forEach(function (el) { if (S.reply) el.textContent = S.reply; });
  $$('[data-ct="address"]').forEach(function (el) { el.textContent = ADDRESS || '주소 준비 중'; });
  $$('[data-ct="visit"]').forEach(function (el) { if (S.visit) el.textContent = S.visit; });

  // Copy 버튼: 성공하면 Copied 1.5초, 막히면 글자를 선택 상태로.
  // 보이는 글자(Copy)가 접근성 이름에 들어가도록 aria-label 대신 숨긴 글자(" 전화번호")를 붙이고, 결과는 live 영역으로 알려요
  var copyLive = $('[data-ct="copy-live"]');
  function copyBtnHTML(b, word) { return word + '<span class="sr-only"> ' + O.esc(b.getAttribute('data-what') || '') + '</span>'; }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.ct-copy');
    if (!b) return;
    var text = b.getAttribute('data-copy');
    if (!text) return;
    var what = b.getAttribute('data-what') || '내용';
    var valueEl = $('.ct-item__value', b.closest('.ct-item'));
    O.copy(text).then(function (done) {
      b.innerHTML = copyBtnHTML(b, done ? 'Copied' : '길게 눌러 복사');
      b.classList.add('is-done');
      if (copyLive) copyLive.textContent = done ? what + '를 복사했어요.' : '자동 복사가 막혀 있어요. 선택된 ' + what + '를 길게 눌러 복사해 주세요.';
      if (!done) O.selectText(valueEl && (valueEl.firstElementChild || valueEl));
      clearTimeout(b.__t);
      b.__t = setTimeout(function () { b.innerHTML = copyBtnHTML(b, 'Copy'); b.classList.remove('is-done'); }, done ? 1500 : 3000);
    });
  });

  /* =================================================================
     2. 지도
     ================================================================= */
  var iframe = $('.ct-map__iframe');
  if (iframe) {
    if (iframe.getAttribute('src') !== MAPS.embed) iframe.setAttribute('src', MAPS.embed);
    if (ADDRESS) iframe.setAttribute('title', 'ORDO 위치 — ' + ADDRESS);
  }
  $$('[data-map]').forEach(function (a) { var u = MAPS[a.getAttribute('data-map')]; if (u) a.setAttribute('href', u); });

  // 터치 기기: 지도 위에 투명 막 → 탭하면 지도 조작 가능, 화면 밖으로 나가면 다시 막음(페이지 스크롤이 지도에 갇히지 않게)
  var frame = $('.ct-map__frame'), shield = $('.ct-map__shield');
  if (frame && shield) {
    shield.addEventListener('click', function () { frame.classList.add('is-live'); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (!x.isIntersecting) frame.classList.remove('is-live'); });
      }).observe(frame);
    }
  }

  /* =================================================================
     3. 의뢰 정리 폼
     ================================================================= */
  var form = $('#ct-brief');
  if (!form) return;
  var preview = $('#ct-preview');
  var countEl = $('[data-ct="count"]');
  var status = $('.ct-status');
  var savedEl = $('.ct-saved');
  var MAX = 1500;
  var KEY = 'ordo-brief-v1';

  // 서비스 칩은 site.js 서비스 목록으로(서비스를 바꾸면 칩도 바뀌게)
  var svcs = Array.isArray(S.services) ? S.services.filter(function (s) { return s && s.id; }) : [];
  if (svcs.length) {
    $('[data-chips="service"]').innerHTML = svcs.map(function (s) {
      return '<label class="ct-chip"><input type="checkbox" name="service" value="' + O.esc(s.id) + '"><span>' + O.esc(s.chip || s.ko) + '</span></label>';
    }).join('');
  }
  // 아이템 칩 라벨은 공통 카테고리 이름을 따라감
  $$('input[name="item"]', form).forEach(function (inp) {
    var c = O.category(inp.value);
    if (c) inp.nextElementSibling.textContent = c.ko;
  });

  // 희망 완료 시기: 이번 달부터 12개월
  var when = $('#ct-when');
  (function () {
    var now = new Date(), html = '<option value="">선택 안 함</option>';
    for (var i = 0; i < 12; i++) {
      var d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      var v = d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월';
      html += '<option value="' + v + '">' + v + (i === 0 ? ' (이번 달)' : '') + '</option>';
    }
    html += '<option value="일정 협의">일정 협의</option>';
    when.innerHTML = html;
  })();

  function chipLabels(name) {
    return $$('input[name="' + name + '"]:checked', form).map(function (i) { return i.nextElementSibling.textContent.trim(); });
  }
  function val(name) { var el = form.elements[name]; return el ? String(el.value || '').trim() : ''; }

  function state() {
    return {
      name: val('name'), reply: val('reply'),
      item: chipLabels('item'), service: chipLabels('service'), ready: chipLabels('ready'),
      qty: val('qty'), when: val('when'), ref: val('ref'), memo: val('memo')
    };
  }

  function buildText(st) {
    var subj = ['[의뢰] ' + (st.name || '브랜드명')];
    if (st.item.length) subj.push(st.item.join('·'));
    if (st.qty) subj.push(st.qty); else if (st.service.length) subj.push(st.service.join('·'));
    if (st.when) subj.push(st.when);
    var lines = [subj.join(' / '), ''];
    function add(label, v) { if (v && (!Array.isArray(v) || v.length)) lines.push(label + ': ' + (Array.isArray(v) ? v.join(', ') : v)); }
    add('이름·브랜드', st.name);
    add('회신 연락처', st.reply);
    add('아이템', st.item);
    add('필요한 서비스', st.service);
    add('수량·사이즈', st.qty);
    add('희망 완료', st.when);
    add('준비된 자료', st.ready);
    add('참고 작업', st.ref);
    if (st.memo) { lines.push(''); lines.push('메모'); lines.push(st.memo); }
    lines.push('');
    lines.push('— ' + S.name + ' 사이트 의뢰서에서 정리했어요. (도식화·사진은 따로 첨부할게요)');
    return { subject: subj.join(' / '), body: lines.join('\n') };
  }

  function render() {
    var t = buildText(state());
    preview.textContent = t.body;
    var n = t.body.length;
    countEl.textContent = n.toLocaleString('ko-KR');
    countEl.parentNode.classList.toggle('is-over', n > MAX);
    return t;
  }

  /* ---------- 임시 저장 ---------- */
  function save() {
    try {
      var st = {};
      $$('input, select, textarea', form).forEach(function (el) {
        if (!el.name) return;
        if (el.type === 'checkbox') { st[el.name] = st[el.name] || []; if (el.checked) st[el.name].push(el.value); }
        else st[el.name] = el.value;
      });
      var empty = !Object.keys(st).some(function (k) { return Array.isArray(st[k]) ? st[k].length : String(st[k]).trim(); });
      if (empty) { localStorage.removeItem(KEY); savedEl.textContent = ''; return; }
      localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), v: st }));
      savedEl.textContent = '이 브라우저에 임시 저장됨';
    } catch (e) { /* 저장 불가(사생활 보호 모드 등) → 그냥 넘어감 */ }
  }
  function restore() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !data.v) return false;
      if (Date.now() - (data.t || 0) > 1000 * 60 * 60 * 24 * 30) { localStorage.removeItem(KEY); return false; }
      var st = data.v;
      $$('input, select, textarea', form).forEach(function (el) {
        if (!el.name || !(el.name in st)) return;
        if (el.type === 'checkbox') el.checked = Array.isArray(st[el.name]) && st[el.name].indexOf(el.value) >= 0;
        else el.value = st[el.name];
      });
      savedEl.textContent = '임시 저장한 내용을 불러왔어요';
      return true;
    } catch (e) { return false; }
  }
  function clearSaved() { try { localStorage.removeItem(KEY); } catch (e) { /* 무시 */ } savedEl.textContent = ''; }

  // 임시 저장은 사용자가 직접 입력(input)했을 때만. 보낸(복사한) 뒤에는 다음 입력 전까지 저장하지 않아요
  var saveTimer = 0, dirty = false, sent = false;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(function () { saveTimer = 0; save(); dirty = false; }, 300); }
  function clearSavedAfterSend() { clearTimeout(saveTimer); saveTimer = 0; dirty = false; sent = true; clearSaved(); }
  // 300ms 안에 페이지를 떠나도 마지막 입력이 남게
  window.addEventListener('pagehide', function () { if (dirty && !sent) { clearTimeout(saveTimer); save(); } });

  /* ---------- 미리 채우기(?service= ?ref= ?item=) + 하이라이트 ---------- */
  restore();
  var flash = [];
  function check(name, value) {
    var inp = $('input[name="' + name + '"][value="' + String(value).replace(/["\\]/g, '') + '"]', form);
    if (inp) { inp.checked = true; flash.push(inp.closest('.ct-field')); return true; }
    return false;
  }
  var qService = O.param('service'), qItem = O.param('item'), qRef = O.param('ref');
  // 주소로 넘어온 값은 저장해 둔 값에 '더하지' 않고 그 그룹을 주소 값으로 바꿔요(다른 작업에서 온 아이템이 쌓이지 않게)
  if (qItem || qRef) $$('input[name="item"]', form).forEach(function (i) { i.checked = false; });
  if (qService) $$('input[name="service"]', form).forEach(function (i) { i.checked = false; });
  if (qService) check('service', qService);
  if (qItem) { if (!check('item', String(qItem).toLowerCase())) check('item', 'etc'); }
  if (qRef) {
    var rw = O.getWork(qRef);
    var refText = rw ? 'No.' + rw.no2 + ' ' + rw.title + (rw.titleKo ? ' (' + rw.titleKo + ')' : '') : String(qRef).slice(0, 80);
    form.elements.ref.value = refText;
    flash.push(form.elements.ref.closest('.ct-field'));
    if (rw && !qItem) check('item', rw.category);
  }
  // (미리 채운 값만으로는 저장하지 않아요 — 사용자가 직접 입력해야 저장)
  render();

  function runFlash() {
    flash.forEach(function (f) {
      if (!f) return;
      f.classList.remove('is-flash'); void f.offsetWidth; f.classList.add('is-flash');
      setTimeout(function () { f.classList.remove('is-flash'); }, 700);
    });
    flash = [];
  }
  // 지도 iframe 이 window load 를 붙잡으므로 load 를 기다리지 않고 바로 하이라이트해요.
  // #form 위치는 브라우저가 해시로 맞추고, 사용자가 아직 스크롤하지 않았는데 폼이 화면 위쪽에 없을 때만 한 번 맞춰요
  if (flash.length) {
    var target = document.getElementById('form');
    var userMoved = false;
    var markMoved = function () { userMoved = true; };
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, markMoved, { once: true, passive: true }); });
    requestAnimationFrame(function () {
      if (location.hash === '#form' && target && !userMoved) {
        var top = target.getBoundingClientRect().top;
        if (top < -4 || top > 160) target.scrollIntoView({ block: 'start' });
      }
      setTimeout(runFlash, 180);
    });
  }

  /* ---------- 입력 → 미리보기 · 저장 · 오류 해제 ---------- */
  function onEdit(e) {
    render();
    if (e.type === 'input') { sent = false; dirty = true; saveSoon(); }   // change(포커스가 빠질 때)로는 저장하지 않음
    var f = e.target.closest('.ct-field');
    if (f && f.classList.contains('is-invalid') && String(e.target.value).trim()) setInvalid(f, false);
  }
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);
  form.addEventListener('submit', function (e) { e.preventDefault(); doCopy(); });

  /* ---------- 필수 확인 ---------- */
  function setInvalid(field, on) {
    var inp = $('.ct-input', field), err = $('.ct-err', field);
    field.classList.toggle('is-invalid', on);
    if (inp) inp.setAttribute('aria-invalid', on ? 'true' : 'false');
    if (err) err.hidden = !on;
  }
  function validate() {
    var bad = [];
    ['name', 'reply'].forEach(function (k) {
      var f = $('[data-f="' + k + '"]', form);
      var miss = !val(k);
      setInvalid(f, miss);
      if (miss) bad.push(f);
    });
    if (bad.length) {
      var inp = $('.ct-input', bad[0]);
      inp.focus({ preventScroll: true });
      bad[0].scrollIntoView({ behavior: O.reducedMotion() ? 'auto' : 'smooth', block: 'center' });
      say('<strong>꼭 적을 칸이 비어 있어요.</strong> ' + (bad.length === 2 ? '이름·브랜드명과 회신받을 연락처' : (bad[0].getAttribute('data-f') === 'name' ? '이름·브랜드명' : '회신받을 연락처')) + '를 적어 주세요.', 'error');
      return false;
    }
    return true;
  }

  function say(html, kind) {
    status.className = 'ct-status' + (kind ? ' is-' + kind : '');
    status.innerHTML = html;
  }
  var replyLine = function () {
    return '<span class="ct-status__line">' + O.esc(S.reply || '보통 영업일 1일 안에 답변드려요') + ' · ' + O.esc(S.hours || '') +
      (PH ? ' · 급하면 전화 <a class="link" href="' + O.esc(TEL) + '">' + O.esc(PHONE) + '</a>' : '') + '</span>';
  };

  /* ---------- 보내기 버튼 ---------- */
  var copyBtn = $('[data-act="copy"]');
  var copyLabel = $('[data-ct="copy-label"]');
  var mailBtn = $('[data-act="mail"]');
  var telAlt = $('[data-ct="tel-alt"]');
  var note = $('[data-ct="send-note"]');
  copyLabel.textContent = KAKAO ? '복사하고 카톡 열기' : '의뢰 내용 복사하기';
  if (EMAIL) { mailBtn.hidden = false; telAlt.hidden = true; }
  else if (PH) {
    mailBtn.hidden = true; telAlt.hidden = false;
    telAlt.setAttribute('href', TEL);
    telAlt.firstChild.textContent = '전화로 문의 ' + PHONE + ' ';
  } else { mailBtn.hidden = true; telAlt.hidden = true; }
  note.textContent = KAKAO
    ? '카카오톡은 미리 채운 메시지를 받지 못해서, 복사한 뒤 채팅창에 붙여넣는 방식이에요.'
    : (PH ? '카카오톡 채널은 준비 중이에요. 복사한 내용을 문자로 보내시거나 전화로 문의해 주세요.' : '카카오톡 채널은 준비 중이에요.');

  function showFallback(text) {
    say('<strong>자동 복사가 막혀 있어요.</strong> 아래 글을 길게 눌러(또는 Ctrl/⌘+C) 복사해 주세요.' +
      '<textarea class="ct-fallback ct-input" readonly rows="8" aria-label="복사할 의뢰 내용"></textarea>', 'warn');
    var ta = $('.ct-fallback', status);
    ta.value = text;
    O.selectText(ta);
  }

  function doCopy() {
    if (!validate()) return;
    var t = render();
    var kakaoWin = null;
    O.copy(t.body).then(function (done) {
      if (!done) { showFallback(t.body); return; }
      if (KAKAO) {
        kakaoWin = window.open(KAKAO, '_blank');
        if (kakaoWin) { try { kakaoWin.opener = null; } catch (err) { /* 무시 */ } }
        say('<strong>복사됐어요.</strong> 카카오톡 채팅창에 붙여넣기만 하세요.' +
          (kakaoWin ? '' : ' <a class="link" href="' + O.esc(KAKAO) + '" target="_blank" rel="noopener">카카오톡 채널 열기 →</a>') + replyLine(), 'done');
      } else {
        say('<strong>복사됐어요.</strong> 카카오톡 채널은 준비 중이라, 문자로 붙여넣어 보내시거나 전화로 문의해 주세요.' + replyLine(), 'done');
      }
      clearSavedAfterSend();
    });
  }
  copyBtn.addEventListener('click', doCopy);

  mailBtn.addEventListener('click', function (e) {
    if (!validate()) { e.preventDefault(); return; }
    var t = render();
    // 메일 앱·OS 는 mailto 주소가 약 2,000자를 넘으면 자르거나 못 열어요. 한글은 인코딩하면 한 글자가 9자라
    // '인코딩한 길이' 기준으로 잘라요. 잘렸으면 전체 내용을 클립보드에 복사해 두고 붙여넣기를 안내해요.
    var head = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(t.subject) + '&body=';
    var max = 1800 - head.length;
    var tail = '\n…(전체 내용은 복사해 두었어요. 메일에 붙여넣어 주세요)';
    var body = t.body, cut = false;
    if (encodeURIComponent(body).length > max) {
      cut = true;
      var room = max - encodeURIComponent(tail).length;
      while (body.length && encodeURIComponent(body).length > room) body = body.slice(0, Math.floor(body.length * 0.9));
      body += tail;
    }
    mailBtn.setAttribute('href', head + encodeURIComponent(body));
    O.copy(t.body);
    say('<strong>메일 앱을 열었어요.</strong> ' + (cut ? '내용이 길어 일부만 들어갔어요. 전체 내용은 복사해 두었으니 메일 본문에 붙여넣어 주세요.' : '열리지 않으면 복사해 둔 내용을 ' + O.esc(EMAIL) + ' 로 보내 주세요.') + replyLine(), 'done');
    clearSavedAfterSend();
  });

  $('[data-act="clear"]').addEventListener('click', function () {
    form.reset();
    $$('.ct-field.is-invalid', form).forEach(function (f) { setInvalid(f, false); });
    clearSaved();
    render();
    say('입력 내용을 지웠어요.', '');
  });

  /* ---------- FAQ 아래 '카톡으로 물어보기' ---------- */
  var ask = $('[data-ct="kakao-ask"]');
  if (ask) {
    if (KAKAO) { ask.setAttribute('href', KAKAO); ask.setAttribute('target', '_blank'); ask.setAttribute('rel', 'noopener'); }
    else if (PH) { ask.setAttribute('href', TEL); ask.firstChild.textContent = '원하는 답이 없나요? 전화로 물어보기 '; }
    else ask.setAttribute('href', '#channels');
  }
})();
