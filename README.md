# passkey.github.io

**What is a Passkey?** — a community knowledge-sharing website covering everything
you need to know about passwordless authentication.

Built with vanilla HTML/CSS/JS. Features:

- Animated ASCII-art background (multi-layer "character rain")
- Glitching ASCII key art in the hero
- Parallax scrolling throughout
- Dark theme, reveal-on-scroll animations, fully responsive

## Content

1. What is a passkey?
2. Why do we need it — and how did it emerge?
3. Does it replace passwords & traditional authentication?
4. How is it generated — and why is it stronger?
5. Where is it stored — device-specific or user-specific?
6. What if you forget your passkey?
7. Dos and Don'ts
8. What if you lose or destroy your device?

## Run locally

Just open `index.html` in a browser — no build step needed.

Or serve it:

```bash
python -m http.server 8000
# -> http://localhost:8000
```

## Deploy (GitHub Pages)

The site is served directly from the repository root:

```bash
gh api repos/{owner}/passkey.github.io/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

Then visit `https://{owner}.github.io/passkey.github.io/`.
