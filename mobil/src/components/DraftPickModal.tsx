import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Player } from '../services/api';
import { PlayerCard } from './PlayerCard';
import { RetroButton } from './RetroButton';

interface DraftPickModalProps {
  visible: boolean;
  role: string;
  candidates: Player[];
  onSelectPlayer: (player: Player) => void;
  onCancel: () => void;
}

export const DraftPickModal: React.FC<DraftPickModalProps> = ({
  visible,
  role,
  candidates,
  onSelectPlayer,
  onCancel,
}) => {
  const [isRolling, setIsRolling] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [spinValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      setIsRolling(true);
      setSelectedPlayer(null);
      spinValue.setValue(0);

      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setIsRolling(false);
      });
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalBox, Shadows.brutal]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              🎲 KURA ÇEKİMİ: <Text style={styles.roleHighlight}>{role}</Text>
            </Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {isRolling ? (
            <View style={styles.rollingContainer}>
              <Animated.Text
                style={[styles.diceIcon, { transform: [{ rotate: spin }] }]}
              >
                🎲
              </Animated.Text>
              <Text style={styles.rollingText}>Kura Çekiliyor...</Text>
              <Text style={styles.rollingSub}>
                Nostaljik Süper Lig Arşivi Taranıyor
              </Text>
            </View>
          ) : (
            <View style={styles.content}>
              <Text style={styles.subtitle}>
                Aşağıdaki 3 nostaljik yıldızdan birini kadrona kat:
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
              >
                {candidates.map((player, idx) => (
                  <View key={player.id || idx} style={styles.cardWrapper}>
                    <PlayerCard
                      player={player}
                      selected={selectedPlayer?.id === player.id}
                      onPress={() => setSelectedPlayer(player)}
                    />
                  </View>
                ))}
              </ScrollView>

              <View style={styles.actions}>
                <RetroButton
                  title="KADROYA EKLE"
                  variant="gold"
                  size="lg"
                  disabled={!selectedPlayer}
                  onPress={() => {
                    if (selectedPlayer) {
                      onSelectPlayer(selectedPlayer);
                    }
                  }}
                  icon="✓"
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: Colors.cream,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.borderDark,
    width: '100%',
    maxWidth: 480,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: Colors.creamDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.borderDark,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.inkBlack,
    letterSpacing: 0.5,
  },
  roleHighlight: {
    color: Colors.accentRed,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  rollingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceIcon: {
    fontSize: 54,
    marginBottom: 16,
  },
  rollingText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.inkBlack,
    letterSpacing: 0.5,
  },
  rollingSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.inkBlack,
    marginBottom: 16,
    textAlign: 'center',
  },
  cardsRow: {
    paddingHorizontal: 8,
    gap: 12,
    paddingBottom: 16,
  },
  cardWrapper: {
    paddingVertical: 4,
  },
  actions: {
    width: '100%',
    marginTop: 8,
  },
});

