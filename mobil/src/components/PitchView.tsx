import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Rect, Circle, Line } from 'react-native-svg';
import { Colors, Shadows } from '../theme/colors';
import { FormationPosition } from '../game/formationConfigs';
import { Player } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PITCH_WIDTH = SCREEN_WIDTH - 24;
const PITCH_HEIGHT = PITCH_WIDTH * 1.35; // 4:3ish ratio for mobile pitch

interface PitchViewProps {
  positions: FormationPosition[];
  selectedSlotIndex?: number | null;
  onSelectSlot?: (index: number) => void;
  squad: Record<number, Player>;
  readOnly?: boolean;
}

export const PitchView: React.FC<PitchViewProps> = ({
  positions,
  selectedSlotIndex,
  onSelectSlot,
  squad,
  readOnly = false,
}) => {
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

  return (
    <View style={[styles.container, Shadows.brutal]}>
      {/* SVG Grass & Lines */}
      <View style={styles.pitchBg}>
        <Svg
          width={PITCH_WIDTH}
          height={PITCH_HEIGHT}
          viewBox={`0 0 ${PITCH_WIDTH} ${PITCH_HEIGHT}`}
          style={StyleSheet.absoluteFill}
        >
          {/* Pitch Outer Line */}
          <Rect
            x="8"
            y="8"
            width={PITCH_WIDTH - 16}
            height={PITCH_HEIGHT - 16}
            fill="#2d6e46"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="2"
            rx="6"
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
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="2"
            fill="none"
          />
          <Circle
            cx={PITCH_WIDTH / 2}
            cy={PITCH_HEIGHT / 2}
            r="3"
            fill="rgba(255, 255, 255, 0.7)"
          />

          {/* Top Penalty Box (Opponent goal) */}
          <Rect
            x={PITCH_WIDTH * 0.22}
            y="8"
            width={PITCH_WIDTH * 0.56}
            height={PITCH_HEIGHT * 0.16}
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="2"
            fill="none"
          />
          {/* Top Goal Box */}
          <Rect
            x={PITCH_WIDTH * 0.35}
            y="8"
            width={PITCH_WIDTH * 0.3}
            height={PITCH_HEIGHT * 0.06}
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="2"
            fill="none"
          />

          {/* Bottom Penalty Box (Our goal) */}
          <Rect
            x={PITCH_WIDTH * 0.22}
            y={PITCH_HEIGHT - 8 - PITCH_HEIGHT * 0.16}
            width={PITCH_WIDTH * 0.56}
            height={PITCH_HEIGHT * 0.16}
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="2"
            fill="none"
          />
          {/* Bottom Goal Box */}
          <Rect
            x={PITCH_WIDTH * 0.35}
            y={PITCH_HEIGHT - 8 - PITCH_HEIGHT * 0.06}
            width={PITCH_WIDTH * 0.3}
            height={PITCH_HEIGHT * 0.06}
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="2"
            fill="none"
          />
        </Svg>
      </View>

      {/* Position Nodes */}
      {positions.map(pos => {
        const player = squad[pos.index];
        const isSelected = selectedSlotIndex === pos.index;
        const posX = (pos.x / 100) * PITCH_WIDTH - 24;
        const posY = (pos.y / 100) * PITCH_HEIGHT - 24;

        return (
          <TouchableOpacity
            key={`slot-${pos.index}`}
            activeOpacity={readOnly ? 1 : 0.7}
            disabled={readOnly}
            onPress={() => onSelectSlot && onSelectSlot(pos.index)}
            style={[
              styles.slotNode,
              {
                left: posX,
                top: posY,
              },
              isSelected && styles.slotNodeSelected,
            ]}
          >
            {player ? (
              <View style={styles.filledSlot}>
                <View style={styles.playerCircle}>
                  {player.image_url || player.photo ? (
                    <Image
                      source={{
                        uri: getPhotoUri(player.image_url || player.photo) || '',
                      }}
                      style={styles.playerImg}
                    />
                  ) : (
                    <Text style={styles.initials}>
                      {player.name ? player.name.charAt(0) : '⚽'}
                    </Text>
                  )}
                  {/* Rating Bubble */}
                  <View
                    style={[
                      styles.ratingBadge,
                      {
                        backgroundColor: getRatingColor(player.rating || 75),
                      },
                    ]}
                  >
                    <Text style={styles.ratingText}>
                      {player.rating || 75}
                    </Text>
                  </View>
                </View>

                {/* Name Label */}
                <View style={styles.nameTag}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.name ? player.name.split(' ').pop() : ''}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.emptySlot, isSelected && styles.emptySelected]}>
                <Text style={styles.emptyRole}>{pos.role}</Text>
                <Text style={styles.plusSign}>+</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: PITCH_WIDTH,
    height: PITCH_HEIGHT,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.borderDark,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
    backgroundColor: '#205c38',
  },
  pitchBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  slotNode: {
    position: 'absolute',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  slotNodeSelected: {
    transform: [{ scale: 1.15 }],
    zIndex: 20,
  },
  emptySlot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySelected: {
    borderColor: Colors.accentGold,
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
    borderStyle: 'solid',
    borderWidth: 2.5,
  },
  emptyRole: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  plusSign: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    lineHeight: 12,
    fontWeight: 'bold',
  },
  filledSlot: {
    alignItems: 'center',
  },
  playerCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    backgroundColor: Colors.cream,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerImg: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    minWidth: 16,
    height: 14,
    borderRadius: 3,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  ratingText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nameTag: {
    marginTop: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    maxWidth: 62,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
});
