import React, { useState, useEffect, useRef, useCallback } from 'react';

// CSS الأصلي مدمج هنا لضمان عدم ضياع أي تنسيقات
const GLOBAL_CSS = `
:root{--bg:#0a1020;--paper:#121c33;--ink:#eaf2ff;--grid:#27395f;--c1:#38d6ff;--c2:#ffb020;--ac:var(--c1);--on:#06101f;--ok:#4ade80;--bad:#ff6b6b;--c:36px;--fade:#5b6d94}
body[data-t=prac]{--ac:var(--c2)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{height:100%;margin:0}
body{height:100dvh;overflow:hidden;display:flex;flex-direction:column;background:var(--bg);color:var(--ink);font:15px/1.6 "Segoe UI",Tahoma,"Noto Naskh Arabic",system-ui,sans-serif;padding:env(safe-area-inset-top,0) 0 env(safe-area-inset-bottom,0)}
header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 12px 2px;flex:none}
.brand{font-weight:900;font-size:.95rem;padding:1px 10px;border-radius:99px;border:2px solid var(--ac);color:var(--ac);direction:ltr;white-space:nowrap}
.brand sup{font-size:.6em}
h1{font-size:.95rem;margin:0;font-weight:700;text-align:left}
.tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 12px;flex:none}
.tab{border:2px solid var(--grid);background:var(--paper);color:var(--ink);border-radius:12px;padding:5px;font:inherit;font-weight:700;min-height:44px;transition:all .15s; cursor:pointer;}
.tab[data-k=learn].on{background:var(--c1);border-color:var(--c1);color:var(--on)}
.tab[data-k=prac].on{background:var(--c2);border-color:var(--c2);color:var(--on)}
#main{flex:1;min-height:0;display:grid;grid-template-columns:1fr;grid-template-rows:auto 1fr auto;gap:6px;padding:4px 8px 0}
#msg{grid-row:1;height:5.1em;overflow:auto;margin:0;padding:4px 10px;border-radius:10px;background:#0c1527;font-size:.88rem;line-height:1.55;border-right:5px solid var(--grid);transition:border-color .25s}
#msg.ok{border-color:var(--ok)}#msg.bad{border-color:var(--bad)}#msg.hint{border-color:var(--ac)}
#bd{grid-row:2;min-height:0;display:flex;justify-content:center;align-items:flex-start;overflow:hidden}
#board{direction:ltr}
#controls{grid-row:3;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto auto;gap:6px;padding-bottom:6px}
#numPad{grid-column:2;grid-row:1;display:grid;grid-template-columns:repeat(5,1fr);gap:6px;direction:ltr}
#actionCol{grid-column:1;grid-row:1/span 2;display:flex;flex-direction:column;gap:6px;justify-content:stretch}
#bottomBar{grid-column:2;grid-row:2;display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
button{font:inherit;border:0;border-radius:12px;background:#1c2b4a;color:var(--ink);min-height:52px;padding:2px 4px;transition:transform .1s,background .15s,box-shadow .15s; cursor:pointer;}
button:active:not(:disabled){transform:scale(.96)}
button:disabled{opacity:.3; cursor:not-allowed;}
button:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
#numPad button{font-size:1.5rem;font-weight:800;padding:0;background:#243b5c;color:#fff;line-height:1}
#numPad button:active:not(:disabled){background:var(--ac);color:var(--on)}
#numPad button.active{background:var(--ac);color:var(--on);box-shadow:0 0 12px color-mix(in srgb,var(--ac) 50%,transparent)}
#actionCol button{min-height:0;flex:1;font-weight:900;font-size:.85rem;padding:4px 8px}
#go{background:var(--ac);color:var(--on);font-size:1rem;display:flex;align-items:center;justify-content:center;text-align:center}
#del{background:#7a2230;color:#fff;font-size:1.4rem}
#stepBtn{background:#7c3aed;color:#fff;font-size:.8rem;line-height:1.15}
#stepBtn:active:not(:disabled){background:#a78bfa}
#bottomBar button{font-size:.72rem;font-weight:700;min-height:44px;background:#1c2b4a;line-height:1.15}
#genBar{grid-column:2;grid-row:3;display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
#genBar button{font-size:.75rem;font-weight:800;min-height:42px;line-height:1.15;padding:3px 4px;border-radius:10px}
#genBar .gen4{background:#2a5d8f;color:#cfeaff}
#genBar .gen5{background:#3a6b3a;color:#d4ffd4}
#genBar button:active:not(:disabled){filter:brightness(1.35)}
.stats{display:flex;justify-content:space-between;font-size:.75rem;color:#8fa3c9;padding:2px 4px 4px;grid-column:1/span 2;grid-row:4}
.stats b{color:var(--ac)}

.row{display:flex;transition:opacity .3s}
.lead{width:calc(var(--c)*2);flex:none;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:calc(var(--c)*.64);color:#ffb020}
.lead .t{color:#ffb020}
.cells{display:flex}
.cell, .lead, #numPad button, #sv, #ms, #msg, .tab, h1, .brand, #genBar button, .own-input-val, .own-numpad button {
  font-family:"Segoe UI","Tahoma","Noto Naskh Arabic",system-ui,sans-serif;
  font-variant-numeric:tabular-nums;
  font-feature-settings:"tnum" 1,"zero" 0,"ss01" 0;
}
.cell{
  width:var(--c);height:var(--c);
  display:flex;align-items:center;justify-content:center;
  font-size:calc(var(--c)*.68);font-weight:900;
  position:relative;line-height:1;letter-spacing:-.02em;
  transition:background .25s,color .25s,transform .25s;
  color:#ffffff;
}
.dvd .cell{color:#ffffff;font-weight:900}
.lead{color:#ffb020;font-weight:900}
.cell.q{color:#4ade80 !important;font-weight:900;text-shadow:0 0 8px rgba(74,222,128,.4);animation:pop .3s ease-out}
.row.prod-row .cell{color:#ff8a8a !important}
.row.rem-row .cell{color:#38d6ff !important}
.cell.new{color:#ffb020 !important;font-weight:900;animation:slideDown .35s ease-out}
.hl{background:rgba(56,214,255,.15);border-radius:6px}
.cell.bad{color:#ff6b6b !important;font-weight:900;background:rgba(255,107,107,.18);border-radius:6px}
.ask{color:#38d6ff !important;animation:blink 1s infinite alternate}
@keyframes blink{to{opacity:.25}}
.dvd{border-top:2px solid var(--ink);border-left:2px solid var(--ink);border-top-left-radius:8px;padding-top:2px;min-height:var(--c)}
.dvd .lead{border-right:2px solid var(--ink);padding-left:4px}
.underline{position:relative}
.underline::after{
  content:'';position:absolute;bottom:4px;left:8%;right:8%;
  height:2.5px;background:var(--ink);border-radius:2px;
  animation:drawLine .35s ease-out forwards;transform-origin:right;
}
@keyframes drawLine{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes slideDown{from{transform:translateY(-10px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.row.appear{animation:fadeIn .3s ease-out}
@media (prefers-reduced-motion:reduce){.ask,.q,.new,.row.appear,.underline::after{animation:none!important}}

/* ===== Own Problem Modal Styles ===== */
#ownModal{position:fixed;inset:0;background:rgba(10,16,32,0.92);z-index:100;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px)}
.own-box{background:var(--paper);padding:20px;border-radius:20px;border:2px solid var(--grid);width:100%;max-width:340px;display:flex;flex-direction:column;gap:16px;box-shadow:0 10px 30px rgba(0,0,0,0.5)}
.own-header{text-align:center;font-weight:bold;color:var(--ac);font-size:1.1rem;margin-bottom:4px}
.own-inputs{display:flex;gap:12px;direction:ltr}
.own-input-group{flex:1;display:flex;flex-direction:column;gap:6px}
.own-label{font-size:0.8rem;color:#8fa3c9;text-align:center;font-weight:bold;direction:rtl}
.own-input-box{background:#0c1527;border:2px solid var(--grid);border-radius:12px;height:56px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
.own-input-box.active{border-color:var(--ac);box-shadow:0 0 12px color-mix(in srgb,var(--ac) 30%,transparent)}
.own-input-val{font-size:1.6rem;color:var(--ink);font-weight:bold;letter-spacing:2px}
.own-numpad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;direction:ltr}
.own-numpad button{font-size:1.6rem;height:56px;font-weight:bold;background:#243b5c;color:#fff;border-radius:12px}
.own-numpad button:active{background:var(--ac);color:var(--on)}
.own-numpad .cmd-c{background:#7a2230;color:#fff;font-size:1.3rem}
.own-numpad .cmd-del{background:#b44d34;color:#fff;font-size:1.4rem}
.own-actions{display:flex;gap:12px;margin-top:4px}
.own-actions button{flex:1;height:50px;font-weight:bold;font-size:1rem;border-radius:12px}
#ownStart{background:var(--ok);color:#06101f}
#ownStart:disabled{background:#1a4d33;color:#8fa3c9;opacity:0.6}
#ownCancel{background:#1c2b4a;color:var(--ink);border:1px solid var(--grid)}

@media (min-aspect-ratio: 1/1) and (min-width: 640px){
  #main{grid-template-columns:1fr auto;grid-template-rows:auto 1fr}
  #msg{grid-column:1;grid-row:1}
  #bd{grid-column:1;grid-row:2}
  #controls{grid-column:2;grid-row:1/span 3;grid-template-columns:1fr;grid-template-rows:auto auto auto auto;width:280px;padding:6px}
  #numPad{grid-column:1;grid-row:2;grid-template-columns:repeat(3,1fr)}
  #actionCol{grid-column:1;grid-row:1;flex-direction:row;height:60px}
  #bottomBar{grid-column:1;grid-row:3;grid-template-columns:repeat(2,1fr)}
  #genBar{grid-column:1;grid-row:4;grid-template-columns:repeat(2,1fr)}
  .stats{grid-column:1;grid-row:5}
}
@media (max-width: 400px){
  #bottomBar button{font-size:.65rem}
  #actionCol button{font-size:.72rem}
  #numPad button{font-size:1.25rem;min-height:46px}
  #genBar button{font-size:.68rem;min-height:38px}
  .own-numpad button{height:48px;font-size:1.4rem}
}
`;

export default function App() {
  // React States for UI
  const [boardHtml, setBoardHtml] = useState('');
  const [msgHtml, setMsgHtml] = useState('');
  const [msgClass, setMsgClass] = useState('');
  const [stats, setStats] = useState({ solved: 0, totalMist: 0 });
  const [theme, setTheme] = useState('learn'); // 'learn' or 'prac'
  const [buttonsState, setButtonsState] = useState({
    numpadDisabled: true, numpadActive: false, goVisible: false,
    goText: '', delVisible: false, hintDisabled: true, stepDisabled: true
  });
  
  const [ownModal, setOwnModal] = useState({ open: false, field: 'dvd', dvd: '', div: '' });
  
  const bdRef = useRef(null);
  const savedStates = useRef({});
  
  // Math & Logic Engine (Mutable reference to avoid async state issues)
  const state = useRef({
    T: 'learn', N: 0, Dv: 0, digs: [], n: 0, rows: 0,
    solved: 0, totalMist: 0, S: null, prevPhase: '',
    animTimer: null, iv: null
  });

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const cr = () => state.current.S.rounds[state.current.S.rounds.length - 1];

  const fit = useCallback(() => {
    const b = bdRef.current;
    if (!b) return;
    const eng = state.current;
    const c = Math.max(18, Math.min(52, (b.clientWidth - 16) / (eng.n + 3.2), (b.clientHeight - 8) / (eng.rows + 0.3)));
    document.documentElement.style.setProperty('--c', c + 'px');
  }, []);

  // HTML Generators for exactly replicating original behavior
  const blank = () => Array.from({ length: state.current.n + 1 }, () => ({ t: '', k: '' }));
  
  const cellHTML = (o) => {
    if (o.t === '' || o.t === null || o.t === undefined) return `<div class="cell ${o.k || ''}"></div>`;
    const cls = [o.k || '', o.under ? 'underline' : ''].filter(Boolean).join(' ');
    return `<div class="cell ${cls}">${o.t}</div>`;
  };
  
  const cells = (a) => a.map(cellHTML).join('');
  
  const row = (l, a, c) => {
    const rc = [c || ''].filter(Boolean).join(' ');
    return `<div class="row ${rc}"><div class="lead">${l}</div><div class="cells">${cells(a)}</div></div>`;
  };

  const renderEngine = useCallback(() => {
    const eng = state.current;
    const S = eng.S;
    if (!S) return;

    const c = cr();
    const done = S.phase === 'done';
    const P = eng.T === 'prac';
    const ph = S.phase;
    const isInit = ph === 'init';
    const phaseChanged = eng.prevPhase !== ph;
    eng.prevPhase = ph;

    let h = '';

    const qa = blank();
    if (!isInit) {
      const doneRounds = S.rounds.filter(r => r.q != null);
      if (doneRounds.length > 0) {
        const qMap = {};
        let lastPos = -1;
        doneRounds.forEach(r => {
          if (lastPos >= 0 && r.pos > lastPos + 1) {
            for (let k = lastPos + 1; k < r.pos; k++) qMap[k] = 0;
          }
          qMap[r.pos] = r.q;
          lastPos = Math.max(lastPos, r.pos);
        });
        Object.keys(qMap).forEach(pos => {
          qa[+pos + 1] = { t: qMap[pos], k: 'q' };
        });
      }
      if (ph === 'choose' && c.q == null) qa[c.pos + 1] = { t: '?', k: 'ask' };
      if (S.trial) qa[S.trial.pos + 1] = { t: S.trial.q, k: 'bad' };
    }
    h += row('', qa);

    const da = eng.digs.map((d, i) => {
      let visible = !isInit || (i < S.animIndex);
      return {
        t: visible ? d : '',
        k: (!done && !isInit && (S.rounds.length === 1 ? i <= c.pos : i === c.pos)) ? 'hl' : ''
      };
    });
    da.unshift({ t: '', k: '' });

    let divStr = String(eng.Dv);
    let currentDiv = divStr;
    if (isInit) {
      let visibleDivChars = Math.max(0, S.animIndex - eng.n);
      currentDiv = divStr.substring(0, visibleDivChars);
    }
    h += row(currentDiv, da, 'dvd');

    if (!isInit) {
      S.rounds.forEach((r, idx) => {
        const isActive = idx === S.rounds.length - 1;
        if (r.stage >= 1 && r.prod != null) {
          const pc = blank();
          const ps = String(r.prod).split(''), pst = r.pos + 2 - ps.length;
          ps.forEach((ch, i) => { if (pst + i >= 0) pc[pst + i] = { t: ch, k: 'prod', under: true }; });
          if (pst >= 1) pc[pst - 1] = { t: '−', k: 'minus' };
          const appear = isActive && phaseChanged ? 'appear' : '';
          h += `<div class="row prod-row ${appear}"><div class="lead"></div><div class="cells">${cells(pc)}</div></div>`;
        }
        if (r.stage >= 2 && r.rem != null) {
          const rc = blank();
          if (r.rem === 0 && r.next) {
            rc[r.pos + 1] = { t: '0', k: 'rem' };
          } else {
            const rs = String(r.rem).split(''), rst = r.pos + 2 - rs.length;
            rs.forEach((ch, i) => { if (rst + i >= 0 && rst + i < rc.length) rc[rst + i] = { t: ch, k: 'rem' }; });
          }
          if (r.brought && r.next) {
            rc[r.pos + 2] = { t: eng.digs[r.pos + 1], k: 'new' };
          }
          const appear = isActive && phaseChanged ? 'appear' : '';
          h += `<div class="row rem-row ${appear}"><div class="lead"></div><div class="cells">${cells(rc)}</div></div>`;
        }
      });

      if (ph === 'ptype') {
        const pc = blank();
        const s = String(S.buf || '?').split(''), st = c.pos + 2 - s.length;
        s.forEach((ch, i) => { if (st + i >= 0 && st + i < pc.length) pc[st + i] = { t: ch, k: S.buf ? 'new' : 'ask', under: !!S.buf }; });
        h += `<div class="row prod-row"><div class="lead"></div><div class="cells">${cells(pc)}</div></div>`;
      }
      if (ph === 'rtype') {
        const rc = blank();
        const s = String(S.buf || '?').split(''), st = c.pos + 2 - s.length;
        s.forEach((ch, i) => { if (st + i >= 0 && st + i < rc.length) rc[st + i] = { t: ch, k: S.buf ? 'rem' : 'ask' }; });
        h += `<div class="row rem-row"><div class="lead"></div><div class="cells">${cells(rc)}</div></div>`;
      }

      if (S.trial) {
        const t = S.trial;
        const pc = blank(); const ps = String(t.prod).split(''), pst = t.pos + 2 - ps.length;
        ps.forEach((ch, i) => { if (pst + i >= 0) pc[pst + i] = { t: ch, k: 'bad', under: true }; });
        if (pst >= 1) pc[pst - 1] = { t: '−', k: 'bad' };
        h += `<div class="row"><div class="lead"></div><div class="cells">${cells(pc)}</div></div>`;
        const rcp = blank();
        if (t.over) { rcp[t.pos + 1] = { t: '✗', k: 'bad' }; }
        else {
          const rs = String(t.rem).split(''), rst = t.pos + 2 - rs.length;
          rs.forEach((ch, i) => { if (rst + i >= 0) rcp[rst + i] = { t: ch, k: 'bad' }; });
        }
        h += `<div class="row"><div class="lead"></div><div class="cells">${cells(rcp)}</div></div>`;
      }
    }

    setBoardHtml(h);
    setMsgHtml(S.msg.replace(/\d+(?:\s*[×−=+÷≈]\s*\d+)+/g, '<bdi dir="ltr">$&</bdi>'));
    setMsgClass(S.k);
    setStats({ solved: eng.solved, totalMist: eng.totalMist });

    const typing = P && (ph === 'ptype' || ph === 'rtype');
    const canChoose = ph === 'choose' && !S.trial;

    setButtonsState({
      numpadDisabled: !(canChoose || typing) || isInit,
      numpadActive: canChoose && !isInit,
      goVisible: (P ? typing : (ph === 'mult' || ph === 'sub')),
      goText: P ? 'تأكيد ✓' : (ph === 'mult' ? `اطرح ${c.prod} من ${c.cur}` : (c.next ? `أنزل (${eng.digs[c.pos + 1]})` : 'أنهِ')),
      delVisible: typing,
      hintDisabled: ph !== 'choose' || !!S.trial || isInit,
      stepDisabled: ph === 'done' || !!S.trial || isInit
    });

    fit();
  }, [fit]);

  const mk = (pos) => {
    const eng = state.current;
    const p = eng.S.rounds[eng.S.rounds.length - 1];
    return {
      pos,
      cur: p ? p.rem * 10 + eng.digs[pos] : +String(eng.N).slice(0, pos + 1),
      stage: 0,
      next: pos < eng.n - 1
    };
  };

  const chooseMsg = useCallback(() => {
    const eng = state.current;
    const r = cr();
    let s = '';
    if (eng.S.rounds.length === 1 && eng.S.first) s = `أول رقمين (${String(eng.N).slice(0, 2)}) أصغر من ${eng.Dv} ، فنأخذ 3 أرقام. `;
    eng.S.msg = eng.T === 'prac'
      ? s + `قسّم ${r.cur} على ${eng.Dv} : ما رقم خارج القسمة؟`
      : s + `نقسم الآن ${r.cur} على ${eng.Dv}. اختر رقمًا نضربه في ${eng.Dv} فيكون الناتج أصغر من أو يساوي ${r.cur} ، وبعد الطرح يكون الباقي أصغر من ${eng.Dv}.`;
    eng.S.k = '';
  }, []);

  const start = useCallback((a, b) => {
    const eng = state.current;
    if (eng.S && eng.iv) clearInterval(eng.iv);
    if (eng.animTimer) clearInterval(eng.animTimer);

    eng.N = a; eng.Dv = b;
    eng.digs = [...String(eng.N)].map(Number);
    eng.n = eng.digs.length;

    eng.S = { rounds: [], phase: 'init', msg: 'جاري كتابة المسألة...', k: '', buf: '', mist: 0 };

    let p = String(eng.Dv).length - 1;
    if (+String(eng.N).slice(0, p + 1) < eng.Dv) p++;
    eng.S.first = p > 1;
    eng.S.rounds.push(mk(p));
    eng.rows = 2 + 2 * (eng.n - p) + 2;
    eng.prevPhase = '';
    eng.S.animIndex = 0;

    let divStr = String(eng.Dv);
    let totalDigits = eng.n + divStr.length;

    renderEngine();

    eng.animTimer = setInterval(() => {
      eng.S.animIndex++;
      if (eng.S.animIndex >= totalDigits) {
        clearInterval(eng.animTimer);
        eng.S.phase = 'choose';
        chooseMsg();
      }
      renderEngine();
    }, 350);
  }, [chooseMsg, renderEngine]);

  const tryWrong = (r, q, p, msg, over) => {
    const eng = state.current;
    eng.S.phase = 'trial'; eng.S.trial = { pos: r.pos, q, prod: p, rem: r.cur - p, over };
    eng.S.k = 'bad';
    let t = 5;
    eng.S.msg = msg + ' ستُحذف هذه المحاولة بعد <b id="cd">5</b> ثوانٍ.';
    renderEngine();

    eng.iv = setInterval(() => {
      t--;
      if (t > 0) {
        const e = document.getElementById('cd');
        if (e) e.textContent = t;
        return;
      }
      clearInterval(eng.iv);
      eng.S.trial = null;
      eng.S.phase = 'choose';
      chooseMsg();
      eng.S.msg = 'حاول مرة أخرى. ' + eng.S.msg;
      renderEngine();
    }, 1000);
  };

  const pick = (q) => {
    const eng = state.current;
    if (eng.S.phase !== 'choose') return;
    const r = cr(); const p = q * eng.Dv; const m = r.cur - p;
    if (m < 0) {
      eng.S.mist++; eng.totalMist++;
      tryWrong(r, q, p, `${q} × ${eng.Dv} = ${p} وهو أكبر من ${r.cur} ، فلا نستطيع الطرح. التخمين كبير، والصحيح رقم أصغر.`, true);
    } else if (m >= eng.Dv) {
      eng.S.mist++; eng.totalMist++;
      tryWrong(r, q, p, `${q} × ${eng.Dv} = ${p} ، والطرح ${r.cur} − ${p} = ${m} وهو أكبر من ${eng.Dv} أو يساويه. التخمين صغير، والصحيح رقم أكبر.`, false);
    } else {
      r.q = q; r.prod = p; r.rem = m;
      if (eng.T === 'prac') {
        eng.S.phase = 'ptype'; eng.S.buf = '';
        eng.S.msg = `أحسنت ✓ اكتب الآن ناتج ${q} × ${eng.Dv} ثم اضغط تأكيد.`;
      } else {
        r.stage = 1; eng.S.phase = 'mult';
        eng.S.msg = `أحسنت! ${q} × ${eng.Dv} = ${p} ، وهو أصغر من أو يساوي ${r.cur}. نكتبه تحت ${r.cur} ونطرح.`;
      }
      eng.S.k = 'ok';
    }
    renderEngine();
  };

  const next = (r) => {
    const eng = state.current;
    if (r.next) {
      r.brought = true;
      eng.S.rounds.push(mk(r.pos + 1));
      eng.S.phase = 'choose'; eng.S.buf = '';
      chooseMsg(); return;
    }
    eng.S.phase = 'done';
    const qMap = {}; let lastPos = -1;
    eng.S.rounds.forEach(rr => {
      if (rr.q == null) return;
      if (lastPos >= 0 && rr.pos > lastPos + 1) {
        for (let k = lastPos + 1; k < rr.pos; k++) qMap[k] = 0;
      }
      qMap[rr.pos] = rr.q;
      lastPos = Math.max(lastPos, rr.pos);
    });
    const Q = Object.keys(qMap).sort((a, b) => a - b).map(k => qMap[k]).join('');
    eng.S.k = 'ok';
    eng.S.msg = `انتهت القسمة ✓ خارج القسمة = ${Q} والباقي = ${r.rem}<br>التحقق: ${eng.Dv} × ${Q} + ${r.rem} = ${eng.N}`;
    if (eng.T === 'prac') {
      eng.solved++;
      eng.S.msg += `<br>${eng.S.mist ? 'عدد الأخطاء: ' + eng.S.mist : 'بدون أخطاء ⭐'} — المسائل المحلولة: ${eng.solved}`;
    }
  };

  const go = () => {
    const eng = state.current;
    const r = cr();
    if (eng.S.phase === 'mult') {
      r.stage = 2; eng.S.phase = 'sub';
      eng.S.msg = `${r.cur} − ${r.prod} = ${r.rem} ، والباقي أصغر من ${eng.Dv} ✓` + (r.next ? '' : ' ولا توجد أرقام أخرى للإنزال.');
      eng.S.k = 'ok';
    } else if (eng.S.phase === 'sub') next(r);
    renderEngine();
  };

  const type = (d) => {
    const eng = state.current;
    if (eng.S.buf.length < 5) eng.S.buf += d;
    renderEngine();
  };

  const conf = () => {
    const eng = state.current;
    const r = cr(), v = eng.S.buf, ph = eng.S.phase;
    if (v === '') return;
    if (+v !== (ph === 'ptype' ? r.prod : r.rem)) {
      eng.S.mist++; eng.totalMist++; eng.S.buf = ''; eng.S.k = 'bad';
      eng.S.msg = ph === 'ptype' ? `غير صحيح. أعد حساب ${r.q} × ${eng.Dv} على الورقة ثم اكتبه.` : `غير صحيح. أعد الطرح: ${r.cur} − ${r.prod}.`;
      renderEngine(); return;
    }
    eng.S.buf = ''; r.stage = ph === 'ptype' ? 1 : 2;
    if (ph === 'ptype') {
      eng.S.phase = 'rtype'; eng.S.k = 'ok';
      eng.S.msg = `صحيح ✓ اكتب الآن ناتج الطرح ${r.cur} − ${r.prod}.`;
    } else {
      next(r);
      if (eng.S.phase === 'choose') { eng.S.msg = 'صحيح ✓ أنزلنا الرقم التالي. ' + eng.S.msg; eng.S.k = 'ok'; }
    }
    renderEngine();
  };

  const hint = () => {
    const eng = state.current;
    if (eng.S.phase !== 'choose') return;
    const r = cr(), t = eng.Dv / 10 | 0, f = r.cur / 10 | 0;
    eng.S.msg = r.cur < eng.Dv
      ? `${r.cur} أصغر من ${eng.Dv} ، فلا يدخل فيه ولا مرة. اكتب 0 في خارج القسمة.`
      : `عشرات المقسوم عليه = ${t}. نقسم أول رقمين من ${r.cur} أي ${f} على ${t} فيكون التقدير ${Math.min(9, f / t | 0)}. جرّبه، فقد يكون أكبر من اللازم بقليل.`;
    eng.S.k = 'hint';
    renderEngine();
  };

  const autoStep = () => {
    const eng = state.current;
    if (eng.S.phase === 'init') return;
    if (eng.S.phase === 'choose') {
      const r = cr();
      pick(Math.floor(r.cur / eng.Dv));
      setTimeout(() => {
        if (eng.T === 'prac' && eng.S.phase === 'ptype') { eng.S.buf = String(cr().prod); renderEngine(); }
      }, 350);
    } else if (eng.S.phase === 'ptype') {
      eng.S.buf = String(cr().prod); renderEngine(); setTimeout(conf, 300);
    } else if (eng.S.phase === 'rtype') {
      eng.S.buf = String(cr().rem); renderEngine(); setTimeout(conf, 300);
    } else if (eng.S.phase === 'mult' || eng.S.phase === 'sub') { go(); }
  };

  const newp = useCallback(() => start(rnd(1000, 9999), rnd(11, 99)), [start]);

  const changeTab = (t) => {
    const eng = state.current;
    if (t === eng.T) return;
    if (eng.S && eng.S.phase === 'trial') {
      clearInterval(eng.iv); eng.S.trial = null; eng.S.phase = 'choose'; chooseMsg();
    }
    if (eng.animTimer) {
      clearInterval(eng.animTimer); eng.S.phase = 'choose'; eng.S.animIndex = 999; chooseMsg();
    }
    savedStates.current[eng.T] = { S: eng.S, N: eng.N, Dv: eng.Dv, digs: eng.digs, n: eng.n, rows: eng.rows };
    
    eng.T = t;
    setTheme(t);
    document.body.dataset.t = t;
    
    const st = savedStates.current[t];
    if (st) {
      eng.S = st.S; eng.N = st.N; eng.Dv = st.Dv; eng.digs = st.digs; eng.n = st.n; eng.rows = st.rows;
    }
    eng.prevPhase = '';
    renderEngine();
  };

  // Modal Logic
  const openOwnModal = () => setOwnModal({ open: true, field: 'dvd', dvd: '', div: '' });
  const closeOwnModal = () => setOwnModal(prev => ({ ...prev, open: false }));
  
  const ownType = (d) => {
    setOwnModal(prev => {
      let limit = prev.field === 'dvd' ? 5 : 2;
      let val = prev[prev.field];
      if (val.length < limit) {
        if (val.length === 0 && d === '0') return prev;
        return { ...prev, [prev.field]: val + d };
      }
      return prev;
    });
  };
  
  const ownDel = () => setOwnModal(prev => ({ ...prev, [prev.field]: prev[prev.field].slice(0, -1) }));
  const ownClear = () => setOwnModal(prev => ({ ...prev, [prev.field]: '' }));
  const ownSwitch = (field) => setOwnModal(prev => ({ ...prev, field }));
  
  const ownStart = () => {
    let a = +ownModal.dvd;
    let b = +ownModal.div;
    if (a >= 1000 && a <= 99999 && b >= 10 && b <= 99) {
      closeOwnModal();
      start(a, b);
    }
  };

  // Initialization
  useEffect(() => {
    const eng = state.current;
    document.body.dataset.t = 'learn';
    eng.T = 'prac';
    start(rnd(1000, 9999), rnd(11, 99));
    savedStates.current['prac'] = { S: eng.S, N: eng.N, Dv: eng.Dv, digs: eng.digs, n: eng.n, rows: eng.rows };
    eng.T = 'learn';
    start(rnd(1000, 9999), rnd(11, 99));

    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [start, fit]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <header>
        <span className="brand">EduMAS <sup>2026</sup></span>
        <h1>القسمة المطولة – الصف الخامس</h1>
      </header>
      <div className="tabs">
        <button className={`tab ${theme === 'learn' ? 'on' : ''}`} onClick={() => changeTab('learn')}>📖 شرح خطوة بخطوة</button>
        <button className={`tab ${theme === 'prac' ? 'on' : ''}`} onClick={() => changeTab('prac')}>✍️ تدريب وحل ذاتي</button>
      </div>

      <div id="main">
        <p id="msg" className={msgClass} dangerouslySetInnerHTML={{ __html: msgHtml }}></p>
        <div id="bd" ref={bdRef}>
          <div id="board" dangerouslySetInnerHTML={{ __html: boardHtml }}></div>
        </div>

        <div id="controls">
          <div id="numPad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(i => (
              <button
                key={i}
                disabled={buttonsState.numpadDisabled}
                className={buttonsState.numpadActive ? 'active' : ''}
                onClick={() => state.current.S.phase === 'choose' ? pick(i) : type(String(i))}
              >
                {i}
              </button>
            ))}
          </div>
          <div id="actionCol">
            <button id="stepBtn" title="خطوة تلقائية" style={{ display: theme === 'prac' ? 'block' : 'none' }} disabled={buttonsState.stepDisabled} onClick={autoStep}>⏭ خطوة</button>
            <button className="go" id="go" style={{ visibility: buttonsState.goVisible ? 'visible' : 'hidden' }} onClick={() => theme === 'prac' ? conf() : go()}>
              {buttonsState.goText || '.'}
            </button>
            <button id="del" style={{ display: buttonsState.delVisible ? 'block' : 'none', visibility: buttonsState.delVisible ? 'visible' : 'hidden' }} onClick={() => { state.current.S.buf = state.current.S.buf.slice(0, -1); renderEngine(); }}>⌫</button>
          </div>
          <div id="bottomBar">
            <button id="hint" disabled={buttonsState.hintDisabled} onClick={hint}>💡 تلميح</button>
            <button id="again" onClick={() => start(state.current.N, state.current.Dv)}>↻ إعادة</button>
            <button id="newp" onClick={newp}>🎲 جديدة</button>
            <button id="ownBtn" onClick={openOwnModal}>✎ مسألتي</button>
          </div>
          <div id="genBar">
            <button className="gen4" onClick={() => start(rnd(1000, 9999), rnd(11, 99))}>4 أرقام (آلاف)</button>
            <button className="gen5" onClick={() => start(rnd(10000, 99999), rnd(11, 99))}>5 أرقام (عشرات الآلاف)</button>
          </div>
          <div className="stats">
            <span>✅ محلولة: <b>{stats.solved}</b></span>
            <span>❌ أخطاء: <b>{stats.totalMist}</b></span>
          </div>
        </div>
      </div>

      {ownModal.open && (
        <div id="ownModal" style={{ display: 'flex' }}>
          <div className="own-box">
            <div className="own-header">إدخال مسألة جديدة</div>
            <div className="own-inputs">
              <div className="own-input-group">
                <div className="own-label">المقسوم عليه (رقمين)</div>
                <div className={`own-input-box ${ownModal.field === 'div' ? 'active' : ''}`} onClick={() => ownSwitch('div')}>
                  <span className="own-input-val">{ownModal.div || '_'}</span>
                </div>
              </div>
              <div className="own-input-group" style={{ flex: 1.5 }}>
                <div className="own-label">المقسوم (4-5 أرقام)</div>
                <div className={`own-input-box ${ownModal.field === 'dvd' ? 'active' : ''}`} onClick={() => ownSwitch('dvd')}>
                  <span className="own-input-val">{ownModal.dvd || '_'}</span>
                </div>
              </div>
            </div>
            
            <div className="own-numpad">
              {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map(d => (
                <button key={d} onClick={() => ownType(d)}>{d}</button>
              ))}
              <button className="cmd-c" onClick={ownClear}>C</button>
              <button onClick={() => ownType('0')}>0</button>
              <button className="cmd-del" onClick={ownDel}>⌫</button>
            </div>
            
            <div className="own-actions">
              <button id="ownStart" disabled={!(ownModal.dvd.length >= 4 && ownModal.dvd.length <= 5 && ownModal.div.length === 2)} onClick={ownStart}>✓ ابدأ الحل</button>
              <button id="ownCancel" onClick={closeOwnModal}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
