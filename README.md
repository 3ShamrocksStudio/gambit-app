# gambit-app
LinkedIn chess ice-breaker — connects professionals through gameplay

## Share links and link previews
- Challenge / result links point at small static pages that carry the LinkedIn link-preview card, then forward to the app with the same `?c=` payload:
  - `s/c.html` — "You've been challenged" (`og/challenge.png`)
  - `s/w.html` — "Can you beat my game?" (`og/win.png`)
  - `s/b.html` — "Beat my Opening Bell time" (`og/bell.png`)
- The home page uses `og/default.png`. Images are 1200×627 PNG.
- GitHub Pages is static, so the card text is fixed per link type. The sender's name shows inside the app (banner and tab title), not in the preview card.
- The share pages have no `og:url` on purpose, so LinkedIn keeps the `?c=` payload.

## Ads (disabled)
Nothing ad-related loads, renders or calls out while `RK_ADS = null` (in `index.html`, section "ADS").

The hook is a rewarded "watch to earn coins" button in the Coin Vault. It uses Google's H5 Games Ads (Ad Placement API: `adBreak` / `adConfig`) and needs an approved AdSense account with H5 Games Ads enabled.

To turn it on, replace `const RK_ADS = null;` with:

```js
const RK_ADS = {
  client: 'ca-pub-XXXXXXXXXXXXXXXX', // AdSense publisher ID (required; must match ca-pub-<digits>)
  rewardCoins: 20,                    // coins granted per completed ad (1–100)
  dailyCap: 5,                        // rewarded ads per user per day
  test: true,                         // adds data-adbreak-test="on" (test ads); set false only after approval
  frequencyHint: '30s',               // data-ad-frequency-hint
  inApp: false,                       // keep ads off inside LinkedIn / other in-app browsers
};
```

How it behaves once configured:
- Opening the Coin Vault loads `adsbygoogle.js?client=…` once, calls `adConfig({ preloadAdBreaks: 'on', sound })`, then asks for a `reward` break.
- The button only appears when the API calls `beforeReward` (an ad is actually ready). Coins are granted only in `adViewed`. `adDismissed` grants nothing.
- Before going live, check the loader snippet against the current Ad Placement API docs, and check that coin rewards meet Google's reward rules (rewards must have no value outside the app).
