/* ============================================================
   ch02-signed-integers.js — Demos 2.1, 2.2, 2.3
   Depends on: bits.js (BC, clamp, makeIndexRow, renderBitRow,
               toBin, toSigned, svgEl, circleX, circleY,
               clockNodeColors)
   ============================================================ */

// Unsigned weights for each bit position (index 0 = bit 7, MSB / sign bit)
const CH2_UNSIGNED_WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

let ch2Value = 0;       // signed, range [−128, 127]
let ch2ContribCells = [];

/* ── ch2Insight(v) ─────────────────────────────────────────────
   Returns an HTML string describing the value with a contextual
   note. Called by ch2Render to populate the result-explain area.
---------------------------------------------------------------- */
function ch2Insight(v) {
  if (v === 0)    return 'Zero. Unique all-zeros pattern.';
  if (v === 127)  return 'Maximum positive. Sign bit off; all others on: 64+32+\u2026+1\u00a0= 127.';
  if (v === -128) return 'Minimum. Only the sign bit on: just \u2212128, nothing added back.';
  if (v === -1)   return 'All bits on: \u2212128\u00a0+\u00a0127\u00a0=\u00a0\u22121. All-ones means \u22121, not 255.';
  if (v < 0) {
    const pos = v + 128;
    return `Sign bit contributes \u2212128, positive bits add back <span class="term-active">${pos}</span>, giving <span class="term-active">${v}</span>.`;
  }
  return `Sign bit off \u2014 value <span class="term-active">${v}</span> reads the same as unsigned.`;
}

/* ── ch2Render() ────────────────────────────────────────────── */
function ch2Render() {
  // Unsigned view of the current signed value
  const u = ch2Value & 0xFF;

  // ── Bit row ────────────────────────────────────────────────
  renderBitRow(
    document.getElementById('ch2-bit-row'),
    u,
    8,
    (i, v) => i === 0 ? (v ? BC.SIGN : BC.ZERO) : (v ? BC.ONE : BC.ZERO),
    (i) => {
      const toggled = (ch2Value & 0xFF) ^ (1 << (7 - i));
      ch2Value = toggled > 127 ? toggled - 256 : toggled;
      ch2Render();
    }
  );

  // ── Contribution cells ─────────────────────────────────────
  const signOn = ch2Value < 0 ? 1 : 0;
  for (let i = 0; i < 8; i++) {
    const bitOn = i === 0
      ? signOn
      : (u >>> (7 - i)) & 1;
    ch2ContribCells[i].classList.toggle('zero', !bitOn);
  }

  // ── Formula bar ────────────────────────────────────────────
  const terms = CH2_UNSIGNED_WEIGHTS.map((w, i) => {
    if (i === 0) {
      // Sign bit term: −b₇·128
      const on = signOn;
      return on
        ? `<span style="color:var(--red-text);font-weight:600">\u22121\u00d7128</span>`
        : `<span style="color:var(--text-muted);opacity:0.45">\u22120\u00d7128</span>`;
    } else {
      const bitOn = (u >>> (7 - i)) & 1;
      return bitOn
        ? `<span style="color:var(--blue-text);font-weight:600">+1\u00d7${w}</span>`
        : `<span style="color:var(--text-muted);opacity:0.45">+0\u00d7${w}</span>`;
    }
  });
  document.getElementById('ch2-formula').innerHTML = terms.join(' ');

  // ── Result value ───────────────────────────────────────────
  const resultEl = document.getElementById('ch2-result-value');
  resultEl.textContent = ch2Value;
  resultEl.style.color = ch2Value < 0 ? 'var(--red-text)' : 'var(--blue-text)';

  // ── Contextual insight ─────────────────────────────────────
  document.getElementById('ch2-result-explain').innerHTML = ch2Insight(ch2Value);
}

/* ── ch2SetVal(n) ───────────────────────────────────────────── */
function ch2SetVal(n) {
  ch2Value = clamp(n, -128, 127);
  ch2Render();
}

/* ============================================================
   Demo 2.2 (clock): Two's Complement Interactive Clock
   Shows all 16 four-bit signed integers on a clock face.
   Uses: svgEl, circleX, circleY, clockNodeColors, toSigned,
         toBin, renderBitRow, BC  (all from bits.js)
   ============================================================ */

const CLOCK_CX          = 340;
const CLOCK_CY          = 268;
const CLOCK_R_OUTER     = 210;
const CLOCK_R_TICK_OUT  = 200;
const CLOCK_R_TICK_IN   = 188;
const CLOCK_R_TICK_LAND = 184;
const CLOCK_R_DOT       = 152;
const CLOCK_R_BIN       = 172; // bit-pattern label radius, just outside dots

let ch2ClockIdx = 0; // unsigned 0..15 for the currently selected node

/* i=0 → −90° (top), i=4 → 0° (right), i=8 → 90° (bottom), i=12 → 180° (left) */
function ch2ClockAngleDeg(i) { return (i / 16) * 360 - 90; }

function ch2BuildClock() {
  const svg = document.getElementById('ch2-clock-svg');
  svg.innerHTML = '';
  const sel = ch2ClockIdx;

  // Coordinate shortcuts
  const dotX = (i) => circleX(CLOCK_CX, CLOCK_R_DOT, ch2ClockAngleDeg(i));
  const dotY = (i) => circleY(CLOCK_CY, CLOCK_R_DOT, ch2ClockAngleDeg(i));

  // ── 1. Background sector arcs ─────────────────────────────
  // Right half (positive, i=0..7): blue.  Left half (negative, i=8..15): red.
  // Split at top (i=0) and bottom (i=8). Two 90° segments per half to avoid
  // SVG arc ambiguity when start and end points are diametrically opposite.
  const R  = CLOCK_R_OUTER;
  const T  = [CLOCK_CX,     CLOCK_CY - R]; // top
  const Rt = [CLOCK_CX + R, CLOCK_CY    ]; // right
  const B  = [CLOCK_CX,     CLOCK_CY + R]; // bottom
  const Lt = [CLOCK_CX - R, CLOCK_CY    ]; // left

  svg.appendChild(svgEl('path', {
    d: `M ${CLOCK_CX} ${CLOCK_CY} L ${T[0]} ${T[1]} A ${R} ${R} 0 0 1 ${Rt[0]} ${Rt[1]} A ${R} ${R} 0 0 1 ${B[0]} ${B[1]} Z`,
    fill: 'var(--blue-bg)'
  }));
  svg.appendChild(svgEl('path', {
    d: `M ${CLOCK_CX} ${CLOCK_CY} L ${B[0]} ${B[1]} A ${R} ${R} 0 0 1 ${Lt[0]} ${Lt[1]} A ${R} ${R} 0 0 1 ${T[0]} ${T[1]} Z`,
    fill: 'var(--red-bg)'
  }));

  // ── 2. Outer ring ─────────────────────────────────────────
  svg.appendChild(svgEl('circle', {
    cx: CLOCK_CX, cy: CLOCK_CY, r: R,
    fill: 'none', stroke: 'var(--border)', 'stroke-width': '1'
  }));

  // ── 3. Inner dashed reference circle ─────────────────────
  svg.appendChild(svgEl('circle', {
    cx: CLOCK_CX, cy: CLOCK_CY, r: CLOCK_R_DOT,
    fill: 'none', stroke: 'var(--border)',
    'stroke-width': '0.5', 'stroke-dasharray': '4 4'
  }));

  // ── 4. Crosshair guide lines ──────────────────────────────
  const d = { stroke: 'var(--border)', 'stroke-width': '0.5', 'stroke-dasharray': '4 4' };
  svg.appendChild(svgEl('line', { x1: CLOCK_CX - R, y1: CLOCK_CY, x2: CLOCK_CX + R, y2: CLOCK_CY, ...d }));
  svg.appendChild(svgEl('line', { x1: CLOCK_CX, y1: CLOCK_CY - R, x2: CLOCK_CX, y2: CLOCK_CY + R, ...d }));

  // ── 5. Quadrant labels and centre text ────────────────────
  const lbl = (x, y, text, fill, size = '11') => svgEl('text', {
    x, y, fill, 'font-family': 'sans-serif', 'font-size': size,
    'text-anchor': 'middle', 'dominant-baseline': 'central', textContent: text
  });
  svg.appendChild(lbl(CLOCK_CX + 70, CLOCK_CY - 8, 'positive',    'var(--blue-text)'));
  svg.appendChild(lbl(CLOCK_CX - 70, CLOCK_CY - 8, 'negative',    'var(--red-text)'));
  svg.appendChild(lbl(CLOCK_CX,      CLOCK_CY + 8, '4-bit signed','var(--text-muted)', '10'));

  // ── 6. Overflow seam at bottom ───────────────────────────
  svg.appendChild(svgEl('line', {
    x1: CLOCK_CX - 6, y1: CLOCK_CY + R - 8,
    x2: CLOCK_CX + 6, y2: CLOCK_CY + R + 8,
    stroke: 'var(--amber-text)', 'stroke-width': '2', 'stroke-dasharray': '3 3'
  }));
  svg.appendChild(lbl(CLOCK_CX + 38, CLOCK_CY + R + 4, 'overflow', 'var(--amber-text)', '10'));

  // ── 7. Nodes (tick + binary label + clickable dot) ────────
  for (let i = 0; i < 16; i++) {
    const signedVal  = toSigned(i, 4);
    const angleDeg   = ch2ClockAngleDeg(i);
    const nodeX      = circleX(CLOCK_CX, CLOCK_R_DOT, angleDeg);
    const nodeY      = circleY(CLOCK_CY, CLOCK_R_DOT, angleDeg);
    const isLandmark = (i === 0 || i === 8);
    const isSelected = (i === sel);

    // Tick mark
    const tickR = isLandmark ? CLOCK_R_TICK_LAND : CLOCK_R_TICK_IN;
    svg.appendChild(svgEl('line', {
      x1: circleX(CLOCK_CX, CLOCK_R_TICK_OUT, angleDeg),
      y1: circleY(CLOCK_CY, CLOCK_R_TICK_OUT, angleDeg),
      x2: circleX(CLOCK_CX, tickR, angleDeg),
      y2: circleY(CLOCK_CY, tickR, angleDeg),
      stroke: 'var(--border)', 'stroke-width': isLandmark ? '2' : '1'
    }));

    // Binary label (between dot edge and tick marks)
    svg.appendChild(svgEl('text', {
      x: circleX(CLOCK_CX, CLOCK_R_BIN, angleDeg),
      y: circleY(CLOCK_CY, CLOCK_R_BIN, angleDeg),
      'text-anchor': 'middle', 'dominant-baseline': 'central',
      fill: 'var(--text-muted)',
      'font-family': 'monospace', 'font-size': '10',
      textContent: toBin(i, 4)
    }));

    // Clickable node group
    const g      = svgEl('g', { cursor: 'pointer' });
    const colors = isSelected
      ? { fill: '#EF9F27', stroke: '#EF9F27', text: '#412402' }
      : clockNodeColors(signedVal);
    const dotR      = isLandmark ? 14 : 11;
    const fontSize  = isLandmark ? '13' : '12';
    const fontWeight = isLandmark ? '500' : '400';

    const dotEl = svgEl('circle', {
      cx: nodeX, cy: nodeY, r: dotR,
      fill: colors.fill, stroke: colors.stroke, 'stroke-width': '1'
    });
    g.appendChild(dotEl);
    g.appendChild(svgEl('text', {
      x: nodeX, y: nodeY,
      'text-anchor': 'middle', 'dominant-baseline': 'central',
      fill: colors.text,
      'font-family': 'monospace', 'font-size': fontSize, 'font-weight': fontWeight,
      textContent: String(signedVal)
    }));

    // Hover: enlarge dot on non-selected nodes
    if (!isSelected) {
      g.addEventListener('mouseenter', () => {
        dotEl.setAttribute('r', 14);
        dotEl.setAttribute('stroke-width', '1.5');
      });
      g.addEventListener('mouseleave', () => {
        dotEl.setAttribute('r', dotR);
        dotEl.setAttribute('stroke-width', '1');
      });
    }
    g.addEventListener('click', () => ch2ClockSelect(i));
    svg.appendChild(g);
  }

  // ── 8. Selection ring (drawn last, always on top) ─────────
  svg.appendChild(svgEl('circle', {
    cx: dotX(sel), cy: dotY(sel), r: 18,
    fill: 'none', stroke: '#EF9F27', 'stroke-width': '2.5'
  }));
}

function ch2ClockUpdatePanel() {
  const idx    = ch2ClockIdx;
  const signed = toSigned(idx, 4);

  // Metric cards
  const decEl = document.getElementById('ch2-clock-decimal');
  decEl.textContent  = signed;
  decEl.style.color  = signed < 0 ? 'var(--red-text)'
                     : signed === 0 ? 'var(--zero-text)'
                     : 'var(--blue-text)';
  document.getElementById('ch2-clock-unsigned').textContent = idx;
  document.getElementById('ch2-clock-hex').textContent = '0x' + idx.toString(16).toUpperCase();

  // 4-bit row: sign bit red, value bits blue/grey
  renderBitRow(
    document.getElementById('ch2-clock-bits'), idx, 4,
    (i, v) => i === 0 ? (v ? BC.SIGN : BC.ZERO) : (v ? BC.ONE : BC.ZERO),
    null
  );

  // Contextual hint
  const hintMap = new Map([
    [ 0, 'Zero \u2014 the only value with this bit pattern in both signed and unsigned.'],
    [ 7, 'Maximum positive 4-bit value. Sign bit\u00a0=\u00a00, all others\u00a0=\u00a01.'],
    [-8, 'Minimum \u2014 only the sign bit set. No positive counterpart.'],
    [-1, 'All bits on: \u22128\u00a0+\u00a04\u00a0+\u00a02\u00a0+\u00a01\u00a0=\u00a0\u22121. All-ones always means \u22121 in two\u2019s complement.'],
  ]);

  let hint;
  if (hintMap.has(signed)) {
    hint = hintMap.get(signed);
  } else if (signed > 0) {
    const terms = [];
    for (let k = 2; k >= 0; k--) { if ((idx >> k) & 1) terms.push(1 << k); }
    hint = `Positive: sign bit is 0. Value\u00a0=\u00a0${terms.join('\u00a0+\u00a0')}.`;
  } else {
    hint = `Negative: sign bit contributes \u22128. Remaining bits add back ${signed + 8}, giving ${signed}.`;
  }
  document.getElementById('ch2-clock-hint').textContent = hint;

  // Nav label
  document.getElementById('ch2-clock-nav-label').textContent = `${signed} of 16`;
}

function ch2ClockSelect(i) {
  ch2ClockIdx = ((i % 16) + 16) % 16;
  ch2BuildClock();
  ch2ClockUpdatePanel();
}

function ch2ClockPrev() { ch2ClockSelect(ch2ClockIdx - 1); }
function ch2ClockNext() { ch2ClockSelect(ch2ClockIdx + 1); }

/* ============================================================
   Demo 2.3: Flip-and-Add-1 Negation (stepped)
   ch2NegStep: 0 = show x only, 1 = show ~x, 2 = show result
   ============================================================ */

let ch2NegValue = 42;
let ch2NegStep  = 0;

function ch2NegInsight(x, result) {
  if (x === 0)
    return 'Negating zero gives zero. The carry out of bit\u00a07 is silently discarded.';
  if (x === -128)
    return '\u2212128 has no positive counterpart in 8 bits. The result overflows back to \u2212128.';
  const notXU = (~x) & 0xFF;
  const notXSigned = notXU > 127 ? notXU - 256 : notXU;
  const color = (v) => v < 0 ? 'var(--red-text)' : 'var(--blue-text)';
  const span  = (v) => `<span style="color:${color(v)};font-family:monospace;font-weight:500">${v}</span>`;
  return `~${span(x)} = ${span(notXSigned)}, then +1 gives ${span(result)}.`;
}

function ch2NegRender() {
  const x     = ch2NegValue;
  const xU    = x & 0xFF;            // unsigned 8-bit pattern of x
  const notXU = (~x) & 0xFF;         // ~x, unsigned
  const resU  = (notXU + 1) & 0xFF;  // ~x + 1, masked to 8 bits
  const result = resU > 127 ? resU - 256 : resU;

  // ── Locate carry stop ─────────────────────────────────────
  // Adding 1 to notXU: carry propagates through trailing 1-bits in notXU.
  // carryStop = bit position of the lowest 0-bit in notXU (absorbs carry).
  // -1 means notXU = 0xFF (all ones, i.e. x = 0): every bit carries out.
  let carryStop = -1;
  for (let bit = 0; bit < 8; bit++) {
    if (((notXU >> bit) & 1) === 0) { carryStop = bit; break; }
  }

  const notXSigned = notXU > 127 ? notXU - 256 : notXU;

  // ── Row 1: x (always visible) ────────────────────────────
  renderBitRow(
    document.getElementById('ch2-neg-row-x'), xU, 8,
    (i, v) => i === 0 ? (v ? BC.SIGN : BC.ZERO) : (v ? BC.ONE : BC.ZERO),
    null
  );
  document.getElementById('ch2-neg-val-x').textContent = x;

  // ── Row 2: ~x (visible from step 1) ──────────────────────
  const row2 = document.getElementById('ch2-neg-row2-wrap');
  row2.style.display = ch2NegStep >= 1 ? '' : 'none';
  if (ch2NegStep >= 1) {
    renderBitRow(
      document.getElementById('ch2-neg-row-notx'), notXU, 8,
      (i, v) => v ? BC.FLIP : BC.ZERO,
      null
    );
    document.getElementById('ch2-neg-val-notx').textContent = notXSigned;
  }

  // ── Row 3: ~x + 1 (visible from step 2) ──────────────────
  // Bits 0..carryStop changed during the +1; highlight them amber.
  const row3 = document.getElementById('ch2-neg-row3-wrap');
  row3.style.display = ch2NegStep >= 2 ? '' : 'none';
  if (ch2NegStep >= 2) {
    renderBitRow(
      document.getElementById('ch2-neg-row-result'), resU, 8,
      (i, v) => {
        const bitPos = 7 - i; // 0 = LSB
        const affected = carryStop === -1 ? true : bitPos <= carryStop;
        if (affected) return BC.TARGET;
        if (i === 0)  return v ? BC.SIGN : BC.ZERO;
        return v ? BC.ONE : BC.ZERO;
      },
      null
    );
    document.getElementById('ch2-neg-val-result').textContent = result;
  }

  // ── Result box (visible from step 2) ─────────────────────
  const resultBox = document.getElementById('ch2-neg-result-box');
  resultBox.style.display = ch2NegStep >= 2 ? '' : 'none';
  if (ch2NegStep >= 2) {
    const resultEl = document.getElementById('ch2-neg-result-value');
    resultEl.textContent = result;
    resultEl.style.color = result < 0 ? 'var(--red-text)' : 'var(--blue-text)';
    document.getElementById('ch2-neg-result-explain').innerHTML = ch2NegInsight(x, result);
  }

  // ── Step button label ─────────────────────────────────────
  const btn = document.getElementById('ch2-neg-step-btn');
  if (ch2NegStep === 0) btn.textContent = 'Flip all bits \u2192';
  if (ch2NegStep === 1) btn.textContent = 'Add 1 \u2192';
  if (ch2NegStep === 2) btn.textContent = '\u21ba Start over';

  // ── Formula bar ──────────────────────────────────────────
  const fbar = document.getElementById('ch2-neg-formula');
  if (ch2NegStep === 0) {
    fbar.innerHTML = `x = ${x} = ${toBin(xU, 8)}`;
  } else if (ch2NegStep === 1) {
    fbar.innerHTML =
      `~(${toBin(xU, 8)}) = ${toBin(notXU, 8)} = ${notXSigned}`;
  } else {
    fbar.innerHTML =
      `~(${toBin(xU, 8)}) + 1 &nbsp;=&nbsp; ` +
      `${toBin(notXU, 8)} + 1 &nbsp;=&nbsp; ` +
      `<strong>${toBin(resU, 8)}</strong>`;
  }
}

function ch2NegAdvance() {
  ch2NegStep = ch2NegStep < 2 ? ch2NegStep + 1 : 0;
  ch2NegRender();
}

function ch2NegSetVal(n) {
  ch2NegValue = clamp(n, -128, 127);
  ch2NegStep  = 0;
  ch2NegRender();
}

/* ── ch2Init() ──────────────────────────────────────────────── */
function ch2Init() {
  // ── Place value row (static, built once) ──────────────────
  const placeRow = document.getElementById('ch2-place-row');
  for (let i = 0; i < 8; i++) {
    const cell = document.createElement('div');
    cell.className = 'place-cell';
    if (i === 0) {
      cell.innerHTML =
        `<span class="power" style="color:var(--red-text)">\u22122<sup>7</sup></span>` +
        `<span class="pvalue" style="color:var(--red-text)">\u2212128</span>`;
    } else {
      cell.innerHTML =
        `<span class="power">2<sup>${7 - i}</sup></span>` +
        `<span class="pvalue">${CH2_UNSIGNED_WEIGHTS[i]}</span>`;
    }
    placeRow.appendChild(cell);
  }

  // ── Index row (static) ────────────────────────────────────
  makeIndexRow(document.getElementById('ch2-index-row'), 8);

  // ── Contribution row (cells built once, toggled on update) ─
  const contribRow = document.getElementById('ch2-contrib-row');
  for (let i = 0; i < 8; i++) {
    const cell = document.createElement('div');
    cell.className = 'contrib-cell zero';
    if (i === 0) {
      cell.textContent = '\u2212128';
      cell.style.color = 'var(--red-text)';
    } else {
      cell.textContent = `+${CH2_UNSIGNED_WEIGHTS[i]}`;
    }
    ch2ContribCells.push(cell);
    contribRow.appendChild(cell);
  }

  // ── Initial render ────────────────────────────────────────
  ch2Render();
  ch2ClockSelect(0);
  ch2NegRender();
}

document.addEventListener('DOMContentLoaded', ch2Init);
