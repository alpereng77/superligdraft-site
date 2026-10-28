import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header';

export default function PrivacyPolicyPage({ onNavigateHome }) {
    return (
        <div className="app-container max-w-[1280px] mx-auto p-[20px]">
            <Header isLegalPage={true} onNavigateHome={onNavigateHome} />

            <main className="app-main">
                <article className="legal-container max-w-[850px] my-[30px] mx-auto bg-white border-2 border-[#1a1a1a] p-[40px] shadow-[6px_6px_0px_rgba(0,0,0,0.2)] text-left">
                    <h2 className="font-header text-[2.2rem] font-black mb-[5px] text-[#111]">GİZLİLİK POLİTİKASI</h2>
                    <p className="legal-updated text-[0.85rem] text-[#666666] mb-[30px] border-b border-dashed border-[#ccc] pb-[10px]">
                        Son Güncelleme Tarihi: 5 Ağustos 2026
                    </p>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            1. Giriş ve Genel Bilgiler
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Süper Lig Nostalji Draft (https://superligdraft.site/) olarak, ziyaretçilerimizin ve kullanıcılarımızın gizliliğine büyük önem veriyoruz. Bu Gizlilik Politikası belgesi, web sitemizi ziyaret ettiğinizde veya oyun modlarımızı kullandığınızda toplanan, kaydedilen ve işlenen bilgi türlerini ve bunların nasıl kullanıldığını açıklamaktadır.
                        </p>
                    </div>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            2. Toplanan Veriler ve Kullanım Amacı
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Sitemiz üzerinde sunulan oyun deneyimi doğrudan tarayıcı tabanlıdır. Oyuncuların oda kurma, kullanıcı adı seçme ve kadro hazırlama süreçlerinde aşağıdaki minimal veriler işlenmektedir:
                        </p>
                        <ul className="pl-[20px] mt-[8px] list-disc text-[0.95rem] leading-[1.6] text-[#333]">
                            <li>
                                <strong>Kullanıcı Adı:</strong> Lobi ve maç ekranlarında görüntülenmek üzere geçici olarak saklanır.
                            </li>
                            <li>
                                <strong>Oyun İstatistikleri ve Kupa Bilgileri:</strong> Cihazınızın yerel depolama alanında (LocalStorage) saklanır. Şahsi kimlik bilginiz sunucularımızda depolanmaz.
                            </li>
                            <li>
                                <strong>Log Dosyaları:</strong> Standart web sunucusu protokolleri gereği IP adresleri, tarayıcı türü, İnternet Servis Sağlayıcısı (ISP), tarih/saat damgaları ve tıklama sayıları gibi anonim veriler analiz amacıyla kaydedilebilir.
                            </li>
                        </ul>
                    </div>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            3. Çerezler (Cookies) ve Web İşaretçileri
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Süper Lig Nostalji Draft, kullanıcı tercihlerini hatırlamak ve site deneyimini optimize etmek amacıyla çerezleri (cookies) kullanır. Ayrıca sitemizde üçüncü taraf reklam ortakları hizmet vermektedir.
                        </p>
                    </div>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            4. Google AdSense ve DART Çerezleri
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Google, sitemizde reklam sunan üçüncü taraf bir tedarikçidir. Google, sitemize ve internetteki diğer sitelere yapılan ziyaretlere dayalı olarak kullanıcılarımıza reklam sunmak için DART çerezlerini kullanır.
                        </p>
                        <ul className="pl-[20px] mt-[8px] list-disc text-[0.95rem] leading-[1.6] text-[#333]">
                            <li>
                                Kullanıcılar, Google Reklam ve İçerik Ağı Gizlilik Politikası&apos;nı ziyaret ederek DART çerezlerinin kullanımını engelleyebilirler:{' '}
                                <a
                                    href="https://policies.google.com/technologies/ads"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#2980b9] underline"
                                >
                                    Google Reklam Politikaları
                                </a>
                                .
                            </li>
                            <li>
                                Üçüncü taraf reklam sunucuları veya reklam ağları, sitemizde görünen reklamlar ve bağlantılar için çerezler, JavaScript veya Web İşaretçileri gibi teknolojiler kullanabilir.
                            </li>
                            <li>Sitemiz, Google AdSense program politikalarına tam uyum sağlayacak şekilde tasarlanmıştır.</li>
                        </ul>
                    </div>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            5. Çocukların Gizliliği
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Sitemiz 13 yaşın altındaki çocuklardan bilerek herhangi bir kişisel tanımlanabilir bilgi toplamaz. Ebeveynlerin çocuklarının çevrimiçi etkinliklerini gözetim altında tutmalarını ve rehberlik etmelerini tavsiye ederiz.
                        </p>
                    </div>

                    <div className="legal-section mb-[24px]">
                        <h3 className="font-header text-[1.3rem] font-extrabold mb-[10px] text-[#222]">
                            6. İletişim Bilgileri
                        </h3>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            Gizlilik politikamızla ilgili herhangi bir sorunuz, öneriniz veya talebiniz varsa bizimle iletişim kurabilirsiniz:
                        </p>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            <strong>E-posta:</strong> iletisim@superligdraft.site
                        </p>
                        <p className="text-[0.95rem] leading-[1.6] text-[#333]">
                            <strong>Web Site:</strong>{' '}
                            <a href="https://superligdraft.site/" className="text-[#2980b9] underline">
                                https://superligdraft.site/
                            </a>
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

