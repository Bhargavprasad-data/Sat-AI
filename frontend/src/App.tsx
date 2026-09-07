import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import type { ThemeType } from './components/TopBar';
import type { ResultTab } from './types';
import { Workspace } from './components/Workspace';
import { SplashScreen } from './components/SplashScreen';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario_b_change');
  const [activeView, setActiveView] = useState<'config' | 'results' | 'satellite_search'>('config');
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>('region');
  const [hasResult, setHasResult] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark');

  // Backend Health state - defaults to false until backend responds online
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Poll backend health periodically
  const checkBackendHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
      }
    } catch {
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 2000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  const handleGoHome = () => {
    setActiveView('config');
    setSelectedScenarioId('scenario_b_change');
  };

  const handleGoSatelliteSearch = () => {
    setActiveView('satellite_search');
  };

  const handleSelectResultTab = (tab: ResultTab) => {
    setActiveResultTab(tab);
    setActiveView('results');
  };

  const handleResetDemo = () => {
    handleGoHome();
    setHasResult(false);
    setIsProcessing(false);
    setActiveResultTab('region');
    setResetKey((prev) => prev + 1);
    checkBackendHealth();
  };

  return (
    <>
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            setShowSplash(false);
            handleGoHome();
          }}
        />
      )}
      <div className="postman-dashboard-layout" data-theme={currentTheme}>
        {/* 1. Hotstar / JioCinema Style Expandable Sidebar */}
        <Sidebar
          onGoHome={handleGoHome}
          onGoSatelliteSearch={handleGoSatelliteSearch}
          isHomeActive={activeView === 'config'}
          isBackendConnected={isBackendConnected}
          activeView={activeView}
          activeResultTab={activeResultTab}
          onSelectResultTab={handleSelectResultTab}
          hasResult={hasResult}
          isProcessing={isProcessing}
        />

        {/* 2. Main Dashboard Shell */}
        <div className="dashboard-main-shell">
          {/* Postman Style Top Command Bar */}
          <TopBar
            onGoHome={handleGoHome}
            onResetDemo={handleResetDemo}
            isBackendConnected={isBackendConnected}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentTheme={currentTheme}
            onSelectTheme={setCurrentTheme}
          />

          {/* Viewport Content: Direct Core Product Workspace */}
          <main className="dashboard-content-body">
            <Workspace
              key={`${selectedScenarioId}-${resetKey}`}
              initialScenarioId={selectedScenarioId}
              isBackendOffline={!isBackendConnected}
              onRetryHandshake={checkBackendHealth}
              activeView={activeView}
              onViewChange={setActiveView}
              activeResultTab={activeResultTab}
              onSelectResultTab={setActiveResultTab}
              onResultGenerated={() => {
                setHasResult(true);
                setIsProcessing(false);
              }}
              onProcessingChange={(loading) => {
                setIsProcessing(loading);
                if (loading) setHasResult(false);
              }}
            />
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
