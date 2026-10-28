import React from 'react';

export default function TycoonScreen() {
    return (
        <section id="screen-tycoon" className="screen">
            <div className="tycoon-container w-[96%] max-w-[1420px] mx-auto flex flex-col gap-[14px]">
                {/* 2 Sütunlu Tycoon Kokpit: Sol Kadro/Saha - Sağ Kontrol Paneli & Butonlar */}
                <div className="tycoon-split-cockpit">
                    {/* Sol Sütun: Taktik Sahası / Şehir Görünümü */}
                    <div className="tycoon-cockpit-left">
                        {/* GÖRÜNÜM 1: 11 Pitch Grid Display (Taktik Sahası) */}
                        <div id="tycoon-view-pitch" className="tycoon-view-panel active">
                            <div className="tycoon-pitch-wrapper">
                                <div className="pitch-tactical-header-pro">
                                    <div className="tac-header-left">
                                        <span className="tac-title-badge">
                                            <i className="fa-solid fa-futbol"></i> TAKTİK TAHTASI
                                        </span>
                                    </div>

                                    <div className="tac-header-center">
                                        <div className="formation-badge-wrapper">
                                            <i className="fa-solid fa-shapes text-gold"></i>
                                            <select
                                                id="select-tycoon-formation"
                                                className="formation-select-pro"
                                                defaultValue="4-4-2"
                                                onChange={(e) => window.changeFormation && window.changeFormation(e.target.value)}
                                            >
                                                <option value="4-4-2">4-4-2 Dengeli</option>
                                                <option value="4-3-3">4-3-3 Hücum</option>
                                                <option value="3-5-2">3-5-2 Orta Saha</option>
                                                <option value="4-2-3-1">4-2-3-1 Modern</option>
                                                <option value="5-3-2">5-3-2 Savunma</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="tac-header-right">
                                        <button
                                            className="tac-act-btn btn-clear"
                                            onClick={() => window.clearLineupToBench && window.clearLineupToBench()}
                                            title="Tüm kadroyu yedek kulübesine gönder"
                                        >
                                            <i className="fa-solid fa-trash-can"></i> <span>Boşalt</span>
                                        </button>
                                        <button
                                            className="tac-act-btn btn-autofill"
                                            onClick={() => window.autoFillBestLineup && window.autoFillBestLineup()}
                                            title="En iyi 11'i diz"
                                        >
                                            <i className="fa-solid fa-bolt"></i> <span>Otomatik</span>
                                        </button>
                                        <button
                                            className="tac-act-btn btn-toggle-side"
                                            onClick={() => window.toggleTycoonSidebar && window.toggleTycoonSidebar()}
                                            title="Sağ Menüyü Aç / Kapat"
                                        >
                                            <i className="fa-solid fa-bars"></i> <span>Menü</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="tycoon-pitch-slots-grid" id="tycoon-pitch-slots-grid">
                                    {/* 11 Tactical Circles Rendered Dynamically */}
                                </div>
                            </div>
                        </div>

                        {/* GÖRÜNÜM 2: İzometrik Kulüp Şehri — City Builder */}
                        <div id="tycoon-view-city" className="tycoon-view-panel hidden">
                            {/* Şehir Üst Araç Çubuğu (HUD Header) */}
                            <div className="city-toolbar" id="city-toolbar">
                                <div className="city-toolbar-left">
                                    <button
                                        className="city-tool-btn highlight"
                                        id="btn-city-build"
                                        onClick={() => window.CityBuilder && window.CityBuilder.openBuildPanel()}
                                        title="Yeni bina satın al ve kampüse yerleştir"
                                    >
                                        <i className="fa-solid fa-hammer"></i>
                                        <span>İnşa Et</span>
                                    </button>
                                    <button
                                        className="city-tool-btn"
                                        id="btn-city-road"
                                        onClick={() => window.CityBuilder && window.CityBuilder.toggleRoadBar()}
                                        title="Asfalt yol ve taş yürüyüş yolu döşe"
                                    >
                                        <i className="fa-solid fa-road"></i>
                                        <span>Yol Döşe</span>
                                    </button>
                                    <button
                                        className="city-tool-btn"
                                        id="btn-city-land"
                                        onClick={() => window.CityBuilder && window.CityBuilder.openLandPanel()}
                                        title="Kulüp arazisini genişlet"
                                    >
                                        <i className="fa-solid fa-map"></i>
                                        <span>Arazi Satın Al</span>
                                    </button>
                                </div>
                                <div className="city-toolbar-right">
                                    <button
                                        className="city-tool-btn danger hidden"
                                        id="btn-city-cancel"
                                        onClick={() => window.CityBuilder && window.CityBuilder.cancelAction()}
                                        title="İşlemi iptal et"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                        <span>İptal</span>
                                    </button>
                                    <button
                                        className="city-tool-btn btn-toggle-side highlight"
                                        onClick={() => window.toggleTycoonSidebar && window.toggleTycoonSidebar()}
                                        title="Sağ Menüyü Aç / Kapat"
                                    >
                                        <i className="fa-solid fa-bars"></i>
                                        <span>Menü</span>
                                    </button>
                                </div>
                            </div>

                            {/* Yol Seçim Alt Barı (Road Palette Bar) */}
                            <div id="city-road-bar" className="city-road-bar hidden">
                                <div className="road-bar-title">
                                    <i className="fa-solid fa-road text-gold"></i> Yol Tipi:
                                </div>
                                <button
                                    className="road-type-btn active"
                                    id="btn-road-asphalt"
                                    onClick={() => window.CityBuilder && window.CityBuilder.setRoadType('asphalt')}
                                >
                                    <i className="fa-solid fa-road"></i> Asfalt Bulvar (150 €)
                                </button>
                                <button
                                    className="road-type-btn"
                                    id="btn-road-paved"
                                    onClick={() => window.CityBuilder && window.CityBuilder.setRoadType('paved')}
                                >
                                    <i className="fa-solid fa-shoe-prints"></i> Taş Kaldırım (75 €)
                                </button>
                                <button
                                    className="road-type-btn eraser"
                                    id="btn-road-eraser"
                                    onClick={() => window.CityBuilder && window.CityBuilder.setRoadType('eraser')}
                                >
                                    <i className="fa-solid fa-eraser"></i> Kazma / Yol Sil
                                </button>
                            </div>

                            {/* İzometrik Canvas Alanı */}
                            <div className="city-canvas-wrapper" id="city-canvas-wrapper">
                                <canvas id="city-iso-canvas"></canvas>

                                {/* Yüzen Kamera Kontrolleri (Floating HUD) */}
                                <div className="city-camera-dock">
                                    <button
                                        className="btn-cam"
                                        onClick={() => window.CityBuilder && window.CityBuilder.zoomIn()}
                                        title="Yakınlaştır"
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                    </button>
                                    <button
                                        className="btn-cam"
                                        onClick={() => window.CityBuilder && window.CityBuilder.zoomOut()}
                                        title="Uzaklaştır"
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <button
                                        className="btn-cam"
                                        onClick={() => window.CityBuilder && window.CityBuilder.centerCamera()}
                                        title="Merkeze Odakla"
                                    >
                                        <i className="fa-solid fa-crosshairs"></i>
                                    </button>
                                </div>

                                {/* Bina Bilgi Popup (Kart) */}
                                <div id="city-building-popup" className="city-building-popup hidden"></div>

                                {/* Bina İnşa Paneli (Alt Yüzen Drawer) */}
                                <div id="city-build-panel" className="city-build-panel hidden"></div>

                                {/* Arazi Satın Alma Paneli */}
                                <div id="city-land-panel" className="city-land-panel hidden"></div>
                            </div>
                        </div>
                    </div>

                    {/* Sağ Sütun: Kulüp Bilgisi + İstatistikler + Menü Butonları */}
                    <div className="tycoon-cockpit-right" id="tycoon-cockpit-right">
                        {/* Gazete Küpürü Üst Manşet & Profil */}
                        <div className="tycoon-newspaper-masthead">
                            <div className="newspaper-top-strip">
                                <span>★ NOSTALJİ SPOR BÜLTENİ</span>
                                <span>GÜNLÜK BASKI ★</span>
                            </div>
                            <div className="tycoon-sidebar-profile">
                                <div className="club-badge">
                                    <i className="fa-solid fa-shield-halved"></i>
                                </div>
                                <div className="club-meta">
                                    <h3 id="tycoon-club-name-title">Nostalji FK</h3>
                                    <span className="badge-league" id="tycoon-hud-league">
                                        BÖLGESEL AMATÖR LİG
                                    </span>
                                </div>
                                <button
                                    id="btn-collapse-tycoon-sidebar"
                                    className="btn-collapse-sidebar"
                                    onClick={() => window.toggleTycoonSidebar && window.toggleTycoonSidebar()}
                                    title="Menüyü Kapat ve Ekranı Genişlet"
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>

                        {/* İstatistik Küpürü (Kasa, Taraftar, OVR) */}
                        <div className="tycoon-sidebar-stats">
                            <div className="sidebar-stat-item money-stat">
                                <i className="fa-solid fa-coins text-gold"></i>
                                <div className="stat-detail">
                                    <span className="val" id="tycoon-hud-money">
                                        0 €
                                    </span>
                                    <span className="sub" id="tycoon-hud-persec">
                                        +0/s
                                    </span>
                                </div>
                            </div>
                            <div className="sidebar-stat-item fans-stat">
                                <i className="fa-solid fa-users text-blue"></i>
                                <div className="stat-detail">
                                    <span className="val" id="tycoon-hud-fans">
                                        0
                                    </span>
                                    <span className="sub">Taraftar</span>
                                </div>
                            </div>
                            <div className="sidebar-stat-item ovr-stat">
                                <i className="fa-solid fa-bolt text-green"></i>
                                <div className="stat-detail">
                                    <span className="val" id="tycoon-hud-ovr">
                                        60
                                    </span>
                                    <span className="sub">İlk 11 OVR</span>
                                </div>
                            </div>
                            <div
                                className="sidebar-stat-item condition-stat"
                                title="Kondisyon maç oynadıkça düşer; sağlık, havuz ve otel tesisleriyle toparlanır."
                            >
                                <i className="fa-solid fa-heart-pulse text-red"></i>
                                <div className="stat-detail">
                                    <span className="val" id="tycoon-hud-condition">
                                        %100
                                    </span>
                                    <span className="sub">Takım Kondisyonu</span>
                                </div>
                            </div>
                            <div
                                className="sidebar-stat-item form-stat"
                                title="Sonuçlara göre değişir ve maç gücünü etkiler."
                            >
                                <i className="fa-solid fa-chart-line text-blue"></i>
                                <div className="stat-detail">
                                    <span className="val" id="tycoon-hud-form">
                                        %50
                                    </span>
                                    <span className="sub">Kulüp Formu</span>
                                </div>
                            </div>
                        </div>

                        {/* Günün Manşeti: Lig Maçı Butonu */}
                        <button
                            className="newspaper-match-headline-btn"
                            onClick={() => window.openLeagueModal && window.openLeagueModal()}
                        >
                            <img src="/icon-assets/icon-trophy.png" alt="Kupa" className="headline-3d-icon" />
                            <div className="headline-btn-text">
                                <strong>LİG MAÇINA ÇIK</strong>
                                <small>Sıradaki Rakip Hazır • 3 Puan</small>
                            </div>
                            <i className="fa-solid fa-arrow-right headline-arrow"></i>
                        </button>

                        {/* Saha & Şehir Görünüm Seçici */}
                        <div className="newspaper-view-toggle">
                            <button
                                className="view-toggle-btn active"
                                onClick={() => window.switchTycoonView && window.switchTycoonView('pitch')}
                                id="btn-nav-pitch"
                            >
                                <img src="/icon-assets/icon-tactics.png" alt="Taktik" className="nav-mini-3d" />
                                <span>Taktik Sahası</span>
                            </button>
                            <button
                                className="view-toggle-btn"
                                onClick={() => window.switchTycoonView && window.switchTycoonView('city')}
                                id="btn-nav-city"
                            >
                                <img src="/icon-assets/icon-city.png" alt="Şehir" className="nav-mini-3d" />
                                <span>Kulüp Şehri</span>
                            </button>
                        </div>

                        {/* Kulüp Masası & Servisler */}
                        <div className="newspaper-sections-block">
                            <div className="newspaper-section-title">
                                <span>KULÜP MASASI &amp; TRANSFER</span>
                            </div>
                            <div className="newspaper-actions-grid">
                                <button
                                    className="newspaper-action-card"
                                    onClick={() => window.openPackStoreModal && window.openPackStoreModal()}
                                >
                                    <img src="/icon-assets/icon-pack.png" alt="Paket" className="card-3d-icon" />
                                    <div className="card-text">
                                        <strong>Paket Aç</strong>
                                        <small>Yıldız Kartlar</small>
                                    </div>
                                </button>
                                <button
                                    className="newspaper-action-card"
                                    onClick={() => window.openTransferMarketModal && window.openTransferMarketModal()}
                                >
                                    <img src="/icon-assets/icon-transfer.png" alt="Transfer" className="card-3d-icon" />
                                    <div className="card-text">
                                        <strong>Transfer Borsası</strong>
                                        <small>Scout &amp; Oyuncu Al</small>
                                    </div>
                                </button>
                                <button
                                    className="newspaper-action-card full"
                                    onClick={() => window.openSquadManagementModal && window.openSquadManagementModal()}
                                    id="btn-sidebar-squad"
                                >
                                    <img src="/icon-assets/icon-squad.png" alt="Kadro" className="card-3d-icon" />
                                    <div className="card-text">
                                        <strong>Kadro &amp; Kulüp Envanteri</strong>
                                        <small>İlk 11 ve Yedek Yönetimi</small>
                                    </div>
                                    <span id="squad-notification-badge" className="newspaper-badge-notify hidden">
                                        <i className="fa-solid fa-graduation-cap"></i> +1 GENÇ
                                    </span>
                                </button>
                            </div>

                            <div className="newspaper-section-title" style={{ marginTop: '6px' }}>
                                <span>TESİS GELİŞİMİ &amp; TİCARET</span>
                            </div>
                            <div className="newspaper-actions-grid">
                                <button
                                    className="newspaper-action-card"
                                    onClick={() => window.openTrainingModal && window.openTrainingModal()}
                                >
                                    <img src="/icon-assets/icon-training.png" alt="Antrenman" className="card-3d-icon" />
                                    <div className="card-text">
                                        <strong>Antrenman &amp; XP</strong>
                                        <small>OVR Geliştirme</small>
                                    </div>
                                </button>
                                <button
                                    className="newspaper-action-card"
                                    onClick={() => window.openQuestsModal && window.openQuestsModal()}
                                >
                                    <img src="/icon-assets/icon-quests.png" alt="Görevler" className="card-3d-icon" />
                                    <div className="card-text">
                                        <strong>Sezon Görevleri</strong>
                                        <small>Başkanlık Primleri</small>
                                    </div>
                                </button>
                                <button
                                    className="newspaper-action-card"
                                    onClick={() => window.openSponsorshipModal && window.openSponsorshipModal()}
                                >
                                    <img src="/icon-assets/icon-sponsor.png" alt="Sponsor" className="card-3d-icon" />
                                    <div className="card-text">
                                        <strong>Sponsorluk &amp; TV</strong>
                                        <small>Yayın İhalesi &amp; Gelir</small>
                                    </div>
                                </button>
                                <button
                                    className="newspaper-action-card"
                                    onClick={() => window.openMuseumModal && window.openMuseumModal()}
                                >
                                    <img src="/icon-assets/icon-trophy.png" alt="Müze" className="card-3d-icon" />
                                    <div className="card-text">
                                        <strong>Kupa Müzesi</strong>
                                        <small>Şeref Vitrini</small>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Dipnot & Alt Menü */}
                        <div className="newspaper-footer-links">
                            <button
                                id="btn-tycoon-reset-career"
                                className="newspaper-footer-btn danger"
                                onClick={() => window.openResetTycoonModal && window.openResetTycoonModal()}
                                title="Kariyeri ve Kadroyu Sıfırla"
                            >
                                <i className="fa-solid fa-rotate-left"></i> <span>Kariyeri Sıfırla</span>
                            </button>
                            <button id="btn-tycoon-back-menu" className="newspaper-footer-btn" title="Ana Menüye Dön">
                                <i className="fa-solid fa-arrow-left"></i> <span>Ana Menü</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

