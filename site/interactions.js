document.addEventListener('DOMContentLoaded', () => {
  const config = window.DR_INTERACTIONS_CONFIG;
  const panel = document.querySelector('[data-article-interactions]');
  if (!panel || !config?.supabaseUrl || !config?.supabaseAnonKey) return;

  const slug = panel.dataset.articleSlug;
  const likeButton = panel.querySelector('[data-like-button]');
  const likeCount = panel.querySelector('[data-like-count]');
  const likeHint = panel.querySelector('[data-like-hint]');
  const commentCount = panel.querySelector('[data-comment-count]');
  const commentsList = panel.querySelector('[data-comments-list]');
  const commentForm = panel.querySelector('[data-comment-form]');
  const commentStatus = panel.querySelector('[data-comment-status]');
  const visitorKey = 'dr-interactions-visitor-id';
  const likeKey = `dr-liked-${slug}`;

  const track = (name, parameters = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', name, { article_slug: slug, ...parameters });
  };

  const getVisitorId = () => {
    let id = window.localStorage.getItem(visitorKey);
    if (!id) {
      id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(visitorKey, id);
    }
    return id;
  };

  const call = async (functionName, payload) => {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/rpc/${functionName}`, {
      method: 'POST',
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('De redactie is even onbereikbaar.');
    return response.json();
  };

  const formatDate = value => new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));

  const renderComments = comments => {
    commentsList.replaceChildren();
    comments.forEach(comment => {
      const item = document.createElement('article');
      const header = document.createElement('div');
      const name = document.createElement('strong');
      const date = document.createElement('time');
      const body = document.createElement('p');
      item.className = 'comment';
      header.className = 'comment-head';
      name.textContent = comment.display_name;
      date.dateTime = comment.created_at;
      date.textContent = formatDate(comment.created_at);
      body.textContent = comment.body;
      header.append(name, date);
      item.append(header, body);
      commentsList.append(item);
    });
  };

  const load = async () => {
    const [summary, comments] = await Promise.all([
      call('get_article_interaction_summary', { target_slug: slug }),
      call('get_article_comments', { target_slug: slug }),
    ]);
    const totals = summary[0] || { like_count: 0, comment_count: 0 };
    likeCount.textContent = totals.like_count;
    commentCount.textContent = totals.comment_count;
    likeButton.setAttribute('aria-pressed', String(window.localStorage.getItem(likeKey) === 'true'));
    renderComments(comments);
  };

  likeButton.addEventListener('click', async () => {
    likeButton.disabled = true;
    try {
      const likes = await call('toggle_article_like', { target_slug: slug, target_visitor_id: getVisitorId() });
      const liked = window.localStorage.getItem(likeKey) !== 'true';
      window.localStorage.setItem(likeKey, String(liked));
      likeButton.setAttribute('aria-pressed', String(liked));
      likeCount.textContent = likes;
      likeHint.textContent = liked ? 'Officieel meegeraasd.' : 'Geraas ingetrokken. Dapper.';
      track('article_like', { liked });
    } catch (error) {
      likeHint.textContent = error.message;
    } finally {
      likeButton.disabled = false;
    }
  });

  commentForm.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = commentForm.querySelector('button[type="submit"]');
    const name = commentForm.elements.display_name.value.trim();
    const body = commentForm.elements.body.value.trim();
    submit.disabled = true;
    commentStatus.textContent = 'De redactie leest mee.';
    try {
      await call('submit_article_comment', {
        target_slug: slug,
        target_visitor_id: getVisitorId(),
        target_display_name: name,
        target_body: body,
      });
      commentForm.reset();
      commentStatus.textContent = 'Ontvangen. Na een korte redactionele blik verschijnt uw reactie hier.';
      track('article_comment_submitted');
    } catch (error) {
      commentStatus.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });

  panel.hidden = false;
  load().catch(() => {
    panel.hidden = true;
  });
});
