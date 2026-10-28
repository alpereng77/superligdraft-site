/* Weekly club simulation. Pure state transitions, shared by browser and Node tests. */
(function (root) {
    'use strict';
    const clamp = (n, a, b) => Math.max(a, Math.min(b, Number.isFinite(Number(n)) ? Number(n) : a));
    const BUILDINGS = {
        stadium: { name: 'Şehir Stadı', cost: 0, upkeep: 180, size: 3, role: 'Bilet hasılatı ve kapasite', category: 'football' },
        fanshop: { name: 'Forma & Hatıra Dükkânı', cost: 3500, upkeep: 80, size: 2, revenue: 650, role: 'Taraftar talebine bağlı mağaza geliri', category: 'commerce' },
        restaurant: { name: 'Taraftar Lokantası', cost: 6000, upkeep: 120, size: 2, revenue: 950, role: 'Ziyaretçi ve maç günü geliri', category: 'commerce' },
        training: { name: 'Antrenman Sahaları', cost: 7500, upkeep: 180, size: 3, role: 'Haftalık oyuncu gelişimi', category: 'football' },
        medical: { name: 'Kulüp Reviri', cost: 6000, upkeep: 130, size: 2, role: 'Maç yorgunluğunu azaltır', category: 'football' },
        academy: { name: 'Gençlik Akademisi', cost: 12000, upkeep: 200, size: 2, requires: 'training', role: 'Her 12 haftada bir genç oyuncu yetiştirir', category: 'football' },
        clubhq: { name: 'Kulüp İdare Binası', cost: 6500, upkeep: 100, size: 2, role: 'Tesis bakım giderlerinde seviye başına %5 tasarruf', category: 'management' },
        scout: { name: 'Gözlemci Bürosu', cost: 8000, upkeep: 150, size: 2, role: 'Daha güçlü transfer adayları ve %3/seviye indirim', category: 'management' },
        hotel: { name: 'Kamp Pansiyonu', cost: 10000, upkeep: 170, size: 2, requires: 'clubhq', role: 'Haftalık toparlanmaya +4/seviye kondisyon', category: 'management' },
        media: { name: 'Radyo & Basın Evi', cost: 12000, upkeep: 160, size: 2, revenue: 1100, requires: 'clubhq', role: 'Yayın geliri ve daha iyi sponsor teklifleri', category: 'commerce' },
        museum: { name: 'Kulüp Müzesi', cost: 15000, upkeep: 150, size: 2, requires: 'clubhq', role: 'Kazanılan her kupayla artan ziyaretçi geliri', revenue: 700, category: 'commerce' },
        track: { name: 'Atletizm Pisti', cost: 6000, upkeep: 90, size: 2, requires: 'training', role: 'Antrenmanın kondisyon maliyetini düşürür', category: 'football' },
        pool: { name: 'Toparlanma Havuzu', cost: 8000, upkeep: 130, size: 2, requires: 'medical', role: 'Haftalık toparlanmaya +3/seviye kondisyon', category: 'football' },
        statue: { name: 'Efsaneler Anıtı', cost: 4000, upkeep: 30, size: 1, role: 'Taraftar talebine +%5/seviye', category: 'decor' },
        fountain: { name: 'Taraftar Çeşmesi', cost: 3000, upkeep: 25, size: 1, role: 'Taraftar talebine +%4/seviye', category: 'decor' }
    };
    const LEAGUES = [
        { name: 'Bölgesel Amatör Lig', rating: 65, prize: 18000 },
        { name: 'TFF 2. Lig', rating: 71, prize: 40000 },
        { name: 'TFF 1. Lig', rating: 77, prize: 85000 },
        { name: 'Süper Lig', rating: 83, prize: 160000 },
        { name: 'Efsaneler Ligi', rating: 89, prize: 300000 }
    ];
    const FORMATIONS = { '4-4-2': { GK: 1, DF: 4, MF: 4, FW: 2 }, '4-3-3': { GK: 1, DF: 4, MF: 3, FW: 3 }, '3-5-2': { GK: 1, DF: 3, MF: 5, FW: 2 }, '5-3-2': { GK: 1, DF: 5, MF: 3, FW: 2 } };
    const OBJECTIVES = [
        { id: 'first_build', title: 'İlk yatırım', desc: 'Stadyum dışında bir tesisi faaliyete geçir.', target: 1, reward: 2000 },
        { id: 'three_matches', title: 'Sahaya alışıyoruz', desc: 'Üç lig haftasını tamamla.', target: 3, reward: 2500 },
        { id: 'three_wins', title: 'Tribünler ayağa', desc: 'Toplam üç galibiyet al.', target: 3, reward: 4000 },
        { id: 'academy', title: 'Bizim çocuklar', desc: 'Akademiden bir genç yetiştir.', target: 1, reward: 5000 },
        { id: 'campus', title: 'Bir kulüpten fazlası', desc: 'Altı farklı tesisi faaliyete geçir.', target: 6, reward: 8000 },
        { id: 'champion', title: 'Şampiyonun gazetesi', desc: 'İlk şampiyonluğunu kazan.', target: 1, reward: 10000 }
    ];
    const money = n => Math.round(n);
    function random(s) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296; }
    function create(seed = Date.now()) {
        return {
            version: 3, seed: seed >>> 0, clubName: 'Nostalji FK', managerName: 'Kulüp Başkanı', money: 15000, fans: 350,
            week: 1, teamCondition: 90, clubForm: 50, formation: '4-4-2', tactic: 'balanced', trainingPlan: 'balanced', ticketPrice: 8,
            buildings: { stadium: 1 }, city: { initialized: true, lands: [0], placedBuildings: [{ id: 'stadium', type: 'stadium', x: 5, y: 5, rotation: 0, level: 1, invested: 0 }], roads: Array.from({ length: 12 }, (_, i) => ({ col: i + 3, row: 9, type: 'asphalt' })).concat([{ col: 6, row: 8, type: 'asphalt' }]) },
            lineup: [], bench: [], marketItems: [], marketWeek: 0, league: { tier: 1, seasonNumber: 1, played: 0, won: 0, drawn: 0, lost: 0, points: 0, goalsFor: 0, goalsAgainst: 0 },
            stats: { totalMatches: 0, totalWon: 0, totalTrophies: 0, totalEarned: 15000, youth: 0 },
            claimedQuests: [], trophies: [], history: [], ledger: [], news: ['Yeni bir kulüp, yeni bir hikâye. İlk tesis yatırımınızı seçin.'], sponsor: null, debt: 0, academyProgress: 0, event: null, season: null
        };
    }
    function migrate(old) {
        const s = create();
        if (!old || typeof old !== 'object' || Array.isArray(old)) return s;
        for (const k of ['clubName', 'managerName']) if (typeof old[k] === 'string') s[k] = old[k].slice(0, 30);
        s.money = clamp(old.money ?? 15000, -1e9, 1e12); s.fans = clamp(old.fans ?? 350, 50, 1e8);
        for (const k of ['teamCondition', 'clubForm']) s[k] = clamp(old[k] ?? s[k], 0, 100);
        s.formation = FORMATIONS[old.formation] ? old.formation : '4-4-2';
        const seen = new Set();
        for (const group of ['lineup', 'bench']) s[group] = (Array.isArray(old[group]) ? old[group] : []).filter(p => p && typeof p.name === 'string' && FORMATIONS['4-4-2'][p.position]).filter(p => { if (p.id && seen.has(p.id)) return false; seen.add(p.id); return true; }).map((p, i) => ({ ...p, id: p.id || `${group}-${i}`, rating: clamp(p.rating, 45, 99), xp: clamp(p.xp || 0, 0, 99) }));
        s.bench.push(...s.lineup.splice(11));
        const previousLeague = old.league || {};
        s.league.tier = clamp(previousLeague.tier || 1, 1, 5); s.league.seasonNumber = Math.max(1, Number(previousLeague.seasonNumber) || 1);
        for (const k of Object.keys(s.stats)) s.stats[k] = clamp(old.stats?.[k] ?? s.stats[k], 0, 1e12);
        // Preserve every owned facility. Placement repair is handled by the city engine.
        const placed = old.city?.placedBuildings;
        if (Array.isArray(placed) && placed.length) {
            const types = new Set();
            s.city.placedBuildings = placed.filter(b => b && BUILDINGS[b.type] && !types.has(b.type) && types.add(b.type)).map((b, i) => ({ ...b, id: old.version === 3 && b.id ? b.id : `saved-${i}`, x: Math.floor(clamp(b.x, 2, 22)), y: Math.floor(clamp(b.y, 2, 22)), rotation: Math.floor(clamp(b.rotation || 0, 0, 3)), level: Math.floor(clamp(b.level ?? 1, b.construction ? 0 : 1, 5)) }));
            s.city.lands = [0, ...[1, 2, 3].filter(n => old.city.lands?.includes(n))];
            s.city.roads = (Array.isArray(old.city.roads) ? old.city.roads : []).filter(r => r && Number.isInteger(r.col) && Number.isInteger(r.row) && r.col >= 0 && r.col < 26 && r.row >= 0 && r.row < 26 && ['asphalt', 'paved'].includes(r.type));
        } else if (old.buildings) {
            s.city.placedBuildings = Object.entries(old.buildings).filter(([type, level]) => BUILDINGS[type] && level > 0).map(([type, level], i) => ({ id: `legacy-${i}`, type, level: clamp(level, 1, 5), x: 3 + (i % 4) * 3, y: 3 + Math.floor(i / 4) * 3, rotation: 0 }));
        }
        if (!s.city.placedBuildings.some(b => b.type === 'stadium')) s.city.placedBuildings.unshift(create().city.placedBuildings[0]);
        if (old.version === 3) {
            for (const k of ['week', 'seed', 'marketWeek', 'academyProgress', 'debt']) s[k] = clamp(old[k] ?? s[k], 0, 1e12);
            s.week = Math.max(1, s.week);
            s.ticketPrice = clamp(old.ticketPrice || 8, 4, 25);
            s.trainingPlan = ['rest', 'balanced', 'intensive'].includes(old.trainingPlan) ? old.trainingPlan : 'balanced';
            s.tactic = ['balanced', 'attack', 'counter'].includes(old.tactic) ? old.tactic : 'balanced';
            for (const k of ['history', 'ledger', 'news', 'trophies', 'claimedQuests', 'marketItems']) if (Array.isArray(old[k])) s[k] = old[k].slice(0, k === 'ledger' ? 80 : 100);
            s.league = { ...s.league, ...old.league };
            s.season = old.season && Array.isArray(old.season.teams) && [6, 16].includes(old.season.teams.length) && Array.isArray(old.season.fixtures) && old.season.fixtures.length === (old.season.teams.length - 1) * 2 ? old.season : null;
            s.preparedWeek = old.preparedWeek; s.event = old.event || null; s.sponsor = old.sponsor || null; s.rescueSeason = old.rescueSeason;
            if (old.lastMatch && Array.isArray(old.lastMatch.events) && old.lastMatch.report) s.lastMatch = old.lastMatch;
        } else {
            s.news = ['Eski kariyeriniz devralındı: nakit, kadro ve tesisler korundu. Yeni fikstür 1. haftadan başlıyor.'];
            for (let i = 0; i < Math.min(s.stats.totalTrophies, 20); i++) s.trophies.push({ name: 'Nostalji Kupası', season: 'Arşiv', tier: 1 });
        }
        if (old.dynamics && typeof old.dynamics === 'object') s.dynamics = JSON.parse(JSON.stringify(old.dynamics));
        dynamics(s); rebuild(s); return s;
    }
    function rebuild(s) {
        s.buildings = {};
        for (const b of s.city.placedBuildings) if (!b.paused && b.level > 0) s.buildings[b.type] = b.level;
    }
    const level = (s, type) => s.buildings[type] || 0;
    const seasonLength = s => s.season?.fixtures.length || 30;
    const buildTime = (type, next = 1) => Math.ceil(BUILDINGS[type].size + next);
    function prepare(s) { s.preparedWeek = s.week; }
    function dynamics(s) {
        if (!s.dynamics) s.dynamics = {};
        const d = s.dynamics;
        for (const [key, value] of Object.entries({ cohesion: 60, trust: 60, strain: 0 })) d[key] = clamp(d[key] ?? value, 0, 100);
        if (!Array.isArray(d.previousLineup)) d.previousLineup = [];
        if (!Array.isArray(d.journal)) d.journal = [];
        if (!Array.isArray(d.commitments)) d.commitments = [];
        return d;
    }
    function strength(s) {
        const d = dynamics(s);
        const factors = [
            { label: 'Kadro uyumu', value: (d.cohesion - 60) * .08 },
            { label: 'Moral', value: (s.clubForm - 50) * .04 },
            { label: 'Kondisyon', value: -Math.max(0, 85 - s.teamCondition) * .18 || 0 },
            { label: 'Birikmiş yük', value: -d.strain * .04 || 0 }
        ];
        return { base: overall(s), effective: Math.round((overall(s) + factors.reduce((sum, f) => sum + f.value, 0)) * 10) / 10, factors };
    }
    function record(s, text) {
        const d = dynamics(s); d.journal.unshift({ week: s.week, text }); d.journal = d.journal.slice(0, 24);
    }
    function eventInfo(s) {
        if (!s.event) return null;
        const type = s.event.type;
        if (type === 'fatigue') return { title: 'Sağlık ekibinden uyarı', story: 'Birikmiş çalışma yükü verimi düşürüyor. Sağlık programı yükü azaltır; ek çalışma ise gelişim karşılığında yük ve moral bedeli getirir.', choices: [
            { id: 'yes', title: 'Toparlanma programı', detail: '900 €; kondisyon +8, yük −20. Üç hafta sonra yük 25 veya altındaysa moral +5, değilse −3.', cost: 900 },
            { id: 'no', title: 'Tempolu çalışmayı sürdür', detail: 'Oyuncu başına +10 gelişim puanı; yük +12, moral −4. Üç hafta sonra yük 25 veya altındaysa moral +5, değilse −3.', cost: 0 }
        ] };
        if (type === 'finance') return { title: 'Nakit baskısı soyunma odasında', story: 'Kasa açığı oyuncuların güvenini sarsıyor. Her açık hafta moral, uyum ve taraftar güvenini azaltır.', choices: [
            { id: 'yes', title: 'Üç haftada bütçeyi toparlama sözü', detail: 'Şimdi moral +4. Üç hafta sonra kasa ≥0: uyum +5, güven +6; aksi halde moral −10, güven −10.', cost: 0 },
            { id: 'no', title: 'Durumu açıkça paylaş', detail: 'Şimdi moral −3, güven +3. Üç hafta sonra kasa ≥0: güven +4; aksi halde güven −3.', cost: 0 }
        ] };
        if (type === 'community') return { title: 'Tribünden bilet tepkisi', story: 'Taraftar güveni, maç günü talebini ve ticari geliri etkiliyor. Verdiğiniz bilet sözü üç hafta boyunca takip edilecek.', choices: [
            { id: 'yes', title: 'Uygun fiyat sözü', detail: 'Bilet en fazla 10 €, güven +4. Sonraki üç maçta fiyat ≤10 kalırsa güven +8, taraftar +25; söz bozulursa güven −10.', cost: 0 },
            { id: 'no', title: 'Mevcut fiyatı koru', detail: 'Fiyat değişmez; güven −4. Yüksek fiyatın haftalık güven kaybı sürer.', cost: 0 }
        ] };
        return { title: 'Basının önünde hedef açıklaması', story: 'İddialı bir açıklama takımı motive eder; tutulamayan sözün etkisi birkaç hafta sonra hissedilir.', choices: [
            { id: 'yes', title: 'Üç maçta en az 6 puan sözü', detail: 'Şimdi moral +5. Hedef tutarsa güven +8, moral +4; tutmazsa güven −8, moral −6.', cost: 0 },
            { id: 'no', title: 'Sabırlı gelişim mesajı', detail: 'Şimdi uyum +2. Üç maçta en az 3 puan: güven +3; altında: güven −2.', cost: 0 }
        ] };
    }
    function decide(s, choiceId) {
        const info = eventInfo(s), choice = info?.choices.find(c => c.id === choiceId);
        if (!choice) return { error: 'Geçersiz karar' };
        if (s.money < choice.cost && choice.cost > 0) return { error: 'Bu karar için bütçe yetersiz.' };
        const d = dynamics(s), type = s.event.type, bold = choiceId === 'yes';
        s.money -= choice.cost;
        const commitment = { type: ['fatigue', 'finance', 'community'].includes(type) ? type : 'press', bold, due: s.stats.totalMatches + 3, wins: 0, points: 0, breached: false, title: info.title };
        if (type === 'fatigue') {
            if (bold) { s.teamCondition = clamp(s.teamCondition + 8, 0, 100); d.strain = clamp(d.strain - 20, 0, 100); }
            else { d.strain = clamp(d.strain + 12, 0, 100); s.clubForm = clamp(s.clubForm - 4, 0, 100); for (const p of s.lineup) p.xp = (p.xp || 0) + 10; }
        } else if (type === 'finance') {
            s.clubForm = clamp(s.clubForm + (bold ? 4 : -3), 0, 100); if (!bold) d.trust = clamp(d.trust + 3, 0, 100);
        } else if (type === 'community') {
            if (bold) s.ticketPrice = Math.min(s.ticketPrice, 10);
            d.trust = clamp(d.trust + (bold ? 4 : -4), 0, 100);
        } else { if (bold) s.clubForm = clamp(s.clubForm + 5, 0, 100); else d.cohesion = clamp(d.cohesion + 2, 0, 100); }
        if (type !== 'community' || bold) d.commitments.push(commitment);
        record(s, choice.title + ': ' + choice.detail);
        s.event = null; return { ok: true };
    }
    function beforeMatch(s, notes) {
        const d = dynamics(s), ids = s.lineup.map(p => p.id);
        const changed = d.previousLineup.length ? ids.filter(id => !d.previousLineup.includes(id)).length : 0;
        const delta = changed > 3 ? -(changed - 3) * 2 : changed <= 1 ? 2 : 0;
        d.cohesion = clamp(d.cohesion + delta, 0, 100);
        if (delta < 0) notes.push('Toplu kadro değişimi: uyum ' + delta + '. Yeni ilk 11 birlikte oynamaya alışıyor.');
        if (delta > 0 && d.cohesion < 100) notes.push('Kadro istikrarı: uyum +' + delta + '; birlikte oynama alışkanlığı güçleniyor.');
        if (d.previousTactic && d.previousTactic !== s.tactic) { d.cohesion = clamp(d.cohesion - 2, 0, 100); notes.push('Taktik değişikliği: uyum −2; yeni plana alışma süreci.'); }
        d.previousLineup = ids; d.previousTactic = s.tactic;
        const previousStrain = d.strain;
        d.strain = clamp(d.strain + (s.trainingPlan === 'intensive' ? 12 : s.trainingPlan === 'rest' ? -16 : -5) - level(s, 'medical') * 2 - level(s, 'pool'), 0, 100);
        if (d.strain !== previousStrain) notes.push('Çalışma planı ve sağlık tesisleri: birikmiş yük ' + (d.strain - previousStrain) + ' → ' + d.strain + '/100.');
        for (const c of d.commitments) if (c.type === 'community' && s.ticketPrice > 10) c.breached = true;
    }
    function afterMatch(s, match, notes) {
        const d = dynamics(s), points = match.gf > match.ga ? 3 : match.gf === match.ga ? 1 : 0;
        if (s.money < 0) {
            s.clubForm = clamp(s.clubForm - 6, 0, 100); d.cohesion = clamp(d.cohesion - 3, 0, 100); d.trust = clamp(d.trust - 4, 0, 100);
            notes.push('Kasa açığı: moral −6, uyum −3, güven −4. Kadro maliyetlerini azaltın veya finansman bulun.');
        }
        if (s.ticketPrice > 14) { d.trust = clamp(d.trust - 2, 0, 100); notes.push('Yüksek bilet fiyatı: taraftar güveni −2; gelecek haftaların talebi azalıyor.'); }
        else if (s.ticketPrice <= 10) d.trust = clamp(d.trust + 1, 0, 100);
        if (d.strain >= 50) { s.clubForm = clamp(s.clubForm - 3, 0, 100); notes.push('Birikmiş yük 50 üzerinde: moral −3; maç verimi ve gelişim düşüyor.'); }
        for (const c of d.commitments) {
            c.points += points;
            if (s.stats.totalMatches < c.due) continue;
            const previousTrust = d.trust, previousMorale = s.clubForm, previousCohesion = d.cohesion;
            let success;
            if (c.type === 'press') { success = c.points >= (c.bold ? 6 : 3); d.trust += success ? (c.bold ? 8 : 3) : (c.bold ? -8 : -2); s.clubForm += c.bold ? success ? 4 : -6 : 0; }
            if (c.type === 'finance') { success = s.money >= 0; d.trust += success ? (c.bold ? 6 : 4) : (c.bold ? -10 : -3); if (c.bold) { if (success) d.cohesion += 5; else s.clubForm -= 10; } }
            if (c.type === 'community') { success = !c.breached; d.trust += success ? 8 : -10; if (success) s.fans += 25; }
            if (c.type === 'fatigue') { success = d.strain <= 25; s.clubForm += success ? 5 : -3; }
            d.trust = clamp(d.trust, 0, 100); s.clubForm = clamp(s.clubForm, 0, 100); d.cohesion = clamp(d.cohesion, 0, 100);
            notes.push(c.title + ': ' + (success ? 'hedef karşılandı.' : 'hedef karşılanmadı.') + ' Güven ' + (d.trust - previousTrust) + ', moral ' + (s.clubForm - previousMorale) + ', uyum ' + (d.cohesion - previousCohesion) + '.');
        }
        d.commitments = d.commitments.filter(c => c.due > s.stats.totalMatches);
        s.clubForm = clamp(s.clubForm, 0, 100); dynamics(s);
        if (s.event && s.week - s.event.week >= 3) { d.trust = clamp(d.trust - 3, 0, 100); notes.push('Yanıtsız kalan gündem: güven −3.'); s.event = null; }
        if (!s.event && s.week % 3 === 0) s.event = { type: s.money < 0 ? 'finance' : d.strain >= 35 || s.teamCondition < 45 ? 'fatigue' : d.trust < 45 || s.ticketPrice > 14 ? 'community' : 'press', week: s.week };
        for (const note of notes) record(s, note);
    }
    function cost(type, nextLevel = 1) { return nextLevel === 1 ? BUILDINGS[type].cost * 1.6 : money((BUILDINGS[type].cost || 8000) * 1.6 * Math.pow(2.15, nextLevel - 1)); }
    function requirement(s, type, next = 1) {
        if (!BUILDINGS[type]) return 'Geçersiz tesis';
        if (s.city.placedBuildings.some(b => b.construction)) return 'Önce devam eden inşaatı tamamlayın';
        if (next > 5) return 'En yüksek seviye';
        if (next > s.league.tier + 1) return `${LEAGUES[next - 2].name} gerekli`;
        const req = BUILDINGS[type].requires;
        if (req && !level(s, req)) return `${BUILDINGS[req].name} gerekli`;
        if (s.money < cost(type, next)) return 'Yetersiz bütçe';
        return '';
    }
    function roadConnected(s, b) {
        const stadium = s.city.placedBuildings.find(x => x.type === 'stadium');
        if (!stadium || b.type === 'stadium') return true;
        const cells = new Map(s.city.roads.map(r => [`${r.col},${r.row}`, r]));
        const touches = (r, obj) => { const size = BUILDINGS[obj.type].size; return (r.col === obj.x - 1 || r.col === obj.x + size) && r.row >= obj.y && r.row < obj.y + size || (r.row === obj.y - 1 || r.row === obj.y + size) && r.col >= obj.x && r.col < obj.x + size; };
        const queue = [...cells.values()].filter(r => touches(r, stadium));
        const seen = new Set(queue.map(r => `${r.col},${r.row}`));
        for (let i = 0; i < queue.length; i++) {
            const r = queue[i]; if (touches(r, b)) return true;
            for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const k = `${r.col + dx},${r.row + dy}`; if (cells.has(k) && !seen.has(k)) { seen.add(k); queue.push(cells.get(k)); } }
        }
        return false;
    }
    function facility(s, b, targetLevel = b.level) {
        const cfg = BUILDINGS[b.type], active = !b.paused && targetLevel > 0;
        const connected = roadConnected(s, b), efficiency = connected ? 1 : 0.7;
        const demand = clamp((s.fans / 500) * (1 + level(s, 'statue') * .05 + level(s, 'fountain') * .04), .3, 3);
        const support = .7 + dynamics(s).trust / 200;
        const tourist = b.type === 'museum' ? 1 + s.trophies.length * .2 : 1;
        return { connected, efficiency, income: active ? money((cfg.revenue || 0) * .45 * Math.pow(1.7, targetLevel - 1) * demand * efficiency * tourist * support) : 0, upkeep: active ? money(cfg.upkeep * Math.pow(1.5, targetLevel - 1) * (1 - level(s, 'clubhq') * .05)) : 0 };
    }
    function wage(p) { return money(65 * Math.pow(1.105, p.rating - 60)); }
    function price(s, p) { return money(2800 * Math.pow(1.15, p.rating - 60) * (1 - level(s, 'scout') * .03)); }
    function sellPrice(p) { return money(2800 * Math.pow(1.15, p.rating - 60) * .4); }
    function rosterValid(s) {
        const wanted = FORMATIONS[s.formation];
        return s.lineup.length === 11 && Object.entries(wanted).every(([pos, count]) => s.lineup.filter(p => p.position === pos).length === count);
    }
    function overall(s) { return money(s.lineup.reduce((a, p) => a + p.rating, 0) / 11); }
    function pickLineup(s) {
        const pool = [...s.lineup, ...s.bench].sort((a, b) => b.rating - a.rating);
        s.lineup = [];
        for (const [pos, count] of Object.entries(FORMATIONS[s.formation])) s.lineup.push(...pool.filter(p => p.position === pos).slice(0, count));
        const ids = new Set(s.lineup.map(p => p.id)); s.bench = pool.filter(p => !ids.has(p.id));
    }
    function makePlayer(s, pool, pos, min, max) {
        const owned = new Set([...s.lineup, ...s.bench].map(p => p.name));
        const eligible = pool.filter(p => p.position === pos && !owned.has(p.name));
        const candidates = eligible.filter(p => p.rating >= min && p.rating <= max);
        const fallback = eligible.sort((a, b) => Math.abs(a.rating - min) - Math.abs(b.rating - min)).slice(0, 10);
        const available = candidates.length ? candidates : fallback;
        const p = available[Math.floor(random(s) * available.length)];
        if (!p) return null;
        return { ...p, id: `c-${s.week}-${Math.floor(random(s) * 1e12)}`, rating: clamp(p.rating, 45, 99), xp: 0 };
    }
    function seedRoster(s, pool) {
        if (s.lineup.length || s.bench.length) return;
        for (const [pos, count] of Object.entries({ GK: 2, DF: 5, MF: 5, FW: 3 })) for (let i = 0; i < count; i++) { const p = makePlayer(s, pool, pos, 60, 67); if (p) s.bench.push(p); }
        pickLineup(s);
    }
    function market(s, pool, force = false) {
        if (!force && s.marketWeek === s.week && s.marketItems.length) return;
        if (!force && s.marketWeek === s.week) return; // A sold-out list stays sold out until the next week.
        const base = LEAGUES[s.league.tier - 1].rating;
        const min = Math.max(58, base - 5), max = Math.min(96, base + 5 + level(s, 'scout') * 2);
        s.marketItems = ['GK', 'DF', 'DF', 'MF', 'MF', 'FW', 'FW', 'GK'].map(pos => makePlayer(s, pool, pos, min, max)).filter(Boolean);
        s.marketWeek = s.week;
    }
    function startSeason(s) {
        const regions = [
            ['Demirspor','İstasyonspor','Çınar Gençlik','Liman SK','Anadolu Birlik','Ege Belediye','Torosspor','Trakya Birlik','Fırat Gençlik','Kuzey Yıldızı','Ova SK','Yıldırımspor','Sahilspor','Güneşspor','Yayla SK','Kale Gençlik','Bozkırspor','Çamlık SK'],
            ['Kocaeli Birlik','Sakarya Gençlik','Bursa Atletik','İzmir Demir','Ankara Birlik','Konya Belediye','Eskişehir Gençlik','Samsun Atletik','Ordu Birlik','Denizli SK','Balıkesirspor','Aydın Belediye','Muğla Gençlik','Sivas Birlik','Elazığ SK','Diyarbakır Atletik','Van Birlik','Adana Demir'],
            ['İstanbulspor','Altay','Göztepe','Karşıyaka','Sakaryaspor','Kocaelispor','Bursaspor','Eskişehirspor','Samsunspor','Boluspor','Gençlerbirliği','Adanaspor','Denizlispor','Erzurumspor','Sivasspor','Manisaspor','Orduspor','Mersin İdmanyurdu'],
            ['Galatasaray','Fenerbahçe','Beşiktaş','Trabzonspor','Başakşehir','Bursaspor','Sivasspor','Kayserispor','Gaziantepspor','Konyaspor','Antalyaspor','Samsunspor','Gençlerbirliği','Kasımpaşa','Çaykur Rizespor','Göztepe','Eskişehirspor','Ankaragücü'],
            ['Galatasaray Efsaneleri','Fenerbahçe Efsaneleri','Beşiktaş Efsaneleri','Trabzon Efsaneleri','İzmir Efsaneleri','Ankara Efsaneleri','Bursa Efsaneleri','Adana Efsaneleri','Samsun Efsaneleri','Sivas Efsaneleri','Kayseri Efsaneleri','Gaziantep Efsaneleri','Konya Efsaneleri','Antalya Efsaneleri','Eskişehir Efsaneleri','Kocaeli Efsaneleri','Sakarya Efsaneleri','Denizli Efsaneleri']
        ];
        const choices = [...regions[s.league.tier - 1]];
        for (let i = choices.length - 1; i > 0; i--) { const j = Math.floor(random(s) * (i + 1)); [choices[i], choices[j]] = [choices[j], choices[i]]; }
        const names = [s.clubName, ...choices.slice(0, 15)];
        const teams = names.map((name, id) => ({ id, name, rating: LEAGUES[s.league.tier - 1].rating + Math.round(random(s) * 10 - 4), points: 0, gf: 0, ga: 0, played: 0, won: 0, drawn: 0, lost: 0 }));
        const fixtures = [], rotation = teams.map(t => t.id);
        for (let round = 0; round < teams.length - 1; round++) { const pairs = []; for (let i = 0; i < teams.length / 2; i++) pairs.push(round % 2 ? [rotation[teams.length - 1 - i], rotation[i]] : [rotation[i], rotation[teams.length - 1 - i]]); fixtures.push(pairs); rotation.splice(1, 0, rotation.pop()); }
        fixtures.push(...fixtures.map(pairs => pairs.map(([a, b]) => [b, a])));
        s.season = { teams, fixtures, results: [] };
    }
    function table(s) { return [...s.season.teams].sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || a.id - b.id); }
    function nextMatch(s) { if (!s.season) startSeason(s); const pair = s.season.fixtures[s.league.played]?.find(p => p.includes(0)); return pair ? { home: pair[0] === 0, opponent: s.season.teams[pair.find(id => id !== 0)] } : null; }
    function forecast(s) {
        const m = nextMatch(s), capacity = 800 * Math.pow(2, Math.max(0, level(s, 'stadium') - 1));
        const interest = (.7 + dynamics(s).trust / 200) * (1 + level(s, 'statue') * .05 + level(s, 'fountain') * .04) * (0.8 + s.clubForm / 100);
        const attendance = Math.min(capacity, money(s.fans * .95 * interest * Math.pow(8 / s.ticketPrice, 1.35)));
        const gate = m?.home ? attendance * s.ticketPrice : 0;
        const commercial = s.city.placedBuildings.reduce((sum, b) => sum + facility(s, b).income, 0);
        const maintenance = s.city.placedBuildings.reduce((sum, b) => sum + facility(s, b).upkeep, 0);
        const wages = [...s.lineup, ...s.bench].reduce((sum, p) => sum + wage(p), 0);
        const training = s.trainingPlan === 'intensive' ? 500 + s.lineup.length * 25 : s.trainingPlan === 'balanced' ? 150 : 0;
        const sponsor = s.sponsor?.remaining > 0 ? s.sponsor.pay : 0;
        const grant = 600 * s.league.tier;
        const loan = Math.min(s.debt, 500 * s.league.tier) + money(s.debt * .01);
        return { capacity, attendance, gate, commercial, maintenance, wages, training, sponsor, grant, loan, income: gate + commercial + sponsor + grant, expenses: maintenance + wages + training + loan, net: gate + commercial + sponsor + grant - maintenance - wages - training - loan };
    }
    function poisson(s, mean) { const threshold = Math.exp(-mean); let value = 1, k = 0; do { k++; value *= random(s); } while (value > threshold && k < 12); return k - 1; }
    function result(s, a, b, ga, gb) {
        for (const [x, gf, against] of [[a, ga, gb], [b, gb, ga]]) { const t = s.season.teams[x]; t.played++; t.gf += gf; t.ga += against; if (gf > against) { t.won++; t.points += 3; } else if (gf === against) { t.drawn++; t.points++; } else t.lost++; }
    }
    function simulateMatch(s, opponent, home) {
        const avg = pos => { const players = s.lineup.filter(p => p.position === pos); return players.reduce((sum, p) => sum + p.rating, 0) / Math.max(1, players.length); };
        const plan = { balanced: { attack: 1, risk: 1 }, attack: { attack: 1.2, risk: 1.22 }, counter: { attack: .86, risk: .82 } }[s.tactic];
        const midfield = avg('MF'), attack = avg('FW'), defence = avg('DF'), keeper = avg('GK');
        const d = dynamics(s);
        const morale = (s.clubForm - 50) * .04 + (d.cohesion - 60) * .08 - d.strain * .04;
        const conditionPenalty = Math.max(0, 85 - s.teamCondition) * .18;
        const possession = clamp(.5 + (midfield + morale - conditionPenalty - opponent.rating) / 110 + (s.tactic === 'attack' ? .05 : s.tactic === 'counter' ? -.05 : 0), .3, .7);
        const match = { gf: 0, ga: 0, possession: 50, shots: [0, 0], onTarget: [0, 0], corners: [0, 0], cards: [0, 0], xg: [0, 0], events: [], clubName: s.clubName, opponent: opponent.name, home, lineup: s.lineup.map(p => ({ name: p.name, position: p.position, rating: p.rating })), formation: s.formation };
        let touches = 0;
        for (let minute = 1; minute <= 90; minute++) {
            const us = random(s) < possession, side = us ? 0 : 1; if (us) touches++;
            const forwards = s.lineup.filter(p => p.position === 'FW' || p.position === 'MF');
            const scorer = us ? forwards[Math.floor(random(s) * forwards.length)]?.name || 'Forvet' : ['Emre', 'Mert', 'Berk', 'Onur'][Math.floor(random(s) * 4)];
            const fatigue = 1 - Math.max(0, 80 - s.teamCondition + minute * .13) / 200;
            const attackChance = .24 * (us ? plan.attack * fatigue : plan.risk);
            const chance = random(s);
            if (chance < attackChance) {
                const quality = us ? attack + morale - conditionPenalty - opponent.rating : opponent.rating - (defence * .6 + keeper * .4) - morale + conditionPenalty;
                const xg = clamp(.115 * Math.exp(quality / 28) * (us ? home ? 1.12 : .92 : home ? .92 : 1.12) + (random(s) - .5) * .07, .025, .32);
                match.shots[side]++; match.xg[side] += xg;
                const roll = random(s); let type;
                if (roll < xg) { type = 'goal'; if(us)match.gf++;else match.ga++; match.onTarget[side]++; }
                else if (roll < .34) { type = 'save'; match.onTarget[side]++; }
                else if (roll < .52) { type = 'corner'; match.corners[side]++; }
                else type = 'miss';
                match.events.push({ minute, side, type, player: scorer, xg: Math.round(xg * 100) / 100, lane: random(s) });
            } else if (chance > .94) {
                const yellow = random(s) < .28; if(yellow)match.cards[side]++;
                match.events.push({ minute, side, type: yellow ? 'yellow' : 'foul', player: scorer, lane: random(s) });
            } else if (minute % 7 === 0) match.events.push({ minute, side, type: 'pass', player: scorer, lane: random(s) });
        }
        match.possession = Math.round(touches / 90 * 100); match.xg = match.xg.map(v => Math.round(v * 100) / 100);
        return match;
    }
    function advance(s, pool) {
        if (s.league.played >= seasonLength(s)) return { error: 'Önce sezon değerlendirmesini tamamlayın.' };
        if (!rosterValid(s)) return { error: 'Maç için seçilen dizilişe uygun 11 oyuncu gerekli. Kadro sayfasını kontrol edin.' };
        if (s.preparedWeek !== s.week) return { error: 'Bu haftanın rakibini ve çalışma planını Maç hazırlığı ekranında değerlendirip hazırlığı tamamlayın.' };
        const report = forecast(s), m = nextMatch(s), notes = [];
        beforeMatch(s, notes);
        const plan = { rest: { recovery: 22, xp: 0 }, balanced: { recovery: 16, xp: 3 }, intensive: { recovery: 8, xp: 7 } }[s.trainingPlan];
        s.teamCondition = clamp(s.teamCondition + plan.recovery + level(s, 'hotel') * 4 + level(s, 'pool') * 3 + (s.trainingPlan === 'intensive' ? level(s, 'track') * 2 : 0), 0, 100);
        const match = simulateMatch(s, m.opponent, m.home);
        match.strength = strength(s);
        const { gf, ga } = match;
        const pairs = s.season.fixtures[s.league.played];
        const weekResults = pairs.map(([a, b]) => { let x, y; if (a === 0) { x = gf; y = ga; } else if (b === 0) { x = ga; y = gf; } else { x = poisson(s, Math.max(.3, 1.6 + (s.season.teams[a].rating - s.season.teams[b].rating) / 20)); y = poisson(s, 1.25); } result(s, a, b, x, y); return { a, b, x, y }; });
        s.season.results.push(weekResults);
        const me = s.season.teams[0];
        Object.assign(s.league, { played: me.played, won: me.won, drawn: me.drawn, lost: me.lost, points: me.points, goalsFor: me.gf, goalsAgainst: me.ga });
        s.stats.totalMatches++; if (gf > ga) s.stats.totalWon++;
        s.money += report.net; s.stats.totalEarned += report.income;
        s.debt = Math.max(0, s.debt - Math.min(s.debt, 500 * s.league.tier));
        s.ledger.unshift({ week: s.week, ...report, balance: s.money }); s.ledger = s.ledger.slice(0, 80);
        s.clubForm = clamp(s.clubForm + (gf > ga ? 6 : gf === ga ? 0 : -5), 10, 95);
        s.fans = Math.max(50, s.fans + (gf > ga ? 18 * s.league.tier : gf === ga ? 3 : -12));
        s.teamCondition = clamp(s.teamCondition - Math.max(7, 20 - level(s, 'medical') * 2), 0, 100);
        if (level(s, 'training')) for (const p of s.lineup) { p.xp = (p.xp || 0) + plan.xp * (1 + level(s, 'training') * .25) * (1 - dynamics(s).strain / 150); const ceiling = Math.min(96, 70 + level(s, 'training') * 5); if (p.xp >= 100 && p.rating < ceiling) { p.rating++; notes.push(`${p.name} gelişti: ${p.rating} OVR.`); } p.xp = p.rating >= ceiling ? 0 : p.xp % 100; }
        if (s.sponsor && --s.sponsor.remaining <= 0) { notes.push('Sponsor sözleşmesi sona erdi. Yeni teklifleri inceleyin.'); s.sponsor = null; }
        if (level(s, 'academy')) { s.academyProgress++; if (s.academyProgress >= 12) { const p = makePlayer(s, pool, ['GK', 'DF', 'MF', 'FW'][Math.floor(random(s) * 4)], 60, Math.min(90, 65 + level(s, 'academy') * 4)); if (p) { s.bench.push(p); s.stats.youth++; notes.push(`Akademiden ${p.name} A takıma yükseldi.`); s.academyProgress = 0; } } }
        s.week++;
        for (const b of s.city.placedBuildings) if (b.construction && b.construction.due <= s.week) { b.level = b.construction.target; delete b.construction; notes.push(`${BUILDINGS[b.type].name} seviye ${b.level} hizmete açıldı.`); }
        rebuild(s);
        afterMatch(s, match, notes);
        s.news = [`${gf > ga ? 'Zafer bizim!' : gf === ga ? 'Puanlar paylaşıldı.' : 'Gelecek haftaya bakıyoruz.'} ${s.clubName} ${gf}–${ga} ${m.opponent.name}`, ...notes, ...s.news].slice(0, 15);
        market(s, pool);
        s.lastMatch = { ...match, report, notes };
        return s.lastMatch;
    }
    function finishSeason(s) {
        if (s.league.played !== seasonLength(s)) return { error: 'Sezon henüz tamamlanmadı.' };
        const rank = table(s).findIndex(t => t.id === 0) + 1, league = LEAGUES[s.league.tier - 1];
        const prize = money(league.prize * (rank === 1 ? 1 : Math.max(.05, .45 / (rank - 1))));
        s.money += prize; s.stats.totalEarned += prize;
        s.history.unshift({ season: s.league.seasonNumber, name: league.name, rank, points: s.league.points, prize });
        if (rank === 1) { s.trophies.push({ name: `${league.name} Kupası`, season: s.league.seasonNumber, tier: s.league.tier }); s.stats.totalTrophies++; s.league.tier = Math.min(5, s.league.tier + 1); s.fans += 300; }
        else if (rank === s.season.teams.length) s.league.tier = Math.max(1, s.league.tier - 1);
        s.news.unshift(`Sezon kapandı: ${rank}. sıra ve ${prize.toLocaleString('tr-TR')} € lig primi.`);
        s.league = { tier: s.league.tier, seasonNumber: s.league.seasonNumber + 1, played: 0, won: 0, drawn: 0, lost: 0, points: 0, goalsFor: 0, goalsAgainst: 0 };
        s.teamCondition = 100; startSeason(s); return { rank, prize };
    }
    function objective(s, id) { const values = { first_build: Object.keys(s.buildings).filter(k => k !== 'stadium').length, three_matches: s.stats.totalMatches, three_wins: s.stats.totalWon, academy: s.stats.youth, campus: Object.keys(s.buildings).length, champion: s.stats.totalTrophies }; return values[id] || 0; }
    function claim(s, id) { const q = OBJECTIVES.find(x => x.id === id); if (!q || s.claimedQuests.includes(id) || objective(s, id) < q.target) return false; s.claimedQuests.push(id); s.money += q.reward; s.stats.totalEarned += q.reward; return true; }
    root.TycoonEngine = { BUILDINGS, LEAGUES, FORMATIONS, OBJECTIVES, seasonLength, buildTime, prepare, dynamics, strength, eventInfo, decide, create, migrate, rebuild, level, cost, requirement, roadConnected, facility, wage, price, sellPrice, rosterValid, overall, pickLineup, seedRoster, market, startSeason, table, nextMatch, forecast, advance, simulateMatch, finishSeason, objective, claim };
    if (typeof module !== 'undefined') module.exports = root.TycoonEngine;
})(typeof window !== 'undefined' ? window : globalThis);
