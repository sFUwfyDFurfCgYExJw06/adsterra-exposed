# Adsterra Sells "Banner Ads" But Actually Hijacks Your Entire Page

## What I Bought

I signed up as an Adsterra publisher and created two standard display placements:
- 728x90 (desktop leaderboard)
- 320x50 (mobile banner)

These are the most basic ad formats in the industry. A rectangle. An image. A click. That's it.

## What Adsterra Actually Served

Instead of a banner image, Adsterra silently injected code that:

1. **Redirected the user's entire page** to a third-party URL (casinos, scam crypto sites, etc.)
2. **Hijacked the browser back button** so pressing "Back" sent users to *another* ad URL instead of the previous page

Here's the actual pattern from their obfuscated `invoke.js` (2,051 lines):

```javascript
// Step 1: Fire the impression pixel (they get paid)
impr();

// Step 2: Steal the user's page
window.top.location = "https://tracking-domain.com/...";
```

And from `child-placement.js` — the back-button hijack:

```javascript
// Inject fake browser history
history.pushState(null, null, window.location.href);

// When user presses Back, redirect to another ad
window.addEventListener('popstate', function() {
    window.location.replace("https://another-ad-url.com/...");
});
```

This isn't a banner ad. This is a **page hijack sold as a banner ad**.

## The Trap: You Can't Protect Your Users Without Losing Revenue

If you put the ad in an iframe with sandbox (standard web security), Adsterra's invoke.js **detects the iframe** and refuses to serve the high-CPM redirect creatives:

```javascript
var isIframe = window !== window['top']
            || document !== window['top']['document']
            || window['self']['location'] !== window['top']['location'];
```

If iframe is detected → you get a regular image banner at near-zero CPM.
If no iframe → your users get hijacked, but you earn revenue.

**"Want to protect your users? Then we won't pay you."** — That's the deal.

## My Experience

- **200,000+ legitimate impressions** in the first 24 hours
- All real human traffic, zero bots, zero self-clicks
- Revenue accrued to ~$35
- Then Adsterra **froze my stats**, **banned my account**, and **refunded all revenue to advertisers**
- No specific explanation, no appeal process, no evidence provided

200,000 real users saw real ads. Advertisers got real impressions. Adsterra collected from both sides, then kept everything.

## The Business Model

1. Sell "banner ads" to publishers
2. Actually serve page hijacks that destroy user experience
3. If the publisher tries to protect their users → ban them
4. If the publisher doesn't protect their users → their site becomes unusable
5. Either way, Adsterra wins

## Who This Affects

Every Adsterra publisher running display ads. If you're using their 728x90, 320x50, or similar placements, check your browser's network tab. You might find your users are being redirected without your knowledge.

## Where does the money go?

Let's think about this:

1. Advertiser pays Adsterra for 200,000+ impressions
2. Those impressions are delivered to real users on a real site
3. Adsterra bans the publisher and claims to "refund" advertisers
4. **Did Adsterra actually refund the advertisers? We have no way to verify.**
5. If they didn't, Adsterra just collected from both sides and paid no one

This creates a perverse incentive: ban publishers periodically, keep the revenue, claim it was "refunded."

## Recommendations

- **Don't use Adsterra** for display ads unless you're okay with your users being redirected to scam sites
- If you must use them, monitor what their scripts actually do — not what they claim to do
- Consider ad networks that don't weaponize the publisher-user relationship
- If you've been similarly burned, share your story — you're not alone

## Further Reading

- **[Technical Deep Dive](TECHNICAL.md)** — How to protect your users from Adsterra's redirect creatives
- **[Evidence: Redirect Creative](evidence/redirect-creative.js)** — Actual code Adsterra serves through "banner" placements
- **[Evidence: Normal vs Redirect](evidence/creative-comparison.md)** — Side-by-side comparison
- **[Evidence: Ban Notice](evidence/ban-message.md)** — What happens when you protect your users
- **[Evidence: Request Chain](evidence/request-chain.md)** — Full reverse engineering of invoke.js
