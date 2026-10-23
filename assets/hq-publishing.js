(function () {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = value => new Intl.DateTimeFormat('nb-NO', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit', timeZone:'Europe/Oslo'}).format(new Date(value));
  const number = value => value == null ? '—' : new Intl.NumberFormat('nb-NO').format(value);
  const duration = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  const safeLink = value => { try { const u = new URL(value, location.href); return u.protocol === 'https:' || u.origin === location.origin ? u.href : ''; } catch { return ''; } };
  const link = (url, label, cls = '') => safeLink(url) ? `<a class="${cls}" href="${esc(safeLink(url))}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : '';
  const ready = () => document.readyState === 'loading' ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, {once:true})) : Promise.resolve();

  window.hqPostDetails = post => {
    const description = post.description ? `<p class="hq-description">${esc(post.description)}</p>` : '';
    const tags = (post.hashtags || []).map(tag => `<span class="hq-tag">${esc(tag)}</span>`).join('');
    const source = post.sourceUrl ? link(post.sourceUrl, 'Originalkilde ↗') : '';
    const terms = post.termsUrl ? link(post.termsUrl, post.useTerms || 'Bruksvilkår ↗') : '';
    const quality = post.quality ? `<span class="hq-tag">${post.quality.width} × ${post.quality.height} · ${post.quality.frameRate} fps</span>` : '';
    const watch = post.status === 'PUBLISHED' ? link(post.publicUrl, 'Se på YouTube ↗') : '';
    return `<details class="hq-details"><summary>Beskrivelse, hashtags og lenker</summary>${description}<div class="hq-tags">${tags}${quality}</div><div class="hq-links">${watch}${link(post.plannerUrl, 'Åpne publiseringsplan ↗')}${source}${terms}</div></details>`;
  };

  window.creatorMetricoolData = fetch('./data/metricool.json?updated=' + Date.now(), {cache:'no-store'}).then(response => {
    if (!response.ok) throw new Error('Publiseringsdata er utilgjengelige');
    return response.json();
  });

  window.creatorMetricoolData.then(async snapshot => {
    const items = Array.isArray(snapshot.items) ? snapshot.items : [];
    const future = items.filter(post => post.status === 'PENDING' && new Date(post.date) >= new Date()).sort((a,b) => new Date(a.date) - new Date(b.date));
    confirmedSchedule = future.map(post => ({...post, when:post.date, channel:post.channelKey === 'highlights' ? 4 : post.network === 'tiktok' ? 3 : 1, source:'metricool'}));
    scheduleRender();
    await ready();

    const stamp = date(snapshot.updatedAt);
    const readDate = document.getElementById('metricool-read-date');
    if (readDate) readDate.textContent = 'Metricool-avlesning: ' + new Date(snapshot.updatedAt).toLocaleDateString('nb-NO', {timeZone:'Europe/Oslo'});
    const meta = document.getElementById('chq-feed-meta');
    if (meta) meta.textContent = `Sist kontrollert ${stamp} · norsk tid · ${future.length} kommende poster. Metricool viser siste lagrede avlesning.`;
    const history = items.filter(post => post.status !== 'PENDING').sort((a,b) => new Date(b.date) - new Date(a.date));
    const output = document.getElementById('chq-feed-items');
    if (output) output.innerHTML = history.length ? history.map(post => `<article class="hq-history-item"><div class="hq-row-heading"><strong>${esc(post.title)}</strong><span class="hq-state ${post.status === 'BLOCKED' ? 'blocked' : ''}">${post.status === 'PUBLISHED' ? 'Publisert' : post.status === 'BLOCKED' ? 'Blokkert av YouTube' : esc(post.status)}</span></div><p class="muted">${esc(post.channelName)} · ${date(post.date)}${post.durationSeconds ? ' · ' + duration(post.durationSeconds) : ''}${post.quality ? ' · 1080p kontrollert' : ''}</p>${post.attentionNote ? `<p class="hq-attention">${esc(post.attentionNote)}</p>` : ''}${window.hqPostDetails(post)}</article>`).join('') : '<p class="sub">Ingen publiserte poster i denne avlesningen.</p>';

    const highlights = items.filter(post => post.channelKey === 'highlights');
    const upcoming = future.filter(post => post.channelKey === 'highlights');
    const batch = highlights.filter(post => post.batchId === 'highlights-2026-10-23-24').sort((a,b) => new Date(a.date) - new Date(b.date));
    const stats = snapshot.channelMetrics || {};
    const measuredDates = Object.values(stats).map(channel => channel.measuredAt).filter(Boolean).sort();
    const metricsStamp = measuredDates.length ? date(measuredDates[measuredDates.length - 1]) : stamp;
    const metrics = document.getElementById('metricool-snapshot-20261020');
    if (metrics) metrics.innerHTML = `<div class="eyebrow">YOUTUBE · SIST MÅLT ${esc(metricsStamp)}</div><h2>Kanalene i tall</h2><div class="hq-channel-metrics">${Object.values(stats).map(channel => `<article><h3>${esc(channel.name)}</h3><div class="highlights-kpis"><div><strong>${number(channel.subscribers)}</strong><small>Abonnenter</small></div><div><strong>${number(channel.views)}</strong><small>Totale kanalvisninger</small></div><div><strong>${number(channel.videos)}</strong><small>Videoer oppgitt av YouTube</small></div></div></article>`).join('')}</div><p class="muted">Offentlige YouTube-tall via vidIQ. Måletidspunkt vises over; registrert målehistorikk beholdes.</p>`;

    const c = stats.highlights || {};
    const panel = `<section class="highlights-panel"><div class="highlights-heading"><img src="https://static.metricool.com/brand-avatar/7571881/202610/c2b80ea1-f6af-4e6a-99b0-2076dac5e6c4.png" alt=""><div><h3>Highlights Of Everything</h3><div class="highlights-badge">YouTube koblet til Metricool · kontrollert ${esc(stamp)}</div></div></div><div class="highlights-kpis"><div><strong>${number(c.subscribers)}</strong><small>Abonnenter</small></div><div><strong>${number(c.views)}</strong><small>Kanalvisninger</small></div><div><strong>${number(c.videos)}</strong><small>Videoer oppgitt av YouTube</small></div><div><strong>${upcoming.length}</strong><small>Kommende poster i siste avlesning</small></div></div><p>Fire nye highlights i 1080p, med beskrivelser, hashtags og kreditering. ${upcoming.filter(post => post.batchId).length} av dem står fortsatt i publiseringskøen. TikTok er ikke koblet til denne profilen.</p><div class="hq-links">${link('https://www.youtube.com/@HighlightsOfEverything67','Åpne kanal ↗','btn primary')}${link('https://studio.youtube.com/channel/UCOdgzz7nrlUmhdmMTKgVDlA','YouTube Studio ↗','btn')}${link('https://app.metricool.com/planner/calendar?blogId=7571881','Metricool ↗','btn')}</div></section>`;
    document.getElementById('creator-statistics')?.insertAdjacentHTML('afterbegin', panel);
    document.getElementById('creator-settings')?.insertAdjacentHTML('beforeend', panel);

    const notice = document.createElement('section');
    notice.className = 'notice';
    notice.innerHTML = `<strong>Highlights Of Everything · ${upcoming.length} kommende videoer</strong><br>${upcoming.filter(post => post.batchId).length} nye 1080p-highlights har kommende publiseringstid. Den eldre Bottle Flip-shorten står i siste avleste plan, med merknad om rettigheter. Tider vises for Norge. Sist kontrollert ${esc(stamp)}.`;
    document.getElementById('creator-publishing')?.prepend(notice);

    const batchPanel = document.createElement('section');
    batchPanel.className = 'hq-batch-panel';
    batchPanel.innerHTML = `<div class="hq-row-heading"><div><div class="eyebrow">HIGHLIGHTS OF EVERYTHING</div><h3>To 23. oktober · to 24. oktober</h3></div><span class="hq-tag">Alle fire i 1080p</span></div><div class="hq-batch-grid">${batch.map(post => `<article class="hq-batch-card"><img src="${esc(post.thumbnail)}" alt="${esc(post.film)}" loading="lazy"><div><strong>${link(post.status === 'PUBLISHED' ? post.publicUrl : post.plannerUrl, post.title)}</strong><p>${date(post.date)} · ${duration(post.durationSeconds)} · ${post.status === 'PUBLISHED' ? 'Publisert' : 'Planlagt'}</p><span class="hq-tag">Beskrivelse + hashtags ✓</span></div></article>`).join('')}</div><p class="hq-source-note">Sist kontrollert ${esc(stamp)}. Åpne Publiseringsvideoer for hele køen, beskrivelser og kilder.</p>`;
    document.getElementById('creator-quick-panel')?.insertAdjacentElement('afterend', batchPanel);
  }).catch(() => {
    const meta = document.getElementById('chq-feed-meta');
    if (meta) meta.textContent = 'Publiseringsdata kunne ikke lastes. Kalenderen viser siste lagrede plan.';
  });
})();
