import React from 'react';

const FORMATIONS = [
    { code: '4-4-2', tag: 'Klasik & Dengeli', active: true },
    { code: '4-3-3', tag: 'Hücumcu Kanatlar', active: false },
    { code: '3-5-2', tag: 'Orta Saha Üstünlüğü', active: false },
    { code: '4-2-3-1', tag: 'Modern Taktik', active: false },
    { code: '5-3-2', tag: 'Defansif Kontra', active: false },
];

export default function FormationSetupScreen() {
    return (
        <section id="screen-setup" className="screen">
            <div className="setup-container max-w-[600px] my-[50px] mx-auto bg-white border-2 border-[#1a1a1a] p-[40px] text-center">
                <h2 className="font-header font-black text-[2rem] mb-[10px]">FORMASYON SEÇİN</h2>
                <p className="desc text-[#666666] text-[0.95rem] mb-[30px]">
                    Kadro düzeninizi seçin ve tarihi Süper Lig takımlarından oyuncular çekmek için zarı atın!
                </p>

                <div className="formations-list flex flex-col gap-[12px] mb-[35px]">
                    {FORMATIONS.map((f) => (
                        <div
                            key={f.code}
                            className={`formation-item flex justify-between items-center bg-white border-2 border-[#1a1a1a] px-[20px] py-[16px] cursor-pointer transition-all duration-100 hover:bg-[#faf7f2] ${f.active ? 'active bg-[#fff2cc]' : ''}`}
                            data-formation={f.code}
                        >
                            <span className="name font-header text-[1.3rem] font-black">{f.code}</span>
                            <span className="tag text-[0.8rem] font-bold text-[#666666]">{f.tag}</span>
                        </div>
                    ))}
                </div>

                <button
                    id="btn-start-draft"
                    className="btn btn-black btn-large font-header font-extrabold uppercase text-[1rem] tracking-[0.5px] px-[28px] py-[14px] bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] hover:bg-white hover:text-[#1a1a1a] transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                    DRAFT&apos;I BAŞLAT <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </section>
    );
}

