import React from 'react';

export default function LeagueResultsScreen() {
    return (
        <section id="screen-league-results" className="screen">
            <div className="league-container max-w-[800px] mx-auto bg-white border-2 border-[#1a1a1a] p-[30px] shadow-[4px_4px_0px_#000000]">
                <div className="league-header-area text-center mb-[30px]">
                    <div className="league-trophy text-[4rem] mb-[10px]" id="league-trophy-icon">
                        <i className="fa-solid fa-trophy text-[#d4af37]"></i>
                    </div>
                    <h2 id="league-champion-title" className="font-header font-black text-[2rem]">
                        ŞAMPİYON
                    </h2>
                    <p className="desc text-[#666666] text-[1.1rem] font-bold" id="league-champion-name">
                        ---
                    </p>
                </div>

                <div className="league-section mb-[30px]" id="league-standings-section">
                    <h3 className="league-section-title font-header font-black border-b-[1.5px] border-[#1a1a1a] pb-[5px] mb-[15px]">
                        PUAN TABLOSU
                    </h3>
                    <div className="league-table-wrapper scrollbar w-full overflow-x-auto border-2 border-[#1a1a1a] bg-white mb-[25px]">
                        <table className="league-table w-full border-collapse min-w-[600px]" id="league-standings-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Oyuncu</th>
                                    <th>OVR</th>
                                    <th>O</th>
                                    <th>G</th>
                                    <th>B</th>
                                    <th>M</th>
                                    <th>AG</th>
                                    <th>YG</th>
                                    <th>AV</th>
                                    <th>P</th>
                                </tr>
                            </thead>
                            <tbody id="league-standings-body"></tbody>
                        </table>
                    </div>
                </div>

                <div className="league-section mb-[30px]" id="league-matches-section">
                    <h3 className="league-section-title font-header font-black border-b-[1.5px] border-[#1a1a1a] pb-[5px] mb-[15px]" id="league-matches-title">
                        MAÇ SONUÇLARI
                    </h3>
                    <div id="league-matches-list" className="league-matches-list scrollbar max-h-[250px] overflow-y-auto border-2 border-[#1a1a1a]"></div>
                </div>

                <div className="league-actions text-center flex flex-wrap justify-center gap-3">
                    <button id="btn-league-new-game" className="btn btn-white">
                        <i className="fa-solid fa-rotate-left"></i> Yeni Oyun
                    </button>
                    <button
                        id="btn-league-mp-poster"
                        type="button"
                        className="btn btn-black"
                        onClick={() => {
                            if (typeof window.generateMultiplayerPoster === 'function') {
                                window.generateMultiplayerPoster();
                            }
                        }}
                    >
                        <i className="fa-solid fa-camera"></i> Anı Posteri Oluştur
                    </button>
                    <button
                        id="btn-share-whatsapp-result"
                        className="btn btn-green border-2 border-[#1a1a1a]"
                        style={{ backgroundColor: '#25D366', color: 'white' }}
                    >
                        <i className="fa-brands fa-whatsapp"></i> WhatsApp&apos;ta Paylaş
                    </button>
                </div>
            </div>
        </section>
    );
}

