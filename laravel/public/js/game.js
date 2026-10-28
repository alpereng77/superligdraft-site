// Süper Lig Nostalji Draft - Javascript Logic

// Ses ve Oturum State
let bgMusicInterval = null;
let bgAudioCtx = null;
let isAudioMuted = false;
let isFirstClick = true;

// Oyun Verileri ve State
let database = null;
let activeFormation = "4-4-2";
let draftedPlayers = Array(11).fill(null); // 11 adet oyuncu slotu (0-10)
let selectedPlayerToPlace = null; // Seçilen ve yerleştirilmeyi bekleyen oyuncu
let rolledTeam = null; // En son zardan gelen takım bilgisi

// Turnuva State
let isTournamentMode = false;
let tournamentTeams = [];
let tournamentRound = 0; // 0: Son 16, 1: Çeyrek Final, 2: Yarı Final, 3: Final
let tournamentMatches = [[], [], [], []];
let currentOpponent = null;

// Maç Simülasyon State
let matchInterval = null;
let matchMinute = 0;
let homeScore = 0;
let awayScore = 0;
let homeScorers = [];
let awayScorers = [];
let opponentTeam = null;
let myTeamOvr = 75;
let opponentTeamOvr = 75;
let isVarActive = false;
let isMpVarActive = false;

// Kupa Müzesi (Museum) State
let isViewingSavedPoster = false;
let activePosterIsChampion = false;
let currentRunMatches = [];

// Formasyon Slot Koordinatları ve Pozisyon Grupları (GK, DF, MF, FW)
const formationConfigs = {
    "4-4-2": [
        { id: 0, label: "GK", type: "GK", top: "85%", left: "50%" },
        { id: 1, label: "LB", type: "DF", top: "65%", left: "15%" },
        { id: 2, label: "CB", type: "DF", top: "68%", left: "37%" },
        { id: 3, label: "CB", type: "DF", top: "68%", left: "63%" },
        { id: 4, label: "RB", type: "DF", top: "65%", left: "85%" },
        { id: 5, label: "LM", type: "MF", top: "42%", left: "15%" },
        { id: 6, label: "CM", type: "MF", top: "45%", left: "37%" },
        { id: 7, label: "CM", type: "MF", top: "45%", left: "63%" },
        { id: 8, label: "RM", type: "MF", top: "42%", left: "85%" },
        { id: 9, label: "ST", type: "FW", top: "18%", left: "33%" },
        { id: 10, label: "ST", type: "FW", top: "18%", left: "67%" }
    ],
    "4-3-3": [
        { id: 0, label: "GK", type: "GK", top: "85%", left: "50%" },
        { id: 1, label: "LB", type: "DF", top: "65%", left: "15%" },
        { id: 2, label: "CB", type: "DF", top: "68%", left: "37%" },
        { id: 3, label: "CB", type: "DF", top: "68%", left: "63%" },
        { id: 4, label: "RB", type: "DF", top: "65%", left: "85%" },
        { id: 5, label: "CM", type: "MF", top: "45%", left: "25%" },
        { id: 6, label: "DM", type: "MF", top: "50%", left: "50%" },
        { id: 7, label: "CM", type: "MF", top: "45%", left: "75%" },
        { id: 8, label: "LW", type: "FW", top: "20%", left: "20%" },
        { id: 9, label: "ST", type: "FW", top: "15%", left: "50%" },
        { id: 10, label: "RW", type: "FW", top: "20%", left: "80%" }
    ],
    "3-5-2": [
        { id: 0, label: "GK", type: "GK", top: "85%", left: "50%" },
        { id: 1, label: "CB", type: "DF", top: "68%", left: "25%" },
        { id: 2, label: "CB", type: "DF", top: "72%", left: "50%" },
        { id: 3, label: "CB", type: "DF", top: "68%", left: "75%" },
        { id: 4, label: "LWB", type: "MF", top: "45%", left: "12%" },
        { id: 5, label: "CM", type: "MF", top: "48%", left: "33%" },
        { id: 6, label: "DM", type: "MF", top: "54%", left: "50%" },
        { id: 7, label: "CM", type: "MF", top: "48%", left: "67%" },
        { id: 8, label: "RWB", type: "MF", top: "45%", left: "88%" },
        { id: 9, label: "ST", type: "FW", top: "18%", left: "33%" },
        { id: 10, label: "ST", type: "FW", top: "18%", left: "67%" }
    ],
    "4-2-3-1": [
        { id: 0, label: "GK", type: "GK", top: "85%", left: "50%" },
        { id: 1, label: "LB", type: "DF", top: "65%", left: "15%" },
        { id: 2, label: "CB", type: "DF", top: "68%", left: "37%" },
        { id: 3, label: "CB", type: "DF", top: "68%", left: "63%" },
        { id: 4, label: "RB", type: "DF", top: "65%", left: "85%" },
        { id: 5, label: "LDM", type: "MF", top: "52%", left: "35%" },
        { id: 6, label: "RDM", type: "MF", top: "52%", left: "65%" },
        { id: 7, label: "LM", type: "MF", top: "28%", left: "18%" },
        { id: 8, label: "AM", type: "MF", top: "28%", left: "50%" },
        { id: 9, label: "RM", type: "MF", top: "28%", left: "82%" },
        { id: 10, label: "ST", type: "FW", top: "15%", left: "50%" }
    ],
    "5-3-2": [
        { id: 0, label: "GK", type: "GK", top: "85%", left: "50%" },
        { id: 1, label: "LWB", type: "DF", top: "60%", left: "12%" },
        { id: 2, label: "CB", type: "DF", top: "68%", left: "32%" },
        { id: 3, label: "CB", type: "DF", top: "72%", left: "50%" },
        { id: 4, label: "CB", type: "DF", top: "68%", left: "68%" },
        { id: 5, label: "RWB", type: "DF", top: "60%", left: "88%" },
        { id: 6, label: "CM", type: "MF", top: "42%", left: "28%" },
        { id: 7, label: "DM", type: "MF", top: "45%", left: "50%" },
        { id: 8, label: "CM", type: "MF", top: "42%", left: "72%" },
        { id: 9, label: "ST", type: "FW", top: "18%", left: "33%" },
        { id: 10, label: "ST", type: "FW", top: "18%", left: "67%" }
    ]
};

// Sayfa / React Yüklendiğinde
function initCoreGame() {
    if (window.__coreGameReady) return;
    window.__coreGameReady = true;
    // 4-2-3-1 koordinatında typo düzeltmesi
    formationConfigs["4-2-3-1"][5].left = "35%";

    loadDatabase();
    setupEventListeners();
}

// Dönemsel Piyasa Değerlerine Göre Reytingleri Ayarla (Lig Geneli Yüzdelik Sıralama)
function adjustRatings(db) {
    for (const year in db) {
        const teams = db[year];

        // 1. O sezondaki tüm oyuncuları ve sıfırdan büyük piyasa değerlerini lig genelinde topla
        const allValuedPlayers = [];
        teams.forEach(team => {
            team.players.forEach(player => {
                const val = player.market_value_numeric || 0;
                if (val > 0) {
                    allValuedPlayers.push({ player, val });
                }
            });
        });

        if (allValuedPlayers.length === 0) {
            continue; // Değer bulunamazsa orijinal reytinglerde bırak
        }

        // Piyasa değerlerine göre küçükten büyüğe sırala
        allValuedPlayers.sort((a, b) => a.val - b.val);
        const totalValued = allValuedPlayers.length;

        // 2. Her oyuncunun gücünü o dönemin lig geneli piyasa değer sıralamasına (yüzdelik dilimine) göre dağıt
        teams.forEach(team => {
            team.players.forEach(player => {
                const val = player.market_value_numeric || 0;

                if (val <= 0) {
                    // Piyasa değeri olmayan / bilinmeyen oyunculara yedek/rotasyon seviyesi taban reyting
                    player.rating = 62;
                } else {
                    // Oyuncunun lig genelindeki sıralamasını (indeksini) bul
                    const idx = allValuedPlayers.findIndex(p => p.player === player);
                    const P = idx / totalValued; // 0.0 ile 1.0 arası yüzdelik dilim (Percentile)

                    let rating;
                    if (P >= 0.99) {
                        // En üst %1 (Süper Yıldızlar / Efsaneler - Melo, Muslera, Alex vb.)
                        rating = 88 + (P - 0.99) / 0.01 * 6; // 88 - 94 arası
                    } else if (P >= 0.95) {
                        // %95 - %99 (Büyük Takım Yıldızları / Ligin Elitleri)
                        rating = 83 + (P - 0.95) / 0.04 * 5; // 83 - 88 arası
                    } else if (P >= 0.85) {
                        // %85 - %95 (Çok İyi Oyuncular / Kaliteli Yabancılar)
                        rating = 78 + (P - 0.85) / 0.10 * 5; // 78 - 83 arası
                    } else if (P >= 0.60) {
                        // %60 - %85 (Ortalamanın Üstü / Anadolu Takımlarının Yıldızları - Fornezzi, Stancu vb.)
                        rating = 72 + (P - 0.60) / 0.25 * 6; // 72 - 78 arası
                    } else if (P >= 0.30) {
                        // %30 - %60 (Standart Süper Lig Oyuncuları / Rotasyon Elemanları)
                        rating = 65 + (P - 0.30) / 0.30 * 7; // 65 - 72 arası
                    } else {
                        // %0 - %30 (Yedekler / Altyapı Oyuncuları)
                        rating = 55 + P / 0.30 * 10; // 55 - 65 arası
                    }

                    player.rating = Math.max(55, Math.min(99, Math.round(rating)));
                }
            });
        });
    }
}

// JSON Verisini MySQL API Üzerinden Yükle
async function loadDatabase() {
    try {
        const response = await fetch("/api/datasets/nostalji");
        if (!response.ok) {
            throw new Error("Veri tabanı dosyası yüklenemedi!");
        }
        const fullDatabase = await response.json();

        // 2004 yılı ve sonrasındaki verileri filtrele
        database = {};
        for (const year in fullDatabase) {
            if (parseInt(year) >= 2004) {
                database[year] = fullDatabase[year];
            }
        }

        // Reytingleri dönem şartlarına ve enflasyona göre ayarla
        adjustRatings(database);

        console.log("Süper Lig Veri Seti Başarıyla Yüklendi!", Object.keys(database).length, "sezon (2004 ve sonrası, reytingler dengelendi) bulundu.");
    } catch (error) {
        console.error("Hata:", error);
        alert("Veri tabanı yüklenemedi! Oyunu oynamak için yerel bir sunucu (python3 -m http.server 8000) kullanmalısınız.");
    }
}

// Olay Dinleyicileri (Event Listeners)
function setupEventListeners() {
    // Formasyon Seçimi
    const formationOptions = document.querySelectorAll(".formation-item");
    formationOptions.forEach(opt => {
        opt.addEventListener("click", () => {
            formationOptions.forEach(o => o.classList.remove("active"));
            opt.classList.add("active");
            activeFormation = opt.getAttribute("data-formation");
        });
    });

    // Oyuna Başla
    document.getElementById("btn-start-draft").addEventListener("click", startDraft);

    // Zar At
    document.getElementById("btn-roll-dice").addEventListener("click", rollDice);

    // Filtreleme Sekmeleri
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderScrapedPlayers(btn.getAttribute("data-pos"));
        });
    });

    // Sıralama Seçimi Değiştiğinde
    const sortSelect = document.getElementById("player-sort-select");
    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            const activeTab = document.querySelector(".tab-btn.active");
            const activePos = activeTab ? activeTab.getAttribute("data-pos") : "ALL";
            renderScrapedPlayers(activePos);
        });
    }

    // Turnuvayı Başlat (Kadro tamamlandığında)
    document.getElementById("btn-to-simulation").addEventListener("click", () => {
        // Achievements Triggers
        unlockAchievement("first_draft");
        const filled = draftedPlayers.filter(p => p !== null);
        if (filled.length >= 11) {
            const sumOvr = filled.reduce((acc, curr) => acc + curr.rating, 0);
            const ovr = Math.round(sumOvr / 11);
            if (ovr >= 85) unlockAchievement("rating_85");
            if (ovr >= 90) unlockAchievement("rating_90");
        }
        if (activeFormation === "4-3-3") unlockAchievement("tactician");

        initializeTournament();
    });

    // Aynı Kadroyla Tekrar Maç Yap
    document.getElementById("btn-play-again-same").addEventListener("click", () => {
        document.getElementById("match-result-summary").classList.add("hidden");
        startMatchSimulation();
    });

    // Yeni Draft (Reset)
    document.getElementById("btn-new-draft").addEventListener("click", () => {
        resetGameToDraft();
    });

    // Turnuva Maçını Oyna
    document.getElementById("btn-play-tournament-match").addEventListener("click", playTournamentMatch);

    // Turnuva Sonrası Aksiyonu (Turu geçme / elenme durumları)
    document.getElementById("btn-tournament-action").addEventListener("click", handleTournamentAction);

    // Poster Modal Butonları
    // Poster controls are optional in the current layout. Guard them so an
    // omitted promotional panel cannot prevent the whole application from booting.
    document.getElementById("btn-download-poster")?.addEventListener("click", downloadPoster);
    document.getElementById("btn-share-poster")?.addEventListener("click", sharePoster);
    document.getElementById("btn-close-poster")?.addEventListener("click", closePosterModal);

    // Audio & Click initialization
    document.addEventListener("click", () => {
        if (isFirstClick) {
            isFirstClick = false;
            startBgMusic();
        }
    });

    // Mute/Unmute audio button
    const muteBtn = document.getElementById("btn-toggle-audio");
    if (muteBtn) {
        muteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Don't trigger first-click music play
            toggleMute();
        });
    }

    // Kupa Müzesi Event Listeners
    const btnOpenMuseum = document.getElementById("btn-open-museum");
    if (btnOpenMuseum) {
        btnOpenMuseum.addEventListener("click", () => {
            showScreen("screen-museum");
            Museum.renderAll();
        });
    }

    const btnMuseumBack = document.getElementById("btn-museum-back");
    if (btnMuseumBack) {
        btnMuseumBack.addEventListener("click", () => {
            showScreen("screen-main-menu");
        });
    }

    const btnSaveMuseum = document.getElementById("btn-save-museum");
    if (btnSaveMuseum) {
        btnSaveMuseum.addEventListener("click", () => {
            const success = Museum.saveCurrentSquad(activePosterIsChampion);
            if (success) {
                btnSaveMuseum.innerHTML = '<i class="fa-solid fa-check"></i> Müzeye Eklendi';
                btnSaveMuseum.disabled = true;
                playRetroSelect();
            }
        });
    }


}

// Ekran Değiştirici
function showScreen(screenId) {
    const screens = document.querySelectorAll(".screen");
    screens.forEach(s => s.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");

    const btnScrollSeo = document.getElementById("btn-scroll-seo");
    if (btnScrollSeo) {
        if (screenId === "screen-main-menu") {
            btnScrollSeo.classList.remove("hidden");
        } else {
            btnScrollSeo.classList.add("hidden");
        }
    }
}

// Draft Ekranını Başlat
function startDraft() {
    if (!database) {
        alert("Veritabanı yükleniyor, lütfen bekleyin...");
        return;
    }
    showScreen("screen-draft");
    draftedPlayers = Array(11).fill(null);
    rolledTeam = null;
    selectedPlayerToPlace = null;

    // UI Sıfırla
    document.getElementById("team-result-card").classList.add("hidden");
    document.getElementById("scraped-players-list").innerHTML = "";

    renderPitch();
    renderBoxScoreList();
}

// Sahadaki Oyuncu Yuvalarını Çiz
function renderPitch() {
    const slotsContainer = document.getElementById("pitch-slots");
    slotsContainer.innerHTML = "";

    const currentConfig = formationConfigs[activeFormation];

    currentConfig.forEach((slot, index) => {
        const slotDiv = document.createElement("div");
        slotDiv.className = "pitch-slot";
        slotDiv.style.top = slot.top;
        slotDiv.style.left = slot.left;
        slotDiv.setAttribute("data-index", index);

        // Eğer bir oyuncu yerleştirilmeyi bekliyorsa ve bu yuva o oyuncuya uygun ve boşsa highlight ekle
        const isCompatible = selectedPlayerToPlace &&
            (slot.type === selectedPlayerToPlace.position) &&
            (draftedPlayers[index] === null);

        if (isCompatible) {
            slotDiv.classList.add("compatible-highlight");
        }

        // Türkçe pozisyon etiketi
        let displayLabel = "OS";
        if (slot.type === "GK") displayLabel = "KL";
        else if (slot.type === "DF") displayLabel = "DF";
        else if (slot.type === "MF") displayLabel = "OS";
        else if (slot.type === "FW") displayLabel = "FV";

        if (draftedPlayers[index]) {
            // Eğer oyuncu seçilmişse kartını çiz
            const p = draftedPlayers[index];
            slotDiv.innerHTML = createPlayerCardHTML(p, false);
        } else {
            // Boş yuva
            slotDiv.innerHTML = `
                <div class="slot-placeholder">
                    <span class="slot-pos-label">${displayLabel}</span>
                </div>
            `;
        }

        // Slot tıklama olayı
        slotDiv.addEventListener("click", () => {
            if (selectedPlayerToPlace) {
                const isCompatibleRightNow = (slot.type === selectedPlayerToPlace.position) && (draftedPlayers[index] === null);
                if (isCompatibleRightNow) {
                    placePlayerInSlot(index);
                } else {
                    alert(`HATA: Seçtiğiniz oyuncu (${selectedPlayerToPlace.name} - ${selectedPlayerToPlace.position}) bu yuvaya (${slot.label} - ${slot.type}) yerleştirilemez!`);
                }
            } else {
                alert("Lütfen önce zarı atarak bir takım getirin ve listeden oyuncu seçin.");
            }
        });

        slotsContainer.appendChild(slotDiv);
    });
}

// Oyuncu Kartı HTML Şablonu
function createPlayerCardHTML(player, isListMode = false) {
    // Türkçe pozisyon eşleme
    let displayPos = "OS";
    if (player.position === "GK") displayPos = "KL";
    else if (player.position === "DF") displayPos = "DF";
    else if (player.position === "MF") displayPos = "OS";
    else if (player.position === "FW") displayPos = "FV";

    return `
        <div class="player-card" data-player-name="${player.name.replace(/"/g, '&quot;')}">
            <div class="card-top">
                <span class="card-rating">${player.rating}</span>
                <span class="card-pos">${displayPos}</span>
            </div>
            <div class="card-bottom">
                <span class="card-name" title="${player.name}">${player.name}</span>
                <span class="card-pos">${displayPos}</span>
                <span class="card-rating">${player.rating}</span>
            </div>
        </div>
    `;
}

// ZAR ATMA MEKANİZMASI
function rollDice() {
    const dice = document.getElementById("3d-dice");
    const btn = document.getElementById("btn-roll-dice");
    const diceWrapper = document.querySelector(".dice-animation-wrapper");

    btn.disabled = true;
    selectedPlayerToPlace = null; // Yeni zarda seçili oyuncuyu temizle
    renderPitch(); // Sahadaki highlight'ları sıfırla

    // Zar dönme animasyonunu göster
    if (diceWrapper) diceWrapper.classList.add("active");
    dice.classList.add("rolling");

    // Play retro roll sound ticks
    const rollSoundInterval = setInterval(playRetroClick, 100);

    // Rastgelelik Simülasyonu
    const years = Object.keys(database);
    const randomYear = years[Math.floor(Math.random() * years.length)];
    const teams = database[randomYear];
    const randomTeam = teams[Math.floor(Math.random() * teams.length)];

    setTimeout(() => {
        clearInterval(rollSoundInterval);
        playRetroSelect(); // Zar durma sesi

        dice.classList.remove("rolling");
        // btn.disabled = false; // Oyuncu seçilip sahaya yerleştirilene kadar zar butonu kilitli kalacak
        if (diceWrapper) diceWrapper.classList.remove("active");

        // Zarı rastgele bir yüzeyde durdurmak için 3D transformasyon uygula
        const rotations = [
            "rotateX(0deg) rotateY(0deg)",    // Front
            "rotateY(180deg)",                 // Back
            "rotateY(-90deg)",                 // Right
            "rotateY(90deg)",                  // Left
            "rotateX(-90deg)",                 // Top
            "rotateX(90deg)"                   // Bottom
        ];
        const randomRot = rotations[Math.floor(Math.random() * rotations.length)];
        dice.style.transform = randomRot;

        // Sonuçları Kaydet
        rolledTeam = {
            year: randomYear,
            team_name: randomTeam.team_name,
            players: randomTeam.players
        };

        // Ekrana Yansıt
        document.getElementById("result-team-name").innerText = rolledTeam.team_name;
        document.getElementById("result-season").innerText = `${randomYear}-${parseInt(randomYear) + 1} Sezonu`;
        document.getElementById("team-result-card").classList.remove("hidden");

        // Filtreyi 'ALL' yap ve oyuncuları listele
        const tabs = document.querySelectorAll(".tab-btn");
        tabs.forEach(t => t.classList.remove("active"));
        document.querySelector(".tab-btn[data-pos='ALL']").classList.add("active");

        renderScrapedPlayers("ALL");

    }, 1500); // 1.5 saniye dönme animasyonu
}

// Oyuncu Seçeneklerini Listele
function renderScrapedPlayers(positionFilter = "ALL") {
    const container = document.getElementById("scraped-players-list");
    container.innerHTML = "";

    if (!rolledTeam) return;

    // Filtreleme ve Dizi Kopyalama (orijinal veriyi bozmamak için)
    let filtered = [];
    if (positionFilter !== "ALL") {
        filtered = rolledTeam.players.filter(p => p.position === positionFilter);
    } else {
        filtered = [...rolledTeam.players];
    }

    // Sıralama Seçeneğini Al ve Uygula
    const sortVal = document.getElementById("player-sort-select")?.value || "rating-desc";
    if (sortVal === "rating-desc") {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortVal === "rating-asc") {
        filtered.sort((a, b) => a.rating - b.rating);
    } else if (sortVal === "name-asc") {
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    }

    if (filtered.length === 0) {
        container.innerHTML = `<p class="no-player-msg">Bu mevkide oyuncu bulunamadı.</p>`;
        return;
    }

    filtered.forEach(p => {
        const cardWrapper = document.createElement("div");
        cardWrapper.innerHTML = createPlayerCardHTML(p, true);
        const cardDiv = cardWrapper.firstElementChild;

        // Bu pozisyon için sahada boş yer var mı kontrol et
        const currentConfig = formationConfigs[activeFormation];
        const hasEmptySlot = currentConfig.some((slot, index) =>
            slot.type === p.position && draftedPlayers[index] === null
        );

        if (!hasEmptySlot) {
            cardDiv.style.opacity = "0.35";
            cardDiv.style.filter = "grayscale(1)";
            cardDiv.title = `Sahada boş ${p.position} mevkisi kalmadı!`;
        }

        // Eğer önceden seçilmişse görsel işaretle
        if (selectedPlayerToPlace && selectedPlayerToPlace.name === p.name) {
            cardDiv.classList.add("selected");
        }

        cardDiv.addEventListener("click", () => {
            if (!rolledTeam) {
                alert("Lütfen önce zarı atarak yeni bir takım getirin!");
                return;
            }
            if (!hasEmptySlot) {
                alert(`Sahada boş ${p.position} yuvası kalmadığı için bu oyuncuyu seçemezsiniz!`);
                return;
            }

            // Oyuncuyu seçili yap
            selectedPlayerToPlace = p;

            // Kartlardaki seçili sınıflarını temizle ve buna ekle
            document.querySelectorAll(".scraped-players-list .player-card").forEach(c => c.classList.remove("selected"));
            cardDiv.classList.add("selected");

            // Sahayı tekrar çizerek uygun boş yuvaları parlat (compatible-highlight)
            renderPitch();

            // Mobil görünümde sahaya otomatik kaydır
            if (window.innerWidth <= 900) {
                const pitchOuter = document.querySelector(".pitch-outer");
                if (pitchOuter) {
                    pitchOuter.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }
        });

        container.appendChild(cardDiv);
    });
}

// Oyuncuyu Yuvaya Yerleştir
function placePlayerInSlot(slotIndex) {
    if (!selectedPlayerToPlace) return;

    draftedPlayers[slotIndex] = selectedPlayerToPlace;
    selectedPlayerToPlace = null;
    rolledTeam = null; // Bu el bitti, yeni zar gerekecek

    // Paneli gizle ve listeyi temizle
    document.getElementById("team-result-card").classList.add("hidden");
    document.getElementById("scraped-players-list").innerHTML = "";

    // Yeniden çiz ve rating güncelle
    renderPitch();
    updateOverallRating();

    // Zarı tekrar aktif et
    document.getElementById("btn-roll-dice").disabled = false;

    // Mobil görünümde zarlara geri kaydır
    if (window.innerWidth <= 900) {
        const leftCol = document.querySelector(".draft-col.left-col");
        if (leftCol) {
            leftCol.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
}

// Box Score Listesini Güncelle
function renderBoxScoreList() {
    const container = document.getElementById("box-score-rows");
    container.innerHTML = "";

    const currentConfig = formationConfigs[activeFormation];
    currentConfig.forEach((slot, index) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "box-score-row";

        const p = draftedPlayers[index];

        // Türkçe pozisyon etiketi
        let posLabel = "OS";
        if (slot.type === "GK") posLabel = "KL";
        else if (slot.type === "DF") posLabel = "DF";
        else if (slot.type === "MF") posLabel = "OS";
        else if (slot.type === "FW") posLabel = "FV";

        const nameText = p ? p.name : "—";
        const ratingText = p ? p.rating : "";

        rowDiv.innerHTML = `
            <span class="pos">${posLabel}</span>
            <span class="name">${nameText}</span>
            <span class="rating">${ratingText}</span>
        `;
        container.appendChild(rowDiv);
    });
}

// Kadro Gücünü, İlerlemeyi ve İstatistikleri Güncelle
function updateOverallRating() {
    const filledSlots = draftedPlayers.filter(p => p !== null);
    const count = filledSlots.length;

    // İlerleme Sayacı
    document.getElementById("filled-slots-count-badge").innerText = `${count} / 11`;

    // Genel, Saldırı ve Savunma güçlerini hesapla
    let ovr = 75;
    let atk = 75;
    let def = 75;

    if (count > 0) {
        const sumOvr = draftedPlayers.reduce((acc, curr) => acc + (curr ? curr.rating : 0), 0);

        // Saldırı (FW + MF) ve Savunma (DF + GK)
        const atkPlayers = draftedPlayers.filter(p => p && (p.position === "FW" || p.position === "MF"));
        const defPlayers = draftedPlayers.filter(p => p && (p.position === "DF" || p.position === "GK"));

        const sumAtk = atkPlayers.reduce((acc, curr) => acc + curr.rating, 0);
        const sumDef = defPlayers.reduce((acc, curr) => acc + curr.rating, 0);

        ovr = Math.round(sumOvr / count);
        if (atkPlayers.length > 0) atk = Math.round(sumAtk / atkPlayers.length);
        if (defPlayers.length > 0) def = Math.round(sumDef / defPlayers.length);
    }

    myTeamOvr = ovr;

    // DOM Güncellemeleri (Değerler ve Barlar)
    document.getElementById("team-ovr-val").innerText = ovr;
    document.getElementById("team-atk-val").innerText = atk;
    document.getElementById("team-def-val").innerText = def;

    document.getElementById("bar-team-ovr").style.width = `${ovr}%`;
    document.getElementById("bar-team-atk").style.width = `${atk}%`;
    document.getElementById("bar-team-def").style.width = `${def}%`;

    // Box Score listesini güncelle
    renderBoxScoreList();

    // Eğer 11 oyuncu da seçildiyse simülasyon butonunu göster
    if (count === 11) {
        document.getElementById("btn-to-simulation").classList.remove("hidden");
    } else {
        document.getElementById("btn-to-simulation").classList.add("hidden");
    }
}

// MAÇ SİMÜLASYONU EKRANINA GEÇİŞ
function goToSimulation() {
    showScreen("screen-simulation");

    // Skorları Sıfırla
    document.getElementById("score-home").innerText = "0";
    document.getElementById("score-away").innerText = "0";
    document.getElementById("score-home").classList.remove("goal-anim");
    document.getElementById("score-away").classList.remove("goal-anim");
    document.getElementById("match-minute").innerText = "0'";

    homeScore = 0;
    awayScore = 0;
    homeScorers = [];
    awayScorers = [];

    // Ev sahibi gücünü yaz
    document.getElementById("home-rating").innerText = myTeamOvr;

    // Rastgele Rakip Takım Seç ve GEN hesapla
    selectRandomOpponent();

    // Canlı Anlatım panelini temizle
    const list = document.getElementById("commentary-list");
    list.innerHTML = `
        <div class="commentary-row event-start">
            <span class="time">00'</span>
            <span class="text">Hakem düdüğünü çalıyor ve tarihi maç başlıyor!</span>
        </div>
    `;

    // 1 saniye sonra simülasyonu başlat
    setTimeout(startMatchSimulation, 1500);
}

// Rastgele Rakip Takım Belirleme
function selectRandomOpponent() {
    const years = Object.keys(database);
    const randomYear = years[Math.floor(Math.random() * years.length)];
    const teams = database[randomYear];
    const team = teams[Math.floor(Math.random() * teams.length)];

    opponentTeam = team;

    // Rakip gücünü kadrosunun rating ortalaması olarak hesapla
    const sum = team.players.reduce((acc, curr) => acc + curr.rating, 0);
    opponentTeamOvr = Math.round(sum / team.players.length);

    document.getElementById("opponent-team-name").innerText = `${team.team_name} (${randomYear})`;
    document.getElementById("away-rating").innerText = opponentTeamOvr;
}

// Canlı Maç Anlatımı Ekleme
function addCommentary(minute, text, type = "event-normal") {
    const list = document.getElementById("commentary-list");
    const div = document.createElement("div");
    div.className = `commentary-row ${type}`;
    div.innerHTML = `
        <span class="time">${minute}'</span>
        <span class="text">${text}</span>
    `;
    list.insertBefore(div, list.firstChild); // Yeni olanı en üste ekle
    list.scrollTop = 0;
}

let matchPhase = "normal";

// MAÇ MOTORU (SIMULATION ENGINE)
function startMatchSimulation() {
    matchPhase = "normal";
    matchMinute = 0;
    homeScore = 0;
    awayScore = 0;
    homeScorers = [];
    awayScorers = [];

    // Skor göstergesini güncelle
    document.getElementById("score-home").innerText = "0";
    document.getElementById("score-away").innerText = "0";
    document.getElementById("match-minute").innerText = "0'";

    // Canlı Anlatım
    playRetroWhistle(); // Maç başlangıç düdüğü
    addCommentary(0, "Maçın başlama vuruşu yapıldı. İki takıma da başarılar dileriz!", "event-normal");

    // Her 1500 ms'de bir dakika ilerlet
    matchInterval = setInterval(() => {
        if (isVarActive) return; // VAR veya penaltı atışı sırasında süreyi duraklat

        if (matchPhase === "normal" || matchPhase === "extra") {
            matchMinute += Math.floor(Math.random() * 4) + 1; // 1-4 dakika arası ilerle

            if (matchPhase === "normal" && matchMinute >= 90) {
                matchMinute = 90;
                document.getElementById("match-minute").innerText = "90'";

                if (isTournamentMode && homeScore === awayScore) {
                    matchPhase = "extra";
                    addCommentary(90, "Normal süre berabere bitti! Maç uzatmalara gidiyor.", "event-info");
                    return; // skip event this tick
                } else {
                    clearInterval(matchInterval);
                    finishMatch();
                    return;
                }
            }

            if (matchPhase === "extra" && matchMinute >= 120) {
                matchMinute = 120;
                document.getElementById("match-minute").innerText = "120'";

                if (homeScore === awayScore) {
                    matchPhase = "penalties";
                    clearInterval(matchInterval);
                    simulatePenalties();
                    return;
                } else {
                    clearInterval(matchInterval);
                    finishMatch();
                    return;
                }
            }

            document.getElementById("match-minute").innerText = `${matchMinute}'`;

            // Pozisyon / Gol Olasılığı Simülasyonu
            simulateEvent();
        }
    }, 1000); // Maç simülasyon hızı (yavaşlatıldı)
}

function simulatePenalties() {
    addCommentary(120, "120 dakika sonunda eşitlik bozulmadı. Maç penaltılara gidiyor!", "event-info");

    // Stop regular simulation ticker
    clearInterval(matchInterval);

    startVisualPenaltyShootout("Senin Takımın", opponentTeam.team_name, myTeamOvr, opponentTeamOvr, (pHomeScore, pAwayScore) => {
        if (pHomeScore > pAwayScore) {
            homeScore++; // Ensure home wins the bracket
        } else {
            awayScore++; // Ensure away wins the bracket
        }

        addCommentary("PEN", `Penaltı Atışları Sonucu: Senin Takımın ${pHomeScore} - ${pAwayScore} ${opponentTeam.team_name}`, "event-info");
        finishMatch(true);
    });
}

// Olay Simülasyonu (Gol, Tehlikeli Atak vb.)
function simulateEvent() {
    // Toplam atak şansı ve takımların ağırlıkları
    const attackChance = Math.random();

    if (attackChance < 0.22) { // %22 ihtimalle pozisyon olur
        // Güç farkına göre atak paylaştırma: Temel %50, her 1 rating farkı %1 olasılık kaydırır
        const ratingDiff = myTeamOvr - opponentTeamOvr;
        let homeChance = 0.50 + ratingDiff * 0.01;
        homeChance = Math.max(0.20, Math.min(0.80, homeChance)); // Sınırlar: %20 ile %80 arası

        const whichTeam = Math.random();

        if (whichTeam < homeChance) {
            // Ev sahibi (Kullanıcı) Atak Yapıyor
            simulateHomeAttack();
        } else {
            // Deplasman (Rakip) Atak Yapıyor
            simulateAwayAttack();
        }
    }
}

// Ev Sahibi Atak Detayları
function simulateHomeAttack() {
    const ratingDiff = myTeamOvr - opponentTeamOvr;
    let goalChance = 0.35 + ratingDiff * 0.005;
    goalChance = Math.max(0.15, Math.min(0.55, goalChance));

    const attackingPlayers = draftedPlayers.filter(p => p && (p.position === "FW" || p.position === "MF"));
    if (attackingPlayers.length === 0) return;
    const scorer = attackingPlayers[Math.floor(Math.random() * attackingPlayers.length)];
    const assister = attackingPlayers[Math.floor(Math.random() * attackingPlayers.length)];

    const isPenalty = Math.random() < 0.08;

    if (isPenalty) {
        const isGoal = Math.random() < 0.80; // 80% penalty conversion rate
        addCommentary(matchMinute, `PENALTI! Ceza sahasında faule maruz kalan ${scorer.name} yerde! Hakem penaltı noktasını gösteriyor! ${scorer.name} topun gerisine geçiyor...`, "event-info");

        isVarActive = true;
        setTimeout(() => {
            if (isGoal) {
                homeScore++;
                homeScorers.push(`${scorer.name} (P - ${matchMinute}')`);
                playRetroGoalSound();

                const scoreEl = document.getElementById("score-home");
                scoreEl.innerText = homeScore;
                scoreEl.classList.add("goal-anim");
                setTimeout(() => scoreEl.classList.remove("goal-anim"), 500);

                addCommentary(matchMinute, `GOOOOL! ${scorer.name} kaleciyi ve topu ayrı köşelere yolladı! Beyaz noktadan hata yapmıyor!`, "event-goal");
            } else {
                const penMisses = [
                    `KAÇTI! ${scorer.name} penaltı vuruşunda topu direğin üzerinden auta gönderiyor!`,
                    `KURTARILDI! Kaleci muhteşem uzanıyor ve ${scorer.name}'in penaltı şutunu köşeden çeliyor!`
                ];
                addCommentary(matchMinute, penMisses[Math.floor(Math.random() * penMisses.length)], "event-danger");
            }
            isVarActive = false;
        }, 2000);
        return;
    }

    const isGoal = Math.random() < goalChance;
    if (isGoal) {
        if (Math.random() < 0.15) {
            isVarActive = true;
            addCommentary(matchMinute, `GOL! ${scorer.name} topu ağlara gönderdi ancak hakem kulaklığını işaret ediyor... VAR odası pozisyonu inceliyor!`, "event-info");

            setTimeout(() => {
                const isGoalValid = Math.random() > 0.5;
                if (isGoalValid) {
                    homeScore++;
                    homeScorers.push(`${scorer.name} (${matchMinute}')`);
                    playRetroGoalSound();

                    const scoreEl = document.getElementById("score-home");
                    scoreEl.innerText = homeScore;
                    scoreEl.classList.add("goal-anim");
                    setTimeout(() => scoreEl.classList.remove("goal-anim"), 500);

                    addCommentary(matchMinute, `KARAR GOL: VAR incelemesi tamamlandı. Hakem orta noktayı gösterdi, gol geçerli!`, "event-goal");
                } else {
                    addCommentary(matchMinute, `VAR KARARI: GOL İPTAL! Pozisyon öncesinde ofsayt tespit edildi. Gol geçerli sayılmadı!`, "event-danger");
                }
                isVarActive = false;
            }, 2500);
        } else {
            homeScore++;
            homeScorers.push(`${scorer.name} (${matchMinute}')`);
            playRetroGoalSound();

            const scoreEl = document.getElementById("score-home");
            scoreEl.innerText = homeScore;
            scoreEl.classList.add("goal-anim");
            setTimeout(() => scoreEl.classList.remove("goal-anim"), 500);

            const commentaries = [
                `GOOOOL! ${scorer.name} kaleciyle karşı karşıya kaldı ve köşeyi gördü! Muhteşem gol!`,
                `GOOOOOL! ${assister.name}'in harika pasında ${scorer.name} gelişine sert vurdu ve top köşeden ağlarla buluştu!`,
                `GOOOOL! Ceza sahasındaki karambolde ${scorer.name} topu önünde buldu ve ağlara gönderdi!`,
                `GOOOOOOL! ${scorer.name} yaklaşık 25 metreden kaleye füze gönderdi, top çatalda! İnanılmaz gol!`
            ];
            addCommentary(matchMinute, commentaries[Math.floor(Math.random() * commentaries.length)], "event-goal");
        }
    } else {
        const misses = [
            `${scorer.name} kaleciyle karşı karşıya pozisyonda topu dışarı vurdu! Net fırsat kaçtı!`,
            `${scorer.name}'in kafa vuruşunda top direğin az farkla üzerinden dışarı gidiyor.`,
            `${scorer.name} sert vurdu ancak rakip kaleci son anda topu kornere çeliyor!`
        ];
        addCommentary(matchMinute, misses[Math.floor(Math.random() * misses.length)], "event-danger");
    }
}

function simulateAwayAttack() {
    const ratingDiff = opponentTeamOvr - myTeamOvr;
    let goalChance = 0.35 + ratingDiff * 0.005;
    goalChance = Math.max(0.15, Math.min(0.55, goalChance));

    const attackingPlayers = opponentTeam.players.filter(p => p.position === "FW" || p.position === "MF" || p.position === "DF");
    if (attackingPlayers.length === 0) return;
    const scorer = attackingPlayers[Math.floor(Math.random() * attackingPlayers.length)];

    const isPenalty = Math.random() < 0.08;

    if (isPenalty) {
        const isGoal = Math.random() < 0.80; // 80% penalty conversion rate
        addCommentary(matchMinute, `PENALTI! Rakip takımda ${scorer.name} ceza sahamızda yerde kaldı, hakem penaltı noktasını gösteriyor! ${scorer.name} penaltıyı kullanacak...`, "event-info");

        isVarActive = true;
        setTimeout(() => {
            if (isGoal) {
                awayScore++;
                awayScorers.push(`${scorer.name} (P - ${matchMinute}')`);
                playRetroGoalSound();

                const scoreEl = document.getElementById("score-away");
                scoreEl.innerText = awayScore;
                scoreEl.classList.add("goal-anim");
                setTimeout(() => scoreEl.classList.remove("goal-anim"), 500);

                addCommentary(matchMinute, `GOL! ${scorer.name} penaltıyı ağlarımıza gönderiyor. Skor maalesef aleyhimize değişti.`, "event-goal");
            } else {
                const penMisses = [
                    `KAÇTI! ${scorer.name} penaltı vuruşunda topu dışarı yolluyor! Derin bir nefes alıyoruz!`,
                    `KURTARILDI! Kalecimiz harika uzanıyor ve ${scorer.name}'in penaltı şutunu tokatlıyor! Devleşti kalecimiz!`
                ];
                addCommentary(matchMinute, penMisses[Math.floor(Math.random() * penMisses.length)], "event-normal");
            }
            isVarActive = false;
        }, 2000);
        return;
    }

    const isGoal = Math.random() < goalChance;
    if (isGoal) {
        if (Math.random() < 0.15) {
            isVarActive = true;
            addCommentary(matchMinute, `GOL! ${scorer.name} topu ağlara gönderdi ancak yan hakem bayrağı kaldırmadı, orta hakem VAR ile konuşuyor. İnceleme başlatıldı...`, "event-info");

            setTimeout(() => {
                const isGoalValid = Math.random() > 0.5;
                if (isGoalValid) {
                    awayScore++;
                    awayScorers.push(`${scorer.name} (${matchMinute}')`);
                    playRetroGoalSound();

                    const scoreEl = document.getElementById("score-away");
                    scoreEl.innerText = awayScore;
                    scoreEl.classList.add("goal-anim");
                    setTimeout(() => scoreEl.classList.remove("goal-anim"), 500);

                    addCommentary(matchMinute, `KARAR GOL: VAR incelemesi sonrasında orta hakem golü geçerli saydı.`, "event-goal");
                } else {
                    addCommentary(matchMinute, `VAR KARARI: GOL İPTAL! Pozisyon öncesi faul tespit edildi. Gol geçersiz!`, "event-normal");
                }
                isVarActive = false;
            }, 2500);
        } else {
            awayScore++;
            awayScorers.push(`${scorer.name} (${matchMinute}')`);
            playRetroGoalSound();

            const scoreEl = document.getElementById("score-away");
            scoreEl.innerText = awayScore;
            scoreEl.classList.add("goal-anim");
            setTimeout(() => scoreEl.classList.remove("goal-anim"), 500);

            const commentaries = [
                `GOL! ${opponentTeam.team_name} hücumunda ${scorer.name} savunmanın arkasına sarkıp golü attı.`,
                `GOL! Savunmadaki hatayı affetmeyen ${scorer.name} topu ağlara yolladı.`,
                `GOL! ${scorer.name} ceza sahası çizgisi üzerinden çok sert vurdu, kalecimizin uzanmasına rağmen top ağlarda.`
            ];
            addCommentary(matchMinute, commentaries[Math.floor(Math.random() * commentaries.length)], "event-goal");
        }
    } else {
        const defPlayers = draftedPlayers.filter(p => p && (p.position === "DF" || p.position === "GK"));
        const defender = defPlayers[Math.floor(Math.random() * defPlayers.length)];

        const misses = [
            `${opponentTeam.team_name} tehlikeli geldi ancak savunmada ${defender ? defender.name : "Savunma"} kritik bir hamleyle topu uzaklaştırdı.`,
            `${scorer.name}'in sert şutunu kalecimiz harika uzanarak kontrol ediyor.`,
            `${scorer.name} uzaktan kaleyi denedi ancak top direği sıyırarak auta çıktı.`
        ];
        addCommentary(matchMinute, misses[Math.floor(Math.random() * misses.length)], "event-normal");
    }
}

// MAÇ SONU
function finishMatch(decidedByPenalties = false) {
    playRetroWhistle(); // Maç bitiş düdüğü
    if (!decidedByPenalties) {
        addCommentary(matchMinute, "Düdük çalıyor! Karşılaşma sona erdi.", "event-start");
    }

    // Kariyer istatistiklerini ve bu turdaki maç geçmişini kaydet
    const opName = opponentTeam ? opponentTeam.team_name : "Rakip";
    const opYear = opponentTeam ? opponentTeam.year : "";
    currentRunMatches.push({
        roundName: isTournamentMode ? ["Son 16", "Çeyrek Final", "Yarı Final", "Final"][tournamentRound] : "Tek Maç",
        opName: opName,
        opYear: opYear,
        userScore: homeScore,
        opScore: awayScore,
        isWin: homeScore > awayScore
    });

    Museum.addMatch(homeScore, awayScore, opName, opYear);

    // Maç skoru durumunu belirle
    let statusText = "KAYBETTİNİZ! Berabere kaldınız, elendiniz.";
    let userWon = false;
    if (homeScore > awayScore) {
        statusText = decidedByPenalties ? "KAZANDINIZ! Penaltı atışları sonucu efsane kadronuz turu geçiyor!" : "KAZANDINIZ! Efsane Kadro Kazandı!";
        userWon = true;
    } else if (homeScore < awayScore) {
        statusText = decidedByPenalties ? "KAYBETTİNİZ! Penaltı atışları sonucu elendiniz." : "KAYBETTİNİZ! Rakip Galip Geldi.";
    }

    document.getElementById("result-status").innerText = statusText;
    document.getElementById("result-summary-text").innerText = `Tarihi Maç Skoru: ${homeScore} - ${awayScore}`;

    // Golcüleri Listele
    const homeList = document.getElementById("home-scorers-list");
    const awayList = document.getElementById("away-scorers-list");

    homeList.innerHTML = "";
    awayList.innerHTML = "";

    if (homeScorers.length === 0) {
        homeList.innerHTML = "<li>-</li>";
    } else {
        homeScorers.forEach(s => {
            homeList.innerHTML += `<li><i class="fa-solid fa-futbol"></i> ${s}</li>`;
        });
    }

    if (awayScorers.length === 0) {
        awayList.innerHTML = "<li>-</li>";
    } else {
        awayScorers.forEach(s => {
            awayList.innerHTML += `<li><i class="fa-solid fa-futbol"></i> ${s}</li>`;
        });
    }

    // Turnuva modu aksiyonları
    const btnPlayAgain = document.getElementById("btn-play-again-same");
    const btnNewDraft = document.getElementById("btn-new-draft");
    const btnTournamentAction = document.getElementById("btn-tournament-action");

    if (isTournamentMode) {
        // Standart butonları gizle
        btnPlayAgain.classList.add("hidden");
        btnNewDraft.classList.add("hidden");
        btnTournamentAction.classList.remove("hidden");

        // Maç sonucunu kaydet
        const currentRoundMatches = tournamentMatches[tournamentRound];
        const userMatch = currentRoundMatches.find(m => m.team1.isUser || m.team2.isUser);

        if (userMatch.team1.isUser) {
            userMatch.score1 = homeScore;
            userMatch.score2 = awayScore;
        } else {
            userMatch.score1 = awayScore;
            userMatch.score2 = homeScore;
        }
        userMatch.winner = homeScore > awayScore ? (userMatch.team1.isUser ? userMatch.team1 : userMatch.team2) : (userMatch.team1.isUser ? userMatch.team2 : userMatch.team1);

        if (homeScore > awayScore) {
            // Kullanıcı kazandı
            if (tournamentRound === 3) {
                // Şampiyon
                document.getElementById("result-status").innerText = "ŞAMPİYON OLDUNUZ!";
                document.getElementById("result-summary-text").innerText = `Tebrikler! Finalde rakibinizi devirerek kupayı kaldırdınız!`;
                btnTournamentAction.innerHTML = `Kupayı Kaldır & Yeniden Başlat <i class="fa-solid fa-trophy"></i>`;
                btnTournamentAction.setAttribute("data-action", "win-tournament");
            } else {
                // Tur atladı
                btnTournamentAction.innerHTML = `Turnuva Ağacına Dön <i class="fa-solid fa-sitemap"></i>`;
                btnTournamentAction.setAttribute("data-action", "advance");

                // Diğer maçları simüle et
                simulateBackgroundMatchesForCurrentRound();

                // Sonraki tur eşleşmelerini hazırla
                advanceWinnersToNextRound();
            }
        } else {
            // Kullanıcı elendi
            document.getElementById("result-status").innerText = "ELENDİNİZ!";
            document.getElementById("result-summary-text").innerText = `Maalesef elendiniz. Bir sonraki turnuvada şansınızı tekrar deneyin!`;
            btnTournamentAction.innerHTML = `Yeni Kadro Kur (Draft) <i class="fa-solid fa-repeat"></i>`;
            btnTournamentAction.setAttribute("data-action", "lose-tournament");
        }
    } else {
        // Standart (Klasik) mod
        btnTournamentAction.classList.add("hidden");

        if (userWon) {
            // Kazandıysa tekrar oynama seçenekleri göster
            btnPlayAgain.classList.remove("hidden");
            btnNewDraft.classList.remove("hidden");
        } else {
            // Kaybettiyse veya berabere kaldıysa → poster göster ve elen
            btnPlayAgain.classList.add("hidden");
            btnNewDraft.classList.add("hidden");

            // Kısa bir gecikmeyle poster modal'ını göster
            setTimeout(() => {
                generatePoster(false);
            }, 1500);
        }
    }

    // Sonuç özet kartını göster
    document.getElementById("match-result-summary").classList.remove("hidden");
}

// ==================================================
// TURNUVA MODU FONKSİYONLARI
// ==================================================

function initializeTournament() {
    isTournamentMode = true;
    tournamentRound = 0;
    tournamentMatches = [[], [], [], []];

    // Kullanıcı takımı oluştur
    const userTeam = {
        team_name: "Senin Kadron",
        rating: myTeamOvr,
        players: draftedPlayers,
        isUser: true
    };

    // 15 adet rastgele Anadolu/Büyük takımlarından eşleşme topla
    const allOpponents = [];
    const years = Object.keys(database);

    while (allOpponents.length < 15) {
        const randomYear = years[Math.floor(Math.random() * years.length)];
        const teamsInYear = database[randomYear];
        const randomTeam = teamsInYear[Math.floor(Math.random() * teamsInYear.length)];

        // Takım OVR'sini hesapla
        const sum = randomTeam.players.reduce((acc, curr) => acc + curr.rating, 0);
        const avgOvr = Math.round(sum / randomTeam.players.length);

        // Aynı takımın birden fazla kez eklenmesini önleyelim
        const isDuplicate = allOpponents.some(t => t.team_name === randomTeam.team_name && t.year === randomYear);
        if (!isDuplicate) {
            allOpponents.push({
                team_name: randomTeam.team_name,
                year: randomYear,
                players: randomTeam.players,
                rating: avgOvr,
                isUser: false
            });
        }
    }

    // 16 takımı yerleştir (Kullanıcı 0. sırada)
    tournamentTeams = [userTeam, ...allOpponents];

    // Son 16 maçlarını oluştur
    for (let i = 0; i < 8; i++) {
        tournamentMatches[0].push({
            team1: tournamentTeams[2 * i],
            team2: tournamentTeams[2 * i + 1],
            score1: null,
            score2: null,
            winner: null
        });
    }

    // Ekranı değiştir ve çiz
    showScreen("screen-tournament");
    renderBracket();
}

function renderBracket() {
    const rounds = [
        { id: "matches-round-16", index: 0, count: 8 },
        { id: "matches-round-8", index: 1, count: 4 },
        { id: "matches-round-4", index: 2, count: 2 },
        { id: "matches-round-2", index: 3, count: 1 }
    ];

    rounds.forEach(r => {
        const container = document.getElementById(r.id);
        container.innerHTML = "";

        const matches = tournamentMatches[r.index] || [];

        for (let i = 0; i < r.count; i++) {
            const m = matches[i];
            const matchupDiv = document.createElement("div");
            matchupDiv.className = "tournament-matchup";

            if (m) {
                const isUserMatch = m.team1.isUser || m.team2.isUser;
                if (isUserMatch && r.index === tournamentRound) {
                    matchupDiv.classList.add("user-active");
                }

                const score1Text = m.score1 !== null ? m.score1 : "-";
                const score2Text = m.score2 !== null ? m.score2 : "-";

                const team1Class = (m.winner === m.team1) ? "winner" : "";
                const team2Class = (m.winner === m.team2) ? "winner" : "";
                const user1Class = m.team1.isUser ? "user-team" : "";
                const user2Class = m.team2.isUser ? "user-team" : "";

                const year1Text = m.team1.isUser ? "" : ` (${m.team1.year})`;
                const year2Text = m.team2.isUser ? "" : ` (${m.team2.year})`;

                matchupDiv.innerHTML = `
                    <div class="matchup-team ${team1Class} ${user1Class}">
                        <span class="team-name" title="${m.team1.team_name}${year1Text}">${m.team1.team_name}${year1Text}</span>
                        <span class="team-score">${score1Text}</span>
                    </div>
                    <div class="matchup-team ${team2Class} ${user2Class}">
                        <span class="team-name" title="${m.team2.team_name}${year2Text}">${m.team2.team_name}${year2Text}</span>
                        <span class="team-score">${score2Text}</span>
                    </div>
                `;
            } else {
                // Henüz bu tura çıkılmamışsa boş slot çiz
                matchupDiv.innerHTML = `
                    <div class="matchup-team">
                        <span class="team-name" style="color: #b0ab9f;">Belli Değil</span>
                        <span class="team-score">-</span>
                    </div>
                    <div class="matchup-team">
                        <span class="team-name" style="color: #b0ab9f;">Belli Değil</span>
                        <span class="team-score">-</span>
                    </div>
                `;
            }
            container.appendChild(matchupDiv);
        }
    });

    // Şampiyon kolonunu çiz
    const champContainer = document.getElementById("champion-container");
    champContainer.innerHTML = "";

    // Final maçı oynanmış ve kazanan belli mi kontrol et
    const finalMatch = tournamentMatches[3] ? tournamentMatches[3][0] : null;
    if (finalMatch && finalMatch.winner) {
        const champ = finalMatch.winner;
        const isUserChamp = champ.isUser;
        const champClass = isUserChamp ? "user-champion" : "";
        const yearText = isUserChamp ? "" : ` (${champ.year})`;

        champContainer.innerHTML = `
            <div class="champion-box ${champClass}">
                <i class="fa-solid fa-trophy"></i>
                <div class="champ-label">ŞAMPİYON</div>
                <div class="champ-name">${champ.team_name}${yearText}</div>
                <div style="font-size:0.7rem; margin-top:5px; opacity:0.8;">GENEL GÜÇ: ${champ.rating}</div>
            </div>
        `;
    } else {
        champContainer.innerHTML = `
            <div class="champion-box-placeholder">
                <i class="fa-solid fa-trophy"></i>
                <span>Bekleniyor...</span>
            </div>
        `;
    }

    // Aksiyon butonunu güncelle
    const actionBtn = document.getElementById("btn-play-tournament-match");
    if (finalMatch && finalMatch.winner) {
        actionBtn.classList.add("hidden");
    } else {
        actionBtn.classList.remove("hidden");
        const roundNames = ["SON 16 MAÇINI OYNA", "ÇEYREK FİNAL MAÇINI OYNA", "YARI FİNAL MAÇINI OYNA", "FİNAL MAÇINI OYNA"];
        actionBtn.innerHTML = `${roundNames[tournamentRound]} <i class="fa-solid fa-play"></i>`;
    }
}

function playTournamentMatch() {
    // Bulunduğumuz turun maçını bul
    const currentRoundMatches = tournamentMatches[tournamentRound];
    const userMatch = currentRoundMatches.find(m => m.team1.isUser || m.team2.isUser);

    if (!userMatch) {
        alert("Eşleşme bulunamadı!");
        return;
    }

    // Rakip takımı belirle
    const opponent = userMatch.team1.isUser ? userMatch.team2 : userMatch.team1;
    currentOpponent = opponent;

    // Maç simülasyonu için rakibi ayarla
    opponentTeam = opponent;
    opponentTeamOvr = opponent.rating;

    // Simülasyona git
    goToSimulationForTournament();
}

function goToSimulationForTournament() {
    showScreen("screen-simulation");

    // Skorları Sıfırla
    document.getElementById("score-home").innerText = "0";
    document.getElementById("score-away").innerText = "0";
    document.getElementById("score-home").classList.remove("goal-anim");
    document.getElementById("score-away").classList.remove("goal-anim");
    document.getElementById("match-minute").innerText = "0'";

    homeScore = 0;
    awayScore = 0;
    homeScorers = [];
    awayScorers = [];

    // Ev sahibi gücü (Kullanıcı)
    document.getElementById("home-rating").innerText = myTeamOvr;

    // Deplasman ismi ve gücü
    const yearText = opponentTeam.isUser ? "" : ` (${opponentTeam.year})`;
    document.getElementById("opponent-team-name").innerText = `${opponentTeam.team_name}${yearText}`;
    document.getElementById("away-rating").innerText = opponentTeamOvr;

    // Canlı Anlatım panelini temizle
    const list = document.getElementById("commentary-list");
    list.innerHTML = `
        <div class="commentary-row event-start">
            <span class="time">00'</span>
            <span class="text">Hakem düdüğünü çalıyor ve tarihi maç başlıyor!</span>
        </div>
    `;

    // 1.5 saniye sonra simülasyonu başlat
    setTimeout(startMatchSimulation, 1500);
}

function simulateBackgroundMatchesForCurrentRound() {
    const currentRoundMatches = tournamentMatches[tournamentRound];
    currentRoundMatches.forEach(match => {
        // Kullanıcının maçını atla (o zaten oynandı)
        if (match.team1.isUser || match.team2.isUser) return;

        const ovr1 = match.team1.rating;
        const ovr2 = match.team2.rating;

        const totalOvr = ovr1 + ovr2;
        const p1 = ovr1 / totalOvr;

        // Gol simülasyonu: Güç farkına göre gol beklentisi (lambda) hesabı
        // Lambda değerlerinin <= 0 olmasını önlemek için alt sınır (0.4) ekliyoruz.
        const diff = ovr1 - ovr2;
        const lambda1 = Math.max(0.4, 1.3 + diff * 0.05);
        const lambda2 = Math.max(0.4, 1.3 - diff * 0.05);

        let score1 = getRandomGoalsPoisson(lambda1);
        let score2 = getRandomGoalsPoisson(lambda2);

        // Beraberlik olamaz
        while (score1 === score2) {
            if (Math.random() < p1) {
                score1++;
            } else {
                score2++;
            }
        }

        match.score1 = score1;
        match.score2 = score2;
        match.winner = score1 > score2 ? match.team1 : match.team2;
    });
}

function getRandomGoalsPoisson(lambda) {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return Math.max(0, k - 1);
}

function advanceWinnersToNextRound() {
    const currentRoundMatches = tournamentMatches[tournamentRound];
    const nextRoundIndex = tournamentRound + 1;

    tournamentMatches[nextRoundIndex] = [];

    for (let i = 0; i < currentRoundMatches.length; i += 2) {
        tournamentMatches[nextRoundIndex].push({
            team1: currentRoundMatches[i].winner,
            team2: currentRoundMatches[i + 1].winner,
            score1: null,
            score2: null,
            winner: null
        });
    }
}

function handleTournamentAction() {
    const btn = document.getElementById("btn-tournament-action");
    const action = btn.getAttribute("data-action");

    if (action === "advance") {
        document.getElementById("match-result-summary").classList.add("hidden");
        tournamentRound++; // Sonraki tura geç
        showScreen("screen-tournament");
        renderBracket();
    } else if (action === "win-tournament") {
        document.getElementById("match-result-summary").classList.add("hidden");
        // Turnuva sonrasını göster ve bracket'i güncelle
        renderBracket();
        // Müzeye kupa ekle
        Museum.addTrophy();
        // Anı posteri oluştur ve göster
        generatePoster(true);
    } else if (action === "lose-tournament") {
        document.getElementById("match-result-summary").classList.add("hidden");
        // Elenme posteri oluştur
        generatePoster(false);
    }
}

// ==================================================
// ANI POSTERİ SİSTEMİ
// ==================================================

function generatePoster(isChampion, savedSquad = null) {
    const posterCanvas = document.getElementById("poster-canvas");
    if (!posterCanvas) return;
    
    // Set active poster state
    activePosterIsChampion = isChampion;

    // Resolve data sources
    const squadPlayers = savedSquad ? savedSquad.squad : draftedPlayers;
    const formation = savedSquad ? savedSquad.formation : activeFormation;
    const currentConfig = formationConfigs[formation];

    // Turnuva yolunu derle
    const roundNames = ["Son 16", "Çeyrek Final", "Yarı Final", "Final"];
    let tournamentPathHTML = "";
    let reachedRoundLabel = "";

    if (savedSquad) {
        reachedRoundLabel = savedSquad.status;
        if (savedSquad.matches && savedSquad.matches.length > 0) {
            savedSquad.matches.forEach(m => {
                const rowClass = m.isWin ? "win" : "loss";
                const yearLabel = m.opYear ? ` '${m.opYear.toString().slice(-2)}` : "";
                tournamentPathHTML += `
                    <div class="poster-path-row ${rowClass}">
                        <span class="poster-path-round">${m.roundName}</span>
                        <span class="poster-path-matchup">vs ${m.opName}${yearLabel}</span>
                        <span class="poster-path-score">${m.userScore} - ${m.opScore}</span>
                    </div>
                `;
            });
        }
    } else if (isTournamentMode) {
        const lastRound = isChampion ? 3 : tournamentRound;
        reachedRoundLabel = isChampion ? "ŞAMPİYON" : roundNames[lastRound];

        for (let r = 0; r <= lastRound; r++) {
            const matches = tournamentMatches[r] || [];
            const userMatch = matches.find(m => m.team1.isUser || m.team2.isUser);
            if (!userMatch || userMatch.score1 === null) continue;

            const opName = userMatch.team1.isUser ? userMatch.team2.team_name : userMatch.team1.team_name;
            const opYear = userMatch.team1.isUser ? (userMatch.team2.year || "") : (userMatch.team1.year || "");
            const userScore = userMatch.team1.isUser ? userMatch.score1 : userMatch.score2;
            const opScore = userMatch.team1.isUser ? userMatch.score2 : userMatch.score1;
            const isWin = (userMatch.winner && userMatch.winner.isUser);
            const rowClass = isWin ? "win" : "loss";
            const yearLabel = opYear ? ` '${opYear.toString().slice(-2)}` : "";

            tournamentPathHTML += `
                <div class="poster-path-row ${rowClass}">
                    <span class="poster-path-round">${roundNames[r]}</span>
                    <span class="poster-path-matchup">vs ${opName}${yearLabel}</span>
                    <span class="poster-path-score">${userScore} - ${opScore}</span>
                </div>
            `;
        }
    } else {
        // Klasik modda son maç bilgisini göster
        reachedRoundLabel = "Klasik Mod";
        const opName = opponentTeam ? opponentTeam.team_name : "Rakip";
        const rowClass = homeScore > awayScore ? "win" : "loss";
        const resultLabel = homeScore > awayScore ? "GALİBİYET" : (homeScore === awayScore ? "BERABERLİK" : "MAĞLUBİYET");

        tournamentPathHTML = `
            <div class="poster-path-row ${rowClass}">
                <span class="poster-path-round">${resultLabel}</span>
                <span class="poster-path-matchup">vs ${opName}</span>
                <span class="poster-path-score">${homeScore} - ${awayScore}</span>
            </div>
        `;
    }

    // Formasyon satırlarını oluştur (sahaya benzer düzen)
    const formationRows = getFormationRowsForPoster(currentConfig, squadPlayers);
    let pitchHTML = "";
    formationRows.forEach(row => {
        let rowHTML = '<div class="poster-player-row">';
        row.forEach(p => {
            if (p) {
                const shortName = p.name.length > 12 ? p.name.substring(0, 11) + "…" : p.name;
                rowHTML += `
                    <div class="poster-player-chip">
                        <div class="poster-player-circle">${p.rating}</div>
                        <span class="poster-player-name">${shortName}</span>
                    </div>
                `;
            }
        });
        rowHTML += '</div>';
        pitchHTML += rowHTML;
    });

    // Takım istatistiklerini hesapla
    const filledPlayers = squadPlayers.filter(p => p !== null);
    const avgRating = filledPlayers.length > 0 ? Math.round(filledPlayers.reduce((a, c) => a + c.rating, 0) / filledPlayers.length) : 0;
    const bestPlayer = [...filledPlayers].sort((a, b) => b.rating - a.rating)[0];

    const resultStatus = savedSquad ? savedSquad.status : (isChampion ? "ŞAMPİYON" : (isTournamentMode ? "TURNUVA ANISI" : "DRAFT KADROM"));
    const resultSubtitle = savedSquad ? savedSquad.subtitle : (isChampion
        ? "Nostalji Draft Turnuvası Şampiyonu"
        : (isTournamentMode ? `${reachedRoundLabel} Turunda Elendi` : "Klasik Mod Anı Kartı"));

    const dateObj = savedSquad ? new Date(savedSquad.timestamp) : new Date();
    const dateStr = dateObj.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = dateObj.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    const pathSectionTitle = (savedSquad ? (savedSquad.matches && savedSquad.matches.length > 1) : isTournamentMode) ? "Turnuva Yolculuğu" : "Maç Sonucu";

    // Kadro oyuncu listesi (daktilo gazete lineup)
    const squadListHTML = squadPlayers.map((p, index) => {
        if (!p) return "";
        let posLabel = "OS";
        const slot = currentConfig[index];
        if (slot.type === "GK") posLabel = "KL";
        else if (slot.type === "DF") posLabel = "DF";
        else if (slot.type === "MF") posLabel = "OS";
        else if (slot.type === "FW") posLabel = "FV";

        return `
            <div class="poster-squad-item">
                <span class="poster-squad-pos">${posLabel}</span>
                <span class="poster-squad-name">${p.name}</span>
                <span class="poster-squad-dots"></span>
                <span class="poster-squad-rating">${p.rating}</span>
            </div>
        `;
    }).join("");

    posterCanvas.innerHTML = `
        <div class="poster-vintage-bg"></div>
        <div class="poster-inner-border">
            <!-- Retro Calendar Box on top right -->
            <div class="poster-calendar-box">
                <div class="cal-month">${dateObj.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase()}</div>
                <div class="cal-day">${dateObj.getDate()}</div>
                <div class="cal-weekday">${dateObj.toLocaleDateString("tr-TR", { weekday: "short" }).toUpperCase()}</div>
            </div>

            <div class="poster-header">
                <div class="poster-brand">SÜPER LİG NOSTALJİ DRAFT</div>
                <div class="poster-title">${resultStatus}</div>
                <div class="poster-subtitle">${resultSubtitle}</div>
                <div class="poster-divider-vintage"></div>
            </div>
            
            <div class="poster-pitch-section">
                <div class="poster-section-header">TAKTIK DIZILIŞ / ${formation}</div>
                <div class="poster-pitch-retro">
                    ${pitchHTML}
                </div>
            </div>
            
            <!-- Two-Column Layout for Squad and Scores -->
            <div class="poster-columns">
                <div class="poster-col-left">
                    <div class="poster-section-header">İLK 11 KADROMUZ</div>
                    <div class="poster-squad-list-retro">
                        ${squadListHTML}
                    </div>
                </div>
                <div class="poster-col-right">
                    <div class="poster-section-header">${pathSectionTitle.toUpperCase()}</div>
                    <div class="poster-path-list-retro">
                        ${tournamentPathHTML}
                    </div>
                </div>
            </div>
            
            <div class="poster-stats-vintage">
                <div class="poster-stat-badge">
                    <span class="label">GENEL GÜÇ</span>
                    <span class="val">${avgRating}</span>
                </div>
                <div class="poster-stat-badge">
                    <span class="label">EN İYİ OYUNCU</span>
                    <span class="val">${bestPlayer ? bestPlayer.name.toUpperCase() : "-"}</span>
                </div>
            </div>
            
            <div class="poster-footer-vintage">
                <div class="stamp-text">MATBAA-İ NOSTALJİ • ANKARA</div>
                <div class="date-stamp">${dateStr} • ${timeStr}</div>
            </div>
        </div>
    `;

    // Reset Save Museum button status for new posters
    const btnSaveMuseum = document.getElementById("btn-save-museum");
    if (btnSaveMuseum) {
        btnSaveMuseum.style.display = "inline-flex";
        if (!savedSquad) {
            btnSaveMuseum.innerHTML = '<i class="fa-solid fa-building-columns"></i> Müzeye Kaydet';
            btnSaveMuseum.disabled = false;
        }
    }

    // Modal'ı göster ve ölçekle
    document.getElementById("poster-modal").classList.remove("hidden");
    adjustPosterScale();
    requestAnimationFrame(adjustPosterScale);
}

function getFormationRowsForPoster(config, players) {
    // Formasyon slotlarını yukarıdan aşağıya (FW -> MF -> DF -> GK) sırala
    const slotsByTop = config.map((slot, index) => ({ ...slot, index, player: players[index] }));
    slotsByTop.sort((a, b) => parseFloat(a.top) - parseFloat(b.top));

    // Yakın top değerleri olan slotları aynı satıra koy
    const rows = [];
    let currentRow = [];
    let lastTop = -100;

    slotsByTop.forEach(slot => {
        const topVal = parseFloat(slot.top);
        if (Math.abs(topVal - lastTop) > 8) {
            if (currentRow.length > 0) rows.push(currentRow);
            currentRow = [];
            lastTop = topVal;
        }
        currentRow.push(slot.player);
    });
    if (currentRow.length > 0) rows.push(currentRow);

    return rows;
}

function downloadPoster() {
    const posterCanvas = document.getElementById("poster-canvas");
    if (!posterCanvas) return;
    const container = posterCanvas.parentElement;

    if (typeof html2canvas === "undefined") {
        alert("Poster indirme kütüphanesi yüklenemedi. Lütfen internet bağlantınızı kontrol edin.");
        return;
    }

    const downloadBtn = document.getElementById("btn-download-poster");
    const originalBtnHTML = downloadBtn ? downloadBtn.innerHTML : "";
    if (downloadBtn) {
        downloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> İndiriliyor...';
        downloadBtn.disabled = true;
    }

    // Save current styling to restore later
    const prevTransform = posterCanvas.style.transform;
    const prevTransformOrigin = posterCanvas.style.transformOrigin;
    const prevWidth = container.style.width;
    const prevHeight = container.style.height;
    const prevOverflow = container.style.overflow;

    // Reset to native layout temporarily for html2canvas capture
    posterCanvas.style.transform = "none";
    container.style.width = "auto";
    container.style.height = "auto";
    container.style.overflow = "visible";

    html2canvas(posterCanvas, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
    }).then(canvas => {
        // Restore styles immediately
        posterCanvas.style.transform = prevTransform;
        posterCanvas.style.transformOrigin = prevTransformOrigin;
        container.style.width = prevWidth;
        container.style.height = prevHeight;
        container.style.overflow = prevOverflow;

        if (downloadBtn) {
            downloadBtn.innerHTML = originalBtnHTML;
            downloadBtn.disabled = false;
        }

        const link = document.createElement("a");
        link.download = "super-lig-nostalji-draft-poster.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    }).catch(err => {
        posterCanvas.style.transform = prevTransform;
        posterCanvas.style.transformOrigin = prevTransformOrigin;
        container.style.width = prevWidth;
        container.style.height = prevHeight;
        container.style.overflow = prevOverflow;

        if (downloadBtn) {
            downloadBtn.innerHTML = originalBtnHTML;
            downloadBtn.disabled = false;
        }
        console.error("Poster indirme hatası:", err);
        alert("Poster indirilemedi.");
    });
}

async function sharePoster() {
    const posterCanvas = document.getElementById("poster-canvas");
    if (!posterCanvas) return;
    const container = posterCanvas.parentElement;

    if (typeof html2canvas === "undefined") {
        alert("Poster paylaşım kütüphanesi yüklenemedi.");
        return;
    }

    const shareBtn = document.getElementById("btn-share-poster");
    const originalBtnHTML = shareBtn ? shareBtn.innerHTML : "";
    if (shareBtn) {
        shareBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Hazırlanıyor...';
        shareBtn.disabled = true;
    }

    // Save current styling to restore later
    const prevTransform = posterCanvas.style.transform;
    const prevTransformOrigin = posterCanvas.style.transformOrigin;
    const prevWidth = container.style.width;
    const prevHeight = container.style.height;
    const prevOverflow = container.style.overflow;

    // Reset to native layout temporarily
    posterCanvas.style.transform = "none";
    container.style.width = "auto";
    container.style.height = "auto";
    container.style.overflow = "visible";

    try {
        const canvas = await html2canvas(posterCanvas, {
            scale: 2,
            backgroundColor: null,
            useCORS: true
        });

        // Restore styles immediately
        posterCanvas.style.transform = prevTransform;
        posterCanvas.style.transformOrigin = prevTransformOrigin;
        container.style.width = prevWidth;
        container.style.height = prevHeight;
        container.style.overflow = prevOverflow;

        if (shareBtn) {
            shareBtn.innerHTML = originalBtnHTML;
            shareBtn.disabled = false;
        }

        canvas.toBlob(async (blob) => {
            if (!blob) {
                alert("Poster görseli oluşturulamadı.");
                return;
            }
            if (navigator.share && navigator.canShare) {
                const file = new File([blob], "nostalji-draft-poster.png", { type: "image/png" });
                const shareData = {
                    title: "Süper Lig Nostalji Draft",
                    text: "Benim Nostalji Draft kadrom ve maç sonucum!",
                    files: [file]
                };

                if (navigator.canShare(shareData)) {
                    try {
                        await navigator.share(shareData);
                        return;
                    } catch (shareErr) {
                        if (shareErr.name === 'AbortError') return;
                    }
                }
            }

            // Fallback: Clipboard API ile kopyala
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob })
                ]);
                alert("Poster panoya kopyalandı! Artık herhangi bir yere yapıştırabilirsiniz.");
            } catch (e) {
                // Son çare: İndir
                const link = document.createElement("a");
                link.download = "nostalji-draft-poster.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
                alert("Poster indirildi. İndirilen dosyayı paylaşabilirsiniz.");
            }
        }, "image/png");
    } catch (e) {
        // Restore on error
        posterCanvas.style.transform = prevTransform;
        posterCanvas.style.transformOrigin = prevTransformOrigin;
        container.style.width = prevWidth;
        container.style.height = prevHeight;
        container.style.overflow = prevOverflow;

        if (shareBtn) {
            shareBtn.innerHTML = originalBtnHTML;
            shareBtn.disabled = false;
        }
        console.error("Poster paylaşımı sırasında hata:", e);
        alert("Poster oluşturulamadı.");
    }
}

function closePosterModal() {
    const modal = document.getElementById("poster-modal");
    if (modal) {
        modal.classList.add("hidden");
    }
    if (!isViewingSavedPoster && !currentMpRoomData && isTournamentMode) {
        resetGameToDraft();
    }
    isViewingSavedPoster = false; // Reset flag
}

function resetGameToDraft() {
    isTournamentMode = false;
    draftedPlayers = Array(11).fill(null);
    rolledTeam = null;
    selectedPlayerToPlace = null;
    currentRunMatches = []; // Clear run history

    // DOM Reset
    document.getElementById("team-result-card").classList.add("hidden");
    document.getElementById("btn-to-simulation").classList.add("hidden");
    document.getElementById("match-result-summary").classList.add("hidden");

    document.getElementById("filled-slots-count-badge").innerText = "0 / 11";
    document.getElementById("team-ovr-val").innerText = "--";
    document.getElementById("team-atk-val").innerText = "--";
    document.getElementById("team-def-val").innerText = "--";
    document.getElementById("bar-team-ovr").style.width = "0%";
    document.getElementById("bar-team-atk").style.width = "0%";
    document.getElementById("bar-team-def").style.width = "0%";
    document.getElementById("btn-roll-dice").disabled = false;

    // Show Screen 0 (Main Menu) instead of Setup
    showScreen("screen-main-menu");

    // Reset multiplayer state if returning to main menu
    stopPolling();
    currentRoomCode = "";
    isMpSimRunning = false;
}

// ==================================================
// MULTIPLAYER (AJAX POLLING) LOGIC
// ==================================================
const currentMultiplayerMode = 2;
let myUsername = "";
let currentRoomCode = "";
let pollingInterval = null;
let lastRoomStatus = "";

const API_ROUTES = {
    create_room: "/api/rooms/create",
    join_room: "/api/rooms/join",
    set_ready: "/api/rooms/ready",
    get_room_state: "/api/rooms/state",
    get_tycoon_leaderboard: "/api/tycoon/leaderboard",
    save_tycoon_rank: "/api/tycoon/leaderboard"
};

async function apiRequest(action, data = {}) {
    try {
        const endpoint = API_ROUTES[action] || `/api/rooms/${action}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (e) {
        console.error("API Hatası:", e);
        return { success: false, message: "Sunucu bağlantı hatası." };
    }
}

async function apiGet(action, params = "") {
    try {
        const base = API_ROUTES[action] || `/api/rooms/${action}`;
        const url = params ? `${base}?${params}` : base;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });
        return await response.json();
    } catch (e) {
        console.error("API Hatası:", e);
        return { success: false, message: "Sunucu bağlantı hatası." };
    }
}

function startPolling() {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(pollRoomState, 1000);
}

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

async function pollRoomState() {
    if (!currentRoomCode) return;

    const res = await apiGet('get_room_state', `roomCode=${currentRoomCode}`);
    if (res.success && res.data && res.data.room) {
        const room = res.data.room;
        updateLobbyPlayers(room.players, room.maxPlayers);

        // Status değişti mi kontrol et
        if (room.status !== lastRoomStatus) {
            lastRoomStatus = room.status;

            if (room.status === 'drafting') {
                const lobbyStatus = document.getElementById("lobby-status-text");
                if (lobbyStatus) lobbyStatus.innerText = "Tüm oyuncular katıldı! Formasyon seçimi başlıyor...";
                setTimeout(() => {
                    isTournamentMode = false;
                    document.getElementById("mode-tag").innerHTML = '<i class="fa-solid fa-users"></i> 2 KİŞİLİK DRAFT';
                    showScreen("screen-setup");
                    document.getElementById("btn-to-simulation").innerHTML = 'DRAFTI BİTİR VE LİGE GEÇ <i class="fa-solid fa-flag-checkered"></i>';
                }, 1500);
            } else if (room.status === 'finished') {
                stopPolling();
                const lobbyStatus = document.getElementById("lobby-status-text");
                if (lobbyStatus) lobbyStatus.innerText = "Her iki menajer de hazır! Büyük Derbi Başlıyor...";
                setTimeout(() => {
                    startMultiplayerSimulation(room);
                }, 1000);
            }
        }
    } else {
        // Oda bulunamadı veya silindi
        stopPolling();
        alert("Oda bağlantısı koptu veya oda silindi.");
        showScreen("screen-main-menu");
    }
}

function showLobby(roomCode, players, maxPlayers) {
    document.getElementById("lobby-room-code").innerText = roomCode;
    updateLobbyPlayers(players, maxPlayers);
    lastRoomStatus = "waiting";

    startPolling();
    showScreen("screen-lobby");
}

function updateLobbyPlayers(players, maxPlayers) {
    const grid = document.getElementById("lobby-players-grid");
    grid.innerHTML = "";

    for (let i = 0; i < maxPlayers; i++) {
        if (i < players.length) {
            const p = players[i];
            const readyClass = p.ready ? "ready" : "";
            const readyIcon = p.ready ? "fa-circle-check" : "fa-user";
            grid.innerHTML += `
                <div class="lobby-player-card ${readyClass}">
                    <div class="lobby-player-icon"><i class="fa-solid ${readyIcon}"></i></div>
                    <div class="lobby-player-name">${p.username}</div>
                    <div class="lobby-player-status" style="font-size: 0.8rem; margin-top:5px; color: #666;">
                        ${p.ready ? "Hazır" : "Bekleniyor..."}
                    </div>
                </div>
            `;
        } else {
            grid.innerHTML += `
                <div class="lobby-player-card" style="opacity: 0.5;">
                    <div class="lobby-player-icon"><i class="fa-solid fa-user-plus"></i></div>
                    <div class="lobby-player-name">Bekleniyor...</div>
                </div>
            `;
        }
    }
}

function renderLeagueResults(results) {
    const standingsSection = document.getElementById("league-standings-section");
    const matchesTitle = document.getElementById("league-matches-title");
    const championTitle = document.getElementById("league-champion-title");
    const championName = document.getElementById("league-champion-name");
    const trophyIcon = document.getElementById("league-trophy-icon");

    const isDerby = !results.matches || results.matches.length <= 1;

    if (isDerby) {
        if (standingsSection) standingsSection.style.display = "none";
        if (matchesTitle) matchesTitle.innerText = "MAÇ SONUCU";

        const match = results.matches[0];
        if (match) {
            let winnerName = results.champion;
            if (!winnerName) {
                if (match.penaltyResults && match.penaltyResults.winner) {
                    winnerName = (match.penaltyResults.winner === 'home') ? match.home : match.away;
                } else if (match.homeScore > match.awayScore) {
                    winnerName = match.home;
                } else if (match.awayScore > match.homeScore) {
                    winnerName = match.away;
                }
            }

            if (winnerName) {
                if (championTitle) championTitle.innerText = "DERBİNİN ŞAMPİYONU";
                let penText = "";
                if (match.hasPenalties && match.penaltyResults) {
                    penText = ` <span style="font-size:0.85rem; color:#666; font-weight:normal; display:inline-block; margin-left:6px;">(Penaltılar: ${match.penaltyResults.pHomeScore} - ${match.penaltyResults.pAwayScore})</span>`;
                } else if (match.hasExtraTime) {
                    penText = ` <span style="font-size:0.85rem; color:#666; font-weight:normal; display:inline-block; margin-left:6px;">(Uzatmalarda)</span>`;
                }
                if (championName) championName.innerHTML = winnerName + ' <i class="fa-solid fa-trophy" style="color:#ffd700; font-size:1.2rem; margin-left:5px;"></i>' + penText;
                if (trophyIcon) trophyIcon.innerHTML = '<i class="fa-solid fa-trophy"></i>';
            } else {
                if (championTitle) championTitle.innerText = "MAÇ SONUCU";
                if (championName) championName.innerHTML = 'Beraberlik <i class="fa-solid fa-handshake" style="color:#8b5a2b; font-size:1.2rem; margin-left:5px;"></i>';
                if (trophyIcon) trophyIcon.innerHTML = '<i class="fa-solid fa-handshake"></i>';
            }
        }
    } else {
        // 4 Player League Mode
        if (standingsSection) standingsSection.style.display = "block";
        if (matchesTitle) matchesTitle.innerText = "LİG MAÇLARI VE SONUÇLARI";
        if (championTitle) championTitle.innerText = "LİG ŞAMPİYONU";
        if (championName) championName.innerHTML = results.champion + ' <i class="fa-solid fa-trophy" style="color:#ffd700; font-size:1.2rem; margin-left:5px;"></i>';
        if (trophyIcon) trophyIcon.innerHTML = '<i class="fa-solid fa-trophy"></i>';
    }

    // Tablo
    const tbody = document.getElementById("league-standings-body");
    if (tbody) {
        tbody.innerHTML = "";
        results.standings.forEach((s, index) => {
            const tr = document.createElement("tr");
            const av = s.goalsFor - s.goalsAgainst;
            const sign = av > 0 ? "+" : "";
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${s.username}</strong><br><small style="color:#666;">${s.formation}</small></td>
                <td>${s.rating}</td>
                <td>${s.played}</td>
                <td>${s.won}</td>
                <td>${s.drawn}</td>
                <td>${s.lost}</td>
                <td>${s.goalsFor}</td>
                <td>${s.goalsAgainst}</td>
                <td style="color:${av > 0 ? 'green' : (av < 0 ? 'red' : 'inherit')}">${sign}${av}</td>
                <td style="font-weight:bold; color:var(--color-primary);">${s.points}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Maç Sonuçları
    const matchesList = document.getElementById("league-matches-list");
    if (matchesList) {
        matchesList.innerHTML = "";
        const displayMatches = isDerby ? results.matches.slice(0, 1) : results.matches;

        displayMatches.forEach(m => {
            if (!m || !m.home || !m.away) return;
            let homeWin = m.homeScore > m.awayScore;
            let awayWin = m.awayScore > m.homeScore;
            if (m.hasPenalties && m.penaltyResults) {
                homeWin = (m.penaltyResults.winner === 'home');
                awayWin = (m.penaltyResults.winner === 'away');
            }

            let badge = "";
            if (m.hasPenalties && m.penaltyResults) {
                badge = `<div style="font-size:0.75rem; color:#666; font-weight:normal;">P: ${m.penaltyResults.pHomeScore} - ${m.penaltyResults.pAwayScore}</div>`;
            } else if (m.hasExtraTime) {
                badge = `<div style="font-size:0.75rem; color:#666; font-weight:normal;">(Uzatma)</div>`;
            }

            matchesList.innerHTML += `
                <div class="league-match-row">
                    <div style="flex:1; text-align:right; font-weight:${homeWin ? '900' : 'normal'}">${m.home} (${m.homeRating})</div>
                    <div style="flex:0 0 80px; text-align:center; font-weight:900; background:#f0f0f0; border-radius:4px; margin:0 10px; padding:2px 4px;">
                        <div>${m.homeScore} - ${m.awayScore}</div>
                        ${badge}
                    </div>
                    <div style="flex:1; text-align:left; font-weight:${awayWin ? '900' : 'normal'}">${m.away} (${m.awayRating})</div>
                </div>
            `;
        });
    }

    // Ensure Anı Posteri button is visible on results screen
    const posterBtn = document.getElementById("btn-league-mp-poster");
    if (posterBtn) {
        posterBtn.style.display = "inline-flex";
    }
}

// Multiplayer Main Menu Event Listeners
function initMultiplayerAndMenuListeners() {
    if (window.__mpMenuReady) return;
    window.__mpMenuReady = true;
    // WhatsApp Share Buttons
    const btnShareWaLobby = document.getElementById("btn-share-whatsapp-lobby");
    if (btnShareWaLobby) {
        btnShareWaLobby.addEventListener("click", () => {
            const roomCode = document.getElementById("lobby-room-code").innerText || "------";
            const text = `Süper Lig Nostalji Draft'ta oda kurdum! Oda Kodu: ${roomCode}. Gel kadronu kur, kapışalım: https://superligdraft.site/`;
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
        });
    }

    const btnShareWaResult = document.getElementById("btn-share-whatsapp-result");
    if (btnShareWaResult) {
        btnShareWaResult.addEventListener("click", () => {
            const text = `Süper Lig Nostalji Draft'ta efsanevi derbi bitti! Sen de nostalji kadronu kur ve arkadaşlarına meydan oku: https://superligdraft.site/`;
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
        });
    }

    // Initial render of achievements
    renderMuseumAchievements();

    // Scroll down tab listener for SEO section
    const btnScrollSeo = document.getElementById("btn-scroll-seo");
    if (btnScrollSeo) {
        btnScrollSeo.addEventListener("click", () => {
            const seoContainer = document.querySelector(".seo-editorial-container");
            if (seoContainer) {
                seoContainer.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // Menu Buttons
    document.getElementById("btn-mode-classic").addEventListener("click", () => {
        document.getElementById("mode-tag").innerHTML = '<i class="fa-solid fa-user"></i> KLASİK MOD';
        showScreen("screen-setup");
    });

    document.getElementById("btn-mode-multi-2").addEventListener("click", () => {
        document.getElementById("mode-tag").innerHTML = '<i class="fa-solid fa-user-group"></i> 2 KİŞİLİK DRAFT';
        setupMultiplayerScreen();
    });

    const btnModeTycoon = document.getElementById("btn-mode-tycoon");
    if (btnModeTycoon) {
        btnModeTycoon.addEventListener("click", (e) => {
            if (btnModeTycoon.disabled || btnModeTycoon.hasAttribute("disabled")) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            document.getElementById("mode-tag").innerHTML = '<i class="fa-solid fa-city"></i> KULÜP TYCOON';
            showScreen("screen-tycoon");
            if (typeof initTycoonModule === "function") {
                initTycoonModule();
            }
        });
    }

    const btnTycoonBackMenu = document.getElementById("btn-tycoon-back-menu");
    if (btnTycoonBackMenu) {
        btnTycoonBackMenu.addEventListener("click", () => {
            document.getElementById("mode-tag").innerHTML = '<i class="fa-solid fa-gamepad"></i> ANA MENÜ';
            showScreen("screen-main-menu");
        });
    }

    function setupMultiplayerScreen() {
        document.getElementById("mp-mode-title").innerText = '2 KİŞİLİK DRAFT';
        document.getElementById("mp-error-msg").classList.add("hidden");
        showScreen("screen-multiplayer-setup");
    }

    // Multiplayer Setup Buttons
    document.getElementById("btn-create-room").addEventListener("click", async () => {
        myUsername = document.getElementById("mp-username-input").value.trim();
        if (!myUsername) {
            alert("Lütfen bir kullanıcı adı girin.");
            return;
        }

        const btn = document.getElementById("btn-create-room");
        btn.disabled = true;

        const res = await apiRequest("create_room", { username: myUsername, maxPlayers: currentMultiplayerMode });
        btn.disabled = false;

        if (res.success) {
            currentRoomCode = res.data.roomCode;
            showLobby(currentRoomCode, res.data.room.players, currentMultiplayerMode);
        } else {
            const errorMsg = document.getElementById("mp-error-msg");
            errorMsg.innerText = res.message;
            errorMsg.classList.remove("hidden");
        }
    });

    document.getElementById("btn-join-room").addEventListener("click", async () => {
        myUsername = document.getElementById("mp-username-input").value.trim();
        const roomCode = document.getElementById("mp-room-code-input").value.trim().toUpperCase();

        if (!myUsername) {
            alert("Lütfen bir kullanıcı adı girin.");
            return;
        }
        if (!roomCode) {
            alert("Lütfen bir oda kodu girin.");
            return;
        }

        const btn = document.getElementById("btn-join-room");
        btn.disabled = true;

        const res = await apiRequest("join_room", { username: myUsername, roomCode: roomCode });
        btn.disabled = false;

        if (res.success) {
            currentRoomCode = roomCode;
            if (res.data.room.maxPlayers !== 2) {
                alert('Bu oda artık desteklenmiyor. Yalnızca 2 kişilik derbi odaları açıktır.');
                return;
            }
            showLobby(currentRoomCode, res.data.room.players, 2);
        } else {
            const errorMsg = document.getElementById("mp-error-msg");
            errorMsg.innerText = res.message;
            errorMsg.classList.remove("hidden");
        }
    });

    document.getElementById("btn-back-to-menu").addEventListener("click", () => {
        stopPolling();
        currentRoomCode = "";
        document.getElementById("mode-tag").innerHTML = '<i class="fa-solid fa-gamepad"></i> ANA MENÜ';
        showScreen("screen-main-menu");
    });

    // Copy Code Button
    document.getElementById("btn-copy-code").addEventListener("click", () => {
        navigator.clipboard.writeText(currentRoomCode);
        const btn = document.getElementById("btn-copy-code");
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Kopyalandı!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-copy"></i> Kopyala';
        }, 2000);
    });

    // Yeni Oyun (Lig Sonuçlarından)
    document.getElementById("btn-league-new-game").addEventListener("click", () => {
        resetGameToDraft();
    });

    // Mevcut "Maça Başla / Turnuvaya Git" butonu override
    const btnToSim = document.getElementById("btn-to-simulation");
    const originalToSimClone = btnToSim.cloneNode(true);
    btnToSim.parentNode.replaceChild(originalToSimClone, btnToSim);

    // Add logic to new clone to handle both classic and multiplayer
    document.getElementById("btn-to-simulation").addEventListener("click", async () => {
        if (currentRoomCode) {
            // Multiplayer Mode! Send draft data to server and go to waiting screen
            const filledPlayers = draftedPlayers.filter(p => p !== null);
            const teamRating = Math.round(filledPlayers.reduce((acc, curr) => acc + curr.rating, 0) / filledPlayers.length);

            const btn = document.getElementById("btn-to-simulation");
            btn.disabled = true;
            btn.innerHTML = 'Gönderiliyor...';

            const res = await apiRequest("set_ready", {
                username: myUsername,
                roomCode: currentRoomCode,
                rating: teamRating,
                formation: activeFormation,
                squad: filledPlayers
            });

            btn.disabled = false;

            if (res.success) {
                if (res.data && res.data.room && res.data.room.status === 'finished') {
                    stopPolling();
                    const statusText = document.getElementById("lobby-status-text");
                    if (statusText) statusText.innerText = "Her iki menajer de hazır! Büyük Derbi Başlıyor...";
                    showScreen("screen-lobby");
                    setTimeout(() => {
                        startMultiplayerSimulation(res.data.room);
                    }, 1000);
                } else {
                    const statusText = document.getElementById("lobby-status-text");
                    if (statusText) statusText.innerText = "Diğer menajerin kadrosunu kurması bekleniyor...";
                    showScreen("screen-lobby");
                    startPolling();
                }
            } else {
                alert("Veri gönderilirken hata oluştu: " + res.message);
                btn.innerHTML = 'DRAFTI BİTİR VE LİGE GEÇ <i class="fa-solid fa-flag-checkered"></i>';
            }
        } else {
            // Classic Mode
            initializeTournament();
        }
    });
}

// ==================================================
// MULTIPLAYER SQUADS DISPLAY & POSTER
// ==================================================

let currentMpRoomData = null;

function initMpPosterListeners() {
    if (window.__mpPosterReady) return;
    window.__mpPosterReady = true;
    // Poster Butonu
    const btnMpPoster = document.getElementById("btn-league-mp-poster");
    if (btnMpPoster) btnMpPoster.addEventListener("click", generateMultiplayerPoster);
}

window.initDraftGame = function () {
    initCoreGame();
    initMultiplayerAndMenuListeners();
    initMpPosterListeners();
};

function renderMultiplayerInlineSquads(room) {
    // 2 Oyuncu Modu için
    if (room.maxPlayers === 2) {
        const match = room.leagueResults.matches[0];
        if (!match) return;

        const homePlayer = room.players.find(p => p.username === match.home);
        const awayPlayer = room.players.find(p => p.username === match.away);

        const container = document.getElementById("mp-sim-2-squads-container");
        if (container) {
            container.innerHTML = `
                <div class="mp-sim-squads-title">KADROLAR</div>
                <div class="mp-sim-squads-columns">
                    <div class="mp-sim-squad-col">
                        <div class="mp-sim-squad-team-name">${match.home} (${homePlayer ? homePlayer.formation : '4-4-2'}) - GÜÇ: ${match.homeRating}</div>
                        <div class="mp-sim-squad-list">
                            ${generateInlineSquadListHTML(homePlayer)}
                        </div>
                    </div>
                    <div class="mp-sim-squad-col">
                        <div class="mp-sim-squad-team-name">${match.away} (${awayPlayer ? awayPlayer.formation : '4-4-2'}) - GÜÇ: ${match.awayRating}</div>
                        <div class="mp-sim-squad-list">
                            ${generateInlineSquadListHTML(awayPlayer)}
                        </div>
                    </div>
                </div>
            `;
        }
    }
    // 4 Oyuncu Modu için
    else if (room.maxPlayers === 4) {
        const container = document.getElementById("mp-sim-4-squads-container");
        if (container) {
            let colsHTML = "";
            room.players.forEach(p => {
                colsHTML += `
                    <div class="mp-sim-squad-col">
                        <div class="mp-sim-squad-team-name">${p.username} (${p.formation}) - GÜÇ: ${p.rating}</div>
                        <div class="mp-sim-squad-list">
                            ${generateInlineSquadListHTML(p)}
                        </div>
                    </div>
                `;
            });

            container.innerHTML = `
                <div class="mp-sim-squads-title">TAKIM KADROLARI</div>
                <div class="mp-sim-squads-grid-4">
                    ${colsHTML}
                </div>
            `;
        }
    }
}

function generateInlineSquadListHTML(player) {
    if (!player || !player.squad || player.squad.length === 0) {
        return `<div style="font-size:0.8rem; color:#666;">Kadro bulunamadı.</div>`;
    }

    // Sort players: GK -> DF -> OS -> FV
    const posOrder = { 'GK': 1, 'DF': 2, 'MF': 3, 'FW': 4 };
    const sortedSquad = [...player.squad].sort((a, b) => {
        if (!a || !b) return 0;
        const orderA = posOrder[a.position] || 99;
        const orderB = posOrder[b.position] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return b.rating - a.rating;
    });

    return sortedSquad.map(p => {
        if (!p) return "";
        let displayPos = "OS";
        if (p.position === "GK") displayPos = "KL";
        else if (p.position === "DF") displayPos = "DF";
        else if (p.position === "MF") displayPos = "OS";
        else if (p.position === "FW") displayPos = "FV";

        return `
            <div class="mp-sim-squad-item">
                <span class="pos">${displayPos}</span>
                <span class="name" title="${p.name}">${p.name}</span>
                <span class="rating">${p.rating}</span>
            </div>
        `;
    }).join("");
}

// ==================================================
// MULTIPLAYER SIMULATION (VISUAL ENGINE)
// ==================================================

function distributeMultiplayerEvents(match, room) {
    let events = [];

    const getScorer = (username) => {
        const p = room.players.find(x => x.username === username);
        if (!p || !p.squad) return { name: "Oyuncu" };
        const attackers = p.squad.filter(x => x && (x.position === 'FW' || x.position === 'MF'));
        if (attackers.length === 0) return p.squad.find(x => x !== null) || { name: "Oyuncu" };
        return attackers[Math.floor(Math.random() * attackers.length)];
    };
    const getDefender = (username) => {
        const p = room.players.find(x => x.username === username);
        if (!p || !p.squad) return { name: "Kaleci" };
        const defs = p.squad.filter(x => x && (x.position === 'DF' || x.position === 'GK'));
        if (defs.length === 0) return p.squad.find(x => x !== null) || { name: "Savunma" };
        return defs[Math.floor(Math.random() * defs.length)];
    };

    const regHome = match.regularHomeScore ?? match.homeScore;
    const regAway = match.regularAwayScore ?? match.awayScore;
    const hasET = Boolean(match.hasExtraTime);
    const extraHome = match.extraHomeScore ?? 0;
    const extraAway = match.extraAwayScore ?? 0;

    // Goals for Home (Normal Time)
    for (let i = 0; i < regHome; i++) {
        const scorer = getScorer(match.home);
        const assist = getScorer(match.home);

        let text = "";
        if (Math.random() < 0.15) {
            text = `PENALTI GOLÜ! ${scorer.name} beyaz noktadan soğukkanlı bir vuruşla topu ağlara yolluyor!`;
        } else {
            const texts = [
                `GOOOOL! ${scorer.name} kaleciyle karşı karşıya kaldı ve köşeyi gördü!`,
                `GOOOOOL! ${assist.name}'in harika pasında ${scorer.name} gelişine sert vurdu!`,
                `GOL! Ceza sahasındaki karambolde ${scorer.name} topu ağlara gönderdi!`,
                `MÜTHİŞ GOL! ${scorer.name} uzaktan harika bir füze çıkardı!`
            ];
            text = texts[Math.floor(Math.random() * texts.length)];
        }
        events.push({ minute: Math.floor(Math.random() * 86) + 4, team: 'home', type: 'goal', text: text, name: match.home, triggerVarConfirm: Math.random() < 0.12 });
    }
    // Goals for Away (Normal Time)
    for (let i = 0; i < regAway; i++) {
        const scorer = getScorer(match.away);
        const assist = getScorer(match.away);

        let text = "";
        if (Math.random() < 0.15) {
            text = `PENALTI GOLÜ! ${scorer.name} penaltı vuruşunda kaleciyi ters köşeye yatırarak golü buluyor!`;
        } else {
            const texts = [
                `GOL! ${scorer.name} savunmanın arkasına sarkıp golü attı.`,
                `GOOOOL! ${assist.name}'in ortasında ${scorer.name} şık bir kafa vuruşuyla ağları buldu!`,
                `GOL! Savunmanın hatasını affetmeyen ${scorer.name} topu ağlara yolladı.`
            ];
            text = texts[Math.floor(Math.random() * texts.length)];
        }
        events.push({ minute: Math.floor(Math.random() * 86) + 4, team: 'away', type: 'goal', text: text, name: match.away, triggerVarConfirm: Math.random() < 0.12 });
    }

    // Misses
    const numMisses = Math.floor(Math.random() * 4) + 3;
    for (let i = 0; i < numMisses; i++) {
        const isHomeAttacking = Math.random() > 0.5;
        const attacker = getScorer(isHomeAttacking ? match.home : match.away);
        const defender = getDefender(isHomeAttacking ? match.away : match.home);

        let text = "";
        if (Math.random() < 0.15) {
            text = `PENALTI KAÇTI! ${attacker.name} penaltı vuruşunda topu direğe nişanlıyor, inanılmaz şanssızlık!`;
        } else {
            const texts = [
                `${attacker.name} çok sert vurdu ancak ${defender.name} harika çeliyor!`,
                `${attacker.name} kaleciyle karşı karşıya topu dışarı vurdu! Net fırsat kaçtı!`,
                `${attacker.name} uzaktan denedi, top direği sıyırarak auta çıktı.`
            ];
            text = texts[Math.floor(Math.random() * texts.length)];
        }
        events.push({ minute: Math.floor(Math.random() * 86) + 3, team: isHomeAttacking ? 'home' : 'away', type: 'miss', text: text });
    }

    // Cosmetic VAR Cancelled Goals
    if (Math.random() < 0.3) {
        const isHome = Math.random() > 0.5;
        const scorer = getScorer(isHome ? match.home : match.away);
        events.push({
            minute: Math.floor(Math.random() * 70) + 15,
            team: isHome ? 'home' : 'away',
            type: 'var-cancelled',
            text: `GOL! ${scorer.name} topu filelere gönderdi! Deplasman tribünü coşuyor!`,
            cancelText: `VAR KARARI: GOL İPTAL! Pozisyon öncesi faul tespit edildi. Gol geçersiz sayıldı!`
        });
    }

    // Extra Time
    if (hasET) {
        events.push({
            minute: 90,
            type: 'phase',
            text: `Normal süre ${regHome} - ${regAway} eşitlikle tamamlandı! Büyük derbi 30 dakikalık uzatmalara gidiyor.`
        });

        for (let i = 0; i < extraHome; i++) {
            const scorer = getScorer(match.home);
            events.push({
                minute: Math.floor(Math.random() * 26) + 92,
                team: 'home',
                type: 'goal',
                text: `UZATMALARDA KRİTİK GOL! ${scorer.name} sahneye çıkıyor ve takımını öne geçiriyor!`,
                name: match.home,
                triggerVarConfirm: false
            });
        }

        for (let i = 0; i < extraAway; i++) {
            const scorer = getScorer(match.away);
            events.push({
                minute: Math.floor(Math.random() * 26) + 92,
                team: 'away',
                type: 'goal',
                text: `UZATMA DAKİKALARINDA İNANILMAZ GOL! ${scorer.name} ağları havalandırıyor!`,
                name: match.away,
                triggerVarConfirm: false
            });
        }

        events.push({
            minute: 105,
            type: 'phase',
            text: "Uzatma devresinin ilk 15 dakikası sona erdi (105'). İkinci uzatma devresi başlıyor!"
        });

        if (match.hasPenalties) {
            events.push({
                minute: 120,
                type: 'phase',
                text: `120 dakika sonunda eşitlik bozulmadı (${match.homeScore} - ${match.awayScore})! Şampiyonu belirlemek için seri penaltı atışlarına geçiliyor...`
            });
        }
    }

    events.sort((a, b) => {
        if (a.minute === b.minute) {
            const orderA = a.type === 'phase' ? 0 : 1;
            const orderB = b.type === 'phase' ? 0 : 1;
            return orderA - orderB;
        }
        return a.minute - b.minute;
    });

    let rH = 0;
    let rA = 0;
    events.forEach(e => {
        if (e.type === 'goal') {
            if (e.team === 'home') rH++;
            else rA++;
        }
        e.homeScore = rH;
        e.awayScore = rA;
    });

    return events;
}

let isMpSimRunning = false;

function startMultiplayerSimulation(room) {
    if (!room || !room.leagueResults) return;
    if (isMpSimRunning) return;
    isMpSimRunning = true;

    currentMpRoomData = room;
    renderMultiplayerInlineSquads(room);

    if (room.maxPlayers === 2 || (room.players && room.players.length === 2)) {
        simulateMP2(room);
    } else {
        simulateMP4(room);
    }
}

// --------------------------------------------------
// HELPER FOR STANDINGS RECALCULATION
// --------------------------------------------------
function recalculateStandingsLocally(room) {
    let standings = [];
    room.players.forEach(p => {
        standings.push({
            username: p.username,
            formation: p.formation,
            rating: p.rating,
            played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0
        });
    });

    const getStandings = (name) => standings.find(s => s.username === name);

    room.leagueResults.matches.forEach(m => {
        const home = getStandings(m.home);
        const away = getStandings(m.away);
        if (!home || !away) return;

        home.played++;
        away.played++;
        home.goalsFor += m.homeScore;
        home.goalsAgainst += m.awayScore;
        away.goalsFor += m.awayScore;
        away.goalsAgainst += m.homeScore;

        if (m.homeScore > m.awayScore) {
            home.won++;
            home.points += 3;
            away.lost++;
        } else if (m.homeScore < m.awayScore) {
            away.won++;
            away.points += 3;
            home.lost++;
        } else {
            // Draw in goals: check penalty shootout winner if exists
            if (m.penaltyResults && m.penaltyResults.winner) {
                if (m.penaltyResults.winner === 'home') {
                    home.won++;
                    home.points += 3;
                    away.lost++;
                } else {
                    away.won++;
                    away.points += 3;
                    home.lost++;
                }
            } else {
                home.drawn++;
                away.drawn++;
                home.points += 1;
                away.points += 1;
            }
        }
    });

    standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.goalsFor - a.goalsAgainst;
        const gdB = b.goalsFor - b.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return b.won - a.won;
    });

    room.leagueResults.standings = standings;
    room.leagueResults.champion = standings[0].username;
}

// --------------------------------------------------
// VISUAL PENALTY SHOOTOUT CORE SYSTEM (SYNCHRONIZED)
// --------------------------------------------------
function startVisualPenaltyShootout(homeName, awayName, homeOvr, awayOvr, penaltyData, onComplete) {
    // If penaltyData is passed as callback (offline singleplayer), handle signature overload
    if (typeof penaltyData === "function") {
        onComplete = penaltyData;
        penaltyData = null;
    }

    const overlay = document.getElementById("penalty-shootout-overlay");
    const hNameEl = document.getElementById("pen-home-name");
    const aNameEl = document.getElementById("pen-away-name");
    const hScoreEl = document.getElementById("pen-home-score");
    const aScoreEl = document.getElementById("pen-away-score");
    const hDotsContainer = document.getElementById("pen-home-dots");
    const aDotsContainer = document.getElementById("pen-away-dots");
    const commText = document.getElementById("penalty-commentary");

    if (!overlay || !hNameEl || !aNameEl || !hScoreEl || !aScoreEl || !hDotsContainer || !aDotsContainer || !commText) {
        console.warn("Penalty overlay elements not found, completing directly.");
        if (typeof onComplete === "function") {
            const pH = penaltyData ? penaltyData.pHomeScore : 0;
            const pA = penaltyData ? penaltyData.pAwayScore : 0;
            onComplete(pH, pA);
        }
        return;
    }

    // Show Overlay
    hNameEl.innerText = homeName.toUpperCase();
    aNameEl.innerText = awayName.toUpperCase();
    hScoreEl.innerText = "0";
    aScoreEl.innerText = "0";
    hDotsContainer.innerHTML = "";
    aDotsContainer.innerHTML = "";
    commText.innerText = "Penaltı atışları başlamak üzere. Nefesler tutuldu...";
    overlay.classList.remove("hidden");

    for (let i = 0; i < 5; i++) {
        hDotsContainer.innerHTML += '<div class="pen-dot pending"></div>';
        aDotsContainer.innerHTML += '<div class="pen-dot pending"></div>';
    }

    let serverHomeKicks = [];
    let serverAwayKicks = [];

    if (penaltyData && penaltyData.homeKicks && penaltyData.awayKicks) {
        serverHomeKicks = penaltyData.homeKicks;
        serverAwayKicks = penaltyData.awayKicks;
    } else {
        const simulated = generateDeterministicShootout(homeOvr, awayOvr);
        serverHomeKicks = simulated.homeKicks;
        serverAwayKicks = simulated.awayKicks;
    }

    let pHomeScore = 0;
    let pAwayScore = 0;
    const homeKicks = [];
    const awayKicks = [];
    let kickIndex = 0;
    let isHomeTurn = true;

    const totalKicks = serverHomeKicks.length + serverAwayKicks.length;

    const updateDotsUI = () => {
        hDotsContainer.innerHTML = "";
        aDotsContainer.innerHTML = "";

        const maxDots = Math.max(5, homeKicks.length, awayKicks.length);
        for (let i = 0; i < maxDots; i++) {
            if (i < homeKicks.length) {
                const status = homeKicks[i] ? "scored" : "missed";
                const icon = homeKicks[i] ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>';
                hDotsContainer.innerHTML += `<div class="pen-dot ${status}">${icon}</div>`;
            } else {
                hDotsContainer.innerHTML += '<div class="pen-dot pending"></div>';
            }

            if (i < awayKicks.length) {
                const status = awayKicks[i] ? "scored" : "missed";
                const icon = awayKicks[i] ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>';
                aDotsContainer.innerHTML += `<div class="pen-dot ${status}">${icon}</div>`;
            } else {
                aDotsContainer.innerHTML += '<div class="pen-dot pending"></div>';
            }
        }
    };

    const runKickingLoop = () => {
        if (kickIndex >= totalKicks) {
            concludeShootout();
            return;
        }

        const teamName = isHomeTurn ? homeName : awayName;
        commText.innerText = `${teamName} penaltı atışı kullanacak. Hazırlıklar tamamlandı...`;

        setTimeout(() => {
            if (isHomeTurn) {
                const homeKickIdx = homeKicks.length;
                const success = serverHomeKicks[homeKickIdx];
                homeKicks.push(success);

                if (success) {
                    pHomeScore++;
                    playRetroGoalSound();
                    hScoreEl.innerText = pHomeScore;
                    hScoreEl.classList.add("goal-anim");
                    setTimeout(() => hScoreEl.classList.remove("goal-anim"), 400);
                    commText.innerText = `GOOOL! ${homeName} penaltıyı gole çeviriyor!`;
                } else {
                    commText.innerText = `KAÇTI! ${homeName} penaltı atışından yararlanamadı!`;
                }
                isHomeTurn = false;
            } else {
                const awayKickIdx = awayKicks.length;
                const success = serverAwayKicks[awayKickIdx];
                awayKicks.push(success);

                if (success) {
                    pAwayScore++;
                    playRetroGoalSound();
                    aScoreEl.innerText = pAwayScore;
                    aScoreEl.classList.add("goal-anim");
                    setTimeout(() => aScoreEl.classList.remove("goal-anim"), 400);
                    commText.innerText = `GOL! ${awayName} beyaz noktadan fileleri havalandırıyor!`;
                } else {
                    commText.innerText = `KAÇTI! Kaleci muhteşem uzandı ve şutu kurtardı!`;
                }
                isHomeTurn = true;
            }

            kickIndex++;
            updateDotsUI();

            setTimeout(runKickingLoop, 1800);

        }, 1200);
    };

    const concludeShootout = () => {
        const winner = pHomeScore > pAwayScore ? homeName : awayName;
        commText.innerHTML = `<strong>PENALTILAR BİTTİ!</strong><br>Büyük derbinin şampiyonu penaltılar sonucu <strong>${winner}</strong> oluyor! (${pHomeScore} - ${pAwayScore})`;
        playRetroWhistle();

        setTimeout(() => {
            overlay.classList.add("hidden");
            if (typeof onComplete === "function") onComplete(pHomeScore, pAwayScore);
        }, 3000);
    };

    setTimeout(runKickingLoop, 1200);
}

function generateDeterministicShootout(homeOvr, awayOvr) {
    let pHomeScore = 0;
    let pAwayScore = 0;
    let homeKicks = [];
    let awayKicks = [];

    for (let r = 0; r < 15; r++) {
        const successHome = Math.random() < (0.75 + (homeOvr - awayOvr) * 0.003);
        homeKicks.push(successHome);
        if (successHome) pHomeScore++;

        const successAway = Math.random() < (0.75 + (awayOvr - homeOvr) * 0.003);
        awayKicks.push(successAway);
        if (successAway) pAwayScore++;

        const hRemaining = Math.max(0, 5 - homeKicks.length);
        const aRemaining = Math.max(0, 5 - awayKicks.length);

        if (homeKicks.length >= 5 && awayKicks.length >= 5) {
            if (pHomeScore !== pAwayScore) break;
        } else {
            if (pHomeScore > pAwayScore + aRemaining) break;
            if (pAwayScore > pHomeScore + hRemaining) break;
        }
    }

    return { homeKicks, awayKicks, pHomeScore, pAwayScore };
}

// --------------------------------------------------
// 2 PLAYER DERBY SIMULATION (SYNCHRONIZED WITH EXTRA TIME & PENALTIES)
// --------------------------------------------------
let mpSimInterval = null;

function simulateMP2(room) {
    const match = room.leagueResults.matches[0];
    if (!match) return;

    const maxMinutes = match.hasExtraTime ? 120 : 90;

    // Setup UI
    document.getElementById("mp-sim-2-home-name").innerText = match.home;
    document.getElementById("mp-sim-2-home-ovr").innerText = match.homeRating;
    document.getElementById("mp-sim-2-away-name").innerText = match.away;
    document.getElementById("mp-sim-2-away-ovr").innerText = match.awayRating;

    document.getElementById("mp-sim-2-home-logo").innerText = match.home.charAt(0).toUpperCase();
    document.getElementById("mp-sim-2-away-logo").innerText = match.away.charAt(0).toUpperCase();

    const homeScoreEl = document.getElementById("mp-sim-2-home-score");
    const awayScoreEl = document.getElementById("mp-sim-2-away-score");
    const clockEl = document.getElementById("mp-sim-2-clock");
    const commentaryBox = document.getElementById("mp-sim-2-commentary");
    const btnSkip = document.getElementById("btn-mp-sim-2-skip");

    homeScoreEl.innerText = "0";
    awayScoreEl.innerText = "0";
    clockEl.innerText = "0'";

    commentaryBox.innerHTML = '<div class="commentary-row event-normal"><span class="time">0\'</span><span class="text">Büyük derbi için takımlar sahaya çıkıyor. Hakem düdüğünü çaldı ve maç başladı!</span></div>';

    btnSkip.classList.add("hidden");

    const events = (match.events && match.events.length > 0)
        ? match.events
        : distributeMultiplayerEvents(match, room);

    let currentMinute = 0;
    isMpVarActive = false;

    showScreen("screen-mp-sim-2");
    playRetroWhistle(); // Maç başlama düdüğü

    const finishSimulationView = () => {
        if (mpSimInterval) {
            clearInterval(mpSimInterval);
            mpSimInterval = null;
        }
        isMpVarActive = false;
        clockEl.innerText = maxMinutes + "'";
        homeScoreEl.innerText = match.homeScore;
        awayScoreEl.innerText = match.awayScore;

        btnSkip.classList.remove("hidden");
        btnSkip.onclick = () => {
            const posterBtn = document.getElementById("btn-league-mp-poster");
            if (posterBtn) posterBtn.style.display = "inline-block";
            renderLeagueResults(room.leagueResults);
            showScreen("screen-league-results");
        };
    };

    if (mpSimInterval) clearInterval(mpSimInterval);
    mpSimInterval = setInterval(() => {
        if (isMpVarActive) return; // Pause ticking during VAR review
        currentMinute += 2;
        if (currentMinute > maxMinutes) currentMinute = maxMinutes;

        clockEl.innerText = currentMinute + "'";

        const eventsNow = events.filter(e => e.minute > currentMinute - 2 && e.minute <= currentMinute);

        eventsNow.forEach(e => {
            if (e.type === 'phase') {
                playRetroWhistle();
                addSimCommentary(commentaryBox, e.minute, e.text, "info");
            } else if (e.type === 'goal') {
                const triggerVarConfirm = Boolean(e.triggerVarConfirm);
                if (triggerVarConfirm) {
                    isMpVarActive = true;
                    addSimCommentary(commentaryBox, e.minute, `GOL! Fakat yan hakem bayrağını kaldırdı. Hakem VAR odasıyla konuşuyor... İnceleme başladı.`, "info");

                    setTimeout(() => {
                        homeScoreEl.innerText = e.homeScore;
                        awayScoreEl.innerText = e.awayScore;
                        playRetroGoalSound();

                        if (e.team === 'home') {
                            homeScoreEl.classList.add("goal-anim");
                            setTimeout(() => homeScoreEl.classList.remove("goal-anim"), 500);
                        } else {
                            awayScoreEl.classList.add("goal-anim");
                            setTimeout(() => awayScoreEl.classList.remove("goal-anim"), 500);
                        }
                        addSimCommentary(commentaryBox, e.minute, `KARAR GOL: VAR golü onayladı! Gol geçerli sayıldı. (${e.homeScore} - ${e.awayScore})`, "goal");
                        isMpVarActive = false;
                    }, 2500);
                } else {
                    homeScoreEl.innerText = e.homeScore;
                    awayScoreEl.innerText = e.awayScore;
                    playRetroGoalSound(); // Gol sevinci ses efekti

                    if (e.team === 'home') {
                        homeScoreEl.classList.add("goal-anim");
                        setTimeout(() => homeScoreEl.classList.remove("goal-anim"), 500);
                    } else {
                        awayScoreEl.classList.add("goal-anim");
                        setTimeout(() => awayScoreEl.classList.remove("goal-anim"), 500);
                    }

                    addSimCommentary(commentaryBox, e.minute, e.text, "goal");
                }
            } else if (e.type === 'var-cancelled') {
                isMpVarActive = true;
                addSimCommentary(commentaryBox, e.minute, e.text, "info");
                setTimeout(() => {
                    addSimCommentary(commentaryBox, e.minute, e.cancelText, "danger");
                    isMpVarActive = false;
                }, 2500);
            } else {
                addSimCommentary(commentaryBox, e.minute, e.text, "danger");
            }
        });

        if (currentMinute >= maxMinutes) {
            clearInterval(mpSimInterval);
            mpSimInterval = null;
            playRetroWhistle(); // Maç bitiş düdüğü

            if (match.hasPenalties) {
                addSimCommentary(commentaryBox, 120, `120 dakika sonunda eşitlik bozulmadı (${match.homeScore} - ${match.awayScore})! Kazananı belirlemek için seri penaltı atışlarına geçiliyor...`, "info");
                setTimeout(() => {
                    startVisualPenaltyShootout(match.home, match.away, match.homeRating, match.awayRating, match.penaltyResults, (pHomeScore, pAwayScore) => {
                        addSimCommentary(commentaryBox, "PEN", `Büyük Derbi Sonucu (Penaltılarla): ${match.home} ${match.homeScore} - ${match.awayScore} ${match.away} (Penaltılar: ${pHomeScore} - ${pAwayScore})`, "info");
                        finishSimulationView();
                    });
                }, 2000);
            } else {
                const finishLabel = match.hasExtraTime ? "Uzatma dakikaları sonucu" : "Maç sonucu";
                addSimCommentary(commentaryBox, maxMinutes, `${finishLabel}: ${match.home} ${match.homeScore} - ${match.awayScore} ${match.away}`, "info");
                finishSimulationView();
            }
        }
    }, 1500);
}

function addSimCommentary(container, minute, text, typeClass) {
    const div = document.createElement("div");
    let cleanClass = "event-normal";
    if (typeClass === "goal") cleanClass = "event-goal";
    else if (typeClass === "danger") cleanClass = "event-danger";

    div.className = `commentary-row ${cleanClass}`;
    div.innerHTML = `
        <span class="time">${minute}'</span>
        <span class="text">${text}</span>
    `;
    container.insertBefore(div, container.firstChild); // Add new events at the top
    container.scrollTop = 0;
}

// --------------------------------------------------
// 4 PLAYER SIMULCAST (LIVE LEAGUE) SIMULATION
// --------------------------------------------------
// --------------------------------------------------
// 4 PLAYER SIMULCAST (LIVE LEAGUE) SIMULATION
// --------------------------------------------------
function simulateMP4(room) {
    recalculateStandingsLocally(room);

    const commentaryBox = document.getElementById("mp-sim-4-commentary");
    commentaryBox.innerHTML = '<div class="commentary-row event-normal"><span class="time">0\'</span><span class="text">🏆 4 Takımlı Süper Lig Nostalji Lig Simülasyonu Başlıyor! (3 Hafta / 6 Maç)</span></div>';

    const btnSkip = document.getElementById("btn-mp-sim-4-skip");
    btnSkip.classList.add("hidden");

    showScreen("screen-mp-sim-4");
    playRetroWhistle();

    // Group matches by round (Round 1, Round 2, Round 3)
    const matchesByRound = { 1: [], 2: [], 3: [] };
    room.leagueResults.matches.forEach((m, i) => {
        const r = m.round || (Math.floor(i / 2) + 1);
        m.round = r;
        if (!matchesByRound[r]) matchesByRound[r] = [];
        matchesByRound[r].push(m);
    });

    let baseTeamsObj = {};
    room.players.forEach(p => {
        baseTeamsObj[p.username] = {
            username: p.username,
            rating: p.rating,
            played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0
        };
    });

    function runRound(roundNum) {
        if (roundNum > 3) {
            // All 3 rounds complete!
            addSimCommentary(commentaryBox, 90, `🏆 3 HAFTALIK LİG SİMÜLASYONU TAMAMLANDI!`, "goal");
            addSimCommentary(commentaryBox, 90, `NİHAİ LİG ŞAMPİYONU: ${room.leagueResults.champion}!`, "goal");
            playRetroWhistle();

            btnSkip.classList.remove("hidden");
            btnSkip.onclick = () => {
                document.getElementById("btn-league-mp-poster").style.display = "inline-block";
                renderLeagueResults(room.leagueResults);
                showScreen("screen-league-results");
            };
            return;
        }

        const roundMatchesData = matchesByRound[roundNum] || [];
        let liveRoundMatches = roundMatchesData.map(m => {
            return {
                home: m.home,
                away: m.away,
                homeCurrent: 0,
                awayCurrent: 0,
                homeScore: m.homeScore,
                awayScore: m.awayScore,
                events: (m.events && m.events.length > 0) ? m.events : distributeMultiplayerEvents(m, room)
            };
        });

        addSimCommentary(commentaryBox, 0, `--- ${roundNum}. HAFTA MAÇLARI BAŞLIYOR ---`, "info");
        document.getElementById("mp-sim-4-clock").innerText = `H${roundNum} - 0'`;

        renderLiveMatches(liveRoundMatches, roundNum);
        renderLiveStandings(baseTeamsObj, room.leagueResults.matches, roundNum, liveRoundMatches);

        let currentMinute = 0;

        if (mpSimInterval) clearInterval(mpSimInterval);
        mpSimInterval = setInterval(() => {
            if (isMpVarActive) return;
            currentMinute += 1;
            if (currentMinute > 90) currentMinute = 90;

            document.getElementById("mp-sim-4-clock").innerText = `H${roundNum} - ${currentMinute}'`;

            let goalScored = false;

            liveRoundMatches.forEach((m, idx) => {
                const eventsNow = m.events.filter(e => e.minute === currentMinute);
                eventsNow.forEach(e => {
                    if (e.type === 'goal') {
                        const triggerVar = (typeof e.triggerVarConfirm !== 'undefined') ? Boolean(e.triggerVarConfirm) : false;
                        if (triggerVar) {
                            isMpVarActive = true;
                            addSimCommentary(commentaryBox, currentMinute, `[H${roundNum}-Maç ${idx + 1}] GOL! Hakem VAR incelemesi istiyor...`, "info");
                            setTimeout(() => {
                                m.homeCurrent = (typeof e.homeScore !== 'undefined') ? e.homeScore : (m.homeCurrent + (e.team === 'home' ? 1 : 0));
                                m.awayCurrent = (typeof e.awayScore !== 'undefined') ? e.awayScore : (m.awayCurrent + (e.team === 'away' ? 1 : 0));
                                playRetroGoalSound();
                                addSimCommentary(commentaryBox, currentMinute, `[H${roundNum}-Maç ${idx + 1}] VAR KARARI GOL! (${m.home} ${m.homeCurrent} - ${m.awayCurrent} ${m.away})`, "goal");
                                renderLiveMatches(liveRoundMatches, roundNum);
                                renderLiveStandings(baseTeamsObj, room.leagueResults.matches, roundNum, liveRoundMatches);
                                isMpVarActive = false;
                            }, 2000);
                        } else {
                            m.homeCurrent = (typeof e.homeScore !== 'undefined') ? e.homeScore : (m.homeCurrent + (e.team === 'home' ? 1 : 0));
                            m.awayCurrent = (typeof e.awayScore !== 'undefined') ? e.awayScore : (m.awayCurrent + (e.team === 'away' ? 1 : 0));
                            playRetroGoalSound();

                            addSimCommentary(commentaryBox, currentMinute, `[H${roundNum}-Maç ${idx + 1}] ${e.text} (${m.home} ${m.homeCurrent} - ${m.awayCurrent} ${m.away})`, "goal");
                            goalScored = true;
                        }
                    } else if (e.type === 'var-cancelled') {
                        isMpVarActive = true;
                        addSimCommentary(commentaryBox, currentMinute, `[H${roundNum}-Maç ${idx + 1}] ${e.text}`, "info");
                        setTimeout(() => {
                            addSimCommentary(commentaryBox, currentMinute, `[H${roundNum}-Maç ${idx + 1}] ${e.cancelText}`, "danger");
                            isMpVarActive = false;
                        }, 2000);
                    }
                });
            });

            if (goalScored) {
                renderLiveMatches(liveRoundMatches, roundNum);
                renderLiveStandings(baseTeamsObj, room.leagueResults.matches, roundNum, liveRoundMatches);
            }

            if (currentMinute >= 90) {
                clearInterval(mpSimInterval);
                playRetroWhistle();

                // Round complete - update exact scores for this round
                liveRoundMatches.forEach((m, idx) => {
                    const origMatch = roundMatchesData[idx];
                    if (origMatch) {
                        origMatch.homeScore = m.homeCurrent;
                        origMatch.awayScore = m.awayCurrent;
                    }
                });

                recalculateStandingsLocally(room);
                renderLiveMatches(liveRoundMatches, roundNum);
                renderLiveStandings(baseTeamsObj, room.leagueResults.matches, roundNum + 1, null);

                addSimCommentary(commentaryBox, 90, `✅ ${roundNum}. HAFTA TAMAMLANDI! Puan durumu güncellendi.`, "info");

                setTimeout(() => {
                    runRound(roundNum + 1);
                }, 2200);
            }
        }, 900);
    }

    runRound(1);
}

function renderLiveMatches(matches, roundNum) {
    const container = document.getElementById("mp-sim-4-matches");
    let html = `<div style="font-weight:900; font-size:0.85rem; margin-bottom:8px; color:var(--color-primary); text-align:center;">${roundNum ? roundNum + '. HAFTA FİKSTÜRÜ (2 MAÇ)' : 'CANLI MAÇLAR'}</div>`;
    matches.forEach((m, idx) => {
        html += `
            <div class="live-match-card" id="live-match-${idx}">
                <div class="lm-team home">${m.home}</div>
                <div class="lm-score">${m.homeCurrent} - ${m.awayCurrent}</div>
                <div class="lm-team away">${m.away}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderLiveStandings(baseTeamsObj, allMatches, currentRoundNum, currentRoundMatches) {
    let teams = JSON.parse(JSON.stringify(Object.values(baseTeamsObj)));
    const getTeam = (name) => teams.find(t => t.username === name);

    // 1. Process completed rounds
    allMatches.forEach(m => {
        if (m.round < currentRoundNum) {
            const home = getTeam(m.home);
            const away = getTeam(m.away);
            if (!home || !away) return;

            home.played++; away.played++;
            home.goalsFor += m.homeScore; home.goalsAgainst += m.awayScore;
            away.goalsFor += m.awayScore; away.goalsAgainst += m.homeScore;

            if (m.homeScore > m.awayScore) { home.won++; home.points += 3; away.lost++; }
            else if (m.homeScore < m.awayScore) { away.won++; away.points += 3; home.lost++; }
            else { home.drawn++; away.drawn++; home.points += 1; away.points += 1; }
        }
    });

    // 2. Process current active round's live scores
    if (currentRoundMatches) {
        currentRoundMatches.forEach(m => {
            const home = getTeam(m.home);
            const away = getTeam(m.away);
            if (!home || !away) return;

            home.played++; away.played++;
            home.goalsFor += m.homeCurrent; home.goalsAgainst += m.awayCurrent;
            away.goalsFor += m.awayCurrent; away.goalsAgainst += m.homeCurrent;

            if (m.homeCurrent > m.awayCurrent) { home.won++; home.points += 3; away.lost++; }
            else if (m.homeCurrent < m.awayCurrent) { away.won++; away.points += 3; home.lost++; }
            else { home.drawn++; away.drawn++; home.points += 1; away.points += 1; }
        });
    }

    // 3. Sort standings (Points -> Goal Difference -> Goals For -> Wins)
    teams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.goalsFor - a.goalsAgainst;
        const gdB = b.goalsFor - b.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return b.won - a.won;
    });

    const tbody = document.getElementById("mp-sim-4-standings");
    let newHTML = "";
    teams.forEach((t, idx) => {
        const gd = t.goalsFor - t.goalsAgainst;
        const sign = gd > 0 ? "+" : "";
        newHTML += `
            <tr>
                <td style="font-weight:900; color:var(--color-primary)">${idx + 1}</td>
                <td style="font-weight:bold">${t.username}</td>
                <td style="font-weight:900">${t.points}</td>
                <td style="color:${gd > 0 ? 'green' : (gd < 0 ? 'red' : 'inherit')}">${sign}${gd}</td>
            </tr>
        `;
    });
    tbody.innerHTML = newHTML;
}

// ==================================================
// MULTIPLAYER POSTER GENERATOR
// ==================================================
function generateMultiplayerPoster() {
    if (!currentMpRoomData) return;

    const posterCanvas = document.getElementById("poster-canvas");
    if (!posterCanvas) return;

    const myData = currentMpRoomData.players.find(p => p.username === myUsername);
    const squad = myData && myData.squad ? myData.squad : draftedPlayers;
    const formation = myData && myData.formation ? myData.formation : activeFormation;
    const currentConfig = formationConfigs[formation];

    // Formasyon satırlarını oluştur (sahaya benzer düzen)
    const formationRows = getFormationRowsForPoster(currentConfig, squad);
    let pitchHTML = "";
    formationRows.forEach(row => {
        let rowHTML = '<div class="poster-player-row">';
        row.forEach(p => {
            if (p) {
                const shortName = p.name.length > 12 ? p.name.substring(0, 11) + "…" : p.name;
                rowHTML += `
                    <div class="poster-player-chip">
                        <div class="poster-player-circle">${p.rating}</div>
                        <span class="poster-player-name">${shortName}</span>
                    </div>
                `;
            }
        });
        rowHTML += '</div>';
        pitchHTML += rowHTML;
    });

    // Takım istatistiklerini hesapla
    const filledPlayers = squad.filter(p => p !== null);
    const avgRating = filledPlayers.length > 0 ? Math.round(filledPlayers.reduce((a, c) => a + c.rating, 0) / filledPlayers.length) : 0;
    const bestPlayer = [...filledPlayers].sort((a, b) => b.rating - a.rating)[0];

    const isWinner = currentMpRoomData.leagueResults.champion === myUsername;
    const resultStatus = isWinner ? "ŞAMPİYON" : "LİG ANISI";
    const resultSubtitle = "2 Kişilik Nostalji Derbisi";

    const now = new Date();
    const dateStr = now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    const pathSectionTitle = "Maç Sonuçları";

    // Kadro oyuncu listesi (daktilo gazete lineup)
    const squadListHTML = squad.map((p, index) => {
        if (!p) return "";
        let posLabel = "OS";
        const slot = currentConfig[index];
        if (slot.type === "GK") posLabel = "KL";
        else if (slot.type === "DF") posLabel = "DF";
        else if (slot.type === "MF") posLabel = "OS";
        else if (slot.type === "FW") posLabel = "FV";

        return `
            <div class="poster-squad-item">
                <span class="poster-squad-pos">${posLabel}</span>
                <span class="poster-squad-name">${p.name}</span>
                <span class="poster-squad-dots"></span>
                <span class="poster-squad-rating">${p.rating}</span>
            </div>
        `;
    }).join("");

    // Maç Sonuçları listesi
    let tournamentPathHTML = "";
    const myMatches = currentMpRoomData.leagueResults.matches.filter(m => m.home === myUsername || m.away === myUsername);
    myMatches.forEach((m, idx) => {
        const isHome = m.home === myUsername;
        const opponent = isHome ? m.away : m.home;
        const userScore = isHome ? m.homeScore : m.awayScore;
        const opScore = isHome ? m.awayScore : m.homeScore;
        const rowClass = userScore > opScore ? "win" : (userScore < opScore ? "loss" : "");

        tournamentPathHTML += `
            <div class="poster-path-row ${rowClass}">
                <span class="poster-path-round">MAÇ ${idx + 1}</span>
                <span class="poster-path-matchup">vs ${opponent}</span>
                <span class="poster-path-score">${userScore} - ${opScore}</span>
            </div>
        `;
    });

    posterCanvas.innerHTML = `
        <div class="poster-vintage-bg"></div>
        <div class="poster-inner-border">
            <!-- Retro Calendar Box on top right -->
            <div class="poster-calendar-box">
                <div class="cal-month">${now.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase()}</div>
                <div class="cal-day">${now.getDate()}</div>
                <div class="cal-weekday">${now.toLocaleDateString("tr-TR", { weekday: "short" }).toUpperCase()}</div>
            </div>

            <div class="poster-header">
                <div class="poster-brand">SÜPER LİG NOSTALJİ DRAFT</div>
                <div class="poster-title">${resultStatus}</div>
                <div class="poster-subtitle">${resultSubtitle}</div>
                <div class="poster-divider-vintage"></div>
            </div>
            
            <div class="poster-pitch-section">
                <div class="poster-section-header">TAKTIK DIZILIŞ / ${formation}</div>
                <div class="poster-pitch-retro">
                    ${pitchHTML}
                </div>
            </div>

            <!-- Two-Column Layout for Squad and Scores -->
            <div class="poster-columns">
                <div class="poster-col-left">
                    <div class="poster-section-header">İLK 11 KADROMUZ</div>
                    <div class="poster-squad-list-retro">
                        ${squadListHTML}
                    </div>
                </div>
                <div class="poster-col-right">
                    <div class="poster-section-header">${pathSectionTitle.toUpperCase()}</div>
                    <div class="poster-path-list-retro">
                        ${tournamentPathHTML}
                    </div>
                </div>
            </div>
            
            <div class="poster-stats-vintage">
                <div class="poster-stat-badge">
                    <span class="label">GENEL GÜÇ</span>
                    <span class="val">${avgRating}</span>
                </div>
                <div class="poster-stat-badge">
                    <span class="label">EN İYİ OYUNCU</span>
                    <span class="val">${bestPlayer ? bestPlayer.name.toUpperCase() : "-"}</span>
                </div>
            </div>
            
            <div class="poster-footer-vintage">
                <div class="stamp-text">MATBAA-İ NOSTALJİ • ANKARA</div>
                <div class="date-stamp">${dateStr} • ${timeStr}</div>
            </div>
        </div>
    `;

    // Hide museum button in multiplayer poster
    const btnSaveMuseum = document.getElementById("btn-save-museum");
    if (btnSaveMuseum) {
        btnSaveMuseum.style.display = "none";
    }

    // Modal'ı göster ve ölçekle
    document.getElementById("poster-modal").classList.remove("hidden");
    adjustPosterScale();
    requestAnimationFrame(adjustPosterScale);
}

// Dynamic Responsive Poster Scaler (Fits both Width and Height)
function adjustPosterScale() {
    const canvas = document.getElementById("poster-canvas");
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    // Reset layout properties to read native dimensions
    canvas.style.transform = "none";
    canvas.style.margin = "0";
    container.style.width = "auto";
    container.style.height = "auto";
    container.style.overflow = "auto";

    const nativeWidth = 600;
    const nativeHeight = canvas.offsetHeight || 1100;

    // Get modal inner width/height limits
    const maxViewportWidth = Math.max(280, window.innerWidth * 0.95 - 30);
    const maxViewportHeight = Math.max(300, window.innerHeight * 0.95 - 100);

    // Calculate scale to fit both width and height
    const scaleX = maxViewportWidth / nativeWidth;
    const scaleY = maxViewportHeight / nativeHeight;

    // Scale down if it exceeds viewport, but don't upscale past 1
    const scale = Math.min(1, scaleX, scaleY);

    // Apply transform scale anchored to top left corner to keep it within the container boundary
    canvas.style.transformOrigin = "top left";
    canvas.style.transform = `scale(${scale})`;
    canvas.style.margin = "0";

    // Adjust container dimensions to tightly fit the scaled canvas
    container.style.boxSizing = "content-box";
    container.style.width = `${Math.ceil(nativeWidth * scale)}px`;
    container.style.height = `${Math.ceil(nativeHeight * scale)}px`;
    container.style.overflow = "hidden";
    container.style.margin = "0 auto";
}

// Window resize listener for responsive scaling
window.addEventListener("resize", adjustPosterScale);

// ==================================================
// AUDIO HELPERS & RETRO SOUND SYNTHESIS
// ==================================================
function getAudioContext() {
    if (!bgAudioCtx) {
        bgAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (bgAudioCtx.state === 'suspended') {
        bgAudioCtx.resume();
    }
    return bgAudioCtx;
}

function playRetroWhistle() {
    if (isAudioMuted) return;
    try {
        const ctx = getAudioContext();
        const playBeep = (timeStart, duration) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(2200, timeStart);

            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = 35;
            lfoGain.gain.value = 150;

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            gainNode.gain.setValueAtTime(0, timeStart);
            gainNode.gain.linearRampToValueAtTime(0.2, timeStart + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, timeStart + duration);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(timeStart);
            lfo.start(timeStart);

            osc.stop(timeStart + duration);
            lfo.stop(timeStart + duration);
        };

        const now = ctx.currentTime;
        playBeep(now, 0.15);
        playBeep(now + 0.22, 0.4);
    } catch (e) {
        console.error("Audio error:", e);
    }
}

function playRetroClick() {
    if (isAudioMuted) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    } catch (e) {
        console.error("Audio error:", e);
    }
}

function playRetroSelect() {
    if (isAudioMuted) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const noteTime = now + idx * 0.08;
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            gainNode.gain.setValueAtTime(0, noteTime);
            gainNode.gain.linearRampToValueAtTime(0.08, noteTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.25);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.3);
        });
    } catch (e) {
        console.error("Audio error:", e);
    }
}

function playRetroGoalSound() {
    if (isAudioMuted) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        const melody = [
            { freq: 261.63, time: 0 },
            { freq: 392.00, time: 0.12 },
            { freq: 523.25, time: 0.24 },
            { freq: 783.99, time: 0.36 },
            { freq: 1046.50, time: 0.48 }
        ];

        melody.forEach(note => {
            const noteTime = now + note.time;
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = note.freq;

            gainNode.gain.setValueAtTime(0, noteTime);
            gainNode.gain.linearRampToValueAtTime(0.05, noteTime + 0.02);
            gainNode.gain.setValueAtTime(0.05, noteTime + 0.12);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.5);

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;
            filter.Q.value = 1.0;

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.6);
        });

        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 600;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.2);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 1.5);
    } catch (e) {
        console.error("Audio error:", e);
    }
}

let bgMusicStep = 0;
function startBgMusic() {
    if (isAudioMuted) return;
    if (bgMusicInterval) return;

    try {
        const ctx = getAudioContext();

        const notes = [
            220.00, 261.63, 329.63, 261.63, 220.00, 261.63, 329.63, 261.63,
            174.61, 220.00, 261.63, 220.00, 174.61, 220.00, 261.63, 220.00,
            130.81, 164.81, 196.00, 164.81, 130.81, 164.81, 196.00, 164.81,
            196.00, 246.94, 293.66, 246.94, 196.00, 246.94, 293.66, 246.94
        ];

        bgMusicStep = 0;
        bgMusicInterval = setInterval(() => {
            if (isAudioMuted) return;
            try {
                const now = ctx.currentTime;
                const freq = notes[bgMusicStep];

                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);

                gainNode.gain.setValueAtTime(0.012, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

                osc.connect(gainNode);
                gainNode.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.25);

                bgMusicStep = (bgMusicStep + 1) % notes.length;
            } catch (err) {
                console.error("Music playback tick error:", err);
            }
        }, 250);
    } catch (e) {
        console.error("Background music start failed:", e);
    }
}

function stopBgMusic() {
    if (bgMusicInterval) {
        clearInterval(bgMusicInterval);
        bgMusicInterval = null;
    }
}

function toggleMute() {
    isAudioMuted = !isAudioMuted;
    const muteBtn = document.getElementById("btn-toggle-audio");
    if (muteBtn) {
        if (isAudioMuted) {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            stopBgMusic();
        } else {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            startBgMusic();
        }
    }
}

// ==================================================
// KUPA MÜZESİ VE İSTATİSTİKLER (MUSEUM MANAGER)
// ==================================================
const Museum = {
    loadData() {
        const defaultData = {
            stats: {
                trophies: 0,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsScored: 0,
                goalsConceded: 0,
                maxSquadOvr: 0,
                biggestWin: {
                    userScore: 0,
                    opponentScore: 0,
                    opponentName: "",
                    opponentYear: ""
                }
            },
            savedSquads: []
        };
        try {
            const raw = localStorage.getItem("superlig_draft_museum");
            if (!raw) return defaultData;
            const parsed = JSON.parse(raw);
            return {
                stats: { ...defaultData.stats, ...parsed.stats },
                savedSquads: parsed.savedSquads || []
            };
        } catch (e) {
            console.error("Museum data load error:", e);
            return defaultData;
        }
    },

    saveData(data) {
        try {
            localStorage.setItem("superlig_draft_museum", JSON.stringify(data));
        } catch (e) {
            console.error("Museum data save error:", e);
        }
    },

    addMatch(userScore, opScore, opponentName, opponentYear) {
        const data = this.loadData();
        data.stats.played++;
        
        if (userScore > opScore) {
            data.stats.won++;
        } else if (userScore === opScore) {
            data.stats.drawn++;
        } else {
            data.stats.lost++;
        }
        
        data.stats.goalsScored += userScore;
        data.stats.goalsConceded += opScore;
        
        // En farklı galibiyet kontrolü
        const currentDiff = userScore - opScore;
        const bestDiff = data.stats.biggestWin.userScore - data.stats.biggestWin.opponentScore;
        
        if (currentDiff > 0 && (currentDiff > bestDiff || data.stats.biggestWin.userScore === 0)) {
            data.stats.biggestWin = {
                userScore: userScore,
                opponentScore: opScore,
                opponentName: opponentName,
                opponentYear: opponentYear
            };
        }
        
        // En yüksek kadro gücü kontrolü
        if (myTeamOvr > (data.stats.maxSquadOvr || 0)) {
            data.stats.maxSquadOvr = myTeamOvr;
        }
        
        this.saveData(data);

        // Achievement Triggers
        if (data.stats.played >= 10) unlockAchievement('matches_10');
        if (data.stats.goalsScored >= 10) unlockAchievement('goals_10');
        if (data.stats.goalsScored >= 100) unlockAchievement('goals_100');
        if (opScore === 0 && userScore > 0) unlockAchievement('clean_sheet');
        if (userScore >= 3) unlockAchievement('hat_trick');
    },

    addTrophy() {
        const data = this.loadData();
        data.stats.trophies++;
        this.saveData(data);
        unlockAchievement('tournament_win');
        if (data.stats.trophies >= 5) unlockAchievement('trophy_collector');
    },

    renderAll() {
        this.renderStats();
        this.renderShelf();
        this.renderSquads();
        renderMuseumAchievements();
    },

    saveCurrentSquad(isChampionStatus) {
        const data = this.loadData();
        
        const filledPlayers = draftedPlayers.filter(p => p !== null);
        if (filledPlayers.length < 11) {
            alert("Lütfen önce 11 kişilik kadronuzu tamamlayın!");
            return false;
        }
        
        // Kadro gücü, hücum ve savunma değerlerini hesapla
        const sumOvr = draftedPlayers.reduce((acc, curr) => acc + (curr ? curr.rating : 0), 0);
        const atkPlayers = draftedPlayers.filter(p => p && (p.position === "FW" || p.position === "MF"));
        const defPlayers = draftedPlayers.filter(p => p && (p.position === "DF" || p.position === "GK"));
        const sumAtk = atkPlayers.reduce((acc, curr) => acc + curr.rating, 0);
        const sumDef = defPlayers.reduce((acc, curr) => acc + curr.rating, 0);
        
        const ovr = Math.round(sumOvr / 11);
        const atk = atkPlayers.length > 0 ? Math.round(sumAtk / atkPlayers.length) : 75;
        const def = defPlayers.length > 0 ? Math.round(sumDef / defPlayers.length) : 75;
        
        let reachedLabel = "";
        let subtitle = "";
        if (isTournamentMode) {
            const roundNames = ["Son 16", "Çeyrek Final", "Yarı Final", "Final"];
            reachedLabel = isChampionStatus ? "ŞAMPİYON" : roundNames[tournamentRound];
            subtitle = isChampionStatus ? "Nostalji Draft Turnuvası Şampiyonu" : `${reachedLabel} Turunda Elendi`;
        } else {
            reachedLabel = "KLASİK MOD";
            subtitle = "Klasik Mod Anı Kartı";
        }
        
        // Aynı kadronun mükerrer kaydolmasını engelle
        const duplicate = data.savedSquads.some(s => {
            return s.ovr === ovr && s.formation === activeFormation && JSON.stringify(s.squad.map(x => x.name)) === JSON.stringify(draftedPlayers.map(x => x.name));
        });
        
        if (duplicate) {
            alert("Bu kadro zaten kupa müzenizde kayıtlı!");
            return true; // Kullanıcıya başarılı olduğunu hissettir
        }
        
        const newSquad = {
            id: "squad_" + Date.now(),
            timestamp: Date.now(),
            formation: activeFormation,
            ovr: ovr,
            atk: atk,
            def: def,
            status: reachedLabel,
            subtitle: subtitle,
            squad: JSON.parse(JSON.stringify(draftedPlayers)),
            matches: JSON.parse(JSON.stringify(currentRunMatches))
        };
        
        data.savedSquads.push(newSquad);
        this.saveData(data);
        alert("Efsane kadronuz kupa müzesine ve kadro defterine başarıyla kaydedildi! 🏆");
        return true;
    },

    deleteSquad(squadId) {
        if (!confirm("Bu kadroyu defterinizden silmek istediğinize emin misiniz?")) return;
        const data = this.loadData();
        data.savedSquads = data.savedSquads.filter(s => s.id !== squadId);
        this.saveData(data);
        this.renderSquads();
    },

    renderStats() {
        const data = this.loadData();
        document.getElementById("museum-stat-trophies").innerText = data.stats.trophies;
        document.getElementById("museum-stat-played").innerText = data.stats.played;
        document.getElementById("museum-stat-won").innerText = data.stats.won;
        document.getElementById("museum-stat-drawn").innerText = data.stats.drawn;
        document.getElementById("museum-stat-lost").innerText = data.stats.lost;
        document.getElementById("museum-stat-goals").innerText = `${data.stats.goalsScored} / ${data.stats.goalsConceded}`;
        document.getElementById("museum-stat-max-ovr").innerText = data.stats.maxSquadOvr > 0 ? data.stats.maxSquadOvr : "--";
        
        const biggestWin = data.stats.biggestWin;
        if (biggestWin && biggestWin.userScore > 0) {
            const yr = biggestWin.opponentYear ? ` '${biggestWin.opponentYear.toString().slice(-2)}` : "";
            document.getElementById("museum-stat-biggest-win").innerText = `Kendi Kadrom ${biggestWin.userScore}-${biggestWin.opponentScore} ${biggestWin.opponentName}${yr}`;
        } else {
            document.getElementById("museum-stat-biggest-win").innerText = "--";
        }
    },

    renderShelf() {
        const data = this.loadData();
        const shelf = document.getElementById("museum-trophy-shelf");
        shelf.innerHTML = "";
        
        const count = data.stats.trophies;
        if (count === 0) {
            shelf.innerHTML = `<div class="no-trophies-msg" style="width: 100%; text-align: center; color: var(--color-text-muted); font-size: 0.9rem; font-style: italic; z-index: 2; margin-bottom: 25px;">Henüz müzenizde kupa bulunmuyor. Turnuvalarda şampiyon olarak kupaları toplayın!</div>`;
            return;
        }
        
        for (let i = 0; i < count; i++) {
            shelf.innerHTML += `
                <div class="retro-trophy-item">
                    <i class="fa-solid fa-trophy"></i>
                    <span>KUPA #${i+1}</span>
                </div>
            `;
        }
    },

    renderSquads() {
        const data = this.loadData();
        const container = document.getElementById("museum-squads-list");
        container.innerHTML = "";
        
        if (data.savedSquads.length === 0) {
            container.innerHTML = `<p class="no-squads-msg" style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); font-size: 0.9rem; font-style: italic; margin-top: 15px;">Henüz kaydedilmiş efsanevi bir kadronuz yok. Maç sonlarında "Müzeye Kaydet" diyerek kadrolarınızı buraya ekleyebilirsiniz.</p>`;
            return;
        }
        
        // Yeni kaydedileni en üstte göster
        const sorted = [...data.savedSquads].sort((a, b) => b.timestamp - a.timestamp);
        
        sorted.forEach(s => {
            const dt = new Date(s.timestamp);
            const dateStr = dt.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
            const isChamp = s.status === "ŞAMPİYON";
            const stampClass = isChamp ? "card-stamp champ" : "card-stamp";
            
            // Maç geçmişi özeti
            let matchSummaryText = "";
            if (s.matches && s.matches.length > 0) {
                const lastMatch = s.matches[s.matches.length - 1];
                if (s.matches.length > 1) {
                    matchSummaryText = `${s.matches.length} maçlık turnuva macerası (Son maç: vs ${lastMatch.opName} ${lastMatch.userScore}-${lastMatch.opScore})`;
                } else {
                    matchSummaryText = `vs ${lastMatch.opName} (${lastMatch.userScore}-${lastMatch.opScore}) Maçı`;
                }
            } else {
                matchSummaryText = "Klasik Mod kadrosu";
            }
            
            const cardDiv = document.createElement("div");
            cardDiv.className = "museum-squad-card";
            cardDiv.innerHTML = `
                <div class="${stampClass}">${s.status}</div>
                <div class="card-header-info">
                    <span class="card-date">${dateStr}</span>
                    <h4 class="card-title">${s.formation} Dizilişi</h4>
                </div>
                <div class="card-ratings-row">
                    <div class="card-rating-badge">GENEL <strong>${s.ovr}</strong></div>
                    <div class="card-rating-badge">HÜCUM <strong>${s.atk}</strong></div>
                    <div class="card-rating-badge">SAVUNMA <strong>${s.def}</strong></div>
                </div>
                <div class="card-matches-summary">
                    ${matchSummaryText}
                </div>
                <div class="card-actions">
                    <button class="btn btn-black btn-view-squad" data-id="${s.id}"><i class="fa-solid fa-file-invoice"></i> Poster</button>
                    <button class="btn btn-white btn-delete-squad" data-id="${s.id}"><i class="fa-solid fa-trash-can"></i> Sil</button>
                </div>
            `;
            
            container.appendChild(cardDiv);
        });
        
        // Buton aksiyonlarını bağla
        container.querySelectorAll(".btn-view-squad").forEach(btn => {
            btn.addEventListener("click", () => {
                const squadId = btn.getAttribute("data-id");
                const squad = data.savedSquads.find(x => x.id === squadId);
                if (squad) {
                    isViewingSavedPoster = true;
                    // Müzeye Kaydet butonunu inaktif et
                    const saveBtn = document.getElementById("btn-save-museum");
                    if (saveBtn) {
                        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Müzeye Eklendi';
                        saveBtn.disabled = true;
                    }
                    // Posteri oluştur
                    generateSavedPoster(squad);
                }
            });
        });
        
        container.querySelectorAll(".btn-delete-squad").forEach(btn => {
            btn.addEventListener("click", () => {
                const squadId = btn.getAttribute("data-id");
                this.deleteSquad(squadId);
            });
        });
    }
};

function generateSavedPoster(squad) {
    generatePoster(squad.status === "ŞAMPİYON", squad);
}

// ==========================================================================
// ACHIEVEMENTS & BADGES SYSTEM (15 CUSTOM RETRO BADGES)
// ==========================================================================
const ACHIEVEMENTS_DATA = [
    {
        id: "first_draft",
        title: "İlk Adım",
        desc: "İlk nostalji 11'ini başarıyla tamamla.",
        category: "Başlangıç",
        color: "#3498db",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="url(#grad-blue)" stroke="#2980b9" stroke-width="2"/>
            <path d="M22 32L29 39L42 24" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <defs><linearGradient id="grad-blue" x1="0" y1="0" x2="64" y2="64"><stop offset="0%" stop-color="#3498db"/><stop offset="100%" stop-color="#1abc9c"/></linearGradient></defs>
        </svg>`
    },
    {
        id: "rating_85",
        title: "Altın Kadro",
        desc: "85 veya üzeri OVR reytingli kadro kur.",
        category: "Kadro",
        color: "#f1c40f",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="32,4 40,24 60,24 44,36 50,56 32,44 14,56 20,36 4,24 24,24" fill="url(#grad-gold)" stroke="#b7950b" stroke-width="2"/>
            <text x="32" y="36" font-size="12" font-weight="900" text-anchor="middle" fill="#5b4002" font-family="Outfit">85+</text>
            <defs><linearGradient id="grad-gold" x1="0" y1="0" x2="64" y2="64"><stop offset="0%" stop-color="#f39c12"/><stop offset="100%" stop-color="#f1c40f"/></linearGradient></defs>
        </svg>`
    },
    {
        id: "rating_90",
        title: "Galaktikos",
        desc: "90 veya üzeri OVR reytingli efsane kadro kur.",
        category: "Kadro",
        color: "#9b59b6",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="32,6 54,22 42,58 22,58 10,22" fill="url(#grad-diamond)" stroke="#8e44ad" stroke-width="2"/>
            <path d="M10 22L32 30L54 22M32 30L22 58M32 30L42 58" stroke="#ffffff" stroke-opacity="0.6" stroke-width="1.5"/>
            <text x="32" y="44" font-size="12" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="Outfit">90+</text>
            <defs><linearGradient id="grad-diamond" x1="0" y1="0" x2="64" y2="64"><stop offset="0%" stop-color="#a29bfe"/><stop offset="100%" stop-color="#6c5ce7"/></linearGradient></defs>
        </svg>`
    },
    {
        id: "tournament_win",
        title: "Kupa Beyi",
        desc: "Klasik turnuvada şampiyon ol ve kupayı kaldır.",
        category: "Turnuva",
        color: "#e67e22",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 10H48V26C48 36 40 44 32 44C24 44 16 36 16 26V10Z" fill="url(#grad-trophy)" stroke="#d35400" stroke-width="2"/>
            <path d="M16 16H8C8 26 16 28 16 28M48 16H56C56 26 48 28 48 28" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/>
            <rect x="26" y="44" width="12" height="10" fill="#d35400"/>
            <rect x="20" y="54" width="24" height="6" fill="#2c3e50"/>
            <defs><linearGradient id="grad-trophy" x1="0" y1="0" x2="0" y2="64"><stop offset="0%" stop-color="#f1c40f"/><stop offset="100%" stop-color="#e67e22"/></linearGradient></defs>
        </svg>`
    },
    {
        id: "goals_10",
        title: "Gol Makinesi",
        desc: "Kariyerinde toplam 10 gol barajına ulaş.",
        category: "İstatistik",
        color: "#e74c3c",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="24" fill="#ffffff" stroke="#c0392b" stroke-width="3"/>
            <polygon points="32,18 39,23 37,31 27,31 25,23" fill="#2c3e50"/>
            <path d="M32 18L32 8M39 23L47 18M37 31L45 37M27 31L19 37M25 23L17 18" stroke="#2c3e50" stroke-width="2"/>
            <path d="M12 52C18 42 26 42 32 52C38 42 46 42 52 52" stroke="#e74c3c" stroke-width="3" stroke-linecap="round"/>
        </svg>`
    },
    {
        id: "goals_100",
        title: "Yüzler Kulübü",
        desc: "Kariyerinde toplam 100 gol atarak tarihe geç!",
        category: "İstatistik",
        color: "#e67e22",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="26" fill="url(#grad-100)" stroke="#d35400" stroke-width="2"/>
            <circle cx="32" cy="32" r="20" fill="#2c3e50" stroke="#f1c40f" stroke-width="1.5"/>
            <text x="32" y="38" font-size="15" font-weight="900" text-anchor="middle" fill="#f1c40f" font-family="Outfit">100</text>
            <defs><linearGradient id="grad-100" x1="0" y1="0" x2="64" y2="64"><stop offset="0%" stop-color="#f39c12"/><stop offset="100%" stop-color="#e67e22"/></linearGradient></defs>
        </svg>`
    },
    {
        id: "hat_trick",
        title: "Hat-Trick!",
        desc: "Tek bir maçta tam 3 gol birden at.",
        category: "Maç",
        color: "#1abc9c",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 36L20 20H44L52 36H12Z" fill="#34495e"/>
            <rect x="8" y="36" width="48" height="8" rx="4" fill="#2c3e50"/>
            <circle cx="22" cy="52" r="5" fill="#ffffff" stroke="#2c3e50" stroke-width="1.5"/>
            <circle cx="32" cy="52" r="5" fill="#ffffff" stroke="#2c3e50" stroke-width="1.5"/>
            <circle cx="42" cy="52" r="5" fill="#ffffff" stroke="#2c3e50" stroke-width="1.5"/>
        </svg>`
    },
    {
        id: "derby_winner",
        title: "Derbi Fatihi",
        desc: "1v1 Derbi maçında rakibini mağlup et.",
        category: "Derbi",
        color: "#c0392b",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="26" fill="url(#grad-red)" stroke="#922b21" stroke-width="2"/>
            <path d="M20 18L44 42M44 18L20 42" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
            <path d="M18 16L24 22M46 16L40 22M18 48L24 42M46 48L40 42" stroke="#f1c40f" stroke-width="3"/>
            <defs><linearGradient id="grad-red" x1="0" y1="0" x2="64" y2="64"><stop offset="0%" stop-color="#e74c3c"/><stop offset="100%" stop-color="#922b21"/></linearGradient></defs>
        </svg>`
    },
    {
        id: "clean_sheet",
        title: "Geçilmez Kale",
        desc: "Bir maçı kalesinde hiç gol yemeden tamamla.",
        category: "Savunma",
        color: "#34495e",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 6L52 14V32C52 46 32 58 32 58C32 58 12 46 12 32V14L32 6Z" fill="url(#grad-shield)" stroke="#1a252f" stroke-width="2"/>
            <path d="M32 18V44M20 30H44" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
            <defs><linearGradient id="grad-shield" x1="0" y1="0" x2="64" y2="64"><stop offset="0%" stop-color="#5d6d7e"/><stop offset="100%" stop-color="#2c3e50"/></linearGradient></defs>
        </svg>`
    },
    {
        id: "penalty_hero",
        title: "Panter Kaleci",
        desc: "Penaltı atışlarında maçı kazan veya penaltı kurtar.",
        category: "Kaleci",
        color: "#27ae60",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="16" width="28" height="36" rx="6" fill="#27ae60" stroke="#1e8449" stroke-width="2"/>
            <path d="M22 16V10C22 8 24 6 26 6C28 6 30 8 30 10V16M30 16V8C30 6 32 4 34 4C36 4 38 6 38 8V16M38 16V10C38 8 40 6 42 6C44 6 46 8 46 10V16" stroke="#27ae60" stroke-width="3"/>
            <circle cx="32" cy="34" r="6" fill="#f1c40f"/>
        </svg>`
    },
    {
        id: "win_streak_5",
        title: "Yenilmezlik Serisi",
        desc: "Üst üste 5 maç kazanarak seriyi tamamla.",
        category: "Performans",
        color: "#d35400",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 6C32 6 38 18 38 26C38 30 35 34 32 36C29 34 26 30 26 26C26 18 32 6 32 6Z" fill="#f39c12"/>
            <path d="M32 18C32 18 48 30 48 42C48 52 40 58 32 58C24 58 16 52 16 42C16 30 32 18 32 18Z" fill="url(#grad-fire)" stroke="#d35400" stroke-width="2"/>
            <defs><linearGradient id="grad-fire" x1="0" y1="0" x2="0" y2="64"><stop offset="0%" stop-color="#e67e22"/><stop offset="100%" stop-color="#c0392b"/></linearGradient></defs>
        </svg>`
    },
    {
        id: "trophy_collector",
        title: "Kupa Koleksiyoneri",
        desc: "Müzende 5 şampiyonluk kupası biriktir.",
        category: "Koleksiyon",
        color: "#8e44ad",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="48" width="48" height="10" fill="#2c3e50" rx="2"/>
            <path d="M16 20L20 48M32 14L32 48M48 20L44 48" stroke="#f1c40f" stroke-width="3"/>
            <circle cx="32" cy="12" r="6" fill="#f1c40f"/>
            <circle cx="16" cy="18" r="4" fill="#f39c12"/>
            <circle cx="48" cy="18" r="4" fill="#f39c12"/>
        </svg>`
    },
    {
        id: "tactician",
        title: "Taktik Dehası",
        desc: "4-3-3 dizilişini seçerek galibiyet elde et.",
        category: "Taktik",
        color: "#2980b9",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="8" width="44" height="48" rx="4" fill="#27ae60" stroke="#1e8449" stroke-width="2"/>
            <line x1="10" y1="32" x2="54" y2="32" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2"/>
            <circle cx="32" cy="32" r="8" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2"/>
            <circle cx="32" cy="50" r="2" fill="#ffffff"/>
            <circle cx="20" cy="38" r="2" fill="#ffffff"/><circle cx="32" cy="38" r="2" fill="#ffffff"/><circle cx="44" cy="38" r="2" fill="#ffffff"/>
            <circle cx="16" cy="20" r="2" fill="#ffffff"/><circle cx="32" cy="16" r="2" fill="#ffffff"/><circle cx="48" cy="20" r="2" fill="#ffffff"/>
        </svg>`
    },
    {
        id: "var_master",
        title: "VAR Adaleti",
        desc: "VAR incelemesi sonucunda onaylanan bir gol at.",
        category: "Özel",
        color: "#16a085",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="10" width="48" height="34" rx="4" fill="#16a085" stroke="#117864" stroke-width="2"/>
            <rect x="24" y="44" width="16" height="10" fill="#2c3e50"/>
            <rect x="16" y="54" width="32" height="4" fill="#2c3e50"/>
            <text x="32" y="32" font-size="14" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="Outfit">VAR</text>
        </svg>`
    },
    {
        id: "matches_10",
        title: "Emektar Oyuncu",
        desc: "Kariyerinde toplam 10 maç tamamla.",
        category: "Sadakat",
        color: "#d35400",
        iconSvg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="38" r="18" fill="url(#grad-veteran)" stroke="#b9770e" stroke-width="2"/>
            <path d="M24 8L32 20L40 8" stroke="#c0392b" stroke-width="6" stroke-linecap="round"/>
            <path d="M28 38L32 33L36 38L34 44L30 44Z" fill="#ffffff"/>
            <defs><linearGradient id="grad-veteran" x1="0" y1="0" x2="64" y2="64"><stop offset="0%" stop-color="#f1c40f"/><stop offset="100%" stop-color="#d35400"/></linearGradient></defs>
        </svg>`
    }
];

function getUnlockedAchievements() {
    try {
        const raw = localStorage.getItem("superlig_draft_achievements");
        return raw ? JSON.parse(raw) : [];
    } catch(e) {
        return [];
    }
}

function unlockAchievement(achId) {
    const unlocked = getUnlockedAchievements();
    if (unlocked.includes(achId)) return;

    const item = ACHIEVEMENTS_DATA.find(a => a.id === achId);
    if (!item) return;

    unlocked.push(achId);
    try {
        localStorage.setItem("superlig_draft_achievements", JSON.stringify(unlocked));
    } catch(e) {}

    playRetroAchievementSound();
    showAchievementToast(item);

    const museumGrid = document.getElementById("museum-achievements-grid");
    if (museumGrid) {
        renderMuseumAchievements();
    }
}

function playRetroAchievementSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.value = freq;

            const startTime = ctx.currentTime + idx * 0.1;
            const duration = 0.18;

            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    } catch (e) {}
}

function showAchievementToast(ach) {
    const container = document.getElementById("achievement-toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.innerHTML = `
        <div class="toast-badge-box">
            ${ach.iconSvg}
        </div>
        <div class="toast-body">
            <div class="toast-header-tag">🏆 BAŞARIM KİLİDİ AÇILDI!</div>
            <div class="toast-title">${ach.title}</div>
            <div class="toast-desc">${ach.desc}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-leave");
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 450);
    }, 4000);
}

function renderMuseumAchievements() {
    const container = document.getElementById("museum-achievements-grid");
    const countEl = document.getElementById("unlocked-achievements-count");
    if (!container) return;

    const unlocked = getUnlockedAchievements();
    if (countEl) countEl.innerText = unlocked.length;

    container.innerHTML = "";

    ACHIEVEMENTS_DATA.forEach(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        const cardClass = isUnlocked ? "achievement-card unlocked" : "achievement-card locked";
        const statusText = isUnlocked ? '<i class="fa-solid fa-circle-check"></i> Tamamlandı' : '<i class="fa-solid fa-lock"></i> Kilitli';

        container.innerHTML += `
            <div class="${cardClass}">
                <div class="achievement-badge-icon">
                    ${ach.iconSvg}
                </div>
                <div class="achievement-details">
                    <div class="achievement-title-row">
                        <span class="achievement-title">${ach.title}</span>
                        <span class="achievement-tag">${ach.category}</span>
                    </div>
                    <span class="achievement-desc">${ach.desc}</span>
                    <span class="achievement-status-badge">${statusText}</span>
                </div>
            </div>
        `;
    });
}

// Global window bindings for Poster system
window.downloadPoster = downloadPoster;
window.sharePoster = sharePoster;
window.closePosterModal = closePosterModal;
window.adjustPosterScale = adjustPosterScale;
window.generateMultiplayerPoster = generateMultiplayerPoster;
window.generatePoster = generatePoster;

