# How to Protect Your Users from Adsterra's Page Hijacking

## The Problem

Adsterra's `invoke.js` serves "redirect creatives" through standard banner placements (728x90, 320x50). Instead of showing a banner image, the script:

1. Fires an impression pixel (so they get paid)
2. Executes `window.top.location = "ad-url"` (hijacks the page)
3. Injects `history.pushState` + `popstate` listener (hijacks the back button)

If you sandbox the ad in an iframe, invoke.js detects it and downgrades to zero-CPM image banners.

## The Solution: 3-Layer Hooking

Run invoke.js at the top level (so it thinks it's not sandboxed), but intercept every exit point.

### Layer 1: Auto-Sandbox via createElement Override

invoke.js creates sub-iframes to render creatives. We intercept `document.createElement` to inject `sandbox` on every iframe it creates:

```javascript
const origCreateElement = document.createElement.bind(document);
document.createElement = function() {
  const el = origCreateElement.apply(document, arguments);
  if (typeof arguments[0] === 'string' && arguments[0].toLowerCase() === 'iframe') {
    el.setAttribute('sandbox',
      'allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox'
    );
  }
  return el;
};
```

**Why this works:**
- `allow-top-navigation` is deliberately omitted
- Without it, `window.top.location = url` throws `SecurityError` per HTML spec
- `allow-same-origin` is required — without it, invoke.js can't `contentDocument.write()` into the sub-iframe and the banner won't render
- `allow-top-navigation-by-user-activation` allows legitimate user clicks to navigate
- `allow-popups-to-escape-sandbox` allows legitimate popup clicks

The ad thinks it's running at top level. It fires the impression. It tries to redirect. The browser blocks it. The user sees nothing.

### Layer 2: Back-Button Trap Neutralization

`child-placement.js` stores redirect URLs in `window.backButtonData`. Kill the storage:

```javascript
Object.defineProperty(window, 'backButtonData', {
  get() { return undefined; },
  set() {},
  configurable: false,
});
```

When child-placement.js reads `backButtonData.redirectUrl`, it gets `undefined.redirectUrl` → TypeError → the redirect handler crashes silently. Back button works normally.

**Note:** Don't block `popstate` globally — frameworks like Next.js/React Router use it for client-side navigation.

### Layer 3: eval() Patch (Defense in Depth)

Some creatives execute via top-level `eval()`. Intercept and neutralize redirect patterns:

```javascript
const origEval = window.eval;
window.eval = function(code) {
  if (typeof code !== 'string') return origEval.call(window, code);
  if (code.indexOf('window.top.location') !== -1) {
    code = code.replace(/window\.top\.location\s*=\s*([^;\n]+)/g, 'void(0)');
    code = code.replace(/window\.top\./g, 'window.');
    code = code.replace(/window\.top\b/g, 'window');
  }
  return origEval.call(window, code);
};
```

This is a backup — the iframe sandbox (Layer 1) is the primary defense.

## LieDetector Evasion

invoke.js injects a "LieDetector" component that checks whether native functions have been overridden. Override `Function.prototype.toString` to make hooked functions appear native:

```javascript
const nativeStrs = new Map();
const origToString = Function.prototype.toString;
Function.prototype.toString = function() {
  return nativeStrs.get(this) ?? origToString.call(this);
};
nativeStrs.set(Function.prototype.toString, 'function toString() { [native code] }');

// For each hooked function:
const disguise = (fn, name) =>
  nativeStrs.set(fn, `function ${name}() { [native code] }`);

disguise(hookedCreateElement, 'createElement');
disguise(hookedEval, 'eval');
```

## How invoke.js Works (Reverse Engineering Notes)

### Obfuscation Pattern

```javascript
function b3zocF3(F, O) { F = F - 0x1dc; var m = b3zocF9[F]; return m; }
```

All strings are stored in a shuffled array and accessed via index. Deobfuscation reveals the core logic.

### Creative Delivery Chain

1. `invoke.js` loads from `highperformanceformat.com` (2,051 lines, obfuscated)
2. Checks iframe environment (`window !== window.top`)
3. Loads `child-placement.js` from rotating CDN domains
4. Evaluates creative template via `eval()`
5. Creative fires impression pixel, then attempts redirect

### iframe Detection (Line ~286 of deobfuscated invoke.js)

```javascript
var isIframe = window !== window['top']
            || document !== window['top']['document']
            || window['self']['location'] !== window['top']['location'];
```

If `true` → serves low-CPM image banner (no redirect).
If `false` → serves redirect creative (page hijack).

### Redirect Creative Template

The high-CPM creative has zero visible HTML. It's just:
```javascript
impr();                           // impression tracking
window.top.location = "ad-url";   // page hijack
```

### Back-Button Hijack (child-placement.js, 5,119 bytes)

```javascript
// 1. Push fake history entry
history.pushState(null, null, window.location.href);

// 2. Listen for back button
window.addEventListener('popstate', function() {
    window.location.replace(backButtonData.redirectUrl);
});
```

Uses cookies for frequency capping (1x/day, 365-day expiry).

## Sandbox Attributes Reference

| Attribute | Purpose | Required? |
|-----------|---------|-----------|
| `allow-scripts` | Creative JS execution | Yes |
| `allow-same-origin` | invoke.js contentDocument access | Yes |
| `allow-top-navigation-by-user-activation` | Legitimate user click navigation | Yes |
| `allow-popups-to-escape-sandbox` | Legitimate popup clicks | Yes |
| `allow-top-navigation` | **OMIT THIS** — this is what enables the hijack | No |

## Browser Compatibility

All modern browsers support `sandbox` with `allow-top-navigation-by-user-activation` (Safari 11.1+, Chrome 56+, Firefox 79+). This is an HTML spec feature, not a hack.

## Important Notes

- The iframe sandbox is the **primary defense** — it relies on browser-level security that no amount of JavaScript obfuscation can bypass
- eval() patching is pattern-based and can be evaded by obfuscation — treat it as defense in depth only
- This approach preserves legitimate impression tracking (`impr.gif` beacons fire normally)
- User-initiated clicks work normally (via `allow-top-navigation-by-user-activation`)

---

*See my other gist for the full incident report on Adsterra's business practices.*
