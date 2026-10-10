(() => {
  const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`";
  const UK = "йцукенгшщзхїфівапролджєячсмитьбюʼ";
  const SH_EN = "QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>~";
  const SH_UK = "ЙЦУКЕНГШЩЗХЇФІВАПРОЛДЖЄЯЧСМИТЬБЮʼ";
  const toUk = new Map(), toEn = new Map();
  [...EN].forEach((c, i) => { toUk.set(c, UK[i]); toEn.set(UK[i], c); });
  [...SH_EN].forEach((c, i) => { toUk.set(c, SH_UK[i]); if (!toEn.has(SH_UK[i])) toEn.set(SH_UK[i], c); });

  const big = s => new Set(s.split(" "));
  const EN_BI = big("th he in er an re on at en nd ti es or te of ed is it al ar st to nt ng se ha as ou io le ve co me de hi ri ro ic ne ea ra ce li ch ll be ma si om ur ca el ta la ns di fo ho pe ec pr no ct us ac ot il tr ly nc et ut ss so rs un lo wa ge ie wh ee wi em ad ol rt po we na ul ni ts mo ow pa im mi ai sh ir su id os iv ia am fi ci vi pl ig tu ev ld ry mp fe bl ab gh ty op wo sa ay ex ke fr oo av ag if ap gr od bo sp rd do uc bu ei ov by rm ep tt oc fa ef cu rn sc gi da yo cr cl du ga qu ue ff ba ey ls va um pp ua up lu go ht ru ug ds lt pi rc rr eg au ck ew mu br bi pt ak pu ui rg ib tl ny ki rk ys ob mm fu ph og ms ye ud mb ip ub oi rl gu dr hr cc tw ft wn nu ld ks");
  const UK_BI = big("ст но на ен пр ра ов ко ро по ні ти та ан ер ог ак ій ть ли ре то во ни ал ла ві ин ки ва ий ня ль ол ам зн ою ри ме мо ав ди ит лі ос ор ка де ає ую рі ці ць сь уд ну дн ім ят ах кі лю юч ча чи жи же за із ус ма мі що об зі ід ес ем ел ет ик ир ис ів ії ія ію ує уп ут ую ує бу бо би ві вс вт ві гр да до ду дя ед ез ей жу зв зд зи зо ле ло лу ля мл мн му на не ну ня об од ок ом он оп от па пи пл пі пу ре ру ря са си ск сл см сп сі та те ту тр ть ук ул ум ус уч хо ці ча чі ше що ют яв як ям ят дь ьк ьн ст св сь іт ін іл ій іс ів ід ік ім ія ра ри ру ря ві віт сві ри ив ив ві ит ія");
  const EN_V = /[aeiouy]/i, UK_V = /[аеєиіїоуюя]/i;
  const EN_WORDS = big("a i am an as at be by do go he if in is it me my no of oh ok on or so to up us we the and you yes hey hi");
  const UK_WORDS = big("а в з і й у о ж б та що як це не на до за по ну");

  const score = (w, set) => { w = w.toLowerCase(); if (w.length < 2) return 0; let n = 0; for (let i = 0; i < w.length - 1; i++) if (set.has(w.slice(i, i + 2))) n++; return n / (w.length - 1); };
  const vRatio = (w, re) => { const l = [...w].filter(c => /\p{L}/u.test(c)); return l.length ? l.filter(c => re.test(c)).length / l.length : 0; };
  const conv = (w, map) => [...w].map(c => map.get(c) ?? c).join("");

  function decide(token) {
    const m = token.match(/^([^\p{L},.;'\[\]`<>:"{}~]*)(.*?)([!?)\-]*)$/u);
    const pre = m[1], core = m[2], post = m[3];
    if (!core) return null;
    if (/^[A-Za-z,.;'\[\]`<>:"{}~]+$/.test(core) && /[A-Za-z]/.test(core)) {
      if (EN_WORDS.has(core.toLowerCase())) return null;
      const uk = conv(core, toUk);
      const s0 = score(core, EN_BI), s1 = score(uk, UK_BI);
      const v0 = vRatio(core, EN_V), v1 = vRatio(uk, UK_V);
      const punctInside = /[;'\[\]`<>:"{}~]|[,.](?=.)/.test(core);
      if (UK_WORDS.has(uk.toLowerCase()) && !EN_V.test(core)) return { text: pre + uk + post, lang: "УК" };
      if (core.length >= 2 && ((v0 < 0.2 && v1 >= 0.25 && s1 > s0) || punctInside || s1 - s0 > 0.2)) return { text: pre + uk + post, lang: "УК" };
      return null;
    }
    if (/^[\p{Script=Cyrillic}ʼ]+$/u.test(core)) {
      if (UK_WORDS.has(core.toLowerCase())) return null;
      const en = conv(core, toEn);
      const s0 = score(core, UK_BI), s1 = score(en, EN_BI);
      const v0 = vRatio(core.replace(/у/gi, ""), UK_V), v1 = vRatio(en, EN_V);
      if (core.length >= 2 && /^[A-Za-z]+$/.test(en) && ((v0 < 0.15 && v1 >= 0.2 && s1 > s0) || s1 - s0 > 0.25)) return { text: pre + en + post, lang: "EN" };
    }
    return null;
  }

  window.__scDecide = decide;
  const out = document.getElementById("demo-out");
  const input = document.getElementById("demo-in");
  const pill = document.getElementById("layout");
  if (!out || !input) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let fixedCount = 0, lang = "EN";

  const kb = document.getElementById("kb");
  const keyEls = new Map();
  if (kb) kb.querySelectorAll(".k").forEach(k => keyEls.set(k.dataset.k, k));
  const enOf = c => { c = c.toLowerCase(); if (keyEls.has(c)) return c; const e = toEn.get(c); return e ? e.toLowerCase() : null; };
  function press(ch) {
    const k = keyEls.get(enOf(ch) ?? "");
    if (!k) return;
    k.classList.remove("on"); void k.offsetWidth; k.classList.add("on");
    clearTimeout(k._t); k._t = setTimeout(() => k.classList.remove("on"), 180);
  }
  function setLang(l) {
    if (l === lang) return;
    lang = l; pill.textContent = l;
    if (kb) kb.dataset.layout = l === "EN" ? "en" : "uk";
    pill.classList.remove("flash"); void pill.offsetWidth; pill.classList.add("flash");
    setTimeout(() => pill.classList.remove("flash"), 320);
  }

  function render(raw, showCaret = true) {
    const parts = raw.split(/(\s+)/);
    const trailingOpen = !/\s$/.test(raw);
    out.textContent = "";
    let seenWords = 0, lastLang = null;
    parts.forEach((p, i) => {
      if (!p) return;
      if (/^\s+$/.test(p)) { out.append(document.createTextNode(p)); return; }
      const isOpen = trailingOpen && i === parts.length - 1;
      const span = document.createElement("span");
      span.className = "w";
      const d = isOpen ? null : decide(p);
      if (d) {
        span.textContent = d.text; span.classList.add("fixed"); seenWords++;
        if (seenWords <= fixedCount) span.style.animation = "none";
        lastLang = d.lang;
      } else span.textContent = p;
      out.append(span);
    });
    if (seenWords > fixedCount && lastLang) setLang(lastLang);
    fixedCount = seenWords;
    if (showCaret) { const c = document.createElement("span"); c.className = "caret"; out.append(c); }
    if (!raw) { const h = document.createElement("span"); h.className = "hint"; h.textContent = " наберіть щось…"; if (document.activeElement === input) out.append(h); }
  }

  // autoplay
  const scriptText = "ghbdsn cdsn! Ckjdf ghfw..nm cfvs ";
  let timer = null, playing = true;
  function play() {
    let i = 0;
    const step = () => {
      if (!playing) return;
      if (i <= scriptText.length) { render(scriptText.slice(0, i)); if (i > 0) press(scriptText[i - 1]); i++; timer = setTimeout(step, reduce ? 0 : 70 + Math.random() * 60); }
      else timer = setTimeout(() => { fixedCount = 0; setLang("EN"); play(); }, 2600);
    };
    if (reduce) { render(scriptText); return; }
    step();
  }
  function stop() { if (!playing) return; playing = false; clearTimeout(timer); fixedCount = 0; setLang("EN"); render(input.value); }
  input.addEventListener("focus", stop);
  let prevLen = 0;
  input.addEventListener("input", () => { stop(); const v = input.value; if (v.length > prevLen) press(v[v.length - 1]); prevLen = v.length; render(v); });
  input.addEventListener("blur", () => render(input.value, false));
  play();
})();

/* ---------- Live release info from GitHub ---------- */
(() => {
  const KEY = "sc-release-v1";
  const fmtSize = b => (b / 1048576).toLocaleString("uk-UA", { maximumFractionDigits: 1 }) + " МБ";
  const fmtDate = d => new Date(d).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
  function apply(r) {
    if (!r || !r.tag_name) return;
    const v = r.tag_name.replace(/^v/, "");
    const assets = r.assets || [];
    const setup = assets.find(a => a.name === "SwitchcraftSetup.exe") || assets.find(a => /setup.*\.exe$/i.test(a.name));
    const zip = assets.find(a => /portable.*\.zip$/i.test(a.name));
    if (setup) document.querySelectorAll('[data-dl="setup"]').forEach(a => a.href = setup.browser_download_url);
    if (zip) document.querySelectorAll('[data-dl="portable"]').forEach(a => a.href = zip.browser_download_url);
    document.querySelectorAll('[data-rel="version"]').forEach(e => e.textContent = "Версія " + v);
    document.querySelectorAll('[data-rel="vnum"]').forEach(e => e.textContent = v);
    if (setup) document.querySelectorAll('[data-rel="size"]').forEach(e => e.textContent = fmtSize(setup.size));
    if (r.published_at) document.querySelectorAll('[data-rel="date"]').forEach(e => e.textContent = " · вийшла " + fmtDate(r.published_at));
  }
  try { const c = JSON.parse(sessionStorage.getItem(KEY) || "null"); if (c && Date.now() - c.t < 36e5) return apply(c.r); } catch {}
  fetch("https://api.github.com/repos/phantasmat2018/Switchcraft-AI/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
    .then(r => r.ok ? r.json() : null)
    .then(r => { if (!r) return; const slim = { tag_name: r.tag_name, published_at: r.published_at, assets: (r.assets || []).map(a => ({ name: a.name, size: a.size, browser_download_url: a.browser_download_url })) }; apply(slim); try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), r: slim })); } catch {} })
    .catch(() => {});
})();

/* ---------- Non-Windows visitors ---------- */
(() => {
  const ua = navigator.userAgent;
  const isWin = /Windows NT/.test(ua) && !/Windows Phone/.test(ua);
  const el = document.getElementById("notwin");
  if (el && !isWin) el.hidden = false;
})();

/* ---------- Copy buttons ---------- */
(() => {
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-copy],[data-copy-target]");
    if (!b) return;
    const text = b.dataset.copy ?? document.getElementById(b.dataset.copyTarget)?.innerText ?? "";
    try { await navigator.clipboard.writeText(text); } catch { return; }
    const span = b.querySelector("span"); const prev = span?.textContent;
    b.classList.add("done"); if (span) span.textContent = "Скопійовано";
    setTimeout(() => { b.classList.remove("done"); if (span) span.textContent = prev; }, 1600);
  });
})();

/* ---------- Hotkey practice ---------- */
(() => {
  const rows = new Map([...document.querySelectorAll(".hotkeys li[data-code]")].map(li => [li.dataset.code, li]));
  if (!rows.size || !matchMedia("(pointer: fine)").matches) { document.querySelector(".kb-hint")?.remove(); return; }
  window.addEventListener("keydown", e => {
    if (!(e.ctrlKey && e.altKey)) return;
    const li = rows.get(e.code);
    if (!li) return;
    if (e.target.closest && e.target.closest("input, textarea")) return;
    e.preventDefault();
    li.classList.remove("hit"); void li.offsetWidth; li.classList.add("hit");
    clearTimeout(li._t); li._t = setTimeout(() => li.classList.remove("hit"), 1400);
  });
})();

/* ---------- Password-field proof ---------- */
(() => {
  const decide = window.__scDecide;
  const t = document.getElementById("pf-text"), ts = document.getElementById("pf-text-s");
  const p = document.getElementById("pf-pass"), ps = document.getElementById("pf-pass-s");
  if (!decide || !t || !p) return;
  t.addEventListener("input", () => {
    const v = t.value;
    if (!/\s$/.test(v)) return;
    const words = v.split(/(\s+)/);
    let changed = 0;
    const fixed = words.map(w => { if (/^\s*$/.test(w)) return w; const d = decide(w); if (d) { changed++; return d.text; } return w; }).join("");
    if (changed) {
      const pos = t.selectionStart; t.value = fixed; t.setSelectionRange(fixed.length, fixed.length);
      ts.textContent = "Виправлено → " + fixed.trim().split(/\s+/).pop(); ts.classList.add("ok");
      t.classList.remove("flash"); void t.offsetWidth; t.classList.add("flash");
    }
  });
  p.addEventListener("input", () => {
    ps.textContent = p.value ? "Символів: " + p.value.length + " · без змін, без запису" : "Switchcraft сюди не дивиться";
  });
})();

/* ---------- Scroll motion (numbers & keys) ---------- */
(() => {
  if (!("IntersectionObserver" in window)) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("motion");
  const once = (els, fn, opts) => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } }), opts);
    els.forEach(el => io.observe(el));
  };
  const steps = document.querySelector(".steps");
  if (steps) {
    steps.querySelectorAll("li").forEach((li, i) => li.style.setProperty("--i", i));
    once([steps], el => el.classList.add("in"), { threshold: 0.35 });
  }
  document.querySelectorAll(".hotkeys li").forEach(li => {
    li.querySelectorAll("kbd").forEach((k, i) => k.style.setProperty("--k", i));
  });
  once([...document.querySelectorAll(".hotkeys li")], li => {
    li.classList.add("chord");
    setTimeout(() => li.classList.remove("chord"), 1100);
  }, { threshold: 1, rootMargin: "0px 0px -12% 0px" });
  const count = el => {
    const to = parseFloat(el.dataset.count); if (reduce || !to) return;
    const t0 = performance.now(), d = 1100;
    const tick = t => { const p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(tick); };
    el.textContent = "0"; requestAnimationFrame(tick);
  };
  once([...document.querySelectorAll("[data-count]")], count, { threshold: 1 });
  once([...document.querySelectorAll(".final .btn-primary")], b => b.classList.add("shine"), { threshold: 1 });
})();
