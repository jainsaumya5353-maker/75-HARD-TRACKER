import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import DailyReport from './components/DailyReport';
import WeeklyReport from './components/WeeklyReport';
import MonthlyReport from './components/MonthlyReport';
import FullReport from './components/FullReport';
import { loadState, startChallenge } from './utils/storage';
import './App.css';

const TABS = [
  { id: 'today', label: '✨ Today', emoji: '✨' },
  { id: 'daily', label: '📋 Daily', emoji: '📋' },
  { id: 'weekly', label: '📊 Weekly', emoji: '📊' },
  { id: 'monthly', label: '📅 Monthly', emoji: '📅' },
  { id: 'full', label: '🏆 Report', emoji: '🏆' },
];

function App() {
  const [state, setState] = useState(() => loadState());
  const [activeTab, setActiveTab] = useState('today');

  const handleStart = () => {
    const newState = startChallenge();
    setState(newState);
  };

  // Show welcome if not active
  if (!state.isActive) {
    return (
      <div className="app">
        <WelcomeScreen onStart={handleStart} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return <Dashboard state={state} setState={setState} />;
      case 'daily':
        return <DailyReport state={state} />;
      case 'weekly':
        return <WeeklyReport state={state} setState={setState} />;
      case 'monthly':
        return <MonthlyReport state={state} />;
      case 'full':
        return <FullReport state={state} />;
      default:
        return <Dashboard state={state} setState={setState} />;
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1 className="header-title">75 Hard ✨</h1>
        <p className="header-subtitle">Self-Improvement Journey</p>
      </header>

      {/* Navigation */}
      <nav className="nav-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main>
        {renderContent()}
      </main>

      {/* Made with love */}
      <div style={{
        textAlign: 'center',
        padding: '24px 0 40px',
        fontSize: '0.72rem',
        color: 'var(--warm-gray-300)',
      }}>
        Made with 💕 for your self-improvement journey
      </div>
    </div>
  );
}

export default App;
