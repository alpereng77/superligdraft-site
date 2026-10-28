import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Player } from '../services/api';

interface PlayerCardProps {
  player: Player;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onPress,
  selected = false,
  disabled = false,
  size = 'md',
  style,
}) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return Colors.accentGold;
    if (rating >= 80) return Colors.accentGreen;
    if (rating >= 70) return Colors.accentBlue;
    return Colors.accentRed;
  };

  const getPhotoUri = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `https://superligdraft.site${url}`;
    return `https://superligdraft.site/${url}`;
  };

  const photoUri = getPhotoUri(player.image_url || player.photo);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[
        styles.card,
        Shadows.brutal,
        selected && styles.cardSelected,
        isSm && styles.cardSm,
        isLg && styles.cardLg,
        style,
      ]}
    >
      {/* Top Banner: Pos & Rating */}
      <View style={styles.topRow}>
        <View style={styles.posBadge}>
          <Text style={styles.posText}>{player.position || 'OYK'}</Text>
        </View>
        <View
          style={[
            styles.ratingBadge,
            { backgroundColor: getRatingColor(player.rating || 75) },
          ]}
        >
          <Text style={styles.ratingText}>{player.rating || 75}</Text>
        </View>
      </View>

      {/* Player Image / Avatar */}
      <View style={[styles.imageContainer, isSm && styles.imageContainerSm]}>
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.playerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {player.name ? player.name.charAt(0) : '⚽'}
            </Text>
          </View>
        )}
      </View>

      {/* Player Info */}
      <View style={styles.infoContainer}>
        <Text
          style={[styles.playerName, isSm && styles.playerNameSm]}
          numberOfLines={1}
        >
          {player.name}
        </Text>
        <Text style={styles.playerClub} numberOfLines={1}>
          {player.club} {player.season ? `(${player.season})` : ''}
        </Text>
      </View>

      {/* Nation / Team Tag */}
      {player.nation && (
        <View style={styles.tagRow}>
          <Text style={styles.tagText}>{player.nation}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 8,
    width: 140,
    alignItems: 'center',
  },
  cardSm: {
    width: 100,
    padding: 6,
  },
  cardLg: {
    width: 180,
    padding: 12,
  },
  cardSelected: {
    borderColor: Colors.accentGold,
    borderWidth: 3,
    backgroundColor: '#fffbe6',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  posBadge: {
    backgroundColor: Colors.creamDark,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  posText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  ratingBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    overflow: 'hidden',
    backgroundColor: Colors.creamDark,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainerSm: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6dfd5',
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  infoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  playerName: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.inkBlack,
    textAlign: 'center',
  },
  playerNameSm: {
    fontSize: 11,
  },
  playerClub: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  tagRow: {
    marginTop: 4,
    backgroundColor: Colors.cream,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});

