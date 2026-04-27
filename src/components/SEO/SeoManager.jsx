import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_SITE_URL = 'https://okkazo.vercel.app';
const DEFAULT_OG_IMAGE = '/favicon.png';
const INDEX_ROBOTS = 'index, follow, max-image-preview:large';
const NOINDEX_ROBOTS = 'noindex, nofollow';

const SITE_URL = String(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).trim().replace(/\/$/, '');

const PUBLIC_SEO_RULES = [
  {
    match: (pathname) => pathname === '/',
    title: 'Okkazo | Plan, Promote, and Manage Events End-to-End',
    description:
      'Okkazo helps you plan events, coordinate vendors, promote live experiences, and manage attendees with one seamless platform.',
    robots: INDEX_ROBOTS,
  },
  {
    match: (pathname) => pathname === '/pricing',
    title: 'Event Planning Pricing and Quote Requests | Okkazo',
    description:
      'Get a tailored event planning quote from Okkazo. Compare services, estimate costs, and start planning your next event with confidence.',
    robots: INDEX_ROBOTS,
  },
  {
    match: (pathname) => pathname === '/login',
    title: 'Sign In | Okkazo',
    description: 'Sign in to your Okkazo account to manage events, vendors, dashboards, and bookings.',
    robots: NOINDEX_ROBOTS,
  },
  {
    match: (pathname) => pathname === '/register',
    title: 'Create Account | Okkazo',
    description: 'Create an Okkazo account to plan and manage events from one unified platform.',
    robots: NOINDEX_ROBOTS,
  },
  {
    match: (pathname) => pathname === '/forgot-password',
    title: 'Forgot Password | Okkazo',
    description: 'Recover access to your Okkazo account.',
    robots: NOINDEX_ROBOTS,
  },
  {
    match: (pathname) => pathname === '/reset-password',
    title: 'Reset Password | Okkazo',
    description: 'Set a new password for your Okkazo account.',
    robots: NOINDEX_ROBOTS,
  },
  {
    match: (pathname) => pathname === '/verify-email',
    title: 'Verify Email | Okkazo',
    description: 'Verify your email address to activate your Okkazo account.',
    robots: NOINDEX_ROBOTS,
  },
  {
    match: (pathname) => pathname === '/resend-verification',
    title: 'Resend Verification | Okkazo',
    description: 'Request another email verification link for Okkazo.',
    robots: NOINDEX_ROBOTS,
  },
  {
    match: (pathname) => pathname === '/quote-success',
    title: 'Quote Request Submitted | Okkazo',
    description: 'Your quote request has been submitted successfully.',
    robots: NOINDEX_ROBOTS,
  },
];

const PRIVATE_PATH_PREFIXES = ['/admin', '/manager', '/user', '/vendor', '/refund-policy'];

const normalizePathname = (pathname) => {
  if (!pathname) {
    return '/';
  }

  const trimmed = pathname.trim();
  if (trimmed.length > 1 && trimmed.endsWith('/')) {
    return trimmed.slice(0, -1);
  }

  return trimmed || '/';
};

const ensureMetaTag = (selector, createAttributes) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement('meta');
    Object.entries(createAttributes).forEach(([key, value]) => {
      tag.setAttribute(key, value);
    });
    document.head.appendChild(tag);
  }

  return tag;
};

const ensureCanonicalTag = () => {
  let tag = document.head.querySelector('link[rel="canonical"]');

  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }

  return tag;
};

const ensureJsonLdTag = () => {
  let tag = document.head.querySelector('script#seo-json-ld');

  if (!tag) {
    tag = document.createElement('script');
    tag.setAttribute('id', 'seo-json-ld');
    tag.setAttribute('type', 'application/ld+json');
    document.head.appendChild(tag);
  }

  return tag;
};

const SeoManager = ({ isServerDown = false }) => {
  const location = useLocation();

  useEffect(() => {
    const pathname = normalizePathname(location.pathname);
    const currentUrl = `${SITE_URL}${pathname}`;
    const imageUrl = `${SITE_URL}${DEFAULT_OG_IMAGE}`;

    let seo = PUBLIC_SEO_RULES.find((rule) => rule.match(pathname));

    if (!seo) {
      const isPrivate = PRIVATE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

      if (isServerDown) {
        seo = {
          title: 'Service Unavailable | Okkazo',
          description: 'Okkazo services are temporarily unavailable. Please try again shortly.',
          robots: NOINDEX_ROBOTS,
        };
      } else if (isPrivate) {
        seo = {
          title: 'Okkazo Workspace',
          description: 'Secure workspace for authenticated Okkazo users.',
          robots: NOINDEX_ROBOTS,
        };
      } else {
        seo = {
          title: 'Page Not Found | Okkazo',
          description: 'The page you are looking for could not be found on Okkazo.',
          robots: NOINDEX_ROBOTS,
        };
      }
    }

    document.title = seo.title;

    const metaDescription = ensureMetaTag('meta[name="description"]', { name: 'description' });
    metaDescription.setAttribute('content', seo.description);

    const metaRobots = ensureMetaTag('meta[name="robots"]', { name: 'robots' });
    metaRobots.setAttribute('content', seo.robots);

    const canonicalTag = ensureCanonicalTag();
    canonicalTag.setAttribute('href', currentUrl);

    const ogTitle = ensureMetaTag('meta[property="og:title"]', { property: 'og:title' });
    ogTitle.setAttribute('content', seo.title);

    const ogDescription = ensureMetaTag('meta[property="og:description"]', { property: 'og:description' });
    ogDescription.setAttribute('content', seo.description);

    const ogType = ensureMetaTag('meta[property="og:type"]', { property: 'og:type' });
    ogType.setAttribute('content', pathname === '/' ? 'website' : 'article');

    const ogUrl = ensureMetaTag('meta[property="og:url"]', { property: 'og:url' });
    ogUrl.setAttribute('content', currentUrl);

    const ogImage = ensureMetaTag('meta[property="og:image"]', { property: 'og:image' });
    ogImage.setAttribute('content', imageUrl);

    const ogSiteName = ensureMetaTag('meta[property="og:site_name"]', { property: 'og:site_name' });
    ogSiteName.setAttribute('content', 'Okkazo');

    const twitterCard = ensureMetaTag('meta[name="twitter:card"]', { name: 'twitter:card' });
    twitterCard.setAttribute('content', 'summary_large_image');

    const twitterTitle = ensureMetaTag('meta[name="twitter:title"]', { name: 'twitter:title' });
    twitterTitle.setAttribute('content', seo.title);

    const twitterDescription = ensureMetaTag('meta[name="twitter:description"]', { name: 'twitter:description' });
    twitterDescription.setAttribute('content', seo.description);

    const twitterImage = ensureMetaTag('meta[name="twitter:image"]', { name: 'twitter:image' });
    twitterImage.setAttribute('content', imageUrl);

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Okkazo',
      url: SITE_URL,
      description:
        'Plan, promote, and manage events end-to-end with Okkazo. Coordinate vendors, bookings, and attendee experiences in one place.',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/pricing`,
        'query-input': 'required name=search_term_string',
      },
    };

    const jsonLdTag = ensureJsonLdTag();
    jsonLdTag.textContent = JSON.stringify(jsonLd);
  }, [location.pathname, isServerDown]);

  return null;
};

export default SeoManager;
