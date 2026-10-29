import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { RetroHeader } from '../components/RetroHeader';

interface FormationSetupScreenProps {
  navigation: any;
  route: any;
}

const FORMATIONS = [
  { code: '4-4-2', tag: 'Klasik & Dengeli' },
  { code: '4-3-3', tag: 'Hücumcu Kanatlar' },
  { code: '3-5-2', tag: 'Orta Saha Üstünlüğü' },
  { code: '4-2-3-1', tag: 'Modern Taktik' },
  { code: '5-3-2', tag: 'Defansif Kontra' },
];

export const FormationSetupScreen: React.FC<FormationSetupScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedFormation, setSelectedFormation] = useState<string>('4-4-2');
  const mode = route.params?.mode || 'tournament';
  const roomCode = route.params?.roomCode;
  const username = route.params?.username;

  const handleStartDraft = () => {
    navigation.navigate('Draft', {
      formation: selectedFormation,
      mode,
      roomCode,
      username,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <RetroHeader showBack onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <Text style={styles.title}>FORMASYON SEÇİN</Text>
          <Text style={styles.desc}>
            Kadro düzeninizi seçin ve tarihi Süper Lig takımlarından oyuncular çekmek için zarı atın!
          </Text>

          <View style={styles.formationsList}>
            {FORMATIONS.map(item => {
              const isSelected = selectedFormation === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  activeOpacity={0.8}
                  onPress={() => setSelectedFormation(item.code)}
                  style={[
                    styles.formationItem,
                    isSelected && styles.formationItemSelected,
                  ]}
                >
                  <Text style={styles.formationCode}>{item.code}</Text>
                  <Text
                    style={[
                      styles.formationTag,
                      isSelected && styles.formationTagSelected,
                    ]}
                  >
                    {item.tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleStartDraft}
            style={styles.startBtn}
          >
            <Text style={styles.startBtnText}>DRAFT'I BAŞLAT ➔</Text>
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
    padding: 16,
    justifyContent: 'center',
    minHeight: '85%',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  desc: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  formationsList: {
    width: '100%',
    gap: 12,
    marginBottom: 28,
  },
  formationItem: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formationItemSelected: {
    backgroundColor: '#fff2cc',
    borderWidth: 2.5,
  },
  formationCode: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  formationTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
  },
  formationTagSelected: {
    color: '#1a1a1a',
  },
  startBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

