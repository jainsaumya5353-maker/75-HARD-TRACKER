import React from 'react';

const WelcomeScreen = ({ onStart }) => {
    return (
        <div className="welcome-screen">
            <div className="welcome-icon">🌸</div>
            <h1 className="welcome-title">75 Hard Challenge</h1>
            <p className="welcome-desc">
                Your personal self-improvement companion. Track daily habits, stay accountable, and transform your life — one day at a time.
            </p>

            <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                marginBottom: '24px',
                maxWidth: '320px',
                width: '100%',
                border: '1px solid rgba(255, 200, 217, 0.3)',
                textAlign: 'left',
            }}>
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.95rem',
                    color: 'var(--warm-gray-700)',
                    marginBottom: '12px',
                }}>
                    ✨ The Rules
                </h3>
                <ul style={{
                    listStyle: 'none',
                    fontSize: '0.82rem',
                    color: 'var(--warm-gray-500)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                }}>
                    <li>🎯 Complete 13 daily habits every day</li>
                    <li>📅 Track for 75 consecutive days</li>
                    <li>⚠️ Miss 2+ habits → Challenge resets</li>
                    <li>🔥 Build streaks and consistency</li>
                    <li>📊 Track your progress visually</li>
                </ul>
            </div>

            <button className="btn btn-primary" onClick={onStart}>
                ✨ Start My Journey
            </button>

            <p style={{
                fontSize: '0.72rem',
                color: 'var(--warm-gray-300)',
                marginTop: '16px',
            }}>
                Challenge starts tomorrow 🌅
            </p>
        </div>
    );
};

export default WelcomeScreen;
