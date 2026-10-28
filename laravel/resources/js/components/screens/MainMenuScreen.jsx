import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function MainMenuScreen() {
    useEffect(() => {
        try {
            if (window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (_) {}
    }, []);

    return (
        <section id="screen-main-menu" className="screen active">
            <div className="menu-container retro-menu-layout max-w-[800px] mx-auto bg-white border-4 border-[#1a1a1a] shadow-[8px_8px_0px_#1a1a1a] px-[30px] py-[35px] min-h-[calc(100vh-120px)] flex flex-col justify-between relative overflow-hidden">
                {/* Retro Football Badge/Stamp */}
                <div className="retro-badge-stamp absolute top-[15px] right-[-15px] bg-[#e05638] text-white px-[30px] py-[8px] font-bebas text-[1.1rem] rotate-[15deg] border-2 border-[#1a1a1a] tracking-[1.5px] shadow-[2px_2px_0px_rgba(0,0,0,0.15)] z-[5] pointer-events-none">
                    <span className="stamp-inner uppercase">2000&apos;ler</span>
                </div>

                <div className="menu-logo-area text-center mb-[30px]">
                    <h2 className="retro-main-title font-bebas text-[3.5rem] font-black tracking-[2px] text-center text-[#1a1a1a] mt-[5px] mb-[10px] leading-[0.9]">
                        SÜPER LİG DRAFT
                    </h2>
                    <div className="retro-headline-divider h-[6px] border-t-2 border-b-2 border-[#1a1a1a] mt-[10px] mb-[15px] mx-auto w-[60%]"></div>
                    <p className="desc typewriter-text font-mono text-[0.75rem] font-bold text-[#666666] tracking-[0.5px] text-center max-w-[85%] mx-auto mb-[10px]">
                        TÜRK FUTBOL TARİHİNİN EFSANE KADROLARINI YENİDEN KUR VE
                        YARIŞTIR!
                    </p>
                </div>

                <div className="menu-modes flex flex-col gap-[15px]">
                    <button
                        id="btn-mode-classic"
                        className="btn-mode-card classic-card relative flex items-center text-left bg-white border-[3px] border-[#1a1a1a] border-l-[10px] border-l-[#3b9966] shadow-[4px_4px_0px_#1a1a1a] px-[20px] py-[22px] mb-[8px] cursor-pointer transition-all duration-150 hover:bg-[#e8f5e9] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#1a1a1a] group"
                    >
                        <div className="mode-card-badge single-badge absolute -top-[10px] left-[20px] font-bebas text-[0.75rem] font-black px-[10px] py-[1px] text-white border-2 border-[#1a1a1a] tracking-[1px] bg-[#3b9966]">
                            TEK OYUNCULU
                        </div>
                        <div className="mode-card-icon text-[1.8rem] text-[#3b9966] w-[60px] text-center mr-[5px] transition-transform duration-200 group-hover:scale-115 group-hover:-rotate-6">
                            <i className="fa-solid fa-gamepad"></i>
                        </div>
                        <div className="mode-card-info flex-grow pl-[15px]">
                            <h3 className="font-bebas text-[1.6rem] font-black tracking-[1px] mb-[2px] text-[#1a1a1a]">
                                KLASİK MOD (TURNUVA)
                            </h3>
                            <p className="font-body text-[0.85rem] text-[#333]">
                                Tek başına oyna. Kadronu kur, efsanevi
                                rakiplerine karşı kupayı kaldır!
                            </p>
                        </div>
                        <i className="fa-solid fa-chevron-right mode-card-arrow text-[1.5rem] text-[#666666]"></i>
                    </button>

                    <button
                        id="btn-mode-multi-2"
                        className="btn-mode-card multi-2-card relative flex items-center text-left bg-white border-[3px] border-[#1a1a1a] border-l-[10px] border-l-[#e05638] shadow-[4px_4px_0px_#1a1a1a] px-[20px] py-[22px] mb-[8px] cursor-pointer transition-all duration-150 hover:bg-[#ffebee] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#1a1a1a] group"
                    >
                        <div className="mode-card-badge pv1-badge absolute -top-[10px] left-[20px] font-bebas text-[0.75rem] font-black px-[10px] py-[1px] text-white border-2 border-[#1a1a1a] tracking-[1px] bg-[#e05638]">
                            1v1 DERBİ
                        </div>
                        <div className="mode-card-icon text-[1.8rem] text-[#3b9966] w-[60px] text-center mr-[5px] transition-transform duration-200 group-hover:scale-115 group-hover:-rotate-6">
                            <i className="fa-solid fa-user-group"></i>
                        </div>
                        <div className="mode-card-info flex-grow pl-[15px]">
                            <h3 className="font-bebas text-[1.6rem] font-black tracking-[1px] mb-[2px] text-[#1a1a1a]">
                                2 OYUNCULU DERBİ
                            </h3>
                            <p className="font-body text-[0.85rem] text-[#333]">
                                Arkadaşını davet et! Karşılıklı kadro kurun,
                                teke tek derbi heyecanını yaşayın.
                            </p>
                        </div>
                        <i className="fa-solid fa-chevron-right mode-card-arrow text-[1.5rem] text-[#666666]"></i>
                    </button>
                    <button
                        id="btn-open-museum"
                        className="btn-mode-card museum-card relative flex items-center text-left bg-white border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] px-[20px] py-[22px] mb-[8px] cursor-pointer transition-all duration-150 hover:bg-[#fff2cc] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#1a1a1a] group"
                    >
                        <div
                            className="mode-card-badge single-badge absolute -top-[10px] left-[20px] font-bebas text-[0.75rem] font-black px-[10px] py-[1px] text-white border-2 border-[#1a1a1a] tracking-[1px]"
                            style={{ backgroundColor: "#d4af37" }}
                        >
                            <i className="fa-solid fa-trophy"></i> MÜZE
                        </div>
                        <div className="mode-card-icon text-[1.8rem] text-[#3b9966] w-[60px] text-center mr-[5px] transition-transform duration-200 group-hover:scale-115 group-hover:-rotate-6">
                            <i className="fa-solid fa-building-columns"></i>
                        </div>
                        <div className="mode-card-info flex-grow pl-[15px]">
                            <h3 className="font-bebas text-[1.6rem] font-black tracking-[1px] mb-[2px] text-[#1a1a1a]">
                                KUPA MÜZESİ &amp; İSTATİSTİKLER
                            </h3>
                            <p className="font-body text-[0.85rem] text-[#333]">
                                Kazandığın kupaları, efsane kadrolarını ve
                                kariyer istatistiklerini incele.
                            </p>
                        </div>
                        <i className="fa-solid fa-chevron-right mode-card-arrow text-[1.5rem] text-[#666666]"></i>
                    </button>
                </div>

                {/* Retro Decorative Footer / Stamp info */}
                <div className="retro-menu-footer flex justify-between items-center border-t-2 border-dashed border-[#1a1a1a] pt-[15px] mt-[25px] font-mono text-[0.65rem] text-[#666666] font-bold">
                    <span>SERİ No: #SL-2004-2026</span>
                    <span>* Developer By AlperenGundogdu</span>
                </div>

                {/* Scroll Down Tab Icon */}
                <button
                    id="btn-scroll-seo"
                    className="scroll-down-tab fixed bottom-[20px] left-[20px] bg-[#1a1a1a] text-white border-[1.5px] border-[#1a1a1a] px-[18px] py-[10px] font-header text-[0.9rem] font-extrabold tracking-[0.5px] rounded-[30px] cursor-pointer flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,0.25)] transition-all duration-200 z-[9999] hover:bg-[#e67e22] hover:-translate-y-[2px]"
                    title="Rehber ve Detaylar İçin Aşağı Kaydır"
                >
                    <i className="fa-solid fa-chevron-down fa-bounce"></i>{" "}
                    <span>REHBER &amp; DETAYLAR</span>
                </button>
            </div>

            {/* High-Value Publisher Content & SEO Article Section for AdSense Compliance */}
            <div className="seo-editorial-container mt-[40px] flex flex-col gap-[24px] text-left">
                <section className="seo-card bg-white border-2 border-[#1a1a1a] px-[28px] py-[24px] shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
                    <h2 className="font-header text-[1.8rem] font-black mb-[12px] text-[#111] uppercase">
                        Süper Lig Nostalji Draft Oyun Rehberi ve Detayları
                    </h2>
                    <p className="seo-lead text-[1rem] leading-[1.6] text-[#333]">
                        Türk futbol tarihinin unutulmaz 2004 - 2026 dönemi
                        efsanevi futbolcularını yeniden keşfedin! Süper Lig
                        Nostalji Draft, 2000&apos;li yılların efsanevi
                        Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor ve
                        Anadolu kulüplerinin unutulmaz yıldızlarıyla kadro kurma
                        heyecanını taraftarlarla buluşturan interaktif bir
                        futbol draft simülasyonudur.
                    </p>
                </section>

                <div className="seo-grid grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                    <article className="seo-card bg-white border-2 border-[#1a1a1a] px-[28px] py-[24px] shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222] flex items-center gap-2">
                            <i className="fa-solid fa-trophy text-gold text-[#d4af37]"></i>{" "}
                            Süper Lig Nostalji Draft Nedir?
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Süper Lig Nostalji Draft; oyunculara rastgele
                            sunulan 5 nostaljik futbolcu kartı arasından en
                            uyumlu seçimi yaparak ideal 11&apos;ini kurma imkanı
                            sunan bir strateji ve nostalji oyunudur. Kaleciden
                            forvete kadar her pozisyon için oyuncular puanlanır,
                            toplam takım reytingi (OVR) ve kadro kimyası
                            hesaplanır.
                        </p>
                    </article>

                    <article className="seo-card bg-white border-2 border-[#1a1a1a] px-[28px] py-[24px] shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222] flex items-center gap-2">
                            <i className="fa-solid fa-gamepad text-green text-[#27ae60]"></i>{" "}
                            Oyun Modları ve Kurallar
                        </h3>
                        <ul className="mt-[8px] pl-[20px] list-disc">
                            <li className="mb-[8px] leading-[1.5] text-[0.95rem]">
                                <strong>Klasik Turnuva Modu:</strong> Tek
                                oyunculu modda 4-3-3, 4-2-3-1 veya 3-5-2
                                dizilişini seçin, 11 pozisyonu draft edin ve
                                eliminasyon usulü turnuvada kupayı kaldırın!
                            </li>
                            <li className="mb-[8px] leading-[1.5] text-[0.95rem]">
                                <strong>1v1 Derbi Modu:</strong> Arkadaşınızla
                                aynı cihazda veya online canlı lobide derbi
                                heyecanı yaşayın. Kadroları yarıştıran
                                simülasyon motoru ile kazananı belirleyin.
                            </li>
                            <li className="mb-[8px] leading-[1.5] text-[0.95rem]">
                                <strong>Kupa Müzesi:</strong> Kazandığınız tüm
                                şampiyonluk kupalarını ve kurduğunuz en yüksek
                                reytingli efsane kadroları saklayın.
                            </li>
                        </ul>
                    </article>
                </div>

                <section className="seo-card bg-white border-2 border-[#1a1a1a] px-[28px] py-[24px] shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
                    <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222] flex items-center gap-2">
                        <i className="fa-solid fa-star text-gold text-[#d4af37]"></i>{" "}
                        Unutulmaz Süper Lig Efsaneleri
                    </h3>
                    <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                        Kadronuzu oluştururken Türk futboluna damga vurmuş
                        isimlerle karşılaşacaksınız: Alex de Souza&apos;nın kıl
                        payı pasları, Gheorghe Hagi&apos;nin füze şutları,
                        Fernando Muslera&apos;nın kritik kurtarışları, Wesley
                        Sneijder&apos;ın derbi golleri, Burak Yılmaz&apos;ın gol
                        krallığı yürüyüşleri, Ricardo Quaresma&apos;nın trivela
                        şovları ve Selçuk İnan&apos;ın serbest vuruşları! Her
                        kart oyuncuların Süper Lig&apos;deki en parlak dönem
                        istatistiklerini yansıtır.
                    </p>
                </section>

                {/* AdSense Ad Container */}
                <div className="ad-content-wrapper bg-[#faf8f5] border-[1.5px] border-[#1a1a1a] p-[16px] my-[10px] text-center min-h-[100px]">
                    <span className="ad-label block text-[0.7rem] font-extrabold text-[#888] tracking-[1px] mb-[8px]">
                        REKLAM
                    </span>
                    <ins
                        className="adsbygoogle"
                        style={{ display: "block", textAlign: "center" }}
                        data-ad-layout="in-article"
                        data-ad-format="fluid"
                        data-ad-client="ca-pub-7722512130979086"
                        data-ad-slot="1003264516"
                    ></ins>
                </div>

                {/* FAQ Section */}
                <section className="seo-card faq-section bg-white border-2 border-[#1a1a1a] px-[28px] py-[24px] shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
                    <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222] flex items-center gap-2">
                        <i className="fa-solid fa-circle-question"></i> Sıkça
                        Sorulan Sorular (SSS)
                    </h3>
                    <div className="faq-list flex flex-col gap-[12px] mt-[14px]">
                        <details className="faq-item bg-[#fdfdfd] border border-[#ddd] px-[16px] py-[12px] rounded-[4px] cursor-pointer">
                            <summary className="text-[0.95rem] text-[#111] outline-none">
                                <strong>
                                    Süper Lig Nostalji Draft ücretsiz mi?
                                </strong>
                            </summary>
                            <p className="mt-[10px] text-[0.9rem] text-[#555] leading-[1.5]">
                                Evet, Süper Lig Nostalji Draft tamamen
                                ücretsizdir. Tarayıcınız üzerinden üyelik
                                gerektirmeden anında oynayabilirsiniz.
                            </p>
                        </details>
                        <details className="faq-item bg-[#fdfdfd] border border-[#ddd] px-[16px] py-[12px] rounded-[4px] cursor-pointer">
                            <summary className="text-[0.95rem] text-[#111] outline-none">
                                <strong>
                                    Oda kodu ile arkadaşımla nasıl oynarım?
                                </strong>
                            </summary>
                            <p className="mt-[10px] text-[0.9rem] text-[#555] leading-[1.5]">
                                Ana menüden &apos;2 Oyunculu Derbi&apos; modunu
                                seçip &apos;Yeni Oda Oluştur&apos; butonuna
                                basın. Ekranınızda çıkan 6 haneli oda kodunu
                                arkadaşınızla paylaşın.
                            </p>
                        </details>
                        <details className="faq-item bg-[#fdfdfd] border border-[#ddd] px-[16px] py-[12px] rounded-[4px] cursor-pointer">
                            <summary className="text-[0.95rem] text-[#111] outline-none">
                                <strong>
                                    Kadro reytingi (OVR) ve Kimya nasıl
                                    hesaplanır?
                                </strong>
                            </summary>
                            <p className="mt-[10px] text-[0.9rem] text-[#555] leading-[1.5]">
                                Her futbolcunun nostaljik dönem gücü temel
                                alınır. Oyuncuları kendi doğal pozisyonlarında
                                oynatmak takım kimyasını artırır ve simülasyonda
                                galibiyet şansını yükseltir.
                            </p>
                        </details>
                    </div>
                </section>
            </div>

            {/* Footer Navigation */}
            <footer className="site-footer mt-[40px] pt-[24px] px-[10px] pb-[10px] border-t-2 border-[#1a1a1a] text-center bg-white">
                <div className="footer-links flex justify-center gap-[20px] flex-wrap mb-[12px]">
                    <Link
                        to="/"
                        className="text-[#111] no-underline font-bold text-[0.9rem] flex items-center gap-[6px] hover:text-[#e67e22] hover:underline"
                    >
                        <i className="fa-solid fa-house"></i> Ana Sayfa
                    </Link>
                    <Link
                        to="/gizlilik-politikasi"
                        className="text-[#111] no-underline font-bold text-[0.9rem] flex items-center gap-[6px] hover:text-[#e67e22] hover:underline"
                    >
                        <i className="fa-solid fa-shield-halved"></i> Gizlilik
                        Politikası
                    </Link>
                    <Link
                        to="/kullanim-sartlari"
                        className="text-[#111] no-underline font-bold text-[0.9rem] flex items-center gap-[6px] hover:text-[#e67e22] hover:underline"
                    >
                        <i className="fa-solid fa-file-contract"></i> Kullanım
                        Şartları
                    </Link>
                </div>
                <p className="footer-copy text-[0.8rem] text-[#666666]">
                    &copy; 2026 Süper Lig Nostalji Draft. Tüm hakları saklıdır.
                    Geliştirici: AlperenGundogdu
                </p>
            </footer>
        </section>
    );
}
