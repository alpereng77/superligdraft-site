import React from 'react';

export default function SimulationScreen() {
    return (
        <section id="screen-simulation" className="screen">
            <div className="sim-container max-w-[700px] my-[30px] mx-auto">
                {/* Retro Scoreboard */}
                <div className="scoreboard-panel bg-white border-2 border-[#1a1a1a] p-[25px] flex justify-between items-center mb-[15px]">
                    <div className="team-box home flex items-center gap-[15px] w-[38%]">
                        <span className="crest-letter w-[45px] h-[45px] bg-[#1a1a1a] text-white border-[1.5px] border-[#1a1a1a] flex items-center justify-center font-header font-black text-[1.3rem]">
                            S
                        </span>
                        <div className="meta flex flex-col">
                            <span className="name font-header font-black text-[1.1rem] tracking-[-0.5px]">
                                SENİN TAKIMIN
                            </span>
                            <span className="rating text-[0.75rem] font-bold text-[#666666]">
                                GÜÇ: <span id="home-rating" className="font-black text-[#1a1a1a]">75</span>
                            </span>
                        </div>
                    </div>

                    <div className="score-box flex items-center gap-[10px] font-header text-[3rem] font-black">
                        <span id="score-home" className="score-val border-2 border-[#1a1a1a] bg-white px-[14px] py-[2px] min-w-[60px] text-center">
                            0
                        </span>
                        <span className="divider">-</span>
                        <span id="score-away" className="score-val border-2 border-[#1a1a1a] bg-white px-[14px] py-[2px] min-w-[60px] text-center">
                            0
                        </span>
                    </div>

                    <div className="team-box away flex flex-row-reverse text-right items-center gap-[15px] w-[38%]">
                        <div className="meta flex flex-col">
                            <span id="opponent-team-name" className="name font-header font-black text-[1.1rem] tracking-[-0.5px]">
                                RAKİP TAKIM
                            </span>
                            <span className="rating text-[0.75rem] font-bold text-[#666666]">
                                GÜÇ: <span id="away-rating" className="font-black text-[#1a1a1a]">75</span>
                            </span>
                        </div>
                        <span className="crest-letter w-[45px] h-[45px] bg-white text-[#1a1a1a] border-[1.5px] border-[#1a1a1a] flex items-center justify-center font-header font-black text-[1.3rem]">
                            R
                        </span>
                    </div>
                </div>

                <div className="match-time-bar flex justify-center items-center relative font-header font-black text-[0.95rem] border-2 border-[#1a1a1a] bg-white py-[8px] mb-[25px] min-h-[42px]">
                    DAKİKA: <span id="match-minute" className="ml-1">0&apos;</span>
                </div>

                {/* Commentary Panel */}
                <div className="sim-content bg-white border-2 border-[#1a1a1a] p-[20px] relative">
                    <div className="commentary-header flex justify-between items-center border-b-[1.5px] border-[#1a1a1a] pb-[10px] mb-[12px]">
                        <h3 className="font-header font-black text-[0.95rem]">CANLI ANLATIM</h3>
                        <span className="live-dot text-[0.7rem] font-black bg-[#e05638] text-white px-[8px] py-[2px]">CANLI</span>
                    </div>

                    <div id="commentary-list" className="commentary-list scrollbar max-h-[260px] overflow-y-auto flex flex-col gap-[8px] pr-[4px]">
                        {/* Events go here */}
                    </div>

                    {/* Simulation Results overlay card */}
                    <div
                        id="match-result-summary"
                        className="match-result-overlay hidden absolute top-0 left-0 w-full h-full bg-white/[0.98] border-2 border-[#1a1a1a] flex flex-col items-center justify-center p-[30px] text-center z-50"
                    >
                        <h2 id="result-status" className="font-header font-black text-[2rem] mb-[8px]">
                            MAÇ BİTTİ!
                        </h2>
                        <p id="result-summary-text" className="font-bold text-[1.1rem] mb-[20px]">
                            Heyecan dolu karşılaşma sona erdi.
                        </p>

                        <div className="scorers-split grid grid-cols-2 gap-[20px] w-full max-w-[480px] text-left mb-[30px]">
                            <div className="scorers-col">
                                <h4 className="font-header text-[0.8rem] font-black border-b-[1.5px] border-[#1a1a1a] pb-[4px] mb-[8px]">
                                    Kendi Takımın:
                                </h4>
                                <ul id="home-scorers-list" className="list-none text-[0.8rem]"></ul>
                            </div>
                            <div className="scorers-col">
                                <h4 className="font-header text-[0.8rem] font-black border-b-[1.5px] border-[#1a1a1a] pb-[4px] mb-[8px]">
                                    Rakip Takım:
                                </h4>
                                <ul id="away-scorers-list" className="list-none text-[0.8rem]"></ul>
                            </div>
                        </div>

                        <div className="overlay-buttons flex gap-[12px] flex-wrap justify-center">
                            <button id="btn-play-again-same" className="btn btn-white">
                                Tekrar Oyna <i className="fa-solid fa-rotate"></i>
                            </button>
                            <button id="btn-new-draft" className="btn btn-black">
                                Yeni Kadro Kur (Draft) <i className="fa-solid fa-repeat"></i>
                            </button>
                            <button id="btn-tournament-action" className="btn btn-black hidden">
                                Turnuva Ağacına Dön <i className="fa-solid fa-sitemap"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

