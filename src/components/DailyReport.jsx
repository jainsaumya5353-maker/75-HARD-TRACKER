import React, { useState } from 'react';
import ProgressRing from './ProgressRing';
import { DAILY_HABITS, TOTAL_DAYS } from '../utils/constants';
import { getCurrentDayNumber, getDayKey, formatDateShort, getDateForDay } from '../utils/storage';

const DailyReport = ({ state }) => {
    const currentDay = getCurrentDayNumber(state.challengeStartDate);
    const maxDay = Math.min(currentDay, TOTAL_DAYS);
    const [selectedDay, setSelectedDay] = useState(maxDay);

    const dayKey = getDayKey(selectedDay);
    const dayData = state.days[dayKey] || { habits: {} };
    const completed = DAILY_HABITS.filter(h => dayData.habits[h.id]);
    const missed = DAILY_HABITS.filter(h => !dayData.habits[h.id]);
    const percentage = Math.round((completed.length / DAILY_HABITS.length) * 100);
    const isSuccess = completed.length === DAILY_HABITS.length;
    const viewDate = getDateForDay(state.challengeStartDate, selectedDay);

    return (
        <div className="report-section">
            {/* Day Selector */}
            <div className="card">
                <div className="card-title"><span className="emoji">📅</span> Select Day</div>
                <div className="days-grid">
                    {Array.from({ length: maxDay }, (_, i) => i + 1).map(day => {
                        const dk = getDayKey(day);
                        const dd = state.days[dk] || { habits: {} };
                        const completed = DAILY_HABITS.filter(h => dd.habits[h.id]).length;
                        const success = completed === DAILY_HABITS.length;
                        const failed = completed < DAILY_HABITS.length && day < currentDay;

                        return (
                            <div
                                key={day}
                                className={`day-cell ${day === selectedDay ? 'active' : ''} ${success ? 'success' : ''} ${failed ? 'failed' : ''}`}
                                onClick={() => setSelectedDay(day)}
                            >
                                <span className="day-cell-number">{day}</span>
                                <span className="day-cell-icon">
                                    {success ? '✅' : failed ? '•' : ''}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Daily Summary */}
            <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--warm-gray-400)', marginBottom: 8 }}>
                    Day {selectedDay} — {formatDateShort(viewDate)}
                </div>
                <ProgressRing percentage={percentage} size={140} label={isSuccess ? 'Complete!' : 'Done'} />
                <div className={`completion-status ${isSuccess ? 'success' : percentage > 0 ? 'in-progress' : 'danger'}`}>
                    {isSuccess ? '✅ All habits completed!' : `${completed.length}/${DAILY_HABITS.length} habits completed`}
                </div>
            </div>

            {/* Completed Habits */}
            {completed.length > 0 && (
                <div className="card">
                    <div className="card-title"><span className="emoji">✅</span> Completed ({completed.length})</div>
                    {completed.map(h => (
                        <div key={h.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 0',
                            fontSize: '0.85rem',
                            color: 'var(--warm-gray-500)',
                            borderBottom: '1px solid rgba(255,200,217,0.1)',
                        }}>
                            <span>{h.emoji}</span>
                            <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{h.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Missed Habits */}
            {missed.length > 0 && selectedDay < currentDay && (
                <div className="card">
                    <div className="card-title"><span className="emoji">❌</span> Missed ({missed.length})</div>
                    {missed.map(h => (
                        <div key={h.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 0',
                            fontSize: '0.85rem',
                            color: '#c06060',
                            borderBottom: '1px solid rgba(244,148,148,0.1)',
                        }}>
                            <span>{h.emoji}</span>
                            <span>{h.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Notes for the day */}
            {state.notes?.[dayKey] && (
                <div className="card">
                    <div className="card-title"><span className="emoji">📝</span> Notes</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray-500)', lineHeight: 1.7 }}>
                        {state.notes[dayKey]}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DailyReport;
