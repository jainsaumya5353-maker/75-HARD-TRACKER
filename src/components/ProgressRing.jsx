import React from 'react';

const ProgressRing = ({ percentage, size = 160, strokeWidth = 8, label = 'Complete' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="progress-ring-container">
            <div className="progress-ring" style={{ width: size, height: size }}>
                <svg viewBox={`0 0 ${size} ${size}`}>
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f48ba8" />
                            <stop offset="50%" stopColor="#c9a8f8" />
                            <stop offset="100%" stopColor="#94c8f4" />
                        </linearGradient>
                    </defs>
                    <circle
                        className="progress-ring-bg"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                    />
                    <circle
                        className="progress-ring-fill"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className="progress-ring-text">
                    <div className="progress-ring-percent">{Math.round(percentage)}%</div>
                    <div className="progress-ring-label">{label}</div>
                </div>
            </div>
        </div>
    );
};

export default ProgressRing;
