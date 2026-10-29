import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Share,
  Linking,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native';
import { RetroHeader } from '../components/RetroHeader';
import {
  createRoom,
  joinRoom,
  getRoomState,
  RoomData,
} from '../services/api';
import { Colors, Shadows } from '../theme/colors';

interface MultiplayerScreenProps {
  navigation: any;
  route: any;
}

export const MultiplayerScreen: React.FC<MultiplayerScreenProps> = ({
  navigation,
  route,
}) => {
  const initialRoomCode = route.params?.roomCode || '';
  const initialUsername = route.params?.username || '';
  const initialWaiting = route.params?.inWaitingState || false;

  const [inLobby, setInLobby] = useState<boolean>(!!initialRoomCode);
  const [username, setUsername] = useState<string>(initialUsername);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [hasStartedDraft, setHasStartedDraft] = useState<boolean>(initialWaiting);

  const activeRoomCodeRef = useRef<string>(initialRoomCode);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update room code ref whenever state changes
  useEffect(() => {
    if (initialRoomCode) {
      activeRoomCodeRef.current = initialRoomCode;
      setInLobby(true);
    }
  }, [initialRoomCode]);

  // Main Polling Loop for the Live Room
  useEffect(() => {
    const code = activeRoomCodeRef.current || currentRoom?.roomCode;
    if (!inLobby || !code) return;

    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;
      try {
        const state = await getRoomState(code);
        if (!state) return;

        if (isMountedRef.current) {
          setCurrentRoom(state);
        }

        // 1. If 2 players joined and room entered drafting phase
        if (state.status === 'drafting' && !hasStartedDraft) {
          setHasStartedDraft(true);
          isPolling = false;

          // Smooth delay so users see "Tüm oyuncular katıldı!"
          setTimeout(() => {
            navigation.navigate('FormationSetup', {
              mode: 'multiplayer',
              roomCode: state.roomCode,
              username: username.trim(),
            });
          }, 1200);
          return;
        }

        // 2. If both players submitted squads and the server simulated the match!
        if (state.status === 'finished' && state.leagueResults?.matches?.length) {
          isPolling = false;
          const match = state.leagueResults.matches[0];
          navigation.navigate('Simulation', {
            mode: 'multiplayer',
            roomCode: state.roomCode,
            username: username.trim(),
            roomData: state,
            match,
            standings: state.leagueResults.standings,
            champion: state.leagueResults.champion,
            homeTeam: {
              name: match.home,
              rating: match.homeRating,
            },
            awayTeam: {
              name: match.away,
              rating: match.awayRating,
            },
          });
          return;
        }
      } catch (e) {
        // quiet polling error
      }
    };

    // First poll immediately
    poll();
    const interval = setInterval(poll, 1500);

    return () => {
      isPolling = false;
      clearInterval(interval);
    };
  }, [inLobby, hasStartedDraft, username, navigation, currentRoom?.roomCode]);

  const handleCreateRoom = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setErrorMessage('Lütfen bir kullanıcı adı girin.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    const res = await createRoom(trimmed);
    setLoading(false);

    if (res.success && res.room) {
      setCurrentRoom(res.room);
      activeRoomCodeRef.current = res.room.roomCode;
      setInLobby(true);
      setHasStartedDraft(false);
    } else {
      setErrorMessage(res.message || 'Oda kurulamadı.');
    }
  };

  const handleJoinRoom = async () => {
    const trimmedUser = username.trim();
    const trimmedCode = roomCodeInput.trim().toUpperCase();

    if (!trimmedUser) {
      setErrorMessage('Lütfen bir kullanıcı adı girin.');
      return;
    }
    if (!trimmedCode) {
      setErrorMessage('Lütfen 6 haneli oda kodunu girin.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    const res = await joinRoom(trimmedCode, trimmedUser);
    setLoading(false);

    if (res.success && res.room) {
      setCurrentRoom(res.room);
      activeRoomCodeRef.current = res.room.roomCode;
      setInLobby(true);

      // If room was already in drafting, proceed
      if (res.room.status === 'drafting') {
        setHasStartedDraft(true);
        setTimeout(() => {
          navigation.navigate('FormationSetup', {
            mode: 'multiplayer',
            roomCode: res.room!.roomCode,
            username: trimmedUser,
          });
        }, 1000);
      }
    } else {
      setErrorMessage(res.message || 'Odaya katılım sağlanamadı.');
    }
  };

  const handleCopyCode = () => {
    const code = currentRoom?.roomCode || activeRoomCodeRef.current;
    if (!code) return;
    try {
      Clipboard.setString(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      Share.share({ message: code });
    }
  };

  const handleShareWhatsApp = () => {
    const code = currentRoom?.roomCode || activeRoomCodeRef.current || '------';
    const text = `Süper Lig Nostalji Draft'ta oda kurdum! Oda Kodu: ${code}. Gel kadronu kur, canlı derbide kapışalım: https://superligdraft.site/`;
    Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`).catch(() => {
      Share.share({ message: text });
    });
  };

  const handleLeaveLobby = () => {
    Alert.alert('Lobiden Ayrıl', 'Lobiden ayrılmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Ayrıl',
        style: 'destructive',
        onPress: () => {
          setInLobby(false);
          setCurrentRoom(null);
          activeRoomCodeRef.current = '';
          setHasStartedDraft(false);
        },
      },
    ]);
  };

  const players = currentRoom?.players || [];
  const player1 = players[0];
  const player2 = players[1];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader
        title="2 KİŞİLİK DERBİ"
        subtitle="CANLI ÇOK OYUNCULU MOD"
        showBack
        onBack={() => {
          if (inLobby) {
            handleLeaveLobby();
          } else {
            navigation.goBack();
          }
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!inLobby ? (
          /* ==============================================
             SETUP CARD: CREATE OR JOIN ROOM
             ============================================== */
          <View style={[styles.cardContainer, Shadows.brutal]}>
            <Text style={styles.title}>2 KİŞİLİK DRAFT</Text>
            <Text style={styles.subtitle}>
              Canlı web oyuncularıyla veya arkadaşınla teke tek derbi heyecanını yaşa!
            </Text>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kullanıcı Adınız</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                style={styles.textInput}
                placeholder="Kullanıcı adını yaz..."
                placeholderTextColor="#888888"
                maxLength={20}
                autoCapitalize="words"
              />
            </View>

            {/* Create Room Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateRoom}
              disabled={loading}
              style={[styles.createBtn, Shadows.brutalSm]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.createBtnText}>+ YENİ ODA OLUŞTUR</Text>
              )}
            </TouchableOpacity>

            {/* "veya" Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Join Room Row */}
            <View style={styles.joinRow}>
              <TextInput
                value={roomCodeInput}
                onChangeText={setRoomCodeInput}
                style={styles.codeInput}
                placeholder="ODA KODU"
                placeholderTextColor="#888888"
                autoCapitalize="characters"
                maxLength={6}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleJoinRoom}
                disabled={loading}
                style={[styles.joinBtn, Shadows.brutalSm]}
              >
                <Text style={styles.joinBtnText}>➔ KATIL</Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {!!errorMessage && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            )}

            {/* Back to Main Menu Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('MainMenu')}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>◀ ANA MENÜYE DÖN</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ==============================================
             ACTIVE LOBBY VIEW
             ============================================== */
          <View style={[styles.cardContainer, Shadows.brutal]}>
            <Text style={styles.title}>LOBİ</Text>
            <Text style={styles.subtitle}>
              {hasStartedDraft
                ? 'Kadrolar kuruluyor veya maç sonucu bekleniyor...'
                : 'Tüm oyuncuların katılmasını bekliyoruz...'}
            </Text>

            {/* Room Code Banner */}
            <View style={styles.codeBox}>
              <Text style={styles.codeBoxLabel}>ODA KODU</Text>
              <Text style={styles.codeBoxVal}>
                {currentRoom?.roomCode || activeRoomCodeRef.current}
              </Text>

              <View style={styles.codeActionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCopyCode}
                  style={styles.copyBtn}
                >
                  <Text style={styles.copyBtnText}>
                    {copySuccess ? '✓ Kopyalandı' : '📋 Kopyala'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleShareWhatsApp}
                  style={styles.waBtn}
                >
                  <Text style={styles.waBtnText}>💬 WhatsApp Daveti</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2 Players Slots */}
            <View style={styles.playersGrid}>
              {/* Slot 1: Host */}
              <View
                style={[
                  styles.playerCard,
                  player1?.ready && styles.playerCardReady,
                ]}
              >
                <Text style={styles.playerAvatar}>👤</Text>
                <Text style={styles.playerName} numberOfLines={1}>
                  {player1?.username || username}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    player1?.ready ? styles.statusPillReady : styles.statusPillWait,
                  ]}
                >
                  <Text style={styles.statusPillText}>
                    {player1?.ready ? 'Hazır ✓' : 'Bekleniyor...'}
                  </Text>
                </View>
              </View>

              {/* Slot 2: Guest */}
              <View
                style={[
                  styles.playerCard,
                  player2?.ready && styles.playerCardReady,
                  !player2 && styles.playerCardEmpty,
                ]}
              >
                <Text style={styles.playerAvatar}>
                  {player2 ? '👤' : '➕'}
                </Text>
                <Text
                  style={[
                    styles.playerName,
                    !player2 && { color: '#888888', fontStyle: 'italic' },
                  ]}
                  numberOfLines={1}
                >
                  {player2 ? player2.username : 'Bekleniyor...'}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    player2?.ready ? styles.statusPillReady : styles.statusPillWait,
                  ]}
                >
                  <Text style={styles.statusPillText}>
                    {player2
                      ? player2.ready
                        ? 'Hazır ✓'
                        : 'Bekleniyor...'
                      : 'Katılım Bekleniyor'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Animated Status Bar */}
            <View style={styles.statusBar}>
              <ActivityIndicator size="small" color="#3b9966" />
              <Text style={styles.statusBarText}>
                {hasStartedDraft
                  ? 'Diğer oyuncunun kadrosunu kurması bekleniyor...'
                  : player2
                  ? 'Tüm oyuncular katıldı! Formasyon seçimi başlıyor...'
                  : 'İkinci oyuncu aranıyor...'}
              </Text>
            </View>

            {/* Leave Lobby Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLeaveLobby}
              style={styles.leaveBtn}
            >
              <Text style={styles.leaveBtnText}>Lobiden Ayrıl</Text>
            </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 36,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  createBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#e0d8cc',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#888888',
    textTransform: 'uppercase',
  },
  joinRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 2,
    textAlign: 'center',
  },
  joinBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  errorBox: {
    backgroundColor: '#ffebe6',
    borderWidth: 1.5,
    borderColor: '#e05638',
    padding: 10,
    borderRadius: 2,
    marginBottom: 16,
  },
  errorText: {
    color: '#e05638',
    fontSize: 12,
    fontWeight: '800',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#666666',
  },
  // LOBBY STYLES
  codeBox: {
    backgroundColor: '#fff2cc',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeBoxLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 1,
    marginBottom: 4,
  },
  codeBoxVal: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 6,
    marginBottom: 12,
    fontFamily: 'Courier',
  },
  codeActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  copyBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 2,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  waBtn: {
    backgroundColor: '#25D366',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 2,
  },
  waBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  playersGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  playerCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  playerCardReady: {
    backgroundColor: '#f0fdf4',
    borderColor: '#3b9966',
  },
  playerCardEmpty: {
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  playerAvatar: {
    fontSize: 28,
    marginBottom: 2,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  statusPillWait: {
    backgroundColor: '#f5efe6',
  },
  statusPillReady: {
    backgroundColor: '#dcfce7',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f5efe6',
    padding: 12,
    borderRadius: 2,
    marginBottom: 16,
  },
  statusBarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3b9966',
    flexShrink: 1,
  },
  leaveBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  leaveBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#e05638',
  },
});
