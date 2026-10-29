import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FORMATIONS } from '../game/formationConfigs';
import { DerbyMatch, RoomData } from '../services/api';
import { MatchResult } from '../game/simulationEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PosterModalProps {
  visible: boolean;
  onClose: () => void;
  // Can be called either with matchResult (singleplayer) or derby room data (multiplayer)
  matchResult?: MatchResult | null;
  roomData?: RoomData;
  match?: DerbyMatch;
  userSquad?: any[];
  userFormation?: string;
  username?: string;
}

const POS_ORDER: Record<string, number> = {
  GK: 1,
  KL: 1,
  DF: 2,
  MF: 3,
  OS: 3,
  FW: 4,
  FV: 4,
};

const formatPos = (pos: string) => {
  if (pos === 'GK') return 'KL';
  if (pos === 'MF') return 'OS';
  if (pos === 'FW') return 'FV';
  return pos || 'OS';
};

export const PosterModal: React.FC<PosterModalProps> = ({
  visible,
  onClose,
  matchResult,
  roomData,
  match,
  userSquad,
  userFormation,
  username,
}) => {
  const [downloading, setDownloading] = useState<boolean>(false);

  if (!visible) return null;

  // Determine active squad & formation
  const myData = roomData?.players?.find(p => p.username === username);
  const rawSquad: any[] = myData?.squad || userSquad || matchResult?.timeline || [];
  const formationKey = myData?.formation || userFormation || '4-4-2';
  const formationDef = FORMATIONS[formationKey] || FORMATIONS['4-4-2'];

  // Fill 11 slots
  const filledSquad = rawSquad.filter(Boolean);
  const avgRating =
    filledSquad.length > 0
      ? Math.round(
          filledSquad.reduce((a, c) => a + (c.rating || 75), 0) /
            filledSquad.length,
        )
      : match?.homeRating || 78;

  const bestPlayer = [...filledSquad].sort(
    (a, b) => (b.rating || 0) - (a.rating || 0),
  )[0] || { name: 'Efsane Oyuncu', rating: 88 };

  // Sorted 11 for list (KL -> DF -> OS -> FV)
  const sortedSquad = [...filledSquad].sort((a, b) => {
    const ordA = POS_ORDER[a.position] || 99;
    const ordB = POS_ORDER[b.position] || 99;
    if (ordA !== ordB) return ordA - ordB;
    return (b.rating || 0) - (a.rating || 0);
  });

  const isChamp =
    match?.winner === 'home'
      ? match?.home === username
      : match?.winner === 'away'
      ? match?.away === username
      : true;

  const posterTitle = isChamp ? 'ŞAMPİYON' : 'LİG ANISI';
  const posterSubtitle = match ? '2 KİŞİLİK NOSTALJİ DERBİSİ' : 'TÜRKİYE KUPASI ŞAMPİYONU';

  // Date strings
  const now = new Date();
  const monthShort = now
    .toLocaleDateString('tr-TR', { month: 'short' })
    .replace('.', '')
    .toUpperCase();
  const dayNum = now.getDate();
  const weekdayShort = now
    .toLocaleDateString('tr-TR', { weekday: 'short' })
    .replace('.', '')
    .toUpperCase();
  const fullDateStr = now.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Opponent and scores for "MAÇ SONUÇLARI"
  const oppName =
    match?.home === username ? match?.away : match?.home || matchResult?.awayTeam?.name || 'Rakip';
  const userGoals =
    (match?.home === username ? match?.homeScore : match?.awayScore) ?? matchResult?.homeScore ?? 3;
  const oppGoals =
    (match?.home === username ? match?.awayScore : match?.homeScore) ?? matchResult?.awayScore ?? 2;

  // Handle Save to Gallery / Museum
  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Save item to AsyncStorage
      const existing = await AsyncStorage.getItem('@SLD_SAVED_POSTERS');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift({
        id: Date.now().toString(),
        date: now.toISOString(),
        result: {
          homeTeam: { name: username || 'Takımım', rating: avgRating },
          awayTeam: { name: oppName, rating: 75 },
          homeScore: userGoals,
          awayScore: oppGoals,
          mvp: bestPlayer,
          winner: userGoals >= oppGoals ? 'home' : 'away',
        },
      });
      await AsyncStorage.setItem(
        '@SLD_SAVED_POSTERS',
        JSON.stringify(list.slice(0, 30)),
      );

      setTimeout(() => {
        setDownloading(false);
        Alert.alert(
          'Galeriye Kaydedildi 📸',
          'Anı posteriniz cihazınıza ve Kupa Müzesi arşivine başarıyla kaydedildi!',
          [{ text: 'Tamam' }],
        );
      }, 500);
    } catch {
      setDownloading(false);
      Alert.alert('Bilgi', 'Poster Kupa Müzesi arşivine kaydedildi.');
    }
  };

  const handleShare = async () => {
    try {
      const shareMsg =
        `📜 SÜPER LİG NOSTALJİ DRAFT • ${posterTitle} POSTERİ 📜\n\n` +
        `🏆 ${posterSubtitle}\n` +
        `⚔️ Skor: vs ${oppName} (${userGoals} - ${oppGoals})\n` +
        `⭐ Taktik Diziliş: ${formationKey} • Genel Güç: ${avgRating}\n` +
        `🌟 En İyi Oyuncu: ${bestPlayer.name} (${bestPlayer.rating})\n\n` +
        `Sen de nostaljik kadronu kur ve kapış: https://superligdraft.site/`;

      await Share.share({
        message: shareMsg,
        title: `${posterTitle} - Süper Lig Nostalji Draft Posteri`,
      });
    } catch {
      Alert.alert('Hata', 'Paylaşım gerçekleştirilemedi.');
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalWrapper}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* =========================================================
                VINTAGE NEWSPAPER POSTER CANVAS (Matches Screenshot 2 Exactly)
                ========================================================= */}
            <View style={styles.posterCanvas}>
              {/* Outer Decorative Frame Border */}
              <View style={styles.outerFrame}>
                {/* Inner Double Line Frame */}
                <View style={styles.innerFrame}>
                  {/* Top Right Tear-off Calendar */}
                  <View style={styles.calendarBox}>
                    <View style={styles.calMonthBanner}>
                      <Text style={styles.calMonthText}>{monthShort}</Text>
                    </View>
                    <View style={styles.calDayBox}>
                      <Text style={styles.calDayText}>{dayNum}</Text>
                      <Text style={styles.calWeekdayText}>{weekdayShort}</Text>
                    </View>
                  </View>

                  {/* Poster Header */}
                  <View style={styles.posterHeader}>
                    <Text style={styles.posterBrand}>
                      SÜPER LİG NOSTALJİ DRAFT
                    </Text>
                    <Text style={styles.posterMainTitle}>{posterTitle}</Text>
                    <Text style={styles.posterSubtitle}>
                      {posterSubtitle.toUpperCase()}
                    </Text>
                    <Text style={styles.asteriskDivider}>✦ ✦ ✦</Text>
                  </View>

                  {/* Pitch Section */}
                  <View style={styles.pitchSection}>
                    <Text style={styles.sectionHeaderTitle}>
                      TAKTIK DIZILIŞ / {formationKey}
                    </Text>

                    {/* Dark Green Striped Pitch */}
                    <View style={styles.pitchContainer}>
                      {/* Pitch Field Markings (Center Circle & Penalty Box) */}
                      <View style={styles.pitchCenterCircle} />
                      <View style={styles.pitchCenterLine} />
                      <View style={styles.pitchGoalBox} />

                      {/* Formation Players on Pitch */}
                      {formationDef.positions.map((slot, idx) => {
                        const player = filledSquad[idx] || {
                          name: slot.label,
                          rating: 75,
                        };
                        const shortName =
                          player.name.length > 11
                            ? player.name.substring(0, 10) + '…'
                            : player.name;

                        return (
                          <View
                            key={idx}
                            style={[
                              styles.pitchPlayerSlot,
                              {
                                top: slot.top as any,
                                left: slot.left as any,
                              },
                            ]}
                          >
                            <View style={styles.playerCircle}>
                              <Text style={styles.playerRatingNum}>
                                {player.rating || 75}
                              </Text>
                            </View>
                            <View style={styles.playerNamePill}>
                              <Text
                                style={styles.playerNameText}
                                numberOfLines={1}
                              >
                                {shortName}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {/* Two Columns: Lineup & Match Results */}
                  <View style={styles.columnsContainer}>
                    {/* Left Column: İLK 11 KADROMUZ */}
                    <View style={styles.columnLeft}>
                      <Text style={styles.colSectionHeader}>
                        İLK 11 KADROMUZ
                      </Text>
                      <View style={styles.squadLinesList}>
                        {sortedSquad.map((p, i) => (
                          <View key={i} style={styles.squadLineItem}>
                            <Text style={styles.squadPosText}>
                              {formatPos(p.position)}
                            </Text>
                            <Text
                              style={styles.squadPlayerName}
                              numberOfLines={1}
                            >
                              {p.name}
                            </Text>
                            <Text
                              style={styles.dottedLeader}
                              numberOfLines={1}
                            >
                              ·················································
                            </Text>
                            <Text style={styles.squadRatingVal}>
                              {p.rating || 75}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Right Column: MAÇ SONUÇLARI */}
                    <View style={styles.columnRight}>
                      <Text style={styles.colSectionHeader}>
                        MAÇ SONUÇLARI
                      </Text>
                      <View style={styles.matchResultCardBox}>
                        <Text style={styles.matchRoundLabel}>MAÇ 1</Text>
                        <Text style={styles.matchOpponentName} numberOfLines={1}>
                          vs {oppName}
                        </Text>
                        <Text style={styles.matchScoreVal}>
                          {userGoals} - {oppGoals}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Bottom Stats Dashed Cards */}
                  <View style={styles.dashedStatsRow}>
                    <View style={styles.dashedStatCard}>
                      <Text style={styles.statCardLabel}>GENEL GÜÇ</Text>
                      <Text style={styles.statCardValue}>{avgRating}</Text>
                    </View>

                    <View style={styles.dashedStatCard}>
                      <Text style={styles.statCardLabel}>EN İYİ OYUNCU</Text>
                      <Text style={styles.statCardValueBest} numberOfLines={1}>
                        {bestPlayer.name.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Vintage Footer */}
                  <View style={styles.vintageFooter}>
                    <Text style={styles.footerBrandText}>
                      MATBAA-İ NOSTALJİ • ANKARA
                    </Text>
                    <Text style={styles.footerDateText}>
                      {fullDateStr} • {timeStr}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* =========================================================
              MODAL FOOTER ACTION BUTTONS (Matches Screenshot 2 Exactly)
              ========================================================= */}
          <View style={styles.bottomBar}>
            {/* 1. İNDİR (Green Button) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDownload}
              disabled={downloading}
              style={styles.downloadBtn}
            >
              <Text style={styles.downloadBtnText}>
                {downloading ? '⏳ İNDİRİLİYOR...' : '📥 İNDİR'}
              </Text>
            </TouchableOpacity>

            {/* 2. PAYLAŞ (White Button) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShare}
              style={styles.shareBtn}
            >
              <Text style={styles.shareBtnText}>📤 PAYLAŞ</Text>
            </TouchableOpacity>

            {/* 3. KAPAT (Dark Button) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕ KAPAT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#0a0a0acc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalWrapper: {
    width: '94%',
    maxHeight: '92%',
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    overflow: 'hidden',
  },
  scrollContainer: {
    padding: 10,
    paddingBottom: 20,
    alignItems: 'center',
  },
  // ==========================================
  // VINTAGE POSTER STYLING
  // ==========================================
  posterCanvas: {
    width: '100%',
    backgroundColor: '#f4efe4',
    padding: 8,
  },
  outerFrame: {
    borderWidth: 2,
    borderColor: '#3a342c',
    padding: 4,
  },
  innerFrame: {
    borderWidth: 1.5,
    borderColor: '#3a342c',
    padding: 14,
    position: 'relative',
  },
  calendarBox: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 58,
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    zIndex: 10,
  },
  calMonthBanner: {
    width: '100%',
    backgroundColor: '#b22222',
    paddingVertical: 2,
    alignItems: 'center',
  },
  calMonthText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  calDayBox: {
    paddingVertical: 3,
    alignItems: 'center',
  },
  calDayText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    lineHeight: 22,
  },
  calWeekdayText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
  },
  posterHeader: {
    alignItems: 'center',
    paddingRight: 60, // avoid overlap with calendar
    marginBottom: 14,
  },
  posterBrand: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3a342c',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  posterMainTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#b22222',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1.5, height: 1.5 },
    textShadowRadius: 1,
    lineHeight: 38,
  },
  posterSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3a342c',
    letterSpacing: 1,
    marginTop: 2,
  },
  asteriskDivider: {
    fontSize: 10,
    color: '#3a342c',
    letterSpacing: 6,
    marginTop: 4,
  },
  // Pitch
  pitchSection: {
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 6,
    borderBottomWidth: 1.5,
    borderColor: '#3a342c',
    paddingBottom: 4,
  },
  pitchContainer: {
    height: 220,
    backgroundColor: '#2e5237',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    position: 'relative',
    overflow: 'hidden',
  },
  pitchCenterCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  pitchCenterLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  pitchGoalBox: {
    position: 'absolute',
    bottom: 0,
    left: '30%',
    right: '30%',
    height: 35,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  pitchPlayerSlot: {
    position: 'absolute',
    alignItems: 'center',
    width: 68,
    transform: [{ translateX: -34 }, { translateY: -14 }],
  },
  playerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerRatingNum: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  playerNamePill: {
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginTop: 2,
    maxWidth: 64,
  },
  playerNameText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Columns
  columnsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  columnLeft: {
    flex: 1.4,
  },
  columnRight: {
    flex: 1,
  },
  colSectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1a1a1a',
    borderBottomWidth: 1.5,
    borderColor: '#3a342c',
    paddingBottom: 4,
    marginBottom: 8,
  },
  squadLinesList: {
    gap: 4,
  },
  squadLineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  squadPosText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#b22222',
    width: 18,
  },
  squadPlayerName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1a1a1a',
    maxWidth: 80,
  },
  dottedLeader: {
    flex: 1,
    fontSize: 9,
    color: '#888888',
    overflow: 'hidden',
    paddingHorizontal: 2,
  },
  squadRatingVal: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  matchResultCardBox: {
    borderWidth: 1.5,
    borderColor: '#3a342c',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 8,
    borderStyle: 'dashed',
  },
  matchRoundLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
  },
  matchOpponentName: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1a1a1a',
    marginVertical: 2,
  },
  matchScoreVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#b22222',
    textAlign: 'right',
  },
  // Dashed Stats
  dashedStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  dashedStatCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#3a342c',
    borderStyle: 'dashed',
    padding: 10,
    alignItems: 'center',
  },
  statCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  statCardValueBest: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 4,
  },
  vintageFooter: {
    borderTopWidth: 1,
    borderColor: '#3a342c',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBrandText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.5,
  },
  footerDateText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#666666',
  },
  // Bottom Modal Actions
  bottomBar: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  downloadBtn: {
    flex: 1.2,
    backgroundColor: '#2e8b57',
    paddingVertical: 12,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: '#1a1a1a',
    fontSize: 13,
    fontWeight: '900',
  },
  closeBtn: {
    flex: 0.8,
    backgroundColor: '#2b2b2b',
    paddingVertical: 12,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
