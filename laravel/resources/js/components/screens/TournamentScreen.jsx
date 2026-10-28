import React from 'react';

export default function TournamentScreen() {
    return (
        <section id="screen-tournament" className="screen">
            <div className="tournament-container max-w-[1200px] mx-auto">
                <div className="tournament-header text-center mb-[25px]">
                    <h2 className="font-header font-black text-[1.8rem] mb-[6px]">
                        SÜPER LİG NOSTALJİ DRAFT TURNUVASI
                    </h2>
                    <p className="desc text-[#666666] text-[0.9rem]">
                        16 takımlı eliminasyon turnuvası. Kupayı kaldırmak için 4 maçı da kazanmalısın!
                    </p>
                </div>

                <div className="bracket-wrapper scrollbar flex justify-between gap-[24px] p-[24px] bg-white border-2 border-[#1a1a1a] overflow-x-auto min-h-[520px] mb-[25px] shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
                    <div className="bracket-column flex flex-col w-[200px] shrink-0" id="col-round-16">
                        <h3 className="font-header text-[0.75rem] font-black text-center border-b-[1.5px] border-[#1a1a1a] pb-[8px] mb-[20px] uppercase tracking-[1px] text-[#666666]">
                            SON 16
                        </h3>
                        <div className="matchups flex flex-col justify-around flex-grow gap-[15px]" id="matches-round-16"></div>
                    </div>
                    <div className="bracket-column flex flex-col w-[200px] shrink-0" id="col-round-8">
                        <h3 className="font-header text-[0.75rem] font-black text-center border-b-[1.5px] border-[#1a1a1a] pb-[8px] mb-[20px] uppercase tracking-[1px] text-[#666666]">
                            ÇEYREK FİNAL
                        </h3>
                        <div className="matchups flex flex-col justify-around flex-grow gap-[15px]" id="matches-round-8"></div>
                    </div>
                    <div className="bracket-column flex flex-col w-[200px] shrink-0" id="col-round-4">
                        <h3 className="font-header text-[0.75rem] font-black text-center border-b-[1.5px] border-[#1a1a1a] pb-[8px] mb-[20px] uppercase tracking-[1px] text-[#666666]">
                            YARI FİNAL
                        </h3>
                        <div className="matchups flex flex-col justify-around flex-grow gap-[15px]" id="matches-round-4"></div>
                    </div>
                    <div className="bracket-column flex flex-col w-[200px] shrink-0" id="col-round-2">
                        <h3 className="font-header text-[0.75rem] font-black text-center border-b-[1.5px] border-[#1a1a1a] pb-[8px] mb-[20px] uppercase tracking-[1px] text-[#666666]">
                            FİNAL
                        </h3>
                        <div className="matchups flex flex-col justify-around flex-grow gap-[15px]" id="matches-round-2"></div>
                    </div>
                    <div className="bracket-column flex flex-col w-[200px] shrink-0" id="col-champion">
                        <h3 className="font-header text-[0.75rem] font-black text-center border-b-[1.5px] border-[#1a1a1a] pb-[8px] mb-[20px] uppercase tracking-[1px] text-[#666666]">
                            ŞAMPİYON
                        </h3>
                        <div className="champion-box-container flex items-center justify-center flex-grow" id="champion-container">
                            <div className="champion-box-placeholder flex flex-col items-center text-[#b0ab9f] text-[0.75rem] font-bold">
                                <i className="fa-solid fa-trophy text-[2.2rem] mb-[8px] opacity-30"></i>
                                <span>Bekleniyor...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tournament-actions text-center mt-[15px]">
                    <button id="btn-play-tournament-match" className="btn btn-black btn-large">
                        SIRADAKİ MAÇINI OYNA <i className="fa-solid fa-play"></i>
                    </button>
                </div>
            </div>
        </section>
    );
}

