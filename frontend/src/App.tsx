import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import ScoreView from './screens/ScoreView';
import ProjectedMode from './screens/ProjectedMode';
import Transactions from './screens/Transactions';
import Learn from './screens/Learn';

const AppContent: React.FC = () => {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <Onboarding />;
      case 'home':
      case 'pet':
        return <Home />;
      case 'score':
        return (
          <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <ScoreView />
            </div>
          </div>
        );
      case 'projected':
        return (
          <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <ProjectedMode />
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <Transactions />
            </div>
          </div>
        );
      case 'learn':
        return (
          <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <Learn />
            </div>
          </div>
        );
      default:
        return <Onboarding />;
    }
  };

  return <>{renderScreen()}</>;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
