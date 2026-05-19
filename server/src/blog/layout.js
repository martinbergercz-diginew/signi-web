// HTML shell for the SSR blog — header, footer, GTM, matching the public site.

const GTM_ID = 'GTM-WP6ZVZF';

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

const header = `
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="brand-logo" href="/">Signi</a>
      <nav class="site-nav" aria-label="Hlavní navigace">
        <a href="/produkt/">Produkt</a>
        <a href="/pro-firmy/">Řešení pro firmy</a>
        <a href="/cenik/">Ceník</a>
        <a href="/blog/">Blog</a>
      </nav>
      <a class="btn" href="/odeslat-poptavku/">Domluvit prezentaci</a>
    </div>
  </header>`;

const footer = `
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <span>© ${new Date().getFullYear()} Digital factory s.r.o. — všechna práva vyhrazena.</span>
      <span><a href="/blog/rss.xml">RSS</a> · <a href="/">signi.com</a></span>
    </div>
  </footer>`;

// description and canonical are optional.
export function renderPage({ title, description = '', canonical = '', body }) {
  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#7031b4" />
<title>${escapeHtml(title)}</title>
${description ? `<meta name="description" content="${escapeHtml(description)}" />` : ''}
<meta property="og:title" content="${escapeHtml(title)}" />
${description ? `<meta property="og:description" content="${escapeHtml(description)}" />` : ''}
${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : ''}
<link rel="alternate" type="application/rss+xml" title="Signi blog" href="/blog/rss.xml" />
<link rel="stylesheet" href="/blog/styles.css" />
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
</script>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');</script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
${header}
<main>
${body}
</main>
${footer}
</body>
</html>`;
}
