import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { DAILY_HABITS, TOTAL_DAYS } from '../utils/constants';
import { getCurrentDayNumber, getDayKey, getWeekNumber, formatDateShort, getDateForDay } from '../utils/storage';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const WeeklyReport = ({ state }) => {
    const currentDay = getCurrentDayNumber(state.challengeStartDate);
    const currentWeek = getWeekNumber(state.challengeStartDate, new Date());

    const weeklyData = useMemo(() => {
        const weeks = [];
        for (let w = 1; w <= Math.min(currentWeek, Math.ceil(TOTAL_DAYS / 7)); w++) {
            const startDay = (w - 1) * 7 + 1;
            const endDay = Math.min(w * 7, currentDay);
            let successDays = 0;
            let failedDays = 0;
            let totalCompleted = 0;
            let totalPossible = 0;

            for (let d = startDay; d <= endDay; d++) {
                const dk = getDayKey(d);
                const dd = state.days[dk] || { habits: {} };
                const completed = DAILY_HABITS.filter(h => dd.habits[h.id]).length;
                totalCompleted += completed;
                totalPossible += DAILY_HABITS.length;
                if (completed === DAILY_HABITS.length) {
                    successDays++;
                } else if (d < currentDay) {
                    failedDays++;
                }
            }

            weeks.push({
                week: w,
                successDays,
                failedDays,
                consistency: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
            });
        }
        return weeks;
    }, [state.days, currentDay, currentWeek, state.challengeStartDate]);

    // Weekly Reflection
    const [reflection, setReflection] = React.useState({
        wentWell: state.weeklyReflections?.[`week_${currentWeek}`]?.wentWell || '',
        didntWork: state.weeklyReflections?.[`week_${currentWeek}`]?.didntWork || '',
    });

    const saveReflection = (field, value) => {
        const updated = { ...reflection, [field]: value };
        setReflection(updated);
        const newState = {
            ...state,
            weeklyReflections: {
                ...state.weeklyReflections,
                [`week_${currentWeek}`]: updated,
            },
        };
        import('../utils/storage').then(mod => mod.saveState(newState));
    };

    const chartData = {
        labels: weeklyData.map(w => `Week ${w.week}`),
        datasets: [
            {
                label: 'Successful Days',
                data: weeklyData.map(w => w.successDays),
                backgroundColor: 'rgba(134, 212, 168, 0.6)',
                borderColor: '#86d4a8',
                borderWidth: 2,
                borderRadius: 8,
            },
            {
                label: 'Failed Days',
                data: weeklyData.map(w => w.failedDays),
                backgroundColor: 'rgba(244, 148, 148, 0.6)',
                borderColor: '#f49494',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const consistencyData = {
        labels: weeklyData.map(w => `W${w.week}`),
        datasets: [
            {
                label: 'Consistency %',
                data: weeklyData.map(w => w.consistency),
                borderColor: '#f48ba8',
                backgroundColor: 'rgba(244, 139, 168, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#f48ba8',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { family: 'Outfit', size: 11 },
                    padding: 14,
                    usePointStyle: true,
                    pointStyleWidth: 10,
                },
            },
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
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { family: 'Outfit', size: 11 } },
            },
            y: {
                grid: { color: 'rgba(244, 139, 168, 0.08)' },
                ticks: { font: { family: 'Outfit', size: 11 } },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="report-section">
            <div className="card">
                <div className="card-title"><span className="emoji">📊</span> Weekly Performance</div>
                <div className="chart-wrapper">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>

            <div className="card">
                <div className="card-title"><span className="emoji">📈</span> Consistency Trend</div>
                <div className="chart-wrapper">
                    <Line data={consistencyData} options={{
                        ...chartOptions,
                        scales: {
                            ...chartOptions.scales,
                            y: { ...chartOptions.scales.y, max: 100, ticks: { ...chartOptions.scales.y.ticks, callback: v => `${v}%` } },
                        },
                    }} />
                </div>
            </div>

            {/* Weekly Stats */}
            <div className="stats-grid">
                {weeklyData.length > 0 && (
                    <>
                        <div className="stat-card">
                            <div className="stat-value">{weeklyData[weeklyData.length - 1]?.successDays || 0}</div>
                            <div className="stat-label">✅ This Week</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{weeklyData[weeklyData.length - 1]?.consistency || 0}%</div>
                            <div className="stat-label">📊 Consistency</div>
                        </div>
                    </>
                )}
            </div>

            {/* Weekly Reflection */}
            <div className="card">
                <div className="card-title"><span className="emoji">💭</span> Week {currentWeek} Reflection</div>

                <div className="reflection-card">
                    <div className="reflection-label">🌟 What went well this week?</div>
                    <textarea
                        className="notes-textarea"
                        placeholder="Celebrate your wins..."
                        value={reflection.wentWell}
                        onChange={(e) => saveReflection('wentWell', e.target.value)}
                    />
                </div>

                <div className="reflection-card">
                    <div className="reflection-label">💡 What could be better?</div>
                    <textarea
                        className="notes-textarea"
                        placeholder="Areas for improvement..."
                        value={reflection.didntWork}
                        onChange={(e) => saveReflection('didntWork', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default WeeklyReport;
