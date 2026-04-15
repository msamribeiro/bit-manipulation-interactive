/* ============================================================
   bits.js — Shared utilities for all bit manipulation demos.
   All exports are plain globals (no ES modules) so the file
   works via <script src> on file:// without a server.
   ============================================================ */

/* ── Colour class constants ── */
const BC = {
  ONE:    'b-1',
  ZERO:   'b-0',
  SIGN:   'b-sign',
  EXP:    'b-exp',
  MANT:   'b-mant',
  PASS:   'b-pass',
  BLOCK:  'b-block',
  SET:    'b-set',
  CLEAR:  'b-clear',
  FLIP:   'b-flip',
  TARGET: 'b-target',
  MASK1:  'b-mask-1',
  MASK0:  'b-mask-0',
};

/* ── toBin(value, width) ──────────────────────────────────────
   Convert an integer to a zero-padded binary string of `width`
   characters, MSB first.

   Handles negative values by using the two's complement bit
   pattern for the given width (via unsigned right-shift coercion).
   Handles overflow by silently truncating to the low `width` bits.

   Examples:
     toBin(42,  8) → '00101010'
     toBin(-1,  8) → '11111111'
     toBin(256, 8) → '00000000'  (truncated — 256 overflows 8 bits)
---------------------------------------------------------------- */
function toBin(value, width) {
  return (value >>> 0).toString(2).padStart(width, '0').slice(-width);
}

/* ── clamp(value, min, max) ──────────────────────────────────
   Clamp a number to the inclusive range [min, max].
   Used everywhere a number input or preset feeds a demo value.
---------------------------------------------------------------- */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/* ── renderIndexRow(container, bitWidth) ─────────────────────
   Render a row of bit-position labels into `container`.
   Labels count down from bitWidth-1 (MSB, leftmost) to 0 (LSB).
   Clears the container before rendering.

   Produces: <div class="bit-index">7</div> ... <div class="bit-index">0</div>

   makeIndexRow is kept as an alias for backwards compatibility.
---------------------------------------------------------------- */
function renderIndexRow(container, bitWidth) {
  container.innerHTML = '';
  for (let i = 0; i < bitWidth; i++) {
    const el = document.createElement('div');
    el.className = 'bit-index';
    el.textContent = bitWidth - 1 - i;
    container.appendChild(el);
  }
}
const makeIndexRow = renderIndexRow;

/* ── renderBitRow(container, value, bitWidth, colorFn, clickFn)
   The central rendering function. Every demo calls this.

   Clears `container` and renders `bitWidth` bit boxes representing
   the binary encoding of `value`.

   Parameters:
     container  DOM Element  Cleared and fully rebuilt on each call.
     value      integer      The value to display. Bit at array index i
                             is extracted as (value >>> (bitWidth-1-i)) & 1.
                             Use of >>> makes 32-bit values safe.
     bitWidth   integer      Number of bit boxes: 4, 8, 16, or 32.
     colorFn    function|null  (bitIndex, bitValue) => CSS class string.
                             bitIndex is 0-based from the left (MSB = 0).
                             bitValue is 0 or 1.
                             Pass null to use the default b-1 / b-0 colouring.
     clickFn    function|null  (bitIndex) => void.
                             Called when the user clicks box at bitIndex.
                             Pass null for a static (non-interactive) row.

   Each box rendered:
     <div class="bit [colorClass] [clickable?]"
          data-index="[i]"
          aria-label="bit [position], currently [0|1]">
       [0|1]
     </div>
---------------------------------------------------------------- */
function renderBitRow(container, value, bitWidth, colorFn, clickFn) {
  container.innerHTML = '';

  const defaultColor = (i, v) => v ? BC.ONE : BC.ZERO;
  const getColor = colorFn || defaultColor;

  for (let i = 0; i < bitWidth; i++) {
    const bitVal  = (value >>> (bitWidth - 1 - i)) & 1;
    const bitPos  = bitWidth - 1 - i; // logical bit position (MSB = bitWidth-1)
    const cssClass = getColor(i, bitVal);

    const el = document.createElement('div');
    el.className  = 'bit ' + cssClass + (clickFn ? ' clickable' : '');
    el.dataset.index = i;
    el.setAttribute('aria-label', `bit ${bitPos}, currently ${bitVal}`);
    el.textContent = bitVal;

    if (clickFn) {
      el.addEventListener('click', () => clickFn(i));
    }

    container.appendChild(el);
  }
}

/* ── toSigned(unsigned, bits) ────────────────────────────────
   Interpret an n-bit unsigned integer as its two's complement
   signed value.

   Examples:
     toSigned(0xFF, 8) → −1
     toSigned(0x80, 8) → −128
     toSigned(0x0F, 4) → −1
     toSigned(0x08, 4) → −8
---------------------------------------------------------------- */
function toSigned(unsigned, bits) {
  const threshold = 1 << (bits - 1);
  return unsigned >= threshold ? unsigned - (1 << bits) : unsigned;
}

/* ── svgEl(tag, attrs) ───────────────────────────────────────
   Create an SVG element with attributes set in one call.
   The special key 'textContent' sets the element's text content
   (it is a property, not an attribute, so needs special handling).
   Returns the created SVGElement.

   Example:
     svgEl('circle', { cx: 10, cy: 10, r: 5, fill: 'red' })
---------------------------------------------------------------- */
function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'textContent') el.textContent = v;
    else el.setAttribute(k, v);
  }
  return el;
}

/* ── circleX / circleY ───────────────────────────────────────
   Compute x or y coordinate of a point on a circle.

   Convention: angleDeg 0° = right (3 o'clock), clockwise positive.
   This matches the SVG coordinate system (positive y downward).

   Examples:
     circleX(100, 50, 0)    → 150   (rightmost point)
     circleX(100, 50, 90)   → 100   (bottom)
     circleY(100, 50, 90)   → 150   (bottom)
---------------------------------------------------------------- */
function circleX(cx, r, angleDeg) {
  return cx + r * Math.cos(angleDeg * Math.PI / 180);
}
function circleY(cy, r, angleDeg) {
  return cy + r * Math.sin(angleDeg * Math.PI / 180);
}

/* ── clockNodeColors(signedVal) ──────────────────────────────
   Return fill, stroke, and text colour strings for a clock node
   given its signed integer value.

   Reads CSS variables at call time so light/dark mode switching
   is automatic — no hard-coded colours here.

   Returns: { fill, stroke, text }
---------------------------------------------------------------- */
function clockNodeColors(signedVal) {
  const s   = getComputedStyle(document.documentElement);
  const get = (name) => s.getPropertyValue(name).trim();
  if (signedVal === 0) return { fill: get('--zero-bg'),  stroke: get('--zero-border'), text: get('--zero-text') };
  if (signedVal  > 0) return { fill: get('--blue-bg'),  stroke: get('--blue-border'), text: get('--blue-text') };
  return                     { fill: get('--red-bg'),   stroke: get('--red-text'),    text: get('--red-text')  };
}

/* ── decodeIEEE754(bitArray, expBits, mantBits) ──────────────
   Decode an IEEE 754 floating-point value from a bit array.

   Parameters:
     bitArray   Array of integers (each 0 or 1), MSB first.
                Length must equal 1 + expBits + mantBits.
     expBits    Number of exponent bits  (8 for fp32/bf16, 5 for fp16).
     mantBits   Number of mantissa bits  (23 for fp32, 10 for fp16, 7 for bf16).

   Returns: { value, kind }
     value  JavaScript number (the decoded float, Infinity, or NaN).
     kind   String: 'zero' | 'normal' | 'denormal' | 'infinity' | 'nan'.

   Format support:
     fp32:  expBits=8, mantBits=23  → use DataView for precise decode
     fp16:  expBits=5, mantBits=10  → formula arithmetic
     bf16:  expBits=8, mantBits=7   → formula arithmetic
---------------------------------------------------------------- */
function decodeIEEE754(bitArray, expBits, mantBits) {
  const sign = bitArray[0];

  // Extract exponent integer (bits 1 .. expBits)
  let expInt = 0;
  for (let i = 1; i <= expBits; i++) {
    expInt = (expInt << 1) | bitArray[i];
  }

  // Extract mantissa fraction (bits expBits+1 .. end)
  let mantFrac = 0;
  for (let i = expBits + 1; i < bitArray.length; i++) {
    const shift = i - expBits - 1; // 0-based from the implied point
    if (bitArray[i]) mantFrac += Math.pow(2, -(shift + 1));
  }

  const allExpOnes  = expInt === (1 << expBits) - 1;
  const allExpZeros = expInt === 0;
  const mantIsZero  = mantFrac === 0;

  // ── Special values ──
  if (allExpOnes && !mantIsZero) {
    return { value: NaN, kind: 'nan' };
  }
  if (allExpOnes && mantIsZero) {
    return { value: sign ? -Infinity : Infinity, kind: 'infinity' };
  }
  if (allExpZeros && mantIsZero) {
    return { value: sign ? -0 : 0, kind: 'zero' };
  }
  if (allExpZeros) {
    // Denormal: no implicit leading 1; exponent is 1 - bias
    const bias = (1 << (expBits - 1)) - 1;
    const value = (sign ? -1 : 1) * mantFrac * Math.pow(2, 1 - bias);
    return { value, kind: 'denormal' };
  }

  // ── Normal value ──
  const bias = (1 << (expBits - 1)) - 1;

  // For fp32 use DataView to get the exact IEEE 754 binary32 result.
  if (expBits === 8 && mantBits === 23) {
    let uint32 = 0;
    for (let i = 0; i < 32; i++) {
      uint32 = (uint32 << 1) | bitArray[i];
    }
    // >>> 0 keeps it unsigned before writing to the buffer
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setUint32(0, uint32 >>> 0, false); // big-endian
    return { value: view.getFloat32(0, false), kind: 'normal' };
  }

  // For fp16 and bf16 use formula arithmetic (mantissa is short enough).
  const value = (sign ? -1 : 1) * (1 + mantFrac) * Math.pow(2, expInt - bias);
  return { value, kind: 'normal' };
}
