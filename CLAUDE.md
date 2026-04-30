# Bit Manipulation Interactive Tutorial

Interactive bit manipulation tutorial — 10 chapters, vanilla HTML/CSS/JS, no dependencies.
Full specification (chapter prose, demo details, implementation phases): see [DESIGN.md](DESIGN.md).

---

## Repository Structure

```
bit-manipulation/
├── index.html
├── css/style.css                     # Single unified stylesheet
├── js/
│   ├── bits.js                       # Core shared utilities
│   └── demos/                        # ch01-place-values.js … ch10-floats.js
├── chapters/                         # 01-place-values.html … 10-floating-point.html
└── assets/favicon.svg
```

**Completed:** Chapters 1–4 (`chapters/01`–`04`, `js/demos/ch01`–`ch04`).
**Next:** Chapter 5 — Bit Masks (`chapters/05-bit-masks.html`, `js/demos/ch05-bit-masks.js`).

---

## Design System — Bit State Classes

All demos use `renderBitRow` with a `colorFn` that returns one of these CSS classes:

| Class       | Meaning                            |
|-------------|------------------------------------|
| `.b-1`      | Bit is 1 (default)                 |
| `.b-0`      | Bit is 0 (default)                 |
| `.b-target` | The bit position being operated on |
| `.b-pass`   | Bit passed through unchanged       |
| `.b-block`  | Bit blocked / zeroed by mask       |
| `.b-set`    | Bit forced to 1 by operation       |
| `.b-clear`  | Bit forced to 0 by operation       |
| `.b-flip`   | Bit toggled by XOR                 |
| `.b-sign`   | Sign bit (two's complement)        |
| `.b-mask-1` | Mask bit = 1 (open)                |
| `.b-mask-0` | Mask bit = 0 (closed)              |
| `.b-exp`    | Exponent field (floats)            |
| `.b-mant`   | Mantissa field (floats)            |

All colours must use CSS variables — never hardcode. Available variables:

```
--surface-1  --surface-2  --surface-3  --border  --text-primary  --text-muted
--blue-bg    --blue-text    --blue-border
--green-bg   --green-text
--red-bg     --red-text
--amber-bg   --amber-text
--purple-bg  --purple-text
--zero-bg    --zero-text    --zero-border
```

Light and dark mode values are defined in `css/style.css`.

---

## `js/bits.js` API

```js
renderBitRow(container, value, width, colorFn, clickFn?)
  // colorFn: (bitIndex, bitValue) => cssClass  — bitIndex 0 = LSB

renderIndexRow(container, width)

toBin(value, width)          // zero-padded binary string
toSigned(unsigned, bits)     // two's complement signed value
clamp(value, min, max)       // clamp and coerce to integer

svgEl(tag, attrs)            // SVG element factory
circleX(cx, r, angleDeg)
circleY(cy, r, angleDeg)

decodeIEEE754(bits, expBits, mantBits)
  // returns { sign, expRaw, bias, expActual, mantFrac, value, kind }
  // kind: 'zero' | 'normal' | 'denormal' | 'infinity' | 'nan'

clockNodeColors(signedVal)   // returns { fill, stroke, text } from CSS vars
```

---

## Remaining Work

| Phase | Chapter                  | Files                                              | Key demo                        |
|-------|--------------------------|----------------------------------------------------|---------------------------------|
| 6     | Ch5 — Bit Masks          | `05-bit-masks.html`, `ch05-bit-masks.js`           | Mask builder (2-tab)            |
| 7     | Ch6 — Bit Tasks          | `06-bit-tasks.html`, `ch06-bit-tasks.js`           | Bit ops explorer (5-tab)        |
| 8     | Ch7 — Bit Puzzles        | `07-bit-puzzles.html`, `ch07-bit-puzzles.js`       | Stepper demos (4 puzzles)       |
| 9     | Ch8 — Packing            | `08-packing-unpacking.html`, `ch08-packing.js`     | RGB packer (3-tab)              |
| 10    | Ch9 — Bit Patterns       | `09-bit-patterns.html`, `ch09-bit-patterns.js`     | Permission system + log₂        |
| 11    | Ch10 — Floating Point    | `10-floating-point.html`, `ch10-floats.js`         | IEEE 754 explorer + comparisons |
| 12    | Polish                   | all                                                | Responsive, a11y, GitHub Pages  |

See DESIGN.md §5 for chapter/demo specs and §6 for full phase instructions.

---

## Working Rules

- **No external dependencies.** Vanilla HTML/CSS/JS only. No npm, no bundler, no CDN.
- **Dark mode required.** Use CSS variables only — never hardcode a colour.
- **Responsive required.** `flex-wrap: wrap` on bit rows; bit boxes shrink to 24px below 480px; clock SVG scales via `width="100%"`.
- **Clock rebuilds fully on every select.** Do not refactor to targeted attribute updates.
- **Stepper pattern (Ch7):** steps are a plain array of `{ value, operation, explanation }` objects; stepper state is a single index; keep each puzzle's step-builder self-contained (e.g. `buildUniqueNumberSteps(arr)`).
- **`decodeIEEE754` (Ch10):** implement and test in isolation before writing any float demo UI. Edge cases: all-zeros exponent (zero/denormal), all-ones exponent (infinity/NaN), negative zero, minimum positive denormal.
- **Commit `CLAUDE.md` and `DESIGN.md` in isolation.** Never bundle spec changes with code commits.
