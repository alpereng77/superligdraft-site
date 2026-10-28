import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/colors';

interface RetroHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
    label?: string;
  };
}

export const RetroHeader: React.FC<RetroHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  // Safe top padding ensuring header never overlaps camera cutout or status bar
  const headerPaddingTop = Math.max(insets.top, Platform.OS === 'android' ? 24 : 12);

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      (StatusBar as any).setBackgroundColor?.('#f5efe6', true);
    }
  }, []);

  return (
    <View style={[styles.container, { paddingTop: headerPaddingTop }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity
            style={[styles.backBtn, Shadows.brutalSm]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>◀ GERİ</Text>
          </TouchableOpacity>
        ) : (
          <Image
            source={require('../assets/draft.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}

        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {rightAction ? (
          <TouchableOpacity
            style={[styles.actionBtn, Shadows.brutalSm]}
            onPress={rightAction.onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>{rightAction.icon}</Text>
            {rightAction.label && (
              <Text style={styles.actionLabel}>{rightAction.label}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <View style={styles.borderLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5efe6',
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    minHeight: 46,
  },
  logo: {
    width: 90,
    height: 34,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
    marginTop: 1,
  },
  backBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  actionBtn: {
    backgroundColor: '#d4af37',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 70,
  },
  borderLine: {
    height: 2,
    backgroundColor: '#1a1a1a',
    marginHorizontal: -16,
  },
});
