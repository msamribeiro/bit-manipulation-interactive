# Bit Manipulation — Interactive Tutorial

An interactive, self-contained tutorial on bit manipulation. From binary place values to IEEE 754 floating-point formats — every concept has a hands-on demo. Built with vanilla HTML, CSS, and JavaScript. No dependencies, no build step.

## Live demo

> https://msamribeiro.github.io/bit-manipulation-interactive/

## Topics covered

1. **Binary Place Values** — how bits combine to represent any whole number
2. **Signed Integers** — two's complement and negative numbers in binary
3. **Bitwise Operators** — AND, OR, XOR, NOT, and shifts applied bit-by-bit
4. **Bit Shifts** — logical and arithmetic shifts as powers of two
5. **Bit Tasks** — get, set, clear, toggle, and update individual bits
6. **Masks** — building and applying single-bit and range masks
7. **Packing and Unpacking** — bit fields in pixel formats, network headers, and hardware registers
8. **Applications** — permissions, log₂, and common competitive programming patterns
9. **Floating Point** — IEEE 754 internals covering fp32, fp16, and bf16 (with ML context)

## Local development

No server required — open `index.html` directly in any modern browser:

```
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or serve it with any static file server:

```bash
python -m http.server 8080
# then open http://localhost:8080
```

## Project structure

```
bit-manipulation-interactive/
├── index.html          # Landing page / table of contents
├── css/
│   └── style.css       # Unified stylesheet for all pages
├── js/
│   ├── bits.js         # Shared utilities (renderBitRow, toBin, etc.)
│   └── demos/          # One JS file per chapter demo
├── chapters/           # One HTML file per chapter
└── assets/             # Static assets (favicon, etc.)
```

The design specification and implementation guide are in [`CLAUDE.md`](CLAUDE.md).

## License

MIT
