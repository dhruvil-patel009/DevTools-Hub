export const siteConfig = {
  name: 'DevTools Hub',
  tagline: 'Everything developers need. One workspace.',
  description:
    'A fast, privacy-first developer utility workspace with 50+ tools for JSON, code formatting, data conversion, CSS design, cryptography, regex, API testing, and optional AI assistance.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  githubUrl: 'https://github.com/devtools-hub/devtools-hub',
  links: {
    docs: '/about',
    privacy: '/privacy',
    terms: '/terms',
    contact: '/contact',
  },
} as const;
