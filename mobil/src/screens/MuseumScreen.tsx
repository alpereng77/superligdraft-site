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
    Alert.alert('Arşivi Temizle', 'Tüm maç posterleri silinsin mi?', [
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader
        title="MÜZE & ARŞİV"
        subtitle="MAÇ POSTERLERİ VE KUPALAR"
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
            </View>
            <View style={styles.trophySlot}>
              <Text style={styles.trophyIcon}>⭐</Text>
              <Text style={styles.trophyName}>Süper Kupa</Text>
            </View>
            <View style={styles.trophySlot}>
              <Text style={styles.trophyIcon}>👑</Text>
              <Text style={styles.trophyName}>Derbi Şampiyonu</Text>
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
                Oynadığın hızlı maçlar ve kupa finallerinin posterleri otomatik olarak bu arşive kaydedilir.
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
    borderRadius: 8,
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
    gap: 4,
  },
  trophyIcon: {
    fontSize: 32,
  },
  trophyName: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  postersSection: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.inkBlack,
    letterSpacing: 0.5,
  },
  emptyBox: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.inkBlack,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  posterCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 12,
  },
  posterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  posterDate: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  posterMvp: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accentGold,
  },
  posterMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  posterTeam: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    color: Colors.inkBlack,
    textAlign: 'center',
  },
  posterScoreBox: {
    backgroundColor: Colors.creamDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    marginHorizontal: 8,
  },
  posterScore: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.accentRed,
  },
  posterFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  viewPosterText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.accentBlue,
    letterSpacing: 0.5,
  },
});
