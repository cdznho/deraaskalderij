document.addEventListener('DOMContentLoaded', () => {
  const analyticsId = document.body.dataset.analyticsId;
  const analyticsPreferenceKey = 'dr-analytics-consent';

  const enableAnalytics = () => {
    if (!analyticsId || document.querySelector('[data-analytics-loader]')) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    script.dataset.analyticsLoader = 'true';
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', analyticsId, { anonymize_ip: true });
    trackContextEvents();
  };

  const trackEvent = (name, parameters = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', name, parameters);
  };

  function trackContextEvents() {
    const article = document.querySelector('.article');
    if (article) {
      trackEvent('article_view', {
        article_title: article.querySelector('h1')?.textContent?.trim() || 'Onbekend artikel',
        article_category: article.querySelector('.article-category')?.textContent?.trim() || 'Onbekend',
      });
    }

    if (document.querySelector('[data-waitlist-form]')) {
      trackEvent('newsletter_view', { placement: 'waitlist_page' });
    }
  }

  const preference = window.localStorage.getItem(analyticsPreferenceKey);
  if (preference === 'accepted') {
    enableAnalytics();
  } else if (!preference) {
    const consent = document.createElement('aside');
    consent.className = 'analytics-consent';
    consent.setAttribute('role', 'dialog');
    consent.setAttribute('aria-label', 'Privacykeuze');
    consent.innerHTML = '<p>We gebruiken optionele statistieken om te zien welk geraas gelezen wordt.</p><div><button data-analytics-decline>Alleen noodzakelijk</button><button data-analytics-accept>Statistieken toestaan</button></div>';
    document.body.appendChild(consent);
    consent.querySelector('[data-analytics-decline]').addEventListener('click', () => {
      window.localStorage.setItem(analyticsPreferenceKey, 'declined');
      consent.remove();
    });
    consent.querySelector('[data-analytics-accept]').addEventListener('click', () => {
      window.localStorage.setItem(analyticsPreferenceKey, 'accepted');
      enableAnalytics();
      consent.remove();
    });
  }

  const search = document.querySelector('[data-search]');
  const category = document.querySelector('[data-category]');
  const items = [...document.querySelectorAll('[data-archive-list] .archive-item')];
  const counter = document.querySelector('[data-result-count]');

  const updateArchive = () => {
    if (!items.length) return;
    const term = (search?.value || '').trim().toLowerCase();
    const selected = category?.value || 'all';
    let visible = 0;
    items.forEach(item => {
      const match = (!term || item.dataset.searchable.includes(term)) && (selected === 'all' || item.dataset.category === selected);
      item.hidden = !match;
      if (match) visible += 1;
    });
    if (counter) counter.textContent = visible === 1 ? '1 artikel gevonden' : `${visible} artikelen gevonden`;
  };
  search?.addEventListener('input', updateArchive);
  category?.addEventListener('change', updateArchive);

  document.querySelectorAll('[data-copy-link]').forEach(button => {
    button.addEventListener('click', async () => {
      const url = new URL(button.dataset.url, window.location.href).href;
      try {
        await navigator.clipboard.writeText(url);
        button.innerHTML = 'Link gekopieerd <span>✓</span>';
      } catch {
        window.prompt('Kopieer deze link:', url);
      }
      trackEvent('copy_article_link');
      window.setTimeout(() => { button.innerHTML = 'Kopieer link <span>↗</span>'; }, 2200);
    });
  });

  document.querySelectorAll('a[href*="instagram.com/deraaskalderij"]').forEach(link => {
    link.addEventListener('click', () => trackEvent('instagram_click'));
  });

  document.querySelectorAll('.nav a, .category-links a, .section-heading a, .read-link').forEach(link => {
    link.addEventListener('click', () => {
      const destination = new URL(link.href, window.location.href).pathname || '/';
      trackEvent('content_navigation_click', { destination });
    });
  });

  const waitlistForm = document.querySelector('[data-waitlist-form]');
  const waitlistFrame = document.querySelector('iframe[name="waitlist-response"]');
  const waitlistSuccess = document.querySelector('[data-waitlist-success]');
  let waitlistSubmitted = false;
  let waitlistSignupTracked = false;
  waitlistForm?.addEventListener('submit', () => {
    waitlistSubmitted = true;
  });
  waitlistFrame?.addEventListener('load', () => {
    if (!waitlistSubmitted || !waitlistSuccess || waitlistSignupTracked) return;
    waitlistSignupTracked = true;
    waitlistSuccess.hidden = false;
    waitlistForm?.reset();
    trackEvent('newsletter_signup', { placement: 'waitlist_page' });
  });

  const current = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
  document.querySelectorAll('.nav a').forEach(link => {
    const target = new URL(link.href).pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    if (target && current === target) link.setAttribute('aria-current', 'page');
  });
});
