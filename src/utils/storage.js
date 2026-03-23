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
    completedChallenge: false,
});

let currentUserId = null;

export const setUserId = (id) => {
    currentUserId = id;
};

export const loadState = async (userId = null) => {
    try {
        if (userId) {
            const { db } = await import('./firebase');
            const { doc, getDoc } = await import('firebase/firestore');
            const docSnap = await getDoc(doc(db, 'users', userId));
            if (docSnap.exists() && docSnap.data().state) {
                const firebaseState = docSnap.data().state;
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(firebaseState));
                } catch (e) { }
                return firebaseState;
            }
        }

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

        if (currentUserId) {
            import('./firebase').then(({ db }) => {
                import('firebase/firestore').then(({ doc, setDoc }) => {
                    setDoc(doc(db, 'users', currentUserId), { state, lastUpdated: new Date() }, { merge: true })
                        .catch(e => console.error("Firebase sync failed:", e));
                });
            });
        }
    } catch (e) {
        console.error('Failed to save state:', e);
    }
};

// Offset current time by 2 hours so days rollover at 2 AM
export const getLogicalDate = () => {
    const d = new Date();
    d.setHours(d.getHours() - 2);
    return d;
};

export const resetChallenge = (state, userId = null) => {
    const newState = {
        ...getDefaultState(),
        totalRestarts: state.totalRestarts + 1,
        longestStreak: Math.max(state.longestStreak, state.currentStreak),
        isActive: true,
        challengeStartDate: getLogicalDate().toISOString().split('T')[0],
    };
    saveState(newState);
    return newState;
};

export const startChallenge = () => {
    const tomorrow = getLogicalDate();
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
    const today = getLogicalDate();
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
