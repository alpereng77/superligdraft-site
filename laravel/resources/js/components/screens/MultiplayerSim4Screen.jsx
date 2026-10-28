import React from 'react';

export default function MultiplayerSim4Screen() {
    return (
        <section id="screen-mp-sim-4" className="screen">
            <div className="sim-container max-w-[850px] my-[30px] mx-auto" style={{ maxWidth: '850px' }}>
                <div
                    className="scoreboard-panel bg-white border-2 border-[#1a1a1a] flex flex-col items-stretch gap-[15px] px-[25px] py-[20px] mb-[15px]"
                    style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px', padding: '20px 25px' }}
                >
                    <div className="flex justify-center items-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <h2
                            className="font-header font-black m-0 text-[1.5rem] tracking-[-0.5px] text-center"
                            style={{ fontFamily: 'var(--font-header)', fontWeight: 900, margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px', textAlign: 'center' }}
                        >
                            CANLI YAYIN: LİG SİMÜLASYONU
                        </h2>
                    </div>
                </div>

                <div className="match-time-bar flex justify-center items-center relative font-header font-black text-[0.95rem] border-2 border-[#1a1a1a] bg-white py-[8px] mb-[25px] min-h-[42px]">
                    DAKİKA: <span id="mp-sim-4-clock" className="ml-1">00:00</span>
                </div>

                <div
                    className="mp-sim-4-body grid grid-cols-1 md:grid-cols-[1fr_1.25fr] gap-[20px] mb-[25px]"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '20px', marginBottom: '25px' }}
                >
                    {/* Left Panel: Live Table */}
                    <div className="sim-content bg-white border-2 border-[#1a1a1a] p-[15px] relative" style={{ padding: '15px' }}>
                        <div className="commentary-header flex justify-between items-center border-b-[1.5px] border-[#1a1a1a] pb-[10px] mb-[12px]">
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>CANLI PUAN DURUMU</h3>
                        </div>
                        <div className="live-table-wrapper mt-[15px] overflow-x-auto border-2 border-[#1a1a1a] bg-white" style={{ marginTop: '15px', overflowX: 'auto' }}>
                            <table
                                className="league-table live-table w-full border-collapse text-[0.8rem]"
                                style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}
                            >
                                <thead>
                                    <tr>
                                        <th>Sıra</th>
                                        <th>Takım</th>
                                        <th>P</th>
                                        <th>Av</th>
                                    </tr>
                                </thead>
                                <tbody id="mp-sim-4-standings">
                                    {/* JS ile dolacak */}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Panel: Live Matches Grid */}
                    <div className="sim-content bg-white border-2 border-[#1a1a1a] p-[15px] relative" style={{ padding: '15px' }}>
                        <div className="commentary-header flex justify-between items-center border-b-[1.5px] border-[#1a1a1a] pb-[10px] mb-[12px]">
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>CANLI MAÇ SKORLARI</h3>
                        </div>
                        <div
                            className="live-matches-grid flex flex-col gap-[8px] mt-[15px]"
                            id="mp-sim-4-matches"
                            style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}
                        >
                            {/* JS ile dolacak */}
                        </div>
                    </div>
                </div>

                {/* Bottom Panel: Global Commentary */}
                <div className="sim-content bg-white border-2 border-[#1a1a1a] p-[20px] relative">
                    <div className="commentary-header flex justify-between items-center border-b-[1.5px] border-[#1a1a1a] pb-[10px] mb-[12px]">
                        <h3 className="font-header font-black text-[0.95rem]">GLOBAL LİG YORUMLARI</h3>
                        <span className="live-dot text-[0.7rem] font-black bg-[#e05638] text-white px-[8px] py-[2px]">CANLI</span>
                    </div>
                    <div
                        id="mp-sim-4-commentary"
                        className="commentary-list scrollbar overflow-y-auto flex flex-col gap-[8px] pr-[4px]"
                        style={{ height: '180px' }}
                    >
                        <div className="sim-event info">Tüm stadyumlarda ilk düdük çaldı! Maçlar başlıyor...</div>
                    </div>

                    <button
                        id="btn-mp-sim-4-skip"
                        className="btn btn-black btn-large w-100 hidden w-full mt-[20px]"
                        style={{ marginTop: '20px' }}
                    >
                        SONUÇLARA GİT <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

                <div id="mp-sim-4-squads-container" className="mp-sim-squads-wrapper mt-[30px] bg-white border-2 border-[#1a1a1a] p-[20px] shadow-[4px_4px_0px_#000000] text-left">
                    {/* Rosters will be rendered here dynamically */}
                </div>
            </div>
        </section>
    );
}

