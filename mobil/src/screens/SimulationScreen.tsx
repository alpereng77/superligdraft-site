import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RetroHeader } from '../components/RetroHeader';
import { PosterModal } from '../components/PosterModal';
import { MatchResult } from '../game/simulationEngine';
import { DerbyMatch, RoomData } from '../services/api';

interface SimulationScreenProps {
  navigation: any;
  route: any;
}

interface SimEvent {
  minute: number;
  text: string;
  type: 'start' | 'goal' | 'save' | 'foul' | 'end' | 'phase';
  team: 'home' | 'away' | 'neutral';
  scorer?: string;
}

export const SimulationScreen: React.FC<SimulationScreenProps> = ({
  navigation,
  route,
}) => {
  const mode = route.params?.mode || 'tournament';
  const serverMatch: DerbyMatch | undefined = route.params?.match;
  const roomData: RoomData | undefined = route.params?.roomData;
  const currentUsername = route.params?.username || '';

  const homeTeam = route.params?.homeTeam || { name: 'SENİN TAKIMIN', rating: 78 };
  const awayTeam = route.params?.awayTeam || { name: 'Galatasaray SK', year: '2005', rating: 74 };
  const roundName = route.params?.roundName || (mode === 'multiplayer' ? '1v1 Derbi' : 'Son 16');

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
    if (mode === 'multiplayer' && serverMatch) {
      runMultiplayerSimulation(serverMatch);
    } else {
      runClassicMatchSimulation();
    }
  }, []);

  // 1. MULTIPLAYER SIMULATION (Driven deterministically by live server result)
  const runMultiplayerSimulation = (match: DerbyMatch) => {
    const serverEvents = match.events || [];
    const plannedEvents: SimEvent[] = [
      {
        minute: 0,
        text: 'Büyük derbi için takımlar sahaya çıkıyor. Hakem düdüğünü çaldı ve maç başladı!',
        type: 'start',
        team: 'neutral',
      },
    ];

    serverEvents.forEach(e => {
      let eventType: SimEvent['type'] = 'foul';
      if (e.type === 'goal') eventType = 'goal';
      else if (e.type === 'miss') eventType = 'save';
      else if (e.type === 'phase') eventType = 'phase';

      plannedEvents.push({
        minute: e.minute,
        text: e.text,
        type: eventType,
        team: e.team === 'home' ? 'home' : e.team === 'away' ? 'away' : 'neutral',
        scorer: e.name,
      });
    });

    // Final whistle
    const maxMin = match.hasExtraTime ? 120 : 90;
    plannedEvents.push({
      minute: maxMin,
      text: match.hasPenalties
        ? `120 dakika sonunda eşitlik bozulmadı (${match.homeScore} - ${match.awayScore})! Penaltılarla galip belirlendi.`
        : `Düdük çalıyor! Karşılaşma sona erdi (${match.homeScore} - ${match.awayScore}).`,
      type: 'end',
      team: 'neutral',
    });

    plannedEvents.sort((a, b) => a.minute - b.minute);

    let min = 0;
    const interval = setInterval(() => {
      min += 3;
      if (min >= maxMin) {
        min = maxMin;
        clearInterval(interval);
        setCurrentMinute(maxMin);
        setIsFinished(true);

        const hGoals = plannedEvents.filter(e => e.type === 'goal' && e.team === 'home');
        const aGoals = plannedEvents.filter(e => e.type === 'goal' && e.team === 'away');

        setHomeScore(match.homeScore);
        setAwayScore(match.awayScore);
        setHomeScorers(hGoals.map(e => `${e.text.split('!')[1]?.split(' ')[1] || match.home} (${e.minute}')`));
        setAwayScorers(aGoals.map(e => `${e.text.split('!')[1]?.split(' ')[1] || match.away} (${e.minute}')`));
        setEvents(plannedEvents);

        const matchResult: MatchResult = {
          homeTeam: { name: match.home, rating: match.homeRating },
          awayTeam: { name: match.away, rating: match.awayRating },
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          events: [],
          timeline: plannedEvents.map(e => ({
            minute: e.minute,
            type: e.type === 'goal' ? 'goal' : 'normal',
            team: e.team === 'home' ? 'home' : 'away',
            player: e.scorer || 'Futbolcu',
            description: e.text,
          })),
          homeRating: match.homeRating,
          awayRating: match.awayRating,
          mvp: {
            name: match.winner === 'home' ? match.home : match.away,
            club: match.winner === 'home' ? match.home : match.away,
            rating: 88,
            position: 'OS',
          },
          winner: match.winner === 'home' ? 'home' : match.winner === 'away' ? 'away' : 'draw',
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
    }, 450);
  };

  // 2. CLASSIC SINGLEPLAYER SIMULATION
  const runClassicMatchSimulation = () => {
    const homeDiff = ((homeTeam.rating || 78) - (awayTeam.rating || 74)) / 10;
    const finalHomeGoals = Math.max(0, Math.round(1.3 + homeDiff * 0.5 + (Math.random() * 2 - 1)));
    const finalAwayGoals = Math.max(0, Math.round(1.1 - homeDiff * 0.4 + (Math.random() * 2 - 1)));

    const homePool = ['Emre Belözoğlu', 'Nihat Kahveci', 'Tuncay Şanlı', 'Arda Turan', 'Hakan Şükür'];
    const awayPool = ['Volkan Arslan', 'Necati Ateş', 'Hasan Şaş', 'Saşa İliç', 'Hakan Ünsal'];

    const plannedEvents: SimEvent[] = [
      { minute: 0, text: 'Maçın başlama vuruşu yapıldı. İki takıma da başarılar dileriz!', type: 'start', team: 'neutral' },
      { minute: 1, text: 'Hakem düdüğünü çalıyor ve tarihi maç başlıyor!', type: 'start', team: 'neutral' },
    ];

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

    plannedEvents.push({ minute: 18, text: `${homeTeam.name} atağında şut direkten döndü!`, type: 'save', team: 'home' });
    plannedEvents.push({ minute: 36, text: `Kaleci son anda parmaklarının ucuyla kornere çeliyor!`, type: 'save', team: 'away' });
    plannedEvents.push({ minute: 57, text: `${awayTeam.name} tehlikeli geldi ancak savunma kritik hamleyle topu uzaklaştırdı.`, type: 'foul', team: 'neutral' });
    plannedEvents.push({ minute: 74, text: `Ceza sahası karıştı, hakem devam kararı veriyor.`, type: 'foul', team: 'neutral' });
    plannedEvents.push({ minute: 90, text: 'Düdük çalıyor! Karşılaşma sona erdi.', type: 'end', team: 'neutral' });

    plannedEvents.sort((a, b) => a.minute - b.minute);

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
    }, 450);
  };

  const saveMatchToMuseum = async (result: MatchResult) => {
    try {
      const existing = await AsyncStorage.getItem('@SLD_SAVED_POSTERS');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        result,
      });
      await AsyncStorage.setItem('@SLD_SAVED_POSTERS', JSON.stringify(list.slice(0, 30)));
    } catch {
      // quiet
    }
  };

  const isMultiplayer = mode === 'multiplayer';
  const userWon = isMultiplayer
    ? serverMatch
      ? (serverMatch.winner === 'home' && currentUsername === serverMatch.home) ||
        (serverMatch.winner === 'away' && currentUsername === serverMatch.away)
      : homeScore > awayScore
    : homeScore > awayScore;

  const isDraw = isMultiplayer && homeScore === awayScore;

  const handleReturnToTournament = () => {
    navigation.navigate('Tournament', {
      completedResult: {
        roundIndex: route.params?.roundIndex || 0,
        homeScore,
        awayScore,
        winner: userWon ? 'user' : 'opponent',
      },
    });
  };

  const handleNewDraft = () => {
    navigation.navigate('FormationSetup');
  };

  const handleShareDerbyWhatsApp = () => {
    const text = `Süper Lig Nostalji Draft'ta ${homeTeam.name} (${homeScore}) - (${awayScore}) ${awayTeam.name} derbi maçı bitti! Sen de nostalji kadronu kur ve kapışalım: https://superligdraft.site/`;
    Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`).catch(() => {
      Share.share({ message: text });
    });
  };

  // Extract both players' squads for multiplayer display
  const player1 = roomData?.players?.[0];
  const player2 = roomData?.players?.[1];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader
        title={isMultiplayer ? 'CANLI DERBİ' : 'MAÇ SİMÜLASYONU'}
        subtitle={isMultiplayer ? '1V1 CANLI DERBİ MAÇI' : roundName.toUpperCase()}
        showBack
        onBack={() => {
          if (isMultiplayer) {
            navigation.navigate('MainMenu');
          } else {
            navigation.goBack();
          }
        }}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* RETRO SCOREBOARD */}
        <View style={styles.scoreboardCard}>
          {/* Left Team */}
          <View style={styles.teamCol}>
            <View style={styles.badgeS}>
              <Text style={styles.badgeSText}>S</Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName} numberOfLines={1}>
                {homeTeam.name}
              </Text>
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
              {awayTeam.year && (
                <Text style={styles.teamYear}>({awayTeam.year})</Text>
              )}
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

        {/* =========================================================
            MULTIPLAYER FINISHED BANNER
            ========================================================= */}
        {isFinished && isMultiplayer && (
          <View style={styles.derbyResultCard}>
            <Text style={styles.wonTitle}>
              {userWon
                ? 'DERBİYİ KAZANDINIZ! 🏆'
                : isDraw
                ? 'DOSTLUK KAZANDI! 🤝'
                : 'DERBİYİ RAKİP KAZANDI! ⚔️'}
            </Text>
            <Text style={styles.wonSubtitle}>
              {userWon
                ? 'Tebrikler! Arkadaşınıza karşı unutulmaz bir derbi zaferi elde ettiniz.'
                : isDraw
                ? 'Nefes kesen maç sonucunda derbi eşitlikle tamamlandı.'
                : 'Rakibiniz bu kez daha üstün oynadı. Bir sonraki maçta rövanşı alabilirsiniz!'}
            </Text>

            <View style={styles.derbyActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPosterVisible(true)}
                style={styles.posterActionBtn}
              >
                <Text style={styles.posterActionBtnText}>
                  📜 DERBİ POSTERİNİ GÖR / PAYLAŞ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShareDerbyWhatsApp}
                style={styles.derbyWaBtn}
              >
                <Text style={styles.derbyWaBtnText}>
                  💬 WhatsApp ile Sonucu Paylaş
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('MainMenu')}
                style={styles.derbyHomeBtn}
              >
                <Text style={styles.derbyHomeBtnText}>
                  🏠 Ana Menüye Dön
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* =========================================================
            CLASSIC SINGLEPLAYER FINISHED BANNERS
            ========================================================= */}
        {isFinished && !isMultiplayer && !userWon && (
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

        {isFinished && !isMultiplayer && userWon && (
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

        {/* =========================================================
            MULTIPLAYER INLINE SQUADS (KADROLAR)
            ========================================================= */}
        {isMultiplayer && isFinished && (
          <View style={styles.squadsContainer}>
            <Text style={styles.squadsHeader}>KADROLAR</Text>
            <View style={styles.squadsRow}>
              {/* Home Squad */}
              <View style={styles.squadColumn}>
                <Text style={styles.squadTeamHeader} numberOfLines={1}>
                  {player1?.username || homeTeam.name} ({player1?.formation || '4-4-2'})
                </Text>
                <Text style={styles.squadOvr}>GÜÇ: {player1?.rating || homeTeam.rating}</Text>
                <View style={styles.squadList}>
                  {(player1?.squad || []).map((p: any, i: number) => (
                    <View key={i} style={styles.squadItem}>
                      <Text style={styles.squadPos}>{p.position || 'OS'}</Text>
                      <Text style={styles.squadName} numberOfLines={1}>{p.name}</Text>
                      <Text style={styles.squadRating}>{p.rating}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Away Squad */}
              <View style={styles.squadColumn}>
                <Text style={styles.squadTeamHeader} numberOfLines={1}>
                  {player2?.username || awayTeam.name} ({player2?.formation || '4-4-2'})
                </Text>
                <Text style={styles.squadOvr}>GÜÇ: {player2?.rating || awayTeam.rating}</Text>
                <View style={styles.squadList}>
                  {(player2?.squad || []).map((p: any, i: number) => (
                    <View key={i} style={styles.squadItem}>
                      <Text style={styles.squadPos}>{p.position || 'OS'}</Text>
                      <Text style={styles.squadName} numberOfLines={1}>{p.name}</Text>
                      <Text style={styles.squadRating}>{p.rating}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* CANLI ANLATIM PANEL */}
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
    width: 36,
    height: 36,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  badgeR: {
    width: 36,
    height: 36,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '900',
  },
  teamInfo: {
    flex: 1,
  },
  teamInfoRight: {
    alignItems: 'flex-end',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
    textTransform: 'uppercase',
  },
  teamYear: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  teamRating: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
    marginTop: 2,
  },
  scoreCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 8,
  },
  scoreDigitBox: {
    width: 38,
    height: 48,
    borderWidth: 2.5,
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
    borderRadius: 2,
    paddingVertical: 10,
    alignItems: 'center',
  },
  minuteText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  derbyResultCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 18,
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  derbyActionsRow: {
    marginTop: 14,
    gap: 10,
  },
  derbyWaBtn: {
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 12,
    alignItems: 'center',
  },
  derbyWaBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  derbyHomeBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 12,
    alignItems: 'center',
  },
  derbyHomeBtnText: {
    color: '#1a1a1a',
    fontSize: 13,
    fontWeight: '900',
  },
  eliminatedCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 18,
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  eliminatedTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 6,
  },
  eliminatedSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  scorersSummaryBox: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#1a1a1a',
    paddingVertical: 12,
    marginBottom: 16,
  },
  scorersCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  scorersColTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  scorerEntry: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  noGoalsText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '700',
  },
  newDraftBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 14,
    alignItems: 'center',
  },
  newDraftBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  wonCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2.5,
    borderColor: '#3b9966',
    borderRadius: 2,
    padding: 18,
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  wonTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 6,
  },
  wonSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  wonActions: {
    gap: 10,
  },
  advanceBtn: {
    backgroundColor: '#3b9966',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 14,
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
  squadsContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 16,
  },
  squadsHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  squadsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  squadColumn: {
    flex: 1,
    backgroundColor: '#fdfbf7',
    borderWidth: 1.5,
    borderColor: '#e0d8cc',
    borderRadius: 2,
    padding: 10,
  },
  squadTeamHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  squadOvr: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 8,
  },
  squadList: {
    gap: 4,
  },
  squadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 3,
    paddingHorizontal: 6,
    gap: 4,
  },
  squadPos: {
    fontSize: 9,
    fontWeight: '900',
    color: '#e05638',
    width: 18,
  },
  squadName: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  squadRating: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  commentaryCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 16,
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  commentaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderColor: '#1a1a1a',
    paddingBottom: 10,
    marginBottom: 12,
  },
  commentaryTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  liveBadge: {
    backgroundColor: '#e05638',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  liveBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  eventsList: {
    gap: 10,
  },
  eventRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  eventMin: {
    fontSize: 12,
    fontWeight: '900',
    color: '#e05638',
    width: 26,
  },
  eventDesc: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 16,
  },
});
