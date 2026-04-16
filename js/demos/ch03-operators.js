/* ============================================================
   Chapter 3 — Bitwise Operators
   Demos: 3.1 AND · 3.2 OR · 3.3 XOR · 3.4 NOT
   ============================================================ */

/* ── Demo 3.4 — NOT ─────────────────────────────────────── */

let ch3NotA = 0b10101010; // 170

function ch3NotRender() {
  const A      = ch3NotA;
  const result = (~A) & 0xFF;
  const signed = toSigned(result, 8);

  renderBitRow(
    document.getElementById('ch3-not-row-a'),
    A, 8, null, null
  );
  renderBitRow(
    document.getElementById('ch3-not-row-result'),
    result, 8,
    (i, v) => v ? BC.FLIP : BC.ZERO,
    null
  );

  document.getElementById('ch3-not-val-a').textContent      = A;
  document.getElementById('ch3-not-val-result').textContent = result;

  document.getElementById('ch3-not-formula').textContent =
    `~${A}  =  ${result} (unsigned)  =  ${signed} (signed)`;

  const rv = document.getElementById('ch3-not-result-value');
  rv.textContent = signed;
  rv.style.color = signed < 0 ? 'var(--red-text)' : 'var(--blue-text)';

  document.getElementById('ch3-not-result-explain').textContent =
    `~${A} = \u2212${A} \u2212 1 = ${signed}. Every bit is flipped.`;

  document.getElementById('ch3-not-a-num').value = A;
}

function ch3NotSetA(n) {
  ch3NotA = clamp(Math.round(n), 0, 255);
  ch3NotRender();
}


/* ── Demo 3.1 — AND ─────────────────────────────────────── */

let ch3AndA = 0b10101010; // 170 — alternating pattern
let ch3AndB = 0b00001111; //  15 — low nibble mask

function ch3AndRender() {
  const A      = ch3AndA;
  const B      = ch3AndB;
  const result = (A & B) & 0xFF;

  renderBitRow(document.getElementById('ch3-and-row-a'), A, 8, null, null);
  renderBitRow(document.getElementById('ch3-and-row-b'), B, 8, null, null);
  renderBitRow(
    document.getElementById('ch3-and-row-result'),
    result, 8,
    (i, v) => {
      const maskBit = (B >>> (7 - i)) & 1;
      const aBit    = (A >>> (7 - i)) & 1;
      if (!maskBit)        return BC.BLOCK;
      if (maskBit && aBit) return BC.PASS;
      return BC.ZERO;
    },
    null
  );

  document.getElementById('ch3-and-val-a').textContent      = A;
  document.getElementById('ch3-and-val-b').textContent      = B;
  document.getElementById('ch3-and-val-result').textContent = result;

  document.getElementById('ch3-and-formula').textContent =
    `${A} & ${B}  =  ${result}  (0b${toBin(A,8)} & 0b${toBin(B,8)} = 0b${toBin(result,8)})`;

  document.getElementById('ch3-and-result-value').textContent = result;
  document.getElementById('ch3-and-result-value').style.color = 'var(--blue-text)';

  // Insight
  let explain = '';
  if (B === 0) {
    explain = 'Mask is all zeros \u2014 every bit is blocked. Result is always 0.';
  } else if (B === 255) {
    explain = 'Mask is all ones \u2014 every bit passes through. Result equals A.';
  } else if (B === 1) {
    const isEven = (result === 0);
    explain = `Bit 0 is ${result & 1} \u2014 A is ${isEven ? 'even' : 'odd'}.`;
  } else if (B === A - 1 && A > 0) {
    explain = `n & (n\u22121): clears the lowest set bit of ${A}. Result = ${result}.`;
  } else {
    const passing = toBin(B, 8).split('').filter(c => c === '1').length;
    explain = `${passing} bit${passing !== 1 ? 's' : ''} can pass through the mask; the rest are blocked.`;
  }
  document.getElementById('ch3-and-result-explain').textContent = explain;

  document.getElementById('ch3-and-a-num').value = A;
  document.getElementById('ch3-and-b-num').value = B;
}

function ch3AndSetA(n) {
  ch3AndA = clamp(Math.round(n), 0, 255);
  ch3AndRender();
}

function ch3AndSetB(n) {
  ch3AndB = clamp(Math.round(n), 0, 255);
  ch3AndRender();
}

function ch3AndPreset(name) {
  const presets = {
    low4:  [0b10101010, 0b00001111], // 170, 15
    high4: [0b10101010, 0b11110000], // 170, 240
    even:  [42, 1],
    nn1:   [12, 11],
  };
  const [a, b] = presets[name];
  ch3AndA = a;
  ch3AndB = b;
  ch3AndRender();
}


/* ── Demo 3.2 — OR ──────────────────────────────────────── */

let ch3OrA = 0b01000001; //  65 — 'A'
let ch3OrB = 0b00100000; //  32 — 0x20

function ch3OrRender() {
  const A      = ch3OrA;
  const B      = ch3OrB;
  const result = (A | B) & 0xFF;

  renderBitRow(document.getElementById('ch3-or-row-a'), A, 8, null, null);
  renderBitRow(document.getElementById('ch3-or-row-b'), B, 8, null, null);
  renderBitRow(
    document.getElementById('ch3-or-row-result'),
    result, 8,
    (i, v) => {
      const maskBit = (B >>> (7 - i)) & 1;
      const aBit    = (A >>> (7 - i)) & 1;
      if (maskBit)          return BC.SET;
      if (!maskBit && aBit) return BC.PASS;
      return BC.ZERO;
    },
    null
  );

  document.getElementById('ch3-or-val-a').textContent      = A;
  document.getElementById('ch3-or-val-b').textContent      = B;
  document.getElementById('ch3-or-val-result').textContent = result;

  document.getElementById('ch3-or-formula').textContent =
    `${A} | ${B}  =  ${result}  (0b${toBin(A,8)} | 0b${toBin(B,8)} = 0b${toBin(result,8)})`;

  document.getElementById('ch3-or-result-value').textContent = result;
  document.getElementById('ch3-or-result-value').style.color = 'var(--blue-text)';

  // Insight
  let explain = '';
  if (B === 0) {
    explain = 'Mask is all zeros \u2014 no bits are forced on. Result equals A.';
  } else if (B === 255) {
    explain = 'Mask is all ones \u2014 every bit is forced to 1. Result is always 255.';
  } else if (B === 32 && A >= 65 && A <= 90) {
    const upper = String.fromCharCode(A);
    const lower = String.fromCharCode(result);
    explain = `\u2018${upper}\u2019 (${A}) | 0x20 = \u2018${lower}\u2019 (${result}). Setting bit 5 converts ASCII uppercase to lowercase.`;
  } else {
    const forced = toBin(B, 8).split('').filter(c => c === '1').length;
    explain = `${forced} bit${forced !== 1 ? 's' : ''} forced to 1 by the mask.`;
  }
  document.getElementById('ch3-or-result-explain').textContent = explain;

  document.getElementById('ch3-or-a-num').value = A;
  document.getElementById('ch3-or-b-num').value = B;
}

function ch3OrSetA(n) {
  ch3OrA = clamp(Math.round(n), 0, 255);
  ch3OrRender();
}

function ch3OrSetB(n) {
  ch3OrB = clamp(Math.round(n), 0, 255);
  ch3OrRender();
}

function ch3OrPreset(name) {
  const presets = {
    setbit0:    [42,  1],
    highnibble: [42,  240],
    lowercase:  [65,  32],
  };
  const [a, b] = presets[name];
  ch3OrA = a;
  ch3OrB = b;
  ch3OrRender();
}


/* ── Demo 3.3 — XOR ─────────────────────────────────────── */

let ch3XorA = 0b01000001; //  65 — 'A'
let ch3XorB = 0b00100000; //  32

function ch3XorRender() {
  const A      = ch3XorA;
  const B      = ch3XorB;
  const result = (A ^ B) & 0xFF;

  renderBitRow(document.getElementById('ch3-xor-row-a'), A, 8, null, null);
  renderBitRow(document.getElementById('ch3-xor-row-b'), B, 8, null, null);
  renderBitRow(
    document.getElementById('ch3-xor-row-result'),
    result, 8,
    (i, v) => {
      const maskBit = (B >>> (7 - i)) & 1;
      const aBit    = (A >>> (7 - i)) & 1;
      if (maskBit)          return BC.FLIP;
      if (!maskBit && aBit) return BC.PASS;
      return BC.ZERO;
    },
    null
  );

  document.getElementById('ch3-xor-val-a').textContent      = A;
  document.getElementById('ch3-xor-val-b').textContent      = B;
  document.getElementById('ch3-xor-val-result').textContent = result;

  document.getElementById('ch3-xor-formula').textContent =
    `${A} ^ ${B}  =  ${result}  (0b${toBin(A,8)} ^ 0b${toBin(B,8)} = 0b${toBin(result,8)})`;

  document.getElementById('ch3-xor-result-value').textContent = result;
  document.getElementById('ch3-xor-result-value').style.color = 'var(--blue-text)';

  // Insight
  let explain = '';
  if (A === B) {
    explain = 'A \u2295 A = 0. Every bit cancels its twin.';
  } else if (B === 255) {
    explain = 'Mask is all ones \u2014 every bit of A is flipped. Result = ~A (unsigned).';
  } else if (B === 32 && ((A >= 65 && A <= 90) || (A >= 97 && A <= 122))) {
    const from = String.fromCharCode(A);
    const to   = String.fromCharCode(result);
    explain = `\u2018${from}\u2019 (${A}) \u2295 0x20 = \u2018${to}\u2019 (${result}). XOR with bit 5 toggles ASCII letter case.`;
  } else {
    const flipped = toBin(B, 8).split('').filter(c => c === '1').length;
    explain = `${flipped} bit${flipped !== 1 ? 's' : ''} flipped by the mask; the rest pass through unchanged.`;
  }
  document.getElementById('ch3-xor-result-explain').textContent = explain;

  document.getElementById('ch3-xor-a-num').value = A;
  document.getElementById('ch3-xor-b-num').value = B;
}

function ch3XorSetA(n) {
  ch3XorA = clamp(Math.round(n), 0, 255);
  ch3XorRender();
}

function ch3XorSetB(n) {
  ch3XorB = clamp(Math.round(n), 0, 255);
  ch3XorRender();
}

function ch3XorPreset(name) {
  const presets = {
    flipall:    [42,  255],
    togglebit0: [42,  1],
    cancel:     [85,  85],
    caseflip:   [65,  32],
  };
  const [a, b] = presets[name];
  ch3XorA = a;
  ch3XorB = b;
  ch3XorRender();
}


/* ── Init ───────────────────────────────────────────────── */

function ch3Init() {
  renderIndexRow(document.getElementById('ch3-and-index-row'), 8);
  renderIndexRow(document.getElementById('ch3-or-index-row'),  8);
  renderIndexRow(document.getElementById('ch3-xor-index-row'), 8);
  renderIndexRow(document.getElementById('ch3-not-index-row'), 8);

  ch3NotRender();
  ch3AndRender();
  ch3OrRender();
  ch3XorRender();
}

document.addEventListener('DOMContentLoaded', ch3Init);
