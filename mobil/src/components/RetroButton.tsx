import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';

interface RetroButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'gold' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.cardBorder;
    switch (variant) {
      case 'primary':
        return Colors.accentGreen;
      case 'secondary':
        return Colors.accentBlue;
      case 'accent':
        return Colors.accentRed;
      case 'danger':
        return Colors.accentRed;
      case 'gold':
        return Colors.accentGold;
      case 'outline':
        return Colors.cream;
      default:
        return Colors.accentGreen;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#888888';
    switch (variant) {
      case 'gold':
      case 'outline':
        return Colors.inkBlack;
      default:
        return '#FFFFFF';
    }
  };

  const sizeStyles = {
    sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 12 },
    md: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
    lg: { paddingVertical: 14, paddingHorizontal: 22, fontSize: 16 },
  }[size];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        Shadows.brutal,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor(), fontSize: sizeStyles.fontSize },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {icon ? `${icon} ` : ''}
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderColor: Colors.borderDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.6,
  },
});

