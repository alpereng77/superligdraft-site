import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RetroHeader } from '../components/RetroHeader';
import {
  createRoom,
  joinRoom,
  getRoomState,
  setPlayerReady,
  MultiplayerRoom,
} from '../services/api';

interface MultiplayerScreenProps {
  navigation: any;
}

export const MultiplayerScreen: React.FC<MultiplayerScreenProps> = ({
  navigation,
}) => {
  const [inLobby, setInLobby] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null);
  const [userRole, setUserRole] = useState<'host' | 'guest'>('host');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Poll room state while in lobby
  useEffect(() => {
    if (!currentRoom?.room_code) return;

    const interval = setInterval(async () => {
      try {
        const state = await getRoomState(currentRoom.room_code);
        if (state) {
          setCurrentRoom(state);

          if (
            state.status === 'drafting' ||
            (state.host_ready && state.guest_ready)
          ) {
            clearInterval(interval);
            navigation.navigate('FormationSetup', {
              mode: 'multiplayer',
              roomCode: state.room_code,
              role: userRole,
            });
          }
        }
      } catch {
        // quiet poll
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentRoom?.room_code, userRole, navigation]);

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen bir kullanıcı adı girin.');
      return;
    }
    setLoading(true);
    try {
      const room = await createRoom(username.trim());
      setCurrentRoom(room);
      setUserRole('host');
      setInLobby(true);
    } catch {
      Alert.alert('Hata', 'Oda oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen bir kullanıcı adı girin.');
      return;
    }
    if (!roomCodeInput.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen 6 haneli oda kodunu girin.');
      return;
    }

    setLoading(true);
    try {
      const room = await joinRoom(
        roomCodeInput.trim().toUpperCase(),
        username.trim(),
      );
      setCurrentRoom(room);
      setUserRole('guest');
      setInLobby(true);
    } catch {
      Alert.alert('Hata', 'Odaya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReady = async () => {
    if (!currentRoom) return;
    const newReady = !isReady;
    setIsReady(newReady);
    await setPlayerReady(currentRoom.room_code, userRole, newReady);
  };

  const handleShareCode = () => {
    if (!currentRoom?.room_code) return;
    Share.share({
      message: `Süper Lig Nostalji Draft'ta benimle 1v1 derbi yap! Oda Kodu: ${currentRoom.room_code}\nhttps://superligdraft.site`,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader
        showBack
        onBack={() => {
          if (inLobby) {
            setInLobby(false);
            setCurrentRoom(null);
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
          /* SCREENSHOT 5: 2 KİŞİLİK DRAFT SETUP CARD */
          <View style={styles.cardContainer}>
            <Text style={styles.title}>2 KİŞİLİK DRAFT</Text>
            <Text style={styles.subtitle}>
              Oyuna başlamak için kullanıcı adınızı girin.
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
                maxLength={24}
              />
            </View>

            {/* Create Room Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateRoom}
              disabled={loading}
              style={styles.createBtn}
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
                maxLength={8}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleJoinRoom}
                disabled={loading}
                style={styles.joinBtn}
              >
                <Text style={styles.joinBtnText}>➔] KATIL</Text>
              </TouchableOpacity>
            </View>

            {/* Back to Main Menu Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('MainMenu')}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>⬅ ANA MENÜYE DÖN</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ACTIVE LOBBY ROOM VIEW */
          <View style={styles.cardContainer}>
            <Text style={styles.title}>LOBİ</Text>
            <Text style={styles.subtitle}>
              Arkadaşınız bağlandığında kadro kuralarına başlayabilirsiniz!
            </Text>

            {/* Room Code Badge */}
            <View style={styles.codeBox}>
              <Text style={styles.codeBoxLabel}>ODA KODU</Text>
              <Text style={styles.codeBoxVal}>{currentRoom?.room_code}</Text>
              <TouchableOpacity
                onPress={handleShareCode}
                style={styles.shareBtn}
              >
                <Text style={styles.shareBtnText}>📤 KODU PAYLAŞ</Text>
              </TouchableOpacity>
            </View>

            {/* Players Status */}
            <View style={styles.playersStatusBox}>
              {/* Host */}
              <View style={styles.playerStatusRow}>
                <View>
                  <Text style={styles.playerRoleLabel}>EV SAHİBİ</Text>
                  <Text style={styles.playerUserName}>
                    👑 {currentRoom?.host_name || username}
                  </Text>
                </View>
                <View
                  style={[
                    styles.readyBadge,
                    currentRoom?.host_ready
                      ? styles.readyBadgeActive
                      : styles.readyBadgeWaiting,
                  ]}
                >
                  <Text style={styles.readyBadgeText}>
                    {currentRoom?.host_ready ? 'HAZIR ✓' : 'BEKLENİYOR'}
                  </Text>
                </View>
              </View>

              <View style={styles.playerStatusDivider} />

              {/* Guest */}
              <View style={styles.playerStatusRow}>
                <View>
                  <Text style={styles.playerRoleLabel}>MİSAFİR</Text>
                  <Text style={styles.playerUserName}>
                    ⚔️ {currentRoom?.guest_name || 'İkinci Oyuncu'}
                  </Text>
                </View>
                {currentRoom?.guest_name ? (
                  <View
                    style={[
                      styles.readyBadge,
                      currentRoom?.guest_ready
                        ? styles.readyBadgeActive
                        : styles.readyBadgeWaiting,
                    ]}
                  >
                    <Text style={styles.readyBadgeText}>
                      {currentRoom?.guest_ready ? 'HAZIR ✓' : 'BEKLENİYOR'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.waitingGuestBox}>
                    <ActivityIndicator size="small" color="#e05638" />
                    <Text style={styles.waitingGuestText}>
                      Katılım bekleniyor...
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Ready Toggle Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleToggleReady}
              style={[
                styles.readyActionBtn,
                isReady && styles.readyActionBtnActive,
              ]}
            >
              <Text style={styles.readyActionBtnText}>
                {isReady ? 'HAZIR (İPTAL ET)' : 'BEN HAZIRIM! ⚽'}
              </Text>
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
    backgroundColor: '#f5efe6',
  },
  scrollContent: {
    padding: 16,
    justifyContent: 'center',
    minHeight: '85%',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 3.5,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    padding: 24,
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 20,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  createBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#1a1a1a',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
  },
  joinRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 1.5,
  },
  joinBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  backBtn: {
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  codeBox: {
    backgroundColor: '#fffbe6',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    padding: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  codeBoxLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#888888',
    letterSpacing: 1.5,
  },
  codeBoxVal: {
    fontSize: 30,
    fontWeight: '900',
    color: '#e05638',
    letterSpacing: 3,
    marginVertical: 4,
  },
  shareBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  playersStatusBox: {
    borderWidth: 2,
    borderColor: '#1a1a1a',
    padding: 14,
    marginBottom: 18,
  },
  playerStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerRoleLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
  },
  playerUserName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
    marginTop: 2,
  },
  playerStatusDivider: {
    height: 1,
    backgroundColor: '#e5e0d8',
    marginVertical: 10,
  },
  readyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
  },
  readyBadgeActive: {
    backgroundColor: '#3b9966',
  },
  readyBadgeWaiting: {
    backgroundColor: '#e8dec8',
  },
  readyBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
  },
  waitingGuestBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  waitingGuestText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#666666',
  },
  readyActionBtn: {
    backgroundColor: '#d4af37',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 14,
    alignItems: 'center',
  },
  readyActionBtnActive: {
    backgroundColor: '#ffffff',
  },
  readyActionBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
});
