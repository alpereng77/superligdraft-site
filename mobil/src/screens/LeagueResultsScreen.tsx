import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import { RetroHeader } from '../components/RetroHeader';
import { PosterModal } from '../components/PosterModal';
import { DerbyMatch, RoomData } from '../services/api';
import { Colors } from '../theme/colors';

interface LeagueResultsScreenProps {
  navigation: any;
  route: any;
}

export const LeagueResultsScreen: React.FC<LeagueResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const roomData: RoomData | undefined = route.params?.roomData;
  const match: DerbyMatch | undefined =
    route.params?.match || roomData?.leagueResults?.matches?.[0];
  const username: string = route.params?.username || '';

  const [posterVisible, setPosterVisible] = useState<boolean>(false);

  // Fallbacks if standalone
  const homeName = match?.home || 'omer';
  const awayName = match?.away || 'test';
  const homeRating = match?.homeRating || 88;
  const awayRating = match?.awayRating || 78;
  const homeScore = match?.homeScore ?? 2;
  const awayScore = match?.awayScore ?? 3;

  const winner = match?.winner === 'home' ? homeName : awayName;
  const hasExtra = match?.hasExtraTime;
  const hasPen = match?.hasPenalties;

  const extraSuffix = hasPen
    ? '(Penaltılarla)'
    : hasExtra
    ? '(Uzatmalarda)'
    : '(Normal Süre)';

  const scoreSuffix = hasPen
    ? '(Penaltı)'
    : hasExtra
    ? '(Uzatma)'
    : null;

  // Find user's squad for the poster
  const userPlayer = roomData?.players?.find(p => p.username === username);
  const mySquad = userPlayer?.squad || route.params?.userSquad || [];
  const myFormation = userPlayer?.formation || route.params?.userFormation || '4-4-2';

  const handleShareWhatsApp = () => {
    const text = `Süper Lig Nostalji Draft'ta büyük derbi bitti!\n🏆 Şampiyon: ${winner} ${extraSuffix}\n⚽ ${homeName} (${homeRating}) ${homeScore} - ${awayScore} ${awayName} (${awayRating})\n\nSen de nostalji kadronu kur ve kapışalım: https://superligdraft.site/`;
    Linking.openURL(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
    ).catch(() => {
      Share.share({ message: text });
    });
  };

  const handleNewGame = () => {
    navigation.navigate('MainMenu');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader
        title="SÜPER LİG DRAFT"
        subtitle="2 KİŞİLİK DRAFT"
        showBack
        onBack={() => navigation.navigate('MainMenu')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================
            MATCH RESULTS CARD (Matches Screenshot 1 Exactly)
            ========================================================= */}
        <View style={styles.cardContainer}>
          {/* Trophy & Champion Title */}
          <View style={styles.championHeader}>
            <Text style={styles.trophyIcon}>🏆</Text>
            <Text style={styles.championTitle}>DERBİNİN ŞAMPİYONU</Text>
            <View style={styles.winnerRow}>
              <Text style={styles.winnerName}>{winner}</Text>
              <Text style={styles.winnerTrophy}>🏆</Text>
              <Text style={styles.winnerSuffix}>{extraSuffix}</Text>
            </View>
          </View>

          {/* Section Title: MAÇ SONUCU with Underline */}
          <View style={styles.sectionTitleArea}>
            <Text style={styles.sectionTitle}>MAÇ SONUCU</Text>
            <View style={styles.sectionLine} />
          </View>

          {/* Match Score Box */}
          <View style={styles.matchScoreCard}>
            <View style={styles.matchRow}>
              {/* Home Team */}
              <View style={styles.teamColHome}>
                <Text style={styles.teamText} numberOfLines={1}>
                  {homeName}{' '}
                  <Text style={styles.ratingText}>({homeRating})</Text>
                </Text>
              </View>

              {/* Center Score Pill */}
              <View style={styles.scorePillCol}>
                <View style={styles.scorePill}>
                  <Text style={styles.scoreDigits}>
                    {homeScore} - {awayScore}
                  </Text>
                </View>
                {scoreSuffix && (
                  <Text style={styles.scoreSuffixText}>{scoreSuffix}</Text>
                )}
              </View>

              {/* Away Team */}
              <View style={styles.teamColAway}>
                <Text style={styles.teamText} numberOfLines={1}>
                  {awayName}{' '}
                  <Text style={styles.ratingText}>({awayRating})</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* 3 Action Buttons (Matches Screenshot 1) */}
          <View style={styles.actionsRow}>
            {/* 1. YENİ OYUN (White button, black border) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNewGame}
              style={styles.newGameBtn}
            >
              <Text style={styles.newGameBtnText}>🔄 YENİ OYUN</Text>
            </TouchableOpacity>

            {/* 2. ANI POSTERİ OLUŞTUR (Green button, camera icon) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPosterVisible(true)}
              style={styles.posterBtn}
            >
              <Text style={styles.posterBtnText}>📷 ANI POSTERİ OLUŞTUR</Text>
            </TouchableOpacity>

            {/* 3. WHATSAPP'TA PAYLAŞ (WhatsApp green button) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShareWhatsApp}
              style={styles.waBtn}
            >
              <Text style={styles.waBtnText}>💬 WHATSAPP'TA PAYLAŞ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Retro Newspaper Anı Posteri Modal (Matches Screenshot 2) */}
      <PosterModal
        visible={posterVisible}
        roomData={roomData}
        match={match}
        userSquad={mySquad}
        userFormation={myFormation}
        username={username}
        onClose={() => setPosterVisible(false)}
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
    padding: 16,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 22,
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  championHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trophyIcon: {
    fontSize: 52,
    marginBottom: 8,
  },
  championTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  winnerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  winnerTrophy: {
    fontSize: 16,
  },
  winnerSuffix: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },
  sectionTitleArea: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionLine: {
    height: 1.5,
    backgroundColor: '#1a1a1a',
  },
  matchScoreCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamColHome: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  teamColAway: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  teamText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },
  scorePillCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePill: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  scoreDigits: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 2,
  },
  scoreSuffixText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
    justifyContent: 'center',
    marginTop: 8,
  },
  newGameBtn: {
    flex: 0.9,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  newGameBtnText: {
    color: '#1a1a1a',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  posterBtn: {
    flex: 1.25,
    backgroundColor: '#3b9966',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  posterBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  waBtn: {
    flex: 1.2,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  waBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
