import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import MainMenuScreen from './components/screens/MainMenuScreen';
import MultiplayerSetupScreen from './components/screens/MultiplayerSetupScreen';
import LobbyScreen from './components/screens/LobbyScreen';
import MultiplayerSim2Screen from './components/screens/MultiplayerSim2Screen';
import MultiplayerSim4Screen from './components/screens/MultiplayerSim4Screen';
import LeagueResultsScreen from './components/screens/LeagueResultsScreen';
import FormationSetupScreen from './components/screens/FormationSetupScreen';
import DraftScreen from './components/screens/DraftScreen';
import TournamentScreen from './components/screens/TournamentScreen';
import SimulationScreen from './components/screens/SimulationScreen';
import MuseumScreen from './components/screens/MuseumScreen';
import TycoonScreen from './components/screens/TycoonScreen';
import TycoonModals from './components/modals/TycoonModals';
import PosterModal from './components/modals/PosterModal';
import PenaltyModal from './components/modals/PenaltyModal';
import PrivacyPolicyPage from './components/legal/PrivacyPolicyPage';
import TermsOfUsePage from './components/legal/TermsOfUsePage';

function AppContent() {
    const location = useLocation();
    const pathname = location.pathname;

    const isPrivacyPage = pathname === '/gizlilik-politikasi' || pathname === '/gizlilik-politikasi.html';
    const isTermsPage = pathname === '/kullanim-sartlari' || pathname === '/kullanim-sartlari.html';
    const isLegalPage = isPrivacyPage || isTermsPage;

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    // Initialize game logic when the game view is active
    useEffect(() => {
        if (!isLegalPage) {
            if (typeof window.initDraftGame === 'function') {
                window.initDraftGame();
            }
        }
    }, [isLegalPage]);

    return (
        <>
            {/* Game Screen Container - preserved in DOM so ongoing state and event bindings persist */}
            <div
                className={isLegalPage ? 'hidden' : ''}
                style={{ display: isLegalPage ? 'none' : 'block' }}
            >
                <div className="app-container max-w-[1280px] mx-auto p-[20px]">
                    <Header />

                    <main className="app-main">
                        <MainMenuScreen />
                        <MultiplayerSetupScreen />
                        <LobbyScreen />
                        <MultiplayerSim2Screen />
                        <MultiplayerSim4Screen />
                        <LeagueResultsScreen />
                        <FormationSetupScreen />
                        <DraftScreen />
                        <TournamentScreen />
                        <SimulationScreen />
                        <MuseumScreen />
                        <TycoonScreen />
                    </main>
                </div>

                <TycoonModals />
                <PosterModal />
                <PenaltyModal />
            </div>

            {/* React Router Routes for legal documentation */}
            <Routes>
                <Route path="/gizlilik-politikasi" element={<PrivacyPolicyPage />} />
                <Route
                    path="/gizlilik-politikasi.html"
                    element={<Navigate to="/gizlilik-politikasi" replace />}
                />
                <Route path="/kullanim-sartlari" element={<TermsOfUsePage />} />
                <Route
                    path="/kullanim-sartlari.html"
                    element={<Navigate to="/kullanim-sartlari" replace />}
                />
                <Route path="*" element={null} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(<App />);
}
