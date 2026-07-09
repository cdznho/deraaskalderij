# PRD: De Raaskalderij Website + Instagram Alignment

## 1. Summary

Build a De Raaskalderij website that turns the Instagram account into a fuller satire publication: every Instagram post should have a matching web article, shareable URL, archive entry, and visual identity. The website should feel like a Flemish satirical news desk: sober enough to look like news, absurd enough to make the joke land immediately.

The product should be inspired by the structure of De Speld without copying its brand, layout, or writing. De Speld's public site combines topical categories, article cards, "Kort Nieuws", popular lists, newsletter/subscription hooks, archive/search, and social/app links. De Raaskalderij should adapt those mechanics for a smaller, Instagram-first Flemish satire brand.

## 2. Goals

- Align Instagram and website so each post becomes a reusable content asset, not a one-off image.
- Create a browsable archive for Flemish satire posts by topic, date, and format.
- Give every post a canonical web URL for sharing outside Instagram.
- Preserve the current De Raaskalderij visual identity: black editorial base, cream serif headlines, orange accent, circular DR mark, deadpan local-news tone.
- Make future publishing simple: image, headline, subline, caption/article body, category, source note, and status.

## 3. Non-Goals

- Do not build a De Speld clone.
- Do not publish automatically to Instagram from the website in MVP.
- Do not add user accounts, comments, payments, or a full newsroom CMS in MVP.
- Do not present satire as factual reporting; article pages must make the satire brand obvious.

## 4. Reference Research

Observed De Speld patterns:

- Site navigation separates Home, Video, Podcast, Politiek, Binnenland, Buitenland, Cultuur, Lifestyle, Landgenoten, Sport, and De Pin.
- Utility links include archive, newsletter, live/events, advertising, contact, vacancies, webshop, login/subscription.
- Homepage mixes featured articles, standard cards with image/headline/summary, "Kort Nieuws", video, popular list, poll, and newsletter call-to-action.
- Article cards use a straight-faced headline plus one short explanatory deck/summary.
- The humor often comes from treating absurd premises as routine news.

Implication for De Raaskalderij:

- Use a smaller navigation set: Home, Politiek, Voetbal, Vlaanderen, Brussel, Gent, Cultuur, Archief.
- Keep the Instagram-card headline as the web headline whenever possible.
- Expand the Instagram caption into a short article body, but do not over-explain the joke.
- Add "Kort Geraas" as a short-news format for punchlines that do not need a full article.

## 5. Audience

Primary audience:

- Flemish Instagram users who enjoy topical satire, voetbal jokes, politics, local culture, and Belgian administrative absurdity.

Secondary audience:

- People who receive a post via WhatsApp, X, Facebook, Reddit, or search and need a web page instead of an Instagram-only asset.
- Future collaborators who need to understand the house style and content pipeline.

## 6. Product Positioning

De Raaskalderij is not a news site with jokes added. It is a joke machine wearing a news site's clothes.

Tone:

- Flemish and Belgian, dry, compact, locally specific.
- Fake-news format, but clearly branded as satire.
- Punchline first, explanation second.
- Uses named fictional locals, overly administrative phrasing, sports overconfidence, and Flemish everyday references.

Brand promise:

> Ambachtelijk geraas sinds 1836.

## 7. Information Architecture

### MVP Pages

- `/`
  - Latest featured post.
  - Grid of recent articles.
  - "Kort Geraas" strip.
  - Popular/recommended section.
  - Instagram follow CTA.

- `/artikel/[slug]`
  - Full article page.
  - Hero image using the matching Instagram card or source photo.
  - Headline, subline, category, date, body, source note if relevant.
  - Share links.
  - "Ook geraas" related posts.

- `/categorie/[category]`
  - Filtered archive by topic.

- `/archief`
  - Chronological archive with search/filter.

- `/over`
  - Short brand statement, satire disclaimer, Instagram link.

### Later Pages

- `/kort-geraas`
  - Feed of one-liner/short items.

- `/nieuwsbrief`
  - Email capture.

- `/submit`
  - Tip/joke submission form.

## 8. Content Model

Each post should be represented as structured content.

Required fields:

- `id`: numeric post number, e.g. `022`
- `slug`: URL slug, e.g. `mohammed-marokko-vuvuzelas`
- `status`: draft, ready, published, archived
- `title`: web headline
- `instagramHeadline`: on-image headline, if different
- `deck`: on-image subline / article intro
- `category`: politiek, voetbal, vlaanderen, brussel, gent, cultuur, lifestyle
- `location`: optional, e.g. Brussel, Gent, Melsbroek
- `image`: path to finished Instagram card
- `sourceImage`: optional path to underlying photo/render
- `caption`: Instagram caption
- `body`: web article body
- `sourceHook`: real-world hook or fictional concept note
- `satireType`: fake news, vox pop, sport, local, explainer, kort geraas
- `publishedAt`: date/time
- `instagramUrl`: optional after posting
- `tags`: list for search and related posts

MVP can derive this from existing `docs/posts/*.md` and `assets/posts/*.png`. A later CMS can store it as Markdown frontmatter or JSON.

## 9. Instagram Alignment

Every website article must map cleanly to an Instagram post:

- The finished Instagram image appears near the top of the article.
- The web headline should match the card headline unless the card needs shorter text.
- The first paragraph should match or lightly adapt the Instagram caption.
- Hashtags should not appear in the web article body; use them as hidden metadata or visible tags.
- Each article page should include a CTA: "Volg De Raaskalderij op Instagram".
- After posting manually, add the Instagram permalink to the article metadata.

The website should also support the reverse workflow:

- Create web article draft first.
- Generate Instagram card from article fields.
- Mark both as "ready".
- Publish Instagram manually.
- Add Instagram URL and mark as "published".

## 10. Functional Requirements

### Homepage

- Show latest post as a large feature.
- Show recent posts in a responsive grid.
- Show at least 3 "Kort Geraas" items.
- Show category chips.
- Show Instagram follow CTA.
- Show newsletter placeholder CTA, even if email capture is deferred.

### Article Page

- Render category, date, title, deck, image, body, and source/satire note.
- Support related posts by category and tags.
- Provide copy-link/share controls.
- Include Open Graph metadata using the finished Instagram image.

### Archive

- Search by title/body/tags.
- Filter by category.
- Sort newest first.

### Content Pipeline

- Existing posts in `docs/posts` should be importable.
- Existing card images in `assets/posts` should be reused.
- If content metadata is incomplete, the site should fail visibly in development and skip gracefully in production.

## 11. UX / Visual Requirements

Overall feel:

- Dense, editorial, scannable.
- Black/cream/orange base matching current post cards.
- Serif headlines, sans-serif metadata/body.
- No marketing-style hero page. The first screen should be the publication experience.

Homepage layout:

- Top nav with logo, categories, Instagram link.
- Feature story at top with large image and headline.
- Below: editorial grid with compact article cards.
- Right rail on desktop for popular posts / kort geraas / follow CTA.
- Single-column feed on mobile.

Article layout:

- Strong headline and image.
- Body width comfortable for reading.
- Related posts visible without feeling like ads.

Accessibility:

- Alt text for every image.
- Strong contrast.
- Keyboard navigable nav, cards, and share controls.

## 12. SEO and Social

- Each article gets a clean slug and canonical URL.
- Open Graph/Twitter image should use the Instagram card by default.
- Metadata should include satire category, publish date, title, description.
- Add JSON-LD as `Article` or `NewsArticle` only if clearly marked as satire in page copy/metadata.
- Avoid misleading real-news SEO descriptions; include "satire" where appropriate.

## 13. Analytics

Track:

- Article views.
- Instagram CTA clicks.
- Share/copy-link clicks.
- Category clicks.
- Search queries with no results.
- Top posts by week/month.

Success metrics:

- 80% of new Instagram posts have a matching website article.
- 30% of website sessions view at least 2 pages.
- 10% of article readers click through to Instagram.
- Search/archives are used enough to justify richer filtering.

## 14. Moderation and Safety

- Fictional people must be clearly fictional unless based on public figures/news.
- Sensitive jokes should punch up or punch sideways at institutions, fandom, media framing, bureaucracy, or public narratives.
- Avoid turning ethnicity, religion, disability, or private individuals into the butt of the joke.
- Source notes must distinguish real hooks from fictional premises.

## 15. MVP Scope

MVP includes:

- Static or file-based website.
- Home, article, category, archive, over pages.
- Import path from local Markdown/image files.
- Manual publish workflow.
- Open Graph images.
- Basic search/filter.

MVP excludes:

- Full CMS.
- User login.
- Comments.
- Payments/subscriptions.
- Automated Instagram publishing.
- Newsletter backend.

## 16. Suggested Milestones

1. Content audit and metadata normalization
   - Convert existing `docs/posts/*.md` into structured frontmatter.
   - Confirm categories and slugs for posts 001, 007-009, 013-022.

2. Static site skeleton
   - Build routing, layout, typography, and responsive grid.

3. Article rendering
   - Render individual article pages from local content.
   - Generate OG metadata.

4. Archive and categories
   - Add category pages, archive page, and client-side search.

5. Publishing workflow
   - Add a checklist for creating post image, article draft, Instagram caption, and published URL.

6. Polish and launch
   - Visual QA, mobile QA, SEO/social preview QA, analytics.

## 17. Open Questions

- Should the website be Flemish-only, or should some UI labels use neutral Dutch?
- Should every Instagram post become a full article, or should smaller posts become "Kort Geraas" only?
- Should the website eventually support merch/newsletter monetization, or stay pure archive/publication for now?
- What domain should be used?

## 18. Acceptance Criteria

- A visitor can understand De Raaskalderij as a satire publication within 5 seconds of landing.
- A visitor can browse recent posts, filter by topic, and open a full article.
- Every article has a matching Instagram image, web headline, caption-derived body, category, date, and share metadata.
- The visual identity is recognizably aligned with the Instagram cards.
- The system can publish a new post without duplicating copy manually in three places.

## 19. Sources

- De Speld homepage, reviewed July 9, 2026: navigation categories, article cards, short-news section, popular list, newsletter CTA, and social/app links.
- Local De Raaskalderij workspace: `assets/posts`, `docs/posts`, and `docs/visual-identity.md`.
