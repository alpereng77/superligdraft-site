import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashScreen } from './src/screens/SplashScreen';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { FormationSetupScreen } from './src/screens/FormationSetupScreen';
import { DraftScreen } from './src/screens/DraftScreen';
import { SimulationScreen } from './src/screens/SimulationScreen';
import { TournamentScreen } from './src/screens/TournamentScreen';
import { MultiplayerScreen } from './src/screens/MultiplayerScreen';
import { LeagueResultsScreen } from './src/screens/LeagueResultsScreen';
import { MuseumScreen } from './src/screens/MuseumScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { TycoonScreen } from './src/screens/TycoonScreen';
import { Colors } from './src/theme/colors';

export type RootStackParamList = {
  Splash: undefined;
  MainMenu: undefined;
  FormationSetup:
    | { mode?: string; roomCode?: string; username?: string }
    | undefined;
  Draft:
    | {
        formation?: string;
        mode?: string;
        roomCode?: string;
        username?: string;
        match?: any;
      }
    | undefined;
  Simulation:
    | {
        homeTeam?: any;
        awayTeam?: any;
        roundName?: string;
        roundIndex?: number;
        mode?: string;
        roomCode?: string;
        username?: string;
        roomData?: any;
        match?: any;
        standings?: any;
        champion?: any;
      }
    | undefined;
  Tournament:
    | {
        userSquad?: any;
        teamOvr?: number;
        teamAtk?: number;
        teamDef?: number;
        formation?: string;
        completedResult?: any;
      }
    | undefined;
  Multiplayer:
    | {
        roomCode?: string;
        username?: string;
        inWaitingState?: boolean;
      }
    | undefined;
  LeagueResults:
    | {
        roomData?: any;
        match?: any;
        username?: string;
        userSquad?: any;
        userFormation?: string;
      }
    | undefined;
  Museum: undefined;
  About: undefined;
  Tycoon: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: Colors.cream },
            statusBarStyle: 'dark',
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="MainMenu" component={MainMenuScreen} />
          <Stack.Screen name="FormationSetup" component={FormationSetupScreen} />
          <Stack.Screen name="Draft" component={DraftScreen} />
          <Stack.Screen name="Simulation" component={SimulationScreen} />
          <Stack.Screen name="Tournament" component={TournamentScreen} />
          <Stack.Screen name="Multiplayer" component={MultiplayerScreen} />
          <Stack.Screen name="LeagueResults" component={LeagueResultsScreen} />
          <Stack.Screen name="Museum" component={MuseumScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="Tycoon" component={TycoonScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
