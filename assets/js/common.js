/* =====================================================================
   ORDO — common.js (모든 페이지 공통, 라이브러리 없음)
   window.ORDO 하나만 만들어요. 페이지 JS는 이 파일 다음에 실행되므로
   DOMContentLoaded 를 기다릴 필요 없이 ORDO.* 를 바로 쓰면 돼요.
   이 파일은 페이지 담당자가 고치지 않아요(필요하면 리드에게 요청).
   ===================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var body = doc.body;

  /* ------------------------------------------------------------------
     0. 작은 유틸
     ------------------------------------------------------------------ */
  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) {
    return v == null ? '' : String(v).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; });
  }
  function pad(n, len) { n = String(n); while (n.length < (len || 2)) n = '0' + n; return n; }
  function mm(q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } }
  function reducedMotion() { return mm('(prefers-reduced-motion: reduce)'); }
  function canHover() { return mm('(hover: hover) and (pointer: fine)'); }
  function isMobile() { return !mm('(min-width: 768px)'); }
  function isEmptyText(v) { return v == null || String(v).trim() === ''; }
  /** 아직 정하지 않은 자리(○)인지 */
  function isPlaceholder(v) { return isEmptyText(v) || /○/.test(String(v)); }

  function rafThrottle(fn) {
    var queued = false, lastArgs;
    return function () {
      lastArgs = arguments;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn.apply(null, lastArgs); });
    };
  }

  /** 결정적 난수(작업 번호 같은 시드 → 늘 같은 결과). 0 이상 1 미만 */
  function rng(seed) {
    var s = (typeof seed === 'number' ? seed : hash(String(seed))) >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /* ------------------------------------------------------------------
     1. 데이터 확인 · 오류 안내
     ------------------------------------------------------------------ */
  var dataErrors = (window.__dataErr || []).slice();
  var dataIssues = [];          // 건너뛴 작업 블록 등(콘솔·check.html용)

  if (typeof window.SITE !== 'object' || !window.SITE) {
    if (!dataErrors.some(function (e) { return e.file === 'site'; })) dataErrors.push({ file: 'site', line: 0 });
  }
  if (!Array.isArray(window.WORKS)) {
    if (!dataErrors.some(function (e) { return e.file === 'works'; })) dataErrors.push({ file: 'works', line: 0 });
  }

  var SITE_DEFAULTS = {
    name: 'ORDO',
    descriptor: 'Pattern & Sample Atelier',
    city: 'Seoul',
    year: '2026',
    contact: { kakaoUrl: '', kakaoId: '', instagram: '', email: '', phone: '' },
    services: [], process: []
  };
  var rawSite = (typeof window.SITE === 'object' && window.SITE) ? window.SITE : {};
  var site = {};
  Object.keys(SITE_DEFAULTS).forEach(function (k) { site[k] = SITE_DEFAULTS[k]; });
  Object.keys(rawSite).forEach(function (k) { site[k] = rawSite[k]; });
  site.contact = Object.assign({}, SITE_DEFAULTS.contact, rawSite.contact || {});

  function showNotice(html) {
    var box = doc.getElementById('data-notice');
    if (!box) {
      box = doc.createElement('div');
      box.id = 'data-notice';
      box.className = 'notice';
      box.setAttribute('role', 'alert');
      var main = doc.querySelector('main');
      if (main && main.parentNode) main.parentNode.insertBefore(box, main);
      else body.insertBefore(box, body.firstChild);
    }
    box.innerHTML = (box.innerHTML ? box.innerHTML + '<br>' : '') + html;
    box.hidden = false;
  }

  if (dataErrors.length) {
    var seen = {};
    dataErrors.forEach(function (e) {
      if (seen[e.file]) return; seen[e.file] = 1;
      var file = e.file === 'works' ? 'data/works.js' : 'data/site.js';
      var where = e.line ? ' <strong>' + e.line + '번째 줄 근처</strong>의' : '의';
      var after = e.file === 'works'
        ? ' 고칠 때까지 작업 목록 없이 화면을 보여드려요.'
        : ' 고칠 때까지 기본 문구로 화면을 보여드려요.';
      showNotice('<strong>데이터 파일 확인 필요</strong> — <code>' + file + '</code>' + where +
        ' 쉼표(,)·따옴표(")·괄호가 빠지거나 하나 더 들어가지 않았는지 확인해 주세요.' + after +
        ' 자세한 점검은 <a class="link" href="check.html">check.html</a> 에서 할 수 있어요.');
    });
  }

  /* ------------------------------------------------------------------
     2. 작업 데이터 정규화
     ------------------------------------------------------------------ */
  var GROUPS = [
    { id: 'look',    label: 'Look',    ko: '룩',     ratio: '4:5' },
    { id: 'detail',  label: 'Detail',  ko: '디테일', ratio: '1:1' },
    { id: 'inside',  label: 'Inside',  ko: '안쪽',   ratio: '4:5' },
    { id: 'pattern', label: 'Pattern', ko: '패턴',   ratio: '3:2' }
  ];
  var GROUP_BY_ID = {};
  GROUPS.forEach(function (g) { GROUP_BY_ID[g.id] = g; });

  var CATEGORIES = [
    { id: 'jacket', label: 'Jacket', ko: '자켓' },
    { id: 'coat',   label: 'Coat',   ko: '코트' },
    { id: 'shirt',  label: 'Shirt',  ko: '셔츠' },
    { id: 'blouse', label: 'Blouse', ko: '블라우스' }
  ];
  var CAT_BY_ID = {};
  CATEGORIES.forEach(function (c) { CAT_BY_ID[c.id] = c; });

  var SCOPE_EN = { '패턴': 'Pattern', '토일': 'Toile', '샘플': 'Sample', '그레이딩': 'Grading', '소량생산': 'Small-batch', '생산': 'Production' };

  /** "4:5" · "4/5" · "4x5" · 0.8 · {w,h} → { w, h, value(가로/세로), css:"4 / 5", label:"4:5" } */
  function ratio(input, fallback) {
    var w, h;
    if (input && typeof input === 'object' && input.w && input.h) { w = +input.w; h = +input.h; }
    else if (typeof input === 'number' && input > 0) { w = input; h = 1; }
    else if (typeof input === 'string') {
      var m = input.trim().match(/^(\d+(?:\.\d+)?)\s*[:/x×]\s*(\d+(?:\.\d+)?)$/i);
      if (m) { w = +m[1]; h = +m[2]; }
    }
    if (!(w > 0 && h > 0)) return fallback !== undefined ? (fallback && ratio(fallback)) : ratio('4:5');
    var label = (Math.round(w * 100) / 100) + ':' + (Math.round(h * 100) / 100);
    return { w: w, h: h, value: w / h, css: w + ' / ' + h, label: label };
  }

  function imgPath(work, file) {
    var id = typeof work === 'string' ? work : (work && work.id);
    if (!id || !file) return '';
    if (/^(https?:)?\/\//.test(file) || /^images\//.test(file)) return file;
    return 'images/works/' + encodeURIComponent(id) + '/' + String(file).split('/').map(encodeURIComponent).join('/');
  }

  function normImage(work, groupId, item, i) {
    var g = GROUP_BY_ID[groupId];
    var file = '', r = null, alt = '', focus = '';
    if (typeof item === 'string') file = item.trim();
    else if (item && typeof item === 'object') {
      file = String(item.src || item.file || '').trim();
      if (item.ratio) r = ratio(item.ratio, null);
      alt = item.alt || '';
      focus = item.focus || '';
    }
    var explicit = !!r;
    r = r || ratio(g.ratio);
    var n = pad(i + 1, 2);
    return {
      file: file,
      src: imgPath(work, file),
      group: groupId,
      groupLabel: g.label,
      groupKo: g.ko,
      index: i,
      n: n,
      ratio: r,
      ratioSet: explicit,
      label: g.label.toUpperCase() + ' ' + n + ' · ' + r.label,
      alt: alt || ((work.titleKo || work.title || '') + ' — ' + g.label + ' ' + n),
      focus: focus || work.focus || 'center'
    };
  }

  var worksCache = null;

  function buildWorks() {
    var list = Array.isArray(window.WORKS) ? window.WORKS : [];
    var out = [], ids = {};
    list.forEach(function (raw, i) {
      var where = (i + 1) + '번째 블록';
      if (!raw || typeof raw !== 'object') { dataIssues.push({ index: i, msg: where + ': 형식이 올바르지 않아 건너뛰었어요.' }); return; }
      var miss = ['id', 'category', 'title'].filter(function (k) { return isEmptyText(raw[k]); });
      if (!Array.isArray(raw.look)) miss.push('look');
      if (miss.length) { dataIssues.push({ index: i, id: raw.id, msg: where + (raw.id ? ' (' + raw.id + ')' : '') + ': 꼭 필요한 칸(' + miss.join(', ') + ')이 비어 있어 건너뛰었어요.' }); return; }
      var id = String(raw.id).trim();
      if (ids[id]) { dataIssues.push({ index: i, id: id, msg: where + ': id "' + id + '" 가 겹쳐서 건너뛰었어요.' }); return; }
      ids[id] = 1;

      var cat = String(raw.category).trim().toLowerCase();
      var catInfo = CAT_BY_ID[cat] || { id: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1), ko: cat };
      var w = {};
      Object.keys(raw).forEach(function (k) { w[k] = raw[k]; });
      w.id = id;
      w.category = cat;
      w.categoryLabel = catInfo.label;
      w.categoryKo = catInfo.ko;
      w.title = String(raw.title);
      w.titleKo = raw.titleKo || '';
      w.year = raw.year || '';
      w.summary = raw.summary || '';
      w.hidden = raw.hidden === true;
      w.featured = raw.featured === true;
      w.focus = raw.focus || 'center top';
      w.client = raw.client || '';
      w.clientLabel = w.client || 'Private client';
      w.points = Array.isArray(raw.points) ? raw.points : [];
      w.dataIndex = i;

      var scopeKo = String(raw.scope || '').split(/\s*[·,/|]\s*/).filter(Boolean);
      w.scopeList = scopeKo.map(function (s) { return { ko: s, en: SCOPE_EN[s] || s }; });
      w.scopeEn = w.scopeList.map(function (s) { return s.en; }).join(', ');

      w.groups = {};
      w.images = [];
      GROUPS.forEach(function (g) {
        var arr = Array.isArray(raw[g.id]) ? raw[g.id] : [];
        w.groups[g.id] = arr.map(function (item, j) { return normImage(w, g.id, item, j); })
          .filter(function (img) { return img.file; });
        w.images = w.images.concat(w.groups[g.id]);
      });
      w.cover = w.groups.look[0] || normImage(w, 'look', '', 0);
      w.url = projectUrl(id);
      out.push(w);
    });

    var visible = out.filter(function (w) { return !w.hidden; });
    visible.forEach(function (w, i) {
      w.index = i;
      w.no = i + 1;
      w.no2 = pad(i + 1, 2);
      w.no3 = pad(i + 1, 3);
      w.total = visible.length;
    });
    out.filter(function (w) { return w.hidden; }).forEach(function (w) {
      w.index = -1; w.no = 0; w.no2 = '--'; w.no3 = '---'; w.total = visible.length;
    });
    if (dataIssues.length && window.console) dataIssues.forEach(function (d) { console.warn('[ORDO works.js] ' + d.msg); });
    return out;
  }

  function allWorks() { if (!worksCache) worksCache = buildWorks(); return worksCache; }

  /** 화면에 보일 작업 목록(hidden 제외, works.js 순서 그대로).
      opts.category: 'jacket' 등으로 거르기('all'이나 비우면 전체), opts.includeHidden: true면 숨김 포함 */
  function getWorks(opts) {
    opts = opts || {};
    var cat = opts.category && opts.category !== 'all' ? String(opts.category).toLowerCase() : '';
    return allWorks().filter(function (w) {
      if (!opts.includeHidden && w.hidden) return false;
      if (cat && w.category !== cat) return false;
      return true;
    });
  }
  function getWork(id) {
    if (!id) return null;
    var list = allWorks();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  /** 이전·다음(끝에서 처음으로 이어짐). opts.category 로 같은 카테고리 안에서만 */
  function neighbors(id, opts) {
    var list = getWorks(opts);
    var i = -1;
    for (var k = 0; k < list.length; k++) if (list[k].id === id) { i = k; break; }
    if (i < 0 || !list.length) return { prev: null, next: null, index: -1, total: list.length };
    return {
      prev: list[(i - 1 + list.length) % list.length],
      next: list[(i + 1) % list.length],
      index: i,
      total: list.length
    };
  }
  /** 필터용 카테고리 목록: [{id:'all',label:'All',count:12}, {id:'jacket',label:'Jacket',ko:'자켓',count:3}, …] (0개는 뺌) */
  function categories() {
    var list = getWorks();
    var res = [{ id: 'all', label: 'All', ko: '전체', count: list.length }];
    var extra = {};
    CATEGORIES.forEach(function (c) {
      var n = list.filter(function (w) { return w.category === c.id; }).length;
      if (n) res.push({ id: c.id, label: c.label, ko: c.ko, count: n });
    });
    list.forEach(function (w) {
      if (!CAT_BY_ID[w.category]) extra[w.category] = (extra[w.category] || 0) + 1;
    });
    Object.keys(extra).forEach(function (k) {
      res.push({ id: k, label: k.charAt(0).toUpperCase() + k.slice(1), ko: k, count: extra[k] });
    });
    return res;
  }

  /* ------------------------------------------------------------------
     3. 링크 · 쿼리
     ------------------------------------------------------------------ */
  function projectUrl(id, hashOrOpts) {
    var hash = typeof hashOrOpts === 'string' ? hashOrOpts : (hashOrOpts && hashOrOpts.group) || '';
    return 'project.html?id=' + encodeURIComponent(id) + (hash ? '#' + String(hash).replace(/^#/, '') : '');
  }
  /** contact.html?service=…&ref=…&item=…#form  (빈 값은 빼요) */
  function contactUrl(o) {
    o = o || {};
    var q = [];
    ['service', 'ref', 'item'].forEach(function (k) {
      if (!isEmptyText(o[k])) q.push(k + '=' + encodeURIComponent(o[k]));
    });
    var hash = o.hash === undefined ? 'form' : o.hash;
    return 'contact.html' + (q.length ? '?' + q.join('&') : '') + (hash ? '#' + hash : '');
  }
  function param(name) {
    try { return new URLSearchParams(location.search).get(name); }
    catch (e) {
      var m = location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
    }
  }
  /* 직전에 본 사이트 안 주소(탭마다 따로). file:// 에서는 브라우저가 referrer 를 비워서
     ← Back 판단에 이 값을 대신 써요. 저장이 막혀 있으면 그냥 null */
  var prevHref = null;
  try {
    prevHref = sessionStorage.getItem('ordo-prev');
    sessionStorage.setItem('ordo-prev', location.href);
  } catch (e) { prevHref = null; }

  /** 같은 사이트 안에서 넘어왔는지(← Back 에서 history.back 쓸지 판단) */
  function cameFromSite() {
    try {
      if (history.length < 2) return false;
      if (doc.referrer) {
        var r = new URL(doc.referrer);
        if (location.protocol === 'file:') return r.protocol === 'file:';
        return r.origin === location.origin;
      }
      // referrer 가 없을 때(file:// 더블클릭 미리보기 등): 이 탭에서 직전에 본 사이트 주소가 있으면 사이트 안 이동
      return !!prevHref && prevHref !== location.href;
    } catch (e) { return false; }
  }

  /* ------------------------------------------------------------------
     4. 연락 채널
     ------------------------------------------------------------------ */
  /** "010-3713-3820" → "tel:+821037133820" (비었거나 ○ 표시면 '') */
  function telHref(p) {
    if (isPlaceholder(p)) return '';
    var d = String(p).replace(/[^\d+]/g, '');
    if (!d) return '';
    return 'tel:' + (d.charAt(0) === '0' ? '+82' + d.slice(1) : d);
  }
  /** site.js 전화번호 { text, href } 또는 null */
  function phone() {
    var p = site.contact && site.contact.phone;
    var href = telHref(p);
    return href ? { text: String(p).trim(), href: href } : null;
  }
  /** site.js 주소(비었거나 ○ 표시면 '') */
  function address() { return isPlaceholder(site.address) ? '' : String(site.address).trim(); }

  function channels() {
    var c = site.contact || {};
    var ig = String(c.instagram || '').replace(/^@/, '').trim();
    var phoneTel = telHref(c.phone);
    return [
      { id: 'kakao', label: '카카오톡 채널', short: 'KakaoTalk', note: '가장 빠름',
        value: c.kakaoId || c.kakaoUrl || '', href: c.kakaoUrl || '', placeholder: '카카오톡 채널 주소', external: true,
        empty: isEmptyText(c.kakaoUrl) },
      { id: 'instagram', label: 'Instagram DM', short: 'Instagram', note: '',
        value: ig ? '@' + ig : '', href: ig ? 'https://ig.me/m/' + encodeURIComponent(ig) : '', placeholder: '인스타그램 아이디', external: true,
        empty: !ig },
      { id: 'email', label: 'Email', short: 'Email', note: '',
        value: c.email || '', href: c.email ? 'mailto:' + c.email : '', placeholder: '이메일 주소', external: false,
        empty: isEmptyText(c.email) },
      { id: 'phone', label: 'Phone', short: 'Phone', note: '',
        value: phoneTel ? c.phone : '', href: phoneTel, placeholder: '전화번호', external: false,
        empty: !phoneTel }
    ];
  }
  /** 카카오톡 문의 링크. 채널 주소가 비어 있으면 Contact 의 채널 목록으로 */
  function kakaoHref() {
    var u = site.contact && site.contact.kakaoUrl;
    return isEmptyText(u) ? 'contact.html#channels' : u;
  }
  function kakaoAttrs() {
    var u = site.contact && site.contact.kakaoUrl;
    return isEmptyText(u) ? '' : ' target="_blank" rel="noopener"';
  }

  /* ------------------------------------------------------------------
     5. 사진 자리
     ------------------------------------------------------------------ */
  /** opts: { img(정규화된 사진) | src, ratio, label, alt, focus,
              loading:'lazy'|'eager', priority:true(fetchpriority=high),
              tag:'div', className:'', fit:'cover'|'contain', noLabel:true, attrs:{} }
      사진 파일이 있으면 불러와 0.4s 페이드인, 없거나 실패하면 회색 프레임+라벨 유지 */
  function photoParts(opts) {
    opts = opts || {};
    var im = opts.img || {};
    var r = ratio(opts.ratio || im.ratio || '4:5');
    var src = opts.src !== undefined ? opts.src : im.src;
    var label = opts.label !== undefined ? opts.label : (im.label || ('PHOTO · ' + r.label));
    var alt = opts.alt !== undefined ? opts.alt : (im.alt || '');
    var focus = opts.focus || im.focus || 'center';
    var cls = 'ph' + (opts.fit === 'contain' ? ' ph--contain' : '') + (opts.noLabel ? ' ph--nolabel' : '') +
      (opts.className ? ' ' + opts.className : '') + (src ? '' : ' is-missing');
    return { r: r, src: src, label: label, alt: alt, focus: focus, cls: cls, im: im };
  }
  function photoHTML(opts) {
    opts = opts || {};
    var p = photoParts(opts);
    var tag = opts.tag || 'div';
    var attrs = opts.attrs || {};
    var extra = Object.keys(attrs).map(function (k) { return ' ' + k + '="' + esc(attrs[k]) + '"'; }).join('');
    var html = '<' + tag + ' class="' + esc(p.cls) + '" style="--ar: ' + p.r.css + '" data-ratio="' + esc(p.r.label) + '"' +
      (p.im.group ? ' data-group="' + esc(p.im.group) + '"' : '') + extra + '>';
    if (p.src) {
      html += '<img class="ph__img" src="' + esc(p.src) + '" alt="' + esc(p.alt) + '"' +
        ' loading="' + (opts.priority ? 'eager' : (opts.loading || 'lazy')) + '" decoding="async"' +
        (opts.priority ? ' fetchpriority="high"' : '') +
        ' style="object-position: ' + esc(p.focus) + '">';
    } else if (p.alt) {
      html += '<span class="sr-only">' + esc(p.alt) + '</span>';
    }
    html += '<span class="ph__label" aria-hidden="true">' + esc(p.label) + '</span></' + tag + '>';
    return html;
  }
  function photo(opts) {
    var t = doc.createElement('div');
    t.innerHTML = photoHTML(opts);
    return t.firstChild;
  }
  function onPhotoLoad(img) {
    var ph = img.closest('.ph');
    if (!ph) return;
    if (img.naturalWidth) {
      ph.classList.add('is-loaded');
      ph.classList.remove('is-missing');
      ph.dataset.nw = img.naturalWidth;
      ph.dataset.nh = img.naturalHeight;
      ph.dispatchEvent(new CustomEvent('ordo:photoload', { bubbles: true, detail: { w: img.naturalWidth, h: img.naturalHeight, img: img } }));
    } else onPhotoError(img);
  }
  function onPhotoError(img) {
    var ph = img.closest('.ph');
    if (!ph) return;
    ph.classList.add('is-missing');
    ph.classList.remove('is-loaded');
    ph.dispatchEvent(new CustomEvent('ordo:photomissing', { bubbles: true, detail: { img: img } }));
  }
  // load/error 는 버블링되지 않아서 캡처 단계에서 한 번에 받아요(나중에 넣은 사진도 자동 처리)
  doc.addEventListener('load', function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('ph__img')) onPhotoLoad(t);
  }, true);
  doc.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('ph__img')) onPhotoError(t);
  }, true);
  /** 이미 불러온 사진 상태를 다시 맞춰요(정적 HTML 사진 등). 보통 부를 필요 없음 */
  function syncPhotos(scope) {
    (scope || doc).querySelectorAll('img.ph__img').forEach(function (img) {
      if (img.complete) { if (img.naturalWidth) onPhotoLoad(img); else if (img.getAttribute('src')) onPhotoError(img); }
    });
  }

  /* ------------------------------------------------------------------
     6. 스크롤 잠금 (메뉴·라이트박스 공용, 중첩 가능)
     ------------------------------------------------------------------ */
  var lockCount = 0, lockY = 0;
  function lockScroll(on) {
    if (on) {
      if (lockCount++ === 0) {
        lockY = window.scrollY;
        var sbw = window.innerWidth - root.clientWidth;
        if (sbw > 0) body.style.paddingRight = sbw + 'px';
        root.classList.add('is-locked');
      }
    } else if (lockCount > 0 && --lockCount === 0) {
      root.classList.remove('is-locked');
      body.style.paddingRight = '';
      if (Math.abs(window.scrollY - lockY) > 2) window.scrollTo(0, lockY);
    }
  }

  /** 포커스를 container 안에서만 돌게 함. 해제 함수를 돌려줘요 */
  function trapFocus(container) {
    function onKey(e) {
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(
        container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        function (el) { return el.offsetParent !== null || el === doc.activeElement; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener('keydown', onKey);
    return function () { container.removeEventListener('keydown', onKey); };
  }

  /* ------------------------------------------------------------------
     7. 헤더 · 메뉴 · 푸터 · 하단 바
     ------------------------------------------------------------------ */
  var NAV = [
    { id: 'projects',  label: 'Projects',  href: 'projects.html' },
    { id: 'portfolio', label: 'Portfolio', href: 'portfolio.html' },
    { id: 'work',      label: 'Work',      href: 'work.html' },
    { id: 'studio',    label: 'Studio',    href: 'studio.html' },
    { id: 'contact',   label: 'Contact',   href: 'contact.html' }
  ];
  var page = body.getAttribute('data-page') || '';
  var navCurrent = body.getAttribute('data-nav') || page;

  function navLinksHTML(cls) {
    return NAV.map(function (n) {
      return '<li><a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + n.href + '" data-nav="' + n.id + '"' +
        (n.id === navCurrent ? ' aria-current="page"' : '') + '>' + n.label + '</a></li>';
    }).join('');
  }

  function renderHeader() {
    var el = doc.querySelector('[data-ordo="header"]');
    if (!el) return null;
    var name = esc(site.name);
    el.classList.add('site-header');
    el.id = el.id || 'site-header';
    el.innerHTML =
      '<div class="site-header__in wrap">' +
        '<a class="wordmark" href="index.html"' + (page === 'home' ? ' aria-current="page"' : '') + '>' + name + '</a>' +
        '<nav class="site-nav" aria-label="주요 메뉴"><ul class="commas" lang="en">' + navLinksHTML('') + '</ul></nav>' +
        '<a class="site-header__cta link" href="' + (page === 'contact' ? '#form' : 'contact.html#form') + '">의뢰 문의 <span class="arrow" aria-hidden="true">→</span></a>' +
        '<button class="menu-btn" type="button" aria-label="메뉴" aria-expanded="false" aria-controls="site-menu"><span></span><span></span></button>' +
      '</div>';
    return el;
  }

  function setNavCurrent(id) {
    navCurrent = id || '';
    doc.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.tagName !== 'A') return;
      if (a.getAttribute('data-nav') === navCurrent) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function onScrollHeader(header) {
    var update = rafThrottle(function () { header.classList.toggle('is-scrolled', window.scrollY > 4); });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  var menu = null, menuBtn = null, untrap = null, menuOpen = false;
  function channelLinkHTML(ch) {
    if (ch.empty) return '<span class="is-empty">' + esc(ch.short) + ' — ' + esc(ch.placeholder) + '</span>';
    return '<a class="link" href="' + esc(ch.href) + '"' + (ch.external ? ' target="_blank" rel="noopener"' : '') + '>' +
      esc(ch.short) + (ch.value ? ' <span class="t-muted">' + esc(ch.value) + '</span>' : '') + '</a>';
  }
  function buildMenu() {
    menu = doc.createElement('div');
    menu.className = 'menu';
    menu.id = 'site-menu';
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-modal', 'true');
    menu.setAttribute('aria-label', '메뉴');
    menu.hidden = true;
    // 연락처: 채워진 채널만 링크로, 비어 있는 채널은 회색 한 줄로 묶어서(막다른 링크 없음)
    var all = channels();
    var filled = all.filter(function (c) { return !c.empty; });
    var empty = all.filter(function (c) { return c.empty && c.id !== 'phone'; });
    var addr = address();
    var foot = filled.map(channelLinkHTML).join('') +
      (empty.length ? '<span class="is-empty">' + esc(empty.map(function (c) { return c.short; }).join(' · ')) + ' — 준비 중</span>' : '') +
      (addr ? '<span class="is-empty">' + esc(addr) + '</span>' : '');
    menu.innerHTML =
      '<div class="menu__top wrap">' +
        '<a class="wordmark" href="index.html">' + esc(site.name) + '</a>' +
        '<button class="menu__close" type="button" aria-label="메뉴 닫기"></button>' +
      '</div>' +
      '<nav class="menu__nav wrap" aria-label="모바일 메뉴"><ul lang="en">' + navLinksHTML('') + '</ul></nav>' +
      '<div class="menu__foot wrap">' + foot + '</div>';
    body.appendChild(menu);
    menu.querySelector('.menu__close').addEventListener('click', function () { closeMenu(); });
    menu.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closeMenu(); } });
    menu.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (a && a.getAttribute('href') && a.getAttribute('href').charAt(0) === '#') closeMenu(true);
    });
  }
  function openMenu() {
    if (!menu || menuOpen) return;
    menuOpen = true;
    menu.hidden = false;
    void menu.offsetWidth;            // 페이드 시작점 확보
    menu.classList.add('is-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    lockScroll(true);
    untrap = trapFocus(menu);
    var first = menu.querySelector('.menu__close');
    if (first) first.focus();
  }
  function closeMenu(noFocus) {
    if (!menu || !menuOpen) return;
    menuOpen = false;
    menu.classList.remove('is-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    lockScroll(false);
    if (untrap) { untrap(); untrap = null; }
    var hide = function () { if (!menuOpen) menu.hidden = true; };
    if (reducedMotion()) hide(); else setTimeout(hide, 220);
    // sticky 헤더 안 버튼으로 포커스를 돌릴 때 페이지가 위로 튀지 않게(preventScroll + 위치 한 번 더 고정)
    if (!noFocus && menuBtn) {
      var y = window.scrollY;
      try { menuBtn.focus({ preventScroll: true }); } catch (e) { menuBtn.focus(); }
      if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
    }
  }

  function renderFooter() {
    var el = doc.querySelector('[data-ordo="footer"]');
    if (!el) return null;
    el.classList.add('site-footer');
    // 가운데 줄: 주소 · 전화(tel) · 채워진 채널(카톡·인스타·메일). 빈 채널은 막다른 링크가 되므로 숨겨요
    var items = [];
    var addr = address();
    if (addr) items.push('<li>' + esc(addr) + '</li>');
    channels().forEach(function (c) {
      if (c.empty) return;
      var ext = c.external ? ' target="_blank" rel="noopener"' : '';
      var text = c.id === 'phone' ? c.value : c.short;
      items.push('<li><a href="' + esc(c.href) + '"' + ext + '><span class="link">' + esc(text) + '</span></a></li>');
    });
    if (!items.length) items.push('<li><a href="contact.html#channels"><span class="link">Contact</span></a></li>');
    var links = items.join('');
    var biz = !isPlaceholder(site.business) ? '<p class="site-footer__biz">' + esc(site.business) + '</p>' : '';
    el.innerHTML =
      '<div class="site-footer__in wrap">' +
        '<p lang="en">' + esc(site.name) + ' — ' + esc(site.descriptor) + ', ' + esc(site.city) + '</p>' +
        '<ul class="site-footer__links" aria-label="주소와 연락처">' + links + '</ul>' +
        '<p>© ' + esc(site.year) + ' ' + esc(site.name) + '</p>' +
        biz +
      '</div>';
    return el;
  }

  /* 하단 바 모드: 'default'(카톡 | 의뢰서) · 'none'(없음) · 'project'(이 작업처럼 의뢰하기 하나)
     · 'custom'(opts.label/href 로 버튼 하나) */
  var bar = null;
  function setBar(mode, opts) {
    opts = opts || {};
    mode = mode || 'default';
    body.setAttribute('data-bar', mode);
    if (mode === 'none') {
      if (bar) { bar.remove(); bar = null; }
      body.classList.remove('has-mbar');
      return null;
    }
    if (!bar) {
      bar = doc.createElement('nav');
      bar.className = 'mbar';
      bar.setAttribute('aria-label', '빠른 문의');
      body.appendChild(bar);
    }
    if (mode === 'default') {
      bar.classList.remove('mbar--single');
      // 카톡 채널 주소가 비어 있고 전화번호가 있으면 검정 버튼은 [전화 문의](카톡 주소를 넣으면 자동으로 카톡으로)
      var ph = phone();
      var kakaoEmpty = isEmptyText(site.contact && site.contact.kakaoUrl);
      var primary = (kakaoEmpty && ph)
        ? '<a class="mbar__primary" href="' + esc(ph.href) + '">전화 문의</a>'
        : '<a class="mbar__primary" href="' + esc(kakaoHref()) + '"' + kakaoAttrs() + '>카카오톡 문의</a>';
      bar.innerHTML =
        primary +
        '<a href="' + (page === 'contact' ? '#form' : 'contact.html#form') + '">의뢰서 작성 <span class="arrow" aria-hidden="true">→</span></a>';
    } else {
      var label = opts.label || (mode === 'project' ? '이 작업처럼 의뢰하기' : '의뢰 문의');
      var href = opts.href || 'contact.html#form';
      bar.classList.add('mbar--single');
      bar.innerHTML = '<a class="mbar__primary" href="' + esc(href) + '">' + esc(label) + ' <span class="arrow" aria-hidden="true">→</span></a>';
    }
    body.classList.add('has-mbar');
    return bar;
  }

  /* ------------------------------------------------------------------
     8. 리빌 (.reveal 요소가 화면에 들어오면 한 번만 .is-in)
     ------------------------------------------------------------------ */
  var io = null;
  function revealAll(scope) {
    (scope || doc).querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { el.classList.add('is-in'); });
  }
  function reveal(scope) {
    var els = (scope || doc).querySelectorAll('.reveal:not(.is-in)');
    if (!io) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    els.forEach(function (el) {
      if (el.__ordoObserved) return;
      el.__ordoObserved = true;
      io.observe(el);
    });
  }
  function initReveal() {
    if (reducedMotion() || !('IntersectionObserver' in window)) return;   // 숨기지 않음 = 바로 보임
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: isMobile() ? '0px 0px 15% 0px' : '0px 0px -6% 0px', threshold: 0 });
    root.classList.add('reveal-on');
    reveal(doc);
    // 페이지 JS가 나중에 그린 .reveal 도 자동으로 관찰
    if ('MutationObserver' in window) {
      var queue = rafThrottle(function () { reveal(doc); });
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) if (muts[i].addedNodes.length) { queue(); break; }
      }).observe(body, { childList: true, subtree: true });
    }
    // 안전장치: 어떤 이유로든 4초 뒤에도 화면 위쪽에 숨은 게 있으면 보여줌
    setTimeout(function () {
      doc.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add('is-in');
      });
    }, 4000);
  }

  /* ------------------------------------------------------------------
     9. 복사
     ------------------------------------------------------------------ */
  /** 클립보드에 복사. Promise<boolean>. 실패하면 false → selectText(el)로 직접 복사 안내 */
  function copy(text) {
    text = String(text == null ? '' : text);
    function legacy() {
      try {
        var ta = doc.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;';
        body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        var ok = doc.execCommand && doc.execCommand('copy');
        ta.remove();
        return !!ok;
      } catch (e) { return false; }
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacy(); });
    }
    return Promise.resolve(legacy());
  }
  /** 요소 안의 글자를 선택 상태로(복사 실패 폴백). input/textarea 도 가능 */
  function selectText(el) {
    if (!el) return;
    try {
      if (el.select) { el.focus(); el.select(); return; }
      var range = doc.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* 무시 */ }
  }

  /* ------------------------------------------------------------------
     10. 초기화
     ------------------------------------------------------------------ */
  var header = renderHeader();
  renderFooter();
  if (header) {
    menuBtn = header.querySelector('.menu-btn');
    buildMenu();
    if (menuBtn) menuBtn.addEventListener('click', function () { menuOpen ? closeMenu() : openMenu(); });
    onScrollHeader(header);
    window.addEventListener('resize', rafThrottle(function () { if (menuOpen && !isMobile()) closeMenu(true); }));
  }
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) closeMenu(); });
  setBar(body.getAttribute('data-bar') || 'default');
  initReveal();
  syncPhotos(doc);

  /* ------------------------------------------------------------------
     공개 API
     ------------------------------------------------------------------ */
  window.ORDO = {
    version: '1.0.0',
    site: site,
    page: page,
    dataOk: dataErrors.length === 0,
    dataErrors: dataErrors,
    dataIssues: dataIssues,
    showNotice: showNotice,

    GROUPS: GROUPS,
    CATEGORIES: CATEGORIES,
    getWorks: getWorks,
    getWork: getWork,
    neighbors: neighbors,
    categories: categories,
    category: function (id) { return CAT_BY_ID[id] || null; },
    ratio: ratio,
    imgPath: imgPath,
    image: function (work, group, item, i) { return normImage(work, group, item, i || 0); },

    photo: photo,
    photoHTML: photoHTML,
    syncPhotos: syncPhotos,

    projectUrl: projectUrl,
    contactUrl: contactUrl,
    param: param,
    cameFromSite: cameFromSite,
    channels: channels,
    telHref: telHref,
    phone: phone,
    address: address,
    kakaoHref: kakaoHref,
    kakaoAttrs: kakaoAttrs,

    setBar: setBar,
    setNavCurrent: setNavCurrent,
    openMenu: openMenu,
    closeMenu: closeMenu,
    lockScroll: lockScroll,
    trapFocus: trapFocus,

    reveal: reveal,
    revealAll: revealAll,

    copy: copy,
    selectText: selectText,

    esc: esc,
    pad: pad,
    rng: rng,
    rafThrottle: rafThrottle,
    reducedMotion: reducedMotion,
    canHover: canHover,
    isMobile: isMobile,
    isPlaceholder: isPlaceholder
  };
})();
