import { defineCollection, z } from 'astro:content';

// Markdown/frontmatter collections the admin CMS (Decap) manages. The homepage
// data (site/home/pricing/contact/faq) lives as JSON in src/content/data and is
// imported directly by components — the CMS edits those JSON files in place.

const locale = z.enum(['en', 'am', 'om', 'ti']).default('en');

const pages = defineCollection({
  type: 'content',
  schema: z.object({ title: z.string(), locale, draft: z.boolean().default(true) }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    locale,
    cover: z.string().optional(),
    excerpt: z.string(),
    draft: z.boolean().default(true),
  }),
});

const testimonials = defineCollection({
  type: 'content',
  schema: z.object({
    quote: z.string(),
    person: z.string(),
    role: z.string().optional(),
    // F4: real vs placeholder is explicit — placeholders never render as real quotes.
    placeholder: z.boolean().default(true),
  }),
});

const partners = defineCollection({
  type: 'content',
  schema: z.object({ name: z.string(), logo: z.string().optional(), placeholder: z.boolean().default(true) }),
});

const careers = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    location: z.string().optional(),
    type: z.string().optional(),
    draft: z.boolean().default(true),
  }),
});

// Legal pages (Privacy, Terms) — endorsed by the legal officer; rendered at /privacy
// and /terms. The publish gate (scripts/check-publish.mjs) reads these files raw and
// refuses a production build if they are missing, too short, or still contain DRAFT
// markers or unresolved [brackets].
const legal = defineCollection({
  type: 'content',
  schema: z.object({ title: z.string(), updated: z.string().optional() }),
});

export const collections = { pages, blog, testimonials, partners, careers, legal };
