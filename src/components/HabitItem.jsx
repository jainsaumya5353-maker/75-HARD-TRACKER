import React from 'react';
import { CATEGORY_COLORS } from '../utils/constants';

const HabitItem = ({ habit, checked, onToggle, isWeekly = false, disabled = false }) => {
    return (
        <div
            className={`habit-item animate-in ${checked ? 'checked' : ''}`}
            onClick={() => !disabled && onToggle(habit.id)}
            role="checkbox"
            aria-checked={checked}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    !disabled && onToggle(habit.id);
                }
            }}
            style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'default' : 'pointer' }}
        >
            <div className="habit-checkbox">
                <span className="check-icon">✓</span>
            </div>
            <span className="habit-emoji">{habit.emoji}</span>
            <span className="habit-label">{habit.label}</span>
            {isWeekly && <span className="weekly-badge">Weekly</span>}
            <div
                className="habit-category-dot"
                style={{ backgroundColor: CATEGORY_COLORS[habit.category] || '#f48ba8' }}
            />
        </div>
    );
};

export default HabitItem;
