import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Shadows } from '../theme/colors';
import { RetroHeader } from '../components/RetroHeader';
import { RetroButton } from '../components/RetroButton';
import {
  TycoonClub,
  Building,
  createInitialTycoonClub,
  upgradeBuilding,
  calculateFinances,
  playTycoonMatchday,
} from '../game/tycoonEngine';
import { fetchTycoonPlayers, Player } from '../services/api';

interface TycoonScreenProps {
  navigation: any;
}

export const TycoonScreen: React.FC<TycoonScreenProps> = ({ navigation }) => {
  const [club, setClub] = useState<TycoonClub | null>(null);
  const [activeTab, setActiveTab] = useState<'campus' | 'squad' | 'market' | 'match'>('campus');
  const [transferMarket, setTransferMarket] = useState<Player[]>([]);
  const [loadingMarket, setLoadingMarket] = useState<boolean>(false);

  useEffect(() => {
    initClub();
  }, []);

  const initClub = async () => {
    try {
      const saved = await AsyncStorage.getItem('@SLD_TYCOON_CLUB');
      if (saved) {
        setClub(JSON.parse(saved));
      } else {
        const initial = createInitialTycoonClub('Anadolu Kaplanları');
        setClub(initial);
        saveClub(initial);
      }
    } catch {
      const initial = createInitialTycoonClub('Anadolu Kaplanları');
      setClub(initial);
    }
  };

  const saveClub = async (c: TycoonClub) => {
    try {
      await AsyncStorage.setItem('@SLD_TYCOON_CLUB', JSON.stringify(c));
    } catch {
      // ignore
    }
  };

  const loadMarket = async () => {
    setLoadingMarket(true);
    try {
      const players = await fetchTycoonPlayers();
      setTransferMarket(players.slice(0, 8));
    } catch {
      // quiet fallback
    } finally {
      setLoadingMarket(false);
    }
  };

  const handleUpgrade = (buildingId: string) => {
    if (!club) return;
    const result = upgradeBuilding(club, buildingId);
    if (!result.success) {
      Alert.alert('Geliştirilemedi', result.error);
      return;
    }
    setClub({ ...club });
    saveClub(club);
    Alert.alert('Tebrikler!', 'Tesis başarıyla seviye atladı!');
  };

  const handleBuyPlayer = (player: Player, price: number) => {
    if (!club) return;
    if (club.budget < price) {
      Alert.alert('Bütçe Yetersiz', 'Bu oyuncuyu almak için kasanızda yeterli para yok.');
      return;
    }
    club.budget -= price;
    club.squad.push(player);
    setClub({ ...club });
    saveClub(club);
    Alert.alert('Transfer Başarılı!', `${player.name} kadroya katıldı!`);
  };

  const handleMatchday = () => {
    if (!club) return;
    const matchRes = playTycoonMatchday(club);
    setClub({ ...club });
    saveClub(club);

    Alert.alert(
      'Maç Günü Tamamlandı! ⚽',
      `Skor: ${matchRes.homeScore} - ${matchRes.awayScore}\n` +
      `Bilet Geliri: +₺${matchRes.gateRevenue.toLocaleString('tr-TR')}\n` +
      `Haftalık Net Kazanç: ₺${matchRes.netWeeklyIncome.toLocaleString('tr-TR')}`,
    );
  };

  if (!club) return null;

  const finances = calculateFinances(club);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader
        title="KULÜP TYCOON"
        subtitle={`${club.name} • HAFTA ${club.week}`}
        showBack
        onBack={() => navigation.navigate('MainMenu')}
        rightAction={{
          icon: '⚽',
          label: 'MAÇ GÜNÜ',
          onPress: handleMatchday,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Financial Status Bar */}
        <View style={[styles.financeCard, Shadows.brutal]}>
          <View style={styles.financeCol}>
            <Text style={styles.financeLabel}>KASA BÜTÇESİ</Text>
            <Text style={styles.financeBudget}>
              ₺{club.budget.toLocaleString('tr-TR')}
            </Text>
          </View>

          <View style={styles.financeDivider} />

          <View style={styles.financeCol}>
            <Text style={styles.financeLabel}>HAFTALIK NET</Text>
            <Text
              style={[
                styles.financeNet,
                { color: finances.weeklyNet >= 0 ? Colors.accentGreen : Colors.accentRed },
              ]}
            >
              {finances.weeklyNet >= 0 ? '+' : ''}₺
              {finances.weeklyNet.toLocaleString('tr-TR')}
            </Text>
          </View>

          <View style={styles.financeDivider} />

          <View style={styles.financeCol}>
            <Text style={styles.financeLabel}>TARAFTAR</Text>
            <Text style={styles.financeFans}>
              {club.fanCount.toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'campus' && styles.tabBtnActive]}
            onPress={() => setActiveTab('campus')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'campus' && styles.tabTextActive,
              ]}
            >
              🏛️ KAMPÜS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'squad' && styles.tabBtnActive]}
            onPress={() => setActiveTab('squad')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'squad' && styles.tabTextActive,
              ]}
            >
              👥 KADRO ({club.squad.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'market' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('market');
              if (transferMarket.length === 0) loadMarket();
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'market' && styles.tabTextActive,
              ]}
            >
              🛒 PAZAR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Campus Buildings */}
        {activeTab === 'campus' && (
          <View style={styles.buildingsList}>
            {club.buildings.map(b => (
              <View key={b.id} style={[styles.buildingCard, Shadows.brutalSm]}>
                <View style={styles.buildingHeader}>
                  <Text style={styles.buildingIcon}>{b.icon}</Text>
                  <View style={styles.buildingInfo}>
                    <Text style={styles.buildingName}>{b.name}</Text>
                    <Text style={styles.buildingDesc}>{b.description}</Text>
                    <Text style={styles.buildingLevel}>
                      Seviye: {b.level} / {b.maxLevel} • Gelir: +₺{b.revenuePerWeek}/hf
                    </Text>
                  </View>
                </View>

                <View style={styles.buildingAction}>
                  {b.level < b.maxLevel ? (
                    <RetroButton
                      title={`GELİŞTİR (₺${b.costToUpgrade.toLocaleString('tr-TR')})`}
                      variant="gold"
                      size="sm"
                      disabled={club.budget < b.costToUpgrade}
                      onPress={() => handleUpgrade(b.id)}
                    />
                  ) : (
                    <View style={styles.maxBadge}>
                      <Text style={styles.maxText}>MAKSİMUM SEVİYE</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab 2: Squad */}
        {activeTab === 'squad' && (
          <View style={styles.squadList}>
            {club.squad.length === 0 ? (
              <View style={[styles.emptyCard, Shadows.brutalSm]}>
                <Text style={styles.emptyTitle}>Henüz Transfer Yapmadın</Text>
                <Text style={styles.emptySubtitle}>
                  Pazar sekmesinden efsane oyuncuları kadrona dahil edebilirsin!
                </Text>
              </View>
            ) : (
              club.squad.map((p, idx) => (
                <View key={idx} style={[styles.playerItem, Shadows.brutalSm]}>
                  <View style={styles.playerPosTag}>
                    <Text style={styles.playerPosText}>{p.position || 'OYK'}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{p.name}</Text>
                    <Text style={styles.playerClub}>{p.club}</Text>
                  </View>
                  <View style={styles.playerRatingTag}>
                    <Text style={styles.playerRatingText}>{p.rating || 75}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Tab 3: Transfer Market */}
        {activeTab === 'market' && (
          <View style={styles.marketList}>
            <Text style={styles.marketNotice}>
              Her hafta yeni nostalji transfer fırsatları sunulur.
            </Text>
            {transferMarket.map((p, idx) => {
              const price = (p.rating || 75) * 12000;
              const alreadyOwned = club.squad.some(s => s.name === p.name);

              return (
                <View key={idx} style={[styles.marketItem, Shadows.brutalSm]}>
                  <View style={styles.playerPosTag}>
                    <Text style={styles.playerPosText}>{p.position || 'OYK'}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{p.name}</Text>
                    <Text style={styles.playerClub}>
                      {p.club} • Güç: {p.rating}
                    </Text>
                  </View>
                  <View style={styles.marketAction}>
                    {alreadyOwned ? (
                      <Text style={styles.ownedText}>KADRODA</Text>
                    ) : (
                      <RetroButton
                        title={`AL (₺${price.toLocaleString('tr-TR')})`}
                        variant="primary"
                        size="sm"
                        disabled={club.budget < price}
                        onPress={() => handleBuyPlayer(p, price)}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 32,
  },
  financeCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
  financeCol: {
    alignItems: 'center',
  },
  financeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  financeBudget: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  financeNet: {
    fontSize: 14,
    fontWeight: '900',
  },
  financeFans: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.accentBlue,
  },
  financeDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.cardBorder,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.inkBlack,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  buildingsList: {
    gap: 10,
  },
  buildingCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 12,
  },
  buildingHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  buildingIcon: {
    fontSize: 28,
  },
  buildingInfo: {
    flex: 1,
  },
  buildingName: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  buildingDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginVertical: 2,
  },
  buildingLevel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accentGreen,
  },
  buildingAction: {
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 8,
  },
  maxBadge: {
    backgroundColor: Colors.creamDark,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  maxText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.textMuted,
  },
  squadList: {
    gap: 8,
  },
  emptyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.inkBlack,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  playerItem: {
    backgroundColor: Colors.cardBg,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerPosTag: {
    backgroundColor: Colors.creamDark,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  playerPosText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  playerClub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  playerRatingTag: {
    backgroundColor: Colors.accentGold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  playerRatingText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  marketList: {
    gap: 8,
  },
  marketNotice: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  marketItem: {
    backgroundColor: Colors.cardBg,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marketAction: {
    minWidth: 110,
  },
  ownedText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.accentGreen,
    textAlign: 'center',
  },
});
