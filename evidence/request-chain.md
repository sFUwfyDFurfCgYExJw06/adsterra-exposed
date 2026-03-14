# Adsterra Ad Delivery Chain

## How invoke.js Works

### Loading sequence

1. Publisher page sets `window.atOptions` with placement key and dimensions
2. Publisher appends `https://www.highperformanceformat.com/<key>/invoke.js`
3. `invoke.js` (2,051 lines, heavily obfuscated) executes and:
   - Checks iframe environment (`window !== window.top`)
   - Loads `child-placement.js` from rotating CDN domains
   - Evaluates the creative template via `eval()`
4. Creative either shows a banner or hijacks the page

### Obfuscation pattern

```javascript
function b3zocF3(F, O) { F = F - 0x1dc; var m = b3zocF9[F]; return m; }
```

All strings are stored in a shuffled array and accessed via computed indices. This makes the code unreadable without deobfuscation, but the runtime behavior is clear from the creative output.

### iframe detection (deobfuscated)

```javascript
var isIframe = window !== window['top']
            || document !== window['top']['document']
            || window['self']['location'] !== window['top']['location'];
```

This is the gate. If `true` → safe banner. If `false` → redirect creative.

## Redirect Creative Chain

```
invoke.js
  └─ iframe detection: NOT in iframe
  └─ child-placement loader (skinnycrawlinglax.com, etc.)
  └─ eval(creative_template)
       ├─ impr.gif → impression tracked, Adsterra gets paid
       ├─ window.top.location = ad_url → PAGE HIJACKED
       └─ backButtonData.redirectUrl → BACK BUTTON HIJACKED
```

## Normal Banner Chain

```
invoke.js
  └─ iframe detection: IN iframe
  └─ child-placement loader
  └─ eval(creative_template)
       ├─ <a><img></a> → visible banner rendered
       ├─ impr.gif → impression tracked
       └─ clk.gif on click → click tracked
       └─ No redirect, no hijacking
```

## Decision Inputs

The obfuscated loader uses these signals to decide what to serve:

- `window.top`, `window.parent`, `window.self` — iframe detection
- `window.frameElement` — iframe detection backup
- `window.ancestorOrigins` — origin chain check
- `document.referrer`, `document.URL` — context validation
- `location.hostname` — domain verification
- `localStorage` and cookies — frequency capping
- Browser/OS/touch signals — device fingerprinting
- DevTools/emulation checks — anti-analysis

## LieDetector

invoke.js injects a component called "LieDetector" that checks whether native browser functions have been overridden. This is specifically designed to detect publishers who try to protect their users by hooking `document.createElement`, `eval`, or other APIs.

If LieDetector catches you protecting your users → account ban.

## CDN Domains

Adsterra rotates through multiple domains for ad delivery:
- `highperformanceformat.com` — invoke.js host
- `realizationnewestfangs.com` — impression/click tracking
- `skinnycrawlinglax.com` — impression/click tracking
- `frs2c.com` — redirect destination broker

These domains change periodically.
