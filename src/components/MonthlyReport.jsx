import React, { useMemo } from 'react';
import { DAILY_HABITS, TOTAL_DAYS } from '../utils/constants';
import { getCurrentDayNumber, getDayKey, getDateForDay, formatDateShort } from '../utils/storage';

const MonthlyReport = ({ state }) => {
    const currentDay = getCurrentDayNumber(state.challengeStartDate);

    // Calendar data
    const calendarData = useMemo(() => {
        const data = [];
        for (let d = 1; d <= Math.min(currentDay, TOTAL_DAYS); d++) {
            const dk = getDayKey(d);
            const dd = state.days[dk] || { habits: {} };
            const completed = DAILY_HABITS.filter(h => dd.habits[h.id]).length;
            const date = getDateForDay(state.challengeStartDate, d);
            data.push({
                day: d,
                date,
                completed,
                total: DAILY_HABITS.length,
                success: completed === DAILY_HABITS.length,
                percentage: Math.round((completed / DAILY_HABITS.length) * 100),
            });
        }
        return data;
    }, [state.days, currentDay, state.challengeStartDate]);

    // Compute streaks
    const streaks = useMemo(() => {
        let current = 0;
        let longest = 0;
        let allStreaks = [];

        for (const day of calendarData) {
            if (day.success) {
                current++;
                longest = Math.max(longest, current);
            } else {
                if (current > 0) allStreaks.push(current);
                current = 0;
            }
        }
        if (current > 0) allStreaks.push(current);

        return { current, longest, allStreaks };
    }, [calendarData]);

    // Best/worst days
    const bestDay = calendarData.reduce((best, day) =>
        day.percentage > (best?.percentage || 0) ? day : best
        , null);

    const missedDays = calendarData.filter(d => !d.success && d.day < currentDay).length;
    const successDays = calendarData.filter(d => d.success).length;

    // Build calendar grid
    const calendarGrid = useMemo(() => {
        if (calendarData.length === 0) return { weeks: [], startOffset: 0 };

        const firstDate = new Date(state.challengeStartDate);
        const startOffset = firstDate.getDay(); // 0 = Sun
        const totalSlots = startOffset + Math.min(currentDay, TOTAL_DAYS);
        const weeks = Math.ceil(totalSlots / 7);

        const grid = [];
        let dayIndex = 0;

        for (let w = 0; w < weeks; w++) {
            const row = [];
            for (let d = 0; d < 7; d++) {
                const slotIndex = w * 7 + d;
                if (slotIndex < startOffset || dayIndex >= calendarData.length) {
                    row.push(null);
                } else {
                    row.push(calendarData[dayIndex]);
                    dayIndex++;
                }
            }
            grid.push(row);
        }

        return grid;
    }, [calendarData, state.challengeStartDate, currentDay]);

    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="report-section">
            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{streaks.longest}</div>
                    <div className="stat-label">🔥 Best Streak</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{streaks.current}</div>
                    <div className="stat-label">⚡ Current Streak</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{successDays}</div>
                    <div className="stat-label">✅ Perfect Days</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{missedDays}</div>
                    <div className="stat-label">❌ Missed Days</div>
                </div>
            </div>

            {/* Calendar View */}
            <div className="card">
                <div className="card-title"><span className="emoji">📅</span> Progress Calendar</div>
                <div className="calendar-grid">
                    {dayHeaders.map((h, i) => (
                        <div key={i} className="calendar-header-cell">{h}</div>
                    ))}
                    {calendarGrid.flat().map((cell, index) => {
                        if (!cell) {
                            return <div key={`empty-${index}`} className="calendar-cell empty" />;
                        }
                        const isCurrentDay = cell.day === currentDay;
                        const isFuture = cell.day > currentDay;
                        return (
                            <div
                                key={cell.day}
                                className={`calendar-cell ${cell.success ? 'success' : cell.day < currentDay ? 'failed' : ''} ${isCurrentDay ? 'today' : ''} ${isFuture ? 'future' : ''}`}
                                title={`Day ${cell.day}: ${cell.percentage}% completed`}
                            >
                                {cell.day}
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(134, 212, 168, 0.3)' }} />
                        <span style={{ fontSize: '0.7rem', color: '#b0a89e' }}>Complete</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(244, 148, 148, 0.3)' }} />
                        <span style={{ fontSize: '0.7rem', color: '#b0a89e' }}>Missed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, border: '2px solid #f8a4be' }} />
                        <span style={{ fontSize: '0.7rem', color: '#b0a89e' }}>Today</span>
                    </div>
                </div>
            </div>

            {/* Habit Completion Trends */}
            <div className="card">
                <div className="card-title"><span className="emoji">📊</span> Habit Completion Rates</div>
                {DAILY_HABITS.map(habit => {
                    const completedCount = calendarData.filter(d => d.day < currentDay && state.days[getDayKey(d.day)]?.habits[habit.id]).length;
                    const totalDays = Math.max(currentDay - 1, 1);
                    const rate = Math.round((completedCount / totalDays) * 100);

                    return (
                        <div key={habit.id} className="habit-bar">
                            <span className="habit-bar-label">{habit.emoji} {habit.label}</span>
                            <div className="habit-bar-track">
                                <div className="habit-bar-fill" style={{ width: `${rate}%` }} />
                            </div>
                            <span className="habit-bar-value">{rate}%</span>
                        </div>
                    );
                })}
            </div>

            {bestDay && (
                <div className="card">
                    <div className="card-title"><span className="emoji">🌟</span> Best Day</div>
                    <p style={{ fontSize: '0.88rem', color: '#6e6660' }}>
                        Day {bestDay.day} — {formatDateShort(bestDay.date)} — {bestDay.percentage}% completed
                    </p>
                </div>
            )}
        </div>
    );
};

export default MonthlyReport;
