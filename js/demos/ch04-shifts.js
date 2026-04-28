/* ============================================================
   Chapter 4 — Bit Shifts
   Demo 4.1: Left Shift visualizer
   Demo 4.2: Right Shift visualizer (logical >>> · arithmetic >>)
   ============================================================ */

/* ── Demo 4.1 — Left Shift ──────────────────────────────── */

let ch4LValue = 3;   // matches prose example: 3 << 2 = 12
let ch4LShift = 2;

function ch4LRender() {
  const A      = ch4LValue;
  const n      = ch4LShift;
  const result = (A << n) & 0xFF;

  renderBitRow(
    document.getElementById('ch4l-a-row'),
    A, 8,
    (i, v) => {
      if (n === 0) return v ? BC.ONE : BC.ZERO;
      const bitPos = 7 - i;
      if (bitPos >= (8 - n)) return BC.CLEAR;
      return v ? BC.ONE : BC.ZERO;
    },
    (i) => {
      ch4LValue = ch4LValue ^ (1 << (7 - i));
      ch4LRender();
    }
  );

  renderBitRow(
    document.getElementById('ch4l-result-row'),
    result, 8,
    (i, v) => {
      if (n === 0) return BC.PASS;
      const bitPos = 7 - i;
      return bitPos < n ? BC.ZERO : BC.PASS;
    },
    null
  );

  document.getElementById('ch4l-a-val').textContent            = A;
  document.getElementById('ch4l-result-val-label').textContent = result;
  document.getElementById('ch4l-formula').textContent =
    `${A} << ${n}  =  ${result}   (0b${toBin(A,8)} << ${n} = 0b${toBin(result,8)})`;

  const rv = document.getElementById('ch4l-result-value');
  rv.textContent = result;
  rv.style.color = 'var(--blue-text)';

  document.getElementById('ch4l-result-explain').textContent = ch4LInsight(A, n, result);

  document.getElementById('ch4l-a-num').value        = A;
  document.getElementById('ch4l-shift-num').value    = n;
  document.getElementById('ch4l-shift-slider').value = n;
}

function ch4LInsight(A, n, result) {
  if (n === 0) return 'Shift by 0: value unchanged.';
  const expected = A * Math.pow(2, n);
  const overflow = (A >> (8 - n)) !== 0;
  if (overflow) {
    return `Overflow: the ${n} high bit${n > 1 ? 's' : ''} that shifted out were non-zero. ` +
           `Mathematical result would be ${expected}, but the 8-bit value truncates to ${result}.`;
  }
  return `${A} \u00d7 ${Math.pow(2, n)} = ${result}. ` +
         `No overflow \u2014 the top ${n} bit${n > 1 ? 's' : ''} that shifted out were all 0.`;
}

function ch4LSetVal(n)       { ch4LValue = clamp(Math.round(n), 0, 255); ch4LRender(); }
function ch4LSetShift(n)     { ch4LShift = clamp(Math.round(n), 0, 7);   ch4LRender(); }
function ch4LSliderInput(n)  { ch4LShift = clamp(n, 0, 7);               ch4LRender(); }

function ch4LPreset(name) {
  const presets = {
    x2:             [1,   1],
    x4:             [3,   2],
    overflow:       [200, 2],
    clearlowerbits: [0b10110111, 4],
  };
  [ch4LValue, ch4LShift] = presets[name];
  ch4LRender();
}


/* ── Demo 4.2 — Right Shift ─────────────────────────────── */

let ch4RValue = 128;
let ch4RShift = 1;
let ch4RMode  = 'lsr'; // 'lsr' | 'asr'

function ch4RRender() {
  const A      = ch4RValue;
  const n      = ch4RShift;
  const result = ch4RMode === 'lsr'
    ? (A >>> n) & 0xFF
    : (toSigned(A, 8) >> n) & 0xFF;

  const signedA      = toSigned(A, 8);
  const signedResult = toSigned(result, 8);

  renderBitRow(
    document.getElementById('ch4r-a-row'),
    A, 8,
    (i, v) => {
      if (n === 0) return v ? BC.ONE : BC.ZERO;
      const bitPos = 7 - i;
      return bitPos < n ? BC.CLEAR : (v ? BC.ONE : BC.ZERO);
    },
    (i) => {
      ch4RValue = ch4RValue ^ (1 << (7 - i));
      ch4RRender();
    }
  );

  renderBitRow(
    document.getElementById('ch4r-result-row'),
    result, 8,
    (i, v) => {
      if (n === 0) return BC.PASS;
      const bitPos = 7 - i;
      if (bitPos >= (8 - n)) {
        if (ch4RMode === 'lsr') return BC.ZERO;
        return ((A >> 7) & 1) ? BC.SIGN : BC.ZERO;
      }
      return BC.PASS;
    },
    null
  );

  const op = ch4RMode === 'lsr' ? '>>>' : '>>';
  const displayResult = ch4RMode === 'asr' ? signedResult : result;

  document.getElementById('ch4r-result-label').textContent = `A ${op} n`;

  const displayA = ch4RMode === 'asr' ? signedA : A;
  document.getElementById('ch4r-a-val').textContent            = displayA;
  document.getElementById('ch4r-result-val-label').textContent = displayResult;
  document.getElementById('ch4r-formula').textContent =
    `${displayA} ${op} ${n}  =  ${displayResult}   (0b${toBin(A,8)} ${op} ${n} = 0b${toBin(result,8)})`;

  const rv = document.getElementById('ch4r-result-value');
  rv.textContent = displayResult;
  rv.style.color = (ch4RMode === 'asr' && signedResult < 0)
    ? 'var(--red-text)' : 'var(--blue-text)';

  document.getElementById('ch4r-result-explain').textContent =
    ch4RInsight(A, n, result, signedA, signedResult);

  document.getElementById('ch4r-a-num').value        = displayA;
  document.getElementById('ch4r-shift-num').value    = n;
  document.getElementById('ch4r-shift-slider').value = n;
}

function ch4RInsight(A, n, result, signedA, signedResult) {
  if (n === 0) return 'Shift by 0: value unchanged.';
  if (ch4RMode === 'lsr') {
    return `${A} \u00f7 ${Math.pow(2, n)} = ${result} (integer, rounds toward zero). ` +
           `Logical shift: vacated positions filled with 0 regardless of sign.`;
  }
  const signBit = (A >> 7) & 1;
  if (signBit) {
    return `${signedA} \u00f7 ${Math.pow(2, n)} = ${signedResult} (rounds toward \u2212\u221e). ` +
           `Sign bit is 1, so ${n} vacated position${n > 1 ? 's are' : ' is'} filled with 1.`;
  }
  return `${signedA} \u00f7 ${Math.pow(2, n)} = ${signedResult}. ` +
         `Sign bit is 0, so fill is also 0 \u2014 identical to a logical right shift for positive values.`;
}

function ch4RSetVal(n) {
  const v = Math.round(n);
  ch4RValue = ch4RMode === 'asr'
    ? clamp(v, -128, 127) & 0xFF   // convert signed input to unsigned storage
    : clamp(v, 0, 255);
  ch4RRender();
}
function ch4RSetShift(n)    { ch4RShift = clamp(Math.round(n), 0, 7);   ch4RRender(); }
function ch4RSliderInput(n) { ch4RShift = clamp(n, 0, 7);               ch4RRender(); }

function ch4RUpdateInputRange() {
  const input = document.getElementById('ch4r-a-num');
  if (ch4RMode === 'asr') { input.min = -128; input.max = 127; }
  else                    { input.min = 0;    input.max = 255; }
}

function ch4RSetMode(m) {
  ch4RMode = m;
  document.querySelectorAll('.ch4r-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === m);
  });
  ['lsr', 'asr'].forEach(mode => {
    document.getElementById(`ch4r-preset-row-${mode}`).style.display =
      mode === m ? '' : 'none';
  });
  ch4RUpdateInputRange();
  ch4RRender();
}

function ch4RPreset(name) {
  const presets = {
    div2:           ['lsr', 100, 1],
    div4:           ['lsr', 100, 2],
    extractupper:   ['lsr', 0b11110000, 4],
    signeddiv2:     ['asr', 0b11000000, 1],
    allones:        ['asr', 255, 3],
    positive:       ['asr', 64,  2],
    min:            ['asr', 0b10000000, 1],
  };
  const [mode, val, shift] = presets[name];
  ch4RMode  = mode;
  ch4RValue = val;
  ch4RShift = shift;
  document.querySelectorAll('.ch4r-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });
  ['lsr', 'asr'].forEach(m => {
    document.getElementById(`ch4r-preset-row-${m}`).style.display =
      m === mode ? '' : 'none';
  });
  ch4RUpdateInputRange();
  ch4RRender();
}


/* ── Init ────────────────────────────────────────────────── */

function ch4Init() {
  renderIndexRow(document.getElementById('ch4l-index-row'), 8);
  renderIndexRow(document.getElementById('ch4r-index-row'), 8);
  ch4LRender();
  ch4RUpdateInputRange();
  ch4RRender();
}

document.addEventListener('DOMContentLoaded', ch4Init);
