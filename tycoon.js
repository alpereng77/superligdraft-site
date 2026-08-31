/**
 * Süper Lig Nostalji Draft - Tycoon & FIFA FUT Paket Açılış Modu
 * Gerçek tycoon_players.json Veritabanı, 3D Paket Açılışı, Transfer Pazarı & Lig Kariyeri
 */

// ==========================================
// 1. GLOBAL STATE & CONFIGURATION
// ==========================================
const TYCOON_STORAGE_KEY = "superlig_tycoon_save_v2";

let rawPlayerDatabase = null;
let parsedPlayersPool = {
    all: [],
    GK: [],
    DF: [],
    MF: [],
    FW: [],
    legendary: []
};

const PACK_TYPES = {
    starter: {
        id: "starter",
        name: "BAŞLANGIÇ KULÜP PAKETİ",
        cost: 0,
        count: 14, // 11 ilk 11 + 3 yedek
        color: "linear-gradient(135deg, #1e293b, #0f172a)",
        badge: "14 OYUNCU (ÖZEL KADRO)",
        minOvr: 60,
        maxOvr: 84
    },
    bronze: {
        id: "bronze",
        name: "BRONZ NOSTALJİ PAKETİ",
        cost: 2500,
        count: 3,
        color: "linear-gradient(135deg, #78716c, #44403c)",
        badge: "60 - 72 OVR",
        minOvr: 60,
        maxOvr: 72
    },
    silver: {
        id: "silver",
        name: "GÜMÜŞ NOSTALJİ PAKETİ",
        cost: 8000,
        count: 3,
        color: "linear-gradient(135deg, #94a3b8, #475569)",
        badge: "70 - 79 OVR",
        minOvr: 70,
        maxOvr: 79
    },
    gold: {
        id: "gold",
        name: "ALTIN SÜPER LİG PAKETİ",
        cost: 28000,
        count: 3,
        color: "linear-gradient(135deg, #fbbf24, #b45309)",
        badge: "78 - 86 OVR",
        minOvr: 78,
        maxOvr: 86
    },
    legend: {
        id: "legend",
        name: "EFSANELER ÖZEL PAKETİ",
        cost: 95000,
        count: 3,
        color: "linear-gradient(135deg, #c084fc, #7e22ce)",
        badge: "86 - 95 OVR (GARANTİLİ YILDIZ)",
        minOvr: 86,
        maxOvr: 95
    }
};

const TYCOON_CONFIG = {
    leagues: [
        { tier: 1, name: "Bölgesel Amatör Lig", targetPoints: 12, avgOpponentOvr: 65, prize: 10000, trophy: "Amatör Kupa" },
        { tier: 2, name: "TFF 2. Lig", targetPoints: 16, avgOpponentOvr: 72, prize: 35000, trophy: "2. Lig Şampiyonluk Kupası" },
        { tier: 3, name: "TFF 1. Lig", targetPoints: 20, avgOpponentOvr: 78, prize: 120000, trophy: "1. Lig Şampiyonluk Kupası" },
        { tier: 4, name: "Süper Lig", targetPoints: 24, avgOpponentOvr: 84, prize: 450000, trophy: "Süper Lig Şampiyonluk Kupası" },
        { tier: 5, name: "Şampiyonlar Arenası (Efsaneler)", targetPoints: 28, avgOpponentOvr: 89, prize: 1500000, trophy: "Nostalji Efsaneler Kupası" }
    ],
    buildings: {
        stadium: {
            id: 'stadium',
            name: "Efsane Stadyumu",
            desc: "İç saha bilet hasılatını ve ev sahibi maç gücünü artırır.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/Meshy_AI_stadium-starter.png",
                "icon-assets/Meshy_AI_stadium-starter.png",
                "icon-assets/Meshy_AI_stadium-mid.png",
                "icon-assets/Meshy_AI_stadium-advanced.png",
                "icon-assets/Meshy_AI_stadium-advanced.png"
            ],
            costs: [0, 8000, 30000, 100000, 350000, 1200000],
            income: [0, 1500, 4500, 12000, 35000, 120000],
            bonus: [0, 2, 4, 6, 8, 12]
        },
        fanshop: {
            id: 'fanshop',
            name: "Kulüp Mağazası (Store)",
            desc: "Lisanslı forma ve atkı satarak saniye başı pasif ciro üretir.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/fanshop-starter.png",
                "icon-assets/fanshop-starter.png",
                "icon-assets/Meshy_AI_fan-shop.png",
                "icon-assets/fanshop-advanced.png",
                "icon-assets/fanshop-advanced.png"
            ],
            costs: [0, 6000, 20000, 65000, 220000, 750000],
            passive: [0, 10, 35, 120, 400, 1500]
        },
        clubhq: {
            id: 'clubhq',
            name: "Kulüp Genel Merkezi",
            desc: "Menajerlik ofisi ve idari bina. Tüm takıma OVR güç bonusu sağlar.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/Meshy_AI_club-building-starter.png",
                "icon-assets/Meshy_AI_club-building-starter.png",
                "icon-assets/Meshy_AI_club-building-vintage-style-ref.png",
                "icon-assets/Meshy_AI_club-building-advanced.png",
                "icon-assets/Meshy_AI_club-building-advanced.png"
            ],
            costs: [0, 10000, 35000, 110000, 300000, 950000],
            teamBoost: [0, 1, 2, 3, 4, 6]
        },
        medical: {
            id: 'medical',
            name: "Sağlık & Fizyoterapi",
            desc: "Sporcu sağlığı, sakatlık önleme ve hızlı maç kondisyonu sağlar.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/medical-starter.png",
                "icon-assets/medical-starter.png",
                "icon-assets/medical-mid.png",
                "icon-assets/medical-advanced.png",
                "icon-assets/medical-advanced.png"
            ],
            costs: [0, 15000, 45000, 140000, 380000, 1100000],
            recovery: [0, 5, 10, 20, 35, 50]
        },
        academy: {
            id: 'academy',
            name: "Gençlik Futbol Akademisi",
            desc: "Genç yetenek yetiştirme ve altyapıdan yüksek potansiyelli scout keşfi.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/academy-starter.png",
                "icon-assets/academy-starter.png",
                "icon-assets/academy-mid.png",
                "icon-assets/academy-advanced.png",
                "icon-assets/academy-advanced.png"
            ],
            costs: [0, 30000, 85000, 250000, 600000, 1800000],
            scoutBonus: [0, 10, 20, 35, 50, 75]
        },
        training: {
            id: 'training',
            name: "Antrenman Kompleksi",
            desc: "Takım antrenmanı ve bireysel gelişim maliyetlerinde kalıcı indirim sağlar.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/antrenman-tesis-start.png",
                "icon-assets/antrenman-tesis-start.png",
                "icon-assets/antrenman-tesis-mid.png",
                "icon-assets/antrenman-tesis-adv.png",
                "icon-assets/antrenman-tesis-adv.png"
            ],
            costs: [0, 22000, 60000, 180000, 450000, 1300000],
            discount: [0, 0.05, 0.10, 0.20, 0.35, 0.50]
        },
        hotel: {
            id: 'hotel',
            name: "Sporcu Oteli & Kamp Tesisi",
            desc: "Takımın enerji yenilenmesini hızlandırır ve deplasman kondisyonunu korur.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/hotel-starter.png",
                "icon-assets/hotel-starter.png",
                "icon-assets/hotel-advanced.png",
                "icon-assets/hotel-advanced.png",
                "icon-assets/hotel-advanced.png"
            ],
            costs: [0, 14000, 38000, 120000, 320000, 900000],
            staminaBonus: [0, 5, 10, 18, 28, 40]
        },
        scout: {
            id: 'scout',
            name: "Scout & Yetenek Laboratuvarı",
            desc: "Dünya çapında gizli yetenek keşfetme şansını ve pazarlık gücünü artırır.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/scout-starter.png",
                "icon-assets/scout-starter.png",
                "icon-assets/scout-advanced.png",
                "icon-assets/scout-advanced.png",
                "icon-assets/scout-advanced.png"
            ],
            costs: [0, 20000, 55000, 160000, 420000, 1200000],
            scoutBonus: [0, 8, 15, 25, 40, 60]
        },
        media: {
            id: 'media',
            name: "Medya & TV Yayın Kulesi",
            desc: "Canlı yayın ve röportajlarla saniye başı yüksek TV & sponsorluk geliri üretir.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/media-starter.png",
                "icon-assets/media-starter.png",
                "icon-assets/media-advanced.png",
                "icon-assets/media-advanced.png",
                "icon-assets/media-advanced.png"
            ],
            costs: [0, 16000, 42000, 130000, 350000, 1000000],
            passive: [0, 50, 150, 450, 1200, 3500]
        },
        museum: {
            id: 'museum',
            name: "Kulüp Müzesi & Kupa Sarayı",
            desc: "Kulüp efsaneleri ve kupaları sergileyerek pasif turistik bilet geliri sağlar.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/museum-starter.png",
                "icon-assets/museum-starter.png",
                "icon-assets/museum-advanced.png",
                "icon-assets/museum-advanced.png",
                "icon-assets/museum-advanced.png"
            ],
            costs: [0, 25000, 70000, 200000, 500000, 1500000],
            passive: [0, 75, 220, 650, 1800, 5000]
        },
        restaurant: {
            id: 'restaurant',
            name: "Taraftar Meydanı & Sports Bistro",
            desc: "Maç günleri ve haftalık taraftar buluşmalarında yeme-içme geliri üretir.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/restaurant-starter.png",
                "icon-assets/restaurant-starter.png",
                "icon-assets/restaurant-advanced.png",
                "icon-assets/restaurant-advanced.png",
                "icon-assets/restaurant-advanced.png"
            ],
            costs: [0, 10000, 28000, 85000, 240000, 700000],
            passive: [0, 30, 90, 280, 800, 2200]
        },
        statue: {
            id: 'statue',
            name: "Altın Efsane Heykeli",
            desc: "Kulüp efsanesinin altın heykeli. Takım moralini ve tüm oyuncuların OVR gücünü artırır.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/statue-gold.png",
                "icon-assets/statue-gold.png",
                "icon-assets/statue-gold.png",
                "icon-assets/statue-gold.png",
                "icon-assets/statue-gold.png"
            ],
            costs: [0, 5000, 18000, 60000, 180000, 600000],
            moraleBonus: [0, 2, 4, 6, 8, 12]
        },
        pool: {
            id: 'pool',
            name: "Hidroterapi & Yüzme Havuzu",
            desc: "Sporcu havuzu ve hidroterapi. Maç sonrası laktik asit atımını hızlandırır ve sakatlıkları çabuk iyileştirir.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/pool-recovery.png",
                "icon-assets/pool-recovery.png",
                "icon-assets/pool-recovery.png",
                "icon-assets/pool-recovery.png",
                "icon-assets/pool-recovery.png"
            ],
            costs: [0, 12000, 35000, 100000, 280000, 800000],
            recoveryBonus: [0, 10, 20, 35, 50, 75]
        },
        track: {
            id: 'track',
            name: "Olimpik Sprint & Koşu Pisti",
            desc: "Kırmızı tartan sprint parkuru. Tüm oyuncuların hız, çeviklik ve dayanıklılık gelişimini hızlandırır.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/track-sprint.png",
                "icon-assets/track-sprint.png",
                "icon-assets/track-sprint.png",
                "icon-assets/track-sprint.png",
                "icon-assets/track-sprint.png"
            ],
            costs: [0, 9000, 26000, 80000, 220000, 650000],
            speedBonus: [0, 1, 2, 3, 4, 6]
        },
        fountain: {
            id: 'fountain',
            name: "Zafer & Şampiyonluk Çeşmesi",
            desc: "Işıltılı su fıskiyesi ve taraftar bankları. Pasif kampüs ziyaretçi ve taraftar bağlılığı geliri üretir.",
            maxLevel: 5,
            images: [
                "",
                "icon-assets/fountain-victory.png",
                "icon-assets/fountain-victory.png",
                "icon-assets/fountain-victory.png",
                "icon-assets/fountain-victory.png",
                "icon-assets/fountain-victory.png"
            ],
            costs: [0, 4000, 14000, 45000, 140000, 450000],
            passive: [0, 20, 60, 180, 500, 1500]
        }
    }
};

const FORMATIONS = {
    '4-4-2': { id: '4-4-2', name: '4-4-2 (Dengeli)', df: 4, mf: 4, fw: 2, desc: 'Klasik dengeli futbol dizilişi.' },
    '4-3-3': { id: '4-3-3', name: '4-3-3 (Hücum)', df: 4, mf: 3, fw: 3, desc: 'Kanat hücumları ve 3 forvetli pres.' },
    '3-5-2': { id: '3-5-2', name: '3-5-2 (Orta Saha)', df: 3, mf: 5, fw: 2, desc: 'Kalabalık orta saha ve oyun kurma.' },
    '4-2-3-1': { id: '4-2-3-1', name: '4-2-3-1 (Modern)', df: 4, mf: 5, fw: 1, desc: 'Modern geçiş hücumu ve tek santrafor.' },
    '5-3-2': { id: '5-3-2', name: '5-3-2 (Savunma)', df: 5, mf: 3, fw: 2, desc: 'Katı savunma ve hızlı kontra atak.' }
};

let tycoonState = {
    hasOpenedStarterPack: false,
    clubName: "Nostalji FK",
    managerName: "Teknik Direktör",
    formation: "4-4-2",
    money: 4500,
    fans: 150,
    lastSaveTime: Date.now(),
    buildings: {
        stadium: 1
    },
    lineup: [], // 11 as oyuncu
    bench: [],  // Yedek oyuncular
    marketItems: [], // Transfer pazarındaki aktif oyuncular
    marketRefreshTime: 0,
    league: {
        tier: 1,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        seasonNumber: 1
    },
    stats: {
        totalMatches: 0,
        totalTrophies: 0,
        totalPacksOpened: 0,
        totalEarned: 8500
    }
};

let tycoonTickerInterval = null;

// ==========================================
// 2. DATA LOADING & INITIALIZATION
// ==========================================
async function initTycoonModule() {
    loadTycoonData();
    await loadTycoonPlayersDatabase();
    calculateOfflineEarnings();
    startTycoonTicker();
    refreshMarketIfExpired();
    updateTycoonHUD();
    renderTycoonPitchSquad();

    // City Builder başlangıç — renderTycoonCity artık canvas tabanlı
    // CityBuilder.init() switchTycoonView('city') çağrıldığında tetiklenir

    // Sadece daha önce hiç paket açılmamışsa ve kulüpte hiç oyuncu yoksa başlangıç paketini göster
    const totalPlayers = (tycoonState.lineup?.length || 0) + (tycoonState.bench?.length || 0);
    if (!tycoonState.hasOpenedStarterPack && totalPlayers === 0) {
        showStarterPackPrompt();
    }
}

async function loadTycoonPlayersDatabase() {
    if (parsedPlayersPool.all.length > 0) return; // Zaten yüklendi

    try {
        const res = await fetch("tycoon_players.json");
        const json = await res.json();
        rawPlayerDatabase = json;

        // Parse and populate pools
        for (const year in json) {
            const teams = json[year];
            if (!Array.isArray(teams)) continue;

            teams.forEach(team => {
                const teamName = team.team_name || "Süper Lig Kulübü";
                if (!Array.isArray(team.players)) return;

                team.players.forEach(p => {
                    if (!p.name || !p.position) return;

                    const normalizedPos = normalizePosition(p.position);
                    const ovr = parseInt(p.rating) || 72;

                    const playerObj = {
                        id: "p_" + Math.random().toString(36).substr(2, 9),
                        name: p.name,
                        position: normalizedPos,
                        detailed_position: p.detailed_position || p.position,
                        rating: ovr,
                        market_value: p.market_value || "500 bin €",
                        market_value_numeric: p.market_value_numeric || (ovr * 15000),
                        image_path: p.image_path || "",
                        team_name: teamName,
                        stats: p.stats || { matches: 20, goals: 2, assists: 1 },
                        strengths: p.strengths || ["Dengeli Oyuncu"],
                        weaknesses: p.weaknesses || []
                    };

                    parsedPlayersPool.all.push(playerObj);
                    if (parsedPlayersPool[normalizedPos]) {
                        parsedPlayersPool[normalizedPos].push(playerObj);
                    }

                    if (ovr >= 85) {
                        parsedPlayersPool.legendary.push(playerObj);
                    }
                });
            });
        }
        console.log(`Tycoon DB Yüklendi: ${parsedPlayersPool.all.length} oyuncu.`);
    } catch (e) {
        console.error("tycoon_players.json yüklenirken hata:", e);
    }
}

function normalizePosition(pos) {
    pos = (pos || "").toUpperCase().trim();
    if (pos.includes("GK") || pos.includes("KL") || pos.includes("KALECİ")) return "GK";
    if (pos.includes("DF") || pos.includes("STP") || pos.includes("BEK") || pos.includes("DEFANS") || pos.includes("CB") || pos.includes("LB") || pos.includes("RB")) return "DF";
    if (pos.includes("MF") || pos.includes("OS") || pos.includes("ORTA") || pos.includes("CM") || pos.includes("DM") || pos.includes("AM") || pos.includes("LM") || pos.includes("RM")) return "MF";
    if (pos.includes("FW") || pos.includes("FV") || pos.includes("FORVET") || pos.includes("ST") || pos.includes("LW") || pos.includes("RW") || pos.includes("CF")) return "FW";
    return "MF";
}

function loadTycoonData() {
    try {
        const raw = localStorage.getItem(TYCOON_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            tycoonState = Object.assign({}, tycoonState, parsed);
        }
    } catch (e) {
        console.error("Tycoon save yüklenemedi:", e);
    }
}

function saveTycoonData() {
    try {
        tycoonState.lastSaveTime = Date.now();
        localStorage.setItem(TYCOON_STORAGE_KEY, JSON.stringify(tycoonState));
    } catch (e) {
        console.error("Tycoon kaydedilemedi:", e);
    }
}

function getTotalPassivePerSec() {
    let perSec = 0;
    const b = tycoonState.buildings || {};
    if (b.fanshop && TYCOON_CONFIG.buildings.fanshop) {
        perSec += TYCOON_CONFIG.buildings.fanshop.passive[b.fanshop] || 0;
    }
    if (b.media && TYCOON_CONFIG.buildings.media) {
        perSec += TYCOON_CONFIG.buildings.media.passive[b.media] || 0;
    }
    if (b.museum && TYCOON_CONFIG.buildings.museum) {
        perSec += TYCOON_CONFIG.buildings.museum.passive[b.museum] || 0;
    }
    if (b.restaurant && TYCOON_CONFIG.buildings.restaurant) {
        perSec += TYCOON_CONFIG.buildings.restaurant.passive[b.restaurant] || 0;
    }
    if (b.fountain && TYCOON_CONFIG.buildings.fountain) {
        perSec += TYCOON_CONFIG.buildings.fountain.passive[b.fountain] || 0;
    }
    return Math.max(10, perSec);
}

function calculateOfflineEarnings() {
    checkOfflineIncome();
}

function checkOfflineIncome() {
    if (!tycoonState.lastSaveTime) return;
    const now = Date.now();
    const diffSec = Math.floor((now - tycoonState.lastSaveTime) / 1000);
    const cappedSec = Math.min(diffSec, 12 * 3600); // 12 saat limit

    if (cappedSec > 30) {
        const perSec = getTotalPassivePerSec();
        const earned = cappedSec * perSec;
        tycoonState.money += earned;
        tycoonState.stats.totalEarned += earned;

        setTimeout(() => {
            showTycoonToast(`🏬 Kulüp Tesisleriniz sen yokken ${formatCurrency(earned)} pasif gelir üretti!`, "success");
        }, 1000);
    }
}

function startTycoonTicker() {
    if (tycoonTickerInterval) clearInterval(tycoonTickerInterval);
    tycoonTickerInterval = setInterval(() => {
        const perSec = getTotalPassivePerSec();
        tycoonState.money += perSec;
        tycoonState.stats.totalEarned += perSec;
        updateTycoonHUD(false);
    }, 1000);

    setInterval(() => {
        saveTycoonData();
    }, 10000);
}

// ==========================================
// 3. FIFA FUT PACK OPENING & WALKOUT ENGINE
// ==========================================
// ==========================================
// 3. FIFA FUT PACK OPENING & WALKOUT ENGINE (CINEMATIC)
// ==========================================

// Sound Synthesizer Helpers for Pack Opening
function getTycoonAudioCtx() {
    try {
        if (typeof getAudioContext === "function") return getAudioContext();
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) return new AudioCtx();
    } catch (e) {
        console.warn("Audio Context init error:", e);
    }
    return null;
}

function isTycoonSoundMuted() {
    return typeof isAudioMuted !== "undefined" ? isAudioMuted : false;
}

function playTycoonRipSFX() {
    if (isTycoonSoundMuted()) return;
    try {
        const ctx = getTycoonAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        // White noise burst for paper/foil tear
        const bufferSize = Math.floor(ctx.sampleRate * 0.35);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1200, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);

        // Rising whoosh synth
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);

        oscGain.gain.setValueAtTime(0.04, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    } catch (e) {}
}

function playTycoonBoomSFX() {
    if (isTycoonSoundMuted()) return;
    try {
        const ctx = getTycoonAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Deep sub bass boom
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.8);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
    } catch (e) {}
}

function playTycoonFanfareSFX() {
    if (isTycoonSoundMuted()) return;
    try {
        const ctx = getTycoonAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Victory fanfare chords (C4, G4, C5, E5, G5)
        const notes = [
            { f: 261.63, t: 0, d: 0.25 },
            { f: 392.00, t: 0.12, d: 0.25 },
            { f: 523.25, t: 0.24, d: 0.35 },
            { f: 659.25, t: 0.38, d: 0.4 },
            { f: 783.99, t: 0.52, d: 0.9 }
        ];

        notes.forEach(n => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, now + n.t);

            gain.gain.setValueAtTime(0, now + n.t);
            gain.gain.linearRampToValueAtTime(0.08, now + n.t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + n.t);
            osc.stop(now + n.t + n.d);
        });
    } catch (e) {}
}

function playTycoonCardSnapSFX() {
    if (isTycoonSoundMuted()) return;
    try {
        const ctx = getTycoonAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
    } catch (e) {}
}

// Confetti Particle Engine for Walkout & Pack Reveals
let tycoonConfettiAnimId = null;
function launchTycoonConfetti(durationMs = 4000) {
    const canvas = document.getElementById("tycoon-confetti-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.parentElement.clientWidth || 800;
    canvas.height = canvas.parentElement.clientHeight || 550;

    const colors = ["#ffd700", "#f59e0b", "#e11d48", "#38bdf8", "#4ade80", "#c084fc", "#ffffff"];
    const particles = [];
    const count = 100;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: canvas.width * 0.5 + (Math.random() - 0.5) * 120,
            y: canvas.height * 0.45,
            vx: (Math.random() - 0.5) * 16,
            vy: -Math.random() * 14 - 4,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 12,
            opacity: 1
        });
    }

    if (tycoonConfettiAnimId) cancelAnimationFrame(tycoonConfettiAnimId);
    const startTime = Date.now();

    function draw() {
        const elapsed = Date.now() - startTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.38; // gravity
            p.vx *= 0.98; // air resistance
            p.rotation += p.vRot;
            if (elapsed > durationMs - 1200) {
                p.opacity = Math.max(0, (durationMs - elapsed) / 1200);
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        });

        if (elapsed < durationMs) {
            tycoonConfettiAnimId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    draw();
}

function showStarterPackPrompt() {
    const modal = document.getElementById("tycoon-pack-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    const container = document.getElementById("tycoon-pack-stage");

    container.innerHTML = `
        <div class="fut-starter-intro">
            <div class="fut-glow-ring"></div>
            <div class="fut-3d-pack-wrap" id="fut-starter-pack-wrap">
                <div class="fut-3d-pack pack-starter" id="fut-interactive-pack" onclick="executePackOpening('starter')">
                    <div class="pack-ribbon"><i class="fa-solid fa-star"></i> ÜCRETSİZ KURULUM</div>
                    <div class="pack-logo-wrap">
                        <div class="pack-logo"><i class="fa-solid fa-crown"></i></div>
                    </div>
                    <div class="pack-title">SÜPER LİG NOSTALJİ<br><span style="font-size:0.95rem; color:#fef08a;">BAŞLANGIÇ PAKETİ</span></div>
                    <div class="pack-subtitle">14 EFSANE FUTBOLCU</div>
                    <div class="pack-touch-hint"><i class="fa-solid fa-bolt fa-bounce"></i> PAKETİ YIRT VE AÇ</div>
                </div>
            </div>
        </div>
    `;

    // 3D Tilt Etkileşimi
    const packEl = document.getElementById("fut-interactive-pack");
    if (packEl) {
        packEl.addEventListener("mousemove", (e) => {
            const rect = packEl.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const rotX = -(y / (rect.height / 2)) * 14;
            const rotY = (x / (rect.width / 2)) * 14;
            packEl.style.transform = `scale(1.06) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        });

        packEl.addEventListener("mouseleave", () => {
            packEl.style.transform = `scale(1) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    }
}

function openPackStoreModal() {
    const modal = document.getElementById("tycoon-store-modal");
    if (!modal) return;

    const grid = document.getElementById("tycoon-store-packs-grid");
    if (grid) {
        grid.innerHTML = `
            ${renderStorePackCard('bronze')}
            ${renderStorePackCard('silver')}
            ${renderStorePackCard('gold')}
            ${renderStorePackCard('legend')}
        `;
    }
    modal.classList.remove("hidden");
}

function renderStorePackCard(packKey) {
    const p = PACK_TYPES[packKey];
    const canAfford = tycoonState.money >= p.cost;

    return `
        <div class="store-pack-card pack-${packKey}">
            <div class="pack-card-top" style="background: ${p.color};">
                <span class="pack-badge">${p.badge}</span>
                <i class="fa-solid fa-box-open pack-icon"></i>
            </div>
            <div class="pack-card-body">
                <h4>${p.name}</h4>
                <p>${p.count} Nostaljik Futbolcu</p>
                <div class="pack-price">${formatCurrency(p.cost)}</div>
            </div>
            <button class="btn btn-black w-100 ${!canAfford ? 'disabled' : ''}" onclick="buyAndOpenPack('${packKey}')" ${!canAfford ? 'disabled' : ''}>
                <i class="fa-solid fa-unlock"></i> PAKETİ AÇ
            </button>
        </div>
    `;
}

function buyAndOpenPack(packKey) {
    const pack = PACK_TYPES[packKey];
    if (!pack) return;

    if (tycoonState.money < pack.cost) {
        showTycoonToast("❌ Kulüp bütçeniz yetersiz!", "error");
        return;
    }

    tycoonState.money -= pack.cost;
    closeTycoonModal("tycoon-store-modal");
    executePackOpening(packKey);
}

function executePackOpening(packKey) {
    const pack = PACK_TYPES[packKey];
    const modal = document.getElementById("tycoon-pack-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    const stage = document.getElementById("tycoon-pack-stage");

    // Ses efekti çal
    playTycoonRipSFX();

    // 1. Aşama: Şiddetli Paket Titremesi ve Işık Patlaması
    stage.innerHTML = `
        <div class="fut-opening-animation">
            <div class="fut-opening-pack pack-${packKey} pack-burst-anim">
                <i class="fa-solid fa-bolt-lightning burst-bolt"></i>
            </div>
            <h3 class="opening-status-text">⚡ PAKET YIRTILIYOR...</h3>
        </div>
    `;

    // 2. Oyuncuları Çek
    const generatedPlayers = generatePackPlayers(packKey);

    // En yüksek reytingli oyuncu (Walkout Yıldızı)
    generatedPlayers.sort((a, b) => b.rating - a.rating);
    const topPlayer = generatedPlayers[0];

    // 2. Aşama: Gerilim & Teaser Reveal (FUT Walkout Heyecanı)
    setTimeout(() => {
        renderWalkoutTeaserSequence(stage, topPlayer, generatedPlayers, packKey);
    }, 1300);
}

function renderWalkoutTeaserSequence(stage, topPlayer, allPlayers, packKey) {
    playTycoonCardSnapSFX();

    const positionName = topPlayer.position === 'GK' ? 'KALECİ (GK)' :
                         topPlayer.position === 'DF' ? 'DEFANS (DF)' :
                         topPlayer.position === 'MF' ? 'ORTA SAHA (MF)' : 'FORVET (FW)';

    stage.innerHTML = `
        <div class="fut-suspense-stage">
            <div class="suspense-teaser-box">
                <div class="suspense-item" style="animation-delay: 0.1s;">
                    <i class="fa-solid fa-futbol text-gold" style="font-size: 1.4rem;"></i>
                    <div>
                        <div class="label">Mevki</div>
                        <div class="value">${positionName}</div>
                    </div>
                </div>
                <div id="teaser-club" class="suspense-item" style="display:none; animation-delay: 0.1s;">
                    <i class="fa-solid fa-shield-halved text-gold" style="font-size: 1.4rem;"></i>
                    <div>
                        <div class="label">Kulüp</div>
                        <div class="value">${topPlayer.team_name}</div>
                    </div>
                </div>
                <div id="teaser-ovr" class="suspense-item" style="display:none; animation-delay: 0.1s;">
                    <i class="fa-solid fa-star text-gold" style="font-size: 1.4rem;"></i>
                    <div>
                        <div class="label">Yıldız Gücü</div>
                        <div class="value">${topPlayer.rating >= 85 ? '🌟 EFSANE YILDIZ' : '⭐ YÜKSEK GÜÇLÜ OYUNCU'}</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const clubEl = document.getElementById("teaser-club");
        if (clubEl) {
            clubEl.style.display = "flex";
            playTycoonCardSnapSFX();
        }
    }, 800);

    setTimeout(() => {
        const ovrEl = document.getElementById("teaser-ovr");
        if (ovrEl) {
            ovrEl.style.display = "flex";
            playTycoonBoomSFX();
        }
    }, 1500);

    // 3. Aşama: Büyük Walkout Sahnesi
    setTimeout(() => {
        renderWalkoutStage(stage, topPlayer, allPlayers, packKey);
    }, 2400);
}

function generatePackPlayers(packKey) {
    const pack = PACK_TYPES[packKey];
    const players = [];

    if (packKey === "starter") {
        // 1 GK, 4 DF, 4 MF, 2 FW + 3 Yedek garanti
        players.push(getRandomPlayerFromPool("GK", 62, 78));
        for (let i = 0; i < 4; i++) players.push(getRandomPlayerFromPool("DF", 62, 80));
        for (let i = 0; i < 4; i++) players.push(getRandomPlayerFromPool("MF", 64, 84));
        for (let i = 0; i < 2; i++) players.push(getRandomPlayerFromPool("FW", 65, 85));
        // 3 Rastgele Yedek
        for (let i = 0; i < 3; i++) players.push(getRandomPlayerFromPool("ALL", 60, 78));
    } else {
        for (let i = 0; i < pack.count; i++) {
            players.push(getRandomPlayerFromPool("ALL", pack.minOvr, pack.maxOvr));
        }
    }

    return players;
}

function getRandomPlayerFromPool(posGroup = "ALL", minOvr = 60, maxOvr = 95) {
    let pool = parsedPlayersPool.all;
    if (posGroup !== "ALL" && parsedPlayersPool[posGroup] && parsedPlayersPool[posGroup].length > 0) {
        pool = parsedPlayersPool[posGroup];
    }

    const filtered = pool.filter(p => p.rating >= minOvr && p.rating <= maxOvr);
    const candidatePool = filtered.length > 0 ? filtered : pool;

    const selected = candidatePool[Math.floor(Math.random() * candidatePool.length)];

    // Klon oluştur
    return Object.assign({}, selected, {
        id: "p_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6)
    });
}

function renderWalkoutStage(container, topPlayer, allPlayers, packKey) {
    const isSuperWalkout = topPlayer.rating >= 84;

    // Ses ve konfeti patlat
    playTycoonBoomSFX();
    setTimeout(() => {
        playTycoonFanfareSFX();
    }, 200);
    launchTycoonConfetti(5000);

    container.innerHTML = `
        <div class="fut-walkout-wrapper ${isSuperWalkout ? 'super-walkout' : ''}">
            <div class="walkout-header">
                <span class="walkout-tag"><i class="fa-solid fa-crown"></i> KULÜBÜNÜZÜN YILDIZ TRANSFERİ</span>
                <h2 class="walkout-player-name">${topPlayer.name}</h2>
                <div class="walkout-meta">${topPlayer.detailed_position || topPlayer.position} • <span id="walkout-ovr-counter">0</span> OVR • ${topPlayer.team_name}</div>
            </div>

            <div class="walkout-card-display">
                ${renderFutCardHTML(topPlayer, true)}
            </div>

            <div class="walkout-actions">
                <button class="btn btn-gold btn-large" onclick="showAllPackCards(${JSON.stringify(allPlayers).replace(/"/g, '&quot;')}, '${packKey}')">
                    <i class="fa-solid fa-layer-group"></i> TÜM KADROYU GÖR (${allPlayers.length} NOSTALJİK FUTBOLCU)
                </button>
            </div>
        </div>
    `;

    // OVR sayacını animasyonlu artır
    animateOvrCounter("walkout-ovr-counter", topPlayer.rating);
}

function animateOvrCounter(elemId, targetVal) {
    const el = document.getElementById(elemId);
    if (!el) return;
    let curr = 40;
    const step = Math.ceil((targetVal - curr) / 20);
    const interval = setInterval(() => {
        curr += step;
        if (curr >= targetVal) {
            curr = targetVal;
            clearInterval(interval);
        }
        el.textContent = curr;
    }, 30);
}

function showAllPackCards(allPlayers, packKey) {
    const stage = document.getElementById("tycoon-pack-stage");
    if (!stage) return;

    // Konfeti devam etsin
    launchTycoonConfetti(3500);

    const isStarter = packKey === "starter";

    stage.innerHTML = `
        <div class="fut-summary-wrapper">
            <div class="summary-header">
                <h3><i class="fa-solid fa-gift text-gold"></i> ${isStarter ? 'KULÜBÜNÜZ KURULDU!' : 'PAKET İÇERİĞİ'}</h3>
                <p>${allPlayers.length} nostaljik futbolcu kulübünüze katıldı ve göreve hazır!</p>
            </div>

            <div class="fut-cards-grid scrollbar">
                ${allPlayers.map((p, idx) => {
                    const isStartingXI = isStarter && idx < 11;
                    return `
                        <div class="fut-card-item-wrap" style="--i: ${idx};">
                            ${isStarter ? `
                                <span class="card-role-badge ${isStartingXI ? 'lineup' : 'bench'}">
                                    ${isStartingXI ? 'İLK 11' : 'YEDEK'}
                                </span>
                            ` : ''}
                            ${renderFutCardHTML(p, false)}
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="summary-footer">
                <button class="btn btn-black btn-large w-100" style="font-size: 1.1rem; padding: 14px; background: #000; border: 2px solid #ffd700;" onclick="finalizePackOpening(${JSON.stringify(allPlayers).replace(/"/g, '&quot;')}, '${packKey}')">
                    <i class="fa-solid fa-shield-halved text-gold"></i> KULÜBÜ BAŞLAT VE TAKTİK SAHASINA GEÇ
                </button>
            </div>
        </div>
    `;

    // Her kart açılırken hafif kart çıtlama sesi
    allPlayers.forEach((_, idx) => {
        setTimeout(() => {
            playTycoonCardSnapSFX();
        }, idx * 60);
    });
}

function finalizePackOpening(allPlayers, packKey) {
    if (packKey === "starter" || !tycoonState.lineup || tycoonState.lineup.length === 0) {
        // Başlangıç paketi: Tam 1 GK, 4 DF, 4 MF, 2 FW oluştur, fazlalıkları yedeğe gönder
        tycoonState.lineup = allPlayers;
        tycoonState.bench = [];
        autoFixLineupPositions();
        tycoonState.hasOpenedStarterPack = true;
    } else {
        // Mağazadan açılan paket: Doğrudan yedeğe/envantere ekle
        tycoonState.bench = (tycoonState.bench || []).concat(allPlayers);
    }

    tycoonState.stats.totalPacksOpened = (tycoonState.stats.totalPacksOpened || 0) + 1;

    saveTycoonData();
    updateTycoonHUD();
    renderTycoonPitchSquad();
    closeTycoonModal("tycoon-pack-modal");
    showTycoonToast(`🎉 ${allPlayers.length} yeni futbolcu kulübünüze katıldı! Taktik sahasından kadronuzu yönetebilirsiniz.`, "success");
}

function renderFutCardHTML(player, isWalkout = false) {
    const tier = player.rating >= 86 ? 'legend' : player.rating >= 78 ? 'gold' : player.rating >= 70 ? 'silver' : 'bronze';
    const hasImg = player.image_path && player.image_path.length > 5;

    return `
        <div class="fut-card tier-${tier} ${isWalkout ? 'fut-card-large' : ''}">
            <div class="fut-card-top">
                <div class="fut-rating">${player.rating}</div>
                <div class="fut-pos">${player.position}</div>
            </div>
            <div class="fut-card-img-wrap">
                ${hasImg ? `
                    <img src="${player.image_path}" alt="${player.name}" class="fut-player-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="fut-player-fallback" style="display:none;"><i class="fa-solid fa-user"></i></div>
                ` : `
                    <div class="fut-player-fallback"><i class="fa-solid fa-user"></i></div>
                `}
            </div>
            <div class="fut-card-bottom">
                <div class="fut-name">${player.name}</div>
                <div class="fut-team">${player.team_name || 'Süper Lig'}</div>
                <div class="fut-val">${player.market_value || '500 bin €'}</div>
            </div>
        </div>
    `;
}

// ==========================================
// 4. SQUAD & FORMATION PITCH MANAGEMENT
// ==========================================
function changeFormation(formationKey) {
    if (!FORMATIONS[formationKey]) return;
    tycoonState.formation = formationKey;
    autoFixLineupPositions(formationKey);
    saveTycoonData();
    updateTycoonHUD();
    renderTycoonPitchSquad();
    showTycoonToast(`📋 Yeni Diziliş Uygulandı: ${FORMATIONS[formationKey].name}`, "success");
}

function autoFixLineupPositions(customFormation = null) {
    if (!tycoonState.lineup) tycoonState.lineup = [];
    if (!tycoonState.bench) tycoonState.bench = [];

    const fKey = customFormation || tycoonState.formation || '4-4-2';
    const formConfig = FORMATIONS[fKey] || FORMATIONS['4-4-2'];

    const targetDF = formConfig.df;
    const targetMF = formConfig.mf;
    const targetFW = formConfig.fw;

    const allPlayers = [...tycoonState.lineup, ...tycoonState.bench];

    // Pozisyon havuzları
    let gks = allPlayers.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating);
    let dfs = allPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
    let mfs = allPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
    let fws = allPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);
    let others = allPlayers.filter(p => !['GK', 'DF', 'MF', 'FW'].includes(p.position)).sort((a, b) => b.rating - a.rating);

    // Diğerlerini mevkilerine dağıt
    others.forEach(p => {
        if (mfs.length < targetMF) { p.position = 'MF'; mfs.push(p); }
        else if (dfs.length < targetDF) { p.position = 'DF'; dfs.push(p); }
        else if (fws.length < targetFW) { p.position = 'FW'; fws.push(p); }
        else if (gks.length < 1) { p.position = 'GK'; gks.push(p); }
        else { mfs.push(p); }
    });

    // Eğer eksik mevki varsa veritabanından tamamla
    if (gks.length < 1) gks.push(getRandomPlayerFromPool("GK", 64, 76));
    while (dfs.length < targetDF) dfs.push(getRandomPlayerFromPool("DF", 64, 78));
    while (mfs.length < targetMF) mfs.push(getRandomPlayerFromPool("MF", 64, 80));
    while (fws.length < targetFW) fws.push(getRandomPlayerFromPool("FW", 65, 82));

    const newLineup = [];
    newLineup.push(gks.shift());
    for (let i = 0; i < targetDF; i++) newLineup.push(dfs.shift());
    for (let i = 0; i < targetMF; i++) newLineup.push(mfs.shift());
    for (let i = 0; i < targetFW; i++) newLineup.push(fws.shift());

    // Geriye kalan tüm oyuncular yedek kulübesine
    const newBench = [...gks, ...dfs, ...mfs, ...fws];

    tycoonState.lineup = newLineup;
    tycoonState.bench = newBench;
    saveTycoonData();
}

function clearLineupToBench() {
    if (!tycoonState.lineup || tycoonState.lineup.length === 0) {
        showTycoonToast("Kadro zaten boş!", "info");
        return;
    }
    tycoonState.bench = (tycoonState.bench || []).concat(tycoonState.lineup);
    tycoonState.lineup = [];
    saveTycoonData();
    updateTycoonHUD();
    renderTycoonPitchSquad();
    if (!document.getElementById("tycoon-squad-modal").classList.contains("hidden")) {
        renderFullSquadList(null);
    }
    showTycoonToast("🧹 Tüm oyuncular yedek kulübesine gönderildi! Sahadaki boş yuvalara tıklayarak sıfırdan kadronuzu kurabilirsiniz.", "success");
}

function autoFillBestLineup() {
    autoFixLineupPositions();
    updateTycoonHUD();
    renderTycoonPitchSquad();
    if (!document.getElementById("tycoon-squad-modal").classList.contains("hidden")) {
        renderFullSquadList(null);
    }
    showTycoonToast("⚡ En yüksek reytingli 11 oyuncunuz sahaya yerleştirildi!", "success");
}

function renderTycoonPitchSquad() {
    const container = document.getElementById("tycoon-pitch-slots-grid");
    if (!container) return;

    if (!tycoonState.lineup) tycoonState.lineup = [];
    if (!tycoonState.bench) tycoonState.bench = [];

    const fKey = tycoonState.formation || '4-4-2';
    const formConfig = FORMATIONS[fKey] || FORMATIONS['4-4-2'];

    // Sahadaki oyuncuları mevkilerine göre grupla
    const gks = tycoonState.lineup.filter(p => p.position === 'GK');
    const dfs = tycoonState.lineup.filter(p => p.position === 'DF');
    const mfs = tycoonState.lineup.filter(p => p.position === 'MF');
    const fws = tycoonState.lineup.filter(p => p.position === 'FW');

    const posTrMap = { GK: "KL", DF: "DF", MF: "OS", FW: "FV" };

    const formatTacticalPlayerName = (name) => {
        if (!name) return 'Oyuncu';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) {
            return `<span>${parts[0]}</span>`;
        } else if (parts.length === 2) {
            return `<span class="first-name">${parts[0]}</span><span class="last-name">${parts[1]}</span>`;
        } else {
            const first = parts.slice(0, -1).map(p => p[0] + '.').join(' ');
            const last = parts[parts.length - 1];
            return `<span class="first-name">${first}</span><span class="last-name">${last}</span>`;
        }
    };

    const renderCardSlot = (p) => {
        if (!p) return '';
        const originalIdx = tycoonState.lineup.findIndex(item => item.id === p.id);
        const trPos = posTrMap[p.position] || p.position;
        const hasImg = p.image_path && p.image_path.length > 5;

        return `
            <div class="tactical-pitch-slot filled-slot" onclick="openSwapSlotModal('${p.position}', ${originalIdx})" title="${p.name} (${p.rating} OVR - ${p.position})">
                <div class="tactical-player-circle">
                    ${hasImg ? `<img src="${p.image_path}" class="tac-bg-img" alt="${p.name}" onerror="this.style.display='none';">` : ''}
                    <div class="tac-circle-overlay">
                        <span class="tac-pos">${trPos}</span>
                        <span class="tac-ovr">${p.rating}</span>
                    </div>
                </div>
                <div class="tactical-player-tag">
                    ${formatTacticalPlayerName(p.name)}
                </div>
            </div>
        `;
    };

    const renderEmptySlot = (pos) => {
        const trPos = posTrMap[pos] || pos;
        return `
            <div class="tactical-pitch-slot empty-slot" onclick="openEmptySlotModal('${pos}')" title="Oyuncu Seç">
                <div class="tactical-empty-circle">
                    <span class="tac-empty-pos">${trPos}</span>
                </div>
            </div>
        `;
    };

    const renderRowSlots = (filledList, targetCount, pos) => {
        const slots = [];
        for (let i = 0; i < targetCount; i++) {
            if (i < filledList.length) {
                slots.push(renderCardSlot(filledList[i]));
            } else {
                slots.push(renderEmptySlot(pos));
            }
        }
        return slots.join('');
    };

    container.innerHTML = `
        <div class="pitch-tactical-board modern-pitch">
            <!-- Saha Çizgileri -->
            <div class="pitch-marking penalty-box-top"></div>
            <div class="pitch-marking center-line"></div>
            <div class="pitch-marking center-circle"></div>
            <div class="pitch-marking penalty-box-bottom"></div>

            <!-- 1. Forvet Hattı -->
            <div class="pitch-formation-row fws-row">
                ${renderRowSlots(fws, formConfig.fw, 'FW')}
            </div>

            <!-- 2. Orta Saha Hattı -->
            <div class="pitch-formation-row mfs-row">
                ${renderRowSlots(mfs, formConfig.mf, 'MF')}
            </div>

            <!-- 3. Defans Hattı -->
            <div class="pitch-formation-row dfs-row">
                ${renderRowSlots(dfs, formConfig.df, 'DF')}
            </div>

            <!-- 4. Kaleci Hattı -->
            <div class="pitch-formation-row gks-row">
                ${renderRowSlots(gks, 1, 'GK')}
            </div>
        </div>
    `;
}

let targetedLineupSlotIdx = null;
let targetedEmptyPosition = null;

function openEmptySlotModal(position) {
    targetedLineupSlotIdx = null;
    targetedEmptyPosition = position;
    const modal = document.getElementById("tycoon-squad-modal");
    if (!modal) return;

    renderFullSquadList(null, position);
    modal.classList.remove("hidden");
}

function openSwapSlotModal(position, lineupIdx) {
    targetedLineupSlotIdx = lineupIdx;
    const modal = document.getElementById("tycoon-squad-modal");
    if (!modal) return;

    renderFullSquadList(lineupIdx);
    modal.classList.remove("hidden");
}

function openSquadManagementModal() {
    targetedLineupSlotIdx = null;
    const modal = document.getElementById("tycoon-squad-modal");
    if (!modal) return;

    // Bildirim rozetini temizle
    const badge = document.getElementById("squad-notification-badge");
    if (badge) badge.classList.add("hidden");

    renderFullSquadList(null);
    modal.classList.remove("hidden");
}

let currentBenchFilterMode = 'exact'; // 'exact' (sadece seçili mevki) veya 'all' (tüm yedekler)

function renderFullSquadList(highlightLineupIdx = null, filterPosition = null) {
    const lineupCont = document.getElementById("tycoon-modal-lineup-list");
    const benchCont = document.getElementById("tycoon-modal-bench-list");
    const elLineupCount = document.getElementById("squad-lineup-count");
    const elBenchFilterTag = document.getElementById("squad-bench-filter-tag");

    const targetedPlayer = highlightLineupIdx !== null ? tycoonState.lineup[highlightLineupIdx] : null;
    const requiredPos = targetedPlayer ? targetedPlayer.position : (filterPosition || targetedEmptyPosition);

    if (elLineupCount) {
        elLineupCount.textContent = `${tycoonState.lineup ? tycoonState.lineup.length : 0}/11`;
    }

    if (lineupCont) {
        if (!tycoonState.lineup || tycoonState.lineup.length === 0) {
            lineupCont.innerHTML = `
                <div class="squad-empty-box">
                    <i class="fa-solid fa-users-slash"></i>
                    <strong>İlk 11 Boş</strong>
                    <p>Yedeklerden oyuncu seçerek ilk 11'i kurun.</p>
                </div>
            `;
        } else {
            lineupCont.innerHTML = tycoonState.lineup.map((p, idx) => {
                const isTarget = highlightLineupIdx === idx;
                const youthTag = p.isYouthProspect ? '<span class="badge-youth-tag"><i class="fa-solid fa-graduation-cap"></i> ALTYAPI</span>' : '';
                return `
                    <div class="squad-list-item ${isTarget ? 'highlight-target-slot' : ''}">
                        <span class="pos-badge pos-${p.position}">${p.position}</span>
                        <span class="ovr-badge">${p.rating}</span>
                        <div class="meta">
                            <strong>${p.name} ${youthTag}</strong>
                            <span>${p.team_name || 'Kulüpsüz'} • ${p.market_value}</span>
                        </div>
                        <div class="item-actions">
                            <button class="btn ${isTarget ? 'btn-gold' : 'btn-white'} btn-compact" onclick="selectSlotForSwap(${idx})">
                                ${isTarget ? '<i class="fa-solid fa-check"></i> Seçildi' : '<i class="fa-solid fa-repeat"></i> Değiştir'}
                            </button>
                            <button class="btn btn-white btn-compact text-red" onclick="moveToBench(${idx})" title="Yedeğe Gönder">
                                <i class="fa-solid fa-arrow-down"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    if (benchCont) {
        if (!tycoonState.bench || tycoonState.bench.length === 0) {
            if (elBenchFilterTag) elBenchFilterTag.textContent = "Boş";
            benchCont.innerHTML = `
                <div class="squad-empty-box">
                    <i class="fa-solid fa-box-open"></i>
                    <strong>Yedek Yok</strong>
                    <p>Paket açarak kulübünüze yeni oyuncular katın.</p>
                </div>
            `;
        } else {
            // Tüm yedekler indeksleriyle
            let benchItems = tycoonState.bench.map((p, i) => ({ player: p, origIdx: i }));

            if (requiredPos) {
                benchItems = benchItems.filter(item => item.player.position === requiredPos);
                if (elBenchFilterTag) {
                    elBenchFilterTag.textContent = `Sadece ${requiredPos} (${benchItems.length})`;
                    elBenchFilterTag.className = "squad-filter-badge active";
                }
            } else {
                if (elBenchFilterTag) {
                    elBenchFilterTag.textContent = `Tümü (${benchItems.length})`;
                    elBenchFilterTag.className = "squad-filter-badge";
                }
            }

            // Reytinge göre sırala
            benchItems.sort((a, b) => b.player.rating - a.player.rating);

            if (benchItems.length === 0) {
                const posNameMap = { GK: "Kaleci", DF: "Defans", MF: "Orta Saha", FW: "Forvet" };
                const missingPos = requiredPos ? posNameMap[requiredPos] : "Oyuncu";
                benchCont.innerHTML = `
                    <div class="squad-empty-box warning">
                        <i class="fa-solid fa-triangle-exclamation text-gold"></i>
                        <strong>Yedek ${missingPos} Yok!</strong>
                        <p>Mağazadan paket açarak bu mevkiyi güçlendirebilirsiniz.</p>
                        <button class="btn btn-gold btn-small" onclick="closeTycoonModal('tycoon-squad-modal'); openPackStoreModal();">
                            <i class="fa-solid fa-gift"></i> Paket Aç
                        </button>
                    </div>
                `;
            } else {
                benchCont.innerHTML = benchItems.map(item => {
                    const p = item.player;
                    const origIdx = item.origIdx;
                    const qsPrice = calculatePlayerQuickSellPrice(p);
                    const youthTag = p.isYouthProspect ? '<span class="badge-youth-tag"><i class="fa-solid fa-graduation-cap"></i> ALTYAPI</span>' : '';
                    return `
                        <div class="squad-list-item">
                            <span class="pos-badge pos-${p.position}">${p.position}</span>
                            <span class="ovr-badge">${p.rating}</span>
                            <div class="meta">
                                <strong>${p.name} ${youthTag}</strong>
                                <span>${p.team_name || 'Kulüpsüz'} • ${p.market_value}</span>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-black btn-compact" onclick="performDirectSwap(${origIdx})">
                                    <i class="fa-solid fa-arrow-up"></i> ${targetedPlayer ? 'Değiştir' : '11\'e Al'}
                                </button>
                                <button class="btn btn-white btn-compact text-red" onclick="quickSellPlayer(${origIdx}, 'bench')" title="Hızlı Sat (+${formatCurrency(qsPrice)})">
                                    <i class="fa-solid fa-coins"></i> Sat (${formatCurrency(qsPrice)})
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }
}

function selectSlotForSwap(idx) {
    targetedLineupSlotIdx = idx;
    targetedEmptyPosition = null;
    renderFullSquadList(idx);
    showTycoonToast(`Değiştirmek istediğiniz oyuncuyu (${tycoonState.lineup[idx].name}) seçtiniz. Şimdi sağdaki listeden yeni oyuncuyu seçin.`, "info");
}

function performDirectSwap(benchIdx) {
    const benchPlayer = tycoonState.bench[benchIdx];
    if (!benchPlayer) return;

    if (targetedLineupSlotIdx !== null && tycoonState.lineup[targetedLineupSlotIdx]) {
        // Doğrudan seçili slottaki oyuncuyla takas et!
        const outPlayer = tycoonState.lineup[targetedLineupSlotIdx];
        tycoonState.lineup[targetedLineupSlotIdx] = benchPlayer;
        tycoonState.bench[benchIdx] = outPlayer;
        showTycoonToast(`✅ ${benchPlayer.name} sahaya çıktı, ${outPlayer.name} yedek kulübesine geçti!`, "success");
    } else if (tycoonState.lineup.length < 11) {
        // Kadroda boş yer var, doğrudan kadroya ekle
        tycoonState.lineup.push(benchPlayer);
        tycoonState.bench.splice(benchIdx, 1);
        showTycoonToast(`✅ ${benchPlayer.name} ilk 11'e yerleştirildi!`, "success");
    } else {
        // Aynı mevkideki ilk oyuncuyla takas et
        const samePosIdx = tycoonState.lineup.findIndex(p => p.position === benchPlayer.position);
        if (samePosIdx !== -1) {
            const outPlayer = tycoonState.lineup[samePosIdx];
            tycoonState.lineup[samePosIdx] = benchPlayer;
            tycoonState.bench[benchIdx] = outPlayer;
            showTycoonToast(`✅ ${benchPlayer.name} sahaya çıktı, ${outPlayer.name} yedek kulübesine geçti!`, "success");
        } else {
            // En düşük reytingli oyuncuyla takas et
            let lowestIdx = 0;
            let lowestOvr = 999;
            tycoonState.lineup.forEach((p, i) => {
                if (p.rating < lowestOvr) {
                    lowestOvr = p.rating;
                    lowestIdx = i;
                }
            });
            const outPlayer = tycoonState.lineup[lowestIdx];
            tycoonState.lineup[lowestIdx] = benchPlayer;
            tycoonState.bench[benchIdx] = outPlayer;
            showTycoonToast(`✅ ${benchPlayer.name} sahaya çıktı, ${outPlayer.name} yedeğe alındı!`, "success");
        }
    }

    targetedLineupSlotIdx = null;
    targetedEmptyPosition = null;
    saveTycoonData();
    updateTycoonHUD();
    renderTycoonPitchSquad();
    renderFullSquadList(null);
}

function swapBenchToLineup(benchIdx) {
    performDirectSwap(benchIdx);
}

function moveToBench(lineupIdx) {
    if (tycoonState.lineup.length <= 1) {
        showTycoonToast("İlk 11'de en az 1 oyuncu bulunmalıdır.", "error");
        return;
    }
    const player = tycoonState.lineup.splice(lineupIdx, 1)[0];
    tycoonState.bench.push(player);
    saveTycoonData();
    updateTycoonHUD();
    renderTycoonPitchSquad();
    renderFullSquadList(null);
}

function moveToLineup(benchIdx) {
    performDirectSwap(benchIdx);
}

function calculatePlayerQuickSellPrice(player) {
    if (!player || !player.rating) return 100;
    const ovr = player.rating;
    if (ovr < 70) {
        return Math.round(100 + (ovr - 60) * 15); // 60-69 OVR: 100 - 235 ₺
    } else if (ovr < 80) {
        return Math.round(300 + (ovr - 70) * 50); // 70-79 OVR: 300 - 750 ₺
    } else if (ovr < 86) {
        return Math.round(1000 + (ovr - 80) * 350); // 80-85 OVR: 1.000 - 2.750 ₺
    } else if (ovr < 90) {
        return Math.round(4000 + (ovr - 86) * 1500); // 86-89 OVR: 4.000 - 8.500 ₺
    } else {
        return Math.round(12000 + (ovr - 90) * 2000); // 90+ OVR: 12.000 - 30.000 ₺
    }
}

function quickSellPlayer(idx, from = 'bench') {
    let player = null;
    if (from === 'bench') {
        player = tycoonState.bench.splice(idx, 1)[0];
    } else {
        player = tycoonState.lineup.splice(idx, 1)[0];
    }

    if (!player) return;
    const sellPrice = calculatePlayerQuickSellPrice(player);
    tycoonState.money += sellPrice;
    tycoonState.stats.totalEarned += sellPrice;

    saveTycoonData();
    updateTycoonHUD();
    renderTycoonPitchSquad();
    renderFullSquadList();
    showTycoonToast(`💰 ${player.name} hızlı satıldı: +${formatCurrency(sellPrice)}`, "success");
}

function openSwapBenchModal(slotIdx) {
    openSquadManagementModal();
}

// ==========================================
// 5. PROFESSIONAL TRANSFER MARKET & SCOUT HUB
// ==========================================
let currentMarketFilter = 'ALL';
let currentMarketMode = 'buy';

function openTransferMarketModal() {
    const modal = document.getElementById("tycoon-market-modal");
    if (!modal) return;

    updateMarketBudgetDisplay();
    refreshMarketIfExpired();
    renderTransferMarket();
    modal.classList.remove("hidden");
}

function updateMarketBudgetDisplay() {
    const el = document.getElementById("market-modal-budget");
    if (el) el.textContent = formatCurrency(tycoonState.money);
}

function refreshMarketIfExpired(force = false) {
    const b = tycoonState.buildings || {};
    const scoutLvl = b.scout || 0;
    if (scoutLvl === 0) {
        tycoonState.marketItems = [];
        return;
    }

    const now = Date.now();
    if (force || !tycoonState.marketItems || tycoonState.marketItems.length === 0 || now > (tycoonState.marketRefreshTime || 0)) {
        let minRating = 68, maxRating = 76;
        let slotCount = 4;

        if (scoutLvl === 2) { minRating = 74; maxRating = 80; slotCount = 6; }
        else if (scoutLvl === 3) { minRating = 78; maxRating = 85; slotCount = 8; }
        else if (scoutLvl === 4) { minRating = 83; maxRating = 90; slotCount = 10; }
        else if (scoutLvl >= 5) { minRating = 87; maxRating = 96; slotCount = 12; }

        const positions = ["FW", "MF", "DF", "GK", "FW", "MF", "DF", "ALL", "ALL", "FW", "MF", "DF"];
        const newItems = [];
        for (let i = 0; i < slotCount; i++) {
            const pos = positions[i % positions.length];
            const p = getRandomPlayerFromPool(pos, minRating, maxRating);
            if (p) newItems.push(p);
        }

        tycoonState.marketItems = newItems;
        tycoonState.marketRefreshTime = now + (15 * 60 * 1000); // 15 dk
        saveTycoonData();
    }
}

function forceRefreshMarketWithFee() {
    const b = tycoonState.buildings || {};
    const scoutLvl = b.scout || 0;
    if (scoutLvl === 0) {
        showTycoonToast("❌ Pazarı tazelemek için önce Scout Tesisi kurmalısınız!", "error");
        return;
    }

    const refreshFee = 1000;
    if (tycoonState.money < refreshFee) {
        showTycoonToast("❌ Pazarı yenilemek için en az 1.000 € bakiyeniz olmalı!", "error");
        return;
    }

    tycoonState.money -= refreshFee;
    refreshMarketIfExpired(true);
    saveTycoonData();
    updateTycoonHUD();
    updateMarketBudgetDisplay();
    renderTransferMarket();
    showTycoonToast("🔄 Scout ekibi pazarı yeni yıldızlarla tazeledi! (-1.000 €)", "success");
}

function switchMarketMode(mode) {
    currentMarketMode = mode;
    const buySec = document.getElementById("market-buy-section");
    const sellSec = document.getElementById("market-sell-section");
    const btnBuy = document.getElementById("btn-market-mode-buy");
    const btnSell = document.getElementById("btn-market-mode-sell");

    if (mode === 'buy') {
        if (buySec) buySec.classList.remove("hidden");
        if (sellSec) sellSec.classList.add("hidden");
        if (btnBuy) btnBuy.classList.add("active");
        if (btnSell) btnSell.classList.remove("active");
        renderTransferMarket();
    } else {
        if (buySec) buySec.classList.add("hidden");
        if (sellSec) sellSec.classList.remove("hidden");
        if (btnBuy) btnBuy.classList.remove("active");
        if (btnSell) btnSell.classList.add("active");
        renderMarketSellList();
    }
}

function filterMarketPosition(pos, btnEl) {
    currentMarketFilter = pos;
    const tabs = document.querySelectorAll(".market-pos-tabs .market-tab-btn");
    tabs.forEach(t => t.classList.remove("active"));
    if (btnEl) btnEl.classList.add("active");
    renderTransferMarket();
}

function renderTransferMarket() {
    const grid = document.getElementById("tycoon-market-cards-grid");
    if (!grid) return;

    updateMarketBudgetDisplay();

    const b = tycoonState.buildings || {};
    const scoutLvl = b.scout || 0;

    if (scoutLvl === 0) {
        grid.innerHTML = `
            <div class="market-empty-state locked-scout-state" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; background: #fff1f2; border: 2px dashed #e11d48; border-radius: 14px;">
                <div style="width: 70px; height: 70px; margin: 0 auto 14px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fa-solid fa-lock" style="font-size: 2rem; color: #e11d48;"></i>
                </div>
                <h3 style="font-family: var(--font-header), sans-serif; font-size: 1.25rem; font-weight: 900; color: #881337; margin-bottom: 8px;">TRANSFER PAZARI KİLİTLİ!</h3>
                <p style="font-size: 0.88rem; color: #9f1239; max-width: 500px; margin: 0 auto 20px; line-height: 1.5;">
                    Kulübünüzde henüz bir <strong>Scout & Yetenek Laboratuvarı</strong> inşa edilmedi. Transfer pazarına oyuncu raporları akması ve transfer yapabilmek için önce kampüsünüze Scout tesisini kurmalısınız!
                </p>
                <button class="btn-shop-build ready" style="padding: 10px 24px; font-size: 0.88rem; margin: 0 auto; display: inline-flex; align-items: center; gap: 8px; border: 2px solid #000; box-shadow: 2px 2px 0 #000; cursor: pointer;" onclick="closeTycoonModal('tycoon-market-modal'); if(window.CityBuilder) { CityBuilder.openBuildPanel(); CityBuilder.filterBuildCategory('management'); }">
                    <i class="fa-solid fa-hammer"></i> SCOUT TESİSİ İNŞA ET (Yönetim Sekmesi)
                </button>
            </div>
        `;
        return;
    }

    let list = tycoonState.marketItems || [];
    if (currentMarketFilter !== 'ALL') {
        list = list.filter(p => p.position === currentMarketFilter);
    }

    const scoutCfg = TYCOON_CONFIG.buildings.scout;
    const discountRate = (scoutCfg && scoutCfg.scoutBonus[scoutLvl]) ? (scoutCfg.scoutBonus[scoutLvl] / 100) : 0;
    const discountPercent = Math.round(discountRate * 100);

    const scoutHeaderBadge = `
        <div style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f0fdf4; border: 1.5px solid #22c55e; border-radius: 10px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #166534; font-weight: 800;">
                <i class="fa-solid fa-satellite-dish text-green"></i> Scout Seviyesi: ${scoutLvl} / 5 (${scoutLvl === 1 ? 'Temel Gözlem' : scoutLvl === 2 ? 'Bölgesel Scout' : scoutLvl === 3 ? 'Ulusal Ağ' : scoutLvl === 4 ? 'Global Analiz' : 'Dünya Çapı AI Scout'})
            </div>
            ${discountPercent > 0 ? `<span style="background: #16a34a; color: #fff; font-size: 0.75rem; font-weight: 900; padding: 3px 8px; border-radius: 12px;">-%${discountPercent} Transfer İndirimi Aktif</span>` : ''}
        </div>
    `;

    if (list.length === 0) {
        grid.innerHTML = scoutHeaderBadge + `
            <div class="market-empty-state" style="grid-column: 1 / -1;">
                <i class="fa-solid fa-store-slash"></i>
                <h4>Bu mevkide satılık oyuncu kalmadı!</h4>
                <p>Üstteki Yenile butonuna basarak scout ekibine yeni liste hazırlatabilirsiniz.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = scoutHeaderBadge + list.map((p) => {
        const origIdx = tycoonState.marketItems.findIndex(item => item.id === p.id);
        const baseCost = p.rating * p.rating * 4;
        const buyCost = Math.round(baseCost * (1 - discountRate));
        const canBuy = tycoonState.money >= buyCost;
        const tier = p.rating >= 86 ? 'legend' : p.rating >= 78 ? 'gold' : p.rating >= 70 ? 'silver' : 'bronze';
        const hasImg = p.image_path && p.image_path.length > 5;

        return `
            <div class="pro-market-card tier-${tier}">
                <div class="pro-card-top-bar">
                    <span class="pro-pos-tag">${p.position}</span>
                    <span class="pro-ovr-tag">${p.rating}</span>
                </div>
                <div class="pro-card-avatar-wrap">
                    ${hasImg ? `
                        <img src="${p.image_path}" alt="${p.name}" class="pro-card-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="pro-avatar-fallback" style="display:none;"><i class="fa-solid fa-user"></i></div>
                    ` : `
                        <div class="pro-avatar-fallback"><i class="fa-solid fa-user"></i></div>
                    `}
                </div>
                <div class="pro-card-info">
                    <h4 class="pro-player-name">${p.name}</h4>
                    <span class="pro-player-team"><i class="fa-solid fa-shield"></i> ${p.team_name || 'Süper Lig'}</span>
                </div>
                <div class="pro-card-price-box">
                    <span class="lbl">Bonservis Bedeli:</span>
                    <span class="val">${formatCurrency(buyCost)} ${discountPercent > 0 ? `<small style="font-size:0.65rem; color:#16a34a; text-decoration:none;">(-%${discountPercent})</small>` : ''}</span>
                </div>
                <button class="btn ${canBuy ? 'btn-gold' : 'btn-white disabled'} pro-btn-buy" onclick="buyMarketPlayer(${origIdx})" ${!canBuy ? 'disabled' : ''}>
                    ${canBuy ? `<i class="fa-solid fa-cart-shopping"></i> Transfer Et` : `<i class="fa-solid fa-ban"></i> Yetersiz Bakiye`}
                </button>
            </div>
        `;
    }).join('');
}

function renderMarketSellList() {
    const cont = document.getElementById("tycoon-market-sell-grid");
    if (!cont) return;

    const bench = tycoonState.bench || [];
    if (bench.length === 0) {
        cont.innerHTML = `
            <div class="market-empty-state">
                <i class="fa-solid fa-users-slash"></i>
                <h4>Yedek kulübenizde satılık oyuncu yok!</h4>
                <p>Sahadaki oyuncuları yedeğe alarak veya paket açarak transfer pazarına oyuncu sürebilirsiniz.</p>
            </div>
        `;
        return;
    }

    cont.innerHTML = bench.map((p, idx) => {
        const qsPrice = calculatePlayerQuickSellPrice(p);
        const hasImg = p.image_path && p.image_path.length > 5;

        return `
            <div class="market-sell-item">
                <div class="sell-item-left">
                    <span class="pos-badge pos-${p.position}">${p.position}</span>
                    <span class="ovr-badge">${p.rating}</span>
                    <div class="sell-meta">
                        <strong>${p.name}</strong>
                        <span>${p.team_name || 'Kulüpsüz'}</span>
                    </div>
                </div>
                <div class="sell-item-right">
                    <span class="sell-offer-tag">Teklif: <strong>+${formatCurrency(qsPrice)}</strong></span>
                    <button class="btn btn-gold btn-small" onclick="quickSellPlayer(${idx}, 'bench'); renderMarketSellList(); updateMarketBudgetDisplay();">
                        <i class="fa-solid fa-money-bill-transfer"></i> Sat (+${formatCurrency(qsPrice)})
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function buyMarketPlayer(idx) {
    const player = tycoonState.marketItems[idx];
    if (!player) return;

    const buyCost = player.rating * player.rating * 4;
    if (tycoonState.money < buyCost) {
        showTycoonToast("❌ Yetersiz bütçe!", "error");
        return;
    }

    tycoonState.money -= buyCost;
    tycoonState.marketItems.splice(idx, 1);
    tycoonState.bench.push(player);

    saveTycoonData();
    updateTycoonHUD();
    updateMarketBudgetDisplay();
    renderTransferMarket();
    renderTycoonPitchSquad();
    showTycoonToast(`✅ ${player.name} kulübünüze transfer oldu!`, "success");
}

// ==========================================
// 6. CAREER LEAGUE MATCH SIMULATION
// ==========================================
function openLeagueModal() {
    const modal = document.getElementById("tycoon-league-modal");
    if (!modal) return;

    renderLeagueOverview();
    modal.classList.remove("hidden");
}

function renderLeagueOverview() {
    const l = tycoonState.league;
    const currentLeague = TYCOON_CONFIG.leagues.find(item => item.tier === l.tier) || TYCOON_CONFIG.leagues[0];

    document.getElementById("tycoon-league-tier-name").textContent = `${currentLeague.name} (Sezon ${l.seasonNumber || 1})`;
    document.getElementById("tycoon-league-points").textContent = l.points;
    document.getElementById("tycoon-league-played").textContent = `${l.played} / 10 Maç`;
    document.getElementById("tycoon-league-record").textContent = `${l.won}G - ${l.drawn}B - ${l.lost}M`;
    document.getElementById("tycoon-league-target").textContent = `Şampiyonluk: ${currentLeague.targetPoints} Puan`;
    document.getElementById("tycoon-league-reward").textContent = `Ödül: ${formatCurrency(currentLeague.prize)} + ${currentLeague.trophy}`;

    const oppOvr = currentLeague.avgOpponentOvr;
    const myOvr = calculateSquadOverall();
    document.getElementById("tycoon-match-my-ovr").textContent = myOvr;
    document.getElementById("tycoon-match-opp-ovr").textContent = oppOvr;

    const btnPlay = document.getElementById("btn-tycoon-play-match");
    if (btnPlay) {
        if (l.played >= 10) {
            btnPlay.innerHTML = `<i class="fa-solid fa-flag-checkered"></i> SEZONU TAMAMLA VE DEĞERLENDİR`;
        } else {
            btnPlay.innerHTML = `<i class="fa-solid fa-play"></i> SIRADAKİ MAÇI OYNA (Hafta ${l.played + 1})`;
        }
    }
}

function getBuildingUpgradeRequirement(targetLevel) {
    const tierNames = ["", "Amatör Lig (Tier 1)", "3. Lig (Tier 2)", "2. Lig (Tier 3)", "1. Lig (Tier 4)", "Süper Lig & Efsaneler (Tier 5)"];
    const currentTier = (tycoonState.league && tycoonState.league.tier) || 1;
    const requiredTier = Math.min(5, Math.max(1, targetLevel));
    const isUnlocked = currentTier >= requiredTier;

    return {
        unlocked: isUnlocked,
        requiredTier,
        requiredTierName: tierNames[requiredTier] || `${requiredTier}. Lig`,
        currentTierName: tierNames[currentTier] || "Amatör Lig",
        currentTier
    };
}

function showAcademyDiscoveryModal(player, academyLvl) {
    let modal = document.getElementById("tycoon-academy-scout-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "tycoon-academy-scout-modal";
        modal.className = "tycoon-modal-overlay";
        document.body.appendChild(modal);
    }

    const tierLabels = [
        "",
        "🌱 Altyapı Çırağı (Temel Seviye)",
        "⭐ Yetenekli Genç (Gelişim Seviyesi)",
        "🔥 Geleceğin Yıldızı (Akademi Yıldızı)",
        "💎 Elit Wonderkid (Milli Takım Adayı)",
        "👑 Jenerasyonun Efsanesi (Golden Boy)"
    ];

    modal.innerHTML = `
        <div class="tycoon-modal-card academy-discovery-card">
            <div class="modal-header">
                <h3><i class="fa-solid fa-graduation-cap text-gold"></i> AKADEMİ YILDIZ KEŞFİ!</h3>
                <button class="modal-close-btn" onclick="closeTycoonModal('tycoon-academy-scout-modal')"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="academy-discovery-body" style="padding: 16px; text-align: center;">
                <div class="academy-discovery-badge" style="display:inline-block; padding: 4px 12px; background: #fef08a; border: 1.5px solid #ca8a04; border-radius: 20px; font-weight: 800; font-size: 0.82rem; margin-bottom: 10px;">
                    <i class="fa-solid fa-award text-gold"></i> ${tierLabels[academyLvl] || "Altyapı Keşfi"} (Akademi Seviye ${academyLvl})
                </div>
                <p class="academy-discovery-desc" style="font-size: 0.85rem; color: #475569; margin-bottom: 14px;">
                    Akademi antrenörleriniz ve scout ekibiniz son maçtaki performansın ardından altyapıdan yeni bir yeteneği A Takım kadrosuna kazandırdı!
                </p>
                <div class="academy-card-preview-wrap" style="display: flex; justify-content: center; margin-bottom: 14px;">
                    ${renderFutCardHTML(player, true)}
                </div>
                <div class="academy-player-stats-summary" style="display: flex; gap: 8px; justify-content: center; margin-bottom: 16px;">
                    <span class="stat-pill" style="padding: 4px 8px; background: #e2e8f0; border-radius: 6px; font-size: 0.76rem;">OVR: <strong>${player.rating}</strong></span>
                    <span class="stat-pill" style="padding: 4px 8px; background: #e2e8f0; border-radius: 6px; font-size: 0.76rem;">Pozisyon: <strong>${player.position}</strong></span>
                    <span class="stat-pill" style="padding: 4px 8px; background: #e2e8f0; border-radius: 6px; font-size: 0.76rem;">Değer: <strong>${player.market_value || '1.2M €'}</strong></span>
                </div>
                <button class="btn-shop-build ready academy-claim-btn" style="width: 100%; padding: 10px; font-size: 0.9rem;" onclick="closeTycoonModal('tycoon-academy-scout-modal'); showTycoonToast('${player.name} kadronuza eklendi!', 'success'); renderSquadView();">
                    <i class="fa-solid fa-check"></i> OYUNCUYU KADROYA DAHİL ET
                </button>
            </div>
        </div>
    `;
    modal.classList.remove("hidden");
    if (typeof playTycoonFanfareSFX === 'function') playTycoonFanfareSFX();
}

function checkAcademyYouthDiscovery() {
    const b = tycoonState.buildings || {};
    const academyLvl = b.academy || 1;

    // Altyapı geliştikçe keşif sıklığı artar (Lvl 1-2: 3 maçta bir, Lvl 3-5: 2 maçta bir)
    const freq = academyLvl >= 3 ? 2 : 3;
    if (tycoonState.stats.totalMatches % freq !== 0) return;

    if (!parsedPlayersPool || !parsedPlayersPool.all || parsedPlayersPool.all.length === 0) return;

    // Altyapı seviyesine göre genç oyuncu reyting aralığı
    let minRating = 65, maxRating = 73;
    if (academyLvl === 2) { minRating = 74; maxRating = 78; }
    else if (academyLvl === 3) { minRating = 79; maxRating = 83; }
    else if (academyLvl === 4) { minRating = 84; maxRating = 88; }
    else if (academyLvl >= 5) { minRating = 89; maxRating = 95; }

    const candidates = parsedPlayersPool.all.filter(p => p.rating >= minRating && p.rating <= maxRating);
    const poolToUse = candidates.length > 0 ? candidates : parsedPlayersPool.all;
    const selected = poolToUse[Math.floor(Math.random() * poolToUse.length)];

    if (!selected) return;

    const youthPlayer = {
        ...selected,
        id: "youth_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        isYouthProspect: true,
        academyTier: academyLvl
    };

    tycoonState.squad.push(youthPlayer);
    if (!tycoonState.bench) tycoonState.bench = [];
    tycoonState.bench.push(youthPlayer);
    saveTycoonData();
    updateTycoonHUD();

    // Sağ menüdeki Kadro kartına bildirim rozeti ekle
    const badge = document.getElementById("squad-notification-badge");
    if (badge) {
        badge.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> +1 GENÇ`;
        badge.classList.remove("hidden");
    }

    if (typeof showTycoonToast === 'function') {
        showTycoonToast(`🎓 YENİ ALTYAPI YILDIZI: ${youthPlayer.name} (${youthPlayer.position} • OVR ${youthPlayer.rating}) kadronuza dahil edildi!`, "success");
    }

    setTimeout(() => {
        showAcademyDiscoveryModal(youthPlayer, academyLvl);
    }, 1000);
}

function playTycoonLeagueMatch() {
    const l = tycoonState.league;
    const currentLeague = TYCOON_CONFIG.leagues.find(item => item.tier === l.tier) || TYCOON_CONFIG.leagues[0];

    if (l.played >= 10) {
        finishLeagueSeason();
        return;
    }

    const b = tycoonState.buildings || {};
    const myBaseOvr = calculateSquadOverall();
    
    // Tesis Güç Katkıları:
    const stadiumLvl = b.stadium || 1;
    const homeBonus = (TYCOON_CONFIG.buildings.stadium && TYCOON_CONFIG.buildings.stadium.bonus[stadiumLvl]) || 0;
    
    const medicalLvl = b.medical || 0;
    const medicalBoost = (TYCOON_CONFIG.buildings.medical && TYCOON_CONFIG.buildings.medical.recovery[medicalLvl]) ? Math.round(TYCOON_CONFIG.buildings.medical.recovery[medicalLvl] / 10) : 0;
    
    const statueLvl = b.statue || 0;
    const statueBoost = (TYCOON_CONFIG.buildings.statue && TYCOON_CONFIG.buildings.statue.moraleBonus[statueLvl]) || 0;
    
    const trackLvl = b.track || 0;
    const trackBoost = (TYCOON_CONFIG.buildings.track && TYCOON_CONFIG.buildings.track.speedBonus[trackLvl]) || 0;
    
    const poolLvl = b.pool || 0;
    const poolBoost = (TYCOON_CONFIG.buildings.pool && TYCOON_CONFIG.buildings.pool.recoveryBonus[poolLvl]) ? Math.round(TYCOON_CONFIG.buildings.pool.recoveryBonus[poolLvl] / 15) : 0;

    const totalMatchOvr = myBaseOvr + homeBonus + medicalBoost + statueBoost + trackBoost + poolBoost;
    const oppOvr = currentLeague.avgOpponentOvr + (Math.floor(Math.random() * 5) - 2);

    // Maç Günü Hasılatı (Stadyum bilet + Bistro yeme içme + Sponsorluk)
    const baseTicket = (TYCOON_CONFIG.buildings.stadium && TYCOON_CONFIG.buildings.stadium.income[stadiumLvl]) || 1500;
    const restaurantBonus = (TYCOON_CONFIG.buildings.restaurant && TYCOON_CONFIG.buildings.restaurant.passive[b.restaurant || 0]) ? TYCOON_CONFIG.buildings.restaurant.passive[b.restaurant || 0] * 20 : 0;
    const sponsorBonus = calculateMatchSponsorBonus();
    const totalMatchdayRevenue = baseTicket + restaurantBonus + sponsorBonus;

    const diff = totalMatchOvr - oppOvr;
    let myGoals = 0;
    let oppGoals = 0;

    if (diff > 5) {
        myGoals = Math.floor(Math.random() * 4) + 2;
        oppGoals = Math.floor(Math.random() * 2);
    } else if (diff >= 0) {
        myGoals = Math.floor(Math.random() * 3) + 1;
        oppGoals = Math.floor(Math.random() * 2);
    } else if (diff >= -5) {
        myGoals = Math.floor(Math.random() * 2);
        oppGoals = Math.floor(Math.random() * 3) + 1;
    } else {
        myGoals = Math.floor(Math.random() * 2);
        oppGoals = Math.floor(Math.random() * 4) + 2;
    }

    closeTycoonModal('tycoon-league-modal');
    startLiveMatchSimulation({
        homeName: tycoonState.clubName || "KULÜBÜNÜZ",
        awayName: currentLeague.name + " Temsilcisi",
        homeOvr: totalMatchOvr,
        awayOvr: oppOvr,
        targetHomeGoals: myGoals,
        targetAwayGoals: oppGoals,
        matchRevenue: totalMatchdayRevenue,
        facilityBoosts: {
            stadium: homeBonus,
            statue: statueBoost,
            track: trackBoost,
            medical: medicalBoost
        },
        onComplete: function() {
            l.played++;
            l.goalsFor += myGoals;
            l.goalsAgainst += oppGoals;
            tycoonState.stats.totalMatches++;

            tycoonState.money += totalMatchdayRevenue;
            tycoonState.stats.totalEarned += totalMatchdayRevenue;

            let resultMsg = "";
            if (myGoals > oppGoals) {
                l.won++;
                l.points += 3;
                tycoonState.fans += Math.floor(Math.random() * 35) + 20;
                resultMsg = `🎉 GALİBİYET! (${myGoals} - ${oppGoals}) +3 Puan | Toplam Hasılat: +${formatCurrency(totalMatchdayRevenue)}`;
                updateQuestProgress('win', 1);
            } else if (myGoals === oppGoals) {
                l.drawn++;
                l.points += 1;
                tycoonState.fans += Math.floor(Math.random() * 12) + 5;
                resultMsg = `🤝 BERABERLİK! (${myGoals} - ${oppGoals}) +1 Puan | Toplam Hasılat: +${formatCurrency(totalMatchdayRevenue)}`;
            } else {
                l.lost++;
                resultMsg = `💔 MAĞLUBİYET! (${myGoals} - ${oppGoals}) | Toplam Hasılat: +${formatCurrency(totalMatchdayRevenue)}`;
            }

            updateQuestProgress('goals', myGoals);
            if (oppGoals === 0) updateQuestProgress('clean_sheet', 1);

            saveTycoonData();
            updateTycoonHUD();
            renderLeagueOverview();
            showTycoonToast(resultMsg, myGoals > oppGoals ? "success" : myGoals === oppGoals ? "info" : "error");

            // Altyapı Genç Oyuncu Keşfini Tetikle
            checkAcademyYouthDiscovery();
        }
    });
}

function finishLeagueSeason() {
    const l = tycoonState.league;
    const currentLeague = TYCOON_CONFIG.leagues.find(item => item.tier === l.tier) || TYCOON_CONFIG.leagues[0];
    const isChampion = l.points >= currentLeague.targetPoints;

    if (isChampion) {
        tycoonState.money += currentLeague.prize;
        tycoonState.stats.totalEarned += currentLeague.prize;
        tycoonState.stats.totalTrophies = (tycoonState.stats.totalTrophies || 0) + 1;
        tycoonState.fans += 500;

        let nextMsg = "";
        if (l.tier < 5) {
            l.tier++;
            const nextL = TYCOON_CONFIG.leagues.find(item => item.tier === l.tier);
            nextMsg = `🏆 ŞAMPİYONLUK! ${currentLeague.trophy} kazanıldı! +${formatCurrency(currentLeague.prize)} prim ve ${nextL.name}'e yükseldiniz! Yeni tesis seviyelerinin kilitleri açıldı!`;
        } else {
            nextMsg = `👑 EFSANELER ŞAMPİYONU! +${formatCurrency(currentLeague.prize)} prim kazandınız!`;
        }

        showTycoonToast(nextMsg, "success");
    } else {
        showTycoonToast(`Sezon Tamamlandı. ${l.points} puan toplandı (Şampiyonluk Hedefi: ${currentLeague.targetPoints}). Gelecek sezon yeniden deneyin!`, "info");
    }

    l.played = 0;
    l.won = 0;
    l.drawn = 0;
    l.lost = 0;
    l.points = 0;
    l.goalsFor = 0;
    l.goalsAgainst = 0;
    l.seasonNumber = (l.seasonNumber || 1) + 1;

    saveTycoonData();
    updateTycoonHUD();
    renderLeagueOverview();
}

// ==========================================
// 7. ONLINE LEADERBOARD & SYNC
// ==========================================
async function openOnlineLeaderboardModal() {
    const modal = document.getElementById("tycoon-leaderboard-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    await fetchOnlineLeaderboard();
}

async function fetchOnlineLeaderboard() {
    const tbody = document.getElementById("tycoon-leaderboard-body");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Sıralama yükleniyor...</td></tr>`;

    try {
        const res = await fetch("api.php?action=get_tycoon_leaderboard");
        const json = await res.json();

        if (json.success && json.data && json.data.leaderboard) {
            renderLeaderboardTable(json.data.leaderboard);
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: #888;">Henüz kayıt bulunamadı.</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: #e63946;">Sıralama verileri alınamadı.</td></tr>`;
    }
}

function renderLeaderboardTable(list) {
    const tbody = document.getElementById("tycoon-leaderboard-body");
    if (!tbody) return;

    tbody.innerHTML = "";
    list.forEach((item, index) => {
        const tr = document.createElement("tr");
        const rankMedal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
        const isMyClub = item.clubName === tycoonState.clubName;

        if (isMyClub) tr.className = "my-club-row";

        tr.innerHTML = `
            <td><strong>${rankMedal}</strong></td>
            <td><strong>${item.clubName}</strong><div style="font-size:0.75rem; color:#888;">${item.managerName || "Menajer"}</div></td>
            <td><span class="badge-ovr">${item.teamOvr || 60}</span></td>
            <td>${item.leagueName || "Amatör Lig"}</td>
            <td><i class="fa-solid fa-trophy text-gold"></i> ${item.trophies || 0}</td>
            <td><strong>${formatCurrency(item.clubValue || 0)}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

async function syncMyClubToLeaderboard() {
    const btn = document.getElementById("btn-tycoon-sync-rank");
    if (btn) btn.disabled = true;

    const clubValue = tycoonState.money + (tycoonState.stats.totalEarned || 0);
    const teamOvr = calculateSquadOverall();
    const currentLeague = TYCOON_CONFIG.leagues.find(l => l.tier === tycoonState.league.tier) || TYCOON_CONFIG.leagues[0];

    try {
        const res = await fetch("api.php?action=save_tycoon_rank", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                clubName: tycoonState.clubName,
                managerName: tycoonState.managerName,
                clubValue: clubValue,
                teamOvr: teamOvr,
                trophies: tycoonState.stats.totalTrophies || 0,
                leagueTier: tycoonState.league.tier || 1,
                leagueName: currentLeague.name
            })
        });

        const json = await res.json();
        if (json.success) {
            showTycoonToast("🌟 Kulübünüz online listeye kaydedildi!", "success");
            fetchOnlineLeaderboard();
        }
    } catch (e) {
        showTycoonToast("❌ Bağlantı hatası.", "error");
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ==========================================
// 8. HELPERS & HUD UPDATER
// ==========================================
function updateTycoonHUD(full = true) {
    const elMoney = document.getElementById("tycoon-hud-money");
    const elPerSec = document.getElementById("tycoon-hud-persec");
    const elFans = document.getElementById("tycoon-hud-fans");
    const elOvr = document.getElementById("tycoon-hud-ovr");
    const elLeague = document.getElementById("tycoon-hud-league");
    const elClubTitle = document.getElementById("tycoon-club-name-title");

    const shopLvl = (tycoonState.buildings && tycoonState.buildings.fanshop) || 1;
    const perSec = (TYCOON_CONFIG.buildings.fanshop && TYCOON_CONFIG.buildings.fanshop.passive[shopLvl]) || 10;
    const teamOvr = calculateSquadOverall();

    if (elMoney) elMoney.textContent = formatCurrency(tycoonState.money);
    if (elPerSec) elPerSec.textContent = `+${formatCurrency(perSec)}/s`;
    if (elFans) elFans.textContent = tycoonState.fans.toLocaleString();
    if (elOvr) elOvr.textContent = teamOvr;
    if (elClubTitle) elClubTitle.textContent = tycoonState.clubName;

    const currentLeague = TYCOON_CONFIG.leagues.find(l => l.tier === tycoonState.league.tier) || TYCOON_CONFIG.leagues[0];
    if (elLeague) elLeague.textContent = currentLeague.name;

    const elFormation = document.getElementById("select-tycoon-formation");
    if (elFormation) elFormation.value = tycoonState.formation || "4-4-2";
}

function calculateSquadOverall() {
    if (!tycoonState.lineup || tycoonState.lineup.length === 0) return 60;
    const sum = tycoonState.lineup.reduce((acc, p) => acc + (p.rating || 60), 0);
    const baseOvr = Math.round(sum / tycoonState.lineup.length);
    const clubHqLvl = (tycoonState.buildings && tycoonState.buildings.clubhq) || 1;
    const hqBoost = (TYCOON_CONFIG.buildings.clubhq && TYCOON_CONFIG.buildings.clubhq.teamBoost[clubHqLvl]) || 0;
    return baseOvr + hqBoost;
}

function formatCurrency(amount) {
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + "M €";
    if (amount >= 1000) return (amount / 1000).toFixed(1) + "K €";
    return Math.floor(amount).toLocaleString() + " €";
}

function closeTycoonModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add("hidden");
}

function openClubSettingsModal() {
    const modal = document.getElementById("tycoon-club-settings-modal");
    if (!modal) return;
    document.getElementById("input-tycoon-club-name").value = tycoonState.clubName;
    document.getElementById("input-tycoon-manager-name").value = tycoonState.managerName;
    modal.classList.remove("hidden");
}

function saveClubSettings() {
    const cName = document.getElementById("input-tycoon-club-name").value.trim();
    const mName = document.getElementById("input-tycoon-manager-name").value.trim();
    if (cName.length < 3) {
        showTycoonToast("Kulüp adı en az 3 harf olmalı.", "error");
        return;
    }
    tycoonState.clubName = cName;
    tycoonState.managerName = mName;
    saveTycoonData();
    updateTycoonHUD();
    closeTycoonModal("tycoon-club-settings-modal");
    showTycoonToast("Kulüp adı güncellendi!", "success");
}

function showTycoonToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `tycoon-toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid fa-bell"></i> ${message}`;

    const container = document.getElementById("tycoon-toast-container") || document.body;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

function openResetTycoonModal() {
    const modal = document.getElementById("tycoon-reset-modal");
    if (modal) modal.classList.remove("hidden");
}

function executeResetTycoonCareer() {
    // Tüm açık Tycoon pencerelerini kapat
    [
        "tycoon-reset-modal",
        "tycoon-club-settings-modal",
        "tycoon-squad-modal",
        "tycoon-league-modal",
        "tycoon-training-modal",
        "tycoon-facilities-modal",
        "tycoon-store-modal",
        "tycoon-market-modal",
        "tycoon-pack-modal"
    ].forEach(id => closeTycoonModal(id));

    // State'i sıfırla
    tycoonState = {
        hasOpenedStarterPack: false,
        clubName: "Nostalji FK",
        managerName: "Teknik Direktör",
        formation: "4-4-2",
        money: 4500,
        fans: 150,
        lastSaveTime: Date.now(),
        buildings: {
            stadium: 1
        },
        city: {
            initialized: true,
            lands: [0],
            placedBuildings: [
                { id: 'b_stadium_' + Date.now().toString(36), type: 'stadium', x: 7, y: 7, rotation: 0, level: 1 }
            ],
            roads: []
        },
        lineup: [],
        bench: [],
        marketItems: [],
        marketRefreshTime: 0,
        league: {
            tier: 1,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            seasonNumber: 1
        },
        stats: {
            totalMatches: 0,
            totalTrophies: 0,
            totalPacksOpened: 0,
            totalEarned: 4500
        }
    };

    saveTycoonData();

    // City Builder sıfırla
    if (typeof CityBuilder !== 'undefined' && CityBuilder.resetCity) {
        CityBuilder.resetCity();
    }

    // Taktik diziliş seçimini güncelle
    const formSelect = document.getElementById("select-tycoon-formation");
    if (formSelect) formSelect.value = "4-4-2";

    // Görünümü taktik sahasına çek
    switchTycoonView("pitch");

    // UI bileşenlerini güncelle
    updateTycoonHUD();
    renderTycoonPitchSquad();
    renderTycoonCity();

    showTycoonToast("Kariyer sıfırlandı! Yeni kulübünüz başlatılıyor.", "info");

    // Başlangıç paketi ekranını getir
    setTimeout(() => {
        showStarterPackPrompt();
    }, 450);
}

// ==========================================
// 8. OYUNCU GELİŞTİRME & ANTRENMAN (TRAINING)
// ==========================================
function openTrainingModal() {
    const modal = document.getElementById("tycoon-training-modal");
    if (!modal) return;

    renderTrainingPlayerList();
    modal.classList.remove("hidden");
}

function renderTrainingPlayerList() {
    const cont = document.getElementById("tycoon-training-players-list");
    if (!cont) return;

    if (!tycoonState.lineup || tycoonState.lineup.length === 0) {
        cont.innerHTML = `<p style="color:#888; text-align:center;">Geliştirilecek oyuncu bulunamadı.</p>`;
        return;
    }

    const trainingFacilityLvl = (tycoonState.buildings && tycoonState.buildings.training) || 1;
    const discount = TYCOON_CONFIG.buildings.training.discount[trainingFacilityLvl] || 0;

    cont.innerHTML = tycoonState.lineup.map((p, idx) => {
        // Maliyet hesaplama
        const baseCost = Math.round(p.rating * p.rating * 2.2);
        const trainCost = Math.round(baseCost * (1 - discount));
        const canAfford = tycoonState.money >= trainCost;
        const isMaxed = p.rating >= 99;

        return `
            <div class="squad-list-item training-item-row">
                <span class="pos-badge">${p.position}</span>
                <span class="ovr-badge">${p.rating}</span>
                <div class="meta">
                    <strong>${p.name}</strong>
                    <span>${p.team_name} • Mevcut Güç: ${p.rating} OVR</span>
                </div>
                <div>
                    ${isMaxed ? `
                        <span class="max-badge"><i class="fa-solid fa-crown"></i> MAX OVR</span>
                    ` : `
                        <button class="btn btn-gold btn-small ${!canAfford ? 'disabled' : ''}" onclick="trainPlayerInLineup(${idx})" ${!canAfford ? 'disabled' : ''}>
                            <i class="fa-solid fa-dumbbell"></i> +1 OVR (${formatCurrency(trainCost)})
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function trainPlayerInLineup(idx) {
    const player = tycoonState.lineup[idx];
    if (!player) return;

    if (player.rating >= 99) {
        showTycoonToast("Bu oyuncu maksimum güce (99 OVR) ulaştı!", "info");
        return;
    }

    const trainingFacilityLvl = (tycoonState.buildings && tycoonState.buildings.training) || 1;
    const discount = TYCOON_CONFIG.buildings.training.discount[trainingFacilityLvl] || 0;
    const baseCost = Math.round(player.rating * player.rating * 2.2);
    const trainCost = Math.round(baseCost * (1 - discount));

    if (tycoonState.money < trainCost) {
        showTycoonToast("Antrenman için yeterli paranız yok!", "error");
        return;
    }

    tycoonState.money -= trainCost;
    player.rating += 1;
    player.market_value_numeric = (player.market_value_numeric || 500000) * 1.15;
    player.market_value = (player.market_value_numeric / 1000000).toFixed(2) + " mil. €";

    saveTycoonData();
    updateTycoonHUD();
    renderTycoonPitchSquad();
    renderTrainingPlayerList();
    showTycoonToast(`⚡ ${player.name} seviye atladı! Yeni OVR: ${player.rating}`, "success");
}

function trainAllLineup() {
    if (!tycoonState.lineup || tycoonState.lineup.length === 0) return;

    const trainingFacilityLvl = (tycoonState.buildings && tycoonState.buildings.training) || 1;
    const discount = TYCOON_CONFIG.buildings.training.discount[trainingFacilityLvl] || 0;

    let totalCost = 0;
    let trainableCount = 0;

    tycoonState.lineup.forEach(p => {
        if (p.rating < 99) {
            const baseCost = Math.round(p.rating * p.rating * 2.2);
            totalCost += Math.round(baseCost * (1 - discount));
            trainableCount++;
        }
    });

    if (trainableCount === 0) {
        showTycoonToast("Tüm takım zaten maksimum seviyede!", "info");
        return;
    }

    if (tycoonState.money < totalCost) {
        showTycoonToast(`Tüm takımı çalıştırmak için ${formatCurrency(totalCost)} gerekiyor. Yetersiz bakiye!`, "error");
        return;
    }

    tycoonState.money -= totalCost;
    tycoonState.lineup.forEach(p => {
        if (p.rating < 99) {
            p.rating += 1;
            p.market_value_numeric = (p.market_value_numeric || 500000) * 1.15;
            p.market_value = (p.market_value_numeric / 1000000).toFixed(2) + " mil. €";
        }
    });

    saveTycoonData();
    updateTycoonHUD();
    renderTycoonPitchSquad();
    renderTrainingPlayerList();
    showTycoonToast(`🔥 Tüm takım yoğun kampa girdi! İlk 11 +1 OVR kazandı!`, "success");
}

// ==========================================
// 9. İZOMETRİK KULÜP ŞEHRİ & GÖRSEL TESİSLER (CITY CAMPUS)
// ==========================================
function renderTycoonCity() {
    // Canvas tabanlı izometrik şehir motoru
    if (typeof CityBuilder !== 'undefined') {
        if (!CityBuilder.isInitialized()) {
            CityBuilder.init();
        } else {
            CityBuilder.resize();
            CityBuilder.refresh();
        }
    }
}

// openBuildingUpgradeModal artık CityBuilder tarafından yönetiliyor
// Eski fonksiyon geriye uyumluluk için korundu
function openBuildingUpgradeModal(key) {
    // CityBuilder popup sistemi ile değiştirildi
    if (typeof CityBuilder !== 'undefined') {
        switchTycoonView('city');
    }
}

// upgradeCityBuilding artık CityBuilder.upgrade() tarafından yönetiliyor
function upgradeCityBuilding(key) {
    if (typeof CityBuilder !== 'undefined') {
        // CityBuilder üzerinden yükseltme
        const cityData = tycoonState.city;
        if (cityData && cityData.placedBuildings) {
            const building = cityData.placedBuildings.find(b => b.type === key);
            if (building) {
                CityBuilder.upgrade(building.id);
                return;
            }
        }
    }
    // Fallback: eski sistem
    const cfg = TYCOON_CONFIG.buildings[key];
    if (!cfg) return;
    const curLvl = (tycoonState.buildings && tycoonState.buildings[key]) || 1;
    if (curLvl >= cfg.maxLevel) return;
    const nextCost = cfg.costs[curLvl];
    if (tycoonState.money < nextCost) return;
    tycoonState.money -= nextCost;
    if (!tycoonState.buildings) tycoonState.buildings = {};
    tycoonState.buildings[key] = curLvl + 1;
    saveTycoonData();
    updateTycoonHUD();
}

function switchTycoonView(viewType) {
    const pitchPanel = document.getElementById("tycoon-view-pitch");
    const cityPanel = document.getElementById("tycoon-view-city");
    const btnPitch = document.getElementById("btn-nav-pitch");
    const btnCity = document.getElementById("btn-nav-city");

    if (viewType === 'city') {
        if (pitchPanel) pitchPanel.classList.add("hidden");
        if (cityPanel) cityPanel.classList.remove("hidden");
        if (btnPitch) btnPitch.classList.remove("active");
        if (btnCity) btnCity.classList.add("active");

        // CityBuilder başlat veya yeniden boyutlandır
        setTimeout(() => {
            renderTycoonCity();
        }, 50);
    } else {
        // City builder'dan çıkarken iptal et
        if (typeof CityBuilder !== 'undefined' && CityBuilder.cancelAction) {
            CityBuilder.cancelAction();
        }
        if (cityPanel) cityPanel.classList.add("hidden");
        if (pitchPanel) pitchPanel.classList.remove("hidden");
        if (btnCity) btnCity.classList.remove("active");
        if (btnPitch) btnPitch.classList.add("active");
        renderTycoonPitchSquad();
    }
}

function openFacilitiesModal() {
    switchTycoonView('city');
}

function toggleTycoonSidebar() {
    const cockpit = document.querySelector('.tycoon-split-cockpit');
    if (!cockpit) return;

    cockpit.classList.toggle('sidebar-collapsed');

    // Ekran genişleyince canvas'ı otomatik yeniden boyutlandır
    setTimeout(() => {
        if (typeof CityBuilder !== 'undefined' && CityBuilder.resize) {
            CityBuilder.resize();
            CityBuilder.refresh();
        }
    }, 60);
}

// ============================================================
// 10. LIVE MATCH SIMULATOR & RADAR COMMENTARY ENGINE
// ============================================================
let liveMatchState = {
    running: false,
    timer: null,
    minute: 0,
    speed: 1, // 1x, 2x, 4x
    cfg: null,
    homeScore: 0,
    awayScore: 0,
    events: [],
    homeDots: [],
    awayDots: []
};

function getRealisticHomeScorer() {
    const lineup = tycoonState.lineup || [];
    const fws = lineup.filter(p => p.position === 'FW');
    const mfs = lineup.filter(p => p.position === 'MF');
    const dfs = lineup.filter(p => p.position === 'DF');

    const roll = Math.random();
    let scorer = null;
    let descType = "shot";

    if (roll < 0.75 && fws.length > 0) {
        scorer = fws[Math.floor(Math.random() * fws.length)];
        descType = "forward";
    } else if (roll < 0.95 && mfs.length > 0) {
        scorer = mfs[Math.floor(Math.random() * mfs.length)];
        descType = "midfield";
    } else if (dfs.length > 0) {
        scorer = dfs[Math.floor(Math.random() * dfs.length)];
        descType = "header";
    } else {
        const outfields = lineup.filter(p => p.position !== 'GK');
        scorer = outfields.length > 0 ? outfields[Math.floor(Math.random() * outfields.length)] : { name: "Forvet Yıldızı", position: "FW" };
        descType = "forward";
    }

    // Kaleci asla gol atamaz
    if (scorer.position === 'GK') {
        const f = fws[0] || mfs[0] || dfs[0];
        if (f) scorer = f;
    }

    return { player: scorer, type: descType };
}

function startLiveMatchSimulation(cfg) {
    liveMatchState.cfg = cfg;
    liveMatchState.minute = 0;
    liveMatchState.homeScore = 0;
    liveMatchState.awayScore = 0;
    liveMatchState.speed = 1;
    liveMatchState.running = true;

    const modal = document.getElementById("tycoon-live-match-modal");
    if (!modal) return;

    document.getElementById("live-match-home-name").textContent = cfg.homeName || "KULÜBÜNÜZ";
    document.getElementById("live-match-away-name").textContent = cfg.awayName || "LİG RAKİBİ";
    document.getElementById("live-match-home-ovr").textContent = cfg.homeOvr || 75;
    document.getElementById("live-match-away-ovr").textContent = cfg.awayOvr || 70;
    document.getElementById("live-score-home").textContent = "0";
    document.getElementById("live-score-away").textContent = "0";
    document.getElementById("live-match-clock").textContent = "00'";

    const feed = document.getElementById("live-commentary-feed");
    if (feed) feed.innerHTML = "";

    const banner = document.getElementById("live-facility-text");
    if (banner) {
        if (cfg.facilityBoosts.stadium > 0) banner.textContent = `🏟️ Stadyum Coşkusu: Ev sahibi taraftar uğultusu takımı ateşliyor!`;
        else if (cfg.facilityBoosts.statue > 0) banner.textContent = `🗽 Efsane Heykeli: Takım sahaya yüksek moralle çıktı!`;
        else banner.textContent = `⚽ Hakem düdüğü çaldı, maç başladı!`;
    }

    addLiveCommentary(0, `📢 Karşılaşma başladı! Takımımız galibiyet parolasıyla sahaya yerleşti.`, "highlight");
    modal.classList.remove("hidden");

    // Gol dakikalarını hazırla
    liveMatchState.events = [];
    const homeGoals = cfg.targetHomeGoals || 0;
    const awayGoals = cfg.targetAwayGoals || 0;

    for (let i = 0; i < homeGoals; i++) {
        liveMatchState.events.push({
            min: Math.floor(Math.random() * 80) + 8,
            type: "home_goal"
        });
    }
    for (let i = 0; i < awayGoals; i++) {
        liveMatchState.events.push({
            min: Math.floor(Math.random() * 80) + 8,
            type: "away_goal"
        });
    }

    scheduleNextLiveMatchTick();
}

function setLiveMatchSpeed(s) {
    liveMatchState.speed = s;
    const btn1 = document.getElementById("btn-speed-1x");
    const btn2 = document.getElementById("btn-speed-2x");
    const btn4 = document.getElementById("btn-speed-4x");
    if (btn1) btn1.className = `btn-speed ${s === 1 ? 'active' : ''}`;
    if (btn2) btn2.className = `btn-speed ${s === 2 ? 'active' : ''}`;
    if (btn4) btn4.className = `btn-speed ${s === 4 ? 'active' : ''}`;
}

function scheduleNextLiveMatchTick() {
    if (!liveMatchState.running) return;
    const interval = Math.max(90, Math.round(500 / (liveMatchState.speed || 1)));
    liveMatchState.timer = setTimeout(liveMatchTick, interval);
}

function liveMatchTick() {
    if (!liveMatchState.running) return;

    liveMatchState.minute += Math.floor(Math.random() * 2) + 2;
    if (liveMatchState.minute > 90) liveMatchState.minute = 90;

    const elClock = document.getElementById("live-match-clock");
    if (elClock) elClock.textContent = `${liveMatchState.minute < 10 ? '0' : ''}${liveMatchState.minute}'`;

    const currentEvents = liveMatchState.events.filter(e => !e.triggered && e.min <= liveMatchState.minute);

    if (currentEvents.length > 0) {
        currentEvents.forEach(e => {
            e.triggered = true;
            if (e.type === "home_goal") {
                liveMatchState.homeScore++;
                document.getElementById("live-score-home").textContent = liveMatchState.homeScore;

                const scorerData = getRealisticHomeScorer();
                const scorer = scorerData.player;

                let goalText = `⚽ GOOOOOLLL! ${scorer.name} ceza sahası köşesinden müthiş bir vuruşla topu ağlara gönderdi!`;
                if (scorerData.type === 'midfield') {
                    goalText = `⚽ GOOOOOLLL! ${scorer.name} ceza sahası dışından sert bir füzeyle kaleciyi avladı!`;
                } else if (scorerData.type === 'header') {
                    goalText = `⚽ GOOOOOLLL! Köşe vuruşunda iyi yükselen defans oyuncumuz ${scorer.name} kafayla topu filelere yolladı!`;
                }

                addLiveCommentary(liveMatchState.minute, goalText, "goal");
                if (typeof playTycoonBoomSFX === 'function') playTycoonBoomSFX();
            } else if (e.type === "away_goal") {
                liveMatchState.awayScore++;
                document.getElementById("live-score-away").textContent = liveMatchState.awayScore;
                addLiveCommentary(liveMatchState.minute, `⚠️ GOL! Rakip forvet defans arkasına sızarak topu ağlarımıza gönderdi.`, "goal-away");
            }
        });
    } else {
        if (liveMatchState.minute % 14 <= 2) {
            const gk = (tycoonState.lineup && tycoonState.lineup.find(p => p.position === 'GK')) || { name: "Kalecimiz" };
            const commentaryTexts = [
                `🏃 Koşu pisti hız avantajıyla hızlı kanat hücumuna çıktık, rakip defans son anda kornere attı.`,
                `🧤 ${gk.name} kalesinde devleşti! Karşı karşıya pozisyonda topu mükemmel çıkardı!`,
                `💥 Ceza sahası dışından sert şut! Kaleci güçlükle tokatladı.`,
                `🛡️ Savunma hattımız rakibin tehlikeli kontrasını kritik bir kademeyle kesti.`,
                `🏟️ Tribünlerden müthiş bir tezahürat yükseliyor! Takım baskıyı artırdı.`
            ];
            const randomText = commentaryTexts[Math.floor(Math.random() * commentaryTexts.length)];
            addLiveCommentary(liveMatchState.minute, randomText, "normal");
        }
    }

    if (liveMatchState.minute >= 90) {
        endLiveMatch();
    } else {
        scheduleNextLiveMatchTick();
    }
}

function addLiveCommentary(min, text, type = "normal") {
    const feed = document.getElementById("live-commentary-feed");
    if (!feed) return;

    const div = document.createElement("div");
    div.className = `commentary-item ${type}`;
    div.innerHTML = `<span class="min-badge">${min}'</span> <span>${text}</span>`;
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;
}

function skipLiveMatchToEnd() {
    if (!liveMatchState.running) return;
    clearTimeout(liveMatchState.timer);
    liveMatchState.minute = 90;
    document.getElementById("live-match-clock").textContent = "90'";

    // Tüm golleri tamamla
    liveMatchState.homeScore = liveMatchState.cfg.targetHomeGoals || 0;
    liveMatchState.awayScore = liveMatchState.cfg.targetAwayGoals || 0;
    document.getElementById("live-score-home").textContent = liveMatchState.homeScore;
    document.getElementById("live-score-away").textContent = liveMatchState.awayScore;

    addLiveCommentary(90, `🏁 Maç sona erdi! Karşılaşma ${liveMatchState.homeScore} - ${liveMatchState.awayScore} tamamlandı.`, "highlight");
    endLiveMatch();
}

function endLiveMatch() {
    liveMatchState.running = false;
    clearTimeout(liveMatchState.timer);

    setTimeout(() => {
        closeTycoonModal("tycoon-live-match-modal");
        if (liveMatchState.cfg && typeof liveMatchState.cfg.onComplete === 'function') {
            liveMatchState.cfg.onComplete();
        }
    }, 1500);
}

// ============================================================
// 11. PLAYER TRAINING & XP PROGRESSION ENGINE
// ============================================================
function openTrainingModal() {
    const modal = document.getElementById("tycoon-training-modal");
    if (!modal) return;

    renderTrainingView();
    modal.classList.remove("hidden");
}

function renderTrainingView() {
    const list = document.getElementById("tycoon-training-players-list");
    const summary = document.getElementById("training-facility-summary");
    if (!list) return;

    const b = tycoonState.buildings || {};
    const trainLvl = b.training || 1;
    const trackLvl = b.track || 0;
    const poolLvl = b.pool || 0;

    const trainCfg = TYCOON_CONFIG.buildings.training;
    const discountRate = (trainCfg && trainCfg.discount[trainLvl]) ? trainCfg.discount[trainLvl] : 0;
    const discountPercent = Math.round(discountRate * 100);

    if (summary) {
        summary.innerHTML = `
            <div>
                <strong style="color: #166534; font-size: 0.88rem;"><i class="fa-solid fa-dumbbell"></i> Antrenman Kompleksi (Seviye ${trainLvl}/5)</strong>
                <p style="margin: 2px 0 0; font-size: 0.76rem; color: #475569;">
                    -%${discountPercent} Gelişim İndirimi • Koşu Pisti: +${trackLvl} Hız • Havuz: +%${poolLvl * 15} Rejenerasyon
                </p>
            </div>
            <span style="background: #22c55e; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 900;">
                KASA: ${formatCurrency(tycoonState.money)}
            </span>
        `;
    }

    const allPlayers = [...(tycoonState.lineup || []), ...(tycoonState.bench || [])];
    if (allPlayers.length === 0) {
        list.innerHTML = `<p style="padding: 20px; text-align: center; color: #64748b;">Kadronuzda antrenman yapacak oyuncu bulunamadı.</p>`;
        return;
    }

    list.innerHTML = allPlayers.map(p => {
        const baseTrainCost = p.rating * p.rating * 2;
        const actualCost = Math.round(baseTrainCost * (1 - discountRate));
        const canTrain = tycoonState.money >= actualCost && p.rating < 98;

        return `
            <div class="train-player-item">
                <div class="train-p-left">
                    <div class="train-p-ovr">${p.rating}</div>
                    <div class="train-p-info">
                        <h5>${p.name}</h5>
                        <span class="pos">${p.position} • ${p.team_name || 'Kulüp Yıldızı'}</span>
                    </div>
                </div>
                <button class="btn-do-train ${!canTrain ? 'disabled' : ''}" onclick="trainSinglePlayer('${p.id}')" ${!canTrain ? 'disabled' : ''}>
                    ${p.rating >= 98 ? 'MAX' : `<i class="fa-solid fa-arrow-up"></i> Geliştir (${formatCurrency(actualCost)})`}
                </button>
            </div>
        `;
    }).join('');
}

function trainSinglePlayer(playerId) {
    const allPlayers = [...(tycoonState.lineup || []), ...(tycoonState.bench || [])];
    const p = allPlayers.find(item => item.id === playerId);
    if (!p) return;

    const b = tycoonState.buildings || {};
    const trainLvl = b.training || 1;
    const discountRate = (TYCOON_CONFIG.buildings.training && TYCOON_CONFIG.buildings.training.discount[trainLvl]) ? TYCOON_CONFIG.buildings.training.discount[trainLvl] : 0;
    const cost = Math.round(p.rating * p.rating * 2 * (1 - discountRate));

    if (tycoonState.money < cost) {
        showTycoonToast(`❌ Antrenman için ${formatCurrency(cost)} bakiye gerekli!`, "error");
        return;
    }

    tycoonState.money -= cost;
    p.rating = Math.min(99, p.rating + 1);
    saveTycoonData();
    updateTycoonHUD();
    renderTrainingView();
    renderTycoonPitchSquad();
    showTycoonToast(`⚡ ${p.name} antrenmanı tamamladı ve OVR ${p.rating}'e yükseldi!`, "success");
    if (typeof playTycoonFanfareSFX === 'function') playTycoonFanfareSFX();
}

function trainAllLineup() {
    const lineup = tycoonState.lineup || [];
    if (lineup.length === 0) return;

    const b = tycoonState.buildings || {};
    const trainLvl = b.training || 1;
    const discountRate = (TYCOON_CONFIG.buildings.training && TYCOON_CONFIG.buildings.training.discount[trainLvl]) ? TYCOON_CONFIG.buildings.training.discount[trainLvl] : 0;

    let totalCost = 0;
    lineup.forEach(p => {
        totalCost += Math.round(p.rating * p.rating * 2 * (1 - discountRate));
    });

    if (tycoonState.money < totalCost) {
        showTycoonToast(`❌ Tüm 11'i çalıştırmak için ${formatCurrency(totalCost)} gerekiyor!`, "error");
        return;
    }

    tycoonState.money -= totalCost;
    lineup.forEach(p => {
        p.rating = Math.min(99, p.rating + 1);
    });

    saveTycoonData();
    updateTycoonHUD();
    renderTrainingView();
    renderTycoonPitchSquad();
    showTycoonToast(`🔥 Tüm ilk 11 antrenman kampını tamamladı! Takım OVR güçlendi!`, "success");
    if (typeof playTycoonFanfareSFX === 'function') playTycoonFanfareSFX();
}

// ============================================================
// 12. CLUB QUESTS & MILESTONES ENGINE
// ============================================================
const QUEST_DEFS = [
    { id: "q_win_3", title: "3 Lig Maçı Kazan", desc: "Lig kariyerinde 3 galibiyet elde et.", target: 3, type: "win", rewardMoney: 25000, rewardFans: 100 },
    { id: "q_goals_10", title: "Gol Yağmuru (10 Gol)", desc: "Lig maçlarında toplam 10 gol kaydet.", target: 10, type: "goals", rewardMoney: 20000, rewardFans: 150 },
    { id: "q_clean_sheet_2", title: "Kaleyi Gole Kapat", desc: "2 maçta kalesinde gol görmeden kazan/berabere kal.", target: 2, type: "clean_sheet", rewardMoney: 30000, rewardFans: 200 },
    { id: "q_stadium_lvl", title: "Stadyum Büyütme", desc: "Stadyum tesisini en az 2. Seviyeye yükselt.", target: 2, type: "stadium", rewardMoney: 40000, rewardFans: 300 },
    { id: "q_academy_prospect", title: "Geleceğin Yıldızı", desc: "Akademiden en az 2 genç oyuncu yetiştir.", target: 2, type: "youth", rewardMoney: 50000, rewardFans: 400 }
];

function openQuestsModal() {
    const modal = document.getElementById("tycoon-quests-modal");
    if (!modal) return;

    renderQuestsView();
    modal.classList.remove("hidden");
}

function updateQuestProgress(type, amount = 1) {
    if (!tycoonState.questProgress) tycoonState.questProgress = {};
    tycoonState.questProgress[type] = (tycoonState.questProgress[type] || 0) + amount;
    saveTycoonData();
}

function renderQuestsView() {
    const cont = document.getElementById("tycoon-quests-list");
    if (!cont) return;

    const prog = tycoonState.questProgress || {};
    const claimed = tycoonState.claimedQuests || [];

    cont.innerHTML = QUEST_DEFS.map(q => {
        let current = prog[q.type] || 0;
        if (q.type === 'stadium') current = (tycoonState.buildings && tycoonState.buildings.stadium) || 1;
        
        const isDone = current >= q.target;
        const isClaimed = claimed.includes(q.id);
        const percent = Math.min(100, Math.round((current / q.target) * 100));

        return `
            <div class="quest-card ${isDone ? 'completed' : ''}">
                <div class="quest-info-block">
                    <h5>${q.title}</h5>
                    <div class="quest-progress-bg">
                        <div class="quest-progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="quest-reward-pill"><i class="fa-solid fa-gift"></i> Ödül: ${formatCurrency(q.rewardMoney)} + ${q.rewardFans} Taraftar</span>
                        <span style="font-size:0.75rem; color:#64748b; font-weight:800;">${Math.min(current, q.target)} / ${q.target}</span>
                    </div>
                </div>
                <div>
                    ${isClaimed 
                        ? `<span style="color:#16a34a; font-weight:800; font-size:0.8rem;"><i class="fa-solid fa-check-double"></i> Alındı</span>`
                        : isDone 
                            ? `<button class="btn-claim-quest" onclick="claimQuestReward('${q.id}')"><i class="fa-solid fa-gift"></i> Ödülü Al</button>`
                            : `<button class="btn-speed" disabled style="opacity:0.6;"><i class="fa-solid fa-lock"></i> Devam Ediyor</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

function claimQuestReward(questId) {
    const q = QUEST_DEFS.find(item => item.id === questId);
    if (!q) return;

    if (!tycoonState.claimedQuests) tycoonState.claimedQuests = [];
    if (tycoonState.claimedQuests.includes(questId)) return;

    tycoonState.claimedQuests.push(questId);
    tycoonState.money += q.rewardMoney;
    tycoonState.fans += q.rewardFans;
    tycoonState.stats.totalEarned += q.rewardMoney;

    saveTycoonData();
    updateTycoonHUD();
    renderQuestsView();
    showTycoonToast(`🏆 Görev Tamamlandı! +${formatCurrency(q.rewardMoney)} ve +${q.rewardFans} Taraftar kazanıldı!`, "success");
    if (typeof playTycoonFanfareSFX === 'function') playTycoonFanfareSFX();
}

// ============================================================
// 13. SPONSORSHIP DEALS & TV RIGHTS ENGINE
// ============================================================
const SPONSOR_OFFERS = [
    { id: "sp_chest", title: "Forma Göğüs Sponsorluğu", brand: "Türk Hava Yolları", icon: "fa-plane-departure", payoutPerMatch: 3500, minMediaLvl: 1 },
    { id: "sp_sleeve", title: "Kol & Şort Sponsorluğu", brand: "Trendyol Nostalji", icon: "fa-bag-shopping", payoutPerMatch: 2000, minMediaLvl: 1 },
    { id: "sp_tv", title: "TV Canlı Yayın İhalesi", brand: "beIN Sports & Digiturk", icon: "fa-tv", payoutPerMatch: 8000, minMediaLvl: 2 }
];

function openSponsorshipModal() {
    const modal = document.getElementById("tycoon-sponsorship-modal");
    if (!modal) return;

    renderSponsorshipView();
    modal.classList.remove("hidden");
}

function calculateMatchSponsorBonus() {
    const signed = tycoonState.signedSponsors || [];
    let bonus = 0;
    SPONSOR_OFFERS.forEach(sp => {
        if (signed.includes(sp.id)) {
            const mediaLvl = (tycoonState.buildings && tycoonState.buildings.media) || 1;
            bonus += sp.payoutPerMatch * mediaLvl;
        }
    });
    return bonus;
}

function renderSponsorshipView() {
    const cont = document.getElementById("tycoon-sponsorship-grid");
    if (!cont) return;

    const mediaLvl = (tycoonState.buildings && tycoonState.buildings.media) || 1;
    const signed = tycoonState.signedSponsors || [];

    cont.innerHTML = SPONSOR_OFFERS.map(sp => {
        const isSigned = signed.includes(sp.id);
        const unlocked = mediaLvl >= sp.minMediaLvl;
        const actualPayout = sp.payoutPerMatch * mediaLvl;

        return `
            <div class="sponsor-card ${isSigned ? 'signed' : ''}">
                <div>
                    <div class="sponsor-header">
                        <i class="fa-solid ${sp.icon} sponsor-icon"></i>
                        <div>
                            <h4 style="margin: 0; font-size: 0.95rem;">${sp.title}</h4>
                            <span style="font-size: 0.75rem; color: #64748b; font-weight: 700;">Partner: ${sp.brand}</span>
                        </div>
                    </div>
                    <div class="sponsor-payout">+${formatCurrency(actualPayout)} / maç</div>
                    <p style="font-size: 0.75rem; color: #475569; margin: 0 0 12px;">
                        Medya Kulesi Seviyeniz (Lvl ${mediaLvl}) ile her maç başında kulübünüze sponsorluk geliri ödenir.
                    </p>
                </div>
                <div>
                    ${isSigned 
                        ? `<div style="text-align:center; padding: 6px; background:#dcfce7; color:#15803d; border-radius:6px; font-weight:800; font-size:0.8rem;"><i class="fa-solid fa-circle-check"></i> Sözleşme İmzalandı</div>`
                        : unlocked
                            ? `<button class="btn btn-gold w-100" onclick="signSponsorshipDeal('${sp.id}')"><i class="fa-solid fa-file-signature"></i> Sözleşmeyi İmzala</button>`
                            : `<button class="btn btn-white disabled w-100" disabled><i class="fa-solid fa-lock"></i> Medya Kulesi Lvl ${sp.minMediaLvl} Gerekli</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

function signSponsorshipDeal(spId) {
    if (!tycoonState.signedSponsors) tycoonState.signedSponsors = [];
    if (!tycoonState.signedSponsors.includes(spId)) {
        tycoonState.signedSponsors.push(spId);
        saveTycoonData();
        renderSponsorshipView();
        showTycoonToast(`✍️ Sponsorluk sözleşmesi imzalandı! Her maçta ekstra prim kazanacaksınız!`, "success");
        if (typeof playTycoonFanfareSFX === 'function') playTycoonFanfareSFX();
    }
}

// ============================================================
// 14. TROPHY & HALL OF FAME MUSEUM ENGINE
// ============================================================
const TROPHY_DEFS = [
    { tier: 1, name: "Amatör Lig Kupası", desc: "Amatör küme şampiyonluk kupası" },
    { tier: 2, name: "3. Lig Kupası", desc: "TFF 3. Lig şampiyonluğu kupası" },
    { tier: 3, name: "2. Lig Kupası", desc: "TFF 2. Lig şampiyonluğu kupası" },
    { tier: 4, name: "1. Lig Kupası", desc: "TFF 1. Lig şampiyonluğu kupası" },
    { tier: 5, name: "Süper Lig & Efsaneler Kupası", desc: "Türk Futbolunun Zirve Kupası" }
];

function openMuseumModal() {
    const modal = document.getElementById("tycoon-museum-modal");
    if (!modal) return;

    renderMuseumView();
    modal.classList.remove("hidden");
}

function renderMuseumView() {
    const cont = document.getElementById("tycoon-museum-trophies-grid");
    if (!cont) return;

    const currentTier = (tycoonState.league && tycoonState.league.tier) || 1;
    const totalTrophies = (tycoonState.stats && tycoonState.stats.totalTrophies) || 0;

    cont.innerHTML = TROPHY_DEFS.map(t => {
        const isUnlocked = currentTier > t.tier || (currentTier === t.tier && totalTrophies >= t.tier);

        return `
            <div class="trophy-cup-box ${isUnlocked ? 'unlocked' : 'locked'}">
                <i class="fa-solid fa-trophy"></i>
                <h6>${t.name}</h6>
                <span style="font-size: 0.7rem; color: #64748b; margin-top: 4px;">
                    ${isUnlocked ? '🏆 Müzeye Eklendi' : '🔒 Kilitli'}
                </span>
            </div>
        `;
    }).join('');
}

