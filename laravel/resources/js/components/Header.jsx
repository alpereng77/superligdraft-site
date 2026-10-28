import React from "react";
import { Link } from "react-router-dom";

export default function Header({ isLegalPage = false, onNavigateHome }) {
    return (
        <header className="app-header flex justify-between items-center border-b-2 border-[#1a1a1a] pb-[15px] mb-[25px]">
            <div className="header-title flex items-center">
                <Link
                    to="/"
                    onClick={() => {
                        if (onNavigateHome) {
                            onNavigateHome();
                        }
                    }}
                    className="inline-flex items-center focus:outline-none"
                    title="Süper Lig Nostalji Draft"
                >
                    <img
                        src="/draft.png"
                        alt="Süper Lig Nostalji Draft"
                        className="h-[46px] md:h-[64px] w-auto object-contain select-none"
                    />
                </Link>
            </div>

            {isLegalPage ? (
                <div className="header-meta flex items-center">
                    <Link
                        to="/"
                        onClick={() => {
                            if (onNavigateHome) {
                                onNavigateHome();
                            }
                        }}
                        className="btn btn-white btn-small font-header font-extrabold uppercase text-[0.75rem] tracking-[0.5px] px-[12px] py-[6px] bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-house"></i> Ana Sayfa
                    </Link>
                </div>
            ) : (
                <div className="header-meta flex items-center">
                    <span
                        id="mode-tag"
                        className="mode-tag text-[0.8rem] font-extrabold border-[1.5px] border-[#1a1a1a] px-[10px] py-[4px] bg-white text-[#1a1a1a]"
                    >
                        <i className="fa-solid fa-gamepad"></i> ANA MENÜ
                    </span>
                    <button
                        id="btn-toggle-audio"
                        className="btn-mute-toggle bg-white border-[1.5px] border-[#1a1a1a] px-[8px] py-[4px] text-[0.8rem] cursor-pointer inline-flex items-center justify-center transition-all duration-150 text-[#1a1a1a] ml-2 hover:bg-[#fff2cc] hover:scale-105"
                        title="Sesi Kapat/Aç"
                    >
                        <i className="fa-solid fa-volume-high"></i>
                    </button>
                </div>
            )}
        </header>
    );
}
