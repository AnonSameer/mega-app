// src/App.tsx
import React from 'react';
import { Dashboard } from '@/pages/Dashboard';
import '@/styles/globals.less';

const App: React.FC = () => {
  return (
    <div className="app">
      <Dashboard />
    </div>
  );
};

export default App;