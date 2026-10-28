import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { MatchResult } from '../game/simulationEngine';
import { RetroButton } from './RetroButton';

interface PosterModalProps {
  visible: boolean;
  matchResult: MatchResult | null;
  onClose: () => void;
}

export const PosterModal: React.FC<PosterModalProps> = ({
  visible,
  matchResult,
  onClose,
}) => {
  if (!visible || !matchResult) return null;

  const handleShare = async () => {
    try {
      const summaryText = `⚽ SÜPER LİG NOSTALJİ DRAFT MAÇ POSTERİ ⚽\n\n` +
        `🏟️ ${matchResult.homeTeam.name} ${matchResult.homeScore} - ${matchResult.awayScore} ${matchResult.awayTeam.name}\n` +
        (matchResult.penaltyShootout
          ? `(Penaltılar: ${matchResult.penaltyShootout.homeScore} - ${matchResult.penaltyShootout.awayScore})\n`
          : '') +
        `🏆 Maçın Adamı: ${matchResult.mvp.name} (${matchResult.mvp.club} - ${matchResult.mvp.rating})\n\n` +
        `Süper Lig Nostalji Draft'ı sen de oyna: https://superligdraft.site`;

      await Share.share({
        message: summaryText,
        title: 'Süper Lig Nostalji Draft Maç Posteri',
      });
    } catch {
      Alert.alert('Hata', 'Paylaşım gerçekleştirilemedi.');
    }
  };

  const todayStr = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.posterBox, Shadows.brutal]}>
          {/* Retro Paper Border Effect */}
          <View style={styles.innerBorder}>
            {/* Poster Header */}
            <View style={styles.masthead}>
              <Text style={styles.brandText}>TÜRKİYE 1. FUTBOL LİGİ</Text>
              <Text style={styles.mainHeading}>RESMÎ MAÇ POSTERİ</Text>
              <View style={styles.separator} />
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>TARİH: {todayStr}</Text>
                <Text style={styles.metaText}>ÖZEL NOSTALJİ BASKISI</Text>
              </View>
            </View>

            {/* Scoreboard Section */}
            <View style={styles.scoreSection}>
              <View style={styles.teamColumn}>
                <Text style={styles.teamName} numberOfLines={2}>
                  {matchResult.homeTeam.name}
                </Text>
              </View>

              <View style={styles.scoreBox}>
                <Text style={styles.scoreNum}>{matchResult.homeScore}</Text>
                <Text style={styles.scoreDivider}>-</Text>
                <Text style={styles.scoreNum}>{matchResult.awayScore}</Text>
              </View>

              <View style={styles.teamColumn}>
                <Text style={styles.teamName} numberOfLines={2}>
                  {matchResult.awayTeam.name}
                </Text>
              </View>
            </View>

            {/* Penalties if any */}
            {matchResult.penaltyShootout && (
              <View style={styles.penaltiesRow}>
                <Text style={styles.penaltiesText}>
                  Seri Penaltılar: {matchResult.penaltyShootout.homeScore} -{' '}
                  {matchResult.penaltyShootout.awayScore}
                </Text>
              </View>
            )}

            {/* MVP Banner */}
            <View style={styles.mvpSection}>
              <Text style={styles.mvpLabel}>⭐ MAÇIN EN İYİ OYUNCUSU ⭐</Text>
              <Text style={styles.mvpName}>{matchResult.mvp.name}</Text>
              <Text style={styles.mvpClub}>
                {matchResult.mvp.club} • Rating: {matchResult.mvp.rating}
              </Text>
            </View>

            {/* Goalscorers */}
            <View style={styles.scorersSection}>
              <Text style={styles.scorersTitle}>GOL ATANLAR</Text>
              {matchResult.timeline.filter(e => e.type === 'goal').length === 0 ? (
                <Text style={styles.noGoalsText}>Normal sürede gol olmadı</Text>
              ) : (
                matchResult.timeline
                  .filter(e => e.type === 'goal')
                  .map((ev, i) => (
                    <Text key={i} style={styles.scorerLine}>
                      ⚽ {ev.minute}' {ev.player} ({ev.team === 'home' ? matchResult.homeTeam.name : matchResult.awayTeam.name})
                    </Text>
                  ))
              )}
            </View>

            {/* Stamp Footer */}
            <View style={styles.stampFooter}>
              <Text style={styles.stampText}>SUPERLIGDRAFT.SITE ARŞİVİ</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <RetroButton
              title="PAYLAŞ"
              variant="gold"
              icon="📤"
              onPress={handleShare}
              style={{ flex: 1 }}
            />
            <RetroButton
              title="KAPAT"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  posterBox: {
    backgroundColor: Colors.cream,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.borderDark,
    padding: 12,
    width: '100%',
    maxWidth: 420,
  },
  innerBorder: {
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 14,
    backgroundColor: '#fffdfa',
  },
  masthead: {
    alignItems: 'center',
    marginBottom: 12,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.textMuted,
  },
  mainHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.inkBlack,
    letterSpacing: 1,
    marginTop: 2,
  },
  separator: {
    height: 2,
    backgroundColor: Colors.borderDark,
    width: '100%',
    marginVertical: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  metaText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingVertical: 10,
    backgroundColor: Colors.creamDark,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    borderRadius: 6,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.inkBlack,
    textAlign: 'center',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  scoreNum: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.accentRed,
  },
  scoreDivider: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.inkBlack,
    marginHorizontal: 4,
  },
  penaltiesRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  penaltiesText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.accentBlue,
  },
  mvpSection: {
    backgroundColor: '#fff7d6',
    borderWidth: 1.5,
    borderColor: Colors.accentGold,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  mvpLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8c6d17',
    letterSpacing: 0.5,
  },
  mvpName: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.inkBlack,
    marginTop: 2,
  },
  mvpClub: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 2,
  },
  scorersSection: {
    marginBottom: 12,
  },
  scorersTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.inkBlack,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  noGoalsText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.textMuted,
  },
  scorerLine: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkBlack,
    lineHeight: 18,
  },
  stampFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 8,
    alignItems: 'center',
  },
  stampText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
});

