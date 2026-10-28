const assert = require('node:assert/strict');
const E = require('./tycoon_engine.js');
const pool = ['GK', 'DF', 'MF', 'FW'].flatMap(position => Array.from({ length: 35 }, (_, i) => ({ name: `${position} ${i}`, rating: 60 + i, position })));
function club(seed = 42) { const s = E.create(seed); E.seedRoster(s, pool); E.startSeason(s); E.market(s, pool); return s; }
const advance = (s, pool) => { E.prepare(s); return E.advance(s, pool); };
let passed = 0;
function test(name, run) { run(); console.log(`✓ ${name}`); passed++; }
test('Starter roster is valid; auto selection never creates players', () => { const s = club(), count = s.lineup.length + s.bench.length; for (const formation of Object.keys(E.FORMATIONS)) { s.formation = formation; E.pickLineup(s); assert.equal(s.lineup.length + s.bench.length, count); } });
test('Each club meets all opponents twice, once at each home ground', () => { const s = club(); const pairs = s.season.fixtures.flat().map(p => p.join('-')); assert.equal(pairs.length, 240); assert.equal(new Set(pairs).size, 240); for (const round of s.season.fixtures) assert.equal(new Set(round.flat()).size, 16); });
test('An incomplete lineup cannot earn matchday revenue or progress time', () => { const s = club(); s.bench.push(s.lineup.pop()); E.prepare(s); const before = JSON.stringify(s); assert.ok(advance(s, pool).error); assert.equal(JSON.stringify(s), before); });
test('Weekly settlement exactly reconciles to forecast', () => { const s = club(), before = s.money, estimate = E.forecast(s); const r = advance(s, pool); assert.equal(r.report.net, estimate.net); assert.equal(s.money, before + estimate.net); assert.equal(s.stats.totalMatches, 1); assert.equal(s.ledger[0].balance, s.money); });
test('Away games have no ticket revenue; expensive tickets lower demand', () => { const s = club(); const low = E.forecast(s).attendance; s.ticketPrice = 25; assert.ok(E.forecast(s).attendance < low); while (E.nextMatch(s)?.home) advance(s, pool); assert.equal(E.forecast(s).gate, 0); });
test('Construction has no benefits until the following week, including after reload', () => { const s = club(); s.city.placedBuildings.push({ id: 'shop', type: 'fanshop', level: 0, x: 10, y: 8, rotation: 0, construction: { due: 2, target: 1 } }); E.rebuild(s); assert.equal(E.level(s, 'fanshop'), 0); const reloaded = E.migrate(JSON.parse(JSON.stringify(s))); assert.equal(reloaded.city.placedBuildings.find(b => b.id === 'shop').level, 0); assert.equal(E.forecast(reloaded).commercial, 0); advance(reloaded, pool); assert.equal(E.level(reloaded, 'fanshop'), 1); assert.ok(E.forecast(reloaded).commercial > 0); });
test('Roads must connect to stadium, not merely exist beside the facility', () => { const s = club(), b = { type: 'fanshop', x: 10, y: 7, level: 1 }; s.city.placedBuildings.push(b); assert.ok(E.roadConnected(s, b)); s.city.roads = [{ col: 10, row: 9, type: 'paved' }]; assert.equal(E.roadConnected(s, b), false); });
test('Paused facilities neither generate income nor cost upkeep', () => { const s = club(), b = { type: 'fanshop', x: 10, y: 7, level: 2, paused: true }; s.city.placedBuildings.push(b); E.rebuild(s); assert.equal(E.level(s, 'fanshop'), 0); assert.equal(E.facility(s, b).income, 0); assert.equal(E.facility(s, b).upkeep, 0); });
test('Level gates, dependencies and budget are enforced', () => { const s = club(); assert.match(E.requirement(s, 'academy'), /Antrenman/); assert.match(E.requirement(s, 'stadium', 5), /gerekli/); s.money = 0; assert.match(E.requirement(s, 'fanshop'), /bütçe/); });
test('Quest rewards cannot be claimed early or twice', () => { const s = club(); assert.equal(E.claim(s, 'three_matches'), false); for (let i = 0; i < 3; i++) advance(s, pool); const cash = s.money; assert.equal(E.claim(s, 'three_matches'), true); assert.equal(E.claim(s, 'three_matches'), false); assert.equal(s.money, cash + 2500); });
test('Save reload preserves exact next match outcome and finances', () => { const s = club(); advance(s, pool); const copy = E.migrate(JSON.parse(JSON.stringify(s))); assert.deepEqual(advance(copy, pool), advance(s, pool)); });
test('Season payouts occur once and the table resets coherently', () => { const s = club(); for (let i = 0; i < E.seasonLength(s); i++) advance(s, pool); const before = s.money; assert.ok(advance(s, pool).error); const out = E.finishSeason(s); assert.equal(s.money, before + out.prize); assert.equal(s.league.seasonNumber, 2); assert.equal(s.season.teams[0].played, 0); assert.ok(E.finishSeason(s).error); });
test('Academy requires a built active facility and twelve weeks', () => { const s = club(); for (let i = 0; i < 12; i++) advance(s, pool); assert.equal(s.stats.youth, 0); s.city.placedBuildings.push({ id: 'academy', type: 'academy', level: 1, x: 8, y: 3 }); E.rebuild(s); for (let i = 0; i < 12; i++) advance(s, pool); assert.equal(s.stats.youth, 1); });
test('Market emptying cannot generate free new stock in the same week', () => { const s = club(); s.marketItems = []; E.market(s, pool); assert.equal(s.marketItems.length, 0); advance(s, pool); assert.equal(s.marketItems.length, 8); });
test('Maximum scouting discount never permits buy/sell arbitrage', () => { const s = club(); s.buildings.scout = 5; for (const p of pool) assert.ok(E.price(s, p) > E.sellPrice(p)); });
test('Legacy saves preserve money, squad and all buildings', () => { const s = E.migrate({ money: 1234, clubName: 'Arşiv', buildings: { stadium: 3, fanshop: 2, academy: 1 }, lineup: [{ id: 'p', name: 'Kaleci', position: 'GK', rating: 70 }], stats: { totalTrophies: 2 } }); assert.equal(s.money, 1234); assert.equal(s.buildings.fanshop, 2); assert.equal(s.buildings.academy, 1); assert.equal(s.lineup[0].name, 'Kaleci'); assert.equal(s.trophies.length, 2); });
test('Sponsor expires on agreed term; debt payment includes principal and interest', () => { const s = club(); s.sponsor = { pay: 1000, remaining: 1 }; s.debt = 5000; assert.equal(E.forecast(s).loan, 550); advance(s, pool); assert.equal(s.debt, 4500); assert.equal(s.sponsor, null); });
test('Long career simulation keeps financial and sporting state finite', () => { const s = club(); for (let season = 0; season < 20; season++) { for (let week = 0; week < E.seasonLength(s); week++) { const r = advance(s, pool); assert.equal(r.error, undefined); assert.ok(Number.isFinite(s.money)); assert.ok(s.teamCondition >= 0 && s.teamCondition <= 100); } E.finishSeason(s); } assert.equal(s.stats.totalMatches, 600); });
test('Timeline goals and shots reconcile with the final score across 100 seeds', () => {
    for (let seed = 1; seed <= 100; seed++) {
        const s = club(seed), m = advance(s, pool);
        for (const side of [0, 1]) {
            assert.equal(m.events.filter(e => e.side === side && e.type === 'goal').length, side ? m.ga : m.gf);
            assert.equal(m.events.filter(e => e.side === side && ['goal', 'save', 'corner', 'miss'].includes(e.type)).length, m.shots[side]);
            assert.ok(m.onTarget[side] <= m.shots[side]);
        }
        assert.ok(m.events.every((e, i) => e.minute >= 1 && e.minute <= 90 && (!i || e.minute >= m.events[i - 1].minute)));
    }
});
test('Completed match survives save migration without settling finances again', () => {
    const s = club(); advance(s, pool);
    const copy = E.migrate(JSON.parse(JSON.stringify(s)));
    assert.deepEqual(copy.lastMatch, s.lastMatch);
    assert.equal(copy.money, s.money); assert.equal(copy.stats.totalMatches, 1);
});
test('Squad strength materially affects results over equal seeded opposition', () => {
    let strong = 0, weak = 0;
    for (let seed = 1; seed <= 200; seed++) {
        const a = club(seed), b = club(seed);
        a.lineup.forEach(p => p.rating = 95); b.lineup.forEach(p => p.rating = 50);
        const x = E.simulateMatch(a, { name: 'Rakip', rating: 70 }, true), y = E.simulateMatch(b, { name: 'Rakip', rating: 70 }, true);
        strong += x.gf - x.ga; weak += y.gf - y.ga;
    }
    assert.ok(strong > weak + 200);
});
test('Match preparation is consumed by one week and missing preparation has no side effects', () => {
    const s = club(), before = JSON.stringify(s);
    assert.ok(E.advance(s, pool).error); assert.equal(JSON.stringify(s), before);
    E.prepare(s); assert.equal(E.advance(s, pool).error, undefined);
    assert.ok(E.advance(s, pool).error);
});
test('Equal teams average plausible goal totals and fatigue materially reduces performance', () => {
    let total = 0, fit = 0, tired = 0;
    for (let seed = 1; seed <= 2000; seed++) {
        const a = club(seed), b = club(seed);
        a.lineup.forEach(p => p.rating = 70); b.lineup.forEach(p => p.rating = 70);
        a.teamCondition = 100; b.teamCondition = 25;
        const x = E.simulateMatch(a, {name:'Rakip',rating:70}, true), y = E.simulateMatch(b, {name:'Rakip',rating:70}, true);
        total += x.gf + x.ga; fit += x.gf - x.ga; tired += y.gf - y.ga;
    }
    assert.ok(total / 2000 > 2 && total / 2000 < 3.2);
    assert.ok(fit > tired + 600);
    console.log(`  Equal-strength goals per match: ${(total / 2000).toFixed(2)}`);
});
test('Higher leagues offer stronger players and facilities need multiple weeks', () => {
    const a = club(), b = club(); b.league.tier = 4; E.market(b, pool, true);
    const avg = items => items.reduce((v,p) => v + p.rating, 0) / items.length;
    assert.ok(avg(b.marketItems) > avg(a.marketItems) + 10);
    assert.ok(E.buildTime('training') >= 4);
    a.city.placedBuildings.push({type:'training',level:0,construction:{target:1,due:5}});
    assert.match(E.requirement(a,'fanshop'), /inşaat/);
});
test('Trust affects attendance and commercial revenue; poor cohesion and strain reduce strength', () => {
    const a = club(), b = club();
    E.dynamics(a).trust = 90; E.dynamics(b).trust = 20;
    assert.ok(E.forecast(a).attendance > E.forecast(b).attendance);
    const shop = {type:'fanshop',level:1,x:10,y:7};
    assert.ok(E.facility(a,shop).income > E.facility(b,shop).income);
    E.dynamics(b).cohesion = 20; E.dynamics(b).strain = 70;
    assert.ok(E.strength(a).effective > E.strength(b).effective + 5);
});
test('Training load accumulates and rest reverses it', () => {
    const a = club(), b = club(); a.trainingPlan = 'intensive'; b.trainingPlan = 'rest';
    E.dynamics(a).strain = E.dynamics(b).strain = 30;
    advance(a,pool); advance(b,pool);
    assert.equal(E.dynamics(a).strain,42); assert.equal(E.dynamics(b).strain,14);
});
test('A broken ticket promise persists through reload and settles only once', () => {
    const a = club(); a.event = {type:'community',week:a.week};
    assert.equal(E.decide(a,'yes').ok,true); assert.ok(E.decide(a,'yes').error);
    a.ticketPrice = 18; advance(a,pool); a.ticketPrice = 8;
    const b = E.migrate(JSON.parse(JSON.stringify(a)));
    assert.equal(b.dynamics.commitments[0].breached,true);
    advance(b,pool); advance(b,pool);
    assert.equal(b.dynamics.commitments.length,0);
    assert.ok(b.dynamics.journal.some(n=>n.text.includes('hedef karşılanmadı')));
    const count = b.dynamics.journal.filter(n=>n.text.includes('hedef karşılanmadı')).length;
    advance(b,pool);
    assert.equal(b.dynamics.journal.filter(n=>n.text.includes('hedef karşılanmadı')).length,count);
});
test('A kept ticket promise gains trust and fans after three matches', () => {
    const a = club(), b = club();
    a.event = {type:'community',week:a.week}; E.decide(a,'yes');
    for(let i=0;i<3;i++){advance(a,pool); advance(b,pool);}
    assert.ok(a.dynamics.trust > b.dynamics.trust);
    assert.ok(a.dynamics.journal.some(n=>n.text.includes('hedef karşılandı')));
    assert.equal(a.dynamics.commitments.length,0);
});
test('Cash deficits cause cumulative dressing-room consequences', () => {
    const a = club(), b = club(); a.money = -100000;
    advance(a,pool); advance(b,pool);
    assert.ok(a.dynamics.cohesion < b.dynamics.cohesion);
    assert.ok(a.clubForm < b.clubForm);
    assert.ok(a.dynamics.trust < b.dynamics.trust);
    assert.ok(a.dynamics.journal.some(n=>n.text.includes('Kasa açığı')));
});
test('Unaffordable decisions neither consume events nor grant effects', () => {
    const a = club(); a.money=100; a.event={type:'fatigue',week:a.week}; E.dynamics(a);
    const before=JSON.stringify(a); assert.ok(E.decide(a,'yes').error);
    assert.equal(JSON.stringify(a),before);
});
console.log(`${passed} simulation tests passed.`);
