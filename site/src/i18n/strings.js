// UI strings per language. Page body content is migrated per-page;
// this file only covers chrome (header, footer, CTAs).

export const LANGS = ['cs', 'en', 'sk', 'hu'];

export const homePath = { cs: '/', en: '/en/', sk: '/sk/', hu: '/hu/' };

// hreflang alternates for the four language home pages. Only home pages get a
// full set — interior pages are not 1:1 translations (see discovery).
export const homeAlternates = [
  { lang: 'cs', href: 'https://signi.com/' },
  { lang: 'en', href: 'https://signi.com/en/' },
  { lang: 'sk', href: 'https://signi.com/sk/' },
  { lang: 'hu', href: 'https://signi.com/hu/' },
  { lang: 'x-default', href: 'https://signi.com/' },
];

export const strings = {
  cs: {
    nav: [
      { label: 'Produkt', href: '/produkt/' },
      { label: 'Řešení pro firmy', href: '/pro-firmy/' },
      { label: 'Ceník', href: '/cenik/' },
      { label: 'Integrace', href: '/integrace/' },
      { label: 'Blog', href: '/blog/' },
    ],
    ctaDemo: { label: 'Domluvit prezentaci', href: '/odeslat-poptavku/' },
    ctaTry: { label: 'Vyzkoušet zdarma', href: 'https://app.signi.com/register' },
    login: { label: 'Přihlášení', href: 'https://app.signi.com/login' },
    footer: {
      tagline: 'Signi je vše, co potřebujete, abyste se dohodli — elektronický podpis dokumentů online.',
      cols: [
        {
          title: 'Produkt',
          links: [
            { label: 'Možnosti produktu', href: '/produkt/' },
            { label: 'Druhy elektronických podpisů', href: '/druhy-elektronickych-podpisu/' },
            { label: 'Ceník', href: '/cenik/' },
            { label: 'Integrace', href: '/integrace/' },
          ],
        },
        {
          title: 'Řešení',
          links: [
            { label: 'Řešení pro firmy', href: '/pro-firmy/' },
            { label: 'Novela zákona', href: '/novela/' },
            { label: 'Dokumenty ke stažení', href: '/dokumenty-ke-stazeni/' },
            { label: 'Partneři', href: '/partneri/' },
          ],
        },
        {
          title: 'Společnost',
          links: [
            { label: 'Kariéra', href: '/kariera/' },
            { label: 'Blog', href: '/blog/' },
            { label: 'Kontakt', href: '/kontakt/' },
            { label: 'Domluvit prezentaci', href: '/odeslat-poptavku/' },
          ],
        },
        {
          title: 'Podpora',
          links: [
            { label: 'Nápověda', href: 'https://helpdesk.signi.com' },
            { label: 'Přihlášení', href: 'https://app.signi.com/login' },
            { label: 'Vyzkoušet zdarma', href: 'https://app.signi.com/register' },
          ],
        },
      ],
      legal: 'Digital factory s.r.o. — všechna práva vyhrazena.',
    },
  },

  en: {
    nav: [
      { label: 'Product', href: '/en/product/' },
      { label: 'For companies', href: '/en/for-companies/' },
      { label: 'Pricing', href: '/en/pricing/' },
      { label: 'Partners', href: '/en/partners/' },
      { label: 'Blog', href: '/en/blog-2/' },
    ],
    ctaDemo: { label: 'Request a demo', href: '/en/request-demo/' },
    ctaTry: { label: 'Try for free', href: 'https://app.signi.com/register' },
    login: { label: 'Log in', href: 'https://app.signi.com/login' },
    footer: {
      tagline: 'Signi is everything you need to close a deal — sign documents electronically, online.',
      cols: [
        {
          title: 'Product',
          links: [
            { label: 'Product', href: '/en/product/' },
            { label: 'Security', href: '/en/security/' },
            { label: 'Pricing', href: '/en/pricing/' },
            { label: 'Request a demo', href: '/en/request-demo/' },
          ],
        },
        {
          title: 'Solutions',
          links: [
            { label: 'For companies', href: '/en/for-companies/' },
            { label: 'Human resources', href: '/en/human-resources/' },
            { label: 'Real estate', href: '/en/real-estate/' },
            { label: 'Logistics', href: '/en/logistics/' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About us', href: '/en/about-us/' },
            { label: 'Career', href: '/en/career/' },
            { label: 'Partners', href: '/en/partners/' },
            { label: 'Contact', href: '/en/contact/' },
          ],
        },
        {
          title: 'Support',
          links: [
            { label: 'Help desk', href: 'https://helpdesk.signi.com' },
            { label: 'Log in', href: 'https://app.signi.com/login' },
            { label: 'Try for free', href: 'https://app.signi.com/register' },
          ],
        },
      ],
      legal: 'Digital factory s.r.o. — all rights reserved.',
    },
  },

  sk: {
    nav: [
      { label: 'Cenník', href: '/sk/cennik/' },
      { label: 'Kariéra', href: '/sk/vasa-kariera/' },
    ],
    ctaDemo: { label: 'Dohodnúť prezentáciu', href: '/sk/' },
    ctaTry: { label: 'Vyskúšať zadarmo', href: 'https://app.signi.com/register' },
    login: { label: 'Prihlásenie', href: 'https://app.signi.com/login' },
    footer: {
      tagline: 'Signi je všetko, čo potrebujete, aby ste sa dohodli — elektronický podpis dokumentov online.',
      cols: [
        {
          title: 'Signi',
          links: [
            { label: 'Domov', href: '/sk/' },
            { label: 'Cenník', href: '/sk/cennik/' },
            { label: 'Vaša kariéra', href: '/sk/vasa-kariera/' },
          ],
        },
        {
          title: 'Podpora',
          links: [
            { label: 'Nápoveda', href: 'https://helpdesk.signi.com' },
            { label: 'Prihlásenie', href: 'https://app.signi.com/login' },
            { label: 'Vyskúšať zadarmo', href: 'https://app.signi.com/register' },
          ],
        },
      ],
      legal: 'Digital factory s.r.o. — všetky práva vyhradené.',
    },
  },

  hu: {
    nav: [],
    ctaDemo: { label: 'Bemutató igénylése', href: '/hu/' },
    ctaTry: { label: 'Ingyenes kipróbálás', href: 'https://app.signi.com/register' },
    login: { label: 'Bejelentkezés', href: 'https://app.signi.com/login' },
    footer: {
      tagline: 'A Signi minden, amire szüksége van a megállapodáshoz — dokumentumok elektronikus aláírása online.',
      cols: [
        {
          title: 'Signi',
          links: [{ label: 'Főoldal', href: '/hu/' }],
        },
        {
          title: 'Támogatás',
          links: [
            { label: 'Súgó', href: 'https://helpdesk.signi.com' },
            { label: 'Bejelentkezés', href: 'https://app.signi.com/login' },
            { label: 'Ingyenes kipróbálás', href: 'https://app.signi.com/register' },
          ],
        },
      ],
      legal: 'Digital factory s.r.o. — minden jog fenntartva.',
    },
  },
};
