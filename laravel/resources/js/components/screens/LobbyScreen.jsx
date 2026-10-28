import React from 'react';

export default function LobbyScreen() {
    return (
        <section id="screen-lobby" className="screen">
            <div className="lobby-container max-w-[800px] mx-auto bg-white border-2 border-[#1a1a1a] p-[30px] shadow-[4px_4px_0px_#000000]">
                <h2 className="font-header font-black text-[2rem] mb-[10px]">LOBİ</h2>
                <p className="desc text-[#666666] text-[0.95rem]">Tüm oyuncuların katılmasını bekliyoruz...</p>

                <div className="lobby-code-display bg-[#fff2cc] border-2 border-[#1a1a1a] p-[15px] flex items-center justify-center gap-[15px] my-[20px] flex-wrap">
                    <span className="lobby-code-label font-bold">Oda Kodu:</span>
                    <span id="lobby-room-code" className="lobby-code-value font-mono text-[1.5rem] font-black tracking-[5px]">
                        ------
                    </span>
                    <button
                        id="btn-copy-code"
                        className="btn btn-white btn-small font-header font-extrabold uppercase text-[0.75rem] px-[12px] py-[6px] bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white inline-flex items-center gap-2 cursor-pointer"
                    >
                        <i className="fa-solid fa-copy"></i> Kopyala
                    </button>
                    <button
                        id="btn-share-whatsapp-lobby"
                        className="btn btn-green btn-small font-header font-extrabold uppercase text-[0.75rem] px-[12px] py-[6px] border-2 border-[#1a1a1a] inline-flex items-center gap-2 cursor-pointer"
                        style={{ marginLeft: '8px', backgroundColor: '#25D366', color: 'white' }}
                    >
                        <i className="fa-brands fa-whatsapp"></i> WhatsApp ile Davet Et
                    </button>
                </div>

                <div className="lobby-players-grid grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[15px] mb-[20px]" id="lobby-players-grid">
                    {/* Oyuncu kartları JS ile doldurulacak */}
                </div>

                <div className="lobby-status-bar flex items-center justify-center gap-[10px] font-bold text-[#3b9966]">
                    <span id="lobby-status-text">Oyuncular bekleniyor...</span>
                    <div className="lobby-spinner">
                        <div className="spinner-dot w-[12px] h-[12px] bg-[#3b9966] rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

