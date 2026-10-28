# Tycoon v4 — kariyer simülasyonu

## Dosyalar ve sınır

`tycoon_engine.js` katalog, eski kayıt okuyucusu ve temel yardımcıları sağlar. Ardından yüklenen `tycoon_simulation.js` kariyer kurallarını aynı `TycoonEngine` arayüzünde değiştirir. `tycoon_career.js` karar ekranlarını, `tycoon_match.js` yalnızca önceden hesaplanmış maçın metin anlatımını sunar. Klasik modun maç motoru değiştirilmez.

## Kararların sonuçları

- Bireysel kondisyon, keskinlik, moral ve mevkiye göre özellikler saha performansını etkiler. Dizilişteki savunmacı/orta saha/forvet sayıları farklı alanlara ağırlık verir; karşı taktiğin hücum riski ve maçın mevcut skoru pozisyon oluşumuna katılır.
- Dinlenme hızlı toparlar ama keskinlik kaybettirir. Dengeli çalışma normal gelişim sağlar. Yoğun çalışma daha fazla gelişim karşılığında birikmiş yük ve sakatlık riski getirir. Altyapı olmadan da sınırlı gelişim mümkündür; kapasite tüm kadroyu aynı anda eğitmeye yetmeyebilir.
- Sağlık ve ceza durumu kadro seçimini sınırlar. İlk 11 sözü verilen yedeklerin morali düşer. Sözleşme yenileme, satışa çıkarma, gerçek alıcı teklifini kabul etme ve genç yedekleri sekiz haftalık gelişim kiralamasına gönderme oyuncu dosyasındadır.
- Dört sarı kart bir maç, kırmızı kart iki maç ceza getirir. Maç içindeki ikinci sarı kart oyuncuyu çıkarır ve kalan dakikalarda takımın alan gücü değişir. Olaylar kronolojiktir; korner ve serbest vuruşlar takip pozisyonu üretir. Skor, olaylar ve istatistikler aynı hesaplamadan gelir.
- 80 kalıcı rakip kulüp beş bölümde kadro ve geçmiş taşır. Kullanıcı liginde 15 rakip bulunur; bir kulüp rezervde kalır. Diğer ligler de aynı maç motoruyla haftalık ilerler. Rakipler bütçeye bağlı transfer yapar; ödenemeyen giderleri kaybolmaz.
- Bonservis satıcıya gider. Aynı kişi birden çok kadroya kopyalanamaz. İndirimli teklif daha yüksek maaş beklentisi taşır ve reddedilebilir; aynı hafta tekrar deneyerek sonucu değiştirmek mümkün değildir. Gözlem raporu potansiyeli açar.
- Nakit yetersizliği maaş, işletme ve faiz borcu doğurur. Yalnızca gerçekten ödenen anapara banka borcundan düşer. Gecikmeler transferleri, morali, uyumu ve güveni etkiler. Yapılandırma borcu silmez; altı hafta transfer kısıtı ve sponsor kesintisi karşılığında taksiti azaltır.
- Bilet bedeli, taraftar güveni ve form seyirci talebini birlikte değiştirir. Tesisin yol bağlantısı ve önkoşulu sürekli denetlenir. Konum, diğer ticari tesisler ve iç/deplasman haftası ciroyu etkiler; hizmet veremeyen tesisin bakım gideri sürer.
- Basın sözü sponsor görüşmesine; maaş dengesizliği kaptan görüşmesine; akademiden çıkış süre/kiralama kararına dönüşebilir. Sözler birkaç maç sonra sonuçlanır. Krediyle kasayı doldurmak işletme zararı hedefini tamamlamaz.
- Yeni sezonlar 16 takımlı, 30 haftalık çift devreli ligdir. Sezon sonunda iki yönetim haftalık hazırlık dönemi vardır; o sırada maç geliri alınmaz. Oyuncular yaşlanır, ileri yaşta özellik kaybı yaşar. Yönetim hedefleri lig istikrarı, gençlere süre, borçsuz büyüme veya üst sıralardır.

## Kayıtlar

Yeni anahtar `superlig_tycoon_career_v4`; v3 anahtarı silinmez. Devam eden eski fikstür korunur; yeni sezon açıldığında yeni lig düzeni kullanılır. Yönetim ekranındaki JSON içe aktarımı önce biçim/kadro/fikstür doğrulaması ve kullanıcı onayı ister; mevcut kariyer `_before_import` anahtarına yedeklenir.

Yaş, potansiyel ve ayrıntılı özellikler nostalji kariyeri için modellenmiştir, gerçek güncel oyuncu verisi değildir. v3 kayıtlarında tutulmayan bireysel maç istatistikleri geçmişe dönük uydurulmaz. Gelişim kiralaması henüz karşı kulüpte oynanan her dakikayı simüle etmez; haftalık gelişim modeli kullanır. Maç sırasında oyuncu kontrolü veya oynanabilir canlı saha yoktur.

## Doğrulama

`node tycoon_simulation.test.cjs` yeni v4 sistemini gerçek oyuncu dosyasıyla test eder. `node tycoon_engine.test.cjs` ise eski temel motorun ayrı regresyon paketidir; v4 davranışının kanıtı olarak sayılmamalıdır.

V4 test kapsamı: kimlik tekilliği, fikstür, deterministik kayıt dönüşü, XP taşması, geçersiz kadro, borç muhasebesi, sözleşme, transfer para dengesi, tesis bağımlılıkları, içe aktarım doğrulaması, 500 maçta olay/skor tutarlılığı, güçlü/zayıf özellik karşılaştırması, üç ayrı tam sezon antrenman politikası, akademi/kiralık dönüşü, olay zincirleri ve eski kayıt geçişi.

Sabit kontrol örneğinde 500 maçın ortalaması 2,552 gol oldu. Aynı başlangıçtan üç ayrı 30 haftalık koşuda dinlenme/dengeli/yoğun planları 18/36/27 puan üretti. Bu değerler test senaryosudur; bütün kadrolar ve kariyerler için denge garantisi değildir.
