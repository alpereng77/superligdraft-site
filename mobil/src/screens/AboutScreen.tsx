import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { RetroHeader } from '../components/RetroHeader';

interface AboutScreenProps {
  navigation: any;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader
        title="REHBER & DETAYLAR"
        subtitle="OYUN KURALLARI VE BİLGİLER"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title Card */}
        <View style={styles.card}>
          <Text style={styles.mainTitle}>
            SÜPER LİG NOSTALJİ DRAFT OYUN REHBERİ VE DETAYLARI
          </Text>
          <Text style={styles.leadText}>
            Türk futbol tarihinin unutulmaz 2004 - 2026 dönemi efsanevi futbolcularını
            yeniden keşfedin! Süper Lig Nostalji Draft, 2000'li yılların efsanevi
            Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor ve Anadolu kulüplerinin
            unutulmaz yıldızlarıyla kadro kurma heyecanını taraftarlarla buluşturan
            interaktif bir futbol draft simülasyonudur.
          </Text>
        </View>

        {/* Card 2: Nedir */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🏆 Süper Lig Nostalji Draft Nedir?
          </Text>
          <Text style={styles.cardBody}>
            Süper Lig Nostalji Draft; oyunculara rastgele sunulan nostaljik futbolcu
            kartları arasından en uyumlu seçimi yaparak ideal 11'ini kurma imkanı
            sunan bir strateji ve nostalji oyunudur. Kaleciden forvete kadar her
            pozisyon için oyuncular puanlanır, toplam takım reytingi (OVR) ve kadro
            kimyası hesaplanır.
          </Text>
        </View>

        {/* Card 3: Oyun Modları */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🎮 Oyun Modları ve Kurallar
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • <Text style={styles.boldText}>Klasik Turnuva Modu:</Text> Tek oyunculu
              modda 4-3-3, 4-2-3-1 veya 3-5-2 dizilişini seçin, 11 pozisyonu draft edin
              ve eliminasyon usulü turnuvada kupayı kaldırın!
            </Text>
            <Text style={styles.bulletItem}>
              • <Text style={styles.boldText}>1v1 Derbi Modu:</Text> Arkadaşınızla aynı
              cihazda veya online canlı lobide derbi heyecanı yaşayın. Kadroları
              yarıştıran simülasyon motoru ile kazananı belirleyin.
            </Text>
            <Text style={styles.bulletItem}>
              • <Text style={styles.boldText}>Kupa Müzesi:</Text> Kazandığınız tüm
              şampiyonluk kupalarını ve kurduğunuz en yüksek reytingli efsane kadroları
              saklayın.
            </Text>
          </View>
        </View>

        {/* Card 4: Unutulmaz Efsaneler */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            ⭐ Unutulmaz Süper Lig Efsaneleri
          </Text>
          <Text style={styles.cardBody}>
            Kadronuzu oluştururken Türk futboluna damga vurmuş isimlerle
            karşılaşacaksınız: Alex de Souza'nın kıl payı pasları, Gheorghe Hagi'nin
            füze şutları, Fernando Muslera'nın kritik kurtarışları, Wesley Sneijder'ın
            derbi golleri, Burak Yılmaz'ın gol krallığı yürüyüşleri, Ricardo Quaresma'nın
            trivela şovları ve Selçuk İnan'ın serbest vuruşları! Her kart oyuncuların
            Süper Lig'deki en parlak dönem istatistiklerini yansıtır.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5efe6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    padding: 18,
    borderRadius: 2,
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  leadText: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 18,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 12,
    color: '#444444',
    lineHeight: 18,
    fontWeight: '600',
  },
  bulletList: {
    gap: 8,
    marginTop: 4,
  },
  bulletItem: {
    fontSize: 12,
    color: '#444444',
    lineHeight: 18,
    fontWeight: '500',
  },
  boldText: {
    fontWeight: '800',
    color: '#1a1a1a',
  },
});

