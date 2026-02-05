import React from 'react';

/**
 * Modern Tooltip Component
 * Displays a styled tooltip on hover
 */
const Tooltip = ({ children, text, position = 'top' }) => {
    if (!text) return children;

    return (
        <div className="tooltip-container">
            {children}
            <div className={`tooltip-content tooltip-${position}`}>
                {text}
            </div>
        </div>
    );
};

export default Tooltip;
