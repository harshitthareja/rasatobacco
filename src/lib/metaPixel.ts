/**
 * Meta (Facebook) Pixel. The base code loads in <head> on every page and
 * records the first PageView; the site then changes pages without a full
 * reload, so later page views are sent from the router (trackPageView).
 */

export const META_PIXEL_ID = "1073056589066889";

/** Meta's base code, unchanged apart from the pixel id. */
export const metaPixelScript = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`;

type Fbq = (...args: unknown[]) => void;

export function trackPageView() {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  fbq?.("track", "PageView");
}
