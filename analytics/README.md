# De Raaskalderij Analytics

This is the private measurement system for `@deraaskalderij` and the website. Its job is to answer four questions without inventing a story from a handful of likes:

1. Which posts earn reach, shares, saves, profile visits and follows?
2. Which editorial ingredients repeat that result: topic, format, opening hook, CTA and publication time?
3. How many website visitors arrive, and through which source?
4. Which visitors become newsletter subscribers?

## The workbook

Build `De-Raaskalderij-Analytics.xlsx` with:

```sh
mkdir -p .tmp/analytics-workbook
ln -sfn /Users/cedricdeschaut/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules .tmp/analytics-workbook/node_modules
/Users/cedricdeschaut/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/build_analytics_workbook.mjs
```

The generated workbook has six tabs:

- **Dashboard**: headline metrics and the running evidence for topics and formats.
- **Instagram Posts**: one row for every feed post or Reel. Yellow cells are the manual inputs.
- **Website Weekly**: the weekly GA4 figures, including acquisition and newsletter conversion.
- **Instagram Weekly**: account-level Insights, including website taps and non-follower reach.
- **Taxonomy**: the agreed labels. Keep these stable so comparisons remain meaningful.
- **How To Use**: the collection routine and definitions.

The workbook intentionally keeps data entry separate from the analysis. It is not a public dashboard; GA4 and Instagram data remain private in Google Sheets.

## Collection routine

### After every post (48 hours later)

In Instagram Insights, record these in **Instagram Posts**:

- Reach
- Likes, comments, shares and saves
- Profile visits and follows attributed to the post
- For Reels: plays, average watch time and completion rate when available

Classify each post with one topic, one format, one opening hook and one CTA. Use the labels from **Taxonomy**. The computed columns show engagement, share, save, profile-visit and follow rates against reach.

### Every Monday

1. In **Instagram Insights**, add account-level data to **Instagram Weekly**: follower count, accounts reached, interactions, profile visits, website taps, link taps and Reels plays.
2. In **GA4**, use Reports > Acquisition > Traffic acquisition. Add Users/Sessions/Page views and the source buckets to **Website Weekly**. Keep `Session source / medium` visible.
3. Filter GA4 to `ig / social` to fill **Instagram Users**. The Instagram bio link uses UTM tags, so this traffic is identifiable.
4. In GA4, create or inspect the conversion event `newsletter_signup`. Add newsletter page views and sign-ups, and the sheet calculates conversion rate.
5. In Google Search Console, note weekly clicks, impressions and rising queries in the Notes column of **Website Weekly** until organic traffic merits a separate SEO tab.

## How to read the results

- **Reach** tells you distribution; **share rate** tells you whether the joke travels; **save rate** tells you whether it remains useful or quotable; **follow rate** tells you whether it converts strangers to the account.
- Do not call a topic “best” from a single spike. Give it at least three posts before comparing its average against the overall baseline.
- A useful winner combines above-average reach with either an above-average share rate or follow rate. A post with huge reach and no follows is a distribution win, not necessarily an editorial win.
- For website traffic, compare `ig / social`, organic, direct and referral separately. Direct traffic often includes unattributed sharing, so it is not automatically a brand win.

## GA4 event map

| Event | Meaning |
| --- | --- |
| `article_view` | A generated article detail page was viewed. |
| `newsletter_view` | The newsletter waitlist page was viewed. |
| `newsletter_signup` | The Google Form thank-you frame loaded after a waitlist submission. Mark this as a Key event in GA4. |
| `instagram_click` | A visitor clicked from the website to Instagram. |
| `copy_article_link` | A visitor copied a story link. |

GA4 only collects after the visitor accepts optional statistics. That makes the numbers directionally useful rather than a complete census, which is the correct trade-off for this site.
