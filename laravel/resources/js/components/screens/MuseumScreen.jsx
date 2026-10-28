import React from 'react';

export default function MuseumScreen() {
    return (
        <section id="screen-museum" className="screen">
            <div className="museum-container bg-white border-4 border-[#1a1a1a] shadow-[8px_8px_0px_#1a1a1a] p-[30px] mb-[30px] font-body">
                <div className="museum-header text-center mb-[25px]">
                    <h2 className="retro-main-title font-bebas text-[3.5rem] font-black tracking-[2px] text-center text-[#1a1a1a] mt-[5px] mb-[10px] leading-[0.9]">
                        KUPA MÜZESİ &amp; İSTATİSTİKLER
                    </h2>
                    <div className="retro-headline-divider h-[6px] border-t-2 border-b-2 border-[#1a1a1a] mt-[10px] mb-[15px] mx-auto w-[60%]"></div>
                    <p className="desc text-[#666666] text-[0.95rem]">
                        Tarihi başarılarınızı ve efsanevi kadrolarınızı buradan inceleyin.
                    </p>
                </div>

                <div className="museum-actions-top flex justify-start mb-[25px]">
                    <button id="btn-museum-back" className="btn btn-white">
                        <i className="fa-solid fa-chevron-left"></i> Ana Menüye Dön
                    </button>
                </div>

                {/* Stats Cards Grid */}
                <div className="museum-stats-grid grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[15px] mb-[30px]">
                    <div className="museum-stat-card bg-white border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] p-[15px] flex items-center gap-[15px]">
                        <div className="stat-icon text-[2.2rem] text-[#3b9966] w-[50px] text-center">
                            <i className="fa-solid fa-trophy text-gold text-[#d4af37]"></i>
                        </div>
                        <div className="stat-content flex flex-col flex-1">
                            <span className="stat-val font-header text-[1.5rem] font-black text-[#3b9966]" id="museum-stat-trophies">
                                0
                            </span>
                            <span className="stat-lbl text-[0.8rem] text-[#666666] font-bold uppercase">
                                Kazanılan Kupa
                            </span>
                        </div>
                    </div>

                    <div className="museum-stat-card bg-white border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] p-[15px] flex items-center gap-[15px]">
                        <div className="stat-icon text-[2.2rem] text-[#3b9966] w-[50px] text-center">
                            <i className="fa-solid fa-gamepad"></i>
                        </div>
                        <div className="stat-content flex flex-col flex-1">
                            <span className="stat-val font-header text-[1.5rem] font-black text-[#3b9966]" id="museum-stat-played">
                                0
                            </span>
                            <span className="stat-lbl text-[0.8rem] text-[#666666] font-bold uppercase">
                                Oynanan Maç
                            </span>
                        </div>
                    </div>

                    <div className="museum-stat-card bg-white border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] p-[15px] flex items-center gap-[15px]">
                        <div className="stat-icon text-[2.2rem] text-[#3b9966] w-[50px] text-center">
                            <i className="fa-solid fa-square-poll-horizontal"></i>
                        </div>
                        <div className="stat-content flex flex-col flex-1">
                            <div className="stat-sub-grid flex gap-[12px] font-header text-[1.1rem]">
                                <div>
                                    <strong id="museum-stat-won">0</strong> G
                                </div>
                                <div>
                                    <strong id="museum-stat-drawn">0</strong> B
                                </div>
                                <div>
                                    <strong id="museum-stat-lost">0</strong> M
                                </div>
                            </div>
                            <span className="stat-lbl text-[0.8rem] text-[#666666] font-bold uppercase">
                                Sonuçlar
                            </span>
                        </div>
                    </div>

                    <div className="museum-stat-card bg-white border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] p-[15px] flex items-center gap-[15px]">
                        <div className="stat-icon text-[2.2rem] text-[#3b9966] w-[50px] text-center">
                            <i className="fa-solid fa-futbol"></i>
                        </div>
                        <div className="stat-content flex flex-col flex-1">
                            <span className="stat-val font-header text-[1.5rem] font-black text-[#3b9966]" id="museum-stat-goals">
                                0 / 0
                            </span>
                            <span className="stat-lbl text-[0.8rem] text-[#666666] font-bold uppercase">
                                Atılan / Yenilen
                            </span>
                        </div>
                    </div>

                    <div className="museum-stat-card bg-white border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] p-[15px] flex items-center gap-[15px]">
                        <div className="stat-icon text-[2.2rem] text-[#3b9966] w-[50px] text-center">
                            <i className="fa-solid fa-chart-line"></i>
                        </div>
                        <div className="stat-content flex flex-col flex-1">
                            <span className="stat-val font-header text-[1.5rem] font-black text-[#3b9966]" id="museum-stat-max-ovr">
                                --
                            </span>
                            <span className="stat-lbl text-[0.8rem] text-[#666666] font-bold uppercase">
                                En Yüksek OVR
                            </span>
                        </div>
                    </div>

                    <div className="museum-stat-card bg-white border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] p-[15px] flex items-center gap-[15px]">
                        <div className="stat-icon text-[2.2rem] text-[#3b9966] w-[50px] text-center">
                            <i className="fa-solid fa-crown"></i>
                        </div>
                        <div className="stat-content flex flex-col flex-1">
                            <span
                                className="stat-val font-header font-black text-[#3b9966]"
                                id="museum-stat-biggest-win"
                                style={{ fontSize: '1rem', lineHeight: 1.2 }}
                            >
                                --
                            </span>
                            <span className="stat-lbl text-[0.8rem] text-[#666666] font-bold uppercase">
                                En Farklı Galibiyet
                            </span>
                        </div>
                    </div>
                </div>

                {/* Achievements & Badges Registry */}
                <div className="museum-section-title mt-[30px] mb-[15px] relative">
                    <h3 className="font-header text-[1.3rem] font-black tracking-[1px]">
                        BAŞARIMLAR VE ROZETLER (<span id="unlocked-achievements-count">0</span> / 15)
                    </h3>
                    <div className="title-accent w-[60px] h-[4px] bg-[#e05638] mt-[5px]"></div>
                </div>
                <div className="achievements-grid grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[20px] mt-[15px] mb-[40px]" id="museum-achievements-grid">
                    {/* 15 custom badge cards rendered dynamically */}
                </div>

                {/* Trophy Shelf Display */}
                <div className="museum-section-title mt-[30px] mb-[15px] relative">
                    <h3 className="font-header text-[1.3rem] font-black tracking-[1px]">KUPA RAFI</h3>
                    <div className="title-accent w-[60px] h-[4px] bg-[#e05638] mt-[5px]"></div>
                </div>
                <div className="museum-trophy-shelf" id="museum-trophy-shelf">
                    {/* Trophies will be dynamically rendered here */}
                </div>

                {/* Legendary Squads Registry */}
                <div className="museum-section-title mt-[30px] mb-[15px] relative">
                    <h3 className="font-header text-[1.3rem] font-black tracking-[1px]">
                        KADRO DEFTERİ (EFSANE KADROLAR)
                    </h3>
                    <div className="title-accent w-[60px] h-[4px] bg-[#e05638] mt-[5px]"></div>
                </div>
                <div className="museum-squads-list grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[20px]" id="museum-squads-list">
                    {/* Squad cards will be rendered here */}
                </div>
            </div>
        </section>
    );
}

