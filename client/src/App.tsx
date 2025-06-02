// client/src/App.tsx
import React from 'react';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { PinAuth } from '@/components/features/PinAuth';
import { Dashboard } from '@/pages/Dashboard';
import '@/styles/globals.less';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <PinAuth />;
  }

  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;