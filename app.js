/* حقيبة الحاسوب — تصميم وبرمجة: الأستاذ علي الصفار */
(function () {
  'use strict';
  var ADMIN = 'ali_alsaffar@uomosul.edu.iq';
  var DOMAIN = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/i;
  var CFG = window.FB_CONFIG || {};
  var LIVE = !!(CFG.apiKey && CFG.projectId);
  var FS = LIVE ? 'https://firestore.googleapis.com/v1/projects/' + CFG.projectId + '/databases/(default)/documents' : '';
  var DOCP = LIVE ? 'projects/' + CFG.projectId + '/databases/(default)/documents' : '';
  var IDT = 'https://identitytoolkit.googleapis.com/v1/accounts:';

  /* ---------- أدوات عامة ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lsGet(k, d) { try { var v = localStorage.getItem('c2_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { if (v === undefined) localStorage.removeItem('c2_' + k); else localStorage.setItem('c2_' + k, JSON.stringify(v)); } catch (e) { } }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function fmtN(n) { return n == null ? '—' : Number(n).toLocaleString('ar-IQ'); }
  function today() { var d = new Date(); return d.toISOString().slice(0, 10); }
  function daysLeft(due) { if (!due) return null; var a = new Date(due + 'T23:59:59'), b = new Date(); return Math.ceil((a - b) / 86400000); }
  function fmtDate(iso) { try { return new Date(iso).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long' }); } catch (e) { return iso; } }
  var toastT;
  function toast(m) { var t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600); }

  /* الوضع الليلي والنهاري */
  function curTheme() { var t = document.documentElement.getAttribute('data-theme'); if (t) return t; return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  (function () { var t = lsGet('theme', null); if (t) document.documentElement.setAttribute('data-theme', t); })();
  function themeBtn(extra) {
    var dark = curTheme() === 'dark';
    var sun = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>';
    var moon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
    return '<button class="iconbtn themebtn' + (extra || '') + '" data-a="theme" aria-label="' + (dark ? 'الوضع النهاري' : 'الوضع الليلي') + '" title="' + (dark ? 'الوضع النهاري' : 'الوضع الليلي') + '">' + (dark ? sun : moon) + '</button>';
  }
  var P = lsGet('prog', null) || { read: {}, best: {}, known: {}, hwDone: {} };
  function saveP() { lsSet('prog', P); }

  /* ---------- المصادقة بالبريد الجامعي ---------- */
  var AUTH = lsGet('auth', null);
  function setAuth(a) { AUTH = a; lsSet('auth', a || undefined); }
  function isAdmin() { return !!AUTH && (AUTH.email || '').toLowerCase() === ADMIN; }
  function tfetch(url, opts, ms) {
    var c = ('AbortController' in window) ? new AbortController() : null; if (c) { opts.signal = c.signal; setTimeout(function () { c.abort(); }, ms || 15000); }
    return fetch(url, opts);
  }
  async function post(url, body, form) {
    var r = await tfetch(url, { method: 'POST', headers: { 'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json' }, body: form ? body : JSON.stringify(body) });
    var j = await r.json().catch(function () { return {}; });
    if (!r.ok) { var m = (j.error && j.error.message) || ('HTTP ' + r.status); throw new Error(m); }
    return j;
  }
  function baseUrl() { return location.origin + location.pathname; }
  async function sendLink(email) {
    return post(IDT + 'sendOobCode?key=' + CFG.apiKey, { requestType: 'EMAIL_SIGNIN', email: email, continueUrl: baseUrl(), canHandleCodeInApp: true });
  }
  async function pwAuth(signup, email, pw) {
    var j = await post(IDT + (signup ? 'signUp' : 'signInWithPassword') + '?key=' + CFG.apiKey, { email: email, password: pw, returnSecureToken: true });
    setAuth({ idToken: j.idToken, refreshToken: j.refreshToken, exp: Date.now() + (+j.expiresIn || 3600) * 1000, email: (j.email || email).toLowerCase(), uid: j.localId });
  }
  function sendReset(email) { return post(IDT + 'sendOobCode?key=' + CFG.apiKey, { requestType: 'PASSWORD_RESET', email: email }); }
  function authErr(e) {
    var m = (e && e.message) || '';
    if (/EMAIL_EXISTS/.test(m)) return 'هذا البريد مسجل من قبل. اختر «لدي حساب» وسجّل الدخول.';
    if (/INVALID_LOGIN_CREDENTIALS|INVALID_PASSWORD|EMAIL_NOT_FOUND/.test(m)) return 'البريد أو كلمة المرور غير صحيحة.';
    if (/WEAK_PASSWORD/.test(m)) return 'كلمة المرور قصيرة. اكتب 6 أحرف أو أرقام على الأقل.';
    if (/INVALID_EMAIL/.test(m)) return 'البريد الإلكتروني غير صحيح.';
    if (/TOO_MANY_ATTEMPTS|QUOTA_EXCEEDED|RESET_PASSWORD_EXCEED_LIMIT/.test(m)) return 'محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.';
    if (/USER_DISABLED/.test(m)) return 'هذا الحساب موقوف. راجع الأستاذ.';
    if (/OPERATION_NOT_ALLOWED|PASSWORD_LOGIN_DISABLED/.test(m)) return 'الدخول بكلمة المرور غير مفعّل في إعدادات قاعدة البيانات.';
    if (/abort|Failed to fetch|NetworkError/i.test(m)) return 'تعذر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.';
    return 'تعذر الدخول. حاول مرة أخرى. (' + m.slice(0, 60) + ')';
  }
  async function finishLink(email, oob) {
    var j = await post(IDT + 'signInWithEmailLink?key=' + CFG.apiKey, { email: email, oobCode: oob });
    setAuth({ idToken: j.idToken, refreshToken: j.refreshToken, exp: Date.now() + (+j.expiresIn || 3600) * 1000, email: (j.email || email).toLowerCase(), uid: j.localId });
  }
  async function token() {
    if (!AUTH || !LIVE) return null;
    if (Date.now() < AUTH.exp - 60000) return AUTH.idToken;
    try {
      var j = await post('https://securetoken.googleapis.com/v1/token?key=' + CFG.apiKey, 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(AUTH.refreshToken), true);
      AUTH.idToken = j.id_token; AUTH.refreshToken = j.refresh_token; AUTH.exp = Date.now() + (+j.expires_in || 3600) * 1000; setAuth(AUTH);
      return AUTH.idToken;
    } catch (e) { if (/TOKEN_EXPIRED|INVALID_REFRESH_TOKEN|USER_DISABLED|USER_NOT_FOUND/.test(e.message)) { setAuth(null); S.view = 'gate'; render(); } throw e; }
  }

  /* ---------- قاعدة البيانات ---------- */
  function enc(v) { if (v === null || v === undefined) return { nullValue: null }; if (typeof v === 'boolean') return { booleanValue: v }; if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }; if (v instanceof Date) return { timestampValue: v.toISOString() }; return { stringValue: String(v) }; }
  function encF(o) { var f = {}; for (var k in o) f[k] = enc(o[k]); return { fields: f }; }
  function dec(v) { if ('stringValue' in v) return v.stringValue; if ('integerValue' in v) return +v.integerValue; if ('doubleValue' in v) return v.doubleValue; if ('booleanValue' in v) return v.booleanValue; if ('timestampValue' in v) return v.timestampValue; return null; }
  function decD(d) { var o = { id: d.name.split('/').pop() }; var f = d.fields || {}; for (var k in f) o[k] = dec(f[k]); return o; }
  async function fs(method, path, body) {
    var t = await token();
    var h = { 'Content-Type': 'application/json' }; if (t) h.Authorization = 'Bearer ' + t;
    var r = await tfetch(FS + path + (path.indexOf('?') < 0 ? '?' : '&') + 'key=' + CFG.apiKey, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 404 && method === 'GET') return null;
    if (!r.ok) { var tx = await r.text(); throw new Error(tx.slice(0, 160)); }
    var tx2 = await r.text(); return tx2 ? JSON.parse(tx2) : {};
  }
  function incr(fields) {
    return fs('POST', ':commit', { writes: [{ transform: { document: DOCP + '/stats/main', fieldTransforms: Object.keys(fields).map(function (k) { return { fieldPath: k, increment: { integerValue: String(fields[k]) } }; }) } }] });
  }

  var DB = LIVE ? {
    visit: function () { return incr({ visits: 1 }); },
    stats: async function () { var d = await fs('GET', '/stats/main'); return d ? decD(d) : {}; },
    quiz: function (n, pass) { var f = {}; f['a' + n] = 1; f['p' + n] = pass ? 1 : 0; return incr(f); },
    profile: async function () { var d = await fs('GET', '/users/' + AUTH.uid); return d ? decD(d) : null; },
    saveProfile: async function (p) { await fs('PATCH', '/users/' + AUTH.uid, encF({ name: p.name, group: p.group || '', email: AUTH.email, joined: (S.profile && S.profile.joined) ? new Date(S.profile.joined) : new Date(), fbSeen: !!(S.profile && S.profile.fbSeen) })); if (!(S.profile && S.profile.joined)) await incr({ users: 1 }); },
    users: async function () { var d = await fs('GET', '/users?pageSize=500'); return ((d && d.documents) || []).map(decD); },
    homework: async function () { var d = await fs('GET', '/homework?pageSize=200'); var l = ((d && d.documents) || []).map(decD); lsSet('hwcache', l); return l; },
    addHw: function (h) { return fs('POST', '/homework', encF({ title: h.title, ch: +h.ch || 0, details: h.details || '', due: h.due || '', link: h.link || '', created: new Date() })); },
    delHw: function (id) { return fs('DELETE', '/homework/' + id); },
    announce: async function () { var d = await fs('GET', '/config/announce'); var a = d ? decD(d) : null; lsSet('anncache', a); return a; },
    setAnnounce: function (t) { return fs('PATCH', '/config/announce', encF({ text: t, ts: new Date() })); },
    ask: function (c) { return fs('POST', '/comments', encF({ uid: AUTH.uid, email: AUTH.email, name: (S.profile && S.profile.name) || '', group: (S.profile && S.profile.group) || '', ch: c.ch, topic: c.topic, topicTitle: c.topicTitle, text: c.text, status: 'open', ts: new Date() })); },
    myQs: async function () { var r = await fs('POST', ':runQuery', { structuredQuery: { from: [{ collectionId: 'comments' }], where: { fieldFilter: { field: { fieldPath: 'uid' }, op: 'EQUAL', value: { stringValue: AUTH.uid } } } } }); return (r || []).filter(function (x) { return x.document; }).map(function (x) { return decD(x.document); }); },
    allQs: async function () { var d = await fs('GET', '/comments?pageSize=500'); return ((d && d.documents) || []).map(decD); },
    setQ: function (id, st) { return fs('PATCH', '/comments/' + id + '?updateMask.fieldPaths=status', encF({ status: st })); },
    delQ: function (id) { return fs('DELETE', '/comments/' + id); },
    rate: async function (r, note) { var f = {}; f['r' + r] = 1; await incr(f); if (note) await fs('POST', '/fbnotes', encF({ text: note, ts: new Date() })); },
    ratings: async function () { var d = await fs('GET', '/fbnotes?pageSize=500'); return ((d && d.documents) || []).map(decD); },
    rateSeen: function () { return fs('PATCH', '/users/' + AUTH.uid + '?updateMask.fieldPaths=fbSeen', encF({ fbSeen: true })); },
    banned: async function () { var d = await fs('GET', '/banned?pageSize=500'); return ((d && d.documents) || []).map(decD); },
    amBanned: async function () { return !!(await fs('GET', '/banned/' + AUTH.uid)); },
    ban: function (u) { return fs('PATCH', '/banned/' + u.id, encF({ name: u.name || '', email: u.email || '', group: u.group || '', ts: new Date() })); },
    unban: function (uid) { return fs('DELETE', '/banned/' + uid); },
    delUser: async function (uid) { await fs('DELETE', '/users/' + uid); await incr({ users: -1 }); }
  } : (function () {
    /* وضع المعاينة: كل شيء محفوظ على هذا الجهاز فقط */
    var D = lsGet('demo', null) || { stats: { visits: 0, users: 1 }, hw: [], ann: null, qs: [], users: [] };
    function sv() { lsSet('demo', D); }
    function id() { return Math.random().toString(36).slice(2, 10); }
    return {
      visit: async function () { D.stats.visits = (D.stats.visits || 0) + 1; sv(); },
      stats: async function () { return D.stats; },
      quiz: async function (n, p) { D.stats['a' + n] = (D.stats['a' + n] || 0) + 1; D.stats['p' + n] = (D.stats['p' + n] || 0) + (p ? 1 : 0); sv(); },
      profile: async function () { return lsGet('demoprof', null); },
      saveProfile: async function (p) { lsSet('demoprof', p); D.users = D.users.filter(function (u) { return u.id !== AUTH.uid; }); D.users.push({ id: AUTH.uid, name: p.name, group: p.group, email: AUTH.email, joined: new Date().toISOString() }); sv(); },
      users: async function () { return D.users; },
      homework: async function () { return D.hw; },
      addHw: async function (h) { D.hw.push(Object.assign({ id: id(), created: new Date().toISOString() }, h, { ch: +h.ch || 0 })); sv(); },
      delHw: async function (i) { D.hw = D.hw.filter(function (x) { return x.id !== i; }); sv(); },
      announce: async function () { return D.ann; },
      setAnnounce: async function (t) { D.ann = { text: t, ts: new Date().toISOString() }; sv(); },
      ask: async function (c) { D.qs.push(Object.assign({ id: id(), uid: AUTH.uid, email: AUTH.email, name: (S.profile && S.profile.name) || '', group: (S.profile && S.profile.group) || '', status: 'open', ts: new Date().toISOString() }, c)); sv(); },
      myQs: async function () { return D.qs.filter(function (q) { return q.uid === AUTH.uid; }); },
      allQs: async function () { return D.qs; },
      setQ: async function (i, st) { D.qs.forEach(function (q) { if (q.id === i) q.status = st; }); sv(); },
      delQ: async function (i) { D.qs = D.qs.filter(function (q) { return q.id !== i; }); sv(); },
      rate: async function (r, note) { D.stats['r' + r] = (D.stats['r' + r] || 0) + 1; if (note) (D.notes = D.notes || []).push({ id: id(), text: note, ts: new Date().toISOString() }); sv(); },
      ratings: async function () { return D.notes || []; },
      banned: async function () { return D.banned || []; },
      amBanned: async function () { return (D.banned || []).some(function (b) { return b.id === AUTH.uid; }); },
      ban: async function (u) { (D.banned = D.banned || []).push({ id: u.id, name: u.name, email: u.email, group: u.group, ts: new Date().toISOString() }); sv(); },
      unban: async function (uid) { D.banned = (D.banned || []).filter(function (b) { return b.id !== uid; }); sv(); },
      delUser: async function (uid) { D.users = D.users.filter(function (u) { return u.id !== uid; }); sv(); },
      rateSeen: async function () { var pf = lsGet('demoprof', null); if (pf) { pf.fbSeen = true; lsSet('demoprof', pf); } }
    };
  })();

  /* رأي الطالب بالتطبيق: 6 أعلى تقدير و1 أدناه */
  var RATES = [[6, 'ممتاز'], [5, 'جيد جداً'], [4, 'جيد'], [3, 'لا بأس به'], [2, 'سيئ'], [1, 'لا نحتاجه']];
  function rateName(n) { var r = RATES.filter(function (x) { return x[0] === +n; })[0]; return r ? r[1] : '—'; }
  function maybeAskRating() {
    if (!AUTH || isAdmin() || !S.profile || S.profile.fbSeen || lsGet('fbseen-' + AUTH.uid, false)) return;
    /* لا يظهر إلا بعد مرور يومين على تسجيل الطالب */
    var fk = 'first-' + AUTH.uid, first = lsGet(fk, null); if (!first) { first = new Date().toISOString(); lsSet(fk, first); }
    var j = Date.parse(S.profile.joined || '') || Date.parse(first);
    if (Date.now() - j < 2 * 864e5) return;
    lsSet('fbseen-' + AUTH.uid, true); S.profile.fbSeen = true; lsSet('prof', S.profile);
    DB.rateSeen().catch(function () { });
    setTimeout(function () { if (S.view !== 'gate' && !S.sheet) { S.sheet = { type: 'rate' }; render(); } }, 2500);
  }

  /* ---------- الحالة ---------- */
  var S = { view: 'home', stack: [], ch: null, tab: 'sum', stats: null, hw: lsGet('hwcache', []), ann: lsGet('anncache', null), myqs: [], profile: null, sheet: null, adminTab: 'qs', qFilter: 'open', cardF: 0, cardI: 0, flip: false };
  var NAVV = ['home', 'cards', 'tests', 'tools', 'hw'];
  function go(v, extra) { if (NAVV.indexOf(v) >= 0) S.stack = []; else S.stack.push(S.view); S.view = v; Object.assign(S, extra || {}); render(); window.scrollTo(0, 0); }
  function back() { S.view = S.stack.pop() || 'home'; render(); window.scrollTo(0, 0); }

  /* ---------- أيقونات واجهة ---------- */
  function ic(d, w) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
  var I = {
    home: ic('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
    cards: ic('<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>'),
    tests: ic('<path d="M9 11l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="2"/>'),
    tools: ic('<path d="M14 6l4 4M3 21l7-7M14.5 3.5a4 4 0 0 0 5 5l-9 9-5-5z"/>'),
    hw: ic('<path d="M8 3h8l4 4v14H4V3z"/><path d="M8 12h8M8 16h5"/>'),
    back: ic('<path d="M9 6l6 6-6 6"/>', 2.2),
    ask: ic('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M12 8v4M12 16h.01"/>'),
    bell: ic('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21h4"/>'),
    out: ic('<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>'),
    shield: ic('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'),
    bulb: ic('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>'),
    install: ic('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>')
  };
  var LOGO = '<img src="icons/college-logo-160.png" alt="شعار كلية الإدارة والاقتصاد" width="40" height="40">';

  /* ---------- مخططات HTML ---------- */
  var ILH = {
    phish: function () { return '<div class="mock"><span class="small mute">من: خدمة العملاء &lt;support-bank@gmaiI.co&gt;</span><b>عاجل!! سيغلق حسابك خلال ساعة</b><span class="flag">استعجال وتهديد</span><span class="small">لتجنب الايقاف ادخل كلمة المرور ورمز التحقق عبر الرابط:</span><span class="ltr">bank-iq.verify-login.net</span><div class="row"><span class="flag">رابط مختلف</span><span class="flag">طلب كلمة المرور</span><span class="flag">أخطاء إملائية</span></div><span class="small mute">رسالة وهمية للتدريب</span></div>'; },
    prompt6: function () { return '<div class="grid6">' + [['الدور', 'بأي صفة؟'], ['المهمة', 'ما المطلوب؟'], ['السياق', 'ما المعلومات؟'], ['الجمهور', 'لمن؟'], ['الصيغة', 'أي شكل وطول؟'], ['القيود', 'ماذا نتجنب؟']].map(function (x) { return '<div><b>' + x[0] + '</b>' + x[1] + '</div>'; }).join('') + '</div>'; },
    genflow: function () { return flowH(['أمر واضح', 'مسودة الأداة', 'تدقيق الموظف', 'تصحيح', 'اعتماد وتوقيع']); },
    letter: function () { return '<div class="letter"><div class="r"><span>الجهة المرسلة</span><span>العدد والتاريخ</span></div><div>إلى / الجهة المرسل إليها</div><div class="c">م / الموضوع</div><div>التحية</div><div class="ln"></div><div class="ln"></div><div class="ln" style="width:70%"></div><div>الختام</div><div class="r"><span>المرفقات</span><span>التوقيع</span></div><div>نسخة منه إلى</div></div>'; },
    triad: function () { return '<div class="grid6" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><b>الرقائق</b>المتقدمة</div><div><b>البيانات</b>الضخمة</div><div><b>الكفاءات</b>البشرية</div></div>'; },
    humanai: function () { return '<div class="duo"><div><b>الآلة</b>الحساب، البحث، التكرار، السرعة</div><div><b>الإنسان</b>الحكم الأخلاقي، التعاطف، الإبداع، تحمل المسؤولية</div></div><p class="small mute" style="margin-top:6px">القرار يبقى للإنسان</p>'; },
    autobars: function () { return '<div class="bars"><div><span>مرتفع</span><i style="width:92%"></i></div><div><span>متوسط</span><i style="width:58%;background:var(--acc)"></i></div><div><span>منخفض</span><i style="width:24%;background:var(--ai)"></i></div><p class="small mute">مرتفع: إدخال البيانات والترجمة الأولية. متوسط: المحاسبة والتقارير والبرمجة. منخفض: التمريض والتعليم المباشر والتفاوض.</p></div>'; },
    verify: function () { return flowH(['اطلب المصدر', 'مصدر مستقل', 'دقق الأرقام', 'أداة ثانية', 'المختص']); },
    anon: function () { return '<div class="duo"><div><b>قبل</b>الموظف أحمد خالد، الرقم الوظيفي 45821، تأخر ثلاثة أيام.</div><div><b>بعد</b>الموظف (أ)، تأخر ثلاثة أيام.</div></div>'; },
    mltypes: function () { return '<div class="grid6" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><b>بإشراف</b>أمثلة + إجابات</div><div><b>بلا إشراف</b>اكتشاف مجموعات</div><div><b>بالتعزيز</b>مكافأة وعقوبة</div></div>'; },
    llm: function () { return flowH(['الأمر', 'تقسيم إلى رموز', 'توقع الرمز التالي', 'تكرار حتى يكتمل', 'الجواب']); }
  };
  function flowH(a) { return '<div class="flow">' + a.map(function (x, i) { return (i ? '<i aria-hidden="true">←</i>' : '') + '<span>' + esc(x) + '</span>'; }).join('') + '</div>'; }
  function illHTML(k) { if (ILL[k]) return '<div class="ill">' + ILL[k]() + '</div>'; if (ILH[k]) return '<div class="ill">' + ILH[k]() + '</div>'; return ''; }
  function devCard(k) { var d = DEV[k]; if (!d) return ''; return '<div class="dev"><div class="pic">' + d.svg + '</div><b>' + esc(d.ar) + '</b><span class="ltr">' + esc(d.en) + '</span><p>' + esc(d.fn) + '</p></div>'; }
  function tbl(t) { return '<div class="tblwrap"><table><thead><tr>' + t.h.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + t.r.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'; }


  /* أيقونات خطية بسيطة للفصول والأدوات */
  function li(d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
  var LI = {
    switch: li('<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M12 7.2v4.3M12 11.5l-5.6 5.7M12 11.5l5.6 5.7M7.2 19h9.6"/>'),
    firewall: li('<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z"/><rect x="9" y="10.5" width="6" height="5" rx="1"/><path d="M10.2 10.5V9a1.8 1.8 0 0 1 3.6 0v1.5"/>'),
    card: li('<rect x="3" y="6" width="18" height="12.5" rx="2"/><path d="M3 10h18M7 15h4"/>'),
    mobo: li('<path d="M14.5 6.5a4 4 0 0 0-5.3 5.2L4 17l3 3 5.3-5.2a4 4 0 0 0 5.2-5.3l-2.4 2.4-2.6-.4-.4-2.6z"/>'),
    brain: li('<path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>'),
    phone: li('<rect x="7" y="3" width="10" height="18" rx="2.2"/><path d="M11 18h2"/>'),
    doc: li('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 15.5h5"/>'),
    globe: li('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c-2.5 2.6-2.5 14.4 0 17M12 3.5c2.5 2.6 2.5 14.4 0 17"/>'),
    shield: li('<path d="M12 4v16M7 20h10M5 7h14M5 7l-2.5 6h5zM19 7l-2.5 6h5z"/><path d="M2.5 13a2.5 2 0 0 0 5 0M16.5 13a2.5 2 0 0 0 5 0"/>'),
    agent: li('<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 8V5M9.5 13h.01M14.5 13h.01M9.5 16.2h5"/><circle cx="12" cy="4" r="1"/>'),
    devices: li('<rect x="3" y="5" width="13" height="9" rx="1.5"/><path d="M7 18h5M9.5 14v4"/><rect x="17" y="9" width="4.5" height="10" rx="1"/>'),
    phish: li('<path d="M4 6h16v10H9l-5 4z"/><path d="M12 9v3M12 14.2h.01"/>'),
    clinic: li('<path d="M14.5 6.5a4 4 0 0 0-5.3 5.2L4 17l3 3 5.3-5.2a4 4 0 0 0 5.2-5.3l-2.4 2.4-2.6-.4-.4-2.6z"/>'),
    order: li('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 5.5l1 .5v3M4 11.5h2l-2 3h2M4 17h2l-1 1 1 1H4"/>'),
    prompt: li('<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9.5l2 1.5-2 1.5M12 12.5h4"/>'),
    pass: li('<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14v2.5"/>')
  };

  /* ---------- الشاشات ---------- */

  /* ---------- جرس التنبيهات ---------- */
  function notifItems() {
    var l = S.hw.map(function (h) { return { type: 'hw', id: h.id, title: h.title, body: (h.ch ? 'الفصل ' + h.ch + ' · ' : '') + (h.due ? 'آخر موعد ' + h.due : 'واجب جديد'), ts: h.created || '' }; });
    if (S.ann && S.ann.text) l.push({ type: 'ann', id: 'ann-' + (S.ann.ts || ''), title: 'إعلان من الأستاذ', body: S.ann.text, ts: S.ann.ts || '' });
    return l.sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
  }
  function unseen() { var seen = lsGet('seenTs', ''); return notifItems().filter(function (n) { return n.ts && n.ts > seen; }).length; }
  function bellBtn() {
    if (!AUTH) return '';
    var n = unseen();
    return '<button class="iconbtn bellbtn" data-a="bell" aria-label="التنبيهات' + (n ? '، ' + n + ' جديد' : '') + '">' + I.bell + (n ? '<span class="bdot">' + (n > 9 ? '9+' : n) + '</span>' : '') + '</button>';
  }
  function notifSheet() {
    var l = notifItems(), seen = S.sheet.seen || '';
    var perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    return '<h3>التنبيهات</h3>' +
      (perm === 'default' ? '<div class="tipbox" style="display:grid;gap:8px"><span>فعّل إشعارات الجهاز ليصلك تنبيه عند نزول واجب أو إعلان جديد.</span><button class="btn amb" data-a="askperm">تفعيل الإشعارات</button></div>' : perm === 'denied' ? '<p class="small mute">الإشعارات مرفوضة في إعدادات المتصفح. يمكنك السماح بها من إعدادات الموقع.</p>' : '') +
      (l.length ? '<div class="notifs">' + l.map(function (n) {
        return '<button class="notif' + (n.ts > seen ? ' new' : '') + '" data-a="notifgo" data-t="' + n.type + '"><span class="nic ' + n.type + '">' + (n.type === 'hw' ? I.hw : I.bell) + '</span><span class="ntx"><b>' + esc(n.title) + '</b><span>' + esc(n.body) + '</span>' + (n.ts ? '<small>' + fmtDate(n.ts) + '</small>' : '') + '</span>' + (n.ts > seen ? '<span class="pill amb">جديد</span>' : '') + '</button>';
      }).join('') + '</div>' : '<div class="empty">لا توجد تنبيهات بعد. سيظهر هنا كل واجب أو إعلان ينشره الأستاذ.</div>') +
      '<button class="btn ghost" data-a="closesheet">إغلاق</button>';
  }
  async function sysNotify() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    var last = lsGet('notifiedTs', null);
    var items = notifItems();
    if (last === null) { lsSet('notifiedTs', items[0] ? items[0].ts : new Date().toISOString()); return; }
    var fresh = items.filter(function (n) { return n.ts && n.ts > last; });
    if (!fresh.length) return;
    lsSet('notifiedTs', fresh[0].ts);
    for (var i = 0; i < Math.min(fresh.length, 3); i++) {
      var n = fresh[i], opt = { body: n.body.slice(0, 140), icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: n.id, dir: 'rtl', lang: 'ar' };
      try { var reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (reg) await reg.showNotification((n.type === 'hw' ? 'واجب جديد: ' : '') + n.title, opt); else new Notification(n.title, opt); } catch (e) { }
    }
  }
  async function pollNotifs() {
    maybeAskRating();
    if (!AUTH || document.hidden) return;
    try { S.hw = await DB.homework(); } catch (e) { }
    try { S.ann = await DB.announce(); } catch (e) { }
    sysNotify();
    if (!S.sheet && ['home', 'hw', 'chapter', 'cards', 'tests', 'tools'].indexOf(S.view) >= 0) { var b = document.querySelector('.bellbtn'); if (b) b.outerHTML = bellBtn(); }
  }
  setInterval(pollNotifs, 120000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) pollNotifs(); });

  function topbar(title, withBack) {
    return '<header class="top"><div class="in">' + (withBack ? '<button class="iconbtn" data-a="back" aria-label="رجوع">' + I.back + '</button>' : '<span class="logo">' + LOGO + '</span>') + '<h1>' + esc(title) + '</h1>' + bellBtn() + themeBtn() +
      (S.view === 'home' && isAdmin() ? '<button class="iconbtn" data-a="go" data-v="admin" aria-label="لوحة الأدمن">' + I.shield + '</button>' : '') + '</div></header>';
  }
  function navbar() {
    var pend = S.hw.filter(function (h) { var d = daysLeft(h.due); return !P.hwDone[h.id] && (d == null || d >= 0); }).length;
    var it = [['home', 'الرئيسية'], ['cards', 'البطاقات'], ['tests', 'الاختبارات'], ['tools', 'الأدوات'], ['hw', 'الواجبات']];
    var cur = NAVV.indexOf(S.view) >= 0 ? S.view : (S.stack[0] || 'home');
    return '<nav class="nav" aria-label="التنقل"><div class="in">' + it.map(function (x) { return '<button data-a="go" data-v="' + x[0] + '"' + (cur === x[0] ? ' aria-current="page"' : '') + '>' + I[x[0]] + '<span>' + x[1] + '</span>' + (x[0] === 'hw' && pend ? '<span class="badge">' + pend + '</span>' : '') + '</button>'; }).join('') + '</div></nav>';
  }
  function chProgress(c) { var n = c.sec.length; var r = (P.read[c.n] || []).length; return Math.round(Math.min(r, n) / n * 100); }
  function chCard(c) {
    var b = P.best[c.n];
    return '<button class="chcard ' + c.unit + '" data-a="open" data-ch="' + c.n + '"><span class="ic"><span class="num">' + c.n + '</span>' + LI[c.icon] + '</span><span class="tx"><b>' + esc(c.title) + '</b><span>' + esc(c.week) + ' · ' + c.sec.length + ' موضوعات' + (b != null ? ' · أفضل نتيجة ' + b + '%' : '') + '</span><span class="bar"><i style="width:' + chProgress(c) + '%"></i></span></span></button>';
  }
  function footer() {
    return '<div class="foot"><img class="footlogo" src="icons/college-logo-160.png" alt="شعار كلية الإدارة والاقتصاد" width="64" height="64"><span>تطبيقات إدارية باستخدام الحاسوب · المرحلة الثانية</span><span>قسم إدارة الأعمال · كلية الإدارة والاقتصاد · جامعة الموصل</span><span>تصميم وبرمجة</span><b>الأستاذ علي الصفار</b>' +
      (AUTH ? '<span class="ltr" style="text-align:center">' + esc(AUTH.email) + '</span><div class="row" style="justify-content:center"><button class="linkbtn" data-a="install">طريقة تثبيت التطبيق</button><button class="linkbtn" data-a="logout">تسجيل الخروج</button></div>' : '') + '</div>';
  }

  function vHome() {
    var tip = TIPS[new Date().getDate() % TIPS.length];
    var name = S.profile && S.profile.name ? S.profile.name.split(' ')[0] : '';
    var st = S.stats || {};
    var next = S.hw.filter(function (h) { var d = daysLeft(h.due); return !P.hwDone[h.id] && (d == null || d >= 0); }).sort(function (a, b) { return (a.due || '9') < (b.due || '9') ? -1 : 1; })[0];
    var u1 = CH.filter(function (c) { return c.unit === 'net'; }), u2 = CH.filter(function (c) { return c.unit === 'ai'; });
    return topbar('حقيبة الحاسوب') + '<main class="wrap">' +
      '<section class="hero"><span class="eyebrow">تطبيقات إدارية باستخدام الحاسوب</span><h2>' + (name ? 'أهلاً ' + esc(name) : 'أهلاً بك') + '</h2><p>عشرة فصول ملخصة، واختبارات، وبطاقات مصطلحات، وأدوات تدريب.</p>' +
      '<div class="stats"><div class="stat"><b>' + fmtN(st.users) + '</b><span>مستخدمو التطبيق</span></div><div class="stat"><b>' + fmtN(st.visits) + '</b><span>مرات الفتح</span></div><div class="stat"><b>' + fmtN(Object.keys(P.known).length) + '</b><span>مصطلحاً حفظته</span></div></div>' +
      '<img class="wmark" src="icons/college-mark-white.png" alt="" aria-hidden="true"></section>' +
      (S.ann && S.ann.text ? '<div class="announce" role="note">' + I.bell + '<div><b>إعلان من الأستاذ</b><p>' + esc(S.ann.text) + '</p></div></div>' : '') +
      (next ? '<section class="block"><h3>أقرب واجب<small><button class="linkbtn" data-a="go" data-v="hw">كل الواجبات</button></small></h3>' + hwCard(next) + '</section>' : '') +
      '<section class="block"><div class="card tip"><span class="bulb">' + I.bulb + '</span><p><b>معلومة اليوم:</b> ' + esc(tip) + '</p></div></section>' +
      '<section class="block"><h3>فصول المقرر</h3><div class="unit">الوحدة الأولى: الحاسوب والشبكات والخدمات الإلكترونية</div><div class="chlist">' + u1.map(chCard).join('') + '</div>' +
      '<div class="unit">الوحدة الثانية: الذكاء الاصطناعي</div><div class="chlist">' + u2.map(chCard).join('') + '</div></section>' + footer() + '</main>';
  }

  function vChapter() {
    var c = CH[S.ch - 1];
    var tabs = [['sum', 'الملخص'], ['terms', 'المصطلحات'], ['quiz', 'اختبر نفسك'], ['qa', 'سؤال وجواب']];
    var body = '';
    if (S.tab === 'sum') {
      body = '<p style="margin-top:12px">' + esc(c.intro) + '</p><ul class="goals">' + c.goals.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul>' + c.sec.map(function (s) { return secHTML(c, s); }).join('') +
        '<div style="margin-top:16px" class="row"><button class="btn wide" data-a="tab" data-t="quiz">انتقل إلى اختبار الفصل</button></div>';
    } else if (S.tab === 'terms') {
      body = '<div class="tblwrap" style="margin-top:14px"><table><thead><tr><th>المصطلح</th><th>معناه</th></tr></thead><tbody>' + c.terms.map(function (t) { return '<tr><td>' + esc(t[0]) + '<span class="ltr">' + esc(t[1]) + '</span></td><td>' + esc(t[2]) + '</td></tr>'; }).join('') + '</tbody></table></div><div style="margin-top:12px"><button class="btn ink wide" data-a="cardsch" data-ch="' + c.n + '">راجعها ببطاقات قلّابة</button></div>';
    } else if (S.tab === 'quiz') {
      var b = P.best[c.n];
      body = '<div class="card" style="margin-top:14px;display:grid;gap:10px"><b>اختبار الفصل ' + c.n + '</b><p class="mute small">' + c.mcq.length + ' سؤال اختيار من متعدد و ' + c.tf.length + ' عبارات صح أو خطأ، مع شرح لكل إجابة.</p>' + (b != null ? '<p class="small">أفضل نتيجة لك: <b>' + b + '%</b></p>' : '') + '<button class="btn wide" data-a="startq" data-ch="' + c.n + '">ابدأ الاختبار</button></div>';
    } else {
      body = '<div class="qa" style="margin-top:12px">' + c.qa.map(function (q) { return '<details><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>'; }).join('') + '</div><p class="small mute" style="margin-top:10px">حاول الإجابة بنفسك أولاً، ثم افتح السؤال لترى الإجابة النموذجية.</p>';
    }
    return topbar('الفصل ' + c.n, true) + '<main class="wrap"><div class="chhead ' + c.unit + '"><span class="ic">' + LI[c.icon] + '</span><div><span class="pill">' + esc(c.week) + '</span><h2>' + esc(c.title) + '</h2><span class="mute small">' + esc(c.sub) + '</span></div></div>' +
      '<div class="tabs" role="toolbar">' + tabs.map(function (t) { return '<button class="tab" data-a="tab" data-t="' + t[0] + '" aria-pressed="' + (S.tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>' + body + '</main>';
  }
  function secHTML(c, s) {
    var o = '<article class="sec ' + c.unit + '" id="s' + s.id.replace('.', '-') + '" data-sid="' + s.id + '"><header><span class="id">' + s.id + '</span><h3>' + esc(s.h) + '</h3></header><div class="body">';
    if (s.t) o += '<p>' + esc(s.t) + '</p>';
    if (s.flow) o += flowH(s.flow) + (s.flowNote ? '<p class="small mute">' + esc(s.flowNote) + '</p>' : '');
    if (s.rings) o += '<div class="rings">' + s.rings.reduceRight(function (inner, r) { return '<div>' + esc(r) + inner + '</div>'; }, '') + '</div>';
    if (s.ill) o += illHTML(s.ill);
    if (s.pts) o += '<ul class="pts">' + s.pts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>';
    if (s.steps) o += '<ol class="steps">' + s.steps.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol>';
    if (s.timeline) o += '<ol class="timeline">' + s.timeline.map(function (p) { return '<li><b>' + esc(p[0]) + '</b>' + esc(p[1]) + '</li>'; }).join('') + '</ol>';
    if (s.tbl) o += tbl(s.tbl);
    if (s.tbl2) o += tbl(s.tbl2);
    if (s.ill2) o += illHTML(s.ill2);
    if (s.dev) o += '<div class="devgrid">' + s.dev.map(devCard).join('') + '</div>';
    if (s.cmd) o += '<div class="cmd">' + s.cmd.map(function (x) { return '<div><code>' + esc(x[0]) + '</code><span>' + esc(x[1]) + '</span></div>'; }).join('') + '</div>';
    if (s.compare) o += '<div class="cmp"><div class="weak"><b>أمر ضعيف</b>' + esc(s.compare.weak) + '</div><div class="strong"><b>أمر قوي</b>' + esc(s.compare.strong) + '</div></div>';
    if (s.prompt) o += '<div class="prompt"><span class="lbl">أمر نموذجي</span>' + esc(s.prompt) + '</div>';
    if (s.check) o += '<ul class="check">' + s.check.map(function (p, i) { return '<li><label><input type="checkbox" id="ck' + s.id + '-' + i + '">' + esc(p) + '</label></li>'; }).join('') + '</ul>';
    if (s.tip) o += '<div class="tipbox">' + esc(s.tip) + '</div>';
    if (s.key) o += '<div class="key">' + esc(s.key) + '</div>';
    return o + '</div><div class="ask"><button class="askbtn" data-a="ask" data-ch="' + c.n + '" data-sid="' + s.id + '">' + I.ask + 'لم أفهم هذه النقطة، اشرحها في المحاضرة</button></div></article>';
  }

  /* الاختبارات */
  function buildQuiz(items, title, n) { S.quiz = { title: title, n: n, items: items, i: 0, picked: null, score: 0, wrong: [] }; go('quiz'); }
  function mk(c) { return c.mcq.map(function (q) { var ord = shuffle(q[1].map(function (_, i) { return i; })); return { q: q[0], o: ord.map(function (i) { return q[1][i]; }), a: ord.indexOf(q[2]), e: q[3], ch: c.n }; }).concat(c.tf.map(function (t) { return { q: t[0], o: ['صح', 'خطأ'], a: t[1] ? 0 : 1, e: t[2], ch: c.n, tf: 1 }; })); }
  function vQuiz() {
    var Q = S.quiz, it = Q.items[Q.i];
    if (!it) {
      var pct = Math.round(Q.score / Q.items.length * 100);
      var msg = pct >= 90 ? 'ممتاز، أنت مستعد للامتحان.' : pct >= 70 ? 'جيد جداً، راجع الأسئلة التي أخطأت فيها.' : pct >= 50 ? 'ناجح، لكن الملخص يحتاج مراجعة ثانية.' : 'راجع ملخص الفصل ثم أعد المحاولة.';
      return topbar(Q.title, true) + '<main class="wrap"><div class="card score" style="margin-top:14px"><div class="big">' + pct + '%</div><p>' + Q.score + ' من ' + Q.items.length + '</p><p class="mute">' + msg + '</p></div>' +
        (Q.wrong.length ? '<section class="block"><h3>أسئلة تحتاج مراجعة</h3>' + Q.wrong.map(function (w) { return '<div class="card" style="margin-top:8px"><p><b>' + esc(w.q) + '</b></p><p class="small" style="color:var(--good)">الإجابة: ' + esc(w.o[w.a]) + '</p><p class="small mute">' + esc(w.e) + '</p></div>'; }).join('') + '</section>' : '') +
        '<div class="row" style="margin-top:16px"><button class="btn" data-a="retry">أعد الاختبار</button><button class="btn ghost" data-a="back">رجوع</button></div></main>';
    }
    var L = ['أ', 'ب', 'ج', 'د'];
    var opts = it.o.map(function (o, k) {
      var cls = Q.picked == null ? '' : (k === it.a ? ' ok' : (k === Q.picked ? ' no' : ''));
      return '<button class="opt' + cls + '" data-a="pick" data-k="' + k + '"' + (Q.picked != null ? ' disabled' : '') + '><span class="lt">' + (it.tf ? (k ? '✗' : '✓') : L[k]) + '</span><span>' + esc(o) + '</span></button>';
    }).join('');
    var fb = Q.picked == null ? '' : '<div class="fb ' + (Q.picked === it.a ? 'ok' : 'no') + '" role="status"><b>' + (Q.picked === it.a ? 'إجابة صحيحة' : 'الإجابة الصحيحة: ' + esc(it.o[it.a])) + '</b>' + esc(it.e) + '</div><div style="margin-top:12px"><button class="btn wide" data-a="nextq">' + (Q.i + 1 < Q.items.length ? 'السؤال التالي' : 'عرض النتيجة') + '</button></div>';
    return topbar(Q.title, true) + '<main class="wrap"><div class="qwrap"><div class="qtop"><span>السؤال ' + (Q.i + 1) + ' من ' + Q.items.length + '</span><span>' + (it.tf ? 'صح أم خطأ' : 'اختيار من متعدد') + (it.ch ? ' · الفصل ' + it.ch : '') + '</span></div><div class="qbar"><i style="width:' + (Q.i / Q.items.length * 100) + '%"></i></div><p class="qtext">' + esc(it.q) + '</p><div class="opts">' + opts + '</div>' + fb + '</div></main>';
  }
  function vTests() {
    return topbar('الاختبارات') + '<main class="wrap"><section class="block"><div class="card" style="display:grid;gap:10px;background:var(--ink);color:var(--bg);border-color:var(--ink)"><b style="font-family:var(--f-disp);font-size:1.2rem">الامتحان الشامل</b><p class="small" style="opacity:.85">20 سؤال اختيار من متعدد و 10 عبارات صح أو خطأ من الفصول العشرة، على غرار الامتحان النهائي.</p>' + (P.best[0] != null ? '<p class="small">أفضل نتيجة: <b>' + P.best[0] + '%</b></p>' : '') + '<button class="btn amb" data-a="final">ابدأ الامتحان الشامل</button></div></section>' +
      '<section class="block"><div class="row"><button class="btn ghost wide" data-a="quick">اختبار سريع: 10 أسئلة عشوائية</button></div></section>' +
      '<section class="block"><h3>اختبارات الفصول</h3><div class="chlist">' + CH.map(function (c) { var b = P.best[c.n]; return '<button class="chcard ' + c.unit + '" data-a="startq" data-ch="' + c.n + '"><span class="ic"><span class="num">' + c.n + '</span>' + LI[c.icon] + '</span><span class="tx"><b>' + esc(c.title) + '</b><span>' + (c.mcq.length + c.tf.length) + ' سؤالاً</span></span>' + (b != null ? '<span class="pill ' + (b >= 50 ? 'good' : 'bad') + '">' + b + '%</span>' : '<span class="pill">لم يبدأ</span>') + '</button>'; }).join('') + '</div></section></main>';
  }

  /* البطاقات */
  function cardPool() { var l = []; CH.forEach(function (c) { if (!S.cardF || S.cardF === c.n) c.terms.forEach(function (t) { l.push({ ar: t[0], en: t[1], d: t[2], ch: c.n }); }); }); return l; }
  function vCards() {
    var pool = cardPool(); if (S.cardI >= pool.length) S.cardI = 0; var t = pool[S.cardI];
    var known = pool.filter(function (x) { return P.known[x.en]; }).length;
    return topbar('بطاقات المصطلحات') + '<main class="wrap"><div class="tabs">' + [0].concat(CH.map(function (c) { return c.n; })).map(function (n) { return '<button class="tab" data-a="cardf" data-n="' + n + '" aria-pressed="' + (S.cardF === n) + '">' + (n ? 'الفصل ' + n : 'الكل') + '</button>'; }).join('') + '</div>' +
      '<p class="small mute" style="margin-top:10px">حفظت ' + known + ' من ' + pool.length + ' · البطاقة ' + (S.cardI + 1) + '</p>' +
      '<button class="flashbtn" data-a="flip" aria-label="اقلب البطاقة"><div class="flash' + (S.flip ? ' flip' : '') + '"><div class="inner"><div class="face front"><span class="pill">الفصل ' + t.ch + '</span><b>' + esc(t.ar) + '</b><span class="mute small">اضغط لرؤية المعنى</span></div><div class="face back"><span class="ltr">' + esc(t.en) + '</span><p>' + esc(t.d) + '</p></div></div></div></button>' +
      '<div class="row" style="margin-top:14px"><button class="btn ghost" style="flex:1" data-a="cnext" data-k="0">راجعها لاحقاً</button><button class="btn" style="flex:1" data-a="cnext" data-k="1">' + (P.known[t.en] ? 'محفوظة' : 'أعرفها') + '</button></div>' +
      '<div class="row" style="margin-top:8px"><button class="btn ghost wide" data-a="cshuf">خلط البطاقات</button></div></main>';
  }

  /* الأدوات */
  var TOOLS = [
    ['devices', 'معرض الأجهزة', 'شكل كل جهاز وقطعة ترد في الدروس', 'router'],
    ['phish', 'صياد التصيد', 'رسالة حقيقية أم احتيال؟', 'sms'],
    ['clinic', 'عيادة الأعطال', 'شخّص العطل واختر الإجراء الصحيح', 'mobo'],
    ['order', 'رتّب الخطوات', 'الصراف والمنهجية والفحص', 'atm'],
    ['prompt', 'باني الأمر الفعال', 'اكتب أمراً بالعناصر الستة', 'speaker'],
    ['pass', 'فاحص كلمة المرور', 'هل كلمتك قوية؟', 'lock']
  ];
  function vTools() {
    return topbar('أدوات التدريب') + '<main class="wrap"><section class="block"><div class="tools">' + TOOLS.map(function (t) { return '<button class="tool" data-a="tool" data-t="' + t[0] + '"><span class="ti">' + LI[t[0]] + '</span><b>' + t[1] + '</b><span>' + t[2] + '</span></button>'; }).join('') + '</div></section></main>';
  }
  function vTool() {
    var t = S.tool, T = S.ts || {};
    var title = TOOLS.filter(function (x) { return x[0] === t; })[0][1], b = '';
    if (t === 'devices') {
      var q = (T.q || '').trim();
      var keys = Object.keys(DEV).filter(function (k) { var d = DEV[k]; return !q || (d.ar + d.en + d.fn).toLowerCase().indexOf(q.toLowerCase()) >= 0; });
      b = '<div class="field" style="margin-top:14px"><label for="devq">ابحث عن جهاز أو قطعة</label><input id="devq" data-in="devq" value="' + esc(T.q || '') + '" placeholder="مثلاً: الموجه"></div><div class="devgrid" id="devlist" style="margin-top:12px">' + keys.map(devCard).join('') + '</div>';
    } else if (t === 'phish') {
      var it = PHISH[T.i || 0];
      if (!it) b = '<div class="card score" style="margin-top:14px"><div class="big">' + (T.s || 0) + '/' + PHISH.length + '</div><p>إجابات صحيحة</p><button class="btn" data-a="treset">العب مرة أخرى</button></div>';
      else b = '<p class="small mute" style="margin-top:14px">الرسالة ' + ((T.i || 0) + 1) + ' من ' + PHISH.length + ' · رسائل وهمية للتدريب</p><div class="bubble" style="margin-top:8px"><span class="from">من: ' + esc(it.from) + '</span>' + esc(it.txt.replace(/\s\S+\.(net|co)\S*/, '')) + (it.txt.match(/\S+\.(net|co)\S*/) ? '<span class="url">' + esc(it.txt.match(/\S+\.(net|co)\S*/)[0]) + '</span>' : '') + '</div>' +
        (T.p == null ? '<div class="row" style="margin-top:14px"><button class="btn" style="flex:1" data-a="ph" data-k="0">حقيقية</button><button class="btn danger" style="flex:1" data-a="ph" data-k="1">احتيال</button></div>' :
          '<div class="fb ' + ((T.p === 1) === it.fake ? 'ok' : 'no') + '"><b>' + (it.fake ? 'هذه رسالة احتيال' : 'هذه رسالة حقيقية') + '</b>' + esc(it.why) + '</div><button class="btn wide" style="margin-top:12px" data-a="phn">التالية</button>');
    } else if (t === 'clinic') {
      var c = CLINIC[T.i || 0];
      if (!c) b = '<div class="card score" style="margin-top:14px"><div class="big">' + (T.s || 0) + '/' + CLINIC.length + '</div><p>تشخيصات صحيحة</p><button class="btn" data-a="treset">ابدأ من جديد</button></div>';
      else b = '<p class="small mute" style="margin-top:14px">الحالة ' + ((T.i || 0) + 1) + ' من ' + CLINIC.length + '</p><div class="card" style="margin-top:8px"><b>' + esc(c.s) + '</b><p class="small mute">ما الإجراء الأول الصحيح؟</p></div><div class="opts">' + c.o.map(function (o, k) { var cls = T.p == null ? '' : (k === c.a ? ' ok' : k === T.p ? ' no' : ''); return '<button class="opt' + cls + '" data-a="cl" data-k="' + k + '"' + (T.p != null ? ' disabled' : '') + '><span>' + esc(o) + '</span></button>'; }).join('') + '</div>' +
        (T.p != null ? '<div class="fb ' + (T.p === c.a ? 'ok' : 'no') + '"><b>' + (T.p === c.a ? 'تشخيص صحيح' : 'ليس هذا') + '</b>' + esc(c.e) + '</div><button class="btn wide" style="margin-top:12px" data-a="cln">الحالة التالية</button>' : '');
    } else if (t === 'order') {
      var O = ORDERS[T.g || 0];
      if (!T.sh) { T.sh = shuffle(O.items.map(function (x, i) { return i; })); T.done = []; S.ts = T; }
      var fin = T.done.length === O.items.length;
      b = '<div class="tabs">' + ORDERS.map(function (o, i) { return '<button class="tab" data-a="og" data-g="' + i + '" aria-pressed="' + ((T.g || 0) === i) + '">' + esc(o.t) + '</button>'; }).join('') + '</div>' +
        '<p class="small mute" style="margin-top:12px">اضغط الخطوات بترتيبها الصحيح.</p><ol class="steps" style="margin-top:8px">' + T.done.map(function (i) { return '<li>' + esc(O.items[i]) + '</li>'; }).join('') + '</ol>' +
        (fin ? '<div class="fb ok"><b>أحسنت، الترتيب صحيح</b>' + (T.err ? 'عدد المحاولات الخاطئة: ' + T.err : 'دون أي خطأ') + '</div><button class="btn wide" style="margin-top:12px" data-a="og" data-g="' + (((T.g || 0) + 1) % ORDERS.length) + '">التمرين التالي</button>' :
          '<div class="chips" style="margin-top:12px">' + T.sh.filter(function (i) { return T.done.indexOf(i) < 0; }).map(function (i) { return '<button class="chip' + (T.bad === i ? ' shake' : '') + '" data-a="oc" data-i="' + i + '">' + esc(O.items[i]) + '</button>'; }).join('') + '</div>');
    } else if (t === 'prompt') {
      var F = [['role', 'الدور', 'أنت موظف في شعبة الموارد البشرية'], ['task', 'المهمة', 'اكتب إعلاناً داخلياً عن دورة تدريبية'], ['ctx', 'السياق', 'الدورة عن الأرشفة الإلكترونية، يوم الأحد، قاعة المؤتمرات'], ['aud', 'الجمهور', 'لموظفي الكلية الإداريين'], ['fmt', 'الصيغة', 'خمسة أسطر ثم جدول بالموعد والمكان'], ['lim', 'القيود', 'لغة رسمية دون مبالغة']];
      b = '<p class="small mute" style="margin-top:14px">املأ العناصر الستة، وسيُبنى الأمر أمامك. الأمثلة الرمادية من الكتاب.</p><div class="form" style="margin-top:10px">' + F.map(function (f) { return '<div class="field"><label for="pb-' + f[0] + '">' + f[1] + '</label><input id="pb-' + f[0] + '" data-in="pb" data-f="' + f[0] + '" value="' + esc((T.v || {})[f[0]] || '') + '" placeholder="' + esc(f[2]) + '"></div>'; }).join('') + '</div>' +
        '<div style="margin-top:14px"><div class="row" style="justify-content:space-between"><b>قوة الأمر</b><span id="pbs" class="small"></span></div><div class="meter" style="margin-top:6px"><i id="pbm"></i></div></div><div class="out" id="pbo" style="margin-top:12px"></div><button class="btn wide" style="margin-top:10px" data-a="pbcopy">نسخ الأمر</button>';
    } else if (t === 'pass') {
      b = '<div class="tipbox" style="margin-top:14px">لا تكتب كلمة مرورك الحقيقية هنا. جرّب كلمات من اختراعك.</div><div class="field" style="margin-top:12px"><label for="pw">كلمة مرور للتجربة</label><input id="pw" data-in="pw" autocomplete="off" spellcheck="false" dir="ltr"></div><div class="meter" style="margin-top:12px"><i id="pwm"></i></div><p id="pwl" style="margin-top:6px;font-weight:600"></p><ul class="check" id="pwc" style="margin-top:8px"></ul>';
    }
    return topbar(title, true) + '<main class="wrap">' + b + '</main>';
  }
  function updPrompt() {
    var v = (S.ts.v = S.ts.v || {}); var n = 0, lines = [];
    var map = { role: '', task: '', ctx: 'السياق: ', aud: 'الجمهور: ', fmt: 'الصيغة: ', lim: 'القيود: ' };
    Object.keys(map).forEach(function (k) { if ((v[k] || '').trim()) { n++; lines.push(map[k] + v[k].trim() + (/[.:،]$/.test(v[k].trim()) ? '' : '.')); } });
    var m = $('#pbm'), o = $('#pbo'), s = $('#pbs'); if (!m) return;
    m.style.width = (n / 6 * 100) + '%'; m.style.background = n >= 5 ? 'var(--good)' : n >= 3 ? 'var(--amb)' : 'var(--bad)';
    s.textContent = n + ' من 6 عناصر'; o.textContent = lines.length ? lines.join('\n') : 'سيظهر الأمر هنا.';
  }
  function updPass(p) {
    var c = [[p.length >= 12, '12 حرفاً على الأقل'], [/[A-Z]/.test(p), 'حرف كبير'], [/[a-z]/.test(p), 'حرف صغير'], [/\d/.test(p), 'رقم'], [/[^A-Za-z0-9]/.test(p), 'رمز'], [p && !/(1234|password|qwerty|0000|admin|mosul|iraq)/i.test(p), 'لا تحتوي كلمة شائعة']];
    var n = c.filter(function (x) { return x[0]; }).length;
    var lv = !p ? ['', 0, 'var(--line)'] : n <= 2 ? ['ضعيفة', 25, 'var(--bad)'] : n <= 4 ? ['متوسطة', 60, 'var(--amb)'] : n === 5 ? ['جيدة', 80, 'var(--acc)'] : ['قوية', 100, 'var(--good)'];
    $('#pwm').style.width = lv[1] + '%'; $('#pwm').style.background = lv[2]; $('#pwl').textContent = lv[0];
    $('#pwc').innerHTML = c.map(function (x) { return '<li><label><input type="checkbox" disabled' + (x[0] ? ' checked' : '') + '>' + x[1] + '</label></li>'; }).join('');
  }

  /* الواجبات وأسئلتي */
  function hwCard(h) {
    var d = daysLeft(h.due), done = P.hwDone[h.id];
    var pill = done ? '<span class="pill good">أنجزته</span>' : d == null ? '' : d < 0 ? '<span class="pill">انتهى موعده</span>' : d === 0 ? '<span class="pill bad">اليوم</span>' : '<span class="pill ' + (d <= 2 ? 'bad' : 'amb') + '">بعد ' + d + ' يوم</span>';
    return '<div class="hw' + (done ? ' done' : '') + '"><div class="h"><b>' + esc(h.title) + '</b>' + pill + '</div><span class="small mute">' + (h.ch ? 'الفصل ' + h.ch + ' · ' : '') + (h.due ? 'آخر موعد ' + esc(h.due) : 'بلا موعد') + '</span>' + (h.details ? '<p>' + esc(h.details) + '</p>' : '') + (h.link ? '<span class="ltr" style="word-break:break-all">' + esc(h.link) + '</span>' : '') +
      '<div class="row"><button class="btn ' + (done ? 'ghost' : 'ink') + '" data-a="hwdone" data-id="' + esc(h.id) + '">' + (done ? 'إلغاء الإنجاز' : 'أنجزته') + '</button></div></div>';
  }
  function vHw() {
    var l = S.hw.slice().sort(function (a, b) { return (a.due || '9') < (b.due || '9') ? -1 : 1; });
    var qs = S.myqs.slice().sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
    return topbar('الواجبات') + '<main class="wrap"><section class="block"><h3>واجبات الأستاذ<small>' + l.length + '</small></h3>' + (l.length ? l.map(hwCard).join('') : '<div class="card empty">' + DEV.printer.svg + 'لا توجد واجبات حالياً. سيظهر هنا كل واجب ينزله الأستاذ.</div>') + '</section>' +
      '<section class="block"><h3>أسئلتي للمحاضرة<small>' + qs.length + '</small></h3>' + (qs.length ? qs.map(function (q) { return '<div class="cm"><div class="meta"><span>الفصل ' + q.ch + ' · ' + esc(q.topic) + ' ' + esc(q.topicTitle) + '</span>' + (q.status === 'done' ? '<span class="pill good">شُرحت في المحاضرة</span>' : '<span class="pill amb">بانتظار الشرح</span>') + '</div><p>' + esc(q.text) + '</p></div>'; }).join('') : '<div class="card empty">لم ترسل أي سؤال بعد. داخل كل موضوع زر: لم أفهم هذه النقطة.</div>') + '</section></main>';
  }

  /* لوحة الأدمن */
  function vAdmin() {
    if (!isAdmin()) return topbar('لوحة الأدمن', true) + '<main class="wrap"><div class="card empty" style="margin-top:14px">هذه الصفحة لأدمن التطبيق فقط.</div></main>';
    var tabs = [['qs', 'تعليقات الطلبة'], ['hw', 'الواجبات'], ['ann', 'الإعلان'], ['rate', 'آراء الطلبة'], ['users', 'الطلبة'], ['stats', 'الإحصاءات'], ['setup', 'الإعداد']];
    var A = S.A || {}, b = '';
    if (S.adminTab === 'qs') {
      var all = (A.qs || []).filter(function (q) { return S.qFilter === 'all' || q.status !== 'done'; });
      var g = {}; all.forEach(function (q) { var k = q.ch + '|' + q.topic; (g[k] = g[k] || { ch: q.ch, topic: q.topic, title: q.topicTitle, l: [] }).l.push(q); });
      var groups = Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.l.length - a.l.length; });
      b = '<div class="row" style="margin-top:12px"><button class="tab" data-a="qf" data-f="open" aria-pressed="' + (S.qFilter === 'open') + '">بانتظار الشرح</button><button class="tab" data-a="qf" data-f="all" aria-pressed="' + (S.qFilter === 'all') + '">الكل</button><button class="tab" data-a="areload">تحديث</button></div>' +
        (A.loading ? '<p class="mute" style="margin-top:12px">جارٍ التحميل…</p>' : groups.length ? '<p class="small mute" style="margin-top:10px">مرتبة بحسب عدد الطلبة الذين سألوا عن النقطة نفسها.</p>' + groups.map(function (gr) { return '<div class="topicgrp"><h4><span class="pill amb">' + gr.l.length + '</span>الفصل ' + gr.ch + ' · ' + esc(gr.topic) + ' ' + esc(gr.title) + '</h4>' + gr.l.map(function (q) { return '<div class="cm"><div class="meta"><span>' + esc(q.name || 'طالب') + '</span>' + (q.group ? '<span>' + esc(q.group) + '</span>' : '') + '<span>' + fmtDate(q.ts) + '</span>' + (q.status === 'done' ? '<span class="pill good">شُرحت</span>' : '') + '</div><span class="ltr">' + esc(q.email) + '</span><p>' + esc(q.text) + '</p><div class="row">' + (q.status !== 'done' ? '<button class="btn ink" data-a="qdone" data-id="' + q.id + '">تم الشرح</button>' : '<button class="btn ghost" data-a="qopen" data-id="' + q.id + '">إعادة فتح</button>') + '<button class="btn danger" data-a="qdel" data-id="' + q.id + '">حذف</button></div></div>'; }).join('') + '</div>'; }).join('') : '<div class="card empty" style="margin-top:12px">لا توجد تعليقات ' + (S.qFilter === 'open' ? 'بانتظار الشرح' : '') + '.</div>');
    } else if (S.adminTab === 'hw') {
      b = '<form class="form card" style="margin-top:12px" data-form="hw"><b>واجب جديد لجميع الطلبة</b><div class="field"><label for="hwt">العنوان</label><input id="hwt" name="title" required maxlength="120" placeholder="مثال: تمرين المختبر 2"></div><div class="field"><label for="hwc">الفصل</label><select id="hwc" name="ch"><option value="0">عام</option>' + CH.map(function (c) { return '<option value="' + c.n + '">الفصل ' + c.n + ': ' + esc(c.title) + '</option>'; }).join('') + '</select></div><div class="field"><label for="hwd">التفاصيل</label><textarea id="hwd" name="details" maxlength="1500" placeholder="المطلوب وطريقة التسليم"></textarea></div><div class="field"><label for="hwdue">آخر موعد للتسليم</label><input id="hwdue" name="due" type="date" min="' + today() + '"></div><div class="field"><label for="hwl">رابط (اختياري)</label><input id="hwl" name="link" type="url" dir="ltr" placeholder="https://"></div><button class="btn" type="submit">نشر الواجب</button></form>' +
        '<section class="block"><h3>الواجبات المنشورة<small>' + S.hw.length + '</small></h3>' + (S.hw.length ? S.hw.map(function (h) { return '<div class="hw"><div class="h"><b>' + esc(h.title) + '</b><span class="pill">' + (h.due ? esc(h.due) : 'بلا موعد') + '</span></div>' + (h.details ? '<p>' + esc(h.details) + '</p>' : '') + '<div class="row"><button class="btn danger" data-a="hwdel" data-id="' + h.id + '">حذف الواجب</button></div></div>'; }).join('') : '<p class="mute">لا توجد واجبات.</p>') + '</section>';
    } else if (S.adminTab === 'ann') {
      b = '<form class="form card" style="margin-top:12px" data-form="ann"><b>إعلان يظهر أعلى الصفحة الرئيسية لكل الطلبة</b><div class="field"><label for="annt">نص الإعلان</label><textarea id="annt" name="text" maxlength="500">' + esc((S.ann && S.ann.text) || '') + '</textarea></div><div class="row"><button class="btn" type="submit">نشر الإعلان</button><button class="btn ghost" type="button" data-a="annclear">إزالة الإعلان</button></div></form>';
    } else if (S.adminTab === 'rate') {
      var st2 = S.stats || {}, cnt = RATES.map(function (r) { return +st2['r' + r[0]] || 0; }), tot = cnt.reduce(function (a, c) { return a + c; }, 0);
      var avg = tot ? RATES.reduce(function (a, r, i) { return a + r[0] * cnt[i]; }, 0) / tot : 0, notes = (A.rates || []).slice().sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
      b = '<p class="small mute" style="margin-top:12px">الاستبيان مجهول: تُحفظ الأعداد فقط، بلا أسماء.</p><div class="row" style="margin-top:8px"><button class="tab" data-a="rreload">تحديث</button></div>' +
        '<div class="kpis" style="margin-top:12px"><div class="kpi"><b>' + fmtN(tot) + '</b><span>عدد المشاركين</span></div><div class="kpi"><b>' + (tot ? rateName(Math.round(avg)) : '—') + '</b><span>التقدير العام</span></div></div>' +
        '<section class="block"><h3>توزيع الآراء</h3><div class="ratebars">' + RATES.map(function (r, i) { var c = cnt[i], pc = tot ? Math.round(c / tot * 100) : 0; return '<div class="rb"><span>' + r[1] + '</span><div class="bar"><i style="width:' + pc + '%"></i></div><b>' + fmtN(c) + ' · ' + pc + '%</b></div>'; }).join('') + '</div></section>' +
        '<section class="block"><h3>ملاحظات الطلبة<small>' + notes.length + '</small></h3>' + (!A.rates ? '<p class="mute">جارٍ التحميل…</p>' : notes.length ? notes.map(function (n) { return '<div class="cm"><div class="meta"><span>' + fmtDate(n.ts) + '</span></div><p>' + esc(n.text) + '</p></div>'; }).join('') : '<p class="mute">لا توجد ملاحظات بعد.</p>') + '</section>';
    } else if (S.adminTab === 'users') {
      var bans = A.banned || [], banIds = {}; bans.forEach(function (x) { banIds[x.id] = 1; });
      var us = (A.users || []).filter(function (u) { return (u.email || '').toLowerCase() !== ADMIN; }).sort(function (a, b) { return (a.name || '') < (b.name || '') ? -1 : 1; });
      var onlyBanned = bans.filter(function (x) { return !us.some(function (u) { return u.id === x.id; }); });
      function urow(u, isB, i) { return '<div class="urow' + (isB ? ' banrow' : '') + '"><span class="un">' + (i + 1) + '</span><b class="unm">' + esc(u.name || '—') + (isB ? ' <span class="pill bad">محظور</span>' : '') + '</b><span class="ugr">' + esc(u.group || '—') + '</span><span class="uem ltr">' + esc(u.email || '') + '</span><div class="uact">' + (isB ? '<button class="btn ghost sm" data-a="unban" data-id="' + u.id + '">إلغاء الحظر</button>' : '<button class="btn danger sm" data-a="ban" data-id="' + u.id + '">حظر</button>') + (u.joined !== undefined || !isB ? '<button class="btn danger sm" data-a="udel" data-id="' + u.id + '">حذف</button>' : '') + '</div></div>'; }
      b = '<div class="row" style="margin-top:12px;justify-content:space-between;align-items:center"><p class="small mute" style="margin:0">الطلبة المسجلون في التطبيق: ' + us.length + (bans.length ? ' · المحظورون: ' + bans.length : '') + '</p><button class="btn" data-a="xls"' + (us.length || bans.length ? '' : ' disabled') + '>تصدير إلى إكسل</button></div>' +
        '<div class="tipbox small" style="margin-top:8px"><b>حظر:</b> يمنع الطالب من استخدام التطبيق، ويمكنك إلغاؤه لاحقاً. <b>حذف:</b> يمسح بيانات الطالب من القائمة، لكنه يستطيع الدخول من جديد ما لم تحظره.</div>' +
        '<div class="ulist" style="margin-top:8px"><div class="urow uhead"><span class="un">ت</span><b class="unm">الاسم</b><span class="ugr">الشعبة</span><span class="uem">البريد</span><span class="uact">إجراء</span></div>' + us.concat(onlyBanned).map(function (u, i) { return urow(u, i >= us.length || !!banIds[u.id], i); }).join('') + '</div>';
    } else if (S.adminTab === 'stats') {
      var st = S.stats || {};
      b = '<div class="kpis" style="margin-top:12px"><div class="kpi"><b>' + fmtN(st.users) + '</b><span>مستخدمو التطبيق</span></div><div class="kpi"><b>' + fmtN(st.visits) + '</b><span>مرات الفتح</span></div><div class="kpi"><b>' + fmtN((A.qs || []).length) + '</b><span>تعليقات الطلبة</span></div><div class="kpi"><b>' + fmtN(st.a0) + '</b><span>محاولات الامتحان الشامل</span></div></div>' +
        '<section class="block"><h3>اختبارات الفصول</h3><div class="tblwrap"><table><thead><tr><th>الفصل</th><th>المحاولات</th><th>نسبة النجاح</th></tr></thead><tbody>' + [0].concat(CH.map(function (c) { return c.n; })).map(function (n) { var a = st['a' + n] || 0, p = st['p' + n] || 0; return '<tr><td>' + (n ? 'الفصل ' + n : 'الامتحان الشامل') + '</td><td>' + fmtN(a) + '</td><td>' + (a ? Math.round(p / a * 100) + '%' : '—') + '</td></tr>'; }).join('') + '</tbody></table></div></section>';
    } else {
      b = setupHTML();
    }
    return topbar('لوحة الأدمن', true) + '<main class="wrap wide"><div class="admin-head"><b>أدمن التطبيق</b><span class="ltr">' + esc(AUTH.email) + '</span>' + (!LIVE ? '<p class="small" style="margin-top:4px">وضع المعاينة: البيانات محفوظة على هذا الجهاز فقط حتى يُربط التطبيق بقاعدة البيانات.</p>' : '') + '</div><div class="tabs">' + tabs.map(function (t) { return '<button class="tab" data-a="atab" data-t="' + t[0] + '" aria-pressed="' + (S.adminTab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>' + b + '</main>';
  }
  var RULES = "rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    function signed() {\n      return request.auth != null;\n    }\n    function isAdmin() {\n      return signed()\n        && request.auth.token.email_verified == true\n        && request.auth.token.email == '" + ADMIN + "';\n    }\n    function active() {\n      return signed()\n        && !exists(/databases/$(database)/documents/banned/$(request.auth.uid));\n    }\n    match /stats/main { allow read, create, update: if active(); }\n    match /users/{uid} {\n      allow read: if isAdmin() || (active() && request.auth.uid == uid);\n      allow create, update: if active() && request.auth.uid == uid;\n      allow delete: if isAdmin();\n    }\n    match /banned/{uid} {\n      allow read: if isAdmin() || (signed() && request.auth.uid == uid);\n      allow write: if isAdmin();\n    }\n    match /homework/{id} { allow read: if active(); allow write: if isAdmin(); }\n    match /config/{id} { allow read: if active(); allow write: if isAdmin(); }\n    match /comments/{id} {\n      allow create: if active()\n        && request.resource.data.uid == request.auth.uid\n        && request.resource.data.email == request.auth.token.email\n        && request.resource.data.text is string\n        && request.resource.data.text.size() > 0\n        && request.resource.data.text.size() <= 600;\n      allow read: if isAdmin() || (active() && resource.data.uid == request.auth.uid);\n      allow update, delete: if isAdmin();\n    }\n    match /fbnotes/{id} {\n      allow create: if active()\n        && request.resource.data.keys().hasOnly(['text', 'ts'])\n        && request.resource.data.text is string\n        && request.resource.data.text.size() > 0\n        && request.resource.data.text.size() <= 500;\n      allow read, delete: if isAdmin();\n    }\n  }\n}";
  function setupHTML() {
    return '<div class="card" style="margin-top:12px;display:grid;gap:10px"><b>' + (LIVE ? 'التطبيق مربوط بقاعدة البيانات' : 'ربط التطبيق بقاعدة البيانات') + '</b><ol class="steps">' +
      ['افتح موقع Firebase وأنشئ مشروعاً مجانياً', 'من قسم Firestore Database أنشئ قاعدة بيانات', 'من تبويب Rules الصق القواعد أدناه واضغط Publish', 'من قسم Authentication فعّل طريقة Email/Password وخيار Email link', 'من Authentication ثم Settings ثم Authorized domains أضف نطاق موقع التطبيق', 'من إعدادات المشروع انسخ apiKey و projectId إلى ملف config.js'].map(function (s) { return '<li>' + s + '</li>'; }).join('') +
      '</ol><p class="small mute">القواعد تمنع أي شخص لم يسجّل الدخول من قراءة البيانات أو الكتابة، وتجعل الواجبات والإعلان والتعليقات تحت تصرف بريد الأدمن فقط.</p><pre class="rules" id="rules">' + esc(RULES) + '</pre><button class="btn ink" data-a="copyrules">نسخ القواعد</button></div>';
  }

  /* شاشة الدخول */
  function vGate() {
    var G = S.gate || {};
    var b;
    if (G.banned) {
      b = '<div class="fb no"><b>تم إيقاف حسابك</b>لا يمكنك استخدام التطبيق بهذا الحساب. راجع أستاذ المادة.</div><button class="btn ghost wide" data-a="logout">تسجيل الخروج</button>';
    } else if (!LIVE) {
      b = '<div class="tipbox">وضع المعاينة. الدخول بالبريد الإلكتروني يعمل بعد ربط التطبيق بقاعدة البيانات، والبيانات هنا تحفظ على هذا الجهاز فقط.</div><div class="form"><div class="field"><label for="gemail">البريد الإلكتروني</label><input id="gemail" type="email" dir="ltr" value="' + esc(G.email || '') + '" placeholder="name@gmail.com"></div><button class="btn wide" data-a="demologin">دخول المعاينة</button></div>';
    } else if (G.needEmail) {
      b = '<p>أكّد بريدك الإلكتروني لإكمال الدخول من هذا الجهاز.</p><div class="form"><div class="field"><label for="gemail">البريد الإلكتروني</label><input id="gemail" type="email" dir="ltr" placeholder="name@gmail.com"></div><button class="btn wide" data-a="confirmemail">إكمال الدخول</button></div>';
    } else if (G.sent) {
      b = '<div class="fb ok"><b>أرسلنا رابط الدخول</b>افتح بريدك <span class="ltr" style="display:inline">' + esc(G.email) + '</span> واضغط الرابط من هذا الجهاز. إذا لم تجد الرسالة فابحث في مجلد الرسائل غير المرغوب فيها.</div><button class="btn ghost wide" data-a="gateback">تغيير البريد</button>';
    } else if (G.mode === 'teacher') {
      b = '<p class="small mute">دخول الأستاذ برابط يصل إلى البريد.</p><div class="form"><div class="field"><label for="gemail">بريد الأستاذ</label><input id="gemail" type="email" dir="ltr" autocomplete="email" value="' + esc(G.email || '') + '"></div><button class="btn wide" data-a="sendlink"' + (G.busy ? ' disabled' : '') + '>' + (G.busy ? 'جارٍ الإرسال…' : 'أرسل رابط الدخول') + '</button></div><div class="tipbox" style="display:grid;gap:10px"><b>أو ادخل بكلمة مرور (بلا حدّ يومي)</b><span class="small">أول مرة فقط: اضغط «عيّن كلمة مرور» وافتح الرسالة في بريدك. بعدها ادخل من «لدي حساب» ببريدك وكلمة المرور، وتبقى صلاحيات الأستاذ كما هي.</span><div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn ink" data-a="gmode" data-m="reset">عيّن كلمة مرور</button><button type="button" class="btn ghost" data-a="gmode" data-m="login">لدي كلمة مرور</button></div></div>';
    } else if (G.mode === 'reset') {
      b = (G.resetSent ? '<div class="fb ok"><b>أرسلنا رابط تعيين كلمة المرور</b>افتح بريدك واضغط الرابط واختر كلمة جديدة، ثم ارجع وسجّل الدخول. ابحث أيضاً في الرسائل غير المرغوب فيها.</div>' : '') +
        '<form class="form" data-form="reset"><div class="field"><label for="gemail">البريد الإلكتروني</label><input id="gemail" name="email" type="email" dir="ltr" inputmode="email" autocomplete="email" required value="' + esc(G.email || '') + '"></div><button class="btn wide" type="submit"' + (G.busy ? ' disabled' : '') + '>أرسل رابط تعيين كلمة المرور</button><button type="button" class="linkbtn" data-a="gmode" data-m="login">رجوع إلى الدخول</button></form>';
    } else {
      var su = G.mode === 'signup';
      b = '<div class="tabs" style="margin-top:0"><button type="button" class="tab" data-a="gmode" data-m="login" aria-pressed="' + !su + '">لدي حساب</button><button type="button" class="tab" data-a="gmode" data-m="signup" aria-pressed="' + su + '">حساب جديد</button></div>' +
        '<form class="form" data-form="' + (su ? 'signup' : 'login') + '">' +
        (su ? '<div class="field"><label for="pn">الاسم الثلاثي</label><input id="pn" name="name" required maxlength="80" autocomplete="name"></div><div class="field"><label for="pg">الشعبة أو الدراسة (اختياري)</label><input id="pg" name="group" maxlength="40" placeholder="مثلاً: صباحي، شعبة أ"></div>' : '') +
        '<div class="field"><label for="gemail">البريد الإلكتروني</label><input id="gemail" name="email" type="email" dir="ltr" inputmode="email" autocomplete="email" required value="' + esc(G.email || '') + '" placeholder="name@gmail.com"></div>' +
        '<div class="field"><label for="gpw">كلمة المرور' + (su ? ' (6 أحرف على الأقل)' : '') + '</label><input id="gpw" name="pw" type="password" dir="ltr" required autocomplete="' + (su ? 'new-password' : 'current-password') + '"></div>' +
        '<button class="btn wide" type="submit"' + (G.busy ? ' disabled' : '') + '>' + (G.busy ? 'لحظة…' : su ? 'إنشاء الحساب' : 'دخول') + '</button></form>' +
        (su ? '' : '<div class="row" style="justify-content:space-between"><button type="button" class="linkbtn" data-a="gmode" data-m="reset">نسيت كلمة المرور؟</button><button type="button" class="linkbtn" data-a="gmode" data-m="teacher">دخول الأستاذ</button></div>');
    }
    return '<main class="wrap" style="padding-top:max(32px,env(safe-area-inset-top,0px))"><div style="display:grid;gap:16px;max-width:420px;margin:0 auto"><div style="display:flex;justify-content:flex-end">' + themeBtn(' plain') + '</div><div class="crest"><span class="crestimg"><img src="icons/college-logo.png" alt="شعار كلية الإدارة والاقتصاد، جامعة الموصل" width="132" height="132"></span><h1>حقيبة الحاسوب</h1><span class="mute small">تطبيقات إدارية باستخدام الحاسوب · المرحلة الثانية</span><span class="crestsub">كلية الإدارة والاقتصاد · جامعة الموصل</span></div>' +
      '<ul class="pts">' + ['ملخصات الفصول العشرة مع الرسوم', 'اختبارات وبطاقات مصطلحات', 'الواجبات وأسئلتك للمحاضرة'].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      '<div class="card" style="display:grid;gap:12px"><b>' + (G.mode === 'teacher' ? 'دخول الأستاذ' : G.mode === 'reset' ? 'استعادة كلمة المرور' : 'الدخول إلى التطبيق') + '</b>' + (G.err ? '<div class="fb no">' + esc(G.err) + '</div>' : '') + b + '</div>' + footer() + '</div></main>';
  }
  function vProfile() {
    return '<main class="wrap" style="padding-top:max(32px,env(safe-area-inset-top,0px))"><form class="form card" data-form="profile" style="max-width:420px;margin:0 auto"><h2>خطوة أخيرة</h2><p class="mute small">يظهر اسمك للأستاذ فقط مع أسئلتك.</p><span class="ltr">' + esc(AUTH.email) + '</span><div class="field"><label for="pn">الاسم الثلاثي</label><input id="pn" name="name" required maxlength="80"></div><div class="field"><label for="pg">الشعبة أو الدراسة (اختياري)</label><input id="pg" name="group" maxlength="40" placeholder="مثلاً: صباحي، شعبة أ"></div><button class="btn" type="submit">ابدأ</button></form></main>';
  }

  /* النوافذ */
  function sheetHTML() {
    var sh = S.sheet; if (!sh) return '';
    var inner = '';
    if (sh.type === 'ask') {
      var mine = S.myqs.filter(function (q) { return q.topic === sh.sid && +q.ch === +sh.ch; });
      inner = '<h3>سؤال للمحاضرة القادمة</h3><span class="pill">الفصل ' + sh.ch + ' · ' + esc(sh.sid) + ' ' + esc(sh.title) + '</span><form class="form" data-form="ask"><div class="field"><label for="askt">ما الذي لم تفهمه؟</label><textarea id="askt" name="text" required maxlength="600" placeholder="اكتب سؤالك أو النقطة الغامضة"></textarea></div><p class="small mute">يصل سؤالك إلى الأستاذ مع اسمك، ليشرح النقطة في المحاضرة القادمة.</p><div class="row"><button class="btn" type="submit">إرسال</button><button class="btn ghost" type="button" data-a="closesheet">إلغاء</button></div></form>' +
        (mine.length ? '<div><b class="small">أسئلتك السابقة هنا</b>' + mine.map(function (q) { return '<div class="cm" style="margin-top:6px"><p>' + esc(q.text) + '</p><span class="pill ' + (q.status === 'done' ? 'good' : 'amb') + '">' + (q.status === 'done' ? 'شُرحت' : 'بانتظار الشرح') + '</span></div>'; }).join('') + '</div>' : '');
    } else if (sh.type === 'rate') {
      inner = '<h3>رأيك مهم لأغراض الجودة والتحسين</h3><div class="tipbox"><b>هويتك لا تُحفظ.</b> لا يُسجَّل اسمك ولا بريدك مع رأيك، فاكتب رأيك بصراحة.</div><p class="small">ما تقييمك لتطبيق حقيبة الحاسوب؟ يظهر هذا السؤال مرة واحدة فقط.</p><form class="form" data-form="rate"><div class="rateopts">' + RATES.map(function (r) { return '<label class="rateopt"><input type="radio" name="r" value="' + r[0] + '" required><span>' + r[1] + '</span></label>'; }).join('') + '</div><div class="field"><label for="rnote">ملاحظة أو اقتراح (اختياري)</label><textarea id="rnote" name="note" maxlength="500" placeholder="ما الذي تريد أن نحسّنه؟"></textarea></div><div class="row"><button class="btn" type="submit">إرسال الرأي</button><button class="btn ghost" type="button" data-a="closesheet">ليس الآن</button></div></form>';
    } else if (sh.type === 'notif') {
      inner = notifSheet();
    } else if (sh.type === 'install') {
      inner = '<h3>ثبّت التطبيق على جهازك</h3><div class="card"><b>هواتف أندرويد</b><ol class="steps"><li>افتح التطبيق في متصفح كروم</li><li>اضغط زر التثبيت إن ظهر، أو القائمة ⋮ ثم تثبيت التطبيق</li></ol></div><div class="card"><b>آيفون</b><ol class="steps"><li>افتح التطبيق في متصفح سفاري</li><li>اضغط زر المشاركة ثم إضافة إلى الشاشة الرئيسية</li></ol></div><div class="card"><b>الحاسوب</b><ol class="steps"><li>افتحه في كروم أو إيدج</li><li>اضغط أيقونة التثبيت في شريط العنوان</li></ol></div>' + (window.__bip ? '<button class="btn wide" data-a="doinstall">' + I.install + 'تثبيت الآن</button>' : '') + '<button class="btn ghost" data-a="closesheet">إغلاق</button>';
    }
    return '<div class="sheetbg" data-a="bg"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + inner + '</div></div>';
  }

  /* ---------- الرسم ---------- */
  function render() {
    try { renderInner(); } catch (e) { $('#app').innerHTML = '<main class="wrap"><div class="card" style="margin-top:24px;display:grid;gap:12px"><b>حدث خطأ أثناء عرض الصفحة</b><button class="btn" onclick="location.reload()">إعادة التحميل</button></div></main>'; }
    requestAnimationFrame(function () { document.body.classList.toggle('rp'); });
  }
  function renderInner() {
    var v = S.view, h;
    if (v === 'gate') h = vGate();
    else if (v === 'profile') h = vProfile();
    else {
      h = v === 'chapter' ? vChapter() : v === 'quiz' ? vQuiz() : v === 'cards' ? vCards() : v === 'tests' ? vTests() : v === 'tools' ? vTools() : v === 'tool' ? vTool() : v === 'hw' ? vHw() : v === 'admin' ? vAdmin() : vHome();
      h += navbar();
    }
    $('#app').innerHTML = h + sheetHTML();
    if (v === 'tool' && S.tool === 'prompt') updPrompt();
    if (v === 'tool' && S.tool === 'pass') updPass('');
    if (v === 'chapter' && S.tab === 'sum') observeRead();
  }
  var io;
  function observeRead() {
    if (io) io.disconnect(); if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var sid = e.target.getAttribute('data-sid'); var a = P.read[S.ch] = P.read[S.ch] || []; if (a.indexOf(sid) < 0) { a.push(sid); saveP(); } } });
    }, { threshold: 0.5 });
    document.querySelectorAll('.sec').forEach(function (s) { io.observe(s); });
  }

  /* ---------- الأحداث ---------- */
  document.addEventListener('click', async function (ev) {
    var el = ev.target.closest('[data-a]'); if (!el) return;
    var a = el.getAttribute('data-a'), d = el.dataset;
    if (a === 'bg') { if (ev.target === el) { S.sheet = null; render(); } return; }
    switch (a) {
      case 'go': go(d.v); if (d.v === 'admin') loadAdmin(); if (d.v === 'hw') loadMine(); break;
      case 'back': back(); break;
      case 'bell': S.sheet = { type: 'notif', seen: lsGet('seenTs', '') }; var top = notifItems()[0]; lsSet('seenTs', top && top.ts ? top.ts : new Date().toISOString()); render(); break;
      case 'notifgo': S.sheet = null; if (d.t === 'hw') { go('hw'); loadMine(); } else { go('home'); } break;
      case 'askperm': try { Notification.requestPermission().then(function (r) { if (r === 'granted') { lsSet('notifiedTs', (notifItems()[0] || {}).ts || new Date().toISOString()); toast('تم تفعيل الإشعارات'); } render(); }); } catch (e) { } break;
      case 'theme': var nt = curTheme() === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', nt); lsSet('theme', nt); var mc = document.querySelector('meta[name=theme-color]'); if (mc) mc.setAttribute('content', nt === 'dark' ? '#071D42' : '#7A1E2C'); render(); break;
      case 'open': go('chapter', { ch: +d.ch, tab: 'sum' }); break;
      case 'tab': S.tab = d.t; render(); window.scrollTo(0, 0); break;
      case 'startq': var c = CH[+d.ch - 1]; buildQuiz(shuffle(mk(c)), 'اختبار الفصل ' + c.n, c.n); break;
      case 'final': var all = []; CH.forEach(function (c) { all = all.concat(mk(c)); }); buildQuiz(shuffle(shuffle(all.filter(function (x) { return !x.tf; })).slice(0, 20).concat(shuffle(all.filter(function (x) { return x.tf; })).slice(0, 10))), 'الامتحان الشامل', 0); break;
      case 'quick': var al = []; CH.forEach(function (c) { al = al.concat(mk(c)); }); buildQuiz(shuffle(al).slice(0, 10), 'اختبار سريع', -1); break;
      case 'pick': var Q = S.quiz; if (Q.picked != null) return; Q.picked = +d.k; var it = Q.items[Q.i]; if (Q.picked === it.a) Q.score++; else Q.wrong.push(it); render(); break;
      case 'nextq': var Q2 = S.quiz; Q2.i++; Q2.picked = null; if (Q2.i >= Q2.items.length) finishQuiz(); render(); window.scrollTo(0, 0); break;
      case 'retry': var Q3 = S.quiz; S.quiz = { title: Q3.title, n: Q3.n, items: shuffle(Q3.items).map(function (it) { if (it.tf) return it; var ord = shuffle(it.o.map(function (_, i) { return i; })); return Object.assign({}, it, { o: ord.map(function (i) { return it.o[i]; }), a: ord.indexOf(it.a) }); }), i: 0, picked: null, score: 0, wrong: [] }; render(); break;
      case 'cardsch': S.cardF = +d.ch; S.cardI = 0; S.flip = false; go('cards'); break;
      case 'cardf': S.cardF = +d.n; S.cardI = 0; S.flip = false; render(); break;
      case 'flip': S.flip = !S.flip; render(); break;
      case 'cnext': var pool = cardPool(), t = pool[S.cardI]; if (+d.k) P.known[t.en] = 1; else delete P.known[t.en]; saveP(); S.cardI = (S.cardI + 1) % pool.length; S.flip = false; render(); break;
      case 'cshuf': S.cardI = Math.floor(Math.random() * cardPool().length); S.flip = false; render(); break;
      case 'tool': S.tool = d.t; S.ts = {}; go('tool'); break;
      case 'treset': S.ts = {}; render(); break;
      case 'ph': S.ts.p = +d.k; if ((S.ts.p === 1) === PHISH[S.ts.i || 0].fake) S.ts.s = (S.ts.s || 0) + 1; render(); break;
      case 'phn': S.ts.i = (S.ts.i || 0) + 1; S.ts.p = null; render(); break;
      case 'cl': S.ts.p = +d.k; if (S.ts.p === CLINIC[S.ts.i || 0].a) S.ts.s = (S.ts.s || 0) + 1; render(); break;
      case 'cln': S.ts.i = (S.ts.i || 0) + 1; S.ts.p = null; render(); window.scrollTo(0, 0); break;
      case 'og': S.ts = { g: +d.g }; render(); break;
      case 'oc': var T = S.ts, i = +d.i; if (i === T.done.length) { T.done.push(i); T.bad = null; } else { T.err = (T.err || 0) + 1; T.bad = i; } render(); break;
      case 'pbcopy': copy($('#pbo').textContent); break;
      case 'copyrules': copy(RULES); break;
      case 'ask': var cc = CH[+d.ch - 1], s = cc.sec.filter(function (x) { return x.id === d.sid; })[0]; S.sheet = { type: 'ask', ch: cc.n, sid: s.id, title: s.h }; render(); setTimeout(function () { var x = $('#askt'); if (x) x.focus(); }, 50); break;
      case 'closesheet': S.sheet = null; render(); break;
      case 'install': S.sheet = { type: 'install' }; render(); break;
      case 'doinstall': if (window.__bip) { window.__bip.prompt(); window.__bip = null; } S.sheet = null; render(); break;
      case 'hwdone': if (P.hwDone[d.id]) delete P.hwDone[d.id]; else P.hwDone[d.id] = 1; saveP(); render(); break;
      case 'logout': setAuth(null); S.profile = null; S.gate = {}; S.view = 'gate'; render(); break;
      case 'sendlink': await doSend(); break;
      case 'gmode': var ge = $('#gemail'); S.gate = { mode: d.m, email: ge ? ge.value.trim() : '' }; render(); break;
      case 'gateback': S.gate = { email: (S.gate || {}).email }; render(); break;
      case 'confirmemail': var em = ($('#gemail').value || '').trim().toLowerCase(); await completeLink(em); break;
      case 'demologin': var de = ($('#gemail').value || '').trim().toLowerCase(); if (!DOMAIN.test(de)) { S.gate = { email: de, err: 'اكتب بريداً إلكترونياً صحيحاً، مثل name@gmail.com' }; render(); return; } setAuth({ email: de, uid: 'demo-' + de, exp: 9e15 }); await afterLogin(); break;
      case 'atab': S.adminTab = d.t; render(); if (d.t === 'users') loadUsers(); if (d.t === 'rate' && !(S.A && S.A.rates)) loadRates(); break;
      case 'rreload': S.A.rates = null; render(); loadRates(); DB.stats().then(function (x) { S.stats = x; render(); }).catch(function () { }); break;
      case 'qf': S.qFilter = d.f; render(); break;
      case 'xls': exportStudents(); break;
      case 'ban': case 'udel': case 'unban': {
        if (a !== 'unban' && !el.dataset.sure) { el.dataset.sure = 1; el.textContent = 'تأكيد؟'; return; }
        var uu = (S.A.users || []).concat(S.A.banned || []).filter(function (x) { return x.id === d.id; })[0] || { id: d.id };
        try {
          if (a === 'ban') { await DB.ban(uu); S.A.banned = (S.A.banned || []).concat([{ id: uu.id, name: uu.name, email: uu.email, group: uu.group }]); toast('حُظر الطالب'); }
          else if (a === 'unban') { await DB.unban(d.id); S.A.banned = (S.A.banned || []).filter(function (x) { return x.id !== d.id; }); toast('أُلغي الحظر'); }
          else { await DB.delUser(d.id); S.A.users = (S.A.users || []).filter(function (x) { return x.id !== d.id; }); toast('حُذف الطالب من القائمة'); }
          render();
        } catch (e) { toast('تعذر التنفيذ. تأكد من نشر القواعد الجديدة.'); }
        break;
      }
      case 'areload': loadAdmin(); break;
      case 'qdone': case 'qopen': try { await DB.setQ(d.id, a === 'qdone' ? 'done' : 'open'); (S.A.qs || []).forEach(function (q) { if (q.id === d.id) q.status = a === 'qdone' ? 'done' : 'open'; }); render(); } catch (e) { toast('تعذر الحفظ'); } break;
      case 'qdel': if (!el.dataset.sure) { el.dataset.sure = 1; el.textContent = 'اضغط مرة ثانية للتأكيد'; return; } try { await DB.delQ(d.id); S.A.qs = S.A.qs.filter(function (q) { return q.id !== d.id; }); render(); } catch (e) { toast('تعذر الحذف'); } break;
      case 'hwdel': if (!el.dataset.sure) { el.dataset.sure = 1; el.textContent = 'اضغط مرة ثانية للتأكيد'; return; } try { await DB.delHw(d.id); S.hw = S.hw.filter(function (h) { return h.id !== d.id; }); render(); toast('حُذف الواجب'); } catch (e) { toast('تعذر الحذف'); } break;
      case 'annclear': try { await DB.setAnnounce(''); S.ann = { text: '' }; render(); toast('أزيل الإعلان'); } catch (e) { toast('تعذر الحفظ'); } break;
    }
  });
  document.addEventListener('input', function (ev) {
    var el = ev.target, k = el.getAttribute('data-in'); if (!k) return;
    if (k === 'devq') { S.ts.q = el.value; var q = el.value.trim().toLowerCase(); $('#devlist').innerHTML = Object.keys(DEV).filter(function (x) { var dd = DEV[x]; return !q || (dd.ar + dd.en + dd.fn).toLowerCase().indexOf(q) >= 0; }).map(devCard).join(''); }
    if (k === 'pb') { S.ts.v = S.ts.v || {}; S.ts.v[el.getAttribute('data-f')] = el.value; updPrompt(); }
    if (k === 'pw') updPass(el.value);
  });
  document.addEventListener('submit', async function (ev) {
    var f = ev.target, k = f.getAttribute('data-form'); if (!k) return; ev.preventDefault();
    var fd = {}; Array.prototype.forEach.call(f.elements, function (x) { if (x.name && (x.type !== 'radio' || x.checked)) fd[x.name] = x.value.trim(); });
    var btn = f.querySelector('[type=submit]'); if (btn) btn.disabled = true;
    try {
      if (k === 'ask') { if (!fd.text) return; var sh = S.sheet; var c = { ch: sh.ch, topic: sh.sid, topicTitle: sh.title, text: fd.text }; await DB.ask(c); S.myqs.push(Object.assign({ status: 'open', ts: new Date().toISOString() }, c)); S.sheet = null; render(); toast('وصل سؤالك إلى الأستاذ'); }
      else if (k === 'hw') { await DB.addHw(fd); toast('نُشر الواجب لجميع الطلبة'); S.hw = await DB.homework(); render(); }
      else if (k === 'rate') { if (!fd.r) { toast('اختر تقييماً أولاً'); return; } S.sheet = null; render(); try { await DB.rate(+fd.r, fd.note || ''); toast('شكراً لك، وصل رأيك'); } catch (e) { toast('تعذر إرسال الرأي'); } }
      else if (k === 'ann') { await DB.setAnnounce(fd.text); S.ann = { text: fd.text, ts: new Date().toISOString() }; toast('نُشر الإعلان'); render(); }
      else if (k === 'login' || k === 'signup') {
        var em = (fd.email || '').toLowerCase();
        if (!DOMAIN.test(em)) { S.gate = { mode: k, email: em, err: 'اكتب بريداً إلكترونياً صحيحاً، مثل name@gmail.com' }; render(); return; }
        if ((fd.pw || '').length < 6) { S.gate = { mode: k, email: em, err: 'كلمة المرور 6 أحرف على الأقل.' }; render(); return; }
        if (k === 'signup' && !fd.name) { S.gate = { mode: k, email: em, err: 'اكتب اسمك الثلاثي.' }; render(); return; }
        S.gate = { mode: k, email: em, busy: true }; render();
        try {
          await pwAuth(k === 'signup', em, fd.pw);
          if (k === 'signup') { var pf = { name: fd.name, group: fd.group || '' }; try { await DB.saveProfile(pf); } catch (e2) { } S.profile = pf; lsSet('prof', pf); }
          await afterLogin();
        } catch (e) { S.gate = { mode: k, email: em, err: authErr(e) }; render(); }
        return;
      }
      else if (k === 'reset') {
        var re = (fd.email || '').toLowerCase();
        if (!DOMAIN.test(re)) { S.gate = { mode: 'reset', email: re, err: 'اكتب بريداً إلكترونياً صحيحاً.' }; render(); return; }
        try { await sendReset(re); S.gate = { mode: 'reset', email: re, resetSent: true }; } catch (e) { S.gate = { mode: 'reset', email: re, err: authErr(e) }; }
        render(); return;
      }
      else if (k === 'profile') { if (!fd.name) return; await DB.saveProfile(fd); S.profile = Object.assign({}, S.profile || {}, fd); S.view = 'home'; refreshData(); render(); maybeAskRating(); }
    } catch (e) { toast('تعذر الإرسال، تحقق من الاتصال'); if (btn) btn.disabled = false; }
  });

  function copy(t) {
    try { navigator.clipboard.writeText(t).then(function () { toast('نُسخ'); }, function () { toast('حدد النص وانسخه يدوياً'); }); } catch (e) { toast('حدد النص وانسخه يدوياً'); }
  }
  function finishQuiz() {
    var Q = S.quiz, pct = Math.round(Q.score / Q.items.length * 100);
    if (Q.n >= 0) { if (P.best[Q.n] == null || pct > P.best[Q.n]) P.best[Q.n] = pct; saveP(); DB.quiz(Q.n, pct >= 50).catch(function () { }); }
  }

  /* ---------- الدخول ---------- */
  async function doSend() {
    var em = ($('#gemail').value || '').trim().toLowerCase();
    if (!DOMAIN.test(em)) { S.gate = { email: em, err: 'اكتب بريداً إلكترونياً صحيحاً، مثل name@gmail.com' }; render(); return; }
    S.gate = { mode: 'teacher', email: em, busy: true }; render();
    try { await sendLink(em); lsSet('pending', em); S.gate = { mode: 'teacher', email: em, sent: true }; }
    catch (e) { S.gate = { mode: 'teacher', email: em, err: /QUOTA|LIMIT|TOO_MANY/.test(e.message) ? 'وصلنا الحد اليومي لرسائل الرابط. استعمل «عيّن كلمة مرور» في الأسفل لتدخل الآن.' : authErr(e) }; }
    render();
  }
  async function completeLink(em) {
    var p = new URLSearchParams(location.search), oob = p.get('oobCode');
    if (!DOMAIN.test(em)) { S.gate = { needEmail: true, err: 'اكتب بريدك نفسه الذي طلبت به الرابط' }; render(); return; }
    try { await finishLink(em, oob); lsSet('pending', undefined); history.replaceState(null, '', baseUrl()); await afterLogin(); }
    catch (e) { history.replaceState(null, '', baseUrl()); S.gate = { email: em, err: 'الرابط منتهي أو استُخدم من قبل. اطلب رابطاً جديداً.' }; S.view = 'gate'; render(); }
  }
  async function afterLogin() {
    if (!DOMAIN.test((AUTH && AUTH.email) || '')) { setAuth(null); S.view = 'gate'; S.gate = { err: 'اكتب بريداً إلكترونياً صحيحاً' }; render(); return; }
    if (!isAdmin()) { var bnd = false; try { bnd = await DB.amBanned(); } catch (e) { } if (bnd) { lsSet('prof', undefined); S.view = 'gate'; S.gate = { banned: true }; render(); return; } }
    try { S.profile = await DB.profile(); } catch (e) { S.profile = lsGet('prof', null); }
    if (!S.profile) { S.view = 'profile'; render(); return; }
    lsSet('prof', S.profile);
    S.view = 'home'; render(); refreshData(); maybeAskRating();
  }
  async function refreshData() {
    DB.visit().catch(function () { }).then(function () { return DB.stats(); }).then(function (s) { S.stats = s; if (S.view === 'home' || S.view === 'admin') render(); }).catch(function () { });
    DB.homework().then(function (l) { S.hw = l; render(); sysNotify(); }).catch(function () { });
    DB.announce().then(function (a) { S.ann = a; if (!S.sheet) render(); sysNotify(); }).catch(function () { });
    loadMine();
  }
  function loadMine() { if (!AUTH) return; DB.myQs().then(function (l) { S.myqs = l; if (S.view === 'hw') render(); }).catch(function () { }); }
  function loadAdmin() {
    if (!isAdmin()) return; S.A = S.A || {}; S.A.loading = true; render();
    DB.allQs().then(function (l) { S.A.qs = l; }).catch(function () { toast('تعذر تحميل التعليقات'); }).then(function () { S.A.loading = false; if (S.view === 'admin') render(); });
    DB.stats().then(function (s) { S.stats = s; }).catch(function () { });
  }
  function loadRates() { S.A = S.A || {}; DB.ratings().then(function (l) { S.A.rates = l; render(); }).catch(function () { S.A.rates = []; render(); toast('تعذر تحميل الآراء. تأكد من نشر القواعد الجديدة.'); }); }
  /* تصدير قائمة الطلبة إلى ملف إكسل */
  function loadScript(src) { return new Promise(function (ok, no) { var x = document.createElement('script'); x.src = src; x.onload = ok; x.onerror = no; document.head.appendChild(x); }); }
  function saveBlob(bl, name) { var a = document.createElement('a'), u = URL.createObjectURL(bl); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }
  async function exportStudents() {
    var A = S.A || {}, banIds = {}; (A.banned || []).forEach(function (x) { banIds[x.id] = 1; });
    var us = (A.users || []).filter(function (u) { return (u.email || '').toLowerCase() !== ADMIN; }).sort(function (a, b) { return (a.name || '') < (b.name || '') ? -1 : 1; });
    (A.banned || []).forEach(function (x) { if (!us.some(function (u) { return u.id === x.id; })) us.push(x); });
    var head = ['ت', 'الاسم', 'الشعبة', 'البريد الإلكتروني', 'تاريخ التسجيل', 'الحالة'];
    var rows = us.map(function (u, i) { return [i + 1, u.name || '', u.group || '', u.email || '', u.joined ? String(u.joined).slice(0, 10) : '', banIds[u.id] ? 'محظور' : 'فعّال']; });
    var fn = 'طلبة حقيبة الحاسوب ' + today();
    try {
      if (!window.XLSX) { toast('جارٍ تجهيز الملف…'); await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'); }
      var ws = XLSX.utils.aoa_to_sheet([head].concat(rows));
      ws['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 18 }, { wch: 34 }, { wch: 14 }, { wch: 10 }];
      var wb = XLSX.utils.book_new(); wb.Workbook = { Views: [{ RTL: true }] };
      XLSX.utils.book_append_sheet(wb, ws, 'الطلبة');
      saveBlob(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fn + '.xlsx');
    } catch (e) {
      /* بديل: ملف CSV يفتحه إكسل مباشرة */
      var csv = '\ufeff' + [head].concat(rows).map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
      saveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), fn + '.csv');
    }
    toast('نُزّل ملف الطلبة');
  }
  function loadUsers() { S.A = S.A || {}; DB.users().then(function (l) { S.A.users = l; render(); }).catch(function () { toast('تعذر تحميل قائمة الطلبة'); }); DB.banned().then(function (l) { S.A.banned = l; render(); }).catch(function () { S.A.banned = []; }); }

  /* ---------- التشغيل ---------- */
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); window.__bip = e; });
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claudeusercontent|claude\.ai/.test(location.host)) {
    navigator.serviceWorker.register('sw.js').catch(function () { });
  }
  (async function boot() {
    var p = new URLSearchParams(location.search);
    if (LIVE && p.get('oobCode') && (p.get('mode') === 'signIn' || !p.get('mode'))) {
      var em = lsGet('pending', null);
      if (em) { S.view = 'gate'; S.gate = { busy: true }; render(); await completeLink(em); return; }
      S.view = 'gate'; S.gate = { needEmail: true }; render(); return;
    }
    if (AUTH) { S.profile = lsGet('prof', null); if (S.profile) { S.view = 'home'; render(); } await afterLogin(); return; }
    S.view = 'gate'; S.gate = {}; render();
  })();
})();
