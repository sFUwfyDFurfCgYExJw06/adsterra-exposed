# Redirect Creative vs Normal Banner — Side by Side

Both creatives below were served from the **same 728x90 banner placement** on the same site. Adsterra decides which to send — the publisher has no control.

## Redirect Creative (Page Hijack)

**File:** [redirect-creative.js](redirect-creative.js)

### What the user sees
Nothing. Zero visible HTML. No image, no text, no banner.

### What actually happens
```javascript
impr();                           // 1. Fire impression pixel (Adsterra gets paid)
window.top.location = url;        // 2. Navigate the ENTIRE page to ad URL
```

### Additional behavior
- Sets a guard variable (`window.top.ls0s9d8fs9df80 = 'no_r'`) to avoid re-triggering
- Optional delay via `setTimeout` based on a numeric parameter
- The destination URL leads to casino sites, crypto scams, or other low-quality advertisers

### Back-button hijack (via child-placement.js)
```javascript
history.pushState(null, null, window.location.href);    // Fake history entry
window.addEventListener('popstate', function() {
    window.location.replace(backButtonData.redirectUrl); // Back button → another ad
});
```

## Normal Image Banner (Legitimate)

**File:** [normal-banner.js](normal-banner.js)

### What the user sees
A 728x90 banner image with a click-through link.

### What actually happens
```html
<a href="advertiser-url" target="_blank">
    <img src="banner-image.jpg" width="728" height="90">
</a>
```
- `impr.gif` fires on load (standard impression tracking)
- `clk.gif` fires on click (standard click tracking)
- No redirect, no hijacking, page stays intact

## The Trap

Adsterra's `invoke.js` checks whether it's running inside an iframe:

```javascript
var isIframe = window !== window['top']
            || document !== window['top']['document']
            || window['self']['location'] !== window['top']['location'];
```

| Environment | What Adsterra serves | CPM | User experience |
|---|---|---|---|
| Top-level (no iframe) | Redirect creative | High | Page hijacked |
| Inside iframe/sandbox | Normal image banner | Near zero | Safe |

**Translation:** "If you protect your users, we won't pay you."

## Evidence

These are real creatives captured from a live Adsterra placement. The redirect creative contains actual tracking domains used by Adsterra's ad delivery network (`realizationnewestfangs.com`, `frs2c.com`, `skinnycrawlinglax.com`).
