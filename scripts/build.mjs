import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');

const meta = {
  '001-wachtlijst': { category: 'vlaanderen', date: '2026-06-16', location: 'Brussel', tags: ['vlaanderen', 'overheid', 'wachtlijst'] },
  '007-smartschoolberichten': { category: 'vlaanderen', date: '2026-06-23', location: 'Leuven', tags: ['onderwijs', 'smartschool', 'ouders'] },
  '008-participatiemoment': { category: 'vlaanderen', date: '2026-06-25', location: 'Lier', tags: ['gemeente', 'participatie', 'bureaucratie'] },
  '009-zelfscan-spijt': { category: 'vlaanderen', date: '2026-06-27', location: 'Antwerpen', tags: ['supermarkt', 'zelfscan', 'economie'] },
  '013-bad-bunny-brussel': { category: 'brussel', date: '2026-07-01', location: 'Brussel', tags: ['bad bunny', 'mivb', 'showbizz'] },
  '014-vs-250-navo': { category: 'politiek', date: '2026-07-04', location: 'Brussel', tags: ['navo', 'europa', 'verenigde staten'] },
  '015-yc-klantengesprekken': { category: 'vlaanderen', date: '2026-07-05', location: 'Antwerpen', tags: ['startup', 'yc', 'founder'] },
  '016-paraguay-duelkracht': { category: 'voetbal', date: '2026-07-05', location: 'Philadelphia', tags: ['paraguay', 'frankrijk', 'trump', 'mma'] },
  '017-mexico-sympathiepunten': { category: 'voetbal', date: '2026-07-07', location: 'Mexico-Stad', tags: ['mexico', 'engeland', 'wereldbeker'] },
  '018-de-ketelaere-friet-frikandel': { category: 'voetbal', date: '2026-07-07', location: 'Seattle', tags: ['de ketelaere', 'belgie', 'frietjes'] },
  '019-dewever-secret-santa': { category: 'politiek', date: '2026-07-09', location: 'Melsbroek', tags: ['bart de wever', 'erdogan', 'navo'] },
  '020-club-brugge-stadiondossier': { category: 'voetbal', date: '2026-07-09', location: 'Brugge', tags: ['club brugge', 'stadion', 'jan breydel'] },
  '021-gent-matcha-latte': { category: 'gent', date: '2026-07-09', location: 'Gent', tags: ['gent', 'matcha', 'hipster'] },
  '022-mohammed-marokko-vuvuzelas': { category: 'voetbal', date: '2026-07-09', location: 'Brussel', tags: ['marokko', 'frankrijk', 'vuvuzela'] }
};

const categoryNames = { politiek: 'Politiek', voetbal: 'Voetbal', vlaanderen: 'Vlaanderen', brussel: 'Brussel', gent: 'Gent', cultuur: 'Cultuur' };
const categoryOrder = ['politiek', 'voetbal', 'vlaanderen', 'brussel', 'gent', 'cultuur'];
const featuredSlug = 'mohammed-marokko-vuvuzelas';

const escape = (value = '') => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const plain = (value = '') => value.replace(/\s+/g, ' ').trim();
const dateLabel = date => new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`));

function getField(markdown, label) {
  const match = markdown.match(new RegExp(`${label}:\\s*\\n+([^\\n]+)`, 'i'));
  return match ? plain(match[1]) : '';
}

function getCaption(markdown) {
  const match = markdown.match(/## Caption\s*\n+([\s\S]*?)(?=\n## |$)/i);
  if (!match) return [];
  return match[1].split(/\n\s*\n/).map(plain).filter(line => line && !line.startsWith('#'));
}

async function getPosts() {
  const files = (await readdir(join(root, 'docs/posts'))).filter(file => file.endsWith('.md'));
  const posts = await Promise.all(files.map(async file => {
    const slug = file.replace(/^\d+-/, '').replace(/\.md$/, '');
    const key = file.replace(/\.md$/, '');
    const markdown = await readFile(join(root, 'docs/posts', file), 'utf8');
    const id = key.slice(0, 3);
    const caption = getCaption(markdown);
    const image = `assets/posts/${key}.png`;
    return {
      id,
      slug,
      ...meta[key],
      status: /Ready to publish/i.test(markdown) ? 'ready' : 'draft',
      section: getField(markdown, 'Section label') || 'GERAAS',
      title: getField(markdown, 'Headline'),
      deck: getField(markdown, 'Deck'),
      caption,
      image,
      description: caption[0] || getField(markdown, 'Deck')
    };
  }));
  return posts.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

function nav(rootPath) {
  return `<header class="site-header"><div class="masthead"><a class="wordmark" href="${rootPath}" aria-label="De Raaskalderij home"><span>De Raaskalderij</span><b>.</b></a><p>Ambachtelijk geraas sinds 1836</p><a class="instagram-link" href="https://www.instagram.com/deraaskalderij/" target="_blank" rel="noreferrer">Instagram <span aria-hidden="true">↗</span></a></div><nav class="nav" aria-label="Hoofdnavigatie"><a href="${rootPath}">Home</a>${categoryOrder.slice(0, 5).map(key => `<a href="${rootPath}categorie/${key}/">${categoryNames[key]}</a>`).join('')}<a href="${rootPath}archief/">Archief</a><a href="${rootPath}over/">Over</a></nav></header>`;
}

function footer(rootPath) {
  return `<footer class="footer"><p><strong>De Raaskalderij.</strong> Een satirische publicatie. De feiten dragen een snor, de koppen een das.</p><div><a href="${rootPath}over/">Over &amp; disclaimer</a><a href="https://www.instagram.com/deraaskalderij/" target="_blank" rel="noreferrer">Instagram ↗</a></div></footer>`;
}

function layout({ title, description, rootPath, content, canonical = '' }) {
  const pageTitle = title ? `${title} | De Raaskalderij` : 'De Raaskalderij | Ambachtelijk geraas sinds 1836';
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#111111"><meta property="og:site_name" content="De Raaskalderij"><meta property="og:title" content="${escape(pageTitle)}"><meta property="og:description" content="${escape(description)}">${canonical ? `<link rel="canonical" href="${canonical}">` : ''}<title>${escape(pageTitle)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700;8..60,800&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="${rootPath}site.css"><script defer src="${rootPath}site.js"></script></head><body data-root="${rootPath}">${nav(rootPath)}<main>${content}</main>${footer(rootPath)}</body></html>`;
}

function card(post, rootPath, featured = false) {
  return `<article class="story-card ${featured ? 'featured-card' : ''}"><a class="story-image" href="${rootPath}artikel/${post.slug}/"><img src="${rootPath}${post.image}" alt="Satirische Instagramkaart bij: ${escape(post.title)}" loading="lazy"></a><div class="story-copy"><p class="eyebrow">${escape(categoryNames[post.category] || post.section)} <span>${dateLabel(post.date)}</span></p><h${featured ? '1' : '2'}><a href="${rootPath}artikel/${post.slug}/">${escape(post.title)}</a></h${featured ? '1' : '2'}><p class="deck">${escape(post.deck)}</p><a class="read-link" href="${rootPath}artikel/${post.slug}/">Lees het geraas <span>→</span></a></div></article>`;
}

function shortItems(posts) {
  return posts.slice(3, 6).map((post, index) => `<li><span>0${index + 1}</span><a href="artikel/${post.slug}/">${escape(post.title)}</a></li>`).join('');
}

function home(posts) {
  const featured = posts.find(post => post.slug === featuredSlug) || posts[0];
  const recent = posts.filter(post => post !== featured).slice(0, 6);
  const popular = [posts.find(post => post.slug === 'club-brugge-stadiondossier'), posts.find(post => post.slug === 'dewever-secret-santa'), posts.find(post => post.slug === 'gent-matcha-latte')].filter(Boolean);
  return layout({ rootPath: '', description: 'Flemische satire met veel te veel vertrouwen in lokale administratieve details.', content: `
    <section class="edition-bar"><span>EDITIE 09.07.2026</span><span>•</span><span>100% SATIRE</span><span>•</span><span>VOLLEDIG ONBETROUWBAAR</span></section>
    <section class="lead-wrap">${card(featured, '', true)}<aside class="lead-aside"><div class="aside-heading"><span>Het kort geraas</span><i></i></div><ol class="short-list">${shortItems(posts)}</ol><a class="subscribe-block" href="https://www.instagram.com/deraaskalderij/" target="_blank" rel="noreferrer"><span>Volg de redactie</span><strong>Instagram <b>↗</b></strong><small>Voor wie nieuws liever eerst aanvoelt dan factcheckt.</small></a></aside></section>
    <section class="section-heading"><p>Vers van de pers</p><a href="archief/">Naar het archief <span>→</span></a></section>
    <section class="story-grid">${recent.map(post => card(post, '')).join('')}</section>
    <section class="category-band"><div><p class="eyebrow">VIND UW GERAASTYPE</p><h2>Dezelfde verwarring, <em>andere loketten.</em></h2></div><div class="category-links">${categoryOrder.map(key => `<a href="categorie/${key}/">${categoryNames[key]} <span>→</span></a>`).join('')}</div></section>
    <section class="popular-section"><div class="section-heading"><p>Meest geraasd</p><span>Volledig wetenschappelijk samengesteld</span></div><div class="popular-grid">${popular.map((post, index) => `<a href="artikel/${post.slug}/"><span>0${index + 1}</span><h2>${escape(post.title)}</h2><p>${escape(post.deck)}</p></a>`).join('')}</div></section>` });
}

function articlePage(post, posts) {
  const rootPath = '../../';
  const related = posts.filter(item => item.slug !== post.slug && (item.category === post.category || item.tags.some(tag => post.tags.includes(tag)))).slice(0, 3);
  return layout({ title: post.title, description: `${post.deck} Satire van De Raaskalderij.`, rootPath, content: `
    <article class="article"><header class="article-head"><a class="eyebrow article-category" href="${rootPath}categorie/${post.category}/">${escape(categoryNames[post.category] || post.section)}</a><p class="article-date">${escape(post.location)} · ${dateLabel(post.date)}</p><h1>${escape(post.title)}</h1><p class="article-deck">${escape(post.deck)}</p></header>
    <figure class="article-image"><img src="${rootPath}${post.image}" alt="Satirische Instagramkaart bij: ${escape(post.title)}"><figcaption>De Raaskalderij / satirische illustratie</figcaption></figure>
    <div class="article-layout"><div class="article-body">${post.caption.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}<div class="satire-note"><strong>Satire, natuurlijk.</strong> Dit artikel vertrekt van een herkenbare actualiteit, maar de redactie neemt haar eigen conclusies graag mee naar een parallel universum.</div><div class="article-tags">${post.tags.map(tag => `<a href="${rootPath}archief/?q=${encodeURIComponent(tag)}">#${escape(tag)}</a>`).join('')}</div></div><aside class="share-rail"><p>Deel het geraas</p><button data-copy-link data-url="${rootPath}artikel/${post.slug}/">Kopieer link <span>↗</span></button><a href="https://www.instagram.com/deraaskalderij/" target="_blank" rel="noreferrer">Volg op Instagram <span>↗</span></a></aside></div>
    <section class="related"><div class="section-heading"><p>Ook geraas</p><a href="${rootPath}archief/">Alles bekijken <span>→</span></a></div><div class="story-grid related-grid">${related.map(item => card(item, rootPath)).join('')}</div></section>
    </article>` });
}

function listingPage(posts, category) {
  const rootPath = '../../';
  const title = categoryNames[category];
  const filtered = posts.filter(post => post.category === category);
  return layout({ title, description: `${title}-satire van De Raaskalderij.`, rootPath, content: `<section class="listing-head"><p class="eyebrow">CATEGORIE</p><h1>${title}<b>.</b></h1><p>${category === 'voetbal' ? 'Iedere tactische analyse wordt vroeg of laat een familiedrama.' : 'Lokale feiten, nationale bijwerkingen en volledig onnodige conclusies.'}</p></section><section class="story-grid listing-grid">${filtered.map(post => card(post, rootPath)).join('')}</section>` });
}

function archivePage(posts) {
  const rootPath = '../';
  return layout({ title: 'Archief', description: 'Doorzoek het volledig onbetrouwbare archief van De Raaskalderij.', rootPath, content: `<section class="listing-head archive-head"><p class="eyebrow">VOLLEDIG ONBETROUWBAAR ARCHIEF</p><h1>Allemaal <em>geraas.</em></h1><p>Doorzoek elke kop die de redactie met een stalen gezicht heeft durven indienen.</p><div class="archive-controls"><label><span>Zoeken</span><input data-search type="search" placeholder="Zoek op Club, matcha of wachtlijst"></label><label><span>Categorie</span><select data-category><option value="all">Alle categorieën</option>${categoryOrder.map(key => `<option value="${key}">${categoryNames[key]}</option>`).join('')}</select></label></div></section><p class="result-count" data-result-count>${posts.length} artikelen in het archief</p><section class="archive-list" data-archive-list>${posts.map(post => `<article class="archive-item" data-searchable="${escape(`${post.title} ${post.deck} ${post.category} ${post.tags.join(' ')}`.toLowerCase())}" data-category="${post.category}"><a class="archive-image" href="${rootPath}artikel/${post.slug}/"><img src="${rootPath}${post.image}" alt=""></a><div><p class="eyebrow">${categoryNames[post.category]} <span>${dateLabel(post.date)}</span></p><h2><a href="${rootPath}artikel/${post.slug}/">${escape(post.title)}</a></h2><p>${escape(post.deck)}</p></div><a class="arrow-link" href="${rootPath}artikel/${post.slug}/" aria-label="Lees ${escape(post.title)}">→</a></article>`).join('')}</section>` });
}

function aboutPage() {
  return layout({ title: 'Over', description: 'Over De Raaskalderij, ambachtelijk geraas sinds 1836.', rootPath: '../', content: `<section class="about"><p class="eyebrow">OVER DE REDACTIE</p><h1>Nieuws dat zijn das heeft <em>omgedaan.</em></h1><div class="about-copy"><p>De Raaskalderij maakt Vlaamse satire met de ernst van een gemeenteraad en het beoordelingsvermogen van een veel te lange toogpraat.</p><p>We nemen actuele verhalen als vertrekpunt, lopen er een eind mee weg en komen pas terug wanneer de punchline administratief verantwoord is.</p><p>Alles op deze site is satire. Werkelijke personen kunnen in een grap verschijnen wanneer hun publieke rol het onderwerp is. De fictieve mensen in onze verhalen zijn net zo verzonnen als hun functieomschrijving.</p><a class="solid-link" href="https://www.instagram.com/deraaskalderij/" target="_blank" rel="noreferrer">Volg De Raaskalderij op Instagram <span>↗</span></a></div></section>` });
}

async function writePage(path, html) {
  const destination = join(out, path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html);
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(join(root, 'assets'), join(out, 'assets'), { recursive: true });
await cp(join(root, 'site', 'site.css'), join(out, 'site.css'));
await cp(join(root, 'site', 'site.js'), join(out, 'site.js'));
await writeFile(join(out, '.nojekyll'), '');

const posts = await getPosts();
await writePage('index.html', home(posts));
await writePage('archief/index.html', archivePage(posts));
await writePage('over/index.html', aboutPage());
for (const category of categoryOrder) await writePage(`categorie/${category}/index.html`, listingPage(posts, category));
for (const post of posts) await writePage(`artikel/${post.slug}/index.html`, articlePage(post, posts));
console.log(`Built ${posts.length} articles into dist/`);
