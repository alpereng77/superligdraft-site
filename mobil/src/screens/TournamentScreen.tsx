import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { RetroHeader } from '../components/RetroHeader';
import { fetchNostaljiDatabase } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TournamentScreenProps {
  navigation: any;
  route: any;
}

interface MatchTeam {
  team_name: string;
  year?: string;
  rating: number;
  isUser: boolean;
}

interface BracketMatch {
  id: string;
  team1: MatchTeam;
  team2: MatchTeam;
  score1: number | null;
  score2: number | null;
  winner: MatchTeam | null;
}

export const TournamentScreen: React.FC<TournamentScreenProps> = ({
  navigation,
  route,
}) => {
  const userSquad = route.params?.userSquad;
  const teamOvr = route.params?.teamOvr || 78;
  const formation = route.params?.formation || '4-4-2';

  // 0: Son 16, 1: Çeyrek, 2: Yarı Final, 3: Final
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [matches, setMatches] = useState<BracketMatch[][]>([[], [], [], []]);
  const [champion, setChampion] = useState<MatchTeam | null>(null);

  useEffect(() => {
    initBracket();
  }, []);

  // Handle return from match
  useEffect(() => {
    const matchResult = route.params?.completedResult;
    if (matchResult) {
      handleMatchResult(matchResult);
    }
  }, [route.params?.completedResult]);

  const initBracket = async () => {
    const userTeam: MatchTeam = {
      team_name: 'Senin Kadron',
      rating: teamOvr,
      isUser: true,
    };

    // 15 realistic historical teams
    const defaultOpponents: MatchTeam[] = [
      { team_name: 'Galatasaray SK', year: '2005', rating: 84, isUser: false },
      { team_name: 'Bursaspor', year: '2009', rating: 82, isUser: false },
      { team_name: 'Denizlispor', year: '2006', rating: 78, isUser: false },
      { team_name: 'Antalyaspor', year: '2018', rating: 77, isUser: false },
      { team_name: 'İstanbulspor', year: '2004', rating: 76, isUser: false },
      { team_name: 'Sivasspor', year: '2015', rating: 81, isUser: false },
      { team_name: 'Gençlerbirliği SK', year: '2008', rating: 80, isUser: false },
      { team_name: 'Fenerbahçe SK', year: '2019', rating: 85, isUser: false },
      { team_name: 'Kasımpaşa', year: '2024', rating: 79, isUser: false },
      { team_name: 'Sivasspor', year: '2009', rating: 81, isUser: false },
      { team_name: 'Antalyaspor', year: '2011', rating: 78, isUser: false },
      { team_name: 'Kayseri Erciyesspor', year: '2006', rating: 76, isUser: false },
      { team_name: 'Bucaspor', year: '2010', rating: 75, isUser: false },
      { team_name: 'Kasımpaşa', year: '2007', rating: 77, isUser: false },
      { team_name: 'Orduspor', year: '2011', rating: 76, isUser: false },
    ];

    const round16Teams = [userTeam, ...defaultOpponents];
    const r0: BracketMatch[] = [];

    for (let i = 0; i < 8; i++) {
      r0.push({
        id: `r0-m${i}`,
        team1: round16Teams[2 * i],
        team2: round16Teams[2 * i + 1],
        score1: null,
        score2: null,
        winner: null,
      });
    }

    setMatches([r0, [], [], []]);
    setCurrentRound(0);
    setSelectedTab(0);
  };

  const handleMatchResult = (result: any) => {
    // result contains { userWon: boolean, homeScore: number, awayScore: number }
    const updated = [...matches];
    const currentList = updated[currentRound];
    const userMatchIndex = currentList.findIndex(m => m.team1.isUser || m.team2.isUser);

    if (userMatchIndex !== -1) {
      const uMatch = currentList[userMatchIndex];
      uMatch.score1 = result.homeScore;
      uMatch.score2 = result.awayScore;
      uMatch.winner = result.userWon ? uMatch.team1 : uMatch.team2;
    }

    // Simulate other AI matches in this round
    currentList.forEach(m => {
      if (!m.winner) {
        const homeWins = Math.random() > 0.48;
        m.score1 = homeWins ? 2 : 1;
        m.score2 = homeWins ? 1 : 2;
        m.winner = homeWins ? m.team1 : m.team2;
      }
    });

    // Advance to next round if user won
    if (result.userWon) {
      if (currentRound === 3) {
        // Champion!
        setChampion(currentList[0].winner);
      } else {
        const nextRoundIndex = currentRound + 1;
        const winners = currentList.map(m => m.winner!);
        const nextMatches: BracketMatch[] = [];

        for (let i = 0; i < winners.length / 2; i++) {
          nextMatches.push({
            id: `r${nextRoundIndex}-m${i}`,
            team1: winners[2 * i],
            team2: winners[2 * i + 1],
            score1: null,
            score2: null,
            winner: null,
          });
        }

        updated[nextRoundIndex] = nextMatches;
        setCurrentRound(nextRoundIndex);
        setSelectedTab(nextRoundIndex);
      }
    }

    setMatches(updated);
  };

  const handlePlayCurrentRound = () => {
    const currentList = matches[currentRound] || [];
    const userMatch = currentList.find(m => m.team1.isUser || m.team2.isUser);
    if (!userMatch) return;

    const opponent = userMatch.team1.isUser ? userMatch.team2 : userMatch.team1;

    navigation.navigate('Simulation', {
      homeTeam: {
        name: 'SENİN TAKIMIN',
        rating: teamOvr,
        squad: userSquad,
      },
      awayTeam: {
        name: opponent.team_name,
        year: opponent.year,
        rating: opponent.rating,
      },
      roundName: roundLabels[currentRound],
      roundIndex: currentRound,
    });
  };

  const roundLabels = ['SON 16', 'ÇEYREK FİNAL', 'YARI FİNAL', 'FİNAL'];
  const actionButtonLabels = [
    'SON 16 MAÇINI OYNA ▶',
    'ÇEYREK FİNAL MAÇINI OYNA ▶',
    'YARI FİNAL MAÇINI OYNA ▶',
    'FİNAL MAÇINI OYNA ▶',
  ];

  const displayedMatches = matches[selectedTab] || [];
  const expectedCount = [8, 4, 2, 1][selectedTab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader
        title="DRAFT TURNUVASI"
        subtitle="16 TAKIMLI ELEME AĞACI"
        showBack
        onBack={() => navigation.navigate('MainMenu')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.mainTitle}>SÜPER LİG NOSTALJİ DRAFT TURNUVASI</Text>
          <Text style={styles.subDesc}>
            16 takımlı eliminasyon turnuvası. Kupayı kaldırmak için 4 maçı da kazanmalısın!
          </Text>
        </View>

        {/* Round Tabs (SON 16, ÇEYREK FİNAL, YARI FİNAL, FİNAL, ŞAMPİYON) */}
        <View style={styles.tabsRow}>
          {roundLabels.map((label, idx) => (
            <TouchableOpacity
              key={label}
              onPress={() => setSelectedTab(idx)}
              style={[
                styles.tabPill,
                selectedTab === idx && styles.tabPillActive,
                currentRound === idx && styles.tabPillCurrent,
              ]}
            >
              <Text
                style={[
                  styles.tabPillText,
                  selectedTab === idx && styles.tabPillTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Matches List for the Selected Round */}
        <View style={styles.matchesContainer}>
          {Array.from({ length: expectedCount }).map((_, i) => {
            const m = displayedMatches[i];

            if (m) {
              const isUserMatch = m.team1.isUser || m.team2.isUser;
              return (
                <View
                  key={m.id || i}
                  style={[
                    styles.matchCard,
                    isUserMatch && styles.userMatchHighlight,
                  ]}
                >
                  {/* Team 1 */}
                  <View style={styles.teamRow}>
                    <Text
                      style={[
                        styles.teamNameText,
                        m.team1.isUser && styles.userTeamText,
                        m.winner === m.team1 && styles.winnerText,
                      ]}
                      numberOfLines={1}
                    >
                      {m.team1.team_name} {m.team1.year ? `(${m.team1.year})` : ''}
                    </Text>
                    <View style={styles.scoreBox}>
                      <Text style={styles.scoreDigit}>
                        {m.score1 !== null ? m.score1 : '-'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.matchDivider} />

                  {/* Team 2 */}
                  <View style={styles.teamRow}>
                    <Text
                      style={[
                        styles.teamNameText,
                        m.team2.isUser && styles.userTeamText,
                        m.winner === m.team2 && styles.winnerText,
                      ]}
                      numberOfLines={1}
                    >
                      {m.team2.team_name} {m.team2.year ? `(${m.team2.year})` : ''}
                    </Text>
                    <View style={styles.scoreBox}>
                      <Text style={styles.scoreDigit}>
                        {m.score2 !== null ? m.score2 : '-'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }

            // Future round placeholder (Belli Değil)
            return (
              <View key={`placeholder-${i}`} style={styles.matchCardPlaceholder}>
                <View style={styles.teamRow}>
                  <Text style={styles.placeholderText}>Belli Değil</Text>
                  <View style={styles.scoreBox}>
                    <Text style={styles.scoreDigit}>-</Text>
                  </View>
                </View>
                <View style={styles.matchDivider} />
                <View style={styles.teamRow}>
                  <Text style={styles.placeholderText}>Belli Değil</Text>
                  <View style={styles.scoreBox}>
                    <Text style={styles.scoreDigit}>-</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Big Bottom Action Button: SON 16 MAÇINI OYNA ▶ */}
        {!champion && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePlayCurrentRound}
            style={styles.actionPlayBtn}
          >
            <Text style={styles.actionPlayBtnText}>
              {actionButtonLabels[currentRound]}
            </Text>
          </TouchableOpacity>
        )}

        {champion && (
          <View style={styles.championBox}>
            <Text style={styles.championIcon}>🏆</Text>
            <Text style={styles.championTitle}>ŞAMPİYON</Text>
            <Text style={styles.championName}>{champion.team_name}</Text>
          </View>
        )}
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
    gap: 14,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subDesc: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  tabPill: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabPillActive: {
    backgroundColor: '#1a1a1a',
  },
  tabPillCurrent: {
    borderBottomWidth: 3,
    borderBottomColor: '#e05638',
  },
  tabPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  tabPillTextActive: {
    color: '#ffffff',
  },
  matchesContainer: {
    gap: 10,
  },
  matchCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    padding: 10,
  },
  userMatchHighlight: {
    borderColor: '#e05638',
    borderWidth: 2.5,
    backgroundColor: '#fffdf5',
  },
  matchCardPlaceholder: {
    backgroundColor: '#faf7f2',
    borderWidth: 1.5,
    borderColor: '#d0c8be',
    padding: 10,
    opacity: 0.7,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  teamNameText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  userTeamText: {
    color: '#e05638',
    fontWeight: '900',
  },
  winnerText: {
    color: '#3b9966',
    fontWeight: '900',
  },
  scoreBox: {
    backgroundColor: '#ede9e1',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scoreDigit: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  matchDivider: {
    height: 1,
    backgroundColor: '#e8e2d8',
    marginVertical: 4,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a0988c',
  },
  actionPlayBtn: {
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
    marginTop: 6,
  },
  actionPlayBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  championBox: {
    backgroundColor: '#fff9db',
    borderWidth: 2.5,
    borderColor: '#d4af37',
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  championIcon: {
    fontSize: 36,
  },
  championTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#8a6a12',
    letterSpacing: 1,
    marginTop: 4,
  },
  championName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    marginTop: 2,
  },
});
