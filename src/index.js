import { OG_JPG, APPLE_ICON_PNG } from "./images.js";

// Primary domain: every other hostname (www, pp.ua, workers.dev) 301-redirects here.
const PRIMARY = "switchcraft.com.ua";
const REDIRECT = true;

const bin = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
const images = {
  "/og.jpg": ["image/jpeg", OG_JPG],
  "/apple-touch-icon.png": ["image/png", APPLE_ICON_PNG],
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (REDIRECT && url.hostname !== PRIMARY) {
      url.hostname = PRIMARY; url.protocol = "https:"; url.port = "";
      return Response.redirect(url.toString(), 301);
    }
    const img = images[url.pathname];
    if (img) return new Response(bin(img[1]), { headers: { "content-type": img[0], "cache-control": "public, max-age=86400" } });
    const response = await env.ASSETS.fetch(request);
    const locale = url.pathname.match(/^\/(en|ru)(?:\/|$)/)?.[1];
    if (response.status === 404 && locale) {
      const fallback = new URL(`/${locale}/404`, url);
      const page = await env.ASSETS.fetch(new Request(fallback, request));
      return new Response(page.body, { status: 404, headers: page.headers });
    }
    return response;
  },
};
