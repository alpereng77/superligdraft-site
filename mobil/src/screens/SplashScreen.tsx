import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { fetchNostaljiDatabase } from '../services/api';

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let isMounted = true;

    const prepareApp = async () => {
      try {
        await fetchNostaljiDatabase();
      } catch (err) {
        console.warn('Dataset load warning:', err);
      } finally {
        if (isMounted) {
          setTimeout(() => {
            navigation.replace('MainMenu');
          }, 800);
        }
      }
    };

    prepareApp();

    return () => {
      isMounted = false;
    };
  }, [navigation]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      (StatusBar as any).setBackgroundColor?.('#f5efe6', true);
    }
  }, []);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.card}>
        <View style={styles.ribbonWrapper}>
          <View style={styles.ribbonBadge}>
            <Text style={styles.ribbonText}>2000'LER</Text>
          </View>
        </View>

        <Image
          source={require('../assets/draftsplash.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>SÜPER LİG DRAFT</Text>

        <View style={styles.doubleDivider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.subtitle}>
          TÜRK FUTBOL TARİHİNİN EFSANE KADROLARINI YENİDEN KUR VE YARIŞTIR!
        </Text>

        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color="#3b9966" />
          <Text style={styles.loadingText}>YÜKLENİYOR...</Text>
          <Text style={styles.loadingSub}>
            Nostaljik Veri Tabanı Hazırlanıyor
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerMono}>SERİ No: #SL-2004-2026</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5efe6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderWidth: 3.5,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  ribbonWrapper: {
    position: 'absolute',
    top: 14,
    right: -24,
    zIndex: 10,
    transform: [{ rotate: '15deg' }],
  },
  ribbonBadge: {
    backgroundColor: '#e05638',
    paddingVertical: 4,
    paddingHorizontal: 26,
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  ribbonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 10,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 2,
    textAlign: 'center',
  },
  doubleDivider: {
    width: '75%',
    marginVertical: 8,
    gap: 3,
  },
  dividerLine: {
    height: 2,
    backgroundColor: '#1a1a1a',
  },
  subtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 0.8,
    textAlign: 'center',
    lineHeight: 14,
    fontFamily: 'Courier',
    marginBottom: 24,
  },
  loaderBox: {
    backgroundColor: '#f5efe6',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1.5,
  },
  loadingSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
    marginTop: 3,
  },
  footerRow: {
    borderTopWidth: 1.5,
    borderTopColor: '#1a1a1a',
    borderStyle: 'dashed',
    width: '100%',
    paddingTop: 10,
    alignItems: 'center',
  },
  footerMono: {
    fontSize: 9,
    fontWeight: '700',
    color: '#666666',
    fontFamily: 'Courier',
  },
});
