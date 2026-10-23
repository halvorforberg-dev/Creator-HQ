(function () {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const when = value => new Intl.DateTimeFormat('nb-NO', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Oslo'}).format(new Date(value));
  const day = value => new Intl.DateTimeFormat('nb-NO', {day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Oslo'}).format(new Date(value + 'T12:00:00Z'));
  const ready = () => document.readyState === 'loading' ? new Promise(resolve => document.addEventListener('DOMContentLoaded',resolve,{once:true})) : Promise.resolve();
  window.creatorAITuberData = fetch('./data/aituber-publications.json?t=' + Date.now(), {cache:'no-store'}).then(response => {
    if (!response.ok) throw new Error('Publiseringsstatus kunne ikke hentes');
    return response.json();
  });
  window.creatorAITuberData.then(async snapshot => {
    await ready();
    const published = snapshot.items.filter(item => item.status === 'published');
    window.creatorAIAutopilotSchedule = snapshot.autopilots.filter(a => a.status === 'active' && a.nextRunAt && new Date(a.nextRunAt) >= new Date()).map(a => ({channel:a.channelKey === 'wild' ? 0 : 2,when:a.nextRunAt,title:a.title + ' · neste automatiske video',source:'aituber-autopilot',notes:'AI Tuber lager og publiserer ved denne kjøringen. Tittel er ikke oppgitt ennå.'}));
    scheduleRender();
    const box = document.getElementById('chq-ai-feed');
    if (!box) return;
    box.innerHTML = `<h2>AI Tuber · filmer og Autopilot</h2><p class="sub">${published.length} publiserte filmer · ${snapshot.autopilots.filter(a => a.status === 'active').length} aktive serier · kontrollert ${when(snapshot.updatedAt)}</p><div class="hq-ai-plans">${snapshot.autopilots.map(a => `<article class="hq-ai-plan"><strong>${esc(a.title)}</strong><p><span class="hq-state ${a.status === 'paused' ? 'blocked' : ''}">${a.status === 'active' ? 'Autopilot aktiv' : 'Pauset'}</span></p><p>${esc(a.cadence)}</p>${a.nextRunAt ? `<p>Neste produksjon og publisering: <strong>${when(a.nextRunAt)}</strong></p>` : ''}<a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">Se serie i AI Tuber ↗</a></article>`).join('')}</div><details class="hq-details"><summary>Se ${published.length} publiserte filmer og YouTube-lenker</summary><div class="hq-ai-published">${published.map(item => `<article class="hq-history-item"><strong>${esc(item.title)}</strong><p class="muted">${esc(item.channelName)} · ${day(item.publishedDate)} · Publisert${item.durationSeconds ? ' · ' + item.durationSeconds + ' sek' : ''}</p><a href="${esc(item.publicUrl)}" target="_blank" rel="noopener noreferrer">Se på YouTube ↗</a></article>`).join('')}</div></details><p class="hq-source-note">Konkrete poster i AI Tubers publiseringskø: ${snapshot.publicationQueueCount} ved kontrollen. Aktive Autopilot-serier lager videoer ved neste kjøring. Publiseringsstatus er sist kontrollert ${when(snapshot.updatedAt)}.</p><p id="hq-ai-production-freshness" class="hq-source-note"></p>`;
    const heading = document.querySelector('#creator-publishing .creator-view-heading');
    if (heading) heading.insertAdjacentElement('afterend', box);
    const overview = document.createElement('section');
    overview.className = 'creator-shortcut creator-compact-panel';
    overview.innerHTML = `<span><strong>AI Tuber · Little Wild + What If</strong><br><small class="muted">${published.length} publisert · 2 aktive Autopilot-serier · ukentlig langfilm pauset</small></span><button class="btn" onclick="showCreatorView('publishing');document.getElementById('chq-ai-feed').scrollIntoView({behavior:'smooth',block:'start'})">Se AI Tuber →</button>`;
    document.getElementById('creator-quick-panel')?.insertAdjacentElement('afterend', overview);
    try {
      const response = await fetch('./data/aituber.json?t=' + Date.now(), {cache:'no-store'});
      if (!response.ok) throw new Error();
      const production = await response.json();
      const known = new Set(published.map(item => item.id));
      const newer = (production.items || []).filter(item => !known.has(item.id));
      const output = document.getElementById('hq-ai-production-freshness');
      output.textContent = 'Produksjonslisten synkroniseres daglig. Sist hentet ' + when(production.updatedAt) + (newer.length ? ' · ' + newer.length + ' nyere produksjoner har ikke verifisert publiseringsstatus her.' : '.');
    } catch { /* Verified publication history remains available. */ }
  }).catch(() => {
    const box = document.getElementById('chq-ai-feed');
    if (box) box.innerHTML = '<h2>AI Tuber</h2><p>Publiseringsstatus er midlertidig utilgjengelig.</p>';
  });
})();
