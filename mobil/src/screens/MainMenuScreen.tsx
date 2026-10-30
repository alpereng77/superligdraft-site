import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MainMenuScreenProps {
  navigation: any;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, insets.top, 24) + 6
      : 10;
  const bottomPadding = Math.max(insets.bottom, 16);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPadding, paddingBottom: bottomPadding + 14 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuContainer}>
          <View style={styles.ribbonWrapper}>
            <View style={styles.ribbonBadge}>
              <Text style={styles.ribbonText}>2000'LER</Text>
            </View>
          </View>
          <View style={styles.logoArea}>
            <Text style={styles.mainTitle}>SÜPER LİG DRAFT</Text>
            <View style={styles.doubleDivider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.subtitle}>
              TÜRK FUTBOL TARİHİNİN EFSANE KADROLARINI YENİDEN KUR VE YARIŞTIR!
            </Text>
          </View>
          <View style={styles.modesList}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('FormationSetup')}
              style={[styles.modeCard, styles.classicCard]}
            >
              <View style={[styles.cardBadge, { backgroundColor: '#3b9966' }]}>
                <Text style={styles.cardBadgeText}>TEK OYUNCULU</Text>
              </View>

              <View style={styles.cardInner}>
                <View style={styles.iconBox}>
                  <Text style={styles.modeIcon}>🎮</Text>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>KLASİK MOD (TURNUVA)</Text>
                  <Text style={styles.cardDesc}>
                    Tek başına oyna. Kadronu kur, efsanevi rakiplerine karşı
                    kupayı kaldır!
                  </Text>
                </View>

                <Text style={styles.arrowIcon}>›</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Multiplayer')}
              style={[styles.modeCard, styles.derbyCard]}
            >
              <View style={[styles.cardBadge, { backgroundColor: '#e05638' }]}>
                <Text style={styles.cardBadgeText}>1V1 DERBİ</Text>
              </View>

              <View style={styles.cardInner}>
                <View style={styles.iconBox}>
                  <Text style={styles.modeIcon}>👥</Text>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>2 OYUNCULU DERBİ</Text>
                  <Text style={styles.cardDesc}>
                    Arkadaşını davet et! Karşılıklı kadro kurun, teke tek derbi
                    heyecanını yaşayın.
                  </Text>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Museum')}
              style={[styles.modeCard, styles.museumCard]}
            >
              <View style={[styles.cardBadge, { backgroundColor: '#d4af37' }]}>
                <Text style={styles.cardBadgeText}>🏆 MÜZE</Text>
              </View>

              <View style={styles.cardInner}>
                <View style={styles.iconBox}>
                  <Text style={styles.modeIcon}>🏛️</Text>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>
                    KUPA MÜZESİ & İSTATİSTİKLER
                  </Text>
                  <Text style={styles.cardDesc}>
                    Kazandığın kupaları, efsane kadrolarını ve kariyer
                    istatistiklerini incele.
                  </Text>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.menuFooter}>
            <Text style={styles.footerMono}>www.superligdraft.site</Text>
          </View>
        </View>
        <View style={styles.rehberBtnContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('About')}
            style={styles.rehberBtn}
          >
            <Text style={styles.rehberChevron}>⌵</Text>
            <Text style={styles.rehberBtnText}>REHBER & DETAYLAR</Text>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 3.5,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    padding: 20,
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
    paddingVertical: 5,
    paddingHorizontal: 28,
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  ribbonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 30,
    maxWidth: '80%',
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 0.8,
    textAlign: 'center',
    lineHeight: 10,
    fontFamily: 'Courier',
    marginTop: 2,
  },
  modesList: {
    gap: 16,
  },
  modeCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 18,
    position: 'relative',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  classicCard: {
    borderLeftWidth: 10,
    borderLeftColor: '#3b9966',
  },
  derbyCard: {
    borderLeftWidth: 10,
    borderLeftColor: '#e05638',
  },
  museumCard: {
    borderLeftWidth: 10,
    borderLeftColor: '#d4af37',
  },
  cardBadge: {
    position: 'absolute',
    top: -10,
    left: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    borderRadius: 2,
  },
  cardBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIcon: {
    fontSize: 26,
  },
  cardInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 11,
    color: '#444444',
    lineHeight: 16,
    fontWeight: '600',
  },
  arrowIcon: {
    fontSize: 26,
    fontWeight: '900',
    color: '#666666',
    marginLeft: 4,
  },
  menuFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#1a1a1a',
    borderStyle: 'dashed',
    paddingTop: 12,
    marginTop: 22,
  },
  footerMono: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    fontFamily: 'Courier',
  },
  rehberBtnContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  rehberBtn: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 3,
  },
  rehberChevron: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  rehberBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
