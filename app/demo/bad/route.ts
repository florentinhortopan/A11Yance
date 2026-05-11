/**
 * A deliberately-bad demo page. Exposed as raw HTML so /api/analyze can fetch
 * it like any external URL. Full of common a11y sins on purpose.
 */

export const dynamic = "force-static";

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>FlashCorp 9000 — Synergize Your Verticals</title>
  <style>
    body { margin:0; font-family: Arial, sans-serif; background:#444; color:#777; }
    .wrap { padding:24px; }
    .logo { font-size:32px; color:#888; font-weight:700; }
    .tag { font-size:11px; color:#666; }
    .copy { margin-top:20px; color:#999; }
    .why { margin-top:18px; font-weight:700; color:#888; }
    .bullet { color:#999; }
    .cta { margin-top:22px; padding:10px; background:#555; color:#888; cursor:pointer; display:inline-block; }
    .links a { color:#666; }
    .small { margin-top:18px; font-size:10px; color:#666; }
    input { background:#555; color:#888; border:1px solid #666; padding:6px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo" onclick="">FlashCorp 9000</div>
    <div class="tag">Welcome to the new website experience reimagined.</div>

    <img src="https://placehold.co/600x200" />
    <img src="https://placehold.co/120x120" alt="image" />

    <div class="copy">
      FlashCorp 9000 delivers next-generation synergy for forward-thinking enterprises.
      Our AI-native, blockchain-enabled platform reimagines the way verticals integrate
      horizontals to unlock hyper-scalable value at the edge.
    </div>

    <div class="why">Why FlashCorp?</div>
    <div style="margin-top:8px">
      <div class="bullet">* 10x faster than legacy</div>
      <div class="bullet">* Cloud-first, mobile-only</div>
      <div class="bullet">* Backed by patented synergy</div>
    </div>

    <div class="cta" onclick="">Sign up now</div>

    <div class="links" style="margin-top:18px">
      <a href="#">click here</a> for our latest report.
      <a href="#">click here</a> for pricing.
      <a href="#">click here</a> to read the terms.
    </div>

    <form style="margin-top:22px">
      <input type="text" placeholder="email" />
      <input type="password" placeholder="password" />
      <input type="submit" value="Go" />
    </form>

    <div class="small">(c) FlashCorp 9000 — All rights nominally reserved. Powered by sparkle &amp; spin.</div>
  </div>
</body>
</html>`;

export async function GET() {
  return new Response(HTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
