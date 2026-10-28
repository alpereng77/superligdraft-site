import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Svg, { Rect, Circle, Line } from 'react-native-svg';
import { RetroHeader } from '../components/RetroHeader';
import {
  fetchNostaljiDatabase,
  rollRandomTeam,
  NostaljiDatabase,
  NostaljiPlayer,
} from '../services/api';
import { FORMATIONS } from '../game/formationConfigs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PITCH_WIDTH = SCREEN_WIDTH - 32;
const PITCH_HEIGHT = PITCH_WIDTH * 1.35;

interface DraftScreenProps {
  navigation: any;
  route: any;
}

export const DraftScreen: React.FC<DraftScreenProps> = ({ navigation, route }) => {
  const formationCode = route.params?.formation || '4-4-2';
  const mode = route.params?.mode || 'tournament';

  const [database, setDatabase] = useState<NostaljiDatabase | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Rolled team state
  const [rolledTeam, setRolledTeam] = useState<{
    year: string;
    team_name: string;
    players: NostaljiPlayer[];
  } | null>(null);

  // Player selection & pitch slots
  const [selectedPlayerToPlace, setSelectedPlayerToPlace] = useState<NostaljiPlayer | null>(null);
  const [draftedPlayers, setDraftedPlayers] = useState<(NostaljiPlayer | null)[]>(
    Array(11).fill(null),
  );

  // Position filter for player list: 'ALL' | 'GK' | 'DF' | 'MF' | 'FW'
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<'rating-desc' | 'rating-asc' | 'name-asc'>('rating-desc');
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Scroll view reference to scroll up/down automatically
  const mainScrollRef = useRef<any>(null);

  const currentFormation = FORMATIONS[formationCode] || FORMATIONS['4-4-2'];

  useEffect(() => {
    initDb();
  }, []);

  const initDb = async () => {
    try {
      const db = await fetchNostaljiDatabase();
      setDatabase(db);
    } catch {
      Alert.alert('Hata', 'Veri seti yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRollTeam = () => {
    if (!database || Object.keys(database).length === 0) return;
    if (rolledTeam !== null) {
      Alert.alert(
        'Kural',
        'Zar atmadan önce lütfen mevcut takımdan bir oyuncuyu seçip sahadaki boş mevkisine yerleştirin!',
      );
      return;
    }

    setIsRolling(true);
    setSelectedPlayerToPlace(null);

    setTimeout(() => {
      const team = rollRandomTeam(database);
      setRolledTeam(team);
      setPosFilter('ALL');
      setIsRolling(false);
    }, 500);
  };

  const handleSelectPlayer = (player: NostaljiPlayer) => {
    const hasCompatibleSlot = currentFormation.positions.some(
      (slot, idx) => slot.type === player.position && draftedPlayers[idx] === null,
    );

    if (!hasCompatibleSlot) {
      Alert.alert(
        'Uyarı',
        `Sahada boş ${getDisplayPos(player.position)} mevkisi kalmadığı için bu oyuncuyu seçemezsiniz!`,
      );
      return;
    }

    setSelectedPlayerToPlace(player);

    // Scroll smoothly to pitch so user sees highlighted slots
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({ y: 320, animated: true });
    }, 120);
  };

  const handleSlotPress = (slotIndex: number) => {
    if (!selectedPlayerToPlace) {
      if (draftedPlayers[slotIndex] !== null) {
        return;
      }
      Alert.alert('Bilgi', 'Önce yukarıdaki listeden yerleştirmek istediğiniz oyuncuyu seçin.');
      return;
    }

    const slot = currentFormation.positions[slotIndex];
    if (slot.type !== selectedPlayerToPlace.position) {
      Alert.alert(
        'Mevki Uyuşmazlığı',
        `Bu yuva ${getDisplayPos(slot.type)} mevkisi içindir. Seçtiğiniz oyuncu: ${getDisplayPos(selectedPlayerToPlace.position)}.`,
      );
      return;
    }

    // Successfully place player in slot
    const updated = [...draftedPlayers];
    updated[slotIndex] = selectedPlayerToPlace;
    setDraftedPlayers(updated);

    // Reset rolled team and selection so user can roll the next team once only
    setSelectedPlayerToPlace(null);
    setRolledTeam(null);

    // AUTOMATICALLY SCROLL BACK TO THE VERY TOP OF THE PAGE
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 180);
  };

  const getDisplayPos = (type: string) => {
    switch (type) {
      case 'GK':
        return 'KL';
      case 'DF':
        return 'DF';
      case 'MF':
        return 'OS';
      case 'FW':
        return 'FV';
      default:
        return type;
    }
  };

  // Filtered & sorted player list
  const getFilteredPlayers = () => {
    if (!rolledTeam) return [];
    let list = [...rolledTeam.players];

    if (posFilter !== 'ALL') {
      list = list.filter(p => p.position === posFilter);
    }

    if (sortOption === 'rating-desc') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortOption === 'rating-asc') {
      list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    } else if (sortOption === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    }

    return list;
  };

  // Stats calculation
  const filledCount = draftedPlayers.filter(p => p !== null).length;
  const isComplete = filledCount === 11;

  const validPlayers = draftedPlayers.filter((p): p is NostaljiPlayer => p !== null);
  const teamOvr = validPlayers.length > 0
    ? Math.round(validPlayers.reduce((acc, p) => acc + (p.rating || 75), 0) / validPlayers.length)
    : 75;

  const fwMf = validPlayers.filter(p => ['FW', 'MF'].includes(p.position));
  const teamAtk = fwMf.length > 0
    ? Math.round(fwMf.reduce((acc, p) => acc + (p.rating || 75), 0) / fwMf.length)
    : teamOvr;

  const dfGk = validPlayers.filter(p => ['GK', 'DF'].includes(p.position));
  const teamDef = dfGk.length > 0
    ? Math.round(dfGk.reduce((acc, p) => acc + (p.rating || 75), 0) / dfGk.length)
    : teamOvr;

  const handleStartTournament = () => {
    if (!isComplete) {
      Alert.alert('Kadro Eksik', '11 oyuncuyu da seçmeden turnuvaya başlayamazsınız.');
      return;
    }

    navigation.navigate('Tournament', {
      userSquad: draftedPlayers,
      teamOvr,
      teamAtk,
      teamDef,
      formation: formationCode,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader
        title="DRAFT ODASI"
        subtitle={`FORMASYON: ${formationCode}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        ref={mainScrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PANEL 1: KADRO TAMAMLANDI KARTI VEYA ÇEKİLEN TAKIM (Drawn Team Card) */}
        {isComplete ? (
          <View style={[styles.panelCard, styles.completeCard]}>
            <Text style={styles.completeTitle}>🏆 KADRO TAMAMLANDI!</Text>
            <Text style={styles.completeDesc}>
              11 efsanevi oyuncu başarıyla sahaya yerleştirildi. Artık Türkiye Kupası
              son 16 eleme turuna hazırsın!
            </Text>

            <View style={styles.completeStatsRow}>
              <View style={styles.statPill}>
                <Text style={styles.statPillLabel}>GÜÇ</Text>
                <Text style={styles.statPillVal}>{teamOvr}</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statPillLabel}>HÜCUM</Text>
                <Text style={[styles.statPillVal, { color: '#e05638' }]}>{teamAtk}</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statPillLabel}>SAVUNMA</Text>
                <Text style={[styles.statPillVal, { color: '#1a1a1a' }]}>{teamDef}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleStartTournament}
              style={styles.actionTournamentBtn}
            >
              <Text style={styles.actionTournamentText}>
                TURNUVAYI BAŞLAT ➔
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.panelCard}>
            <Text style={styles.panelHeader}>ÇEKİLEN TAKIM</Text>

            <View style={styles.teamBanner}>
              <Text style={styles.teamName}>
                {rolledTeam ? rolledTeam.team_name : 'Zar Atışı Bekleniyor'}
              </Text>
              <Text style={styles.seasonText}>
                {rolledTeam
                  ? `${rolledTeam.year}-${parseInt(rolledTeam.year, 10) + 1} Sezonu`
                  : 'Rastgele Süper Lig Takımı'}
              </Text>
            </View>

            <Text style={styles.rerollNotice}>
              {rolledTeam
                ? 'Aşağıdaki oyuncu listesinden birini seçip sahaya yerleştirin:'
                : 'Yeni bir tarihi takım getirmek için zarı atın:'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRollTeam}
              disabled={isRolling || loading || rolledTeam !== null}
              style={[
                styles.rollBtn,
                rolledTeam !== null && styles.rollBtnDisabled,
              ]}
            >
              {isRolling ? (
                <ActivityIndicator size="small" color="#1a1a1a" />
              ) : (
                <Text style={styles.rollBtnText}>
                  {rolledTeam !== null
                    ? '✓ TAKIM ÇEKİLDİ (OYUNCU YERLEŞTİRİN)'
                    : '🔄 YENİ TAKIM ÇEK'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* PANEL 2: OYUNCU SEÇİN (Player Selection Box - Scrollable & Compact) */}
        {!isComplete && rolledTeam && (
          <View style={[styles.panelCard, styles.playerSelectCard]}>
            <Text style={styles.panelHeader}>OYUNCU SEÇİN</Text>

            {/* Position filter tabs: TÜMÜ, KL, DF, OS, FV */}
            <View style={styles.filterTabsRow}>
              {[
                { label: 'TÜMÜ', key: 'ALL' },
                { label: 'KL', key: 'GK' },
                { label: 'DF', key: 'DF' },
                { label: 'OS', key: 'MF' },
                { label: 'FV', key: 'FW' },
              ].map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setPosFilter(tab.key)}
                  style={[
                    styles.filterTab,
                    posFilter === tab.key && styles.filterTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      posFilter === tab.key && styles.filterTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort row */}
            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sırala:</Text>
              <TouchableOpacity
                onPress={() =>
                  setSortOption(prev =>
                    prev === 'rating-desc' ? 'rating-asc' : 'rating-desc',
                  )
                }
                style={styles.sortBtn}
              >
                <Text style={styles.sortBtnText}>
                  Rating ({sortOption === 'rating-desc' ? 'Yüksek ➔ Düşük' : 'Düşük ➔ Yüksek'})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Players List with nested scrollable viewport */}
            <ScrollView
              nestedScrollEnabled
              style={styles.playersScrollArea}
              contentContainerStyle={styles.playersScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {getFilteredPlayers().map((p, idx) => {
                const isSelected = selectedPlayerToPlace?.name === p.name;
                const isHigh = (p.rating || 0) >= 90;

                return (
                  <TouchableOpacity
                    key={`${p.name}-${idx}`}
                    activeOpacity={0.8}
                    onPress={() => handleSelectPlayer(p)}
                    style={[
                      styles.playerRow,
                      isHigh && styles.playerRowHigh,
                      isSelected && styles.playerRowSelected,
                    ]}
                  >
                    <Text style={styles.rowPlayerName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.rowPlayerPos}>
                      {getDisplayPos(p.position)}
                    </Text>
                    <Text style={styles.rowPlayerRating}>{p.rating}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* PANEL 3: STRIPED FOOTBALL PITCH (Saha) */}
        <View style={styles.pitchOuter}>
          <View style={styles.pitchContainer}>
            {/* SVG Striped Grass & Pitch Markings */}
            <Svg
              width={PITCH_WIDTH}
              height={PITCH_HEIGHT}
              viewBox={`0 0 ${PITCH_WIDTH} ${PITCH_HEIGHT}`}
              style={StyleSheet.absoluteFill}
            >
              {/* Pitch Base */}
              <Rect
                x="0"
                y="0"
                width={PITCH_WIDTH}
                height={PITCH_HEIGHT}
                fill="#2d7a4d"
              />

              {/* Horizontal Stripes */}
              {Array.from({ length: 12 }).map((_, i) => (
                <Rect
                  key={i}
                  x="0"
                  y={(PITCH_HEIGHT / 12) * i}
                  width={PITCH_WIDTH}
                  height={PITCH_HEIGHT / 12}
                  fill={i % 2 === 0 ? '#338855' : '#2d7a4d'}
                />
              ))}

              {/* Outer White Boundary */}
              <Rect
                x="8"
                y="8"
                width={PITCH_WIDTH - 16}
                height={PITCH_HEIGHT - 16}
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="2"
              />

              {/* Halfway Line */}
              <Line
                x1="8"
                y1={PITCH_HEIGHT / 2}
                x2={PITCH_WIDTH - 8}
                y2={PITCH_HEIGHT / 2}
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="2"
              />

              {/* Center Circle */}
              <Circle
                cx={PITCH_WIDTH / 2}
                cy={PITCH_HEIGHT / 2}
                r={PITCH_WIDTH * 0.16}
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="2"
              />

              {/* Top Penalty Box */}
              <Rect
                x={PITCH_WIDTH * 0.22}
                y="8"
                width={PITCH_WIDTH * 0.56}
                height={PITCH_HEIGHT * 0.16}
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="2"
              />

              {/* Bottom Penalty Box */}
              <Rect
                x={PITCH_WIDTH * 0.22}
                y={PITCH_HEIGHT - 8 - PITCH_HEIGHT * 0.16}
                width={PITCH_WIDTH * 0.56}
                height={PITCH_HEIGHT * 0.16}
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="2"
              />
            </Svg>

            {/* 11 Position Slots */}
            {currentFormation.positions.map(slot => {
              const placedPlayer = draftedPlayers[slot.index];
              const isCompatible =
                selectedPlayerToPlace &&
                selectedPlayerToPlace.position === slot.type &&
                placedPlayer === null;

              const posX = (slot.x / 100) * PITCH_WIDTH - 24;
              const posY = (slot.y / 100) * PITCH_HEIGHT - 24;

              return (
                <TouchableOpacity
                  key={`slot-${slot.index}`}
                  activeOpacity={0.8}
                  onPress={() => handleSlotPress(slot.index)}
                  style={[
                    styles.pitchSlot,
                    { left: posX, top: posY },
                    isCompatible && styles.pitchSlotCompatible,
                    placedPlayer && styles.pitchSlotFilled,
                  ]}
                >
                  {placedPlayer ? (
                    <View style={styles.filledContent}>
                      <Text style={styles.placedRating}>{placedPlayer.rating}</Text>
                      <Text style={styles.placedSurname} numberOfLines={1}>
                        {placedPlayer.name.split(' ').pop()}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.slotRoleText}>
                      {getDisplayPos(slot.type)}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* PANEL 4: BOX SCORE & TEAM STATS (Right Panel) */}
        <View style={styles.panelCard}>
          <View style={styles.boxScoreHeader}>
            <Text style={styles.boxScoreTitle}>BOX SCORE</Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{filledCount} / 11</Text>
            </View>
          </View>

          {/* Stat Bars */}
          <View style={styles.statsBarsContainer}>
            {/* OVR */}
            <View style={styles.statBarGroup}>
              <View style={styles.statLabelRow}>
                <Text style={styles.statLabel}>TAKIM GÜCÜ (GENEL)</Text>
                <Text style={styles.statVal}>{teamOvr}</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${teamOvr}%`, backgroundColor: '#3b9966' },
                  ]}
                />
              </View>
            </View>

            {/* ATK */}
            <View style={styles.statBarGroup}>
              <View style={styles.statLabelRow}>
                <Text style={styles.statLabel}>SALDIRI (ATAQUE)</Text>
                <Text style={styles.statVal}>{teamAtk}</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${teamAtk}%`, backgroundColor: '#e05638' },
                  ]}
                />
              </View>
            </View>

            {/* DEF */}
            <View style={styles.statBarGroup}>
              <View style={styles.statLabelRow}>
                <Text style={styles.statLabel}>SAVUNMA (DEFESA)</Text>
                <Text style={styles.statVal}>{teamDef}</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${teamDef}%`, backgroundColor: '#1a1a1a' },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* PANEL 5: SEÇİLEN KADRO LİSTESİ */}
        <View style={styles.panelCard}>
          <Text style={styles.panelHeader}>SEÇİLEN KADRO LİSTESİ</Text>

          <View style={styles.boxScoreRows}>
            {currentFormation.positions.map(slot => {
              const p = draftedPlayers[slot.index];
              return (
                <View key={`row-${slot.index}`} style={styles.boxScoreRow}>
                  <Text style={styles.rowPos}>{getDisplayPos(slot.type)}</Text>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {p ? p.name : '—'}
                  </Text>
                  <Text style={styles.rowRating}>{p ? p.rating : ''}</Text>
                </View>
              );
            })}
          </View>
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
  panelCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 14,
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    overflow: 'hidden',
  },
  completeCard: {
    backgroundColor: '#fffdf0',
    borderColor: '#d4af37',
    borderWidth: 3,
  },
  completeTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 6,
  },
  completeDesc: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  completeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  statPillLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
  },
  statPillVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a1a1a',
    marginTop: 2,
  },
  playerSelectCard: {
    maxHeight: 330,
  },
  panelHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#666666',
    letterSpacing: 1,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 6,
    marginBottom: 10,
  },
  teamBanner: {
    backgroundColor: '#f5efe6',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  seasonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#e05638',
  },
  rerollNotice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 8,
  },
  rollBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 10,
    alignItems: 'center',
  },
  rollBtnDisabled: {
    backgroundColor: '#ede9e1',
    opacity: 0.8,
  },
  rollBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  filterTabsRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    marginBottom: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#1a1a1a',
  },
  filterTabActive: {
    backgroundColor: '#1a1a1a',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
  },
  sortBtn: {
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
  },
  sortBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  playersScrollArea: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#e8e2d8',
  },
  playersScrollContent: {
    gap: 4,
    padding: 2,
  },
  playerRow: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerRowHigh: {
    backgroundColor: '#fffdf0',
  },
  playerRowSelected: {
    backgroundColor: '#fff2cc',
    borderWidth: 2,
  },
  rowPlayerName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  rowPlayerPos: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    marginHorizontal: 8,
  },
  rowPlayerRating: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
    minWidth: 22,
    textAlign: 'right',
  },
  pitchOuter: {
    alignItems: 'center',
  },
  pitchContainer: {
    width: PITCH_WIDTH,
    height: PITCH_HEIGHT,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  pitchSlot: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pitchSlotCompatible: {
    backgroundColor: '#fff2cc',
    borderColor: '#1a1a1a',
    borderStyle: 'solid',
    borderWidth: 2.5,
    transform: [{ scale: 1.15 }],
  },
  pitchSlotFilled: {
    backgroundColor: '#fffbe6',
    borderColor: '#1a1a1a',
    borderStyle: 'solid',
    borderWidth: 2,
  },
  slotRoleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
  filledContent: {
    alignItems: 'center',
  },
  placedRating: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  placedSurname: {
    fontSize: 8,
    fontWeight: '800',
    color: '#333333',
    maxWidth: 42,
  },
  boxScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1a1a1a',
    paddingBottom: 6,
    marginBottom: 10,
  },
  boxScoreTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  badgeCount: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeCountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  statsBarsContainer: {
    gap: 8,
  },
  statBarGroup: {
    gap: 3,
  },
  statLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
  },
  statVal: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  barTrack: {
    height: 7,
    backgroundColor: '#e0dcd3',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  barFill: {
    height: '100%',
  },
  boxScoreRows: {
    gap: 3,
  },
  boxScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ede6',
  },
  rowPos: {
    width: 28,
    fontSize: 11,
    fontWeight: '900',
    color: '#666666',
  },
  rowName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#1a1a1a',
    paddingHorizontal: 6,
  },
  rowRating: {
    width: 28,
    fontSize: 11,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  actionTournamentBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  actionTournamentText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
