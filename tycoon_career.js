/* Newspaper presentation and CityBuilder adapter for the weekly simulation. */
(function () {
    'use strict';
    const E = TycoonEngine, KEY = 'superlig_tycoon_career_v4';
    let loaded = false, loading = false, page = 'city', marketFilter = 'ALL', selection = null, pendingImport = null;
    const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const euro = n => `${Math.round(n).toLocaleString('tr-TR')} €`;
    const state = () => tycoonState;
    const button = (label, action, cls = '', disabled = false) => `<button class="career-button ${cls}" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>`;
    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(state())); }
        catch (_) { toast('Kayıt yazılamadı. Tarayıcı depolama alanını kontrol edin.', 'error'); }
    }
    function toast(text, type = 'info') {
        const host = document.getElementById('tycoon-toast-container'); if (!host) return;
        const el = document.createElement('div'); el.className = `tycoon-toast toast-${type}`; el.textContent = text; host.append(el);
        setTimeout(() => el.remove(), 5500);
    }
    function mount() {
        const screen = document.getElementById('screen-tycoon');
        const legacy = screen.querySelector('.tycoon-container'); legacy.hidden = true;
        const root = document.createElement('div'); root.id = 'career-paper';
        root.innerHTML = `<header class="career-masthead"><div class="career-title"><div><p>SÜPER LİG NOSTALJİ DRAFT / KULÜP TYCOON</p><h1 id="career-club">Nostalji FK</h1></div><div class="career-header-end"><span id="career-edition"></span><button class="career-menu" data-action="menu">← Ana menü</button></div></div></header><div id="career-stats" class="career-stats"></div><nav class="career-nav" aria-label="Kulüp yönetimi"><button data-action="page:city">Kampüs</button><button data-action="page:squad">Takım</button><button data-action="page:market">Transfer</button><button data-action="page:season">Lig & hedefler</button><button data-action="page:finance">Yönetim</button></nav><aside id="career-sidebar"></aside><main class="career-main"><div id="career-city"><div id="career-city-host"></div><div class="career-map-caption"><span>Haritayı sürükle · Yakınlaşmak için tekerleği kullan</span><button data-action="facilities" class="career-menu">Tesislerim</button></div><div id="career-facilities" hidden></div></div><div id="career-content" hidden></div></main><dialog id="career-dialog" class="career-dialog"></dialog>`;
        screen.append(root);
        for (const id of ['city-build-panel', 'city-land-panel']) {
            const old = document.getElementById(id), modal = document.createElement('dialog');
            modal.id = id; modal.className = old.className;
            modal.setAttribute('aria-label', id === 'city-build-panel' ? 'Tesis inşa et' : 'Arazi satın al');
            old.replaceWith(modal); document.body.append(modal);
            modal.addEventListener('cancel', e => { e.preventDefault(); CityBuilder.cancelAction(); });
        }
        const city = document.getElementById('tycoon-view-city');
        document.getElementById('career-city-host').append(city); city.classList.remove('hidden');
        city.querySelectorAll('.btn-toggle-side').forEach(el => el.remove());
        root.addEventListener('click', e => { const target = e.target.closest('[data-action]'); if (target && !target.disabled) act(target.dataset.action); });
        root.addEventListener('change', e => {
            const field = e.target.dataset.field;
            if (!field) return;
            if (field === 'ticketPrice') state()[field] = Math.max(4, Math.min(25, Number(e.target.value)));
            else if (field === 'formation' && E.FORMATIONS[e.target.value]) { state().formation = e.target.value; E.pickLineup(state()); }
            else if (field === 'staffFocus' && ['all','GK','DF','MF','FW'].includes(e.target.value)) state().staffFocus = e.target.value;
            else if (field === 'personality' && E.GOALS[e.target.value] && (state().phase === 'preseason' || !state().league.played)) { state().personality = e.target.value; if (state().board) state().board.style = e.target.value; }
            else if (['trainingPlan', 'tactic'].includes(field)) state()[field] = e.target.value;
            else if (field === 'clubName') state().clubName = e.target.value.trim().slice(0, 30) || 'Nostalji FK';
            if (['formation','trainingPlan','tactic','staffFocus'].includes(field)) state().preparedWeek = null;
            save(); render();
        });
        window.addEventListener('resize', () => { if (page === 'city') CityBuilder.resize(); });
    }
    function select(field, choices) { return `<select data-field="${field}" aria-label="${field === 'trainingPlan' ? 'Haftalık çalışma planı' : field === 'formation' ? 'Diziliş' : field === 'staffFocus' ? 'Antrenman odağı' : field === 'personality' ? 'Kulüp hedefi' : 'Maç taktiği'}">${Object.entries(choices).map(([value, label]) => `<option value="${value}" ${state()[field] === value ? 'selected' : ''}>${label}</option>`).join('')}</select>`; }
    function render() {
        if (!loaded) return;
        const s = state(), f = E.forecast(s), league = E.LEAGUES[s.league.tier - 1], match = E.nextMatch(s);
        document.getElementById('career-edition').textContent = s.phase === 'preseason' ? `Sezon ${s.league.seasonNumber} · Hazırlık ${s.preseasonSteps}/2` : `Sezon ${s.league.seasonNumber} · Hafta ${Math.min(E.seasonLength(s),s.league.played + 1)} / ${E.seasonLength(s)}`;
        document.getElementById('career-club').textContent = s.clubName;
        document.getElementById('career-stats').innerHTML = [['Bütçe', euro(s.money)], ['Haftalık net', `${f.net >= 0 ? '+' : ''}${euro(f.net)}`], ['Taraftar', s.fans.toLocaleString('tr-TR')], ['Takım', `${E.overall(s)} OVR`]].map(([name, value]) => `<div><span>${name}</span><strong>${value}</strong></div>`).join('');
        document.querySelectorAll('.career-nav button').forEach(el => { const selected = el.dataset.action === `page:${page}`; el.classList.toggle('active', selected); el.setAttribute('aria-current', selected ? 'page' : 'false'); });
        document.getElementById('career-content').dataset.page = page;
        document.getElementById('career-city').hidden = page !== 'city'; document.getElementById('career-content').hidden = page === 'city';
        document.getElementById('career-sidebar').innerHTML = `<div class="career-next"><small>${league.name} · ${match ? match.home ? 'İç saha' : 'Deplasman' : 'Sezon tamamlandı'}</small><strong>${match ? esc(match.opponent.name) : 'Sezon sonu değerlendirmesi'}</strong></div><div class="career-ready"><span>Kondisyon <b>%${Math.round(s.teamCondition)}</b></span><span>Moral <b>%${Math.round(s.clubForm)}</b></span></div><div class="career-week-actions">${s.event ? button('Başkanın masası •', 'office', 'subtle') : ''}${button('Maç hazırlığı', 'plan', 'subtle')}${button(s.phase === 'preseason' ? 'Hazırlık haftası →' : s.league.played >= E.seasonLength(s) ? 'Sezonu bitir →' : s.preparedWeek === s.week ? 'Maça çık →' : 'Haftayı planla →', 'advance', 'ink')}</div>`;
        let impact = document.getElementById('career-impact');
        if (!impact) { impact = document.createElement('div'); impact.id = 'career-impact'; document.getElementById('career-sidebar').after(impact); }
        const d = E.dynamics(s), power = E.strength(s);
        impact.innerHTML = '<div><span>Etkin güç / kadro OVR</span><strong>' + power.effective + ' / ' + power.base + '</strong></div><div><span>Kadro uyumu</span><strong>%' + Math.round(d.cohesion) + '</strong></div><div><span>Taraftar güveni</span><strong>%' + Math.round(d.trust) + '</strong></div><div><span>Birikmiş yük</span><strong>%' + Math.round(d.strain) + '</strong></div>' + button('Kararlar ve sonuçlar' + (d.commitments.length ? ' · ' + d.commitments.length + ' söz' : ''), 'club-report');
        if (page === 'city') renderFacilities();
        else document.getElementById('career-content').innerHTML = ({ squad: squadPage, market: marketPage, season: seasonPage, finance: financePage }[page])();
        CityBuilder.refresh();
    }
    function heading(kicker, title, description) { return `<div class="career-section-heading"><div><span class="career-kicker">${kicker}</span><h2>${title}</h2></div><p>${description}</p></div>`; }
    function renderFacilities() {
        const s = state();
        document.getElementById('career-facilities').innerHTML = `<div class="career-subhead"><h3>Tesis sicili</h3><span>${s.city.placedBuildings.length} tesis · haftalık işletme raporu</span></div><div class="career-facility-list">${s.city.placedBuildings.map(b => { const f = E.facility(s, b); return `<button class="career-facility" data-action="facility:${b.id}"><span class="career-building-icon">${icon(b.type)}</span><span><strong>${E.BUILDINGS[b.type].name}</strong><small>${b.construction ? `İNŞAAT · ${b.construction.due - s.week} hafta` : b.paused ? 'FAALİYET DURDURULDU' : `SEVİYE ${b.level} · ${f.connected ? 'Yol bağlantısı var' : 'Yol yok · hizmet kapalı'}`}</small></span><b>${f.income ? `+${euro(f.income)}` : '—'}<small>Bakım ${euro(f.upkeep)}</small></b></button>`; }).join('')}</div>`;
    }
    function icon(type) { return ({ stadium: '⚑', training: '⚽', academy: '✎', medical: '✚', track: '◎', pool: '≈', clubhq: '▥', hotel: '▤', scout: '⌕', media: '♬', museum: '♜', restaurant: '♨', fanshop: '◈', statue: '★', fountain: '❋' })[type]; }
    const positions = { ALL:'Tümü', GK:'Kaleci', DF:'Defans', MF:'Orta saha', FW:'Forvet' };
    const status = (text, good=true) => `<span class="career-status ${good?'good':'warning'}">${text}</span>`;
    function squadPage() {
        const s=state(), valid=E.rosterValid(s), required=E.FORMATIONS[s.formation];
        return heading('TAKIM YÖNETİMİ','Kadro ve diziliş','İlk 11’i düzenleyin, yedek oyuncuları değerlendirin.') +
        `<div class="career-control-row"><label>Diziliş ${select('formation',Object.fromEntries(Object.keys(E.FORMATIONS).map(k=>[k,k])))}</label>${button('Sağlıklı ve hazır 11’i seç','autofill')}${!valid?button('Eksik mevkiye yerel oyuncu','emergencyMenu'):''}<span>${status(valid?'Maç kadrosu hazır':'Eksik mevki var',valid)}</span></div>
        <div class="career-squad-layout"><section class="career-squad-field"><div class="career-panel-heading"><h3>İlk 11</h3><span>${s.lineup.length}/11 oyuncu · ${E.overall(s)} OVR</span></div>
        <div class="career-pitch">${['FW','MF','DF','GK'].map(pos=>`<div class="career-pitch-row">${s.lineup.filter(p=>p.position===pos).map(p=>`<button data-action="player:${p.id}" aria-label="${esc(p.name)} — Oyuncu dosyası" title="Oyuncu dosyası"><span class="career-slot-top"><b>${p.rating}</b><small>${positions[pos]}</small></span><strong>${esc(p.name)}</strong><small>${p.injury?'Sakat '+p.injury+' hf':p.suspension?'Cezalı '+p.suspension+' maç':'Kond. %'+Math.round(p.condition)}</small></button>`).join('')}${Array.from({length:Math.max(0,required[pos]-s.lineup.filter(p=>p.position===pos).length)},()=>`<span class="career-empty-slot">${positions[pos]}<small>Oyuncu gerekli</small></span>`).join('')}</div>`).join('')}</div><p class="career-note">Oyuncuya tıklayarak dosyasını, sözleşmesini ve gelişimini inceleyin. Otomatik seçim kondisyonu ve cezaları dikkate alır.</p></section>
        <aside class="career-bench-panel"><div class="career-panel-heading"><h3>Yedek kulübesi</h3><span>${s.bench.length} oyuncu</span></div><div class="career-roster">${s.bench.map(p=>`<article><span class="career-rating">${p.rating}<small>OVR</small></span><div><h4>${esc(p.name)}</h4><p>${positions[p.position]} · ${p.age} yaş · ${euro(E.wage(p))}/hafta<br>Kond. %${Math.round(p.condition)} · ${p.injury?'Sakat '+p.injury+' hf':p.suspension?'Cezalı '+p.suspension+' maç':'Keskinlik %'+Math.round(p.sharpness)}</p></div><div class="career-roster-actions">${button('Kadroya al',`lineup:${p.id}`,'',!E.available(p)||s.lineup.length>=11||s.lineup.filter(x=>x.position===p.position).length>=required[p.position])}${button('Oyuncu dosyası',`player:${p.id}`,'subtle')}</div></article>`).join('')||'<p class="career-empty">Yedek oyuncu bulunmuyor. Transfer sekmesinden kadronuzu güçlendirebilirsiniz.</p>'}</div></aside></div>${squadLeaders(s)}${s.loans.length?'<div class="career-subhead"><h3>Kiralıktaki oyuncular</h3></div>'+s.loans.map(p=>'<p>'+esc(p.name)+' · '+p.loanWeeks+' hafta · '+p.rating+' OVR</p>').join(''):''}`;
    }
    function squadLeaders(s) {
        const players=[...s.lineup,...s.bench].map(p=>({p,stats:p.stats||{goals:0,assists:0,minutes:0,appearances:0}}));
        const name=x=>x?esc(x.p.name):'—', detail=x=>x?`${x.stats.appearances||0} maç · ${x.stats.minutes||0} dk`:'Henüz veri yok';
        const scored=[...players].sort((a,b)=>b.stats.goals-a.stats.goals||b.stats.assists-a.stats.assists||b.p.rating-a.p.rating)[0];
        const assisted=[...players].sort((a,b)=>b.stats.assists-a.stats.assists||b.stats.goals-a.stats.goals||b.p.rating-a.p.rating)[0];
        const rated=[...players].sort((a,b)=>b.p.rating-a.p.rating||b.p.potential-a.p.potential)[0];
        const active=players.filter(x=>x.stats.minutes>=90);
        const value=x=>((x.stats.goals*5+x.stats.assists*3)/(x.stats.minutes/90))+x.p.rating*.08+x.p.condition*.02;
        const sample=active.length?active:players;
        const efficient=[...sample].sort((a,b)=>value(b)-value(a)||b.p.rating-a.p.rating)[0];
        const inefficient=[...sample].sort((a,b)=>value(a)-value(b)||a.p.rating-b.p.rating)[0];
        const card=(title,x,valueText,note,accent='')=>`<article class="career-leader ${accent}"><span>${title}</span><h4>${name(x)}</h4><strong>${valueText(x)}</strong><small>${note(x)}</small></article>`;
        return `<div class="career-subhead"><h3>Kulüp istatistikleri</h3><span>Kariyer toplamları · verim için en az 90 dakika</span></div><div class="career-leaders">${card('GOL KRALI',scored,x=>`${x.stats.goals||0} gol`,detail,'goal')}${card('ASİST KRALI',assisted,x=>`${x.stats.assists||0} asist`,detail,'assist')}${card('EN YÜKSEK RATING',rated,x=>`${x.p.rating} OVR`,x=>`${positions[x.p.position]} · potansiyel ${Math.floor(x.p.potential)}`,'rating')}${card('EN VERİMLİ',efficient,x=>`${value(x).toFixed(1)} puan`,x=>`${x.stats.goals||0} gol · ${x.stats.assists||0} asist · ${x.stats.minutes||0} dk`,'good')}${card('GELİŞMESİ GEREKEN',inefficient,x=>`${value(x).toFixed(1)} puan`,x=>`${x.stats.goals||0} gol · ${x.stats.assists||0} asist · ${x.stats.minutes||0} dk`,'warning')}</div><p class="career-note">Verim puanı gol, asist, oynanan dakika, OVR ve kondisyonun birleşimidir; 90 dakikanın altında süre alan oyuncular karşılaştırmayı yanıltmamak için yalnızca başka aday yoksa değerlendirilir.</p>`;
    }
    function marketPage() {
        const s=state(), list=s.marketItems.filter(p=>marketFilter==='ALL'||p.position===marketFilter), scout=E.level(s,'scout');
        return heading('TRANSFER PAZARI','Kadronuza güç katın','Kulüplerin satışa açık oyuncuları. Sözleşme, rol ve gözlem raporunu inceleyerek teklif verin.')+
        `<div class="career-market-meta"><div><span>Transfer bütçesi</span><strong>${euro(s.money)}</strong></div><div><span>Gözlemci seviyesi</span><strong>${scout} <small>/ 5</small></strong></div><div><span>Bonservis indirimi</span><strong>%${scout*3}</strong></div></div>
        <div class="career-control-row"><div class="career-filter-group" role="group" aria-label="Oyuncu mevkisi">${Object.entries(positions).map(([pos,name])=>`<button class="career-button ${marketFilter===pos?'ink':''}" data-action="filter:${pos}" aria-pressed="${marketFilter===pos}">${name}</button>`).join('')}</div><span>${list.length} oyuncu listeleniyor</span></div>
        <div class="career-market-grid">${list.map(p=>{const cost=E.price(s,p),afford=s.money>=cost;return `<article class="career-player-ad"><div class="career-ad-top"><span class="career-position">${positions[p.position]}</span><b>${p.rating}<small>OVR</small></b></div><div class="career-player-identity"><div class="career-player-monogram" aria-hidden="true">${esc(p.name.split(' ').map(x=>x[0]).slice(0,2).join(''))}</div><div><h3>${esc(p.name)}</h3><p>${esc(p.team_name||'Serbest oyuncu')}</p></div></div><dl><div><dt>Bonservis</dt><dd>${euro(cost)}</dd></div><div><dt>Haftalık maaş</dt><dd>${euro(E.quote(s,p).wage)}</dd></div><div><dt>Yaş / Potansiyel</dt><dd>${p.age} / ${s.scouting[p.personId]?Math.floor(p.potential):'Gözlem gerekli'}</dd></div></dl><div class="career-ad-action">${button('Teklif ve rapor →',`buy:${p.id}` ,'ink')}<small>${afford?'Bonservis, sabit maaş ve rol birlikte değerlendirilir.':`Eksik bütçe: ${euro(cost-s.money)}`}</small></div></article>`;}).join('')||'<div class="career-empty"><h3>Bu mevkide oyuncu kalmadı</h3><p>Başka bir mevki seçin veya gelecek haftanın transfer listesini bekleyin.</p></div>'}</div>`;
    }
    function seasonPage() {
        const s = state();
        const goal=E.boardStatus(s);
        return `<div class="career-control-row"><span>${esc(goal.title)}: ${esc(goal.description)} · Şimdi ${goal.value} / Hedef ${goal.target}</span>${button('Rakip dosyaları','rivals')}</div>` + heading('LİG ALMANAĞI', `${E.LEAGUES[s.league.tier - 1].name}`, `${s.season.teams.length} takım · çift devre · ${E.seasonLength(s)} hafta. Şampiyon yükselir, sonuncu alt lige iner.`) + (s.lastMatch ? `<div class="career-control-row">${button('Son maçın tekrarını izle','replay')}<span>${s.league.played} / ${E.seasonLength(s)} hafta tamamlandı</span></div>` : '') + `<div class="career-table-wrap"><table class="career-table"><thead><tr><th>#</th><th>KULÜP</th><th>O</th><th>G</th><th>B</th><th>M</th><th>AV</th><th>P</th></tr></thead><tbody>${E.table(s).map((t, i) => `<tr class="${t.id === 0 ? 'our-club' : ''}"><td>${i + 1}</td><th>${esc(t.id === 0 ? s.clubName : t.name)}</th><td>${t.played}</td><td>${t.won}</td><td>${t.drawn}</td><td>${t.lost}</td><td>${t.gf - t.ga}</td><td><strong>${t.points}</strong></td></tr>`).join('')}</tbody></table></div><p class="career-note">Eşit puanda averaj, atılan gol ve sezon başlangıç sırası kullanılır. Şampiyonluk primi: ${euro(E.LEAGUES[s.league.tier - 1].prize)}.</p><div class="career-subhead"><h3>Fikstür</h3><span>${s.league.played} / ${E.seasonLength(s)} hafta tamamlandı</span></div><div class="career-fixtures">${s.season.fixtures.map((pairs, round) => { const pair = pairs.find(p => p.includes(0)), opp = s.season.teams[pair.find(id => id !== 0)], result = s.season.results[round]?.find(r => r.a === 0 || r.b === 0); return `<div class="${round === s.league.played ? 'next' : ''}"><span>${round + 1}. HAFTA</span><strong>${esc(opp.name)}</strong><small>${pair[0] === 0 ? 'İÇ SAHA' : 'DEPLASMAN'}</small><b>${result ? (result.a === 0 ? `${result.x}–${result.y}` : `${result.y}–${result.x}`) : '—'}</b></div>`; }).join('')}</div><div class="career-subhead"><h3>Başkanlık hedefleri</h3><span>Her prim yalnızca bir kez alınır</span></div><div class="career-objectives">${E.OBJECTIVES.map(q => { const val = E.objective(s, q.id), claimed = s.claimedQuests.includes(q.id); return `<article><h4>${q.title}</h4><p>${q.desc}</p><progress max="${q.target}" value="${Math.min(val, q.target)}"></progress><small>${Math.min(val, q.target)}/${q.target} · ${euro(q.reward)}</small>${button(claimed ? 'Prim alındı' : 'Primi tahsil et', `claim:${q.id}`, '', claimed || val < q.target)}</article>`; }).join('')}</div><div class="career-subhead"><h3>Şeref köşesi</h3><span>${s.trophies.length} kupa</span></div><div class="career-trophies">${s.trophies.map(t => `<article><b>♜</b><h4>${esc(t.name)}</h4><small>Sezon ${esc(t.season)}</small></article>`).join('') || '<p>Bu raf ilk kupanızı bekliyor.</p>'}</div>${s.history.length ? `<h3>Sezon arşivi</h3>${s.history.map(h => `<p>Sezon ${h.season} · ${esc(h.name)} · ${h.rank}. sıra · ${h.points} puan · ${euro(h.prize)}</p>`).join('')}` : ''}`;
    }
    function financePage() {
        const s = state(), f = E.forecast(s);
        return `<div class="career-control-row"><span>Gecikmiş ödeme: <b>${euro(E.arrears(s))}</b> · İtibar %${Math.round(s.reputation)}</span>${button('Ödeme ve kriz planı','accounts')}${button('Kulüp sezon hedefi','board')}${button('Kayıt yedeğini yükle','import')}</div>` + heading('İKTİSAT SAYFASI', 'Kulüp bütçesi', 'Tahmin, mevcut haftanın kadrosu ve faal tesisleri üzerinden hesaplanır.') + `<div class="career-finance-grid"><section><h3>Haftalık gelirler</h3>${rows([['Bilet hasılatı', f.gate], ['Tesis cirosu', f.commercial], ['Lig işletme desteği', f.grant], ['Sponsor', f.sponsor]])}<strong class="career-total">TOPLAM ${euro(f.income)}</strong></section><section><h3>Haftalık giderler</h3>${rows([['Kadro maaşları', f.wages], ['Tesis bakımı', f.maintenance], ['Antrenman', f.training], ['Kredi + faiz', f.loan]])}<strong class="career-total">TOPLAM ${euro(f.expenses)}</strong></section></div><div class="career-finance-grid"><section><h3>Gişe politikası</h3><label>Bilet bedeli <input type="number" min="4" max="25" data-field="ticketPrice" value="${s.ticketPrice}" aria-label="Bilet fiyatı"> €</label><p>Beklenen seyirci: ${f.attendance.toLocaleString('tr-TR')} / ${f.capacity.toLocaleString('tr-TR')}</p><p class="career-note">Yüksek fiyat talebi düşürür. Bilet geliri yalnızca iç saha maçlarında oluşur.</p></section><section><h3>Kulüp kimliği</h3><label>Kulüp adı <input maxlength="30" data-field="clubName" value="${esc(s.clubName)}"></label><p>Kayıt bu cihazdaki tarayıcıya aittir.</p>${button('Kariyer yedeğini indir', 'export')}<p class="career-note">Yaş, potansiyel ve bireysel özellikler nostalji kariyeri için modellenmiştir.</p></section></div><div class="career-finance-grid"><section><h3>Sponsorluk sözleşmesi</h3>${s.sponsor ? `<p>${esc(s.sponsor.name)} · ${s.sponsor.remaining} hafta kaldı</p><strong>${euro(s.sponsor.pay)} / hafta</strong>` : `<p>Yerel Esnaf Birliği · 10 haftalık anlaşma</p><strong>${euro(700 + E.level(s, 'media') * 300 + (s.league.tier - 1) * 200)} / hafta</strong>${button('Sözleşmeyi imzala', 'sponsor')}`}</section><section><h3>Finansman</h3><p>Kalan borç: <strong>${euro(s.debt)}</strong></p><p class="career-note">${euro(15000 * s.league.tier)} kredi. Haftalık ${euro(400 * s.league.tier)} anapara ve kalan borca %0,5 faiz. Borç bitmeden yeni kredi alınamaz.</p>${button('Kredi koşullarını incele', 'loan', '', s.debt > 0)}${s.money < 1000 && s.rescueSeason !== s.league.seasonNumber ? button('Dayanışma fonu · 3.000 €', 'rescue') + '<small>Sezonda bir kez; taraftar güveninde %10 kayıp.</small>' : ''}</section></div><div class="career-subhead"><h3>İşletme defteri</h3><span>Son ${s.ledger.length} hafta</span></div><p class="career-note">Tahakkuk bu haftanın yükümlülüğüdür. Ödenen tutar eski gecikmeleri de içerebilir; nakit farkı kasanın gerçek değişimidir.</p><div class="career-table-wrap"><table class="career-table"><thead><tr><th>HAFTA</th><th>GELİR</th><th>TAHAKKUK</th><th>ÖDENEN</th><th>NAKİT FARKI</th><th>KASA</th></tr></thead><tbody>${s.ledger.map(r => `<tr><td>${r.week}</td><td>${euro(r.income)}</td><td>${euro(r.expenses)}</td><td>${euro(r.paid ?? r.expenses)}</td><td>${euro(r.net)}</td><td>${euro(r.balance)}</td></tr>`).join('') || '<tr><td colspan="6">İlk hafta sonunda muhasebe kaydı oluşacak.</td></tr>'}</tbody></table></div>`;
    }
    function rows(data) { return `<dl class="career-money-lines">${data.map(([name, value]) => `<div><dt>${name}</dt><dd>${euro(value)}</dd></div>`).join('')}</dl>`; }
    function dialog(title, body, actions) {
        CityBuilder.cancelAction();
        const d = document.getElementById('career-dialog'); d.setAttribute('aria-label', title); d.innerHTML = `<header class="career-dialog-header"><div><span class="career-kicker">KULÜP TYCOON</span><h2>${title}</h2></div><button class="career-dialog-close" data-action="close" aria-label="Pencereyi kapat">×</button></header><div class="career-dialog-body">${body}</div><footer class="career-dialog-actions">${actions}${button('Kapat', 'close')}</footer>`; if (!d.open) d.showModal(); d.querySelector('.career-dialog-close').focus();
    }
    function facilityDialog(id) {
        const s = state(), b = s.city.placedBuildings.find(b => b.id === id); if (!b) return;
        const cfg = E.BUILDINGS[b.type], f = E.facility(s, b), req = E.requirement(s, b.type, b.level + 1);
        selection = id;
        dialog(cfg.name, `<p>${cfg.role}</p><p>${b.construction ? `İnşaatın bitmesine ${b.construction.due - s.week} hafta kaldı. Tamamlanana kadar mevcut seviye işletilir.` : `Seviye ${b.level}/5 · ${f.reason}${f.capacity!==null?' · Kapasite '+f.capacity:''}`}</p>${rows([['Haftalık ciro', f.income], ['Haftalık bakım', f.upkeep]])}<p class="career-note">Yükseltme: ${b.level < 5 ? `${euro(E.cost(b.type, b.level + 1))} · ${E.buildTime(b.type, b.level + 1)} hafta` : 'En yüksek seviye'}. ${req && b.level < 5 ? req : ''}</p>`, button('Yükseltme emri ver', `upgrade:${id}`, 'ink', !!req || !!b.construction) + button('Haritada taşı', `move:${id}`, '', !!b.construction) + (b.type !== 'stadium' ? button(b.paused ? 'Faaliyete geçir' : 'Faaliyeti durdur', `pause:${id}`, '', !!b.construction) + button('Satış koşullarını incele', `remove:${id}`, 'subtle', !!b.construction) : ''));
    }
    function playerDialog(id) {
        const s=state(),p=[...s.lineup,...s.bench].find(p=>p.id===id);if(!p)return;
        const role={starter:'İlk 11',rotation:'Rotasyon',prospect:'Gelişim'}[p.contract.role];
        dialog(esc(p.name), '<p>'+positions[p.position]+' · '+p.age+' yaş · '+p.rating+' OVR · Potansiyel '+Math.floor(p.potential)+'</p><div class="career-player-facts">'+[['Kondisyon',Math.round(p.condition)],['Keskinlik',Math.round(p.sharpness)],['Moral',Math.round(p.morale)],['Gelişim',Math.floor(p.xp)+'/100'],['Sakatlık',p.injury+' hafta'],['Ceza',p.suspension+' maç']].map(([k,v])=>'<div><span>'+k+'</span><strong>'+v+'</strong></div>').join('')+'</div><p>Özellikler: '+Object.entries(p.attributes).map(([k,v])=>({pace:'Hız',passing:'Pas',finishing:'Bitiricilik',defending:'Savunma',keeping:'Kalecilik',stamina:'Dayanıklılık'})[k]+' '+Math.round(v)).join(' · ')+'</p><p>Sözleşme: '+euro(p.contract.wage)+'/hafta · '+Math.max(0,p.contract.until-s.week)+' hafta kaldı · Rol: '+role+'</p><p>Kariyer: '+p.stats.appearances+' maç, '+p.stats.minutes+' dakika, '+p.stats.goals+' gol, '+p.stats.assists+' asist.</p>'+(p.offer?'<p>Alıcı: '+esc(p.offer.name)+' · '+euro(p.offer.fee)+' · '+Math.max(0,p.offer.expires-s.week)+' hafta geçerli.</p>':'<p>'+(p.listed?'Satış listesinde; alıcı bekleniyor.':'Satış için önce oyuncuyu listeleyin.')+'</p>'),(s.lineup.includes(p)?button('Yedeğe al','bench:'+id):button('İlk 11’e al','lineup:'+id,'',!E.available(p)))+button('Sözleşme yenile','renew:'+id)+button('Satışa çıkar','sell:'+id,'',p.listed)+button('Kirala · 8 hafta','loanPlayer:'+id,'',s.lineup.includes(p)||p.age>24||!E.available(p))+(p.offer?button('Alıcı teklifini kabul et','sellConfirm:'+id,'ink'):''));
    }
    function transferDialog(id) {
        const s=state(),p=s.marketItems.find(p=>p.id===id);if(!p)return;const q=E.quote(s,p),cheap=E.quote(s,p,'bargain');
        dialog(esc(p.name)+' · Transfer görüşmesi','<p>'+esc(p.team_name)+' · '+p.age+' yaş · '+p.rating+' OVR · '+positions[p.position]+'</p>'+rows([['Bonservis',q.fee],['Sabit haftalık maaş',q.wage],['İndirimli teklif',cheap.fee],['İndirimli teklifte maaş',cheap.wage]])+'<p>60 haftalık sözleşme. Beklenen rol: '+(q.role==='starter'?'İlk 11':'Rotasyon')+'. '+(q.interest?'Kulübünüzle görüşmeye açık.':'Daha yüksek lig veya itibar bekliyor.')+'</p><p>Potansiyel: '+(s.scouting[p.personId]?Math.floor(p.potential):'Gözlem raporuyla öğrenilir')+'. İndirimli teklif reddedilebilir; standart teklif açık kalır. Borç gecikmesinde transfer yapılamaz.</p>',button('Standart teklifi imzala','sign:'+id,'ink',s.money<q.fee||!q.interest)+button('İndirim teklif et','bargain:'+id,'',s.money<cheap.fee||!q.interest)+button('Gözlem raporu · '+euro(200-E.level(s,'scout')*25),'scout:'+id,'',!!s.scouting[p.personId]));
    }
    function act(action) {
        const [kind, id] = action.split(':'), s = state();
        const close = () => document.getElementById('career-dialog').close();
        if (kind === 'page') { close(); CityBuilder.cancelAction(); page = id; render(); document.getElementById('career-paper').scrollIntoView({block:'start'}); if (page === 'city') requestAnimationFrame(() => CityBuilder.resize()); return; }
        if (kind === 'menu') { CityBuilder.cancelAction(); document.body.classList.remove('career-active'); document.getElementById('mode-tag').textContent = 'ANA MENÜ'; showScreen('screen-main-menu'); return; }
        if (kind === 'close') { close(); return; }
        if (kind === 'buyland') { close(); CityBuilder.buyLand(Number(id)); return; }
        if (kind === 'filter') { marketFilter = id; render(); return; }
        if (kind === 'facility') { facilityDialog(id); return; }
        if (kind === 'facilities') { renderFacilities(); dialog('Tesislerim', document.getElementById('career-facilities').innerHTML, ''); return; }
        if (kind === 'plan') {
            dialog('Maç hazırlığı', `<p>Rakip: ${esc(E.nextMatch(s)?.opponent.name || '—')} · ${E.nextMatch(s)?.opponent.rating || '—'} OVR. Takımınız: ${E.overall(s)} OVR · kondisyon %${Math.round(s.teamCondition)}. Her hafta çalışma planınızı değerlendirip hazırlığı tamamlayın.</p><label>Haftalık çalışma ${select('trainingPlan', { rest: 'Dinlenme: yüksek toparlanma, keskinlik kaybı', balanced: 'Dengeli: sürdürülebilir yük ve gelişim', intensive: 'Yoğun: hızlı gelişim, yük ve sakatlık riski' })}</label><label>Oyun anlayışı ${select('tactic', { balanced: 'Dengeli', attack: 'Hücum: daha çok pozisyon, daha çok risk', counter: 'Kontra: daha az pozisyon, daha sıkı savunma' })}</label><label>Antrenman önceliği ${select('staffFocus',{all:'Genç ve potansiyelli oyuncular',GK:'Kaleci',DF:'Defans',MF:'Orta saha',FW:'Forvet'})}</label><p>Tesis olmadan temel gelişim vardır. Antrenman kapasitesi ${E.services(s).training} oyuncu; sağlık kapasitesi ${E.services(s).medical} oyuncu/hafta. Yedekler toparlanır; ilk 11 sözü olanlar süre alamazsa moral kaybeder.</p>`, button('Takımı düzenle', 'page:squad') + button('Haftalık hazırlığı tamamla', 'prepare', 'ink')); return;
        }
        if (kind === 'player') { playerDialog(id); return; }
        if (kind === 'import') {
            dialog('Kariyer yedeğini yükle','<p>Dosya önce doğrulanır. Onaydan önce mevcut kariyeriniz değiştirilmez.</p><input id="career-import-file" type="file" accept="application/json,.json" aria-label="Kariyer yedeği dosyası"><p id="career-import-status" role="status"></p>','');
            document.getElementById('career-import-file').addEventListener('change',async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>12000000)throw new Error('Dosya 12 MB sınırını aşıyor.');const data=JSON.parse(await file.text());E.validateSave(data);pendingImport=data;dialog('Yedeği geri yükleme onayı','<p>'+esc(data.clubName)+' · Sezon '+data.league.seasonNumber+' · Hafta '+data.week+'. Mevcut kayıt ayrıca saklanacak.</p>',button('Bu kariyeri geri yükle','importConfirm','ink'));}catch(error){pendingImport=null;document.getElementById('career-import-status').textContent=error.message;}});return;
        }
        if (kind === 'importConfirm' && pendingImport) {try{const restored=E.migrate(pendingImport);localStorage.setItem(KEY+'_before_import',JSON.stringify(s));localStorage.setItem(KEY,JSON.stringify(restored));pendingImport=null;location.reload();}catch(error){toast('Yükleme tamamlanamadı: '+error.message,'error');}return;}
        if (kind === 'scout') { const out=E.scout(s,id);if(out.error)toast(out.error,'error');save();transferDialog(id);return; }
        if (kind === 'renew') { const p=[...s.lineup,...s.bench].find(p=>p.id===id);if(!p)return;dialog('Sözleşme rolü', '<p>60 haftalık sözleşme. İmza bedeli '+euro(300+s.league.tier*100)+'. İlk 11 sözü daha düşük maaş getirir; oynamazsa moral düşer. Gelişim rolünde ücret beklentisi artar.</p>', ['starter','rotation','prospect'].map(role=>button(({starter:'İlk 11',rotation:'Rotasyon',prospect:'Gelişim'})[role], 'contract:'+id+':'+role)).join(''));return; }
        if (kind === 'contract') { const out=E.renew(s,id,action.split(':')[2]);if(out.error){toast(out.error,'error');return;}save();render();playerDialog(id);return; }
        if (kind === 'loanPlayer') {const out=E.loanOut(s,id);if(out.error){toast(out.error,'error');return;}close();}
        if (kind === 'emergencyMenu') {dialog('Yerel oyuncu çağrısı','<p>Yalnızca sağlıklı oyuncusu eksik mevkiye, 50 OVR yerel oyuncu çağrılır. 8 hafta boyunca 35 €/hafta. Krizden çıkmak için geçici çözümdür.</p>',Object.entries(positions).filter(([p])=>p!=='ALL').map(([p,label])=>button(label,'emergency:'+p)).join(''));return;}
        if (kind === 'emergency') {const out=E.emergency(s,id);if(out.error){toast(out.error,'error');return;}close();}
        if (kind === 'accounts') {const f=E.forecast(s);dialog('Nakit ve yükümlülükler',rows([['Kasadaki para',s.money],['Geciken maaş',s.accounts.wages],['Geciken işletme ödemesi',s.accounts.operations],['Geciken faiz',s.accounts.interest],['Banka anaparası',s.debt],['Haftalık faiz',f.interest],['Haftalık anapara taksiti',f.principal]])+'<p>Kasadan yalnızca ödenebilen tutar çıkar. Ödenmeyen maaş, işletme ve faiz ayrı izlenir. Anapara sadece ödeme yapıldığında azalır.</p><p>Yapılandırma: gecikmiş ödemeleri banka borcuna taşır. 6 hafta daha düşük taksit; transfer yasağı ve sponsor gelirinde %30 kesinti. Sezonda bir kez.</p><h3>Son işlemler</h3>'+s.transactions.slice(0,10).map(t=>'<p>H'+t.week+' · '+esc(t.label)+' · '+euro(t.amount)+'</p>').join(''),button('Yapılandırma planını uygula','restructure','ink',s.restructureSeason===s.league.seasonNumber||s.debt+E.arrears(s)<=0));return;}
        if (kind === 'restructure') {const out=E.restructure(s);if(out.error){toast(out.error,'error');return;}close();}
        if (kind === 'board') {dialog('Kulübün sezon hedefi','<p>Hedef sezon başında veya hazırlık döneminde seçilir. Başarı '+euro(3000*s.league.tier)+' prim ve +5 itibar; başarısızlık −3 itibar.</p><label>Oyun yaklaşımı '+select('personality',E.GOALS)+'</label><p>Lig istikrarı: ilk %75. Akademi: gençlere 900 dakika. Borçsuz büyüme: sezon sonu borç ve gecikmiş ödeme sıfır. Üst sıralar: ilk 4.</p>', '');return;}
        if (kind === 'rivals') {dialog('Lig kulüpleri',s.season.teams.filter(t=>t.id!==0).map(t=>{const c=s.world.clubs[t.clubId];return '<section class="career-rival"><h3>'+esc(c.name)+'</h3><p>'+c.formation+' · '+({balanced:'Dengeli',attack:'Hücum',counter:'Kontra'})[c.tactic]+' · '+c.rating+' OVR · Kasa '+euro(c.money)+'</p><p>Son sezon puanları: '+(c.history.slice(-3).map(h=>h.points).join(' / ')||'İlk sezon')+'</p><p>'+c.lineup.slice(0,3).map(p=>esc(p.name)+' ('+p.rating+')').join(' · ')+'</p></section>';}).join(''),'');return;}
        if (kind === 'prepare') { E.prepare(s); save(); close(); render(); return; }
        if (kind === 'office') {
            const info = E.eventInfo(s); if (!info) return;
            dialog(info.title, '<p>' + esc(info.story) + '</p><div class="career-decision-choices">' + info.choices.map(c => '<section><h3>' + esc(c.title) + '</h3><p>' + esc(c.detail) + '</p>' + button(c.title, 'event:' + c.id, 'ink', c.cost > s.money && c.cost > 0) + '</section>').join('') + '</div>', ''); return;
        }
        if (kind === 'club-report') {
            const d = E.dynamics(s), power = E.strength(s);
            dialog('Kararların kulübe etkisi', '<p>Etkin güç, bugünkü kadro ve kondisyonun göstergesidir. Maç öncesi toparlanma ve kadro değişiklikleri bunu değiştirebilir. OVR artışıyla aynı şey değildir.</p>' + '<div class="career-impact-lines">' + power.factors.map(f => '<p><span>' + esc(f.label) + '</span><b>' + (f.value >= 0 ? '+' : '') + f.value.toFixed(1) + ' güç</b></p>').join('') + '</div><p>Uyum: aynı ilk 11 +1/hafta; üçten fazla yeni oyuncu alışma bedeli getirir. Taktik değişimi −2 uyum. Yoğun çalışma yük biriktirir; dinlenme keskinliği azaltır. Oyuncunun yaşı, potansiyeli, kondisyonu ve antrenman kapasitesi gelişimi belirler.</p><p>Güven bilet talebini ve ticareti etkiler. Lig için beklenen fiyatın %50 üzerine çıkmak güven kaybettirir. Gecikmiş maaş ve ödemeler moral, uyum ve güven kaybına, transfer kısıtına neden olur. Sağlık tesisleri yalnızca kapasiteleri kadar oyuncuyu hızla tedavi eder.</p><h3>Takip edilen sözler</h3>' + (d.commitments.map(c => '<p><b>' + esc(c.title) + '</b> · ' + Math.max(0, c.due - s.stats.totalMatches) + ' maç kaldı' + (c.type === 'press' ? ' · ' + c.points + '/' + (c.bold ? 6 : 3) + ' puan' : '') + (c.breached ? ' · Bilet sözü bozuldu' : '') + '</p>').join('') || '<p>Henüz açık bir taahhüt yok.</p>') + '<h3>Karar ve sonuç defteri</h3>' + (d.journal.slice(0, 12).map(n => '<p><b>Hafta ' + n.week + '</b> · ' + esc(n.text) + '</p>').join('') || '<p>Kararlar ve haftalık etkileri burada kaydedilecek.</p>'), ''); return;
        }
        if (kind === 'replay' && s.lastMatch) { TycoonMatchView.play(s.lastMatch, render); return; }
        if (kind === 'advance') {
            if (s.phase === 'preseason') { const out = E.preseason(s, parsedPlayersPool.all); if(out.error)toast(out.error,'error'); save(); render(); return; }
            if (s.league.played >= E.seasonLength(s)) { const out = E.finishSeason(s); save(); render(); dialog('Sezonun son baskısı', `<p>${out.rank}. sırada bitirdiniz. Lig primi: <strong>${euro(out.prize)}</strong>.</p><p>Yeni lig: ${E.LEAGUES[s.league.tier - 1].name}. Yönetim hedefini seçin, sözleşmeleri inceleyin ve iki hazırlık haftasını tamamlayın.</p>`, button('Lig tablosuna git', 'page:season')); return; }
            if (s.preparedWeek !== s.week) { act('plan'); return; }
            const out = E.advance(s, parsedPlayersPool.all); if (out.error) { toast(out.error, 'error'); return; }
            save();
            CityBuilder.cancelAction();
            TycoonMatchView.play(out, render);
            return;
        }
        if (kind === 'autofill') E.pickLineup(s);
        if (kind === 'bench') { const i = s.lineup.findIndex(p => p.id === id); if (i >= 0) s.bench.push(...s.lineup.splice(i, 1)); close(); }
        if (kind === 'lineup') {
            const i = s.bench.findIndex(p => p.id === id); if (i < 0) return;
            const p = s.bench[i]; if(!E.available(p)){toast('Oyuncu sakat veya cezalı.');return;} const limit = E.FORMATIONS[s.formation][p.position];
            if (s.lineup.length >= 11 || s.lineup.filter(x => x.position === p.position).length >= limit) { toast('Önce bu mevkideki bir oyuncuyu yedeğe alın.'); return; }
            s.lineup.push(...s.bench.splice(i, 1)); close();
        }
        if (kind === 'sell') { const out=E.listPlayer(s,id); if(out.error)toast(out.error,'error'); save(); render(); playerDialog(id); return; }
        if (kind === 'sellConfirm') { const out=E.acceptSale(s,id); if(out.error){toast(out.error,'error');return;} close(); }
        if (kind === 'buy') { transferDialog(id); return; }
        if (kind === 'sign' || kind === 'bargain') { const out=E.buy(s,id,kind==='bargain'?'bargain':'standard'); if(out.error){toast(out.error,'error');return;} close(); }
        if (kind === 'claim' && !E.claim(s, id)) return;
        if (kind === 'sponsor' && !s.sponsor) s.sponsor = { name: 'Yerel Esnaf Birliği', pay: 700 + E.level(s, 'media') * 300 + (s.league.tier - 1) * 200, remaining: 10 };
        if (kind === 'loan') { dialog('Kulüp işletme kredisi', `<p>${euro(15000 * s.league.tier)} kasaya eklenir. Her hafta ${euro(400 * s.league.tier)} anapara ve kalan borcun %0,5’i ödenir.</p>`, button('Krediyi kullan', 'loanConfirm', 'ink')); return; }
        if (kind === 'loanConfirm' && s.debt === 0) { s.debt = 15000 * s.league.tier; s.money += s.debt; close(); }
        if (kind === 'rescue' && s.money < 1000 && s.rescueSeason !== s.league.seasonNumber) { s.money += 3000; s.fans = Math.max(50, Math.floor(s.fans * .9)); s.rescueSeason = s.league.seasonNumber; }
        if (kind === 'event' && s.event) { const result = E.decide(s, id); if (result.error) { toast(result.error, 'error'); return; } close(); }
        if (kind === 'upgrade') {
            const b = s.city.placedBuildings.find(b => b.id === id); if (!b || b.construction) return;
            const req = E.requirement(s, b.type, b.level + 1); if (req) { toast(req); return; }
            const amount = E.cost(b.type, b.level + 1); s.money -= amount; b.invested = (b.invested || 0) + amount; b.construction = { target: b.level + 1, due: s.week + E.buildTime(b.type, b.level + 1) }; close();
        }
        if (kind === 'pause') { const b = s.city.placedBuildings.find(b => b.id === id); if (b && b.type !== 'stadium' && !b.construction) b.paused = !b.paused; E.rebuild(s); close(); }
        if (kind === 'move') { close(); page = 'city'; render(); CityBuilder.resize(); CityBuilder.move(id); return; }
        if (kind === 'remove') { const b = s.city.placedBuildings.find(b => b.id === id); if (!b || b.type === 'stadium' || b.construction) return; dialog('Tesis satış kararı', `<p>${E.BUILDINGS[b.type].name} kaldırılacak. İade: ${euro(Math.floor((b.invested || E.cost(b.type)) * .4))}. Tesisin gelir ve hizmetleri sona erer.</p>`, button('Tesisi sat', `removeConfirm:${id}`, 'ink')); return; }
        if (kind === 'removeConfirm') { const b = s.city.placedBuildings.find(b => b.id === id); if (!b || b.type === 'stadium' || b.construction) return; s.money += Math.floor((b.invested || E.cost(b.type)) * .4); s.city.placedBuildings = s.city.placedBuildings.filter(b => b.id !== id); E.rebuild(s); CityBuilder.rebuild(); close(); }
        if (kind === 'export') { const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `kulup-kariyeri-hafta-${s.week}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); return; }
        save(); render();
    }
    window.TycoonCareer = {
        active: () => loaded,
        confirmLand: parcel => dialog(parcel.name, `<p>${parcel.w * parcel.h} yeni inşaat hücresi kampüsünüze eklenecek.</p>${rows([['Arazi bedeli', parcel.cost], ['Satın alma sonrası bütçe', state().money - parcel.cost]])}`, button('Araziyi satın al', `buyland:${parcel.id}`, 'ink', state().money < parcel.cost)),
        save, render, facility: facilityDialog,
        buildRequirement: type => E.requirement(state(), type),
        onBuild: b => { b.invested = E.cost(b.type); b.level = 0; b.construction = { target: 1, due: state().week + E.buildTime(b.type) }; },
        describe: (type, level = 1) => `${E.BUILDINGS[type].role} · Temel bakım ${euro(Math.round(E.BUILDINGS[type].upkeep * Math.pow(1.5, level - 1)))}/hafta`,
        sync: () => E.rebuild(state()),
        cityPulse: () => { const match=E.nextMatch(state()), home=Boolean(match?.home && state().phase==='season'); return { matchDay: home, crowd: home ? E.forecast(state()).attendance : 0 }; },
        configure: defs => { for (const [type, cfg] of Object.entries(E.BUILDINGS)) { if (defs[type]) { defs[type].purchaseCost = E.cost(type); defs[type].gridW = defs[type].gridH = cfg.size; } TYCOON_CONFIG.buildings[type].name = cfg.name; TYCOON_CONFIG.buildings[type].desc = cfg.role; } }
    };
    // One entry point replaces the legacy idle/FUT mode; no realtime ticker or hidden free-player grants.
    initTycoonModule = async function () {
        if (loading) return;
        document.body.classList.add('career-active');
        if (loaded) { render(); requestAnimationFrame(() => CityBuilder.resize()); return; }
        loading = true;
        try {
            await loadTycoonPlayersDatabase();
            if (!parsedPlayersPool.all.length) throw new Error('Oyuncu veritabanı yüklenemedi. Sayfayı yerel HTTP sunucusundan açın.');
            const raw = localStorage.getItem(KEY), previous = localStorage.getItem('superlig_tycoon_career_v3'), old = localStorage.getItem(TYCOON_STORAGE_KEY);
            if (raw) tycoonState = E.migrate(JSON.parse(raw));
            else if (previous) { tycoonState = E.migrate(JSON.parse(previous)); }
            else if (old) { localStorage.setItem(`${TYCOON_STORAGE_KEY}_before_career`, old); tycoonState = E.migrate(JSON.parse(old)); }
            else tycoonState = E.create();
            E.seedRoster(state(), parsedPlayersPool.all); if (!state().season) E.startSeason(state()); E.market(state(), parsedPlayersPool.all);
            if (tycoonTickerInterval) clearInterval(tycoonTickerInterval); if (tycoonSaveInterval) clearInterval(tycoonSaveInterval);
            loaded = true; mount(); CityBuilder.init(); render(); save();
        } catch (error) { toast(error.message, 'error'); }
        finally { loading = false; }
    };
    // CityBuilder persists through these hooks; other game modes keep their existing code paths.
    const oldSave = saveTycoonData, oldHUD = updateTycoonHUD;
    saveTycoonData = function () { if (loaded) save(); else oldSave(); };
    updateTycoonHUD = function (...args) { if (loaded) render(); else oldHUD(...args); };
})();
