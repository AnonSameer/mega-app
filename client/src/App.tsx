// client/src/App.tsx
import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PinAuth } from '@/components/features/PinAuth';
import { Dashboard } from '@/pages/Dashboard';
import '@/styles/globals.less';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading, error } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">Checking authentication...</div>
      </div>
    );
  }

  // Show error if there's an auth error (optional)
  if (error && error.statusCode !== 401) {
    return (
      <div className="app-error">
        <h2>Authentication Error</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // ✅ Now both PinAuth and this component share the same auth state
  if (!isAuthenticated) {
    return <PinAuth />;
  }

  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;