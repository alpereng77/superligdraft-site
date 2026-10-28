import React from 'react';

export default function TycoonModals() {
    const close = (id) => {
        if (window.closeTycoonModal) {
            window.closeTycoonModal(id);
        } else {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        }
    };

    return (
        <>
            {/* Achievement & Tycoon Toast Containers */}
            <div id="achievement-toast-container" className="achievement-toast-container"></div>
            <div id="tycoon-toast-container" className="tycoon-toast-container"></div>

            {/* 1. FIFA FUT Pack Opening & Walkout Stage Modal */}
            <div id="tycoon-pack-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card pack-stage-card">
                    <div className="stage-spotlights">
                        <div className="stage-beam beam-left"></div>
                        <div className="stage-beam beam-right"></div>
                    </div>
                    <canvas id="tycoon-confetti-canvas" className="tycoon-confetti-canvas"></canvas>
                    <div id="tycoon-pack-stage" className="tycoon-pack-stage">
                        {/* Dynamic Pack Opening & Walkout UI */}
                    </div>
                </div>
            </div>

            {/* 2. Pack Store Modal */}
            <div id="tycoon-store-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card large">
                    <div className="tycoon-modal-header">
                        <div className="b-head-title">
                            <img
                                src="/icon-assets/icon-pack.png"
                                alt="Paketler"
                                className="badge-3d-icon"
                                width={32}
                                height={32}
                                style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', verticalAlign: 'middle' }}
                            />
                            <div>
                                <h3>Paket Mağazası</h3>
                                <span className="badge-level">FUT NOSTALJİ PAKETLERİ</span>
                            </div>
                        </div>
                        <button className="btn-close-modal" onClick={() => close('tycoon-store-modal')}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="tycoon-modal-body">
                        <div className="store-packs-grid" id="tycoon-store-packs-grid"></div>
                    </div>
                </div>
            </div>

            {/* 3. Professional Transfer Market & Scout Hub Modal */}
            <div id="tycoon-market-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card xlarge market-pro-card">
                    <div className="tycoon-modal-header market-header">
                        <div className="b-head-title">
                            <img
                                src="/icon-assets/icon-transfer.png"
                                alt="Transfer"
                                className="badge-3d-icon"
                                width={32}
                                height={32}
                                style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', verticalAlign: 'middle' }}
                            />
                            <div>
                                <h3>Transfer Borsası &amp; Canlı Scout Pazarı</h3>
                                <span className="badge-level gold">
                                    <i className="fa-solid fa-bolt"></i> CANLI TRANSFER SEZONU AÇIK
                                </span>
                            </div>
                        </div>
                        <div className="market-header-actions">
                            <div className="market-budget-pill">
                                <i className="fa-solid fa-coins text-gold"></i>
                                <span>
                                    Bütçe: <strong id="market-modal-budget">0 €</strong>
                                </span>
                            </div>
                            <button
                                className="btn btn-gold btn-small"
                                onClick={() => window.forceRefreshMarketWithFee && window.forceRefreshMarketWithFee()}
                                title="Yeni oyuncuları listele"
                            >
                                <i className="fa-solid fa-arrows-rotate"></i> Yenile (1.000 €)
                            </button>
                            <button className="btn-close-modal" onClick={() => close('tycoon-market-modal')}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>

                    <div className="tycoon-modal-body market-body">
                        <div className="market-filter-bar">
                            <div className="market-pos-tabs">
                                <button
                                    className="market-tab-btn active"
                                    onClick={(e) => window.filterMarketPosition && window.filterMarketPosition('ALL', e.currentTarget)}
                                >
                                    <i className="fa-solid fa-globe"></i> Tümü
                                </button>
                                <button
                                    className="market-tab-btn"
                                    onClick={(e) => window.filterMarketPosition && window.filterMarketPosition('FW', e.currentTarget)}
                                >
                                    <i className="fa-solid fa-futbol"></i> Forvet (FV)
                                </button>
                                <button
                                    className="market-tab-btn"
                                    onClick={(e) => window.filterMarketPosition && window.filterMarketPosition('MF', e.currentTarget)}
                                >
                                    <i className="fa-solid fa-arrows-spin"></i> Orta Saha (OS)
                                </button>
                                <button
                                    className="market-tab-btn"
                                    onClick={(e) => window.filterMarketPosition && window.filterMarketPosition('DF', e.currentTarget)}
                                >
                                    <i className="fa-solid fa-shield-halved"></i> Defans (DF)
                                </button>
                                <button
                                    className="market-tab-btn"
                                    onClick={(e) => window.filterMarketPosition && window.filterMarketPosition('GK', e.currentTarget)}
                                >
                                    <i className="fa-solid fa-mitten"></i> Kaleci (KL)
                                </button>
                            </div>
                            <div className="market-view-switch">
                                <button
                                    className="market-tab-btn switch-tab active"
                                    id="btn-market-mode-buy"
                                    onClick={() => window.switchMarketMode && window.switchMarketMode('buy')}
                                >
                                    <i className="fa-solid fa-store"></i> Satılık Yıldızlar
                                </button>
                                <button
                                    className="market-tab-btn switch-tab"
                                    id="btn-market-mode-sell"
                                    onClick={() => window.switchMarketMode && window.switchMarketMode('sell')}
                                >
                                    <i className="fa-solid fa-tags"></i> Kadromdan Sat
                                </button>
                            </div>
                        </div>

                        <div id="market-buy-section" className="market-section active">
                            <div className="market-cards-grid modern-grid scrollbar" id="tycoon-market-cards-grid"></div>
                        </div>

                        <div id="market-sell-section" className="market-section hidden">
                            <div className="market-sell-grid scrollbar" id="tycoon-market-sell-grid"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Squad & Bench Management Modal */}
            <div id="tycoon-squad-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card large">
                    <div className="tycoon-modal-header">
                        <div className="b-head-title">
                            <img
                                src="/icon-assets/icon-squad.png"
                                alt="Kadro"
                                className="badge-3d-icon"
                                width={32}
                                height={32}
                                style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', verticalAlign: 'middle' }}
                            />
                            <div>
                                <h3>Kadro &amp; Kulüp Envanteri</h3>
                                <span className="badge-level">İLK 11 &amp; YEDEKLER</span>
                            </div>
                        </div>
                        <div className="squad-modal-header-actions">
                            <button
                                className="btn btn-white btn-small"
                                onClick={() => window.clearLineupToBench && window.clearLineupToBench()}
                                title="İlk 11'deki tüm oyuncuları yedeğe alır"
                            >
                                <i className="fa-solid fa-trash-can"></i> Boşalt
                            </button>
                            <button
                                className="btn btn-gold btn-small"
                                onClick={() => window.autoFillBestLineup && window.autoFillBestLineup()}
                                title="En iyi 11'i sahaya dizer"
                            >
                                <i className="fa-solid fa-bolt"></i> Otomatik Doldur
                            </button>
                            <button className="btn-close-modal" onClick={() => close('tycoon-squad-modal')}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                    <div className="tycoon-modal-body">
                        <div className="squad-sections-split">
                            <div className="squad-col">
                                <div className="squad-col-header">
                                    <h4>
                                        <i className="fa-solid fa-futbol text-green"></i> Sahadaki İlk 11
                                    </h4>
                                    <span className="squad-count-badge" id="squad-lineup-count">
                                        0/11
                                    </span>
                                </div>
                                <div id="tycoon-modal-lineup-list" className="squad-items-list scrollbar"></div>
                            </div>
                            <div className="squad-col">
                                <div className="squad-col-header">
                                    <h4>
                                        <i className="fa-solid fa-couch text-blue"></i> Yedek Kulübesi
                                    </h4>
                                    <span className="squad-filter-badge" id="squad-bench-filter-tag">
                                        Tümü
                                    </span>
                                </div>
                                <div id="tycoon-modal-bench-list" className="squad-items-list scrollbar"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Career League Modal */}
            <div id="tycoon-league-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card">
                    <div className="tycoon-modal-header">
                        <div className="b-head-title">
                            <img src="/icon-assets/icon-trophy.png" alt="Lig" className="badge-3d-icon" />
                            <div>
                                <h3 id="tycoon-league-tier-name">Lig Kariyeri</h3>
                                <span className="badge-level">SEZON FİKSTÜRÜ</span>
                            </div>
                        </div>
                        <button className="btn-close-modal" onClick={() => close('tycoon-league-modal')}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="tycoon-modal-body">
                        <div className="league-stats-overview">
                            <div className="l-stat-item">
                                <span className="lbl">Puan</span>
                                <strong className="val" id="tycoon-league-points">
                                    0
                                </strong>
                            </div>
                            <div className="l-stat-item">
                                <span className="lbl">Oynanan</span>
                                <strong className="val" id="tycoon-league-played">
                                    0 / 10
                                </strong>
                            </div>
                            <div className="l-stat-item">
                                <span className="lbl">G - B - M</span>
                                <strong className="val" id="tycoon-league-record">
                                    0 - 0 - 0
                                </strong>
                            </div>
                        </div>

                        <div className="league-match-card-preview">
                            <div className="m-team">
                                <span className="t-name">SENİN TAKIMIN</span>
                                <span className="t-ovr">
                                    GÜÇ: <strong id="tycoon-match-my-ovr">60</strong>
                                </span>
                            </div>
                            <div className="m-vs">VS</div>
                            <div className="m-team">
                                <span className="t-name">LİG RAKİBİ</span>
                                <span className="t-ovr">
                                    GÜÇ: <strong id="tycoon-match-opp-ovr">62</strong>
                                </span>
                            </div>
                        </div>

                        <div className="league-targets-box">
                            <div id="tycoon-league-target">Hedef: 12 Puan</div>
                            <div id="tycoon-league-reward">Ödül: 10,000 € + Amatör Kupa</div>
                        </div>
                    </div>
                    <div className="tycoon-modal-footer">
                        <button
                            id="btn-tycoon-play-match"
                            className="btn btn-black btn-large w-100"
                            onClick={() => window.playTycoonLeagueMatch && window.playTycoonLeagueMatch()}
                        >
                            <i className="fa-solid fa-play"></i> SIRADAKİ MAÇI OYNA
                        </button>
                    </div>
                </div>
            </div>

            {/* 6. Online Leaderboard Modal */}
            <div id="tycoon-leaderboard-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card large">
                    <div className="tycoon-modal-header">
                        <div className="b-head-title">
                            <i className="fa-solid fa-globe text-blue"></i>
                            <div>
                                <h3>Online Global Sıralama</h3>
                                <span className="badge-level">EN İYİ NOSTALJİ KULÜPLERİ</span>
                            </div>
                        </div>
                        <button className="btn-close-modal" onClick={() => close('tycoon-leaderboard-modal')}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="tycoon-modal-body">
                        <div className="leaderboard-sync-bar">
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                Kulübünüzün güncel değerini online sıralamaya gönderin:
                            </p>
                            <button
                                id="btn-tycoon-sync-rank"
                                className="btn btn-black"
                                onClick={() => window.syncMyClubToLeaderboard && window.syncMyClubToLeaderboard()}
                            >
                                <i className="fa-solid fa-cloud-arrow-up"></i> Kulübümü Kaydet &amp; Güncelle
                            </button>
                        </div>
                        <div className="leaderboard-table-container scrollbar">
                            <table className="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th>Sıra</th>
                                        <th>Kulüp / Menajer</th>
                                        <th>OVR</th>
                                        <th>Lig</th>
                                        <th>Kupa</th>
                                        <th>Kulüp Değeri</th>
                                    </tr>
                                </thead>
                                <tbody id="tycoon-leaderboard-body"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. Club Settings Modal */}
            <div id="tycoon-club-settings-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card">
                    <div className="tycoon-modal-header">
                        <div className="b-head-title">
                            <i className="fa-solid fa-pen-to-square"></i>
                            <div>
                                <h3>Kulüp Bilgilerini Düzenle</h3>
                                <span className="badge-level">KİMLİK AYARLARI</span>
                            </div>
                        </div>
                        <button className="btn-close-modal" onClick={() => close('tycoon-club-settings-modal')}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="tycoon-modal-body">
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.85rem' }}>
                                Kulüp Adı
                            </label>
                            <input
                                type="text"
                                id="input-tycoon-club-name"
                                maxLength={20}
                                className="w-100"
                                style={{ padding: '10px', border: '2px solid #000', fontWeight: 'bold', fontSize: '1rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.85rem' }}>
                                Menajer Adı
                            </label>
                            <input
                                type="text"
                                id="input-tycoon-manager-name"
                                maxLength={20}
                                className="w-100"
                                style={{ padding: '10px', border: '2px solid #000', fontWeight: 'bold', fontSize: '1rem' }}
                            />
                        </div>
                        <hr style={{ border: 0, borderTop: '1px dashed #cbd5e1', margin: '15px 0' }} />
                        <div
                            style={{
                                background: '#fff1f2',
                                border: '1.5px dashed #f43f5e',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '5px',
                            }}
                        >
                            <h4
                                style={{
                                    margin: '0 0 6px 0',
                                    color: '#be123c',
                                    fontSize: '0.88rem',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <i className="fa-solid fa-triangle-exclamation"></i> Tehlikeli Bölge
                            </h4>
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#881337', lineHeight: 1.35 }}>
                                Kariyeri sıfırlamak tüm kadronuzu, binalarınızı, paranızı ve lig ilerlemenizi kalıcı olarak siler ve baştan başlatır.
                            </p>
                            <button
                                type="button"
                                className="btn-danger-soft w-100"
                                onClick={() => window.openResetTycoonModal && window.openResetTycoonModal()}
                            >
                                <i className="fa-solid fa-rotate-left"></i> Kariyeri Sıfırla
                            </button>
                        </div>
                    </div>
                    <div className="tycoon-modal-footer">
                        <button
                            className="btn btn-black btn-large w-100"
                            onClick={() => window.saveClubSettings && window.saveClubSettings()}
                        >
                            <i className="fa-solid fa-floppy-disk"></i> KAYDET
                        </button>
                    </div>
                </div>
            </div>

            {/* 8. Live Match Day Simulator & Radar Modal */}
            <div id="tycoon-live-match-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card live-match-modal-card">
                    <div className="live-match-scoreboard">
                        <div className="team-score-block">
                            <i className="fa-solid fa-shield-halved team-icon"></i>
                            <h4 id="live-match-home-name">KULÜBÜNÜZ</h4>
                            <span className="ovr-pill">
                                OVR: <strong id="live-match-home-ovr">78</strong>
                            </span>
                        </div>
                        <div className="score-center-block">
                            <div className="match-clock-badge" id="live-match-clock">
                                00&apos;
                            </div>
                            <div className="match-score-digits">
                                <span id="live-score-home">0</span> - <span id="live-score-away">0</span>
                            </div>
                        </div>
                        <div className="team-score-block">
                            <i className="fa-solid fa-shield team-icon" style={{ color: '#94a3b8' }}></i>
                            <h4 id="live-match-away-name">LİG RAKİBİ</h4>
                            <span className="ovr-pill">
                                OVR: <strong id="live-match-away-ovr">75</strong>
                            </span>
                        </div>
                    </div>

                    <div className="live-facility-event-banner" id="live-facility-banner">
                        <i className="fa-solid fa-bolt text-gold"></i>
                        <span id="live-facility-text">
                            🏟️ Ev Sahibi Stadyum Coşkusu Devrede: Tribünler takımı ateşliyor!
                        </span>
                    </div>

                    <div className="live-commentary-feed scrollbar" id="live-commentary-feed"></div>

                    <div className="live-match-controls">
                        <div className="match-speed-btn-group">
                            <button
                                className="btn-speed active"
                                id="btn-speed-1x"
                                onClick={() => window.setLiveMatchSpeed && window.setLiveMatchSpeed(1)}
                            >
                                1x
                            </button>
                            <button
                                className="btn-speed"
                                id="btn-speed-2x"
                                onClick={() => window.setLiveMatchSpeed && window.setLiveMatchSpeed(2)}
                            >
                                2x
                            </button>
                            <button
                                className="btn-speed"
                                id="btn-speed-4x"
                                onClick={() => window.setLiveMatchSpeed && window.setLiveMatchSpeed(4)}
                            >
                                4x
                            </button>
                        </div>
                        <button
                            className="btn-skip-match"
                            onClick={() => window.skipLiveMatchToEnd && window.skipLiveMatchToEnd()}
                        >
                            <i className="fa-solid fa-forward-fast"></i> Anında Bitir
                        </button>
                    </div>
                </div>
            </div>

            {/* 9. Modern Player Training & Performance Modal */}
            <div id="tycoon-training-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card large training-modal-card">
                    <div className="tycoon-modal-header">
                        <div className="b-head-title">
                            <img
                                src="/icon-assets/icon-training.png"
                                alt="Antrenman"
                                className="badge-3d-icon"
                                width={32}
                                height={32}
                                style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', verticalAlign: 'middle' }}
                            />
                            <div>
                                <h3>Oyuncu Geliştirme &amp; Performans Kampı</h3>
                                <span className="badge-level">ANTRENMAN MERKEZİ</span>
                            </div>
                        </div>
                        <button className="btn-close-modal" onClick={() => close('tycoon-training-modal')}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="tycoon-modal-body">
                        <div className="training-overview-banner" id="training-facility-summary"></div>
                        <div
                            className="training-top-actions"
                            style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>
                                Antrenman yaptırarak oyuncularınızın reytingini kalıcı olarak yükseltin.
                            </p>
                            <button
                                className="btn btn-gold btn-small"
                                onClick={() => window.trainAllLineup && window.trainAllLineup()}
                            >
                                <i className="fa-solid fa-fire"></i> TÜM İLK 11&apos;İ ÇALIŞTIR
                            </button>
                        </div>
                        <div id="tycoon-training-players-list" className="training-players-list scrollbar"></div>
                    </div>
                </div>
            </div>

            {/* 10. Club Quests & Season Milestones Modal */}
            <div id="tycoon-quests-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card quests-modal-card">
                    <div className="tycoon-modal-header">
                        <div className="b-head-title">
                            <img
                                src="/icon-assets/icon-quests.png"
                                alt="Görevler"
                                className="badge-3d-icon"
                                width={32}
                                height={32}
                                style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', verticalAlign: 'middle' }}
                            />
                            <div>
                                <h3>Kulüp Başkanlığı Sezonluk Görevleri</h3>
                                <span className="badge-level">HEDEFLER &amp; PRİMLER</span>
                            </div>
                        </div>
                        <button className="btn-close-modal" onClick={() => close('tycoon-quests-modal')}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="tycoon-modal-body">
                        <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#555' }}>
                            Sezon hedeflerini tamamlayarak dev bütçeler, sadık taraftarlar ve özel paketler kazanın.
                        </p>
                        <div className="quests-list scrollbar" id="tycoon-quests-list"></div>
                    </div>
                </div>
            </div>

            {/* 11. Sponsorship Deals & TV Broadcasting Rights Modal */}
            <div id="tycoon-sponsorship-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card sponsorship-modal-card">
                    <div className="tycoon-modal-header">
                        <div className="b-head-title">
                            <img
                                src="/icon-assets/icon-sponsor.png"
                                alt="Sponsorluk"
                                className="badge-3d-icon"
                                width={32}
                                height={32}
                                style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', verticalAlign: 'middle' }}
                            />
                            <div>
                                <h3>Sponsorluk Sözleşmeleri &amp; TV Yayın İhalesi</h3>
                                <span className="badge-level">TİCARİ ANLAŞMALAR</span>
                            </div>
                        </div>
                        <button className="btn-close-modal" onClick={() => close('tycoon-sponsorship-modal')}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="tycoon-modal-body">
                        <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#555' }}>
                            Medya Kulesi ve Stadyumunuzun büyüklüğüne göre dev markalarla sezonluk sponsorluk sözleşmeleri imzalayın.
                        </p>
                        <div className="sponsorship-grid" id="tycoon-sponsorship-grid"></div>
                    </div>
                </div>
            </div>

            {/* 12. Trophy & All-Time XI Museum Modal */}
            <div id="tycoon-museum-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card museum-modal-card">
                    <div className="tycoon-modal-header">
                        <div className="b-head-title">
                            <img
                                src="/icon-assets/icon-trophy.png"
                                alt="Müze"
                                className="badge-3d-icon"
                                width={32}
                                height={32}
                                style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', verticalAlign: 'middle' }}
                            />
                            <div>
                                <h3>Kulüp Kupa Müzesi &amp; Şeref Salonu</h3>
                                <span className="badge-level">MÜZE &amp; KUPALAR</span>
                            </div>
                        </div>
                        <button className="btn-close-modal" onClick={() => close('tycoon-museum-modal')}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="tycoon-modal-body">
                        <div
                            className="museum-hall-banner"
                            style={{
                                padding: '12px',
                                background: '#faf5ff',
                                border: '1.5px solid #d8b4fe',
                                borderRadius: '10px',
                                marginBottom: '14px',
                                textAlign: 'center',
                            }}
                        >
                            <h4 style={{ margin: '0 0 4px', color: '#581c87' }}>
                                <i className="fa-solid fa-crown text-gold"></i> Efsaneler Vitrini
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b21a8' }}>
                                Kazandığınız lig şampiyonluk kupaları ve başarımlar kulüp müzenizde sergilenir.
                            </p>
                        </div>
                        <div className="trophy-showcase-grid" id="tycoon-museum-trophies-grid"></div>
                    </div>
                </div>
            </div>

            {/* 13. Tycoon Career Reset Confirmation Modal */}
            <div id="tycoon-reset-modal" className="tycoon-modal-backdrop hidden">
                <div className="tycoon-modal-card" style={{ maxWidth: '440px', textAlign: 'center' }}>
                    <div
                        className="tycoon-modal-header"
                        style={{ justifyContent: 'center', background: '#fee2e2', borderBottom: '2px solid #000' }}
                    >
                        <div className="b-head-title" style={{ color: '#b91c1c', justifyContent: 'center' }}>
                            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.5rem', color: '#dc2626' }}></i>
                            <div>
                                <h3 style={{ color: '#991b1b', margin: 0 }}>Kariyeri Sıfırla?</h3>
                                <span className="badge-level" style={{ background: '#dc2626', color: '#fff' }}>
                                    GERİ ALINAMAZ
                                </span>
                            </div>
                        </div>
                        <button className="btn-close-modal" onClick={() => close('tycoon-reset-modal')}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="tycoon-modal-body" style={{ padding: '20px 16px' }}>
                        <p style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', fontSize: '1rem' }}>
                            Tycoon modundaki tüm ilerlemeniz sıfırlanacak!
                        </p>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 0, lineHeight: 1.45 }}>
                            İlk 11 ve yedek oyuncularınız, kulüp binalarınız, kasanızdaki bütçe ve lig maç geçmişiniz tamamen silinir. Başlangıç paketini açarak sıfırdan başlayabilirsiniz.
                        </p>
                    </div>
                    <div
                        className="tycoon-modal-footer"
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
                    >
                        <button className="btn btn-white w-100" onClick={() => close('tycoon-reset-modal')}>
                            <i className="fa-solid fa-xmark"></i> Vazgeç
                        </button>
                        <button
                            className="btn-danger-solid w-100"
                            onClick={() => window.executeResetTycoonCareer && window.executeResetTycoonCareer()}
                        >
                            <i className="fa-solid fa-rotate-left"></i> Evet, Sıfırla
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

