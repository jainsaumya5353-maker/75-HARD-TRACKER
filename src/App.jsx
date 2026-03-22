import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import DailyReport from './components/DailyReport';
import WeeklyReport from './components/WeeklyReport';
import MonthlyReport from './components/MonthlyReport';
import FullReport from './components/FullReport';
import { loadState, startChallenge, setUserId } from './utils/storage';
import { auth, signInWithGoogle, logout } from './utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        const resolvedState = await loadState(currentUser.uid);
        setState(resolvedState);
      } else {
        setUser(null);
        setUserId(null);
        const localState = await loadState(null);
        setState(localState);
      }
      setIsAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleStart = () => {
    const newState = startChallenge();
    setState(newState);
  };

  const handleLogin = async (user) => {
    // onAuthStateChanged will handle state reload, but we can do setup if needed
    const newState = startChallenge(); // if starting a new local challenge alongside
    if (!state.isActive) {
      setState(newState);
    }
  };

  // Wait for auth to settle
  if (isAuthLoading) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'var(--warm-gray-400)' }}>
        ✨ Loading...
      </div>
    );
  }

  // Show welcome if not active
  if (!state || !state.isActive) {
    return (
      <div className="app">
        <WelcomeScreen onStart={handleStart} onLogin={handleLogin} />
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
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="header-title">75 Hard ✨</h1>
          <p className="header-subtitle">Self-Improvement Journey</p>
        </div>
        <div>
          {user ? (
            <button onClick={() => logout()} style={{ background: 'transparent', border: '1px solid var(--pink-300)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', color: 'var(--pink-500)', cursor: 'pointer' }}>
              Log Out
            </button>
          ) : (
            <button onClick={() => signInWithGoogle()} style={{ background: 'var(--gradient-pink)', border: 'none', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', color: 'white', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              Sync Data
            </button>
          )}
        </div>
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
