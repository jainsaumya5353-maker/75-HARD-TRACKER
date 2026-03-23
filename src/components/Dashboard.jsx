import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import HabitItem from './HabitItem';
import ProgressRing from './ProgressRing';
import QuoteCard from './QuoteCard';
import Modal from './Modal';
import {
    DAILY_HABITS,
    WEEKLY_HABITS,
    TOTAL_DAYS,
    MAX_MISSED_DAILY,
} from '../utils/constants';
import {
    saveState,
    getDayKey,
    getWeekNumber,
    getWeekKey,
    formatDate,
    getCurrentDayNumber,
    getDateForDay,
    getLogicalDate,
} from '../utils/storage';

const Dashboard = ({ state, setState }) => {
    const currentDayNumber = getCurrentDayNumber(state.challengeStartDate);
    const [viewingDay, setViewingDay] = useState(Math.min(currentDayNumber, TOTAL_DAYS));
    const [showResetModal, setShowResetModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showSaveIndicator, setShowSaveIndicator] = useState(false);
    const [focusText, setFocusText] = useState('');
    const [notes, setNotes] = useState('');

    const dayKey = getDayKey(viewingDay);
    const viewingDate = getDateForDay(state.challengeStartDate, viewingDay);
    const weekNumber = getWeekNumber(state.challengeStartDate, viewingDate);
    const weekKey = getWeekKey(weekNumber);
    const isToday = viewingDay === currentDayNumber;
    const isFutureDay = viewingDay > currentDayNumber;
    const isPastDay = viewingDay < currentDayNumber;

    // Load day data
    const dayData = state.days[dayKey] || { habits: {}, completed: false, failed: false };
    const weeklyData = state.weeklyHabits[weekKey] || {};

    useEffect(() => {
        setNotes(state.notes?.[dayKey] || '');
        setFocusText(state.days?.[dayKey]?.focus || '');
    }, [dayKey, state.notes, state.days]);

    useEffect(() => {
        setViewingDay(Math.min(currentDayNumber, TOTAL_DAYS));
    }, [currentDayNumber]);

    // Calculate completions
    const dailyCompleted = DAILY_HABITS.filter(h => dayData.habits[h.id]).length;
    const dailyTotal = DAILY_HABITS.length;
    const dailyPercentage = (dailyCompleted / dailyTotal) * 100;
    const missedCount = dailyTotal - dailyCompleted;

    const triggerCelebration = useCallback(() => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: ['#f48ba8', '#c9a8f8', '#94c8f4', '#86d4a8', '#f0c878', '#ffc8d9'],
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: ['#f48ba8', '#c9a8f8', '#94c8f4', '#86d4a8', '#f0c878', '#ffc8d9'],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();
    }, []);

    const showSave = useCallback(() => {
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 2000);
    }, []);

    const toggleDailyHabit = useCallback((habitId) => {
        if (isFutureDay) return;

        setState(prev => {
            const dayKey = getDayKey(viewingDay);
            const prevDayData = prev.days[dayKey] || { habits: {}, completed: false, failed: false };
            const newChecked = !prevDayData.habits[habitId];
            const newHabits = { ...prevDayData.habits, [habitId]: newChecked };
            const newCompleted = DAILY_HABITS.filter(h => newHabits[h.id]).length;
            const allDone = newCompleted === DAILY_HABITS.length;

            const newDayData = {
                ...prevDayData,
                habits: newHabits,
                completed: allDone,
            };

            const newState = {
                ...prev,
                days: { ...prev.days, [dayKey]: newDayData },
            };

            // Check if all daily habits done + show celebration
            if (allDone && !prevDayData.completed) {
                setTimeout(() => {
                    triggerCelebration();
                    setShowSuccessModal(true);
                }, 300);
            }

            saveState(newState);
            return newState;
        });

        showSave();
    }, [viewingDay, isFutureDay, setState, triggerCelebration, showSave]);

    const toggleWeeklyHabit = useCallback((habitId) => {
        if (isFutureDay) return;

        setState(prev => {
            const newWeeklyData = { ...prev.weeklyHabits[weekKey], [habitId]: !prev.weeklyHabits?.[weekKey]?.[habitId] };
            const newState = {
                ...prev,
                weeklyHabits: { ...prev.weeklyHabits, [weekKey]: newWeeklyData },
            };
            saveState(newState);
            return newState;
        });

        showSave();
    }, [weekKey, isFutureDay, setState, showSave]);

    const saveNotes = useCallback((text) => {
        setNotes(text);
        setState(prev => {
            const newState = {
                ...prev,
                notes: { ...prev.notes, [dayKey]: text },
            };
            saveState(newState);
            return newState;
        });
    }, [dayKey, setState]);

    const saveFocus = useCallback((text) => {
        setFocusText(text);
        setState(prev => {
            const prevDayData = prev.days[dayKey] || { habits: {}, completed: false, failed: false };
            const newState = {
                ...prev,
                days: { ...prev.days, [dayKey]: { ...prevDayData, focus: text } },
            };
            saveState(newState);
            return newState;
        });
    }, [dayKey, setState]);

    // End of day evaluation for past days
    const evaluateDay = useCallback((dayNum) => {
        const dk = getDayKey(dayNum);
        const dd = state.days[dk] || { habits: {} };
        const completed = DAILY_HABITS.filter(h => dd.habits[h.id]).length;
        const missed = DAILY_HABITS.length - completed;
        return {
            completed,
            missed,
            success: missed <= MAX_MISSED_DAILY,
            allDone: completed === DAILY_HABITS.length,
        };
    }, [state.days]);

    // Check for resets needed
    const handleEndOfDay = useCallback(() => {
        if (!isPastDay && !isToday) return;
        const evaluation = evaluateDay(viewingDay);
        if (evaluation.missed > MAX_MISSED_DAILY && !dayData.failed) {
            setShowResetModal(true);
        }
    }, [isPastDay, isToday, viewingDay, evaluateDay, dayData.failed]);

    const handleReset = useCallback(() => {
        setState(prev => {
            const newState = {
                ...prev,
                totalRestarts: prev.totalRestarts + 1,
                longestStreak: Math.max(prev.longestStreak, prev.currentStreak),
                currentStreak: 0,
                challengeStartDate: getLogicalDate().toISOString().split('T')[0],
                days: {},
                weeklyHabits: {},
                notes: {},
                weeklyReflections: {},
                currentDay: 1,
            };
            saveState(newState);
            return newState;
        });
        setShowResetModal(false);
        setViewingDay(1);
    }, [setState]);

    // Compute streak
    const computeStreak = () => {
        let streak = 0;
        for (let d = currentDayNumber - 1; d >= 1; d--) {
            const dk = getDayKey(d);
            const dd = state.days[dk] || { habits: {} };
            const completed = DAILY_HABITS.filter(h => dd.habits[h.id]).length;
            if (completed === DAILY_HABITS.length) {
                streak++;
            } else {
                break;
            }
        }
        // Check today if all done
        if (dailyCompleted === DAILY_HABITS.length && isToday) {
            streak++;
        }
        return streak;
    };

    const streak = computeStreak();

    // Day status
    const getDayStatus = () => {
        if (isFutureDay) return 'future';
        if (dayData.completed || dailyCompleted === dailyTotal) return 'success';
        if (isPastDay && missedCount > MAX_MISSED_DAILY) return 'failed';
        return 'in-progress';
    };

    const dayStatus = getDayStatus();

    const overallProgress = ((Math.min(currentDayNumber, TOTAL_DAYS) - 1) / TOTAL_DAYS) * 100;

    return (
        <div className="report-section">
            {/* Day Navigation */}
            <div className="day-nav">
                <button
                    className="day-nav-btn"
                    onClick={() => setViewingDay(Math.max(1, viewingDay - 1))}
                    disabled={viewingDay <= 1}
                >
                    ←
                </button>
                <span className="day-nav-label">
                    {isToday ? "Today" : isPastDay ? "Past" : "Future"}
                </span>
                <button
                    className="day-nav-btn"
                    onClick={() => setViewingDay(Math.min(TOTAL_DAYS, viewingDay + 1))}
                    disabled={viewingDay >= TOTAL_DAYS}
                >
                    →
                </button>
            </div>

            {/* Day Info */}
            <div className="day-info">
                <div className="day-number">
                    Day {viewingDay} <span>of {TOTAL_DAYS}</span>
                </div>
                <div className="day-date">{formatDate(viewingDate)}</div>
                {streak > 0 && isToday && (
                    <div className="streak-badge">
                        <span className="fire">🔥</span>
                        {streak} day streak
                    </div>
                )}
            </div>

            {/* Quote */}
            <QuoteCard dayNumber={viewingDay} />

            {/* Overall Progress Bar */}
            <div className="card animate-in">
                <div className="progress-bar-container">
                    <div className="progress-bar-info">
                        <span className="progress-bar-label">75 Hard Progress</span>
                        <span className="progress-bar-value">Day {Math.min(currentDayNumber, TOTAL_DAYS)} / {TOTAL_DAYS}</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }} />
                    </div>
                </div>
            </div>

            {/* Daily Progress Ring */}
            <div className="card animate-in">
                <ProgressRing percentage={dailyPercentage} label="Today's Progress" />
                <div className={`completion-status ${dayStatus}`}>
                    {dayStatus === 'success' && '✅ All habits completed!'}
                    {dayStatus === 'failed' && '❌ Too many missed habits'}
                    {dayStatus === 'in-progress' && `⏳ ${dailyCompleted}/${dailyTotal} completed`}
                    {dayStatus === 'future' && '🔮 Coming soon'}
                </div>
            </div>

            {/* Today's Focus */}
            <div className="focus-card animate-in">
                <div className="focus-title">✨ Today's Focus</div>
                <input
                    className="focus-input"
                    type="text"
                    placeholder="What's your main focus today?"
                    value={focusText}
                    onChange={(e) => saveFocus(e.target.value)}
                    disabled={isFutureDay}
                />
            </div>

            {/* Daily Habits */}
            <div className="habits-section">
                <div className="habits-section-title">Daily Habits ({dailyCompleted}/{dailyTotal})</div>
                {DAILY_HABITS.map(habit => (
                    <HabitItem
                        key={habit.id}
                        habit={habit}
                        checked={!!dayData.habits[habit.id]}
                        onToggle={toggleDailyHabit}
                        disabled={isFutureDay}
                    />
                ))}
            </div>

            <div className="section-divider" />

            {/* Weekly Habits */}
            <div className="habits-section">
                <div className="habits-section-title">Weekly Habits (Week {weekNumber})</div>
                {WEEKLY_HABITS.map(habit => (
                    <HabitItem
                        key={habit.id}
                        habit={habit}
                        checked={!!weeklyData[habit.id]}
                        onToggle={toggleWeeklyHabit}
                        isWeekly={true}
                        disabled={isFutureDay}
                    />
                ))}
            </div>

            <div className="section-divider" />

            {/* Notes */}
            <div className="card animate-in">
                <div className="card-title">
                    <span className="emoji">📝</span> Daily Notes
                </div>
                <textarea
                    className="notes-textarea"
                    placeholder="Write your thoughts, reflections, or anything on your mind..."
                    value={notes}
                    onChange={(e) => saveNotes(e.target.value)}
                    disabled={isFutureDay}
                />
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{streak}</div>
                    <div className="stat-label">🔥 Streak</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{Math.min(currentDayNumber, TOTAL_DAYS)}</div>
                    <div className="stat-label">📅 Current Day</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{state.totalRestarts}</div>
                    <div className="stat-label">🔄 Restarts</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{Math.round(overallProgress)}%</div>
                    <div className="stat-label">📈 Progress</div>
                </div>
            </div>

            {/* End of Day Evaluate Button (for past/today) */}
            {(isToday || isPastDay) && !dayData.completed && dailyCompleted < dailyTotal && (
                <button
                    className="btn btn-secondary btn-full"
                    onClick={handleEndOfDay}
                    style={{ marginBottom: 16 }}
                >
                    🔍 Evaluate Day
                </button>
            )}

            {/* Save Indicator */}
            {showSaveIndicator && (
                <div className="save-indicator">✓ Saved automatically</div>
            )}

            {/* Reset Modal */}
            <Modal
                show={showResetModal}
                emoji="💔"
                title="Challenge Reset"
                message={`You missed ${missedCount} habits today. The 75 Hard rule requires completing at least ${DAILY_HABITS.length - MAX_MISSED_DAILY} daily habits. Your challenge will restart from Day 1.`}
                buttons={[
                    { label: '🔄 Restart Challenge', onClick: handleReset, variant: 'btn-danger' },
                    { label: 'Keep Going', onClick: () => setShowResetModal(false), variant: 'btn-secondary' },
                ]}
                onClose={() => setShowResetModal(false)}
            />

            {/* Success Modal */}
            <Modal
                show={showSuccessModal}
                emoji="🎉"
                title="Amazing Job!"
                message="You completed all your habits today! Keep this momentum going — you're unstoppable! ✨"
                buttons={[
                    { label: '🌟 Keep Going!', onClick: () => setShowSuccessModal(false) },
                ]}
                onClose={() => setShowSuccessModal(false)}
            />
        </div>
    );
};

export default Dashboard;
