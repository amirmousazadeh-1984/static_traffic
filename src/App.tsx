import { useState } from 'react';
import { IntersectionList } from './components/IntersectionList';
import { IntersectionDetails } from './components/IntersectionDetails';
import { ZoneCalibration } from './components/ZoneCalibration';
import { PTZCalibration } from './components/PTZCalibration';
import { IntersectionDashboard } from './components/IntersectionDashboard';
import { Intersection } from './types';

type AppView = 'list' | 'details' | 'zone-calibration' | 'ptz-calibration' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('list');
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null);

  const handleSelectIntersection = (intersection: Intersection) => {
    setSelectedIntersection(intersection);
    setCurrentView('details');
  };

  const handleStartCalibration = (type: 'zones' | 'ptz') => {
    if (type === 'zones') {
      setCurrentView('zone-calibration');
    } else {
      setCurrentView('ptz-calibration');
    }
  };

  const handleOpenDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedIntersection(null);
  };

  const handleBackToDetails = () => {
    setCurrentView('details');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'list' && (
        <IntersectionList onSelectIntersection={handleSelectIntersection} />
      )}

      {currentView === 'details' && selectedIntersection && (
        <IntersectionDetails
          intersection={selectedIntersection}
          onBack={handleBackToList}
          onStartCalibration={handleStartCalibration}
          onOpenDashboard={handleOpenDashboard}
        />
      )}

      {currentView === 'zone-calibration' && selectedIntersection && (
        <ZoneCalibration
          intersection={selectedIntersection}
          onBack={handleBackToDetails}
          onComplete={handleBackToDetails}
        />
      )}

      {currentView === 'ptz-calibration' && selectedIntersection && (
        <PTZCalibration
          intersection={selectedIntersection}
          onBack={handleBackToDetails}
          onComplete={handleBackToDetails}
        />
      )}

      {currentView === 'dashboard' && selectedIntersection && (
        <IntersectionDashboard
          intersection={selectedIntersection}
          onBack={handleBackToDetails}
        />
      )}
    </div>
  );
}

export default App;