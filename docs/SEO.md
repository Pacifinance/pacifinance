# SEO

What's actually implemented, and how to use it when adding a new page. For
target keywords per page and language, see [SEO_KEYWORDS_MAP.md](SEO_KEYWORDS_MAP.md).

## What's implemented

- **Language-prefixed URLs**: every route is under `/it/...`, `/en/...`,
  `/es/...`, `/de/...`, `/fr/...`, `/pt-BR/...` (`src/utils/i18nRouting.ts`,
  `LocalizedLink`, `useLocalizedNavigate`).
- **Hreflang**: auto-generated for all 6 supported languages plus
  `x-default`, via `src/components/SEOHead.tsx`. It reads the language list
  from `src/i18n/languagesConfig.js`, so adding a language there automatically
  extends hreflang everywhere `SEOHead` is used.
- **Sitemap**: `public/sitemap.xml`, one entry per localized URL.
- **Structured data**: `SEOHead` emits a `WebApplication` JSON-LD block
  (`applicationCategory`, `offers`, `featureList`, `inLanguage`). It does
  **not** include an `aggregateRating` — don't add one unless the site has
  real, collected reviews behind it. A rating with fabricated numbers is
  exactly the kind of structured data Google's rich-results guidelines
  penalize.
- **Open Graph / Twitter Card**: title/description/image/locale, with
  `og:locale:alternate` for every other supported language.
- **`geo.region`** and `Content-Language` meta tags, mapped per language.

## Adding SEO to a new page

```jsx
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';

function MyPage() {
  const { language } = useContext(LanguageContext);

  return (
    <>
      <SEOHead
        title="My Page - Pacifinance"
        description="Page description here"
        keywords="keyword1, keyword2, keyword3"
        canonical="/my-page"
        language={language}
      />
      {/* page content */}
    </>
  );
}
```

`canonical` takes a relative path (`/my-page`), not a full URL — `SEOHead`
builds the absolute canonical and hreflang URLs from it. Pass an explicit
`featureList` (array of strings) to override the default one if the page
represents a distinct part of the product (see `src/pages/LandingPage.tsx`
for an example that lists comparison/open-source/self-hosting first).

## Verifying changes

- [Google Rich Results Test](https://search.google.com/test/rich-results) —
  validate structured data after touching `SEOHead.tsx`.
- Google Search Console → Settings → International Targeting, to check
  hreflang errors once the site is indexed.
