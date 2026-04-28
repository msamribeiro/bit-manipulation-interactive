# Bit Manipulation Interactive Tutorial — Design Document (v2)

> **Purpose:** This document is a complete project specification for an interactive bit
> manipulation tutorial, intended as context for an AI coding agent or developer
> picking up the project. It covers goals, repository structure, visual design system,
> every planned visualization with full input/output/behaviour specifications, and a
> sequenced implementation plan.
>
> **Changelog from v1:**
> - Chapter 2's static SVG number circle replaced by the interactive clock demo.
> - `js/bits.js` utility API is now concretely specified, derived from the actual
>   functions used across all built demos.
> - Clock demo implementation notes added with full architectural detail.
> - Demo count updated from 14 to 16 (clock + format comparison both added).

---

## 1. Project Overview

### 1.1 Goal

Build a self-contained, interactive bit manipulation tutorial hosted as a GitHub
repository with a companion GitHub Pages site. The tutorial teaches binary
representation, bitwise operators, common bit tasks, and applications — including a
modern treatment of floating-point formats and their relevance to machine learning
(bf16, fp16, fp32).

### 1.2 Audience

Developers coming from high-level languages (Python, JavaScript) who want to
understand what is happening at the bit level. The tutorial assumes comfort with
basic programming but no prior knowledge of binary arithmetic or hardware.

### 1.3 Design Philosophy

- **Derive, don't just demonstrate.** Every trick is explained from first principles,
  not just shown. Example: the flip-and-add-1 rule for negation is derived as a
  theorem from the two's complement definition, not stated as magic.
- **Interactive at every step.** Each concept has a hands-on demo. Passive reading
  is minimised.
- **Coherent progression.** The chapters follow a deliberate learning arc: place
  values → signed integers → operators → shifts → masks → bit tasks → packing →
  applications → floating point.
- **Unified design.** All demos share one stylesheet and one set of utility
  functions. They feel like one product, not separate widgets.

### 1.4 Hosting

- **Repository:** `github.com/<user>/bit-manipulation`
- **Site:** GitHub Pages, served from `/docs` folder or a dedicated `gh-pages` branch
- **Stack:** Vanilla HTML + CSS + JavaScript. No build step, no framework, no
  dependencies. The entire site is static files.

---

## 2. Repository Structure

```
bit-manipulation/
│
├── index.html                        # Landing page / table of contents
├── README.md                         # Project description and local dev instructions
│
├── css/
│   └── style.css                     # Single unified stylesheet for all pages
│
├── js/
│   ├── bits.js                       # Core shared utilities (see Section 4)
│   └── demos/                        # One JS file per chapter
│       ├── ch01-place-values.js
│       ├── ch02-signed.js
│       ├── ch03-operators.js
│       ├── ch04-shifts.js
│       ├── ch05-masks.js
│       ├── ch06-bit-tasks.js
│       ├── ch07-packing.js
│       ├── ch08-applications.js
│       └── ch09-floats.js
│
├── chapters/
│   ├── 01-place-values.html
│   ├── 02-signed-integers.html
│   ├── 03-operators.html
│   ├── 04-shifts.html
│   ├── 05-masks.html
│   ├── 06-bit-tasks.html
│   ├── 07-packing-unpacking.html
│   ├── 08-applications.html
│   └── 09-floating-point.html
│
└── assets/
    └── favicon.svg
```

### 2.1 Key principle: one shared core

`js/bits.js` is the foundation every demo imports. It must be written and
stabilised before any chapter demos are built. See Section 4 for the full API
specification, derived from the demos actually built in this project.

---

## 3. Visual Design System

All demos share a single visual language. This section defines it precisely so
every chapter looks like part of the same product.

### 3.1 Colour palette (bit states)

Each bit box is one of these states, encoded by CSS class:

| Class       | Meaning                            | Background  | Text        |
|-------------|------------------------------------|-------------|-------------|
| `.b-1`      | Bit is 1 (default)                 | `#185FA5`   | `#E6F1FB`   |
| `.b-0`      | Bit is 0 (default)                 | surface-2   | muted       |
| `.b-target` | The bit position being operated on | `#854F0B`   | `#FAEEDA`   |
| `.b-pass`   | Bit passed through unchanged       | `#0F6E56`   | `#E1F5EE`   |
| `.b-block`  | Bit blocked / zeroed by mask       | surface-2   | muted, 40%  |
| `.b-set`    | Bit forced to 1 by operation       | `#533AB7`   | `#EEEDFE`   |
| `.b-clear`  | Bit forced to 0 by operation       | `#A32D2D`   | `#FCEBEB`   |
| `.b-flip`   | Bit toggled by XOR                 | `#9F3BAA`   | `#F4C0D1`   |
| `.b-sign`   | Sign bit (two's complement)        | `#A32D2D`   | `#FCEBEB`   |
| `.b-mask-1` | Mask bit = 1 (open)                | `#3B6D11`   | `#EAF3DE`   |
| `.b-mask-0` | Mask bit = 0 (closed)              | `#633806`   | `#FAEEDA`   |
| `.b-exp`    | Exponent field (floats)            | `#533AB7`   | `#EEEDFE`   |
| `.b-mant`   | Mantissa field (floats)            | `#0F6E56`   | `#E1F5EE`   |

### 3.2 Bit box geometry

```css
.bit {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.13s, color 0.13s;
}
.bit.clickable { cursor: pointer; }
.bit-row { display: flex; gap: 3px; }
.bit-index-row { display: flex; gap: 3px; }
.bit-index {
  width: 30px;
  text-align: center;
  font-size: 10px;
  color: var(--text-muted);
  font-family: monospace;
}
```

### 3.3 Clock node geometry (used in Demo 2.1)

Nodes on the clock circle are sized by significance:

```
landmark nodes (0 and −8): r = 14px, font-weight 500, font-size 13px
standard nodes:             r = 11px, font-weight 400, font-size 12px
selected node ring:         r = 18px, stroke #EF9F27, stroke-width 2.5px, fill none
bit pattern labels:         font-size 10px, r = 168px from centre
decimal labels:             font-size 12–13px, r = 152px from centre (inside dot)
outer tick marks:           long tick (8px) at multiples of 4; short tick (6px) elsewhere
```

### 3.4 Layout components

**Demo container** — each demo lives in a `.demo-box`:
```css
.demo-box {
  background: var(--surface-2);
  border-radius: 12px;
  border: 0.5px solid var(--border);
  padding: 1.25rem 1.5rem;
  margin: 1.5rem 0;
}
```

**Formula bar** — monospace, surface-1 background, shown above each demo:
```css
.formula-bar {
  font-family: monospace;
  font-size: 13px;
  background: var(--surface-1);
  border: 0.5px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 14px;
  color: var(--text-primary);
}
```

**Result box** — shown below the bit rows with the computed value:
```css
.result-box {
  border-top: 0.5px solid var(--border);
  margin-top: 12px;
  padding-top: 12px;
}
.result-value { font-size: 22px; font-weight: 500; font-family: monospace; }
.result-explain {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
  margin-top: 8px;
}
```

**Metric cards** — used in the clock's info panel and the log₂ demo:
```css
.metric {
  background: var(--surface-2);
  border-radius: 8px;
  padding: 10px 14px;
  text-align: center;
}
.metric-label  { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
.metric-value  { font-size: 22px; font-weight: 500; font-family: monospace; }
```

**Tabs** — used when a demo has multiple modes:
```css
.tab-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 1.25rem; }
.tab {
  padding: 6px 14px;
  border-radius: 8px;
  border: 0.5px solid var(--border);
  font-size: 13px;
  cursor: pointer;
  background: var(--surface-2);
  color: var(--text-muted);
}
.tab.active {
  border-color: var(--blue-border);
  background: var(--blue-bg);
  color: var(--blue-text);
}
```

### 3.5 CSS variables (light/dark mode)

```css
:root {
  --surface-1:    #ffffff;
  --surface-2:    #f5f5f3;
  --surface-3:    #eeede8;
  --border:       rgba(0,0,0,0.15);
  --text-primary: #1a1a18;
  --text-muted:   #6b6b67;

  --blue-bg:     #E6F1FB;  --blue-text:   #185FA5;  --blue-border:  #378ADD;
  --green-bg:    #E1F5EE;  --green-text:  #0F6E56;
  --red-bg:      #FCEBEB;  --red-text:    #A32D2D;
  --amber-bg:    #FAEEDA;  --amber-text:  #854F0B;
  --purple-bg:   #EEEDFE;  --purple-text: #533AB7;
  --zero-bg:     #EAF3DE;  --zero-text:   #27500A;  --zero-border:  #3B6D11;
}

@media (prefers-color-scheme: dark) {
  :root {
    --surface-1:    #1e1e1c;
    --surface-2:    #252523;
    --surface-3:    #2e2e2b;
    --border:       rgba(255,255,255,0.12);
    --text-primary: #e8e6de;
    --text-muted:   #9c9a92;

    --blue-bg:     #042C53;  --blue-text:   #B5D4F4;  --blue-border: #185FA5;
    --green-bg:    #04342C;  --green-text:  #9FE1CB;
    --red-bg:      #501313;  --red-text:    #F7C1C1;
    --amber-bg:    #412402;  --amber-text:  #FAC775;
    --purple-bg:   #26215C;  --purple-text: #CECBF6;
    --zero-bg:     #173404;  --zero-text:   #C0DD97;  --zero-border: #639922;
  }
}
```

### 3.6 Navigation

Each chapter page has:
- A top navigation bar with the project name (left) and prev/next chapter links (right)
- A chapter title and one-sentence description below the nav
- Prose sections with embedded `.demo-box` components
- A bottom nav repeating prev/next

---

## 4. Shared Utilities — `js/bits.js`

This file must be completed before any chapter demo is written. All functions
below are derived from the demos built in this project. Every chapter imports
this file with `<script src="../js/bits.js"></script>`.

### 4.1 Bit rendering

```js
/**
 * Render a row of bit boxes into a container element.
 *
 * @param {string|HTMLElement} container  - Element or its ID.
 * @param {number}             value      - Integer whose bits to render.
 * @param {number}             width      - Number of bits (4 or 8).
 * @param {function}           colorFn    - (bitIndex, bitValue) => cssClass string.
 *                                          bitIndex: 0 = LSB. bitValue: 0 or 1.
 * @param {function}           [clickFn]  - Optional (bitIndex) => void, makes clickable.
 */
function renderBitRow(container, value, width, colorFn, clickFn) { … }

/**
 * Render a row of bit-position index labels (width … 0) above a bit row.
 *
 * @param {string|HTMLElement} container
 * @param {number}             width
 */
function renderIndexRow(container, width) { … }
```

### 4.2 Number conversion

```js
/**
 * Convert a non-negative integer to a zero-padded binary string.
 * @param {number} value
 * @param {number} width  - Total string length, padded with leading zeros.
 * @returns {string}
 */
function toBin(value, width) { … }

/**
 * Interpret an n-bit unsigned integer as a two's complement signed value.
 * @param {number} unsigned  - Raw bit pattern as a non-negative integer.
 * @param {number} bits      - Bit width (e.g. 4 or 8).
 * @returns {number}         - Signed integer in [-2^(bits-1), 2^(bits-1)-1].
 */
function toSigned(unsigned, bits) { … }

/**
 * Clamp a value to [min, max] and coerce to integer.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) { … }
```

### 4.3 SVG utilities (used by clock and float demos)

```js
/**
 * Create an SVG element with a set of attributes in one call.
 * @param {string} tag     - SVG tag name (e.g. 'circle', 'text', 'line').
 * @param {object} attrs   - Key/value attribute pairs.
 * @returns {SVGElement}
 */
function svgEl(tag, attrs) { … }

/**
 * Compute x coordinate on a circle.
 * @param {number} cx       - Circle centre x.
 * @param {number} r        - Radius.
 * @param {number} angleDeg - Angle in degrees (0 = right, clockwise).
 * @returns {number}
 */
function circleX(cx, r, angleDeg) { … }

/**
 * Compute y coordinate on a circle.
 */
function circleY(cy, r, angleDeg) { … }
```

### 4.4 IEEE 754 decode (used by float demos)

```js
/**
 * Decode a bit pattern according to an IEEE 754-style layout.
 *
 * @param {number[]} bits       - Array of bit values, index 0 = MSB.
 * @param {number}   expBits    - Number of exponent bits.
 * @param {number}   mantBits   - Number of mantissa bits.
 * @returns {{
 *   sign:     number,   // 0 or 1
 *   expRaw:   number,   // stored exponent (unsigned integer)
 *   bias:     number,   // (2^(expBits-1)) - 1
 *   expActual:number,   // expRaw - bias
 *   mantFrac: number,   // mantissa as decimal fraction (0 to <1)
 *   value:    number,   // decoded float (Infinity / NaN / 0 as appropriate)
 *   kind:     string    // 'zero' | 'normal' | 'denormal' | 'infinity' | 'nan'
 * }}
 */
function decodeIEEE754(bits, expBits, mantBits) { … }
```

### 4.5 Colour helper for clock nodes

```js
/**
 * Return the fill/stroke/text colour set for a clock node given its signed value.
 * Reads CSS variables from the document root so light/dark mode is automatic.
 *
 * @param {number} signedVal  - Signed integer value of the node.
 * @returns {{ fill: string, stroke: string, text: string }}
 */
function clockNodeColors(signedVal) { … }
```

---

## 5. Chapter Specifications

---

### Chapter 1 — Binary Place Values

**File:** `chapters/01-place-values.html`
**JS:**   `js/demos/ch01-place-values.js`

**Prose topics:**
- Base-10 place values as the familiar analogy
- Base-2: columns worth 1, 2, 4, 8, … (powers of 2)
- The formula: $\sum_{k=0}^{n-1} b_k \cdot 2^k$
- Each bit as an independent on/off switch for its column's value

#### Demo 1.1 — Binary Place Value Explorer

**Purpose:** Build intuition for how bits contribute to a total.

**Inputs:**
- 8 clickable bit boxes (toggle 0/1 on click), rendered via `renderBitRow`
- Preset buttons: 0, 1, 7, 8, 13, 42, 127, 255

**Outputs (live-updating):**
- Place value label above each bit: `2^k` and its decimal value
- Contribution label below each bit: `+N` when bit is 1, empty when 0
- Formula row: all 8 terms shown, active terms highlighted, zero terms faded
- Running sum with active terms
- Decimal result (large, prominent)

**Colour behaviour:**
- Bit box: `.b-1` when on, `.b-0` when off
- Contribution label: blue when active, invisible when zero

**Analogy panel (static):**
- Shows decimal 365 = 3×100 + 6×10 + 5×1 alongside binary equivalent
- Caption: "The only difference: columns multiply by 2 instead of 10,
  and each digit is 0 or 1 instead of 0–9."

---

### Chapter 2 — Signed Integers (Two's Complement)

**File:** `chapters/02-signed-integers.html`
**JS:**   `js/demos/ch02-signed.js`

**Prose topics:**
- The problem: how to represent negative numbers in binary
- The definition: $-b_{n-1} \cdot 2^{n-1} + \sum_{k=0}^{n-2} b_k \cdot 2^k$
- Why this design: addition requires no special cases
- The flip-and-add-1 rule derived as a consequence, not a definition
- Range asymmetry: $[-2^{n-1},\ 2^{n-1}-1]$

#### Demo 2.1 — Two's Complement Interactive Clock

**Purpose:** Show all 16 values of a 4-bit signed integer on a clock face.
Click any node to reveal its decimal value, bit pattern, and a contextual
explanation. Step through values sequentially to see the overflow wrap.

**Why 4-bit:** 16 values fit cleanly around the circle without crowding.
8-bit (256 values) would be unreadable. The 4-bit range (−8 to 7) is
sufficient to demonstrate every structural property of two's complement.

**Replaces:** The static SVG number circle from v1 of this document.

---

##### 5.2.1 Layout

```
┌────────────────────────────────────────┐
│            SVG clock face              │  ← 680×560 viewBox
│  (all rendering done in JavaScript)    │
└────────────────────────────────────────┘
┌──────────┬──────────┬──────────────────┐
│ decimal  │ unsigned │       hex        │  ← 3-column metric card row
└──────────┴──────────┴──────────────────┘
        [ bit box row — 4 boxes ]
        hint / explanation line
   [← prev]   "N of 16"   [next →]
```

---

##### 5.2.2 SVG structure

The SVG is rendered entirely by JavaScript — there is no static SVG markup.
On every `select(i)` call, the SVG is fully rebuilt by calling `buildClock()`.
This is acceptable at 16 nodes; targeted attribute updates are not required.

The SVG coordinate system uses a fixed centre point:

```
CX = 340, CY = 268
```

Radii (all measured from CX, CY):

| Constant      | Value | Purpose                          |
|---------------|-------|----------------------------------|
| `R_OUTER`     | 210   | Background sector arcs           |
| `R_TICK_OUT`  | 200   | Outer end of tick marks          |
| `R_TICK_IN`   | 188   | Inner end of standard tick marks |
| `R_TICK_LAND` | 184   | Inner end of landmark tick marks |
| `R_DEC`       | 222   | Outer decimal labels (unused)    |
| `R_DOT`       | 152   | Centre of each node dot          |
| `R_BIN`       | 168   | Bit pattern labels                |

Angle mapping — value `i` (0–15, unsigned) maps to angle:

```js
function angle(i) {
  return (i / 16) * 2 * Math.PI - Math.PI / 2;
}
// i=0  → −π/2  (top of circle)
// i=4  → 0     (right)
// i=8  → π/2   (bottom)
// i=12 → π     (left)
```

Counting proceeds clockwise. Positive values (i = 0–7, signed 0–7) occupy
the right half; negative values (i = 8–15, signed −8 to −1) occupy the left
half, matching the Wikipedia clock-face convention.

---

##### 5.2.3 Draw order (z-ordering)

Elements must be appended in this order so nothing unexpected renders on top:

1. Background sector arcs (blue right half, red left half)
2. Outer ring circle (border only, no fill)
3. Inner dashed reference circle
4. Crosshair guide lines (dashed, faint)
5. "positive / negative" and centre labels
6. Overflow seam label (below circle)
7. For each of the 16 nodes (i = 0 to 15):
   a. Tick mark line
   b. `<g>` with click handler containing: dot circle + decimal text + binary text
8. Selection ring (drawn last, on top of everything)

---

##### 5.2.4 Node colour logic

Use `clockNodeColors(signedVal)` from `bits.js`:

| Condition         | Fill          | Stroke        | Text          |
|-------------------|---------------|---------------|---------------|
| signedVal === 0   | `--zero-bg`   | `--zero-border`| `--zero-text` |
| signedVal > 0     | `--blue-bg`   | `--blue-border`| `--blue-text` |
| signedVal < 0     | `--red-bg`    | `--red-text`  | `--red-text`  |
| selected (any)    | `#EF9F27`     | `#EF9F27`     | `#412402`     |

Landmark nodes (i = 0 and i = 8, representing 0 and −8): tick stroke-width 2,
dot radius 14, font-weight 500, font-size 13px.
Standard nodes: tick stroke-width 1, dot radius 11, font-weight 400,
font-size 12px.

---

##### 5.2.5 Info panel behaviour

**Metric cards** (always visible, update on select):

| Card      | Content when selected     | Content when nothing selected |
|-----------|---------------------------|-------------------------------|
| decimal   | Signed value, coloured    | `—`                           |
| unsigned  | Raw bit pattern as integer| `—`                           |
| hex       | `0xN` format              | `—`                           |

**Bit row** (4 boxes, always visible):
- Sign bit (index 0, MSB): `.b-sign` style when set (red), `.b-0` when clear
- Value bits (indices 1–3): `.b-1` (blue) when set, `.b-0` when clear
- Uses `renderBitRow` from `bits.js` with `width=4`

**Hint line** — contextual text, updates on select. Hardcoded messages for
pedagogically important values:

```js
const hints = {
   0: "Zero — the only value with this bit pattern in both signed and unsigned.",
   7: "Maximum positive 4-bit value. Sign bit = 0, all others = 1.",
  -8: "Minimum — only the sign bit set. No positive counterpart.",
  -1: "All bits on: −8 + 4 + 2 + 1 = −1. All-ones always means −1 in two's complement.",
};
```

For all other values, generate dynamically:
- Positive: `"Positive: sign bit is 0. Value = <place value sum>"`
- Negative: `"Negative: sign bit contributes −8. Remaining bits add back <v+8>."`

**Prev / next buttons** — step through i = 0…15 wrapping at both ends.
The `nav-label` span shows `"<signedVal> of 16"`.

---

##### 5.2.6 Hover behaviour

On `mouseenter` on a non-selected node:
- Increase dot radius to 14px
- Increase stroke-width to 1.5px

On `mouseleave`: restore to default size.
Do nothing if the node is already selected.

---

##### 5.2.7 Rebuild vs. targeted update

`buildClock()` rebuilds the entire SVG on every `select()` call. This is the
correct approach for this demo: 16 nodes is trivially fast to rebuild, and
a full rebuild avoids stale state bugs. Do not attempt to update individual
SVG attributes in place — the simplicity of full rebuild is the point.

If a CSS `transition` on the amber selection ring is desired, add it via
a CSS class rather than JS animation, since the ring is a freshly created
element on each rebuild.

---

#### Demo 2.2 — Two's Complement Bit Explorer

**Purpose:** Click bits directly, see the formula compute the signed value.
Companion to the clock — the clock shows the structure, this shows the arithmetic.

**Inputs:**
- 8 clickable bit boxes, rendered via `renderBitRow`
- Preset buttons: 0, 1, 127 (max), −1, −128 (min), −42, 42

**Outputs (live-updating):**
- Place value label above each bit:
  - Bit 7: shown in red as `−2^7` / `−128`
  - Bits 0–6: normal blue `2^k` / decimal
- Contribution label below: `−128` (red) or `+N` (blue) or empty
- Formula with live substitution
- Decimal result, red if negative, blue if positive
- Contextual insight panel (same messages as clock demo hint line, adapted for 8-bit)

---

### Chapter 3 — Bitwise Operators

**File:** `chapters/03-operators.html`
**JS:**   `js/demos/ch03-operators.js`

**Prose topics:**
- Definition: applied position-by-position, no carry
- The general form: $(A \star B)_k = f(a_k, b_k)$ for all $k$
- Note on notation: $\oplus$ used specifically for XOR (addition mod 2)
- Brief description of each operator before its demo

All four operator demos (AND, OR, XOR, NOT) share the same layout pattern:
two input rows (or one for NOT), a divider, a result row. All rendered via
`renderBitRow`. Two number inputs above; decimal values to the right of each row.

#### Demo 3.1 — AND Visualizer

**Presets:** low 4 bits, high 4 bits, odd/even check, n & (n−1)

**Result bit colours:**
- Mask = 1 and A = 1: `.b-pass`
- Mask = 1 and A = 0: `.b-0`
- Mask = 0: `.b-block`

#### Demo 3.2 — OR Visualizer

**Presets:** set bit 0, set high nibble, ASCII lowercase trick

**Result bit colours:**
- Mask = 1: `.b-set` (forced to 1)
- Mask = 0 and A = 1: `.b-pass`
- Mask = 0 and A = 0: `.b-0`

#### Demo 3.3 — XOR Visualizer

**Presets:** flip all bits, toggle bit 0, A^A=0, upper/lower case toggle

**Result bit colours:**
- Mask = 1: `.b-flip`
- Mask = 0 and A = 1: `.b-pass`
- Mask = 0 and A = 0: `.b-0`

**Special insight when A === B:** "A ^ A = 0. Every bit cancels its twin."

#### Demo 3.4 — NOT Visualizer

Single input A. Result row shows every bit flipped. Arithmetic identity
displayed: `~A = −A − 1`.

---

### Chapter 4 — Bit Shifts

**File:** `chapters/04-shifts.html`
**JS:**   `js/demos/ch04-shifts.js`

**Prose topics:**
- Left shift as multiplication by 2^n; overflow when high bits are non-zero
- Logical right shift: fills vacated high bits with zeros (unsigned division)
- Arithmetic right shift: fills with copies of the sign bit (signed division)
- Shift amount constraints: shifting by ≥ width is undefined in C; JS masks to 5 bits

#### Demo 4.1 — Shift Visualizer

Three-mode tabs: left shift `<<`, logical right shift `>>>`,
arithmetic right shift `>>` (signed).

**Inputs:** 8-bit value A (clickable), shift amount n (0–7, slider + number input synced).

**Result bit colours:**
- Moved bits: `.b-pass`
- Zero-filled positions: `.b-0` (faded)
- Sign-extended positions (arithmetic mode only): `.b-sign`
- Dropped bits (shown in A row): `.b-clear`

**Insight line:** arithmetic interpretation (× 2^n or ÷ 2^n) with overflow note.

---

### Chapter 5 — Masks

**File:** `chapters/05-masks.html`
**JS:**   `js/demos/ch05-masks.js`

**Prose topics:**
- `1 << k` as the universal mask seed
- Single-bit masks and their inverses
- Range masks: a contiguous block of 1s
- How shift-built masks enable generic bit functions

#### Demo 5.1 — Mask Builder (2-tab)

**Tab 1 — Single-bit mask:** input k → show 1, 1<<k, ~(1<<k)
**Tab 2 — Range mask:** inputs lo, hi → show each step of
  `((1 << (hi−lo+1)) − 1) << lo`

---

### Chapter 6 — Bit Tasks

**File:** `chapters/06-bit-tasks.html`
**JS:**   `js/demos/ch06-bit-tasks.js`

**Prose topics:**
- All five tasks use `1 << k` as their mask
- Summary table: operation / expression / operator / when bit=0 / when bit=1
- Toggle is the only operation whose output depends on current bit value

#### Demo 6.1 — Bit Operations Explorer (5-tab)

**Tabs:** Get · Set · Clear · Toggle · Update

Shared inputs across all tabs: value n (0–255), bit index k (0–7).
Formula bar updates live. All bit rendering via `renderBitRow`.

**Get:** `(n >> k) & 1` — shift bit k to position 0, AND isolates it.
**Set:** `n | (1 << k)` — OR with single-bit mask.
**Clear:** `n & ~(1 << k)` — AND with inverted mask.
**Toggle:** `n ^ (1 << k)` — XOR with single-bit mask.
**Update:** `(n & ~(1<<k)) | (v<<k)` — clear then OR in desired value.
  Additional input: v (dropdown 0 or 1).

---

### Chapter 7 — Packing and Unpacking

**File:** `chapters/07-packing-unpacking.html`
**JS:**   `js/demos/ch07-packing.js`

**Prose topics:**
- Bit fields: non-overlapping slots within one integer
- Pack with shift + OR; unpack with shift + AND mask
- Why OR works for packing (non-overlapping → equivalent to addition)
- Real-world prevalence: pixel formats, network headers, hardware registers

#### Demo 7.1 — RGB Packer / Unpacker (3-tab)

Uses 12-bit display (not 8-bit). Field colours: red bits `.b-clear`,
green bits `.b-pass`, blue bits `.b-1`. Live colour swatch in all tabs.

**Tab 1 — Packing:** R, G, B inputs (0–15) → `(R<<8)|(G<<4)|B`
**Tab 2 — Unpacking:** packed value → extract each field with shift + AND
**Tab 3 — IPv4 header byte:** version (4 bits) and IHL (4 bits) packed into
  one byte; shows both pack and unpack expressions

---

### Chapter 8 — Applications

**File:** `chapters/08-applications.html`
**JS:**   `js/demos/ch08-applications.js`

**Prose topics:**
- Flags and permission systems (Unix permissions, API option masks)
- Subset enumeration in bitmask DP
- Hashing and cryptography (XOR, CRC, SHA-256 rotations)
- Graphics (blitting, alpha compositing, XOR drawing)
- Competitive programming tricks
- Embedded systems / hardware registers

#### Demo 8.1 — Permission System

5 toggle switches (READ, WRITE, DELETE, ADMIN, EXPORT). Live 8-bit display,
decimal, hex, and the expression used for the last operation. Multi-permission
check row: `(perms & required) == required`.

#### Demo 8.2 — Log₂ and Powers of 2

Input n (1–255). Three metric cards: floor log₂(n), next power of 2, is power
of 2. Bit rows for n and n−1, then n & (n−1). Surviving bits in red.
Preset buttons: 1, 2, 7, 8, 16, 48, 64, 100, 128, 255.

---

### Chapter 9 — Floating Point

**File:** `chapters/09-floating-point.html`
**JS:**   `js/demos/ch09-floats.js`

**Prose topics:**
- Why integers are not enough: fractions and very large magnitudes
- IEEE 754 structure: sign, biased exponent, mantissa with implicit leading 1
- The formula: $(-1)^s \times 1.\text{mantissa} \times 2^{e - \text{bias}}$
- Format comparison: fp32, fp16, bf16
- Special values subsection: zero, infinity, NaN, denormals
- Why bf16 for ML: range vs precision tradeoff

All three float demos use `decodeIEEE754` from `bits.js`.

Field colour coding (consistent across all three demos):
- Sign bit:      `.b-sign` (red)
- Exponent bits: `.b-exp`  (purple)
- Mantissa bits: `.b-mant` (green)

#### Demo 9.1 — IEEE 754 Bit Explorer (3-tab: fp32 / fp16 / bf16)

Clickable bit row. Preset buttons per tab. Field labels above bit row.
Decoded panel showing sign, stored exponent, bias, actual exponent,
mantissa fraction, formula substitution, final value.

| Tab  | Total bits | Sign | Exponent | Mantissa |
|------|-----------|------|----------|----------|
| fp32 | 32        | 1    | 8        | 23       |
| fp16 | 16        | 1    | 5        | 10       |
| bf16 | 16        | 1    | 8        | 7        |

Presets per tab: 0.0, 1.0, −1.0, 0.5, 3.14, max value, min positive,
+∞, NaN.

#### Demo 9.2 — Format Comparison (fp32 / fp16 / bf16 side by side)

Single decimal input. Three rows (one per format), each with colour-coded
bit row and decoded value. Overflow/underflow warning badge. Key insight
panel: "bf16 is fp32 with the bottom 16 mantissa bits removed — same
exponent range, less precision." Highlights truncated bits in fp32 row.

Presets: 1.0, 0.1, 3.14159, 65504 (fp16 max), 65600 (fp16 overflow),
1e-40 (fp16 underflow).

#### Demo 9.3 — fp16 vs bf16 Overflow

Log-scale slider (1e-6 to 1e6) representing a gradient/activation magnitude.
Two columns (fp16, bf16) showing current value, max representable, and a
status badge: OK / Overflow / Underflow. Caption explains why bf16's wider
exponent range avoids the loss-scaling hacks required for fp16 training.

---

## 6. Implementation Steps

Phases are sequential. Each produces a testable, committable unit of work.

---

### Phase 1 — Repository and design foundation

1. Initialise git repository; create folder structure from Section 2.
2. Write `css/style.css`: all CSS variables (light + dark), bit box classes
   from Section 3.1, clock node geometry from Section 3.3, all layout
   components from Section 3.4.
3. Write `js/bits.js` with the full API from Section 4:
   `renderBitRow`, `renderIndexRow`, `toBin`, `toSigned`, `clamp`,
   `svgEl`, `circleX`, `circleY`, `decodeIEEE754`, `clockNodeColors`.
4. Write `index.html`: landing page with chapter list and nav links.
5. Write `README.md`.

**Deliverable:** Styled landing page with navigation skeleton; no demos yet.

---

### Phase 2 — Chapter 1: Place Values

1. Write `chapters/01-place-values.html` with prose.
2. Implement Demo 1.1 in `js/demos/ch01-place-values.js` using
   `renderBitRow` and `toBin` from `bits.js`.
3. Test all 8 presets.

---

### Phase 3 — Chapter 2: Signed Integers

1. Write `chapters/02-signed-integers.html` with prose.
2. Implement Demo 2.1 (Interactive Clock) in `js/demos/ch02-signed.js`:
   a. Implement `buildClock()` following the draw order in Section 5.2.3.
   b. Implement `select(i)`, `hoverNode(i, on)`, `updatePanel()`.
   c. Wire prev/next buttons.
   d. Use `svgEl`, `circleX`, `circleY`, `clockNodeColors` from `bits.js`.
   e. Use `renderBitRow` with `width=4` for the info panel bit row.
3. Implement Demo 2.2 (Bit Explorer) using `renderBitRow` and `toSigned`.
4. Test: step through all 16 values with prev/next; verify wrap 7→−8 and
   −1→0; verify hint messages for 0, 7, −8, −1.

---

### Phase 4 — Chapter 3: Bitwise Operators

1. Write `chapters/03-operators.html`.
2. Implement Demos 3.1–3.4 in `js/demos/ch03-operators.js`.
3. All demos use `renderBitRow`. Operator logic is pure JS bitwise ops.

---

### Phase 5 — Chapter 4: Bit Shifts

1. Write `chapters/04-shifts.html` with prose.
2. Implement Demo 4.1 (Shift Visualizer) in `js/demos/ch04-shifts.js`.
3. Three tabs: left `<<`, logical right `>>>`, arithmetic right `>>`.
4. Test: left by 7 with A=1 → 128; arith right with A=128, n=1 → 192 (−64 signed);
   slider and number input stay in sync.

---

### Phase 6 — Chapter 5: Masks

1. Write `chapters/05-masks.html`.
2. Implement Demo 5.1 (2-tab mask builder) in `js/demos/ch05-masks.js`.
3. Test range mask edge cases: lo=hi, lo=0, hi=7.

---

### Phase 7 — Chapter 6: Bit Tasks

1. Write `chapters/06-bit-tasks.html` with prose and summary table.
2. Implement Demo 6.1 (5-tab explorer) in `js/demos/ch06-bit-tasks.js`.
3. Verify idempotency: set on already-set bit → no change; clear on
   already-clear bit → no change.
4. Verify toggle self-inverse: apply twice → original value.

---

### Phase 8 — Chapter 7: Packing and Unpacking

1. Write `chapters/07-packing-unpacking.html`.
2. Implement Demo 7.1 (3-tab RGB + IPv4) in `js/demos/ch07-packing.js`.
3. Verify round-trip: pack then unpack returns original R, G, B values.

---

### Phase 9 — Chapter 8: Applications

1. Write `chapters/08-applications.html`.
2. Implement Demo 8.1 (Permission System) and Demo 8.2 (Log₂ / powers)
   in `js/demos/ch08-applications.js`.

---

### Phase 10 — Chapter 9: Floating Point

1. Write `chapters/09-floating-point.html` with prose including special
   values subsection.
2. Implement `decodeIEEE754` in `bits.js` first — it must handle all
   cases (normal, denormal, zero, infinity, NaN) correctly before any
   demo UI is written. Test it in isolation with known values.
3. Implement Demo 9.1 (fp32 first, then fp16, then bf16 — same render
   function, different field widths passed as parameters).
4. Implement Demo 9.2 (format comparison).
5. Implement Demo 9.3 (overflow slider).
6. Test: 0.0, 1.0, −1.0, NaN, +∞, min positive denormal in each format.

---

### Phase 11 — Polish and publication

1. Consistency pass: all demos use identical CSS classes, colour meanings,
   and bit box geometry.
2. Responsive pass: bit boxes shrink to 24px on viewports below 480px
   via a media query. Clock SVG scales naturally via `width="100%"`.
3. Accessibility pass: `aria-label` on all clickable bit boxes; keyboard
   navigation for tab components; clock nodes focusable via `tabindex="0"`
   with Enter/Space triggering `select(i)`.
4. Chapter linking: prev/next at bottom of every chapter.
5. Configure GitHub Pages.
6. Final review: all demos load and function on the live GitHub Pages URL.

---

## 7. Summary of All Demos

| #  | Demo                          | Chapter | Type              | Key interaction                    |
|----|-------------------------------|---------|-------------------|------------------------------------|
| 1  | Binary place value explorer   | 1       | Clickable bits    | Toggle bits, watch decimal update  |
| 2  | Two's complement clock        | 2       | Interactive SVG   | Click node, see value + bit pattern|
| 3  | Two's complement bit explorer | 2       | Clickable bits    | Sign bit contributes −128          |
| 4  | AND visualizer                | 3       | Two inputs        | See which bits pass / block        |
| 5  | OR visualizer                 | 3       | Two inputs        | See which bits are forced on       |
| 6  | XOR visualizer                | 3       | Two inputs        | See which bits are toggled         |
| 7  | NOT visualizer                | 3       | Single input      | See all bits flip                  |
| 8  | Shift visualizer              | 4       | Input + 3 modes   | See bits move, drop, fill          |
| 9  | Mask builder                  | 5       | 2-tab             | Build single-bit and range masks   |
| 10 | Bit operations explorer       | 6       | 5-tab, input + k  | Get/set/clear/toggle/update        |
| 11 | RGB packer / unpacker         | 7       | 3-tab             | Pack and unpack fields             |
| 12 | Permission system             | 8       | Toggle switches   | Flags in a realistic context       |
| 13 | Log₂ and powers of 2         | 8       | Number input      | floor log₂, next pow2, check       |
| 14 | IEEE 754 bit explorer         | 9       | 3-tab clickable   | Decode fp32 / fp16 / bf16          |
| 15 | Format comparison             | 9       | Number input      | Same value in 3 formats            |
| 16 | fp16 vs bf16 overflow         | 9       | Slider            | Overflow / underflow comparison    |

---

## 8. Notes for the Coding Agent

- **Start with Phase 1.** `bits.js` and `style.css` must be complete before
  any demo is written. Every demo depends on them.

- **`renderBitRow` is the most used function.** It is called by at least 12 of
  the 16 demos. Its `colorFn` parameter — `(bitIndex, bitValue) => cssClass` —
  is what makes it flexible enough to serve every use case. Get this right first.

- **The clock demo (Demo 2.1) is the most structurally distinct.** It uses
  `svgEl`, `circleX`, `circleY`, and `clockNodeColors` from `bits.js`, none of
  which are used by the other demos. Implement and test the clock before moving
  to Chapter 3, to confirm those utilities work correctly.

- **`decodeIEEE754` is the most algorithmically complex function.** Implement
  it in Phase 9 with a dedicated test suite before writing any float demo UI.
  Edge cases: the all-zeros exponent (zero/denormal), the all-ones exponent
  (infinity/NaN), negative zero, the minimum positive denormal.

- **No external dependencies.** The entire project must work by opening
  `index.html` in a browser with no server, or served by any static file server.
  No npm, no bundler, no CDN imports.

- **Dark mode is required.** All colours must use CSS variables from Section 3.5.
  Never hardcode a colour in a component. The clock demo uses `clockNodeColors()`
  which reads CSS variables at runtime — this is the correct pattern.

- **Responsive is required.** Bit rows use `flex-wrap: wrap`. Bit boxes shrink
  to 24px below 480px via media query. The clock SVG scales automatically via
  `width="100%"` on the SVG element — no JS resize handling needed.

- **The clock rebuilds fully on every select.** Do not refactor this to targeted
  attribute updates unless profiling reveals a real performance problem (it won't
  at 16 nodes). The simplicity of full rebuild is intentional.

- **Commit `CLAUDE.md` in isolation.** Design doc changes must be committed
  separately from code changes, so the version history of the spec is readable
  on its own. Never bundle a `CLAUDE.md` edit into a chapter or CSS commit.
