// Storage utility — LocalStorage based persistence with auto-save

const STORAGE_KEY = '75hard_challenge_data';

const getDefaultState = () => ({
    challengeStartDate: null,
    currentDay: 1,
    totalRestarts: 0,
    longestStreak: 0,
    currentStreak: 0,
    days: {},
    weeklyHabits: {},
    notes: {},
    weeklyReflections: {},
    isActive: false,
    completedChallenge: false,
});

export const loadState = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return getDefaultState();
        return JSON.parse(data);
    } catch {
        return getDefaultState();
    }
};

export const saveState = (state) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
};

export const resetChallenge = (state) => {
    const newState = {
        ...getDefaultState(),
        totalRestarts: state.totalRestarts + 1,
        longestStreak: Math.max(state.longestStreak, state.currentStreak),
        isActive: true,
        challengeStartDate: new Date().toISOString().split('T')[0],
    };
    saveState(newState);
    return newState;
};

export const startChallenge = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const state = {
        ...getDefaultState(),
        challengeStartDate: tomorrow.toISOString().split('T')[0],
        isActive: true,
    };
    saveState(state);
    return state;
};

export const getDateForDay = (startDate, dayNumber) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return date;
};

export const getCurrentDayNumber = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
};

export const getWeekNumber = (startDate, currentDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);
    const diff = Math.floor((current - start) / (1000 * 60 * 60 * 24));
    return Math.floor(diff / 7) + 1;
};

export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatDateShort = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

export const getDayKey = (dayNumber) => `day_${dayNumber}`;
export const getWeekKey = (weekNumber) => `week_${weekNumber}`;
