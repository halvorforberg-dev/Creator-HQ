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
    const items = (Array.isArray(snapshot.items) ? snapshot.items : []).filter(post=>post.channelKey!=='highlights');
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

    const stats = Object.fromEntries(Object.entries(snapshot.channelMetrics||{}).filter(([k])=>k!=='highlights'));
    const measuredDates = Object.values(stats).map(channel => channel.measuredAt).filter(Boolean).sort();
    const metricsStamp = measuredDates.length ? date(measuredDates[measuredDates.length - 1]) : stamp;
    const metrics = document.getElementById('metricool-snapshot-20261020');
    if (metrics) metrics.innerHTML = `<div class="eyebrow">YOUTUBE · SIST MÅLT ${esc(metricsStamp)}</div><h2>Kanalene i tall</h2><div class="hq-channel-metrics">${Object.values(stats).map(channel => `<article><h3>${esc(channel.name)}</h3><div class="highlights-kpis"><div><strong>${number(channel.subscribers)}</strong><small>Abonnenter</small></div><div><strong>${number(channel.views)}</strong><small>Totale kanalvisninger</small></div><div><strong>${number(channel.videos)}</strong><small>Videoer oppgitt av YouTube</small></div></div></article>`).join('')}</div><p class="muted">Offentlige YouTube-tall via vidIQ. Måletidspunkt vises over; registrert målehistorikk beholdes.</p>`;

  }).catch(() => {
    const meta = document.getElementById('chq-feed-meta');
    if (meta) meta.textContent = 'Publiseringsdata kunne ikke lastes. Kalenderen viser siste lagrede plan.';
  });
})();
