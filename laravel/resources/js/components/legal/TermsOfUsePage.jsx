import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header';

export default function TermsOfUsePage({ onNavigateHome }) {
    return (
        <div className="app-container max-w-[1280px] mx-auto p-[20px]">
            <Header isLegalPage={true} onNavigateHome={onNavigateHome} />

            <main className="app-main">
                <article className="legal-container max-w-[850px] my-[30px] mx-auto bg-white border-2 border-[#1a1a1a] p-[40px] shadow-[6px_6px_0px_rgba(0,0,0,0.2)] text-left">
                    <h2 className="font-header text-[2.2rem] font-black mb-[5px] text-[#111]">
                        KULLANIM ŞARTLARI VE SÖZLEŞMESİ
                    </h2>
                    <p className="legal-updated text-[0.85rem] text-[#666666] mb-[30px] border-b border-dashed border-[#ccc] pb-[10px]">
                        Son Güncelleme Tarihi: 5 Ağustos 2026
                    </p>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            1. Hizmet Koşullarının Kabulü
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Süper Lig Nostalji Draft (https://superligdraft.site/) web sitesine erişerek ve oyun hizmetlerini kullanarak bu Kullanım Şartlarını kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız lütfen sitemizi kullanmayınız.
                        </p>
                    </div>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            2. Hizmetin Tanımı ve Amacı
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Süper Lig Nostalji Draft, futbol tutkunları için Türk futbol tarihinin 2004 ve sonrası efsaneleşmiş oyuncularıyla kadro kurma (draft), arkadaşlarıyla teke tek veya lig usulü turnuvalar yapma imkanı sunan tamamen ücretsiz bir nostalji ve eğlence platformudur.
                        </p>
                    </div>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            3. Kullanıcı Sorumlulukları ve Davranış Kuralları
                        </h3>
                        <ul className="pl-[20px] mt-[8px] list-disc text-[0.95rem] leading-[1.6] text-[#333]">
                            <li>
                                Kullanıcılar lobi veya oda isimlerinde, oyuncu takma adlarında genel ahlaka aykırı, hakaret içeren veya yasadışı ifadeler kullanamazlar.
                            </li>
                            <li>
                                Platformun teknik altyapısını bozmaya, otomatik botlar çalıştırmaya veya oyunu manipüle etmeye yönelik girişimler yasaktır.
                            </li>
                        </ul>
                    </div>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            4. Fikri Mülkiyet ve Telif Hakları
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Sitede yer alan özel tasarım öğeleri, yazılım kodları, arayüz bileşenleri ve nostaljik oyun kurgusu Süper Lig Nostalji Draft geliştiricilerine aittir. Futbolcu isimleri ve takım nostalji bilgileri bilgilendirme, haber ve eğlence amaçlı sunulmaktadır.
                        </p>
                    </div>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            5. Sorumluluk Sınırlaması
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Sitemiz &quot;olduğu gibi&quot; sunulmakta olup, kesintisiz çalışma garantisi verilmez. İnternet bağlantı hatalarından, sunucu yoğunluklarından veya kullanıcı cihazlarından kaynaklanan aksaklıklardan sitemiz sorumlu tutulamaz.
                        </p>
                    </div>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            6. İletişim
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Kullanım şartlarına ilişkin sorularınız için <strong>iletisim@superligdraft.site</strong> adresi üzerinden bizimle iletişime geçebilirsiniz.
                        </p>
                    </div>

                    <div className="legal-actions mt-[35px] border-t border-[#eee] pt-[20px]">
                        <Link to="/" className="btn btn-black">
                            <i className="fa-solid fa-arrow-left"></i> Ana Sayfaya Dön
                        </Link>
                    </div>
                </article>
            </main>

            <footer className="site-footer mt-[40px] pt-[24px] px-[10px] pb-[10px] border-t-2 border-[#1a1a1a] text-center bg-white">
                <div className="footer-links flex justify-center gap-[20px] flex-wrap mb-[12px]">
                    <Link to="/">Ana Sayfa</Link>
                    <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>
                    <Link to="/kullanim-sartlari">Kullanım Şartları</Link>
                </div>
                <p className="footer-copy text-[0.8rem] text-[#666666]">
                    &copy; 2026 Süper Lig Nostalji Draft. Tüm hakları saklıdır.
                </p>
            </footer>
        </div>
    );
}

