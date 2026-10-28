import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RetroHeader } from '../components/RetroHeader';
import { PosterModal } from '../components/PosterModal';
import { MatchResult } from '../game/simulationEngine';

interface SimulationScreenProps {
  navigation: any;
  route: any;
}

interface SimEvent {
  minute: number;
  text: string;
  type: 'start' | 'goal' | 'save' | 'foul' | 'end';
  team: 'home' | 'away' | 'neutral';
  scorer?: string;
}

export const SimulationScreen: React.FC<SimulationScreenProps> = ({
  navigation,
  route,
}) => {
  const homeTeam = route.params?.homeTeam || { name: 'SENİN TAKIMIN', rating: 78 };
  const awayTeam = route.params?.awayTeam || { name: 'Galatasaray SK', year: '2005', rating: 74 };
  const roundName = route.params?.roundName || 'Son 16';

  const [currentMinute, setCurrentMinute] = useState<number>(0);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [homeScorers, setHomeScorers] = useState<string[]>([]);
  const [awayScorers, setAwayScorers] = useState<string[]>([]);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [posterVisible, setPosterVisible] = useState<boolean>(false);
  const [fullMatchResult, setFullMatchResult] = useState<MatchResult | null>(null);

  const scrollRef = useRef<any>(null);

  useEffect(() => {
    runMatchSimulation();
  }, []);

  const runMatchSimulation = () => {
    // Generate pre-calculated events
    const homeDiff = ((homeTeam.rating || 78) - (awayTeam.rating || 74)) / 10;
    const finalHomeGoals = Math.max(0, Math.round(1.3 + homeDiff * 0.5 + (Math.random() * 2 - 1)));
    const finalAwayGoals = Math.max(0, Math.round(1.1 - homeDiff * 0.4 + (Math.random() * 2 - 1)));

    const homePool = ['Emre Belözoğlu', 'Nihat Kahveci', 'Tuncay Şanlı', 'Arda Turan', 'Hakan Şükür'];
    const awayPool = ['Volkan Arslan', 'Necati Ateş', 'Hasan Şaş', 'Saşa İliç', 'Hakan Ünsal'];

    const plannedEvents: SimEvent[] = [
      { minute: 0, text: 'Maçın başlama vuruşu yapıldı. İki takıma da başarılar dileriz!', type: 'start', team: 'neutral' },
      { minute: 1, text: 'Hakem düdüğünü çalıyor ve tarihi maç başlıyor!', type: 'start', team: 'neutral' },
    ];

    // Home goals
    for (let i = 0; i < finalHomeGoals; i++) {
      const min = Math.floor(Math.random() * 80) + 5;
      const scorer = homePool[Math.floor(Math.random() * homePool.length)];
      plannedEvents.push({
        minute: min,
        text: `GOOOLL! ${scorer} harika bir vuruşla topu ağlara gönderdi!`,
        type: 'goal',
        team: 'home',
        scorer,
      });
    }

    // Away goals
    for (let i = 0; i < finalAwayGoals; i++) {
      const min = Math.floor(Math.random() * 80) + 5;
      const scorer = awayPool[Math.floor(Math.random() * awayPool.length)];
      plannedEvents.push({
        minute: min,
        text: `GOL! ${awayTeam.name} tehlikeli geldi ve ${scorer} ceza sahası dışından sert bir vuruşla golü buldu.`,
        type: 'goal',
        team: 'away',
        scorer,
      });
    }

    // Extra exciting events
    plannedEvents.push({ minute: 18, text: `${homeTeam.name} atağında şut direkten döndü!`, type: 'save', team: 'home' });
    plannedEvents.push({ minute: 36, text: `Kaleci son anda parmaklarının ucuyla kornere çeliyor!`, type: 'save', team: 'away' });
    plannedEvents.push({ minute: 57, text: `${awayTeam.name} tehlikeli geldi ancak savunma kritik hamleyle topu uzaklaştırdı.`, type: 'foul', team: 'neutral' });
    plannedEvents.push({ minute: 74, text: `Ceza sahası karıştı, hakem devam kararı veriyor.`, type: 'foul', team: 'neutral' });
    plannedEvents.push({ minute: 90, text: 'Düdük çalıyor! Karşılaşma sona erdi.', type: 'end', team: 'neutral' });

    plannedEvents.sort((a, b) => a.minute - b.minute);

    // Run timer tick
    let min = 0;
    const interval = setInterval(() => {
      min += 3;
      if (min >= 90) {
        min = 90;
        clearInterval(interval);
        setCurrentMinute(90);
        setIsFinished(true);

        const hGoals = plannedEvents.filter(e => e.type === 'goal' && e.team === 'home');
        const aGoals = plannedEvents.filter(e => e.type === 'goal' && e.team === 'away');

        const hScorers = hGoals.map(e => `${e.scorer} (${e.minute}')`);
        const aScorers = aGoals.map(e => `${e.scorer} (${e.minute}')`);

        setHomeScore(hGoals.length);
        setAwayScore(aGoals.length);
        setHomeScorers(hScorers);
        setAwayScorers(aScorers);
        setEvents(plannedEvents);

        // Prepare poster match result
        const matchResult: MatchResult = {
          homeTeam: { name: homeTeam.name, rating: homeTeam.rating },
          awayTeam: { name: `${awayTeam.name} (${awayTeam.year || '2005'})`, rating: awayTeam.rating },
          homeScore: hGoals.length,
          awayScore: aGoals.length,
          events: [],
          timeline: plannedEvents.map(e => ({
            minute: e.minute,
            type: e.type === 'goal' ? 'goal' : 'normal',
            team: e.team === 'home' ? 'home' : 'away',
            player: e.scorer || 'Futbolcu',
            description: e.text,
          })),
          homeRating: homeTeam.rating || 78,
          awayRating: awayTeam.rating || 74,
          mvp: {
            name: hGoals.length >= aGoals.length ? (hGoals[0]?.scorer || 'Takım Kaptanı') : (aGoals[0]?.scorer || 'Rakip Yıldız'),
            club: hGoals.length >= aGoals.length ? homeTeam.name : awayTeam.name,
            rating: 88,
            position: 'OS',
          },
          winner: hGoals.length > aGoals.length ? 'home' : hGoals.length < aGoals.length ? 'away' : 'draw',
        };

        setFullMatchResult(matchResult);
        saveMatchToMuseum(matchResult);
        return;
      }

      setCurrentMinute(min);
      const eventsUntil = plannedEvents.filter(e => e.minute <= min);
      const hCount = eventsUntil.filter(e => e.type === 'goal' && e.team === 'home').length;
      const aCount = eventsUntil.filter(e => e.type === 'goal' && e.team === 'away').length;

      setHomeScore(hCount);
      setAwayScore(aCount);
      setEvents(eventsUntil);
    }, 180);
  };

  const saveMatchToMuseum = async (res: MatchResult) => {
    try {
      const stored = await AsyncStorage.getItem('@SLD_SAVED_POSTERS');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift({
        id: `match-${Date.now()}`,
        date: new Date().toISOString(),
        result: res,
      });
      await AsyncStorage.setItem('@SLD_SAVED_POSTERS', JSON.stringify(list.slice(0, 30)));
    } catch {
      // quiet
    }
  };

  const userWon = homeScore > awayScore;

  const handleReturnToTournament = () => {
    navigation.navigate('Tournament', {
      completedResult: {
        userWon,
        homeScore,
        awayScore,
      },
    });
  };

  const handleNewDraft = () => {
    navigation.navigate('FormationSetup');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader
        title="CANLI MAÇ SİMÜLASYONU"
        subtitle={roundName.toUpperCase()}
        showBack={isFinished}
        onBack={() => navigation.navigate('MainMenu')}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SCOREBOARD (Matches Screenshot 2) */}
        <View style={styles.scoreboardCard}>
          {/* Left Team (SENİN TAKIMIN) */}
          <View style={styles.teamCol}>
            <View style={styles.badgeS}>
              <Text style={styles.badgeSText}>S</Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{homeTeam.name}</Text>
              <Text style={styles.teamRating}>GÜÇ: {homeTeam.rating || 78}</Text>
            </View>
          </View>

          {/* Center Scores [ 0 ] - [ 0 ] */}
          <View style={styles.scoreCenter}>
            <View style={styles.scoreDigitBox}>
              <Text style={styles.scoreDigitText}>{homeScore}</Text>
            </View>
            <Text style={styles.scoreHyphen}>-</Text>
            <View style={styles.scoreDigitBox}>
              <Text style={styles.scoreDigitText}>{awayScore}</Text>
            </View>
          </View>

          {/* Right Team (Opponent) */}
          <View style={[styles.teamCol, styles.teamColRight]}>
            <View style={styles.badgeR}>
              <Text style={styles.badgeRText}>R</Text>
            </View>
            <View style={[styles.teamInfo, styles.teamInfoRight]}>
              <Text style={styles.teamName} numberOfLines={1}>
                {awayTeam.name}
              </Text>
              <Text style={styles.teamYear}>({awayTeam.year || '2005'})</Text>
              <Text style={styles.teamRating}>GÜÇ: {awayTeam.rating || 74}</Text>
            </View>
          </View>
        </View>

        {/* DAKİKA BAR */}
        <View style={styles.minuteCard}>
          <Text style={styles.minuteText}>
            DAKİKA:{currentMinute}'
          </Text>
        </View>

        {/* FINISHED / ELIMINATED OVERLAY (Matches Screenshot 3) */}
        {isFinished && !userWon && (
          <View style={styles.eliminatedCard}>
            <Text style={styles.eliminatedTitle}>ELENDİNİZ!</Text>
            <Text style={styles.eliminatedSubtitle}>
              Maalesef elendiniz. Bir sonraki turnuvada şansınızı tekrar deneyin!
            </Text>

            <View style={styles.scorersSummaryBox}>
              <View style={styles.scorersCol}>
                <Text style={styles.scorersColTitle}>Kendi Takımın:</Text>
                {homeScorers.length === 0 ? (
                  <Text style={styles.noGoalsText}>-</Text>
                ) : (
                  homeScorers.map((s, i) => (
                    <Text key={i} style={styles.scorerEntry}>⚽ {s}</Text>
                  ))
                )}
              </View>

              <View style={styles.scorersCol}>
                <Text style={styles.scorersColTitle}>Rakip Takım:</Text>
                {awayScorers.length === 0 ? (
                  <Text style={styles.noGoalsText}>-</Text>
                ) : (
                  awayScorers.map((s, i) => (
                    <Text key={i} style={styles.scorerEntry}>⚽ {s}</Text>
                  ))
                )}
              </View>
            </View>

            {/* Button from Screenshot 3 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNewDraft}
              style={styles.newDraftBtn}
            >
              <Text style={styles.newDraftBtnText}>
                YENİ KADRO KUR (DRAFT) 🔄
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* FINISHED / WON BANNER */}
        {isFinished && userWon && (
          <View style={styles.wonCard}>
            <Text style={styles.wonTitle}>TURU GEÇTİNİZ! 🎉</Text>
            <Text style={styles.wonSubtitle}>
              Harika bir oyunla rakibinizi elediniz! Turnuvada bir sonraki tura yükseldiniz.
            </Text>

            <View style={styles.wonActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleReturnToTournament}
                style={styles.advanceBtn}
              >
                <Text style={styles.advanceBtnText}>
                  TURNUVA AĞACINA DÖN ➔
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPosterVisible(true)}
                style={styles.posterActionBtn}
              >
                <Text style={styles.posterActionBtnText}>
                  MAÇ ANI POSTERİNİ GÖR / PAYLAŞ 📜
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* CANLI ANLATIM PANEL (Matches Screenshot 2) */}
        <View style={styles.commentaryCard}>
          <View style={styles.commentaryHeader}>
            <Text style={styles.commentaryTitle}>CANLI ANLATIM</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>
                {isFinished ? 'BİTTİ' : 'CANLI'}
              </Text>
            </View>
          </View>

          <View style={styles.eventsList}>
            {events.map((ev, idx) => (
              <View key={idx} style={styles.eventRow}>
                <Text style={styles.eventMin}>{ev.minute}'</Text>
                <Text style={styles.eventDesc}>{ev.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Retro Match Poster Modal */}
      <PosterModal
        visible={posterVisible}
        matchResult={fullMatchResult}
        onClose={() => setPosterVisible(false)}
      />
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
  scoreboardCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  teamCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamColRight: {
    flexDirection: 'row-reverse',
  },
  badgeS: {
    width: 32,
    height: 32,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  badgeR: {
    width: 32,
    height: 32,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '900',
  },
  teamInfo: {
    flex: 1,
  },
  teamInfoRight: {
    alignItems: 'flex-end',
  },
  teamName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  teamYear: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
  },
  teamRating: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    marginTop: 1,
  },
  scoreCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  scoreDigitBox: {
    width: 34,
    height: 48,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreDigitText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  scoreHyphen: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  minuteCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 10,
    alignItems: 'center',
  },
  minuteText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
  },
  eliminatedCard: {
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#1a1a1a',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  eliminatedTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  eliminatedSubtitle: {
    fontSize: 12,
    color: '#444444',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  scorersSummaryBox: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#e0d8cc',
    paddingTop: 10,
    marginBottom: 16,
  },
  scorersCol: {
    flex: 1,
    paddingHorizontal: 6,
  },
  scorersColTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  noGoalsText: {
    fontSize: 12,
    color: '#888888',
  },
  scorerEntry: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 16,
  },
  newDraftBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  newDraftBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  wonCard: {
    backgroundColor: '#fffdf0',
    borderWidth: 3,
    borderColor: '#3b9966',
    padding: 20,
    alignItems: 'center',
  },
  wonTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3b9966',
    letterSpacing: 1,
  },
  wonSubtitle: {
    fontSize: 12,
    color: '#444444',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  wonActions: {
    width: '100%',
    gap: 8,
  },
  advanceBtn: {
    backgroundColor: '#3b9966',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 12,
    alignItems: 'center',
  },
  advanceBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  posterActionBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 12,
    alignItems: 'center',
  },
  posterActionBtnText: {
    color: '#1a1a1a',
    fontSize: 13,
    fontWeight: '900',
  },
  commentaryCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    padding: 16,
  },
  commentaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1a1a1a',
    paddingBottom: 8,
    marginBottom: 10,
  },
  commentaryTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  liveBadge: {
    backgroundColor: '#e05638',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  eventsList: {
    gap: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f2ece2',
    paddingBottom: 6,
  },
  eventMin: {
    fontSize: 11,
    fontWeight: '900',
    color: '#e05638',
    width: 28,
  },
  eventDesc: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#333333',
    lineHeight: 16,
  },
});
