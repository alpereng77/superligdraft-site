import React from 'react';

export default function DraftScreen() {
    return (
        <section id="screen-draft" className="screen">
            <div className="draft-grid grid grid-cols-1 lg:grid-cols-[310px_1fr_310px] gap-[20px] items-start">
                {/* COLUMN 1: Rolled Team, Dice & Player List */}
                <div className="draft-col left-col">
                    <div className="panel-section bg-white border-2 border-[#1a1a1a] p-[18px] mb-[20px]">
                        <span className="section-label block font-header text-[0.75rem] font-black text-[#666666] tracking-[1px] mb-[12px] border-b border-black/10 pb-[6px]">
                            ÇEKİLEN TAKIM
                        </span>
                        <div className="team-banner bg-[#f5efe6] border-[1.5px] border-[#1a1a1a] p-[15px] mb-[15px] text-center">
                            <h3 id="result-team-name" className="font-header text-[1.3rem] font-black mb-[4px]">
                                Rastgele Takım
                            </h3>
                            <span id="result-season" className="season-text text-[0.8rem] font-bold text-[#e05638]">
                                2000-2001 Sezonu
                            </span>
                        </div>

                        <div className="reroll-area flex flex-col gap-[8px]">
                            <span className="desc-text text-[0.75rem] font-bold text-[#666666]">
                                Kadro veya yılı beğenmediniz mi? Tekrar çekin:
                            </span>
                            <button
                                id="btn-roll-dice"
                                className="btn btn-white btn-roll w-full font-header font-extrabold uppercase text-[0.85rem] tracking-[0.5px] px-[18px] py-[10px] bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <i className="fa-solid fa-rotate"></i> YENİ TAKIM ÇEK
                            </button>
                        </div>
                    </div>

                    {/* Dice Animation Container */}
                    <div className="dice-animation-wrapper h-0 overflow-hidden transition-[height] duration-300">
                        <div id="3d-dice" className="mini-dice">
                            <div className="face front">2004</div>
                            <div className="face back">2008</div>
                            <div className="face right">2012</div>
                            <div className="face left">2016</div>
                            <div className="face top">2020</div>
                            <div className="face bottom">2024</div>
                        </div>
                    </div>

                    <div
                        id="team-result-card"
                        className="panel-section player-select-section hidden bg-white border-2 border-[#1a1a1a] p-[18px] mb-[20px] flex flex-col h-[440px]"
                    >
                        <span className="section-label block font-header text-[0.75rem] font-black text-[#666666] tracking-[1px] mb-[12px] border-b border-black/10 pb-[6px]">
                            OYUNCU SEÇİN
                        </span>

                        <div className="position-filters flex border-[1.5px] border-[#1a1a1a] mb-[12px]">
                            <button className="tab-btn active flex-grow bg-white border-r border-[#1a1a1a] text-[#1a1a1a] py-[6px] text-[0.7rem] font-extrabold cursor-pointer" data-pos="ALL">
                                TÜMÜ
                            </button>
                            <button className="tab-btn flex-grow bg-white border-r border-[#1a1a1a] text-[#1a1a1a] py-[6px] text-[0.7rem] font-extrabold cursor-pointer" data-pos="GK">
                                KL
                            </button>
                            <button className="tab-btn flex-grow bg-white border-r border-[#1a1a1a] text-[#1a1a1a] py-[6px] text-[0.7rem] font-extrabold cursor-pointer" data-pos="DF">
                                DF
                            </button>
                            <button className="tab-btn flex-grow bg-white border-r border-[#1a1a1a] text-[#1a1a1a] py-[6px] text-[0.7rem] font-extrabold cursor-pointer" data-pos="MF">
                                OS
                            </button>
                            <button className="tab-btn flex-grow bg-white text-[#1a1a1a] py-[6px] text-[0.7rem] font-extrabold cursor-pointer" data-pos="FW">
                                FV
                            </button>
                        </div>

                        <div className="sort-selector-container flex justify-between items-center mb-[12px] text-[0.75rem] font-extrabold">
                            <span className="sort-label text-[#666666]">
                                <i className="fa-solid fa-arrow-down-wide-short"></i> Sırala:
                            </span>
                            <select
                                id="player-sort-select"
                                className="player-sort-select border-[1.5px] border-[#1a1a1a] bg-white font-body text-[0.75rem] font-bold px-[8px] py-[4px] outline-none cursor-pointer focus:bg-[#fff2cc]"
                            >
                                <option value="rating-desc">Rating (Yüksek → Düşük)</option>
                                <option value="rating-asc">Rating (Düşük → Yüksek)</option>
                                <option value="name-asc">İsim (A → Z)</option>
                            </select>
                        </div>

                        <div id="scraped-players-list" className="scraped-players-list scrollbar flex-grow overflow-y-auto flex flex-col gap-[8px] pr-[4px]">
                            {/* Rendered dynamically as flat rows */}
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Striped Football Pitch */}
                <div className="draft-col center-col">
                    <div className="pitch-outer">
                        <div className="pitch">
                            <div className="pitch-lines">
                                <div className="penalty-area top"></div>
                                <div className="penalty-area bottom"></div>
                                <div className="center-circle"></div>
                                <div className="halfway-line"></div>
                            </div>
                            {/* Dynamic Player Slots */}
                            <div id="pitch-slots" className="pitch-slots"></div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: Box Score & Team Stats */}
                <div className="draft-col right-col">
                    <div className="panel-section bg-white border-2 border-[#1a1a1a] p-[18px] mb-[20px]">
                        <div className="box-score-header flex justify-between items-center border-b-2 border-[#1a1a1a] pb-[10px] mb-[15px]">
                            <h3 className="font-header text-[1.15rem] font-black tracking-[-0.5px]">BOX SCORE</h3>
                            <span id="filled-slots-count-badge" className="count-badge text-[0.85rem] font-black bg-[#1a1a1a] text-white px-[8px] py-[3px]">
                                0 / 11
                            </span>
                        </div>

                        {/* Team stats bars */}
                        <div className="team-stats-bars flex flex-col gap-[12px]">
                            <div className="stat-bar-group flex flex-col gap-[4px]">
                                <div className="label-row flex justify-between text-[0.7rem] font-extrabold tracking-[0.5px] text-[#666666]">
                                    <span>TAKIM GÜCÜ (GENEL)</span>
                                    <span id="team-ovr-val" className="text-[#1a1a1a] font-black">75</span>
                                </div>
                                <div className="stat-bar-bg h-[8px] bg-[#e0dcd3] border border-[#1a1a1a]">
                                    <div id="bar-team-ovr" className="stat-bar-fill h-full bg-[#3b9966] transition-[width] duration-300" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <div className="stat-bar-group flex flex-col gap-[4px]">
                                <div className="label-row flex justify-between text-[0.7rem] font-extrabold tracking-[0.5px] text-[#666666]">
                                    <span>SALDIRI (ATAQUE)</span>
                                    <span id="team-atk-val" className="text-[#1a1a1a] font-black">75</span>
                                </div>
                                <div className="stat-bar-bg h-[8px] bg-[#e0dcd3] border border-[#1a1a1a]">
                                    <div id="bar-team-atk" className="stat-bar-fill fill-red h-full bg-[#e05638] transition-[width] duration-300" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <div className="stat-bar-group flex flex-col gap-[4px]">
                                <div className="label-row flex justify-between text-[0.7rem] font-extrabold tracking-[0.5px] text-[#666666]">
                                    <span>SAVUNMA (DEFESA)</span>
                                    <span id="team-def-val" className="text-[#1a1a1a] font-black">75</span>
                                </div>
                                <div className="stat-bar-bg h-[8px] bg-[#e0dcd3] border border-[#1a1a1a]">
                                    <div id="bar-team-def" className="stat-bar-fill fill-black h-full bg-[#1a1a1a] transition-[width] duration-300" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel-section box-score-list-section bg-white border-2 border-[#1a1a1a] p-[18px] mb-[20px] h-[330px] flex flex-col">
                        <span className="section-label block font-header text-[0.75rem] font-black text-[#666666] tracking-[1px] mb-[12px] border-b border-black/10 pb-[6px]">
                            SEÇİLEN KADRO LISTESİ
                        </span>
                        <div id="box-score-rows" className="box-score-rows flex-grow overflow-y-auto flex flex-col pr-[2px]">
                            {/* 11 rows rendered dynamically */}
                        </div>
                    </div>

                    {/* Next Action Button */}
                    <button
                        id="btn-to-simulation"
                        className="btn btn-black btn-large w-100 hidden w-full font-header font-extrabold uppercase text-[1rem] tracking-[0.5px] px-[28px] py-[14px] bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] hover:bg-white hover:text-[#1a1a1a] transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                        TURNUVAYI BAŞLAT <i className="fa-solid fa-sitemap"></i>
                    </button>
                </div>
            </div>
        </section>
    );
}

