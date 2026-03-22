import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import ProgressRing from './ProgressRing';
import { DAILY_HABITS, TOTAL_DAYS } from '../utils/constants';
import { getCurrentDayNumber, getDayKey } from '../utils/storage';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const FullReport = ({ state }) => {
    const currentDay = getCurrentDayNumber(state.challengeStartDate);
    const daysElapsed = Math.min(currentDay - 1, TOTAL_DAYS);

    const analysis = useMemo(() => {
        let totalCompleted = 0;
        let totalPossible = 0;
        let perfectDays = 0;
        let longestStreak = 0;
        let currentStreak = 0;
        const habitStats = {};

        DAILY_HABITS.forEach(h => {
            habitStats[h.id] = { label: h.label, emoji: h.emoji, completed: 0, total: 0 };
        });

        for (let d = 1; d <= daysElapsed; d++) {
            const dk = getDayKey(d);
            const dd = state.days[dk] || { habits: {} };
            let dayCompleted = 0;

            DAILY_HABITS.forEach(h => {
                habitStats[h.id].total++;
                if (dd.habits[h.id]) {
                    habitStats[h.id].completed++;
                    dayCompleted++;
                }
            });

            totalCompleted += dayCompleted;
            totalPossible += DAILY_HABITS.length;

            if (dayCompleted === DAILY_HABITS.length) {
                perfectDays++;
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }

        // Sort habits by struggle (lowest completion rate)
        const sortedHabits = Object.values(habitStats).sort((a, b) => {
            const rateA = a.total > 0 ? a.completed / a.total : 0;
            const rateB = b.total > 0 ? b.completed / b.total : 0;
            return rateA - rateB;
        });

        const overallRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        const isCompleted = daysElapsed >= TOTAL_DAYS && perfectDays >= TOTAL_DAYS;

        return {
            daysElapsed,
            perfectDays,
            longestStreak,
            currentStreak,
            totalRestarts: state.totalRestarts,
            overallRate,
            sortedHabits,
            isCompleted,
            totalCompleted,
            totalPossible,
        };
    }, [state, daysElapsed]);

    // Daily completion trend
    const trendData = useMemo(() => {
        const labels = [];
        const data = [];
        for (let d = 1; d <= daysElapsed; d++) {
            const dk = getDayKey(d);
            const dd = state.days[dk] || { habits: {} };
            const completed = DAILY_HABITS.filter(h => dd.habits[h.id]).length;
            const pct = Math.round((completed / DAILY_HABITS.length) * 100);
            labels.push(`D${d}`);
            data.push(pct);
        }
        return { labels, data };
    }, [state.days, daysElapsed]);

    const chartData = {
        labels: trendData.labels,
        datasets: [
            {
                label: 'Daily Completion %',
                data: trendData.data,
                borderColor: '#f48ba8',
                backgroundColor: 'rgba(244, 139, 168, 0.08)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: trendData.data.map(v => v === 100 ? '#86d4a8' : v < 85 ? '#f49494' : '#f48ba8'),
                pointBorderColor: '#fff',
                pointBorderWidth: 1.5,
                pointRadius: daysElapsed > 30 ? 2 : 4,
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#504a46',
                bodyColor: '#6e6660',
                borderColor: 'rgba(244, 139, 168, 0.2)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 10,
                titleFont: { family: 'Outfit', weight: '600' },
                bodyFont: { family: 'Outfit' },
                callbacks: {
                    label: (ctx) => `${ctx.parsed.y}% completed`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { family: 'Outfit', size: 10 },
                    maxRotation: 0,
                    callback: function (val, index) {
                        if (daysElapsed <= 15) return this.getLabelForValue(val);
                        if (daysElapsed <= 30) return index % 2 === 0 ? this.getLabelForValue(val) : '';
                        return index % 5 === 0 ? this.getLabelForValue(val) : '';
                    },
                },
            },
            y: {
                grid: { color: 'rgba(244, 139, 168, 0.05)' },
                ticks: { font: { family: 'Outfit', size: 10 }, callback: v => `${v}%` },
                min: 0,
                max: 100,
            },
        },
    };

    return (
        <div className="report-section">
            {/* Overall Progress */}
            <div className="card">
                <ProgressRing percentage={analysis.overallRate} label="Overall Score" />
                <div className={`completion-status ${analysis.isCompleted ? 'success' : analysis.overallRate > 50 ? 'in-progress' : 'danger'}`}>
                    {analysis.isCompleted ? '🏆 Challenge Completed!' :
                        daysElapsed >= TOTAL_DAYS ? '❌ Challenge Not Completed' :
                            `📊 ${analysis.daysElapsed} of ${TOTAL_DAYS} days tracked`}
                </div>
            </div>

            {/* Key Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{analysis.daysElapsed}</div>
                    <div className="stat-label">📅 Days Done</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{analysis.perfectDays}</div>
                    <div className="stat-label">✨ Perfect Days</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{analysis.longestStreak}</div>
                    <div className="stat-label">🔥 Best Streak</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{analysis.totalRestarts}</div>
                    <div className="stat-label">🔄 Restarts</div>
                </div>
            </div>

            {/* Trend Chart */}
            {trendData.data.length > 0 && (
                <div className="card">
                    <div className="card-title"><span className="emoji">📈</span> Completion Trend</div>
                    <div className="chart-wrapper" style={{ height: 220 }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
            )}

            {/* Habit Performance */}
            <div className="card">
                <div className="card-title"><span className="emoji">🎯</span> Habit Performance</div>
                <p style={{ fontSize: '0.75rem', color: '#b0a89e', marginBottom: 14 }}>
                    Sorted by struggle level — work on habits at the top!
                </p>
                {analysis.sortedHabits.map(habit => {
                    const rate = habit.total > 0 ? Math.round((habit.completed / habit.total) * 100) : 0;
                    return (
                        <div key={habit.label} className="habit-bar">
                            <span className="habit-bar-label">{habit.emoji} {habit.label}</span>
                            <div className="habit-bar-track">
                                <div
                                    className="habit-bar-fill"
                                    style={{
                                        width: `${rate}%`,
                                        background: rate < 50
                                            ? 'linear-gradient(135deg, #f49494, #f4b494)'
                                            : rate < 80
                                                ? 'linear-gradient(135deg, #f0c878, #f0d898)'
                                                : 'linear-gradient(135deg, #86d4a8, #a8e4c0)',
                                    }}
                                />
                            </div>
                            <span className="habit-bar-value" style={{
                                color: rate < 50 ? '#c06060' : rate < 80 ? '#a08020' : '#4a9a6a',
                            }}>{rate}%</span>
                        </div>
                    );
                })}
            </div>

            {/* Final Summary */}
            <div className="card" style={{ textAlign: 'center', padding: 28 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>
                    {analysis.isCompleted ? '🏆' : analysis.overallRate >= 75 ? '💪' : analysis.overallRate >= 50 ? '🌱' : '🌸'}
                </div>
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: 'var(--warm-gray-700)',
                    marginBottom: 8,
                }}>
                    {analysis.isCompleted ? 'You Crushed It!' :
                        analysis.overallRate >= 75 ? 'Almost There!' :
                            analysis.overallRate >= 50 ? 'Making Progress!' :
                                'Every Step Counts 💕'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray-400)', lineHeight: 1.7 }}>
                    {analysis.isCompleted
                        ? `You completed all ${TOTAL_DAYS} days of the challenge! You are proof that discipline and consistency lead to incredible results. Be proud of yourself! 🎉`
                        : `You've completed ${analysis.perfectDays} perfect days out of ${analysis.daysElapsed}. ${analysis.totalRestarts > 0 ? `Even with ${analysis.totalRestarts} restart${analysis.totalRestarts > 1 ? 's' : ''}, ` : ''}you're still here and that's what matters. Keep going! ✨`}
                </p>
            </div>
        </div>
    );
};

export default FullReport;
