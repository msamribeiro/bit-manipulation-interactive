/* ============================================================
   ch01-place-values.js — Demo 1.1: Binary Place Value Explorer
   Depends on: bits.js (BC, toBin, clamp, makeIndexRow, renderBitRow)
   ============================================================ */

const CH1_PLACE_VALUES = [128, 64, 32, 16, 8, 4, 2, 1]; // index 0 = bit 7 (MSB)

let ch1Value = 42;
let ch1ContribCells = [];

function ch1Render() {
  // ── Bit row ──────────────────────────────────────────────
  renderBitRow(
    document.getElementById('ch1-bit-row'),
    ch1Value,
    8,
    null, // default b-1 / b-0 colouring
    (i) => {
      ch1Value ^= (1 << (7 - i));
      ch1Render();
    }
  );

  // ── Contribution cells ───────────────────────────────────
  for (let i = 0; i < 8; i++) {
    const bitOn = (ch1Value >> (7 - i)) & 1;
    ch1ContribCells[i].classList.toggle('zero', !bitOn);
  }

  // ── Formula bar ──────────────────────────────────────────
  const terms = CH1_PLACE_VALUES.map((pv, i) => {
    const bitOn = (ch1Value >> (7 - i)) & 1;
    return bitOn
      ? `<span style="color:var(--blue-text);font-weight:600">1\u00d7${pv}</span>`
      : `<span style="color:var(--text-muted);opacity:0.45">0\u00d7${pv}</span>`;
  });
  document.getElementById('ch1-formula').innerHTML = terms.join(' + ');

  // ── Result value ─────────────────────────────────────────
  document.getElementById('ch1-result-value').textContent = ch1Value;

  // ── Result explanation ───────────────────────────────────
  const activeTerms = CH1_PLACE_VALUES.filter((_, i) => (ch1Value >> (7 - i)) & 1);
  let explain;
  if (activeTerms.length === 0) {
    explain = 'All bits off \u2014 value is zero.';
  } else if (activeTerms.length === 1) {
    explain = `Only one bit on: <span class="term-active">${activeTerms[0]}</span> = ${ch1Value}.`;
  } else {
    const sum = activeTerms
      .map(v => `<span class="term-active">${v}</span>`)
      .join(' + ');
    explain = `${sum} = <span class="term-active">${ch1Value}</span>`;
  }
  document.getElementById('ch1-result-explain').innerHTML = explain;
}

function ch1SetVal(n) {
  ch1Value = clamp(n, 0, 255);
  ch1Render();
}

function ch1Init() {
  // ── Place value row (static, built once) ─────────────────
  const placeRow = document.getElementById('ch1-place-row');
  for (let i = 0; i < 8; i++) {
    const cell = document.createElement('div');
    cell.className = 'place-cell';
    cell.innerHTML =
      `<span class="power">2<sup>${7 - i}</sup></span>` +
      `<span class="pvalue">${CH1_PLACE_VALUES[i]}</span>`;
    placeRow.appendChild(cell);
  }

  // ── Index row (static) ────────────────────────────────────
  makeIndexRow(document.getElementById('ch1-index-row'), 8);

  // ── Contribution row (cells built once, toggled on update) ─
  const contribRow = document.getElementById('ch1-contrib-row');
  for (let i = 0; i < 8; i++) {
    const cell = document.createElement('div');
    cell.className = 'contrib-cell zero';
    cell.textContent = `+${CH1_PLACE_VALUES[i]}`;
    ch1ContribCells.push(cell);
    contribRow.appendChild(cell);
  }

  // ── Initial render ────────────────────────────────────────
  ch1Render();
}

document.addEventListener('DOMContentLoaded', ch1Init);
