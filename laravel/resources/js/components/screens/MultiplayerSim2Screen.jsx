import React from 'react';

export default function MultiplayerSim2Screen() {
    return (
        <section id="screen-mp-sim-2" className="screen">
            <div className="sim-container max-w-[700px] my-[30px] mx-auto">
                {/* Retro Scoreboard */}
                <div className="scoreboard-panel bg-white border-2 border-[#1a1a1a] p-[25px] flex justify-between items-center mb-[15px]">
                    <div className="team-box home flex items-center gap-[15px] w-[38%]">
                        <span
                            className="crest-letter w-[45px] h-[45px] bg-[#1a1a1a] text-white border-[1.5px] border-[#1a1a1a] flex items-center justify-center font-header font-black text-[1.3rem]"
                            id="mp-sim-2-home-logo"
                        >
                            H
                        </span>
                        <div className="meta flex flex-col">
                            <span className="name font-header font-black text-[1.1rem] tracking-[-0.5px]" id="mp-sim-2-home-name">
                                Takım 1
                            </span>
                            <span className="rating text-[0.75rem] font-bold text-[#666666]">
                                GÜÇ: <span id="mp-sim-2-home-ovr" className="font-black text-[#1a1a1a]">0</span>
                            </span>
                        </div>
                    </div>

                    <div className="score-box flex items-center gap-[10px] font-header text-[3rem] font-black">
                        <span id="mp-sim-2-home-score" className="score-val border-2 border-[#1a1a1a] bg-white px-[14px] py-[2px] min-w-[60px] text-center">
                            0
                        </span>
                        <span className="divider">-</span>
                        <span id="mp-sim-2-away-score" className="score-val border-2 border-[#1a1a1a] bg-white px-[14px] py-[2px] min-w-[60px] text-center">
                            0
                        </span>
                    </div>

                    <div className="team-box away flex flex-row-reverse text-right items-center gap-[15px] w-[38%]">
                        <div className="meta flex flex-col">
                            <span id="mp-sim-2-away-name" className="name font-header font-black text-[1.1rem] tracking-[-0.5px]">
                                Takım 2
                            </span>
                            <span className="rating text-[0.75rem] font-bold text-[#666666]">
                                GÜÇ: <span id="mp-sim-2-away-ovr" className="font-black text-[#1a1a1a]">0</span>
                            </span>
                        </div>
                        <span
                            className="crest-letter w-[45px] h-[45px] bg-white text-[#1a1a1a] border-[1.5px] border-[#1a1a1a] flex items-center justify-center font-header font-black text-[1.3rem]"
                            id="mp-sim-2-away-logo"
                        >
                            A
                        </span>
                    </div>
                </div>

                <div className="match-time-bar flex justify-center items-center relative font-header font-black text-[0.95rem] border-2 border-[#1a1a1a] bg-white py-[8px] mb-[25px] min-h-[42px]">
                    DAKİKA: <span id="mp-sim-2-clock" className="ml-1">00:00</span>
                </div>

                {/* Commentary Panel */}
                <div className="sim-content bg-white border-2 border-[#1a1a1a] p-[20px] relative">
                    <div className="commentary-header flex justify-between items-center border-b-[1.5px] border-[#1a1a1a] pb-[10px] mb-[12px]">
                        <h3 className="font-header font-black text-[0.95rem]">CANLI ANLATIM</h3>
                        <span className="live-dot text-[0.7rem] font-black bg-[#e05638] text-white px-[8px] py-[2px]">CANLI</span>
                    </div>

                    <div id="mp-sim-2-commentary" className="commentary-list scrollbar max-h-[260px] overflow-y-auto flex flex-col gap-[8px] pr-[4px]">
                        <div className="sim-event info">Maç başlamak üzere...</div>
                    </div>

                    <button
                        id="btn-mp-sim-2-skip"
                        className="btn btn-black btn-large w-100 hidden w-full mt-[20px]"
                        style={{ marginTop: '20px' }}
                    >
                        SONUÇLARA GİT <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

                <div id="mp-sim-2-squads-container" className="mp-sim-squads-wrapper mt-[30px] bg-white border-2 border-[#1a1a1a] p-[20px] shadow-[4px_4px_0px_#000000] text-left">
                    {/* Rosters will be rendered here dynamically */}
                </div>
            </div>
        </section>
    );
}

