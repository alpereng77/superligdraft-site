import React from 'react';

export default function MultiplayerSetupScreen() {
    return (
        <section id="screen-multiplayer-setup" className="screen">
            <div className="mp-setup-container max-w-[800px] mx-auto bg-white border-2 border-[#1a1a1a] p-[30px] shadow-[4px_4px_0px_#000000]">
                <h2 id="mp-mode-title" className="font-header font-black text-[2rem] mb-[10px]">
                    ÇOK OYUNCULU MOD
                </h2>
                <p className="desc text-[#666666] text-[0.95rem]" id="mp-mode-desc">
                    Oyuna başlamak için kullanıcı adınızı girin.
                </p>

                <div className="mp-username-area my-[20px]">
                    <label htmlFor="mp-username-input" className="block font-bold mb-[8px]">
                        Kullanıcı Adınız
                    </label>
                    <input
                        type="text"
                        id="mp-username-input"
                        maxLength={16}
                        placeholder="Kullanıcı adını yaz..."
                        autoComplete="off"
                        className="w-full p-[12px] text-[1rem] font-body border-2 border-[#1a1a1a] outline-none focus:bg-[#fff2cc]"
                    />
                </div>

                <div className="mp-action-tabs flex flex-col gap-[20px] mt-[20px] pt-[20px] border-t-[1.5px] border-[#1a1a1a]">
                    <button
                        id="btn-create-room"
                        className="btn btn-black btn-large font-header font-extrabold uppercase tracking-[0.5px] px-[28px] py-[14px] text-[1rem] bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] hover:bg-white hover:text-[#1a1a1a] transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <i className="fa-solid fa-plus"></i> YENİ ODA OLUŞTUR
                    </button>
                    <div className="mp-or-divider text-center relative">
                        <span className="bg-white px-[10px] font-bold text-[#666666] relative z-[1]">veya</span>
                    </div>
                    <div className="mp-join-area flex gap-[10px]">
                        <input
                            type="text"
                            id="mp-room-code-input"
                            maxLength={6}
                            placeholder="ODA KODU"
                            autoComplete="off"
                            style={{ textTransform: 'uppercase' }}
                            className="w-full p-[12px] text-[1rem] font-body border-2 border-[#1a1a1a] outline-none focus:bg-[#fff2cc] uppercase"
                        />
                        <button
                            id="btn-join-room"
                            className="btn btn-white font-header font-extrabold uppercase text-[0.85rem] tracking-[0.5px] px-[18px] py-[10px] bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <i className="fa-solid fa-right-to-bracket"></i> KATIL
                        </button>
                    </div>
                </div>

                <p id="mp-error-msg" className="mp-error-msg hidden text-[#e05638] font-bold mt-[15px] text-center"></p>

                <button
                    id="btn-back-to-menu"
                    className="btn btn-white mt-[20px] font-header font-extrabold uppercase text-[0.85rem] tracking-[0.5px] px-[18px] py-[10px] bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer"
                    style={{ marginTop: '20px' }}
                >
                    <i className="fa-solid fa-arrow-left"></i> Ana Menüye Dön
                </button>
            </div>
        </section>
    );
}

