import React from 'react';

const Modal = ({ show, emoji, title, message, buttons = [], onClose }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-emoji">{emoji}</div>
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {buttons.map((btn, index) => (
                        <button
                            key={index}
                            className={`btn ${btn.variant || 'btn-primary'} btn-full`}
                            onClick={btn.onClick}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Modal;
