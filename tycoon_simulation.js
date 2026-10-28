/* Career simulation v4: shared sporting rules, player careers and cash settlement.
 * The earlier engine supplies catalogue data, save compatibility and journal utilities.
 * No wall-clock rewards: every transition is one explicit management week. */
(function (root) {
    'use strict';
    const E = typeof module !== 'undefined' && module.exports ? require('./tycoon_engine.js') : root.TycoonEngine;
    const legacy = { ...E }, C = (v, a, b) => Math.max(a, Math.min(b, Number(v) || 0));
    const mean = (xs, fallback = 60) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : fallback;
    const rnd = s => { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296; };
    const hash = str => [...String(str)].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 17);
    const identity = p => p.personId || 'person-' + hash(p.name.trim().toLocaleLowerCase('tr-TR'));
    const PLAN = { rest: { recovery: 36, xp: .6, sharpness: -5, load: -16 }, balanced: { recovery: 29, xp: 3, sharpness: 1, load: -6 }, intensive: { recovery: 21, xp: 6, sharpness: 2, load: 10 } };
    const GOALS = { survival: 'Lig istikrarı', youth: 'Akademi kulübü', sustainable: 'Borçsuz büyüme', promotion: 'Üst sıralar' };
    const all = s => [...s.lineup, ...s.bench];
    const log = (s, text) => { const d = E.dynamics(s); d.journal.unshift({ week: s.week, text }); d.journal = d.journal.slice(0, 120); };
    const available = p => !(p.injury > 0 || p.suspension > 0 || p.loanWeeks > 0);
    function player(p, week = 1) {
        const h = hash(p.name), rating = C(p.rating, 45, 99);
        p.personId = identity(p); p.rating = rating; p.age = C(p.age ?? 21 + h % 12, 16, 45);
        p.potential = C(p.potential ?? rating + Math.max(0, 31 - p.age) * .8 + h % 4, rating, 99);
        p.condition = C(p.condition ?? 92, 0, 100); p.sharpness = C(p.sharpness ?? 75, 0, 100); p.morale = C(p.morale ?? 65, 0, 100);
        p.injury = C(p.injury, 0, 52); p.suspension = C(p.suspension, 0, 12); p.yellowTotal = C(p.yellowTotal, 0, 1000); p.xp = Math.max(0, Number(p.xp) || 0);
        if (!p.attributes) { p.attributes = {}; for (const [i, key] of ['pace','passing','finishing','defending','keeping','stamina'].entries()) p.attributes[key] = C(rating + ((h >>> (i * 3)) % 13) - 6 + (key === 'keeping' && p.position !== 'GK' ? -28 : 0), 25, 99);
            if (p.position === 'FW') p.attributes.finishing = C(rating + 4, 25, 99); if (p.position === 'DF') p.attributes.defending = C(rating + 4, 25, 99); if (p.position === 'MF') p.attributes.passing = C(rating + 4, 25, 99);
            const traits = (p.strengths || []).join(' ').toLocaleLowerCase('tr-TR'); if (/hız|sürat|pace/.test(traits)) p.attributes.pace = C(p.attributes.pace + 5, 25, 99); if (/pas|pass/.test(traits)) p.attributes.passing = C(p.attributes.passing + 5, 25, 99);
        }
        p.contract = p.contract || { wage: Math.round(55 * Math.pow(1.09, rating - 60)), until: week + 60, role: 'rotation' };
        p.stats = p.careerStats || { appearances: 0, goals: 0, assists: 0, minutes: 0, seasons: [] }; p.careerStats = p.stats;
        return p;
    }
    function xp(p, amount) {
        player(p); p.xp += Math.max(0, amount);
        while (p.xp >= 100 && p.rating < Math.floor(p.potential)) { p.xp -= 100; p.rating++; for (const key of Object.keys(p.attributes)) p.attributes[key] = C(p.attributes[key] + 1, 25, 99); }
        if (p.rating >= Math.floor(p.potential)) p.xp = Math.min(p.xp, 99);
    }
    function normalize(s) {
        s.version = 4; s.lineup ||= []; s.bench ||= []; s.loans ||= []; s.marketItems ||= []; s.seed >>>= 0;
        s.accounts ||= { wages: 0, operations: 0, interest: 0 }; s.transactions ||= []; s.eventHistory ||= {}; s.pendingEvents ||= []; s.personality ||= 'sustainable'; s.scouting ||= {};
        if (s.money < 0) { s.accounts.operations += -s.money; s.money = 0; }
        s.phase ||= 'season'; s.reputation = C(s.reputation ?? 35 + s.league.tier * 8, 10, 100); s.staffFocus ||= 'all';
        const seen = new Set();
        for (const key of ['lineup', 'bench', 'loans']) s[key] = s[key].filter(p => { player(p, s.week); if (seen.has(p.personId)) return false; seen.add(p.personId); xp(p, 0); return true; });
        if(s.world && s.season && !s.world.tables?.some(Boolean)) s.world.tables=otherTables(s);
        E.dynamics(s); sync(s); return s;
    }
    function create(seed) { return normalize(legacy.create(seed)); }
    function migrate(old) {
        if (!old || typeof old !== 'object') return create();
        const copy = JSON.parse(JSON.stringify(old));
        // v3 used an XP clamp; normalize excess XP before passing through that reader.
        for (const p of [...(copy.lineup || []), ...(copy.bench || [])]) { if (typeof p?.name === 'string') { if (old.version !== 4 && p.condition == null && Number.isFinite(old.teamCondition)) p.condition = old.teamCondition; xp(p, 0); } }
        const s = legacy.migrate({ ...copy, version: 3 });
        for (const key of ['world','loans','accounts','transactions','eventHistory','pendingEvents','phase','preseasonSteps','personality','reputation','staffFocus','board','restructureSeason','restructureWeeks','marketWeek','scouting']) if (copy[key] !== undefined) s[key] = copy[key];
        if (old.version !== 4) { s.event = null; s.marketWeek = 0; s.marketItems = []; s.news.unshift('Yeni yönetim düzeni: kadro ve sonuçlar korundu. Yaşlar ve özellikler nostalji kariyeri için modellenmiştir.'); }
        return normalize(s);
    }
    function sync(s) {
        for (const p of all(s)) player(p, s.week);
        s.teamCondition = Math.round(mean(s.lineup.map(p => p.condition), 90));
        legacy.rebuild(s);
    }
    function level(s, type, visited = new Set()) {
        if (visited.has(type)) return 0; visited.add(type);
        const b = s.city.placedBuildings.find(b => b.type === type && !b.paused && b.level > 0);
        if (!b || (type !== 'stadium' && !legacy.roadConnected(s, b))) return 0;
        const req = E.BUILDINGS[type].requires; if (req && !level(s, req, visited)) return 0;
        return b.level;
    }
    function services(s) {
        return { training: 12 + level(s, 'training') * 6, medical: level(s, 'medical') * 3, academy: Math.min(level(s,'academy') * 3, Math.max(0, 12 + level(s,'training') * 6 - all(s).length)), recovery: level(s,'hotel') * 2 + level(s,'pool') * 2, load: E.dynamics(s).strain };
    }
    function facility(s, b, target = b.level) {
        const f = legacy.facility(s, b, target), cfg = E.BUILDINGS[b.type], service = level(s, b.type);
        const stadium = s.city.placedBuildings.find(x => x.type === 'stadium');
        const distance = stadium ? Math.abs(b.x - stadium.x) + Math.abs(b.y - stadium.y) : 0;
        const near = ['fanshop','restaurant'].includes(b.type) ? Math.max(.65, 1.2 - distance * .025) : 1;
        const competition = s.city.placedBuildings.filter(x => x.id !== b.id && E.BUILDINGS[x.type].revenue && level(s,x.type)).length;
        const matchDay = E.nextMatch(s)?.home ? 1.2 : .8;
        const efficiency = service || b.type === 'stadium' ? 1 : 0;
        return { ...f, income: Math.round(f.income * efficiency * near * matchDay / (1 + competition * .06)), upkeep: b.paused ? 0 : f.upkeep, efficiency, service, capacity: b.type === 'training' ? 12 + service * 6 : b.type === 'medical' ? service * 3 : b.type === 'academy' ? services(s).academy : null, reason: !f.connected ? 'Yol bağlantısı yok; hizmet kapalı' : cfg.requires && !level(s,cfg.requires) ? E.BUILDINGS[cfg.requires].name + ' faal olmalı' : b.paused ? 'Faaliyet durduruldu' : 'Faal' };
    }
    function requirement(s, type, next = 1) {
        if (!E.BUILDINGS[type]) return 'Geçersiz tesis';
        if (arrears(s) > 0) return 'Önce gecikmiş ödemeleri kapatın';
        if (s.city.placedBuildings.some(b => b.construction)) return 'Devam eden inşaatı tamamlayın';
        if (next > 5) return 'En yüksek seviye';
        if (next > s.league.tier + 1) return 'Üst lig lisansı gerekli';
        const req = E.BUILDINGS[type].requires; if (req && !level(s,req)) return E.BUILDINGS[req].name + ' faal ve yola bağlı olmalı';
        return s.money < E.cost(type,next) ? 'Yetersiz bütçe' : '';
    }
    function attribute(p,key) { return p.attributes[key] * (.83 + p.sharpness * .0017) * (1 - Math.max(0,75-p.condition) * .004) * (.95 + p.morale * .001); }
    function effective(p) { const keys = p.position === 'GK' ? ['keeping','passing'] : p.position === 'DF' ? ['defending','pace'] : p.position === 'MF' ? ['passing','pace'] : ['finishing','pace']; return mean(keys.map(k=>attribute(p,k))); }
    function pickLineup(s) {
        const pool = all(s).sort((a,b)=>effective(b)-effective(a)); s.lineup=[];
        for(const [pos,count] of Object.entries(E.FORMATIONS[s.formation])) s.lineup.push(...pool.filter(p=>p.position===pos&&available(p)).slice(0,count));
        const ids=new Set(s.lineup.map(p=>p.id));s.bench=pool.filter(p=>!ids.has(p.id));sync(s);
    }
    function rosterValid(s) { return legacy.rosterValid(s) && s.lineup.every(available); }
    function strength(s) {
        const d=E.dynamics(s), base=legacy.overall(s), perf=mean(s.lineup.map(effective),45);
        const factors=[{label:'Oyuncu özellikleri, kondisyon ve keskinlik',value:perf-base},{label:'Kadro uyumu',value:(d.cohesion-60)*.06},{label:'Takım morali',value:(s.clubForm-50)*.025},{label:'Birikmiş çalışma yükü',value:-d.strain*.025}];
        return {base,effective:Math.round((base+factors.reduce((v,f)=>v+f.value,0))*10)/10,factors};
    }
    function formProfile(team, excluded = new Set()) {
        const players=team.lineup.filter(p=>!excluded.has(p.id)); const group=pos=>players.filter(p=>p.position===pos);
        const mf=group('MF'),df=group('DF'),fw=group('FW');
        const mood=((team.morale??50)-50)*.025-(team.load||0)*.025;
        return { midfield:mean(mf.map(p=>attribute(p,'passing')),40)+(mf.length-4)*3+mood, defence:mean(df.map(p=>attribute(p,'defending')),40)+(df.length-4)*2.5+mood, attack:mean(fw.map(p=>attribute(p,'finishing')),40)+(fw.length-2)*2+mood, width:mean(players.filter(p=>/kanat|bek|wing|back|LM|RM|LB|RB/i.test(p.detailed_position||'')).map(p=>attribute(p,'pace')),60)+(team.formation==='4-3-3'?5:0), keeper:mean(group('GK').map(p=>attribute(p,'keeping')),25) };
    }
    function matchEngine(s, homeTeam, awayTeam) {
        const sides=[homeTeam,awayTeam], sent=[new Set(),new Set()], yellows=[{},{}], profiles=sides.map(t=>formProfile(t));
        const m={gf:0,ga:0,possession:50,shots:[0,0],onTarget:[0,0],corners:[0,0],cards:[0,0],redCards:[0,0],xg:[0,0],events:[],participation:[{},{}],clubName:homeTeam.name,opponent:awayTeam.name,home:true,formation:homeTeam.formation};
        let possessionCount=0,pending=null;const score=[0,0];
        const pick=(side,positions)=>{const candidates=sides[side].lineup.filter(p=>positions.includes(p.position)&&!sent[side].has(p.id));return candidates[Math.floor(rnd(s)*candidates.length)]||sides[side].lineup.find(p=>!sent[side].has(p.id));};
        const event=(minute,side,type,p,text,extra={})=>{if(p)m.events.push({minute,side,type,player:p.name,playerId:p.id,text,...extra});};
        for(let minute=1;minute<=90;minute++) {
            profiles[0]=formProfile(homeTeam,sent[0]);profiles[1]=formProfile(awayTeam,sent[1]);
            const difference=profiles[0].midfield-profiles[1].midfield+(homeTeam.cohesion-awayTeam.cohesion)*.05;
            const possession=C(.52+difference/130,.25,.75),side=pending?pending.side:rnd(s)<possession?0:1,other=1-side;
            if(side===0)possessionCount++;
            const tactic=sides[side].tactic,opTactic=sides[other].tactic,behind=score[side]<score[other]&&minute>65,leading=score[side]>score[other]&&minute>75;
            const passer=pick(side,['MF','DF']),forward=pick(side,pending?['DF','FW']:['FW','MF']);
            if(!forward)continue;
            const build=C(.22+(profiles[side].midfield-profiles[other].midfield)/800+(profiles[side].width-profiles[other].width)/1200+(tactic==='attack'?.045:tactic==='counter'?-.035:0)+(behind?.025:leading?-.02:0),.11,.37);
            const corner=pending?.kind==='corner',free=pending?.kind==='free';pending=null;
            const roll=rnd(s);
            if(!corner&&!free&&roll>.945){const offender=pick(other,['DF','MF']);if(!offender)continue;const yellow=rnd(s)<.42;event(minute,other,yellow?'yellow':'foul',offender,'Rakibin ilerleyişini faulle durdurdu.');if(yellow){m.cards[other]++;yellows[other][offender.id]=(yellows[other][offender.id]||0)+1;if(yellows[other][offender.id]===2){sent[other].add(offender.id);m.redCards[other]++;event(minute,other,'red',offender,'İkinci sarı kart; takımı eksik kaldı.');}}pending={side,kind:'free'};continue;}
            if(corner||free||roll<build){
                if(corner){event(minute,side,'setpiece',passer,'Korneri ceza sahasına gönderdi.');}
                else if(free){event(minute,side,'setpiece',passer,'Serbest vuruşla hücumu başlattı.');}
                else event(minute,side,'build',passer,behind?'Takımı beraberlik için riski artırıyor; ileriye pas.':leading?'Takımı skoru koruyarak kontrollü çıkıyor.':'Pas bağlantısıyla savunma arkasında boşluk buldu.');
                const q=(attribute(forward,corner?'defending':'finishing')+profiles[side].attack)/2-(profiles[other].defence*.65+profiles[other].keeper*.35);
                const chance=C(.102*Math.exp(q/38)*(side===0?1.1:.94)*(opTactic==='attack'?1.1:opTactic==='counter'?.95:1)*(tactic==='counter'&&opTactic==='attack'?1.14:1)*(corner?.82:1),.025,.34);
                m.shots[side]++;m.xg[side]+=chance;let type;const finish=rnd(s);
                if(finish<chance){type='goal';score[side]++;m.onTarget[side]++;}
                else if(finish<.37){type='save';m.onTarget[side]++;}
                else if(finish<.53){type='corner';m.corners[side]++;if(minute<90)pending={side,kind:'corner'};}
                else type='miss';
                event(minute,side,type,forward,type==='goal'?'Bitirici vuruş ağlarda!':type==='save'?'Vuruşunu kaleci çıkardı.':type==='corner'?'Savunmadan seken top kornere çıktı.':'Vuruşu kaleyi bulmadı.',{xg:Math.round(chance*100)/100,assistId:type==='goal'&&passer?.id!==forward.id?passer?.id:null});
            } else if(minute%12===0)event(minute,side,'pass',passer,'Rakibin baskısı karşısında topu dolaştırıyor.');
        }
        for(let side=0;side<2;side++)for(const p of sides[side].lineup){const red=m.events.find(e=>e.side===side&&e.type==='red'&&e.playerId===p.id);m.participation[side][p.id]={minutes:red?red.minute:90,yellows:yellows[side][p.id]||0,red:!!red};}
        m.gf=score[0];m.ga=score[1];m.possession=Math.round(possessionCount/90*100);m.xg=m.xg.map(v=>Math.round(v*100)/100);return m;
    }
    function teamView(s) {return {name:s.clubName,lineup:s.lineup,formation:s.formation,tactic:s.tactic,cohesion:E.dynamics(s).cohesion,morale:s.clubForm,load:E.dynamics(s).strain};}
    function simulateMatch(s,opponent,home) {
        const rival=opponent.clubId?s.world.clubs[opponent.clubId]:opponent;
        if(!rival.lineup) { const rng={seed:hash(rival.name)};rival.bench=generateRoster(rng,[],rival.rating||65,rival.name);rival.lineup=[];rival.formation='4-4-2';rival.tactic='balanced';rival.cohesion=60;pickRival(rival); }
        const match=home?matchEngine(s,teamView(s),rival):matchEngine(s,rival,teamView(s));
        if(!home){[match.gf,match.ga]=[match.ga,match.gf];for(const k of ['shots','onTarget','corners','cards','redCards','xg','participation'])match[k].reverse();match.possession=100-match.possession;match.events.forEach(e=>e.side=1-e.side);}
        match.clubName=s.clubName;match.opponent=rival.name;match.home=home;match.formation=s.formation;match.strength=strength(s);return match;
    }
    function generateRoster(s,pool,rating,name,used=new Set()) {
        const roster=[];for(const [pos,count] of Object.entries({GK:2,DF:6,MF:6,FW:4}))for(let i=0;i<count;i++){
            const candidates=pool.filter(p=>p.position===pos&&Math.abs(p.rating-rating)<5&&!used.has(identity(p)));
            const source=candidates.length?candidates[Math.floor(rnd(s)*candidates.length)]:{name:name+' '+({GK:'Kaleci',DF:'Savunmacı',MF:'Oyun kurucu',FW:'Forvet'}[pos])+' '+(i+1),position:pos,rating:C(rating+Math.floor(rnd(s)*9)-4,45,96)};
            const p=player({...source,id:'w-'+hash(name+'-'+pos+'-'+i),careerStats:undefined,stats:undefined},1);used.add(p.personId);roster.push(p);
        }return roster;
    }
    function ensureWorld(s,pool=[]) {
        if(s.world)return;
        const used=new Set([...all(s),...s.loans].map(identity));s.world={clubs:{},divisions:[],tables:[],season:1};
        for(let tier=1;tier<=5;tier++){
            const temp=legacy.create(hash('division-'+tier));temp.league.tier=tier;legacy.startSeason(temp);
            const names=temp.season.teams.slice(1).map(t=>t.name).concat(['Bölge '+tier+' Birlik']);const ids=[];
            for(let i=0;i<16;i++){const id='club-'+tier+'-'+i,rating=E.LEAGUES[tier-1].rating+(i%7)-3,roster=generateRoster(s,pool,rating,names[i],used),club={clubId:id,name:names[i],tier,rating,formation:['4-4-2','4-3-3','3-5-2','5-3-2'][i%4],tactic:['balanced','attack','counter'][i%3],cohesion:60,lineup:[],bench:roster,money:20000*tier,history:[]};pickRival(club);s.world.clubs[id]=club;ids.push(id);}s.world.divisions.push(ids);
        }
        // Keep the user's in-progress table and result history intact.
        if(s.season)for(const t of s.season.teams)if(t.id!==0){let c=Object.values(s.world.clubs).find(c=>c.name===t.name);if(!c){const id='legacy-'+hash(t.name),roster=generateRoster(s,pool,t.rating,t.name,used);c={clubId:id,name:t.name,tier:s.league.tier,rating:t.rating,formation:'4-4-2',tactic:'balanced',cohesion:60,lineup:[],bench:roster,money:20000,history:[]};pickRival(c);s.world.clubs[id]=c;}t.clubId=c.clubId;}
        if(s.season)s.world.tables=otherTables(s);
    }
    function pickRival(c) {const roster=[...c.lineup,...c.bench];c.lineup=[];for(const [pos,count]of Object.entries(E.FORMATIONS[c.formation]))c.lineup.push(...roster.filter(p=>p.position===pos&&available(p)).sort((a,b)=>effective(b)-effective(a)).slice(0,count));const ids=new Set(c.lineup.map(p=>p.id));c.bench=roster.filter(p=>!ids.has(p.id));c.rating=Math.round(mean(c.lineup.map(p=>p.rating)));}
    function fixtures(teams) {const rotation=teams.map(t=>t.id),result=[];for(let r=0;r<teams.length-1;r++){const pairs=[];for(let i=0;i<teams.length/2;i++)pairs.push(r%2?[rotation.at(-1-i),rotation[i]]:[rotation[i],rotation.at(-1-i)]);result.push(pairs);rotation.splice(1,0,rotation.pop());}return result.concat(result.map(p=>p.map(([a,b])=>[b,a])));}
    function otherTables(s) { return s.world.divisions.map((division,i)=>{if(i===s.league.tier-1)return null;const teams=division.map((id,n)=>({id:n,clubId:id,name:s.world.clubs[id].name,points:0,gf:0,ga:0,played:0,won:0,drawn:0,lost:0}));return {teams,fixtures:fixtures(teams),results:[]};}); }
    function startSeason(s) {
        ensureWorld(s);const ids=s.world.divisions[s.league.tier-1].slice(0,15);
        const teams=[{name:s.clubName,clubId:'user'},...ids.map(id=>s.world.clubs[id])].map((c,id)=>({id,clubId:c.clubId,name:c.name,rating:c.rating||legacy.overall(s),points:0,gf:0,ga:0,played:0,won:0,drawn:0,lost:0}));
        s.season={teams,fixtures:fixtures(teams),results:[]};s.marketWeek=0;s.board={style:s.personality,startDebt:s.debt+arrears(s),startFans:s.fans,startYouth:s.stats.youth,youngMinutes:0,rewarded:false};
        s.world.tables=otherTables(s);
    }
    function seedRoster(s,pool) {if(!s.lineup.length&&!s.bench.length)legacy.seedRoster(s,pool);normalize(s);ensureWorld(s,pool);}
    function nextMatch(s){if(!s.season)startSeason(s);return legacy.nextMatch(s);}
    function wage(p){return player(p).contract.wage;}
    function arrears(s){return Object.values(s.accounts||{}).reduce((a,b)=>a+Math.max(0,Number(b)||0),0);}
    function fairPrice(s){return 8+(s.league.tier-1)*2;}
    function forecast(s){
        const match=nextMatch(s),capacity=800*Math.pow(2,Math.max(0,level(s,'stadium')-1)),fair=fairPrice(s),ratio=(s.ticketPrice-fair)/fair;
        const attendance=Math.min(capacity,Math.round(s.fans*1.25*(.75+s.clubForm/150)*(.7+E.dynamics(s).trust/200)*Math.exp(-.55*ratio-.7*ratio*ratio)));
        const gate=s.phase==='preseason'?0:match?.home?attendance*s.ticketPrice:0,commercial=s.city.placedBuildings.reduce((v,b)=>v+facility(s,b).income,0),maintenance=s.city.placedBuildings.reduce((v,b)=>v+facility(s,b).upkeep,0);
        const wages=all(s).reduce((v,p)=>v+wage(p),0)+s.loans.reduce((v,p)=>v+Math.round(wage(p)*.25),0),training=s.trainingPlan==='rest'?30:s.trainingPlan==='intensive'?350:100;
        const sponsor=s.sponsor?.remaining>0?Math.round(s.sponsor.pay*(s.restructureWeeks>0?.7:1)):0,grant=650*Math.pow(s.league.tier,1.65),interest=Math.round(s.debt*.005),principal=Math.min(s.debt,s.restructureWeeks>0?150*s.league.tier:400*s.league.tier);
        const income=Math.round(gate+commercial+sponsor+grant),expenses=Math.round(maintenance+wages+training+interest+principal);
        return {capacity,attendance,gate,commercial,maintenance,wages,training,sponsor,grant:Math.round(grant),interest,principal,loan:interest+principal,income,expenses,net:income-expenses,arrears:arrears(s),fair};
    }
    function transaction(s,label,amount){s.money=Math.max(0,s.money+amount);s.transactions.unshift({week:s.week,label,amount,balance:s.money});s.transactions=s.transactions.slice(0,120);}
    function settle(s,f){
        const initial=s.money;s.money+=f.income;let paid=0;
        const pay=(amount)=>{const n=Math.min(s.money,amount);s.money-=n;paid+=n;return n;};
        const wagePaid=pay(f.wages);s.accounts.wages+=f.wages-wagePaid;
        const ops=f.maintenance+f.training,opsPaid=pay(ops);s.accounts.operations+=ops-opsPaid;
        const interestPaid=pay(f.interest);s.accounts.interest+=f.interest-interestPaid;
        const principalPaid=pay(f.principal);s.debt=Math.max(0,s.debt-principalPaid);
        for(const k of ['wages','operations','interest'])s.accounts[k]-=pay(s.accounts[k]);
        const report={...f,paid,principalPaid,unpaid:arrears(s),net:s.money-initial,balance:s.money};s.ledger.unshift({week:s.week,...report});s.ledger=s.ledger.slice(0,120);s.stats.totalEarned+=f.income;
        return report;
    }
    function quote(s,p,approach='standard'){
        player(p,s.week);const minTier=Math.max(1,Math.ceil((p.rating-72)/6));const interest=s.league.tier>=minTier||s.reputation>=75;
        const fee=Math.round(2400*Math.pow(1.14,p.rating-60)*(p.age<23?1.2:p.age>31?.7:1)*(1-level(s,'scout')*.025));
        const cheap=approach==='bargain',accepted=!cheap||(hash(p.personId+s.week)%100)<45+level(s,'scout')*5;
        return {fee:Math.round(fee*(cheap?.9:1)),wage:Math.round(55*Math.pow(1.09,p.rating-60)*(cheap?1.08:1)),role:p.rating>=legacy.overall(s)+2?'starter':'rotation',interest,accepted,minTier};
    }
    function price(s,p){return quote(s,p).fee;}
    function sellPrice(p){return Math.round(2400*Math.pow(1.14,p.rating-60)*(p.age>31?.7:1)*.65);}
    function market(s,pool=[],force=false){
        ensureWorld(s,pool);if(!force&&s.marketWeek===s.week)return;
        const owned=new Set([...all(s),...s.loans].map(identity)),base=E.LEAGUES[s.league.tier-1].rating;
        let candidates=[];for(const club of Object.values(s.world.clubs))for(const p of [...club.lineup,...club.bench])if(!owned.has(identity(p))&&p.rating>=base-7&&p.rating<=base+5+level(s,'scout')*2)candidates.push({p,club});
        s.marketItems=[];const seen=new Set();for(const pos of ['GK','DF','DF','MF','MF','FW','FW','GK']){const list=candidates.filter(c=>c.p.position===pos&&!seen.has(identity(c.p)));if(!list.length)continue;const c=list[Math.floor(rnd(s)*list.length)];seen.add(identity(c.p));s.marketItems.push({...JSON.parse(JSON.stringify(c.p)),sellerClubId:c.club.clubId,team_name:c.club.name});}s.marketWeek=s.week;
    }
    function buy(s,id,approach='standard'){
        const p=s.marketItems.find(p=>p.id===id);if(!p)return {error:'Oyuncu artık piyasada değil.'};const q=quote(s,p,approach);
        if(arrears(s)>0||s.restructureWeeks>0)return {error:'Gecikmiş ödemeler veya yapılandırma nedeniyle transfer kısıtı var.'};if(!q.interest)return {error:'Oyuncu daha yüksek lig veya kulüp itibarı bekliyor.'};if(!q.accepted)return {error:'Kulübü indirimli teklifi reddetti. Standart teklif bu hafta açık.'};
        if(all(s).length+s.loans.length>=25)return {error:'25 oyunculuk kadro sınırına ulaşıldı.'};if(all(s).concat(s.loans).some(x=>identity(x)===identity(p)))return {error:'Bu oyuncu zaten kulübünüzde.'};if(s.money<q.fee)return {error:'Bonservis için bütçe yetersiz.'};
        const seller=s.world.clubs[p.sellerClubId];if(!seller||![...seller.lineup,...seller.bench].some(x=>x.id===p.id))return {error:'Satıcı kulübün kadrosu değişti.'};
        const maxWage=Math.max(...all(s).map(wage));transaction(s,p.name+' transferi',-q.fee);seller.money+=q.fee;seller.lineup=seller.lineup.filter(x=>x.id!==id);seller.bench=seller.bench.filter(x=>x.id!==id);
        p.contract={wage:q.wage,until:s.week+60,role:q.role};p.morale=70;p.sharpness=Math.max(55,p.sharpness-10);p.joinedWeek=s.week;s.bench.push(p);s.marketItems=s.marketItems.filter(x=>identity(x)!==identity(p));
        if(q.wage>maxWage*1.4)s.pendingEvents.push({type:'captain',actor:all(s).sort((a,b)=>b.age-a.age)[0].name,week:s.week});log(s,p.name+' imzaladı; maaş '+q.wage+' €/hafta, rol '+(q.role==='starter'?'ilk 11':'rotasyon')+'.');return {ok:true};
    }
    function renew(s,id,role='rotation') {const p=all(s).find(p=>p.id===id);if(!p)return {error:'Oyuncu bulunamadı'};if(!['starter','rotation','prospect'].includes(role))return {error:'Geçersiz rol'};if(p.renewedWeek===s.week)return {error:'Bu hafta sözleşme zaten yenilendi.'};const fee=300+s.league.tier*100;if(s.money<fee||arrears(s)>0)return {error:'İmza bedeli veya gecikmiş ödeme nedeniyle yenileme yapılamıyor.'};transaction(s,p.name+' sözleşme bedeli',-fee);p.contract={wage:Math.round(55*Math.pow(1.09,p.rating-60)*(role==='starter'?.95:role==='prospect'?1.12:1.04)),until:s.week+60,role};delete p.expiredNotice;delete p.listed;delete p.offer;p.renewedWeek=s.week;p.morale=C(p.morale+5,0,100);return {ok:true};}
    function scout(s,id){const p=s.marketItems.find(p=>p.id===id);if(!p)return {error:'Oyuncu bulunamadı'};if(s.scouting[p.personId])return {ok:true};const fee=200-level(s,'scout')*25;if(s.money<fee)return {error:'Rapor için bütçe yetersiz.'};transaction(s,p.name+' gözlem raporu',-fee);s.scouting[p.personId]={potential:p.potential,week:s.week};return {ok:true};}
    function listPlayer(s,id){const p=all(s).find(p=>p.id===id);if(!p)return {error:'Oyuncu bulunamadı'};p.listed=true;p.offer=null;log(s,p.name+' satış listesinde; kulüpler sonraki hafta değerlendirecek.');return {ok:true};}
    function acceptSale(s,id){const p=all(s).find(p=>p.id===id);if(!p?.offer||p.offer.expires<s.week)return {error:'Geçerli alıcı teklifi yok.'};const buyer=s.world.clubs[p.offer.clubId];if(!buyer||buyer.money<p.offer.fee)return {error:'Alıcının bütçesi yetersiz.'};if(all(s).filter(x=>x.position===p.position).length<=1)return {error:'Bu mevkideki son oyuncuyu satamazsınız.'};buyer.money-=p.offer.fee;transaction(s,p.name+' satışı',p.offer.fee);s.lineup=s.lineup.filter(x=>x.id!==id);s.bench=s.bench.filter(x=>x.id!==id);delete p.offer;delete p.listed;buyer.bench.push(p);pickLineup(s);return {ok:true};}
    function loanOut(s,id){const p=s.bench.find(p=>p.id===id);if(!p||p.age>24||!available(p))return {error:'Yalnızca sağlıklı, 24 yaş ve altındaki yedekler kiralanabilir.'};if(all(s).filter(x=>x.position===p.position).length<=1)return {error:'Mevkide yedek kalmalı.'};p.loanWeeks=8;s.loans.push(p);s.bench=s.bench.filter(x=>x.id!==id);log(s,p.name+' gelişim kulübüne 8 haftalık kiralandı; maaşın %25’i kulübünüzde.');return {ok:true};}
    function emergency(s,pos){if(!E.FORMATIONS[s.formation][pos])return {error:'Geçersiz mevki'};if(all(s).filter(p=>p.position===pos&&available(p)).length>=E.FORMATIONS[s.formation][pos])return {error:'Bu mevkide yeterli sağlıklı oyuncu var.'};const p=player({id:'trial-'+s.week+'-'+pos+'-'+all(s).length,name:'Yerel '+pos+' '+s.week+'-'+all(s).length,position:pos,rating:50,age:19,potential:63},s.week);p.contract={wage:35,until:s.week+8,role:'prospect'};s.bench.push(p);pickLineup(s);return {ok:true};}
    function restructure(s){if(s.restructureSeason===s.league.seasonNumber||s.debt+arrears(s)<=0)return {error:'Yapılandırma bu sezon kullanıldı veya borç bulunmuyor.'};s.debt+=arrears(s);s.accounts={wages:0,operations:0,interest:0};s.restructureSeason=s.league.seasonNumber;s.restructureWeeks=6;E.dynamics(s).trust=C(E.dynamics(s).trust-6,0,100);log(s,'Borçlar 6 haftalık koruma planına alındı. Transfer kısıtı; sponsor ödemesi %30 azalır, haftalık anapara taksiti düşer.');return {ok:true};}
    function weeklyPlayers(s,roster,selected,plan,service,match,side,notes=[],focus='all') {
        const played=new Set(selected.map(p=>p.id)),recovering=roster.filter(p=>p.injury>0).sort((a,b)=>b.injury-a.injury),treated=new Set(recovering.slice(0,service.medical).map(p=>p.id));
        const trainingOrder=[...roster].sort((a,b)=>(b.position===focus)-(a.position===focus)||a.age-b.age),trained=new Set(trainingOrder.slice(0,service.training).map(p=>p.id));
        for(const p of roster){player(p,s.week);const participation=match?.participation[side]?.[p.id],minutes=participation?.minutes||0;
            if(p.injury>0)p.injury=Math.max(0,p.injury-(treated.has(p.id)?2:1));if(p.suspension>0)p.suspension--;
            p.condition=C(p.condition+(PLAN[plan].recovery+service.recovery)-(minutes?22+(100-p.attributes.stamina)*.08:0),0,100);
            p.sharpness=C(p.sharpness+PLAN[plan].sharpness+(minutes?4:-1),0,100);
            const growth=trained.has(p.id)?PLAN[plan].xp*(p.age<=23?1.4:p.age>=31?.5:1)*(1+service.training/60)*(p.condition<45?.5:1)*(1-(service.load||0)/180)*(p.position===focus?1.2:1):.4;
            if(!p.injury)xp(p,growth);
            if(minutes){p.stats.appearances++;p.stats.minutes+=minutes;p.stats.goals+=match.events.filter(e=>e.side===side&&e.type==='goal'&&e.playerId===p.id).length;p.stats.assists+=match.events.filter(e=>e.side===side&&e.type==='goal'&&e.assistId===p.id).length;}
            const missed=p.contract.role==='starter'&&!minutes&&available(p);p.morale=C(p.morale+(missed?-4:minutes?1:0),0,100);
            if(participation?.red)p.suspension=2;const oldCards=Math.floor(p.yellowTotal/4);p.yellowTotal+=participation?.yellows||0;if(Math.floor(p.yellowTotal/4)>oldCards)p.suspension=Math.max(1,p.suspension);
            if(minutes&&!p.injury&&rnd(s)<.003+Math.max(0,55-p.condition)*.00055+(plan==='intensive'?.006:0)){p.injury=1+Math.floor(rnd(s)*3);notes.push(p.name+' '+p.injury+' hafta sakat. Sağlık kapasitesi iyileşmeyi hızlandırabilir.');}
        }
    }
    function prepareWeek(s,team,plan,service){for(const p of all(team)){player(p,s.week);p.condition=C(p.condition+PLAN[plan].recovery*.25+service.recovery*.25,0,100);}}
    function applyResult(table,a,b,x,y){for(const [id,gf,ga]of [[a,x,y],[b,y,x]]){const t=table.teams[id];t.played++;t.gf+=gf;t.ga+=ga;if(gf>ga){t.won++;t.points+=3;}else if(gf===ga){t.drawn++;t.points++;}else t.lost++;}}
    function rivalWeek(s,club,match,side){const expense=all(club).reduce((v,p)=>v+wage(p),0);const funds=club.money+Math.round(1100*Math.pow(club.tier,1.7));club.arrears=(club.arrears||0)+Math.max(0,expense-funds);club.money=Math.max(0,funds-expense);const repaid=Math.min(club.money,club.arrears);club.money-=repaid;club.arrears-=repaid;club.morale=club.arrears>0?Math.max(25,(club.morale||65)-3):Math.min(80,(club.morale||65)+1);if(club.arrears>0)for(const p of all(club))p.morale=C(p.morale-2,0,100);weeklyPlayers(s,all(club),club.lineup,'balanced',{training:24,medical:6,recovery:2},match,side);pickRival(club);if(club.lineup.length<11){const reserve=generateRoster(s,[],Math.max(50,club.rating-8),club.name+' Akademi '+s.week);for(const p of reserve)if(all(club).filter(x=>x.position===p.position&&available(x)).length<(E.FORMATIONS[club.formation][p.position]||0))club.bench.push(p);pickRival(club);}}
    function proposals(s){for(const p of all(s))if(p.listed){const buyers=Object.values(s.world.clubs).filter(c=>c.money>=sellPrice(p)&&c.rating<p.rating+5&&all(c).length<25);if(buyers.length&&hash(p.id+s.week)%3!==0){const b=buyers[hash(p.id+s.week)%buyers.length];p.offer={clubId:b.clubId,name:b.name,fee:sellPrice(p),expires:s.week+2};}}}
    function rivalTransfers(s){
        if(s.week%4)return;
        const clubs=Object.values(s.world.clubs),protectedIds=new Set(s.marketItems.map(p=>p.id));
        for(const buyer of clubs){if(buyer.arrears>0||buyer.money<6000||all(buyer).length>=23)continue;const weak=[...buyer.lineup].sort((a,b)=>a.rating-b.rating)[0];if(!weak)continue;
            const candidates=clubs.filter(c=>c!==buyer).flatMap(seller=>seller.bench.filter(p=>p.position===weak.position&&p.rating>weak.rating+2&&p.rating<=weak.rating+8&&!protectedIds.has(p.id)&&available(p)).map(p=>({seller,p}))).filter(({p})=>sellPrice(p)<buyer.money*.25);
            if(!candidates.length)continue;const {seller,p}=candidates[Math.floor(rnd(s)*candidates.length)],fee=sellPrice(p);buyer.money-=fee;seller.money+=fee;seller.bench=seller.bench.filter(x=>x.id!==p.id);buyer.bench.push(p);buyer.lastTransfer={week:s.week,name:p.name,from:seller.name,fee};pickRival(buyer);
        }
    }
    function validateSave(raw){
        if(!raw||typeof raw!=='object'||![3,4].includes(raw.version)||!raw.league||!raw.city||!Array.isArray(raw.lineup)||!Array.isArray(raw.bench))throw new Error('Desteklenen bir kariyer yedeği değil.');
        if(!Number.isFinite(raw.money)||!Number.isInteger(raw.week)||raw.week<1||!Number.isInteger(raw.league.tier)||raw.league.tier<1||raw.league.tier>5)throw new Error('Kayıttaki bütçe veya takvim geçersiz.');
        const groups=[raw.lineup,raw.bench,raw.loans||[]];if(raw.version===4){if(!raw.world?.clubs||!Array.isArray(raw.world.divisions)||raw.world.divisions.length!==5)throw new Error('Kulüp dünyası eksik.');for(const c of Object.values(raw.world.clubs)){if(!Array.isArray(c.lineup)||!Array.isArray(c.bench)||!E.FORMATIONS[c.formation])throw new Error('Rakip kadrosu geçersiz.');groups.push(c.lineup,c.bench);}for(const div of raw.world.divisions)if(!Array.isArray(div)||div.some(id=>!raw.world.clubs[id]))throw new Error('Lig üyeliği geçersiz.');}
        for(const roster of groups){if(!Array.isArray(roster))throw new Error('Oyuncu listesi geçersiz.');for(const p of roster)if(!p||typeof p.name!=='string'||!['GK','DF','MF','FW'].includes(p.position)||!Number.isFinite(p.rating))throw new Error('Oyuncu kaydı geçersiz.');}
        if(!E.FORMATIONS[raw.formation]||!PLAN[raw.trainingPlan]||!['balanced','attack','counter'].includes(raw.tactic))throw new Error('Takım planı geçersiz.');
        if(!Number.isFinite(raw.debt)||raw.debt<0||Object.values(raw.accounts||{}).some(n=>!Number.isFinite(n)||n<0))throw new Error('Borç kaydı geçersiz.');
        for(const roster of groups)for(const p of roster){if(typeof p.id!=='string'||!/^[\w-]+$/.test(p.id))throw new Error('Oyuncu kimliği geçersiz.');if(p.contract&&(!Number.isFinite(p.contract.wage)||p.contract.wage<0||!Number.isInteger(p.contract.until)))throw new Error('Sözleşme kaydı geçersiz.');if(p.attributes&&['pace','passing','finishing','defending','keeping','stamina'].some(k=>!Number.isFinite(p.attributes[k])))throw new Error('Oyuncu özellikleri eksik.');}
        for(const table of [raw.season,...(raw.world?.tables||[])].filter(Boolean)){
            if(!Array.isArray(table.teams)||!Array.isArray(table.fixtures)||table.fixtures.length!==2*(table.teams.length-1))throw new Error('Fikstür eksik.');
            if(table.fixtures.some(round=>!Array.isArray(round)||round.length!==table.teams.length/2||new Set(round.flat()).size!==table.teams.length||round.some(pair=>!Array.isArray(pair)||pair.length!==2||pair.some(id=>!Number.isInteger(id)||!table.teams[id]))))throw new Error('Fikstür eşleşmeleri geçersiz.');
        }
        return true;
    }
    function youth(s){const capacity=services(s).academy;if(!capacity)return;s.academyProgress++;if(s.academyProgress<12||all(s).length+s.loans.length>=25)return;s.academyProgress=0;const pos=['GK','DF','MF','FW'][Math.floor(rnd(s)*4)],rating=55+level(s,'academy')*2+Math.floor(rnd(s)*5),n=s.stats.youth+1,p=player({id:'youth-'+s.league.seasonNumber+'-'+n,name:['Arda','Deniz','Efe','Can','Kerem'][n%5]+' '+['Yalçın','Aksoy','Yılmaz','Kaya','Demir'][Math.floor(rnd(s)*5)]+' '+n,position:pos,rating,age:16+Math.floor(rnd(s)*3),potential:C(rating+10+Math.floor(rnd(s)*15),rating,96),origin:'academy'},s.week);p.contract.role='prospect';s.bench.push(p);s.stats.youth++;s.pendingEvents.push({type:'youth',actor:p.name,playerId:p.id,week:s.week});log(s,p.name+' akademiden yetişti; A takım dakikası veya kiralama bekliyor.');}
    function eventInfo(s){
        if(!s.event)return null;const e=s.event,history=s.eventHistory[e.type]||0;
        const defs={captain:{title:e.actor+' ile maaş görüşmesi',story:'Yeni transfer maaş dengesini değiştirdi. Kaptan takım adına açıklama bekliyor.',choices:[{id:'yes',title:'Takım primi ayır',detail:'1.200 €; takım morali +6. Üç maçta en az 4 puan gelirse sponsor görüşmesi açılır.',cost:1200},{id:'no',title:'Sportif rolü öne çıkar',detail:'Nakit korunur; takım morali −4. Üç maçta 4 puan gelirse güven geri kazanılır.',cost:0}]},sponsor_follow:{title:'Sponsor performans görüşmesi',story:'Verdiğiniz sözün ardından sponsor kulübün yönünü değerlendiriyor.',choices:[{id:'yes',title:'Performans anlaşması',detail:'Üç maçta 5 puan: 2.000 € ve güven +4. Başarısızlık: güven −5.',cost:0},{id:'no',title:'Sabit gelirde kal',detail:'Ek prim yok; mevcut sponsorluk korunur, güven +1.',cost:0}]},youth:{title:e.actor+' için gelişim yolu',story:'Akademinin yetiştirdiği oyuncu için somut bir plan gerekiyor.',choices:[{id:'yes',title:'A takımda süre sözü',detail:'Üç maçta toplam 90 dakika: oyuncuya +20 gelişim puanı ve +8 moral. Süre verilmezse moral −12.',cost:0},{id:'no',title:'Gelişim kulübüne kirala',detail:'Sağlıklı yedek oyuncu 8 hafta kiralanır. Maaşının %25’ini ödersiniz.',cost:0}]}};
        if(defs[e.type])return defs[e.type];
        const info=legacy.eventInfo(s);if(info){info.story+=(history?' Bu konu '+history+' kez gündeme geldi; önceki kararlar sonuç defterinde.':'');if(e.type==='finance'){info.story='Gecikmiş ödemeler oyuncuların güvenini sarsıyor. Yeni kredi tek başına sürdürülebilir bütçe sayılmayacak.';info.choices[1].detail='Şimdi moral −3, güven +3. Üç maç sonra gecikmiş ödeme sıfır ve son iki hafta işletme toplamı ≥0: güven +4; değilse güven −3.';info.choices[0].detail='Şimdi moral +4. Üç maç sonra gecikmiş ödeme sıfır ve son iki hafta işletme toplamı ≥0: güven +6, uyum +5; değilse moral −10, güven −10.';}}
        return info;
    }
    function decide(s,id){const info=eventInfo(s),choice=info?.choices.find(c=>c.id===id);if(!choice)return {error:'Geçersiz karar'};if(s.money<choice.cost)return {error:'Bütçe yetersiz'};const e=s.event,d=E.dynamics(s),type=e.type;s.eventHistory[type]=(s.eventHistory[type]||0)+1;
        if(['captain','sponsor_follow','youth'].includes(type)){
            if(type==='youth'&&id==='no'){const result=loanOut(s,e.playerId);if(result.error){s.eventHistory[type]--;return result;}}
            transaction(s,choice.title,-choice.cost);
            if(type==='captain')for(const p of all(s))p.morale=C(p.morale+(id==='yes'?6:-4),0,100);
            if(type==='sponsor_follow'&&id==='no')d.trust=C(d.trust+1,0,100);
            else if(!(type==='youth'&&id==='no'))d.commitments.push({type,bold:id==='yes',due:s.stats.totalMatches+3,points:0,title:info.title,playerId:e.playerId,startMinutes:all(s).find(p=>p.id===e.playerId)?.stats.minutes||0});
            log(s,choice.title+': '+choice.detail);s.event=null;return {ok:true};
        }
        // Original decisions retain their immediate costs; their promises settle under v4 rules.
        const result=legacy.decide(s,id);if(!result.error&&d.journal[0])d.journal[0].text=choice.title+': '+choice.detail;if(!result.error&&type==='fatigue'&&id==='yes')for(const p of all(s))p.condition=C(p.condition+8,0,100);for(const p of all(s))xp(p,0);sync(s);return result;
    }
    function settleStories(s,m,notes){
        const d=E.dynamics(s),points=m.gf>m.ga?3:m.gf===m.ga?1:0;
        for(const c of d.commitments){c.points+=points;if(c.type==='community'&&s.ticketPrice>10)c.breached=true;if(s.stats.totalMatches<c.due)continue;let success=false;
            if(c.type==='finance'){success=arrears(s)===0&&s.ledger.slice(0,2).reduce((v,r)=>v+r.income-r.expenses,0)>=0;d.trust+=success?(c.bold?6:4):(c.bold?-10:-3);if(c.bold){if(success)d.cohesion+=5;else s.clubForm-=10;}}
            if(c.type==='press'){success=c.points>=(c.bold?6:3);d.trust+=success?(c.bold?8:3):(c.bold?-8:-2);if(c.bold)s.clubForm+=success?4:-6;if(c.bold&&success)s.pendingEvents.push({type:'sponsor_follow',week:s.week});}
            if(c.type==='community'){success=!c.breached;d.trust+=success?8:-10;if(success)s.fans+=25;}
            if(c.type==='fatigue'){success=d.strain<=25;s.clubForm+=success?5:-3;}
            if(c.type==='captain'){success=c.points>=4;d.cohesion+=success?5:-5;if(success)s.pendingEvents.push({type:'sponsor_follow',week:s.week});}
            if(c.type==='sponsor_follow'){success=c.points>=5;d.trust+=success?4:-5;if(success)transaction(s,'Sponsor hedef primi',2000);}
            if(c.type==='youth'){const p=all(s).find(p=>p.id===c.playerId);success=!!p&&p.stats.minutes-c.startMinutes>=90;if(p){p.morale=C(p.morale+(success?8:-12),0,100);if(success)xp(p,20);}}
            notes.push(c.title+': '+(success?'söz tutuldu; olumlu etkiler uygulandı.':'hedef tutmadı; güven veya moral bedeli uygulandı.'));
        }
        d.commitments=d.commitments.filter(c=>c.due>s.stats.totalMatches);
        if(arrears(s)>0){s.clubForm-=5;d.cohesion-=2;d.trust-=3;for(const p of all(s))p.morale=C(p.morale-3,0,100);notes.push('Gecikmiş ödemeler: moral −5, uyum −2, güven −3; transferler kısıtlandı.');}
        if(s.ticketPrice>fairPrice(s)*1.5)d.trust-=2;else if(s.ticketPrice<=fairPrice(s))d.trust+=1;
        if(s.event&&s.week-s.event.week>=3){notes.push('Yanıtsız gündem kapandı: güven −3.');d.trust-=3;s.event=null;}
        if(!s.event){if(s.pendingEvents.length)s.event=s.pendingEvents.shift();else if(s.week%3===0)s.event={type:arrears(s)>0?'finance':d.strain>35||s.teamCondition<45?'fatigue':d.trust<45||s.ticketPrice>fairPrice(s)*1.5?'community':'press',week:s.week};if(s.event)s.event.week=s.week;}
        s.clubForm=C(s.clubForm,0,100);E.dynamics(s);for(const n of notes)log(s,n);
    }
    function advance(s,pool){
        normalize(s);if(s.phase==='preseason')return {error:'Önce sezon hazırlık dönemini tamamlayın.'};if(s.league.played>=E.seasonLength(s))return {error:'Sezon değerlendirmesi gerekli.'};if(!rosterValid(s))return {error:'Sağlıklı ve cezasız 11 oyuncu gerekli. Otomatik kadroyu veya yerel oyuncu çağrısını kullanın.'};if(s.preparedWeek!==s.week)return {error:'Haftalık hazırlığı tamamlayın.'};
        ensureWorld(s,pool);const notes=[],d=E.dynamics(s),selected=[...s.lineup],ids=selected.map(p=>p.id),changed=d.previousLineup.length?ids.filter(id=>!d.previousLineup.includes(id)).length:0;
        d.cohesion=C(d.cohesion+(changed>3?-(changed-3):changed<=1?1:0)-(d.previousTactic&&d.previousTactic!==s.tactic?2:0),0,100);d.previousLineup=ids;d.previousTactic=s.tactic;
        d.strain=C(d.strain+PLAN[s.trainingPlan].load-level(s,'medical'),0,100);
        const f=forecast(s),report=settle(s,f),service=services(s);prepareWeek(s,s,s.trainingPlan,service);
        const fixture=nextMatch(s),op=s.world.clubs[fixture.opponent.clubId];pickRival(op);const match=simulateMatch(s,fixture.opponent,fixture.home),round=s.league.played;
        const results=[];for(const [a,b]of s.season.fixtures[round]){let x,y;if(a===0){x=match.gf;y=match.ga;}else if(b===0){x=match.ga;y=match.gf;}else{const ca=s.world.clubs[s.season.teams[a].clubId],cb=s.world.clubs[s.season.teams[b].clubId];pickRival(ca);pickRival(cb);const other=matchEngine(s,ca,cb);x=other.gf;y=other.ga;rivalWeek(s,ca,other,0);rivalWeek(s,cb,other,1);}applyResult(s.season,a,b,x,y);results.push({a,b,x,y});}
        rivalWeek(s,op,match,1);s.season.results.push(results);
        // Other divisions advance once per player week, using exactly the same match engine.
        const occupied=new Set(s.season.teams.map(t=>t.clubId));for(const table of s.world.tables||[])if(table&&table.results.length<table.fixtures.length){const rr=[];for(const[a,b]of table.fixtures[table.results.length]){const ca=s.world.clubs[table.teams[a].clubId],cb=s.world.clubs[table.teams[b].clubId];if(occupied.has(ca.clubId)||occupied.has(cb.clubId))continue;pickRival(ca);pickRival(cb);const m=matchEngine(s,ca,cb);applyResult(table,a,b,m.gf,m.ga);rivalWeek(s,ca,m,0);rivalWeek(s,cb,m,1);rr.push({a,b,x:m.gf,y:m.ga});}table.results.push(rr);}
        const me=s.season.teams[0];Object.assign(s.league,{played:me.played,won:me.won,drawn:me.drawn,lost:me.lost,points:me.points,goalsFor:me.gf,goalsAgainst:me.ga});
        s.stats.totalMatches++;if(match.gf>match.ga)s.stats.totalWon++;s.clubForm=C(s.clubForm+(match.gf>match.ga?4:match.gf===match.ga?0:-3),0,100);s.fans=Math.max(50,s.fans+(match.gf>match.ga?12*s.league.tier:match.gf===match.ga?3:-8));
        weeklyPlayers(s,all(s),selected,s.trainingPlan,service,match,0,notes,s.staffFocus);
        if(s.board)s.board.youngMinutes+=selected.filter(p=>p.origin==='academy'&&p.age<=23).reduce((v,p)=>v+(match.participation[0][p.id]?.minutes||0),0);
        for(const p of s.loans){p.loanWeeks--;xp(p,7);p.sharpness=C(p.sharpness+3,0,100);p.condition=90;if(p.loanWeeks<=0){s.bench.push(p);notes.push(p.name+' kiralıktan döndü.');}}s.loans=s.loans.filter(p=>p.loanWeeks>0);
        s.week++;for(const b of s.city.placedBuildings)if(b.construction&&b.construction.due<=s.week){b.level=b.construction.target;delete b.construction;notes.push(E.BUILDINGS[b.type].name+' hizmete açıldı.');}
        if(s.sponsor&&--s.sponsor.remaining<=0){s.sponsor=null;notes.push('Sponsor sözleşmesi sona erdi.');}if(s.restructureWeeks>0)s.restructureWeeks--;
        for(const p of all(s)){if(p.contract.until<=s.week&&!p.expiredNotice){p.expiredNotice=true;p.listed=true;notes.push(p.name+' sözleşmesi doldu. Yenileme veya ayrılık kararı gerekiyor; aynı ücretle haftalık geçici sözleşmede.');}if(p.expiredNotice){p.morale=C(p.morale-3,0,100);if(p.morale<20&&all(s).filter(x=>x.position===p.position).length>1){s.lineup=s.lineup.filter(x=>x.id!==p.id);s.bench=s.bench.filter(x=>x.id!==p.id);notes.push(p.name+' sözleşme belirsizliği nedeniyle ayrıldı.');}}}
        sync(s);youth(s);proposals(s);rivalTransfers(s);settleStories(s,match,notes);market(s,pool);s.news=[s.clubName+' '+match.gf+'–'+match.ga+' '+match.opponent,...notes,...s.news].slice(0,30);s.lastMatch={...match,report,notes};return s.lastMatch;
    }
    function boardStatus(s){const b=s.board||{style:s.personality,startDebt:s.debt+arrears(s),startFans:s.fans,youngMinutes:0},rank=s.season?legacy.table(s).findIndex(t=>t.id===0)+1:1;const target=b.style==='youth'?900:b.style==='sustainable'?0:b.style==='promotion'?4:Math.ceil((s.season?.teams.length||16)*.75);const value=b.style==='youth'?b.youngMinutes:b.style==='sustainable'?s.debt+arrears(s):rank;return {title:GOALS[b.style],target,value,success:b.style==='youth'?value>=target:value<=target,description:b.style==='youth'?'Akademi oyuncularına 900 lig dakikası':b.style==='sustainable'?'Sezonu banka borcu ve gecikmiş ödeme olmadan bitir':b.style==='promotion'?'İlk 4 sıra':'Ligin ilk %75’inde kal'};}
    function finishSeason(s){if(s.phase==='preseason'||s.league.played!==E.seasonLength(s))return {error:'Sezon henüz tamamlanmadı.'};const rank=legacy.table(s).findIndex(t=>t.id===0)+1,oldTier=s.league.tier,prize=Math.round(E.LEAGUES[oldTier-1].prize*(rank===1?1:Math.max(.06,.5/rank))),goal=boardStatus(s);transaction(s,'Lig primi',prize);s.stats.totalEarned+=prize;if(goal.success){transaction(s,'Yönetim hedef primi',3000*oldTier);s.reputation=C(s.reputation+5,0,100);}else{s.reputation=C(s.reputation-3,0,100);}s.history.unshift({season:s.league.seasonNumber,name:E.LEAGUES[oldTier-1].name,rank,points:s.league.points,prize,goal:goal.title,goalMet:goal.success});
        if(rank===1){s.trophies.push({name:E.LEAGUES[oldTier-1].name+' Kupası',season:s.league.seasonNumber,tier:oldTier});s.stats.totalTrophies++;s.league.tier=Math.min(5,oldTier+1);s.fans+=150;}else if(rank===s.season.teams.length)s.league.tier=Math.max(1,oldTier-1);
        for(const table of s.world.tables||[])if(table)for(const t of table.teams)s.world.clubs[t.clubId].history.push({season:s.league.seasonNumber,points:t.points,gf:t.gf,ga:t.ga});
        for(const t of s.season.teams)if(t.id!==0)s.world.clubs[t.clubId].history.push({season:s.league.seasonNumber,points:t.points,gf:t.gf,ga:t.ga});
        // Persistent clubs move between divisions; identities and player histories never reroll.
        const ranked=s.world.divisions.map((ids,tier)=>{const table=tier===oldTier-1?s.season:s.world.tables?.[tier];return table?[...table.teams].filter(t=>t.clubId!=='user').sort((a,b)=>b.points-a.points||(b.gf-b.ga)-(a.gf-a.ga)).map(t=>t.clubId):ids;});
        for(let tier=0;tier<4;tier++){const down=ranked[tier+1]?.at(-1),up=ranked[tier]?.[0];if(up&&down&&s.world.divisions[tier].includes(up)&&s.world.divisions[tier+1].includes(down)){s.world.divisions[tier]=s.world.divisions[tier].map(id=>id===up?down:id);s.world.divisions[tier+1]=s.world.divisions[tier+1].map(id=>id===down?up:id);}}
        for(const [i,ids]of s.world.divisions.entries())for(const id of ids){const c=s.world.clubs[id];c.tier=i+1;for(const p of all(c)){p.age++;if(p.age>32){p.rating=C(p.rating-1,45,99);for(const k of Object.keys(p.attributes))p.attributes[k]=C(p.attributes[k]-1,25,99);}p.condition=95;p.sharpness=65;p.contract.until=s.week+60;}c.cohesion=C(c.cohesion+2,0,100);}
        for(const p of [...all(s),...s.loans]){p.stats.seasons.push({season:s.league.seasonNumber,age:p.age,rating:p.rating,goals:p.stats.goals,minutes:p.stats.minutes});p.age++;if(p.age>32){p.rating=C(p.rating-1,45,99);for(const k of Object.keys(p.attributes))p.attributes[k]=C(p.attributes[k]-1,25,99);}}
        s.league={tier:s.league.tier,seasonNumber:s.league.seasonNumber+1,played:0,won:0,drawn:0,lost:0,points:0,goalsFor:0,goalsAgainst:0};s.phase='preseason';s.preseasonSteps=0;s.world.season++;log(s,'Sezon kapandı: '+rank+'. sıra. '+goal.title+': '+(goal.success?'başarılı':'hedef tutmadı')+'. İki haftalık hazırlık dönemi başladı.');return {rank,prize};
    }
    function preseason(s,pool){if(s.phase!=='preseason')return {error:'Hazırlık dönemi açık değil.'};const f=forecast(s);f.gate=0;f.income=Math.round(f.commercial+f.sponsor+f.grant);f.net=f.income-f.expenses;settle(s,f);weeklyPlayers(s,all(s),[],s.trainingPlan,services(s),null,0,[],s.staffFocus);for(const p of s.loans){p.loanWeeks--;xp(p,7);if(p.loanWeeks<=0)s.bench.push(p);}s.loans=s.loans.filter(p=>p.loanWeeks>0);if(s.restructureWeeks>0)s.restructureWeeks--;s.week++;s.preseasonSteps++;if(s.sponsor&&--s.sponsor.remaining<=0)s.sponsor=null;for(const b of s.city.placedBuildings)if(b.construction&&b.construction.due<=s.week){b.level=b.construction.target;delete b.construction;}E.dynamics(s).strain=C(E.dynamics(s).strain-15,0,100);if(s.preseasonSteps>=2){s.phase='season';startSeason(s);pickLineup(s);log(s,'Yeni sezon fikstürü ve yönetim hedefi hazır.');}sync(s);market(s,pool,true);return {ok:true};}
    Object.assign(E,{PLAN,GOALS,validateSave,create,migrate,normalize,player,xp,available,effective,services,level,facility,requirement,pickLineup,rosterValid,strength,matchEngine,simulateMatch,seedRoster,startSeason,nextMatch,wage,arrears,forecast,quote,price,sellPrice,market,buy,renew,scout,listPlayer,acceptSale,loanOut,emergency,restructure,eventInfo,decide,advance,boardStatus,finishSeason,preseason});
    root.TycoonEngine=E;if(typeof module!=='undefined'&&module.exports)module.exports=E;
})(typeof window!=='undefined'?window:globalThis);
