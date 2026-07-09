document.addEventListener('DOMContentLoaded', () => {
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
      window.setTimeout(() => { button.innerHTML = 'Kopieer link <span>↗</span>'; }, 2200);
    });
  });

  const current = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
  document.querySelectorAll('.nav a').forEach(link => {
    const target = new URL(link.href).pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    if (target && current === target) link.setAttribute('aria-current', 'page');
  });
});
