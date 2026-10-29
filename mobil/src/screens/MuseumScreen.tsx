import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Shadows } from '../theme/colors';
import { RetroHeader } from '../components/RetroHeader';
import { PosterModal } from '../components/PosterModal';
import { MatchResult } from '../game/simulationEngine';

interface MuseumScreenProps {
  navigation: any;
}

interface SavedPosterItem {
  id: string;
  date: string;
  result: MatchResult;
}

export const MuseumScreen: React.FC<MuseumScreenProps> = ({ navigation }) => {
  const [savedPosters, setSavedPosters] = useState<SavedPosterItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    loadSavedPosters();
  }, []);

  const loadSavedPosters = async () => {
    try {
      const data = await AsyncStorage.getItem('@SLD_SAVED_POSTERS');
      if (data) {
        setSavedPosters(JSON.parse(data));
      }
    } catch {
      // quiet
    }
  };

  const handleClearHistory = () => {
    Alert.alert('Arşivi Temizle', 'Tüm maç posterleri ve müze geçmişi silinsin mi?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Evet, Sil',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('@SLD_SAVED_POSTERS');
          setSavedPosters([]);
        },
      },
    ]);
  };

  // Career Statistics Calculated Deterministically
  const totalPlayed = savedPosters.length;
  const wonCount = savedPosters.filter(p => p.result.winner === 'home').length;
  const drawCount = savedPosters.filter(
    p => p.result.winner === 'draw' || p.result.homeScore === p.result.awayScore,
  ).length;
  const lostCount = totalPlayed - wonCount - drawCount;
  const totalGoalsFor = savedPosters.reduce(
    (acc, p) => acc + (p.result.homeScore || 0),
    0,
  );
  const totalGoalsAgainst = savedPosters.reduce(
    (acc, p) => acc + (p.result.awayScore || 0),
    0,
  );
  const maxOvr =
    savedPosters.length > 0
      ? Math.max(...savedPosters.map(p => p.result.homeRating || 75))
      : 0;
  const trophyCount = Math.floor(wonCount / 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader
        title="KUPA MÜZESİ"
        subtitle="İSTATİSTİKLER VE MAÇ POSTERLERİ"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          savedPosters.length > 0
            ? {
                icon: '🗑️',
                onPress: handleClearHistory,
              }
            : undefined
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Trophies Cabinet */}
        <View style={[styles.trophyCabinet, Shadows.brutal]}>
          <Text style={styles.cabinetTitle}>🏆 KUPA VİTRİNİ</Text>
          <View style={styles.trophiesRow}>
            <View style={styles.trophySlot}>
              <Text style={styles.trophyIcon}>🏆</Text>
              <Text style={styles.trophyName}>Türkiye Kupası</Text>
              <Text style={styles.trophyCountText}>x{trophyCount}</Text>
            </View>
            <View style={styles.trophySlot}>
              <Text style={styles.trophyIcon}>⭐</Text>
              <Text style={styles.trophyName}>Süper Kupa</Text>
              <Text style={styles.trophyCountText}>x{Math.floor(trophyCount / 2)}</Text>
            </View>
            <View style={styles.trophySlot}>
              <Text style={styles.trophyIcon}>👑</Text>
              <Text style={styles.trophyName}>Derbi Şampiyonu</Text>
              <Text style={styles.trophyCountText}>x{wonCount}</Text>
            </View>
          </View>
        </View>

        {/* 5 CAREER STATS CARDS (Matching Web Version) */}
        <View style={styles.statsGrid}>
          {/* 1. Trophies */}
          <View style={[styles.statCard, Shadows.brutalSm]}>
            <Text style={styles.statIcon}>🏆</Text>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{trophyCount}</Text>
              <Text style={styles.statLabel}>Kazanılan Kupa</Text>
            </View>
          </View>

          {/* 2. Matches Played */}
          <View style={[styles.statCard, Shadows.brutalSm]}>
            <Text style={styles.statIcon}>🎮</Text>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{totalPlayed}</Text>
              <Text style={styles.statLabel}>Oynanan Maç</Text>
            </View>
          </View>

          {/* 3. Results (G / B / M) */}
          <View style={[styles.statCard, Shadows.brutalSm]}>
            <Text style={styles.statIcon}>📊</Text>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {wonCount}G {drawCount}B {lostCount}M
              </Text>
              <Text style={styles.statLabel}>Sonuçlar</Text>
            </View>
          </View>

          {/* 4. Goals (Atılan / Yenilen) */}
          <View style={[styles.statCard, Shadows.brutalSm]}>
            <Text style={styles.statIcon}>⚽</Text>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {totalGoalsFor} / {totalGoalsAgainst}
              </Text>
              <Text style={styles.statLabel}>Atılan / Yenilen</Text>
            </View>
          </View>

          {/* 5. Max OVR */}
          <View style={[styles.statCard, Shadows.brutalSm]}>
            <Text style={styles.statIcon}>📈</Text>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {maxOvr > 0 ? maxOvr : '--'}
              </Text>
              <Text style={styles.statLabel}>En Yüksek OVR</Text>
            </View>
          </View>
        </View>

        {/* Saved Match Posters */}
        <View style={styles.postersSection}>
          <Text style={styles.sectionHeader}>KAYDEDİLEN MAÇ POSTERLERİ</Text>

          {savedPosters.length === 0 ? (
            <View style={[styles.emptyBox, Shadows.brutalSm]}>
              <Text style={styles.emptyIcon}>📜</Text>
              <Text style={styles.emptyTitle}>Henüz Maç Posteri Yok</Text>
              <Text style={styles.emptyDesc}>
                Oynadığın hızlı maçlar, derbiler ve kupa finallerinin nostalji posterleri otomatik olarak bu arşive kaydedilir.
              </Text>
            </View>
          ) : (
            savedPosters.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.posterCard, Shadows.brutalSm]}
                activeOpacity={0.8}
                onPress={() => setSelectedResult(item.result)}
              >
                <View style={styles.posterMeta}>
                  <Text style={styles.posterDate}>
                    {new Date(item.date).toLocaleDateString('tr-TR')}
                  </Text>
                  <Text style={styles.posterMvp}>
                    MVP: {item.result.mvp.name}
                  </Text>
                </View>

                <View style={styles.posterMatchRow}>
                  <Text style={styles.posterTeam} numberOfLines={1}>
                    {item.result.homeTeam.name}
                  </Text>
                  <View style={styles.posterScoreBox}>
                    <Text style={styles.posterScore}>
                      {item.result.homeScore} - {item.result.awayScore}
                    </Text>
                  </View>
                  <Text style={styles.posterTeam} numberOfLines={1}>
                    {item.result.awayTeam.name}
                  </Text>
                </View>

                <View style={styles.posterFooter}>
                  <Text style={styles.viewPosterText}>POSTERİ GÖRÜNTÜLE 👁️</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Selected Match Poster Modal */}
      <PosterModal
        visible={!!selectedResult}
        matchResult={selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 32,
  },
  trophyCabinet: {
    backgroundColor: Colors.cardBg,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 14,
    marginBottom: 16,
  },
  cabinetTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.inkBlack,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  trophiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trophySlot: {
    alignItems: 'center',
    gap: 2,
  },
  trophyIcon: {
    fontSize: 28,
  },
  trophyName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    marginTop: 2,
  },
  trophyCountText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#3b9966',
  },
  statsGrid: {
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    fontSize: 26,
    width: 36,
    textAlign: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3b9966',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
    textTransform: 'uppercase',
    marginTop: 1,
  },
  postersSection: {
    marginTop: 6,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.inkBlack,
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
  posterCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 12,
    marginBottom: 10,
  },
  posterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 6,
    marginBottom: 8,
  },
  posterDate: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888888',
  },
  posterMvp: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3b9966',
  },
  posterMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  posterTeam: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  posterScoreBox: {
    backgroundColor: '#fff2cc',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 8,
  },
  posterScore: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  posterFooter: {
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 6,
    alignItems: 'center',
  },
  viewPosterText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1a1a1a',
  },
});
