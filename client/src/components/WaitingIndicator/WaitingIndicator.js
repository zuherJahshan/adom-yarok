import React from 'react';
import './WaitingIndicator.css';

function WaitingIndicator({ children }) {
    return (
        <div className='waiting-indicator-container'>
            {children}
            <div className="waiting-indicator">
                <div className="waiting-bullet"></div>
                <div className="waiting-bullet"></div>
                <div className="waiting-bullet"></div>
            </div>
        </div>
    );
}

export default WaitingIndicator;
