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

  const out = document.getElementById("demo-out");
  const input = document.getElementById("demo-in");
  const pill = document.getElementById("layout");
  if (!out || !input) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let fixedCount = 0, lang = "EN";

  function setLang(l) {
    if (l === lang) return;
    lang = l; pill.textContent = l;
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
      if (i <= scriptText.length) { render(scriptText.slice(0, i)); i++; timer = setTimeout(step, reduce ? 0 : 70 + Math.random() * 60); }
      else timer = setTimeout(() => { fixedCount = 0; play(); }, 2600);
    };
    if (reduce) { render(scriptText); return; }
    step();
  }
  function stop() { if (!playing) return; playing = false; clearTimeout(timer); fixedCount = 0; render(input.value); }
  input.addEventListener("focus", stop);
  input.addEventListener("input", () => { stop(); render(input.value); });
  input.addEventListener("blur", () => render(input.value, false));
  play();
})();
